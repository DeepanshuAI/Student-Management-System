const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { readCollection, writeCollection } = require('../utils/fileStorage');
const { authenticateToken, requireRole } = require('../middleware/auth');
const validateStudent = require('../middleware/validateStudent');

const router = express.Router();

// Multer storage for documents
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

// Backwards compat wrappers
const getStudents = () => readCollection('students');
const saveStudents = (s) => writeCollection('students', s);

// Get all students (Accessible by Admin and Teacher)
router.get('/', authenticateToken, (req, res) => {
  try {
    let students = getStudents();
    const { page = 1, limit = 10, search, course, year, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    if (search) {
      const searchLower = search.toLowerCase();
      students = students.filter(s => 
        s.fullName.toLowerCase().includes(searchLower) ||
        s.studentId.toLowerCase().includes(searchLower) ||
        s.email.toLowerCase().includes(searchLower)
      );
    }

    if (course && course !== 'all') {
      students = students.filter(s => s.course === course);
    }

    if (year && year !== 'all') {
      students = students.filter(s => {
        if (!s.enrollmentDate) return false;
        return new Date(s.enrollmentDate).getFullYear().toString() === year;
      });
    }

    students.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = students.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedStudents = students.slice(startIndex, endIndex);

    res.json({
      students: paginatedStudents,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving students', error: error.message });
  }
});

// Dashboard stats (Admin and Teacher)
router.get('/stats', authenticateToken, (req, res) => {
  try {
    const students = getStudents();
    const attendanceData = readCollection('attendance');
    
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysAttendance = attendanceData.filter(a => a.date === todayStr);
    let presentToday = 0;
    
    todaysAttendance.forEach(aBatch => {
      if (aBatch.records) {
        aBatch.records.forEach(record => {
          if (record.status === 'Present') presentToday++;
        });
      }
    });

    const stats = {
      total: students.length,
      recent: students.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
      presentToday,
      byCourse: {},
      byYear: {}
    };

    students.forEach(s => {
      stats.byCourse[s.course] = (stats.byCourse[s.course] || 0) + 1;
      if (s.enrollmentDate) {
        const year = new Date(s.enrollmentDate).getFullYear();
        stats.byYear[year] = (stats.byYear[year] || 0) + 1;
      }
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error generating stats', error: error.message });
  }
});

// Get single student (Admin and Teacher)
router.get('/:id', authenticateToken, (req, res) => {
  const students = getStudents();
  const student = students.find(s => s._id === req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json(student);
});

// Upload document (Admin)
router.post('/:id/documents', authenticateToken, requireRole(['admin']), upload.single('document'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  
  const students = getStudents();
  const index = students.findIndex(s => s._id === req.params.id);
  if (index === -1) {
    // Clean up uploaded file if student doesn't exist
    fs.unlinkSync(req.file.path);
    return res.status(404).json({ message: 'Student not found' });
  }

  if (!students[index].documents) students[index].documents = [];
  
  const documentInfo = {
    _id: crypto.randomUUID(),
    name: req.body.documentName || req.file.originalname,
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`,
    uploadedAt: new Date().toISOString()
  };

  students[index].documents.push(documentInfo);
  saveStudents(students);

  res.status(201).json({ message: 'Document uploaded successfully', document: documentInfo });
});

// Create student (Admin only)
router.post('/', authenticateToken, requireRole(['admin']), validateStudent, (req, res) => {
  try {
    const students = getStudents();
    const newStudent = {
      _id: crypto.randomUUID(),
      studentId: `SMS-${new Date().getFullYear()}-${1000 + students.length}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    students.push(newStudent);
    saveStudents(students);
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating student', error: error.message });
  }
});

// Update student (Admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), validateStudent, (req, res) => {
  try {
    const students = getStudents();
    const index = students.findIndex(s => s._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Student not found' });

    students[index] = {
      ...students[index],
      ...req.body,
      _id: students[index]._id,
      studentId: students[index].studentId,
      documents: students[index].documents || [],
      createdAt: students[index].createdAt,
      updatedAt: new Date().toISOString()
    };

    saveStudents(students);
    res.json(students[index]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating student', error: error.message });
  }
});

// Delete student (Admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    let students = getStudents();
    const index = students.findIndex(s => s._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Student not found' });

    // Optional: Delete associated documents files physically from disk here if desired

    students = students.filter(s => s._id !== req.params.id);
    saveStudents(students);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student', error: error.message });
  }
});

module.exports = router;
