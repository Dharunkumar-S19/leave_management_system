const db = require('./src/config/db');

const updateEmails = async () => {
  try {
    await db.execute("UPDATE users SET email = 'student@gmail.com' WHERE role = 'student'");
    await db.execute("UPDATE users SET email = 'staff@gmail.com' WHERE role = 'staff'");
    await db.execute("UPDATE users SET email = 'hod@gmail.com' WHERE role = 'hod'");
    await db.execute("UPDATE users SET email = 'principal@gmail.com' WHERE role = 'principal'");
    await db.execute("UPDATE users SET email = 'admin@gmail.com' WHERE role = 'admin'");
    console.log('✅ All emails updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
};

updateEmails();
