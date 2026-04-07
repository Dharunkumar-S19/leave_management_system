const db = require('../config/db');

/**
 * Utility: Calculate days count excluding weekends (Sat/Sun)
 */
const calculateDaysCount = (from, to) => {
  let count = 0;
  let cur = new Date(from);
  const end = new Date(to);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++; // 0 is Sun, 6 is Sat
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

/**
 * Controller: Apply for a new leave
 */
const applyLeave = async (req, res) => {
  const { leave_type, from_date, to_date, reason } = req.body;
  const applicant = req.user; 
  
  // File handling
  const file = req.file;
  const attachment_url = file ? `/uploads/${file.filename}` : null;

  try {
    // 1. Basic Validations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(from_date);
    const end = new Date(to_date);

    if (start < today) {
      return res.status(400).json({ success: false, message: 'Cannot apply for leave in the past.' });
    }

    if (start > end) {
      return res.status(400).json({ success: false, message: 'From date cannot be after To date.' });
    }

    const daysCount = calculateDaysCount(from_date, to_date);
    if (daysCount === 0) {
      return res.status(400).json({ success: false, message: 'Selected range contains only weekends.' });
    }

    // 1.5 Overlap Validation
    const [overlapRows] = await db.execute(`
      SELECT id FROM leave_requests 
      WHERE applicant_id = ? 
        AND overall_status IN ('pending', 'approved')
        AND (from_date <= ? AND to_date >= ?)
    `, [applicant.id, to_date, from_date]);

    if (overlapRows.length > 0) {
      return res.status(400).json({ success: false, message: 'You already have a pending or approved leave during these dates.' });
    }

    // 2. Check Leave Balance
    const academicYear = '2023-24'; // Hardcoded for now
    const [balanceRows] = await db.execute(
      'SELECT * FROM leave_balances WHERE user_id = ? AND academic_year = ?',
      [applicant.id, academicYear]
    );

    if (balanceRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Leave balance record not found.' });
    }

    const balance = balanceRows[0];
    if (leave_type === 'CL' && (balance.cl_used + daysCount) > balance.cl_total) {
      return res.status(400).json({ success: false, message: 'Insufficient Casual Leave balance.' });
    }
    if (leave_type === 'ML' && (balance.ml_used + daysCount) > balance.ml_total) {
      return res.status(400).json({ success: false, message: 'Insufficient Medical Leave balance.' });
    }

    // 3. Determine Reviewers
    let level1_reviewer = null;
    let level2_reviewer = null;

    if (applicant.role === 'student') {
      // Level 1: Any Staff in same Dept
      const [staffs] = await db.execute('SELECT id FROM users WHERE role = "staff" AND department_id = ? LIMIT 1', [applicant.department_id]);
      // Level 2: HOD of same Dept
      const [hods] = await db.execute('SELECT id FROM users WHERE role = "hod" AND department_id = ? LIMIT 1', [applicant.department_id]);
      
      level1_reviewer = staffs[0]?.id || null;
      level2_reviewer = hods[0]?.id || null;
    } 
    else if (applicant.role === 'staff') {
      // Level 1: HOD of same Dept - Final Approval
      const [hods] = await db.execute('SELECT id FROM users WHERE role = "hod" AND department_id = ? LIMIT 1', [applicant.department_id]);
      level1_reviewer = hods[0]?.id || null;
      level2_reviewer = null; // level2_status set to 'na' by trigger
    } 
    else if (applicant.role === 'hod') {
      // Level 1: Principal
      const [principals] = await db.execute('SELECT id FROM users WHERE role = "principal" LIMIT 1');
      level1_reviewer = principals[0]?.id || null;
      level2_reviewer = null; // level2_status set to 'na' by trigger
    }
    else if (applicant.role === 'principal') {
      // Level 1: Admin reviews principal's leaves
      const [admins] = await db.execute('SELECT id FROM users WHERE role = "admin" LIMIT 1');
      level1_reviewer = admins[0]?.id || null;
      level2_reviewer = null; // level2_status 'na' by trigger
    }

    // 4. Insert Leave Request
    const [result] = await db.execute(`
      INSERT INTO leave_requests 
      (applicant_id, applicant_role, leave_type, from_date, to_date, days_count, reason, attachment_url, level1_reviewer_id, level2_reviewer_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [applicant.id, applicant.role, leave_type, from_date, to_date, daysCount, reason, attachment_url, level1_reviewer, level2_reviewer]);

    const leaveId = result.insertId;

    // 5. Create Notification for Level 1 Reviewer
    if (level1_reviewer) {
      await db.execute(
        'INSERT INTO notifications (user_id, leave_id, message) VALUES (?, ?, ?)',
        [level1_reviewer, leaveId, `New leave request from ${applicant.name} (${applicant.role})`]
      );
    }

    res.status(201).json({
      success: true,
      message: applicant.role === 'principal' ? 'Leave auto-approved.' : 'Leave request submitted successfully.',
      leave_id: leaveId
    });

  } catch (err) {
    console.error('Apply Leave Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error while applying for leave.' });
  }
};

/**
 * Controller: Get leaves applied by current user
 */
const getMyLeaves = async (req, res) => {
  const { status } = req.query;
  const userId = req.user.id;

  try {
    let query = 'SELECT * FROM leave_requests WHERE applicant_id = ?';
    const params = [userId];

    if (status) {
      query += ' AND overall_status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await db.execute(query, params);
    res.json({ success: true, leaves: rows });
  } catch (err) {
    console.error('Get My Leaves Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching leaves.' });
  }
};

/**
 * Controller: Get current leave balance
 */
const getLeaveBalance = async (req, res) => {
  const userId = req.user.id;
  const academicYear = '2023-24';

  try {
    const [rows] = await db.execute(
      'SELECT *, (cl_total - cl_used) AS cl_remaining, (ml_total - ml_used) AS ml_remaining FROM leave_balances WHERE user_id = ? AND academic_year = ?',
      [userId, academicYear]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Balance record not found.' });
    }

    res.json({ success: true, balance: rows[0] });
  } catch (err) {
    console.error('Get Balance Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching balance.' });
  }
};

/**
 * Controller: Cancel a pending leave request
 */
const cancelLeave = async (req, res) => {
  const leaveId = req.params.id;
  const userId = req.user.id;

  try {
    // Check if leave exists and belongs to user and is pending
    const [rows] = await db.execute(
      'SELECT * FROM leave_requests WHERE id = ? AND applicant_id = ?',
      [leaveId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    const leave = rows[0];
    if (leave.overall_status !== 'pending' || leave.level1_status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending requests at the first level can be cancelled.' });
    }

    // Delete the request (Triggers could handle balance restoration if it was already deducted, 
    // but in our logic balance is only deducted when moving from pending to approved).
    await db.execute('DELETE FROM leave_requests WHERE id = ?', [leaveId]);

    res.json({ success: true, message: 'Leave request cancelled successfully.' });
  } catch (err) {
    console.error('Cancel Leave Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error cancelling leave.' });
  }
};

/**
 * Controller: Universal Approve Leave (for HOD and Principal)
 */
const approveLeave = async (req, res) => {
  const leaveId = req.params.id;
  const reviewerId = req.user.id;
  const reviewerRole = req.user.role;
  const { remarks } = req.body;

  try {
    const [leaveRows] = await db.execute('SELECT * FROM leave_requests WHERE id = ?', [leaveId]);
    if (leaveRows.length === 0) return res.status(404).json({ success: false, message: 'Leave not found' });
    const leave = leaveRows[0];

    // Identify if the user is acting as Level 1 or Level 2 reviewer
    let isLevel1 = leave.level1_reviewer_id === reviewerId;
    let isLevel2 = leave.level2_reviewer_id === reviewerId;

    if (!isLevel1 && !isLevel2) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this leave' });
    }

    if (isLevel2) {
      // It's a final approval (e.g. HOD approving Student, Principal approving Staff)
      await db.execute(
        'UPDATE leave_requests SET level2_status = "approved", level2_remarks = ?, level2_acted_at = NOW() WHERE id = ?',
        [remarks || null, leaveId]
      );
      // Trigger sets overall_status = 'approved' and deducts balance.
      // Notify Applicant
      await db.execute('INSERT INTO notifications (user_id, leave_id, message) VALUES (?, ?, ?)',
        [leave.applicant_id, leaveId, `Your leave request has been approved by ${reviewerRole.toUpperCase()}.`]
      );
      // Log it
      await db.execute('INSERT INTO leave_audit_log (leave_id, actor_id, actor_role, action, remarks) VALUES (?, ?, ?, ?, ?)',
        [leaveId, reviewerId, reviewerRole, 'Approved (Final)', remarks || null]
      );
    } else if (isLevel1) {
      // HOD reviewing Staff, or Principal reviewing HOD
      if (leave.applicant_role === 'staff' && reviewerRole === 'hod') {
        // HOD forwards staff to Principal
        await db.execute(
          'UPDATE leave_requests SET level1_status = "forwarded", level1_remarks = ?, level1_acted_at = NOW() WHERE id = ?',
          [remarks || null, leaveId]
        );
        if (leave.level2_reviewer_id) {
          await db.execute('INSERT INTO notifications (user_id, leave_id, message) VALUES (?, ?, ?)',
            [leave.level2_reviewer_id, leaveId, `Staff leave request forwarded by HOD for your review.`]
          );
        }
        await db.execute('INSERT INTO leave_audit_log (leave_id, actor_id, actor_role, action, remarks) VALUES (?, ?, ?, ?, ?)',
          [leaveId, reviewerId, reviewerRole, 'Forwarded to Principal', remarks || null]
        );
      } else if (leave.applicant_role === 'staff' && reviewerRole === 'hod') {
        // HOD approves Staff (Single-level hierarchy) - Final Approval
        await db.execute(
          'UPDATE leave_requests SET level1_status = "forwarded", level1_remarks = ?, level1_acted_at = NOW() WHERE id = ?',
          [remarks || null, leaveId]
        );
        // Notification for Applicant (already done in trig, but manual for clarity/certainty)
        await db.execute('INSERT INTO notifications (user_id, leave_id, message) VALUES (?, ?, ?)',
          [leave.applicant_id, leaveId, `Your leave request has been approved by HOD.`]
        );
        await db.execute('INSERT INTO leave_audit_log (leave_id, actor_id, actor_role, action, remarks) VALUES (?, ?, ?, ?, ?)',
          [leaveId, reviewerId, reviewerRole, 'Approved (Final)', remarks || null]
        );
      } else {
        // e.g. Principal reviewing HOD (which is technically level 1, but level 2 is 'na')
        await db.execute(
          'UPDATE leave_requests SET level1_status = "forwarded", level1_remarks = ?, level1_acted_at = NOW() WHERE id = ?',
          [remarks || null, leaveId]
        );
        // Trigger for level2='na' + level1='forwarded' -> overall='approved' handled automatically.
        await db.execute('INSERT INTO notifications (user_id, leave_id, message) VALUES (?, ?, ?)',
          [leave.applicant_id, leaveId, `Your leave request has been approved.`]
        );
        await db.execute('INSERT INTO leave_audit_log (leave_id, actor_id, actor_role, action, remarks) VALUES (?, ?, ?, ?, ?)',
          [leaveId, reviewerId, reviewerRole, 'Approved (Final)', remarks || null]
        );
      }
    }

    res.json({ success: true, message: 'Leave processed successfully' });
  } catch (err) {
    console.error('Approve Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error processing approval' });
  }
};

/**
 * Controller: Universal Reject Leave (for HOD and Principal)
 */
const rejectLeave = async (req, res) => {
  const leaveId = req.params.id;
  const reviewerId = req.user.id;
  const reviewerRole = req.user.role;
  const { remarks } = req.body;

  try {
    const [leaveRows] = await db.execute('SELECT * FROM leave_requests WHERE id = ?', [leaveId]);
    if (leaveRows.length === 0) return res.status(404).json({ success: false, message: 'Leave not found' });
    const leave = leaveRows[0];

    let isLevel1 = leave.level1_reviewer_id === reviewerId;
    let isLevel2 = leave.level2_reviewer_id === reviewerId;

    if (!isLevel1 && !isLevel2) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this leave' });
    }

    if (isLevel2) {
      await db.execute(
        'UPDATE leave_requests SET level2_status = "rejected", level2_remarks = ?, level2_acted_at = NOW() WHERE id = ?',
        [remarks || null, leaveId]
      );
    } else if (isLevel1) {
      await db.execute(
        'UPDATE leave_requests SET level1_status = "rejected", level1_remarks = ?, level1_acted_at = NOW() WHERE id = ?',
        [remarks || null, leaveId]
      );
    }

    // Trigger catches and sets overall_status = 'rejected'
    await db.execute('INSERT INTO notifications (user_id, leave_id, message) VALUES (?, ?, ?)',
      [leave.applicant_id, leaveId, `Your leave request was rejected by ${reviewerRole.toUpperCase()}.`]
    );
    await db.execute('INSERT INTO leave_audit_log (leave_id, actor_id, actor_role, action, remarks) VALUES (?, ?, ?, ?, ?)',
      [leaveId, reviewerId, reviewerRole, 'Rejected', remarks || null]
    );

    res.json({ success: true, message: 'Leave rejected successfully' });
  } catch (err) {
    console.error('Reject Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error processing rejection' });
  }
};

/**
 * Controller: Get full details and audit log for a single leave
 */
const getLeaveDetails = async (req, res) => {
  const leaveId = req.params.id;

  try {
    const [leaveRows] = await db.execute(`
      SELECT lr.*, u.name as applicant_name, u.role as applicant_role, u.department_id 
      FROM leave_requests lr
      JOIN users u ON lr.applicant_id = u.id
      WHERE lr.id = ?
    `, [leaveId]);

    if (leaveRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    const [auditRows] = await db.execute(`
      SELECT a.*, u.name as actor_name 
      FROM leave_audit_log a
      JOIN users u ON a.actor_id = u.id
      WHERE a.leave_id = ?
      ORDER BY a.created_at ASC
    `, [leaveId]);

    res.json({ success: true, leave: leaveRows[0], audit: auditRows });
  } catch (err) {
    console.error('Get Leave Details Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching leave details.' });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getLeaveBalance,
  cancelLeave,
  approveLeave,
  rejectLeave,
  getLeaveDetails
};
