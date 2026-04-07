const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Controller: User Login
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = rows[0];

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // 3. Create JWT Payload
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department_id: user.department_id
    };

    // 4. Sign JWT (7 days expiry)
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: payload
    });

  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

/**
 * Controller: Get logged-in user profile with leave balance
 */
const getMe = async (req, res) => {
  try {
    // 1. Get full user profile
    const [userRows] = await db.execute(`
      SELECT id, name, email, role, department_id, class, roll_number, phone, parent_phone, created_at 
      FROM users WHERE id = ?
    `, [req.user.id]);

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = userRows[0];

    // 2. Fetch leave balance (for the current year - assuming '2023-24' for now)
    const [balanceRows] = await db.execute(`
      SELECT cl_total, cl_used, ml_total, ml_used, od_used 
      FROM leave_balances 
      WHERE user_id = ? AND academic_year = '2023-24'
    `, [req.user.id]);

    res.json({
      success: true,
      user: {
        ...user,
        balance: balanceRows[0] || null
      }
    });

  } catch (err) {
    console.error('GetMe Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching user profile.' });
  }
};

module.exports = {
  login,
  getMe
};
