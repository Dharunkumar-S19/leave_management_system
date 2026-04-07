const db = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * GET /api/admin/principal-requests
 * All pending leave requests submitted by principals
 */
const getPrincipalRequests = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        lr.*,
        u.name AS applicant_name,
        u.email AS applicant_email,
        d.name AS department_name
      FROM leave_requests lr
      JOIN users u ON lr.applicant_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE lr.applicant_role = 'principal'
      ORDER BY lr.created_at DESC
    `);
    res.json({ success: true, requests: rows });
  } catch (err) {
    console.error('getPrincipalRequests Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * POST /api/admin/approve/:id
 * Admin approves a principal's leave
 */
const approveLeave = async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;
  const admin = req.user;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM leave_requests WHERE id = ? AND applicant_role = "principal"',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Principal leave request not found.' });
    }

    const leave = rows[0];
    if (leave.level1_status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This request has already been actioned.' });
    }

    await db.execute(
      `UPDATE leave_requests 
       SET level1_status = 'forwarded', level1_remarks = ?, level1_acted_at = NOW()
       WHERE id = ?`,
      [remarks || null, id]
    );

    // Audit log
    await db.execute(
      `INSERT INTO leave_audit_log (leave_id, actor_id, actor_role, action, remarks) VALUES (?, ?, 'admin', 'approved', ?)`,
      [id, admin.id, remarks || null]
    );

    // Notify principal
    await db.execute(
      `INSERT INTO notifications (user_id, leave_id, message) VALUES (?, ?, ?)`,
      [leave.applicant_id, id, `Your leave request has been approved by Admin.`]
    );

    res.json({ success: true, message: 'Leave approved successfully.' });
  } catch (err) {
    console.error('Admin approveLeave Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * POST /api/admin/reject/:id
 * Admin rejects a principal's leave
 */
const rejectLeave = async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;
  const admin = req.user;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM leave_requests WHERE id = ? AND applicant_role = "principal"',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Principal leave request not found.' });
    }

    const leave = rows[0];
    if (leave.level1_status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This request has already been actioned.' });
    }

    await db.execute(
      `UPDATE leave_requests 
       SET level1_status = 'rejected', level1_remarks = ?, level1_acted_at = NOW()
       WHERE id = ?`,
      [remarks || null, id]
    );

    // Audit log
    await db.execute(
      `INSERT INTO leave_audit_log (leave_id, actor_id, actor_role, action, remarks) VALUES (?, ?, 'admin', 'rejected', ?)`,
      [id, admin.id, remarks || null]
    );

    // Notify principal
    await db.execute(
      `INSERT INTO notifications (user_id, leave_id, message) VALUES (?, ?, ?)`,
      [leave.applicant_id, id, `Your leave request has been rejected by Admin. ${remarks ? 'Reason: ' + remarks : ''}`]
    );

    res.json({ success: true, message: 'Leave rejected successfully.' });
  } catch (err) {
    console.error('Admin rejectLeave Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * GET /api/admin/users
 * Get all users in the system
 */
const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at,
        d.name AS department_name, u.class, u.roll_number
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      ORDER BY u.role, u.name
    `);
    res.json({ success: true, users: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * PUT /api/admin/users/:id/toggle
 * Activate or deactivate a user
 */
const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT id, is_active FROM users WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    const newStatus = rows[0].is_active ? 0 : 1;
    await db.execute('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);

    res.json({ success: true, message: `User ${newStatus ? 'activated' : 'deactivated'} successfully.`, is_active: newStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * GET /api/admin/all-leaves
 * Full system-wide leave report for admin
 */
const getAllLeaves = async (req, res) => {
  try {
    const { role, status, department_id, from, to } = req.query;
    let query = `
      SELECT 
        lr.*, 
        u.name AS applicant_name, u.role AS applicant_role_label, 
        d.name AS department_name
      FROM leave_requests lr
      JOIN users u ON lr.applicant_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE 1=1
    `;
    const params = [];
    if (role) { query += ' AND u.role = ?'; params.push(role); }
    if (status) { query += ' AND lr.overall_status = ?'; params.push(status); }
    if (department_id) { query += ' AND u.department_id = ?'; params.push(department_id); }
    if (from) { query += ' AND lr.from_date >= ?'; params.push(from); }
    if (to) { query += ' AND lr.to_date <= ?'; params.push(to); }
    query += ' ORDER BY lr.created_at DESC';

    const [rows] = await db.execute(query, params);
    res.json({ success: true, leaves: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * POST /api/admin/users
 * Create a new user
 */
const createUser = async (req, res) => {
  const { name, email, password, role, department_id, class: className, roll_number } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  try {
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password_hash, role, department_id, class, roll_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashed, role, department_id || null, className || null, roll_number || null]
    );

    const userId = result.insertId;

    // Initialize Leave Balances (Basic defaults based on role)
    const academicYear = '2023-24';
    let cl = 12, ml = 10;
    if (role === 'student') { cl = 10; ml = 5; }
    
    await db.execute(
      'INSERT INTO leave_balances (user_id, academic_year, role_type, cl_total, ml_total) VALUES (?, ?, ?, ?, ?)',
      [userId, academicYear, role, cl, ml]
    );

    res.status(201).json({ success: true, message: 'User created successfully.', userId });
  } catch (err) {
    console.error('createUser Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error creating user.' });
  }
};

/**
 * PUT /api/admin/users/:id
 * Update an existing user
 */
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, department_id, class: className, roll_number } = req.body;

  try {
    const [existing] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    await db.execute(
      'UPDATE users SET name = ?, email = ?, role = ?, department_id = ?, class = ?, roll_number = ? WHERE id = ?',
      [name, email, role, department_id || null, className || null, roll_number || null, id]
    );

    res.json({ success: true, message: 'User updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error updating user.' });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Permenantly remove a user (and their data via CASCADE or manual)
 */
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT role FROM users WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    if (rows[0].role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete admin root.' });

    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'User removed from system.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error deleting user.' });
  }
};

module.exports = {
  getPrincipalRequests,
  approveLeave,
  rejectLeave,
  getAllUsers,
  toggleUserStatus,
  getAllLeaves,
  createUser,
  updateUser,
  deleteUser,
};
