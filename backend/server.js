const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Database connection check
const db = require('./src/config/db');

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/leaves', require('./src/routes/leaveRoutes'));
app.use('/api/student', require('./src/routes/studentRoutes'));
app.use('/api/staff', require('./src/routes/staffRoutes'));
app.use('/api/hod', require('./src/routes/hodRoutes'));
app.use('/api/principal', require('./src/routes/principalRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Leave Management System API' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
