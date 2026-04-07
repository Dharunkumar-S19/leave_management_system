const db = require('../config/db');

/**
 * Controller: Get notifications for logged-in student and mark as read
 */
const getNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Fetch current unread notifications
    const [rows] = await db.execute(
      'SELECT id, leave_id, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // 2. Mark all as read for this user
    await db.execute(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    res.json({
      success: true,
      notifications: rows
    });
  } catch (err) {
    console.error('Get Notifications Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching notifications.' });
  }
};

/**
 * Controller: Get upcoming approved leaves
 */
const getUpcomingLeaves = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.execute(`
      SELECT id, leave_type, from_date, to_date, days_count, overall_status 
      FROM leave_requests 
      WHERE applicant_id = ? AND overall_status = 'approved' AND from_date >= CURDATE()
      ORDER BY from_date ASC
    `, [userId]);

    res.json({
      success: true,
      leaves: rows
    });
  } catch (err) {
    console.error('Get Upcoming Leaves Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching upcoming leaves.' });
  }
};

module.exports = {
  getNotifications,
  getUpcomingLeaves
};
