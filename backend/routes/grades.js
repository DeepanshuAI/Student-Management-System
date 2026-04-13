const express = require('express');
const { readCollection, writeCollection } = require('../utils/fileStorage');
const { authenticateToken, requireRole } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// Get batch grades for a specific class view
router.get('/batch', authenticateToken, (req, res) => {
  const { semester, subject } = req.query;
  const gradesData = readCollection('grades');
  const results = semester && subject 
    ? gradesData.filter(g => g.semester === semester && g.subject === subject)
    : gradesData;
  res.json(results);
});

// Bulk upsert class marks
router.post('/batch', authenticateToken, requireRole(['admin', 'teacher']), (req, res) => {
  const { semester, subject, records } = req.body;
  
  if (!semester || !subject || !records) {
    return res.status(400).json({ message: 'Semester, subject, and records are required.' });
  }

  let gradesData = readCollection('grades');
  const studentIds = records.map(r => r.studentId);

  // Eliminate overlapping historical scores cleanly before we append the new definitive copies
  gradesData = gradesData.filter(g => {
    const isTargetHit = g.semester === semester && g.subject === subject && studentIds.includes(g.studentId);
    return !isTargetHit;
  });

  const newGrades = records.map(r => ({
    _id: crypto.randomUUID(),
    studentId: r.studentId,
    subject,
    semester,
    grade: r.grade,
    comments: r.comments || '',
    createdAt: new Date().toISOString(),
    createdBy: req.user.email
  }));

  gradesData.push(...newGrades);
  writeCollection('grades', gradesData);

  res.json({ message: 'Batch grades seamlessly synchronized', count: newGrades.length });
});

// Get all grades for a specific student ID
router.get('/:studentId', authenticateToken, (req, res) => {
  const { studentId } = req.params;
  const gradesData = readCollection('grades');
  const studentGrades = gradesData.filter(g => g.studentId === studentId);
  res.json(studentGrades);
});

// Add a new grade record (Admin & Teacher)
router.post('/:studentId', authenticateToken, requireRole(['admin', 'teacher']), (req, res) => {
  const { studentId } = req.params;
  const { subject, grade, semester, comments } = req.body;

  if (!subject || !grade || !semester) {
    return res.status(400).json({ message: 'Subject, grade, and semester are required.' });
  }

  const gradesData = readCollection('grades');
  const newGrade = {
    _id: crypto.randomUUID(),
    studentId,
    subject,
    grade,
    semester,
    comments: comments || '',
    createdAt: new Date().toISOString(),
    createdBy: req.user.email
  };

  gradesData.push(newGrade);
  writeCollection('grades', gradesData);

  res.status(201).json(newGrade);
});

// Delete a grade record (Admin Only)
router.delete('/:gradeId', authenticateToken, requireRole(['admin']), (req, res) => {
  const { gradeId } = req.params;
  let gradesData = readCollection('grades');
  
  const initialLength = gradesData.length;
  gradesData = gradesData.filter(g => g._id !== gradeId);

  if (gradesData.length === initialLength) {
    return res.status(404).json({ message: 'Grade not found' });
  }

  writeCollection('grades', gradesData);
  res.json({ message: 'Grade deleted successfully' });
});

module.exports = router;
