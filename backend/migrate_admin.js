const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const migrate = async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    console.log('Connected. Starting Admin Role Migration...\n');

    // ── 1. ALTER ENUM COLUMNS ──────────────────────────────────────────────
    console.log('Step 1: Expanding ENUM columns...');
    await conn.query(`ALTER TABLE users MODIFY COLUMN role ENUM('student','staff','hod','principal','admin') NOT NULL`);
    await conn.query(`ALTER TABLE leave_balances MODIFY COLUMN role_type ENUM('student','staff','hod','principal','admin') NOT NULL`);
    await conn.query(`ALTER TABLE leave_requests MODIFY COLUMN applicant_role ENUM('student','staff','hod','principal','admin') NOT NULL`);
    await conn.query(`ALTER TABLE leave_audit_log MODIFY COLUMN actor_role ENUM('student','staff','hod','principal','admin') NOT NULL`);
    console.log('  ✓ ENUM columns updated.\n');

    // ── 2. DROP OLD TRIGGERS ──────────────────────────────────────────────
    console.log('Step 2: Dropping old triggers...');
    await conn.query('DROP TRIGGER IF EXISTS tr_leave_request_before_insert');
    await conn.query('DROP TRIGGER IF EXISTS tr_leave_request_before_update_status');
    await conn.query('DROP TRIGGER IF EXISTS tr_leave_request_after_update_status');
    await conn.query('DROP TRIGGER IF EXISTS tr_leave_request_after_update_balance');
    await conn.query('DROP TRIGGER IF EXISTS tr_leave_request_after_insert_balance');
    console.log('  ✓ Old triggers dropped.\n');

    // ── 3. BEFORE INSERT TRIGGER ──────────────────────────────────────────
    console.log('Step 3: Creating before-insert trigger...');
    await conn.query(`
      CREATE TRIGGER tr_leave_request_before_insert
      BEFORE INSERT ON leave_requests
      FOR EACH ROW
      BEGIN
        IF NEW.applicant_role = 'student' THEN
          SET NEW.level2_status = 'pending';
        ELSEIF NEW.applicant_role = 'staff' THEN
          SET NEW.level2_status = 'pending';
        ELSEIF NEW.applicant_role = 'hod' THEN
          SET NEW.level2_status = 'na';
        ELSEIF NEW.applicant_role = 'principal' THEN
          SET NEW.level2_status = 'na';
        ELSEIF NEW.applicant_role = 'admin' THEN
          SET NEW.overall_status = 'approved';
          SET NEW.level1_status = 'forwarded';
          SET NEW.level2_status = 'na';
        END IF;
      END
    `);
    console.log('  ✓ Before-insert trigger created.\n');

    // ── 4. BEFORE UPDATE STATUS TRIGGER ──────────────────────────────────
    console.log('Step 4: Creating before-update-status trigger...');
    await conn.query(`
      CREATE TRIGGER tr_leave_request_before_update_status
      BEFORE UPDATE ON leave_requests
      FOR EACH ROW
      BEGIN
        IF NEW.level1_status <> OLD.level1_status OR NEW.level2_status <> OLD.level2_status THEN
          IF NEW.level1_status = 'rejected' OR NEW.level2_status = 'rejected' THEN
            SET NEW.overall_status = 'rejected';
          ELSEIF NEW.level2_status = 'na' AND NEW.level1_status = 'forwarded' THEN
            SET NEW.overall_status = 'approved';
          ELSEIF NEW.level2_status = 'approved' THEN
            SET NEW.overall_status = 'approved';
          END IF;
        END IF;
      END
    `);
    console.log('  ✓ Before-update-status trigger created.\n');

    // ── 5. AFTER UPDATE BALANCE TRIGGER ──────────────────────────────────
    console.log('Step 5: Creating after-update-balance trigger...');
    await conn.query(`
      CREATE TRIGGER tr_leave_request_after_update_balance
      AFTER UPDATE ON leave_requests
      FOR EACH ROW
      BEGIN
        IF NEW.overall_status = 'approved' AND OLD.overall_status = 'pending' THEN
          IF NEW.leave_type = 'CL' THEN
            UPDATE leave_balances SET cl_used = cl_used + NEW.days_count WHERE user_id = NEW.applicant_id AND academic_year = '2023-24';
          ELSEIF NEW.leave_type = 'ML' THEN
            UPDATE leave_balances SET ml_used = ml_used + NEW.days_count WHERE user_id = NEW.applicant_id AND academic_year = '2023-24';
          ELSEIF NEW.leave_type = 'OD' THEN
            UPDATE leave_balances SET od_used = od_used + NEW.days_count WHERE user_id = NEW.applicant_id AND academic_year = '2023-24';
          END IF;
        END IF;
      END
    `);
    console.log('  ✓ After-update-balance trigger created.\n');

    // ── 6. AFTER INSERT BALANCE TRIGGER ──────────────────────────────────
    console.log('Step 6: Creating after-insert-balance trigger...');
    await conn.query(`
      CREATE TRIGGER tr_leave_request_after_insert_balance
      AFTER INSERT ON leave_requests
      FOR EACH ROW
      BEGIN
        IF NEW.overall_status = 'approved' THEN
          IF NEW.leave_type = 'CL' THEN
            UPDATE leave_balances SET cl_used = cl_used + NEW.days_count WHERE user_id = NEW.applicant_id AND academic_year = '2023-24';
          ELSEIF NEW.leave_type = 'ML' THEN
            UPDATE leave_balances SET ml_used = ml_used + NEW.days_count WHERE user_id = NEW.applicant_id AND academic_year = '2023-24';
          ELSEIF NEW.leave_type = 'OD' THEN
            UPDATE leave_balances SET od_used = od_used + NEW.days_count WHERE user_id = NEW.applicant_id AND academic_year = '2023-24';
          END IF;
        END IF;
      END
    `);
    console.log('  ✓ After-insert-balance trigger created.\n');

    // ── 7. SEED ADMIN USER ────────────────────────────────────────────────
    console.log('Step 7: Seeding Admin user...');
    const adminPass = await bcrypt.hash('admin123', 10);
    const [existing] = await conn.execute("SELECT id FROM users WHERE email = 'superadmin@college.edu'");
    if (existing.length === 0) {
      await conn.execute(
        `INSERT INTO users (name, email, password_hash, role, department_id) VALUES (?, ?, ?, 'admin', NULL)`,
        ['Super Admin', 'superadmin@college.edu', adminPass]
      );
      console.log('  ✓ Admin user created: superadmin@college.edu / admin123\n');
    } else {
      console.log('  ℹ Admin user already exists, skipping.\n');
    }

    console.log('✅ Migration complete! Admin role is now fully active.');
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    await conn.end();
    process.exit(1);
  }
};

migrate();
