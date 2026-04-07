const mysql = require('mysql2/promise');
require('dotenv').config();

const fixHierarchy = async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    console.log('Connected. Fixing Approval Hierarchy Triggers...');

    // 1. Drop existing before_insert trigger
    await conn.query('DROP TRIGGER IF EXISTS tr_leave_request_before_insert');

    // 2. Re-create trigger with Staff set to Level 2 'na'
    await conn.query(`
      CREATE TRIGGER tr_leave_request_before_insert
      BEFORE INSERT ON leave_requests
      FOR EACH ROW
      BEGIN
        IF NEW.applicant_role = 'student' THEN
          SET NEW.level2_status = 'pending';
        ELSEIF NEW.applicant_role = 'staff' THEN
          SET NEW.level2_status = 'na'; -- Staff only needs HOD (Level 1) approval now
        ELSEIF NEW.applicant_role = 'hod' THEN
          SET NEW.level2_status = 'na'; -- HOD only needs Principal (Level 1) approval
        ELSEIF NEW.applicant_role = 'principal' THEN
          SET NEW.level2_status = 'na'; -- Principal only needs Admin (Level 1) approval
        ELSEIF NEW.applicant_role = 'admin' THEN
          SET NEW.overall_status = 'approved';
          SET NEW.level1_status = 'forwarded';
          SET NEW.level2_status = 'na';
        END IF;
      END
    `);

    console.log('✅ Hierarchy triggers updated! Staff requests now only require HOD approval.');
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to update hierarchy:', err.message);
    await conn.end();
    process.exit(1);
  }
};

fixHierarchy();
