const { readStudents, writeStudents } = require('../utils/fileStorage');
const { v4: uuidv4 } = require('uuid');

// Generate student ID: SMS-YYYY-XXXX
const generateStudentId = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SMS-${year}-${rand}`;
};

// GET /api/students
const getAllStudents = (req, res) => {
  try {
    let students = readStudents();

    const { search, course, year, sortBy, sortOrder, page = 1, limit = 10 } = req.query;

    // Search
    if (search) {
      const q = search.toLowerCase();
      students = students.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    // Filter by course
    if (course && course !== 'all') {
      students = students.filter((s) => s.course === course);
    }

    // Filter by enrollment year
    if (year && year !== 'all') {
      students = students.filter(
        (s) => new Date(s.enrollmentDate).getFullYear() === parseInt(year)
      );
    }

    // Sort
    if (sortBy) {
      students.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        if (sortBy === 'enrollmentDate') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        } else {
          aVal = aVal?.toString().toLowerCase() || '';
          bVal = bVal?.toString().toLowerCase() || '';
        }
        if (aVal < bVal) return sortOrder === 'desc' ? 1 : -1;
        if (aVal > bVal) return sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    const total = students.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = students.slice(start, start + parseInt(limit));

    res.json({
      students: paginated,
      total,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/students/:id
const getStudentById = (req, res) => {
  try {
    const students = readStudents();
    const student = students.find((s) => s._id === req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/students
const createStudent = (req, res) => {
  try {
    const students = readStudents();
    const newStudent = {
      _id: uuidv4(),
      studentId: generateStudentId(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    students.push(newStudent);
    writeStudents(students);
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/students/:id
const updateStudent = (req, res) => {
  try {
    const students = readStudents();
    const index = students.findIndex((s) => s._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Student not found' });

    students[index] = {
      ...students[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    writeStudents(students);
    res.json(students[index]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/students/:id
const deleteStudent = (req, res) => {
  try {
    let students = readStudents();
    const index = students.findIndex((s) => s._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Student not found' });

    const deleted = students[index];
    students.splice(index, 1);
    writeStudents(students);
    res.json({ message: 'Student deleted successfully', student: deleted });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/stats
const getStats = (req, res) => {
  try {
    const students = readStudents();
    const total = students.length;

    // Students by course
    const byCourse = {};
    students.forEach((s) => {
      byCourse[s.course] = (byCourse[s.course] || 0) + 1;
    });

    // Students by year
    const byYear = {};
    students.forEach((s) => {
      const year = new Date(s.enrollmentDate).getFullYear();
      byYear[year] = (byYear[year] || 0) + 1;
    });

    // Recent students (last 5)
    const recent = [...students]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({ total, byCourse, byYear, recent });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent, getStats };
