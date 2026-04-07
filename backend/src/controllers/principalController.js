const db = require('../config/db');

/**
 * Controller: Get staff leave requests waiting for Principal approval
 * (Level 1 forwarded by HOD, Level 2 pending)
 */
const getPendingStaffReviews = async (req, res) => {
  const principalId = req.user.id;

  try {
    const [rows] = await db.execute(`
      SELECT lr.*, u.name as applicant_name, u.department_id, u.role as applicant_role
      FROM leave_requests lr
      JOIN users u ON lr.applicant_id = u.id
      WHERE lr.applicant_role = 'staff' 
        AND lr.level2_reviewer_id = ? 
        AND lr.level1_status = 'forwarded' 
        AND lr.level2_status = 'pending'
      ORDER BY lr.created_at ASC
    `, [principalId]);

    res.json({ success: true, pendingRequests: rows });
  } catch (err) {
    console.error('Get Principal Pending Staff Reviews Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching staff requests.' });
  }
};

/**
 * Controller: Get HOD leave requests waiting for Principal approval
 * (Level 1 pending)
 */
const getPendingHodReviews = async (req, res) => {
  const principalId = req.user.id;

  try {
    const [rows] = await db.execute(`
      SELECT lr.*, u.name as applicant_name, u.department_id, u.role as applicant_role
      FROM leave_requests lr
      JOIN users u ON lr.applicant_id = u.id
      WHERE lr.applicant_role = 'hod' 
        AND lr.level1_reviewer_id = ? 
        AND lr.level1_status = 'pending'
      ORDER BY lr.created_at ASC
    `, [principalId]);

    res.json({ success: true, pendingRequests: rows });
  } catch (err) {
    console.error('Get Principal Pending HOD Reviews Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching HOD requests.' });
  }
};

/**
 * Helper to build report query
 */
const buildReportQuery = (filters) => {
  let query = `
    SELECT lr.*, u.name as applicant_name, u.department_id 
    FROM leave_requests lr
    JOIN users u ON lr.applicant_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.dept_id) {
    query += ` AND u.department_id = ?`;
    params.push(filters.dept_id);
  }
  if (filters.role) {
    query += ` AND lr.applicant_role = ?`;
    params.push(filters.role);
  }
  if (filters.leave_type) {
    query += ` AND lr.leave_type = ?`;
    params.push(filters.leave_type);
  }
  if (filters.status) {
    query += ` AND lr.overall_status = ?`;
    params.push(filters.status);
  }
  if (filters.from_date) {
    query += ` AND lr.from_date >= ?`;
    params.push(filters.from_date);
  }
  if (filters.to_date) {
    query += ` AND lr.to_date <= ?`;
    params.push(filters.to_date);
  }

  query += ` ORDER BY lr.created_at DESC`;
  return { query, params };
};

/**
 * Controller: Get rich formulated reports
 */
const getReport = async (req, res) => {
  try {
    const { query, params } = buildReportQuery(req.query);
    const [rows] = await db.execute(query, params);

    // Calculate Summary Metrics
    let total_cl = 0;
    let total_ml = 0;
    let total_od = 0;
    
    rows.forEach(row => {
      if (row.overall_status === 'approved') {
        if (row.leave_type === 'CL') total_cl += row.days_count;
        if (row.leave_type === 'ML') total_ml += row.days_count;
        if (row.leave_type === 'OD') total_od += row.days_count;
      }
    });

    res.json({
      success: true,
      data: rows,
      summary: {
        total_requests: rows.length,
        approved_cl_days: total_cl,
        approved_ml_days: total_ml,
        approved_od_days: total_od
      }
    });
  } catch (err) {
    console.error('Get Report Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error generating report.' });
  }
};

/**
 * Controller: Export Report to CSV
 */
const exportReport = async (req, res) => {
  try {
    const { query, params } = buildReportQuery(req.query);
    const [rows] = await db.execute(query, params);

    // Build CSV String
    const headers = ['Leave ID', 'Applicant Name', 'Role', 'Department', 'Leave Type', 'From Date', 'To Date', 'Days', 'Overall Status', 'Applied On'];
    let csvData = headers.join(',') + '\n';

    rows.forEach(row => {
      // Escape commas and quotes for CSV specification
      const escapeCSV = (str) => {
        if (!str) return '""';
        const stringified = String(str);
        if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
          return `"${stringified.replace(/"/g, '""')}"`;
        }
        return stringified;
      };

      const fromDate = new Date(row.from_date).toISOString().split('T')[0];
      const toDate = new Date(row.to_date).toISOString().split('T')[0];
      const appliedOn = new Date(row.created_at).toISOString().split('T')[0];

      const rowData = [
        row.id,
        escapeCSV(row.applicant_name),
        escapeCSV(row.applicant_role),
        escapeCSV(row.department_id),
        row.leave_type,
        fromDate,
        toDate,
        row.days_count,
        row.overall_status,
        appliedOn
      ];

      csvData += rowData.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leave_report.csv');
    res.status(200).send(csvData);

  } catch (err) {
    console.error('Export Report Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error exporting report.' });
  }
};

module.exports = {
  getPendingStaffReviews,
  getPendingHodReviews,
  getReport,
  exportReport
};
