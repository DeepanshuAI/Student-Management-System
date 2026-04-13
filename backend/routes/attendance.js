const express = require('express');
const { readCollection, writeCollection } = require('../utils/fileStorage');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get attendance for a specific course and date
// Accessible by Admin & Teacher
router.get('/', authenticateToken, (req, res) => {
  const { course, date } = req.query;
  if (!course || !date) return res.status(400).json({ message: 'Course and date required' });

  const attendanceRecord = readCollection('attendance');
  const record = attendanceRecord.find(a => a.course === course && a.date === date);
  
  res.json(record || { course, date, records: [] });
});

// Save or Update Attendance list
// Accessible by Admin & Teacher
router.post('/', authenticateToken, requireRole(['admin', 'teacher']), (req, res) => {
  const { course, date, records } = req.body;
  if (!course || !date || !records) {
    return res.status(400).json({ message: 'Course, date, and records payload required.' });
  }

  const attendanceData = readCollection('attendance');
  const existingIdx = attendanceData.findIndex(a => a.course === course && a.date === date);

  if (existingIdx >= 0) {
    attendanceData[existingIdx].records = records;
    attendanceData[existingIdx].updatedAt = new Date().toISOString();
    attendanceData[existingIdx].updatedBy = req.user.email;
  } else {
    attendanceData.push({
      course,
      date,
      records,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.email
    });
  }

  writeCollection('attendance', attendanceData);
  res.json({ message: 'Attendance saved successfully' });
});

module.exports = router;
