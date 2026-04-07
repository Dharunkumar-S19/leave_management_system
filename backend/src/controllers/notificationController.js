const db = require('../config/db');

/**
 * Controller: Get top 20 latest notifications and unread count
 */
const getAllNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.execute(
      'SELECT id, leave_id, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [userId]
    );

    const [countRow] = await db.execute(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    res.json({
      success: true,
      notifications: rows,
      unread_count: countRow[0].unread_count
    });
  } catch (err) {
    console.error('Get Notifications Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching notifications.' });
  }
};

/**
 * Controller: Mark all unread notifications as read
 */
const markAllAsRead = async (req, res) => {
  const userId = req.user.id;

  try {
    await db.execute(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    res.json({ success: true, message: 'Notifications marked as read.' });
  } catch (err) {
    console.error('Mark Notifications Read Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error updating notifications.' });
  }
};

module.exports = {
  getAllNotifications,
  markAllAsRead
};
