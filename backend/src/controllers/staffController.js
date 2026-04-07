const db = require('../config/db');

/**
 * Controller: Get pending reviews for the logged-in staff member
 */
const getPendingReviews = async (req, res) => {
  const staffId = req.user.id;

  try {
    const [rows] = await db.execute(`
      SELECT lr.*, u.name as student_name, u.roll_number, u.class
      FROM leave_requests lr
      JOIN users u ON lr.applicant_id = u.id
      WHERE lr.level1_reviewer_id = ? AND lr.level1_status = 'pending'
      ORDER BY lr.created_at ASC
    `, [staffId]);

    res.json({
      success: true,
      pendingRequests: rows
    });
  } catch (err) {
    console.error('Get Pending Reviews Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching pending reviews.' });
  }
};

/**
 * Controller: Forward student leave request to HOD
 */
const forwardStudentLeave = async (req, res) => {
  const leaveId = req.params.id;
  const staffId = req.user.id;
  const { remarks } = req.body;

  try {
    // 1. Verify that this leave is assigned to this staff and is pending
    const [leaveRows] = await db.execute(
      'SELECT * FROM leave_requests WHERE id = ? AND level1_reviewer_id = ? AND level1_status = "pending"',
      [leaveId, staffId]
    );

    if (leaveRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Leave request not found or already processed.' });
    }

    const leave = leaveRows[0];

    // 2. Update level1 status to forwarded
    await db.execute(
      'UPDATE leave_requests SET level1_status = "forwarded", level1_remarks = ?, level1_acted_at = NOW() WHERE id = ?',
      [remarks || null, leaveId]
    );

    // 3. Notify HOD (Level 2 Match)
    if (leave.level2_reviewer_id) {
      await db.execute(
        'INSERT INTO notifications (user_id, leave_id, message) VALUES (?, ?, ?)',
        [leave.level2_reviewer_id, leaveId, `Student leave request forwarded by staff for your review.`]
      );
    }

    // 4. Record in Audit Log
    await db.execute(
      'INSERT INTO leave_audit_log (leave_id, actor_id, actor_role, action, remarks) VALUES (?, ?, ?, ?, ?)',
      [leaveId, staffId, 'staff', 'Forwarded to HOD', remarks || null]
    );

    res.json({ success: true, message: 'Leave request forwarded to HOD successfully.' });
  } catch (err) {
    console.error('Forward Leave Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error forwarding leave request.' });
  }
};

/**
 * Controller: Reject student leave request
 */
const rejectStudentLeave = async (req, res) => {
  const leaveId = req.params.id;
  const staffId = req.user.id;
  const { remarks } = req.body;

  try {
    // 1. Verify leave
    const [leaveRows] = await db.execute(
      'SELECT * FROM leave_requests WHERE id = ? AND level1_reviewer_id = ? AND level1_status = "pending"',
      [leaveId, staffId]
    );

    if (leaveRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Leave request not found or already processed.' });
    }

    const leave = leaveRows[0];

    // 2. Update status to rejected
    // overall_status = 'rejected' will be handled natively by the BEFORE UPDATE trigger we defined,
    // but just to be explicit we update the level1_status. The trigger catches it.
    await db.execute(
      'UPDATE leave_requests SET level1_status = "rejected", level1_remarks = ?, level1_acted_at = NOW() WHERE id = ?',
      [remarks || null, leaveId]
    );

    // 3. Notify Student
    await db.execute(
      'INSERT INTO notifications (user_id, leave_id, message) VALUES (?, ?, ?)',
      [leave.applicant_id, leaveId, `Your leave request was rejected by your Class Teacher.`]
    );

    // 4. Record Audit Log
    await db.execute(
      'INSERT INTO leave_audit_log (leave_id, actor_id, actor_role, action, remarks) VALUES (?, ?, ?, ?, ?)',
      [leaveId, staffId, 'staff', 'Rejected', remarks || null]
    );

    res.json({ success: true, message: 'Leave request rejected.' });
  } catch (err) {
    console.error('Reject Leave Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error rejecting leave request.' });
  }
};

module.exports = {
  getPendingReviews,
  forwardStudentLeave,
  rejectStudentLeave
};
