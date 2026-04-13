const express = require('express');
const cors = require('cors');
const path = require('path');
const studentRoutes = require('./routes/students');
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const testGradesRoutes = require('./routes/grades');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', testGradesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Student Management API (V2 Authenticated) is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Secured Server running on http://localhost:${PORT}`);
  console.log(`📚 JWT Protected API ready`);
});
