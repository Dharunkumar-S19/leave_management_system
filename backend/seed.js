const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

const seedDatabase = async () => {
  try {
    // 1. Create a Department
    await db.execute('INSERT IGNORE INTO departments (id, name, code) VALUES (1, "Computer Science", "CSE")');

    // 2. Hash Passwords
    const standardPass = await bcrypt.hash('password123', 10);
    const adminPass = await bcrypt.hash('admin123', 10);

    // 3. Clear existing dummy users if any to avoid duplication errors and insert
    await db.execute('DELETE FROM users');
    
    await db.execute(`
      INSERT INTO users (id, name, email, password_hash, role, department_id, class, roll_number) 
      VALUES 
      (1, 'Alex Student', 'alex@college.edu', ?, 'student', 1, 'III CSE A', '101'),
      (2, 'John Doe (Staff)', 'john.doe@college.edu', ?, 'staff', 1, NULL, NULL),
      (3, 'Dr. Smith (HOD)', 'dr.smith@college.edu', ?, 'hod', 1, NULL, NULL),
      (4, 'Principal Admin', 'admin@college.edu', ?, 'principal', NULL, NULL, NULL)
    `, [standardPass, standardPass, standardPass, adminPass]);

    // 4. Initialize Leave Balances
    await db.execute('DELETE FROM leave_balances');
    await db.execute(`
      INSERT INTO leave_balances (user_id, academic_year, role_type) VALUES
      (1, '2023-24', 'student'),
      (2, '2023-24', 'staff'),
      (3, '2023-24', 'hod'),
      (4, '2023-24', 'principal')
    `);

    console.log('Dummy Data Seeded Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Failed:', err);
    process.exit(1);
  }
};

seedDatabase();
