const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      minlength: [1, 'Subject cannot be empty'],
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      trim: true,
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
    },
    marks: {
      type: Number,
      min: [0, 'Marks cannot be negative'],
      max: [100, 'Marks cannot exceed 100'],
    },
    comments: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate grade entries for same student/subject/semester
gradeSchema.index({ studentId: 1, subject: 1, semester: 1 });
gradeSchema.index({ studentId: 1 });

module.exports = mongoose.model('Grade', gradeSchema);
