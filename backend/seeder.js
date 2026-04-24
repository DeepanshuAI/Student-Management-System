/**
 * Seeder Script — populates MongoDB with sample data
 *
 * ⚠️  BLOCKED IN PRODUCTION — this will refuse to run if NODE_ENV=production
 *
 * Usage:
 *   npm run seed              → seed database
 *   npm run seed -- --destroy → wipe database only (no re-seed)
 */
require('dotenv').config();
const mongoose = require('mongoose');

// ── Production Guard ───────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  console.error('');
  console.error('🚫 BLOCKED: Seeder cannot run in production environment.');
  console.error('   Set NODE_ENV=development in your .env to use this script.');
  console.error('');
  process.exit(1);
}

const User = require('./models/User');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');
const Grade = require('./models/Grade');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in .env');
  process.exit(1);
}

// ── Flag: --destroy wipes without re-seeding ──────────────────────────────────
const destroyOnly = process.argv.includes('--destroy');

// ── Sample Data ───────────────────────────────────────────────────────────────
const USERS = [
  { name: 'Administrator', email: 'admin@stuman.com',   password: 'password123', role: 'admin' },
  { name: 'Mrs. Teacher',  email: 'teacher@stuman.com', password: 'password123', role: 'teacher' },
];

const COURSES = ['Computer Science', 'Business Administration', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering'];
const SUBJECTS = ['Mathematics', 'Physics', 'Computer Science', 'English', 'Chemistry'];

const STUDENTS = [
  { fullName: 'Aarav Sharma',        email: 'aarav.sharma@student.edu',    phone: '9876543210', age: 20, gender: 'Male',   course: 'Computer Science',        year: '2', address: '12 MG Road, Delhi',          enrollmentDate: '2024-08-01', status: 'Active',   guardianName: 'Rajesh Sharma',        guardianPhone: '9876543211', dateOfBirth: '2004-03-15' },
  { fullName: 'Priya Patel',         email: 'priya.patel@student.edu',     phone: '9123456789', age: 19, gender: 'Female', course: 'Business Administration',  year: '1', address: '45 Park St, Mumbai',         enrollmentDate: '2025-08-01', status: 'Active',   guardianName: 'Suresh Patel',         guardianPhone: '9123456780', dateOfBirth: '2005-07-22' },
  { fullName: 'Rohan Mehta',         email: 'rohan.mehta@student.edu',     phone: '9988776655', age: 21, gender: 'Male',   course: 'Electrical Engineering',   year: '3', address: '78 Gandhi Nagar, Ahmedabad', enrollmentDate: '2023-08-01', status: 'Active',   guardianName: 'Anil Mehta',           guardianPhone: '9988776644', dateOfBirth: '2003-11-10' },
  { fullName: 'Sneha Reddy',         email: 'sneha.reddy@student.edu',     phone: '9871234560', age: 20, gender: 'Female', course: 'Mechanical Engineering',   year: '2', address: '23 Jubilee Hills, Hyderabad',enrollmentDate: '2024-08-01', status: 'Active',   guardianName: 'Venkat Reddy',         guardianPhone: '9871234561', dateOfBirth: '2004-05-18' },
  { fullName: 'Arjun Singh',         email: 'arjun.singh@student.edu',     phone: '9765432100', age: 22, gender: 'Male',   course: 'Computer Science',        year: '4', address: '56 Civil Lines, Jaipur',     enrollmentDate: '2022-08-01', status: 'Active',   guardianName: 'Harpreet Singh',       guardianPhone: '9765432101', dateOfBirth: '2002-09-25' },
  { fullName: 'Kavya Nair',          email: 'kavya.nair@student.edu',      phone: '9654321098', age: 21, gender: 'Female', course: 'Business Administration',  year: '3', address: '89 Marine Drive, Kochi',    enrollmentDate: '2023-08-01', status: 'Active',   guardianName: 'Krishnan Nair',        guardianPhone: '9654321099', dateOfBirth: '2003-01-30' },
  { fullName: 'Vikram Joshi',        email: 'vikram.joshi@student.edu',    phone: '9543210987', age: 19, gender: 'Male',   course: 'Civil Engineering',        year: '1', address: '34 Shivaji Park, Pune',      enrollmentDate: '2025-08-01', status: 'Active',   guardianName: 'Prakash Joshi',        guardianPhone: '9543210988', dateOfBirth: '2005-04-12' },
  { fullName: 'Ananya Gupta',        email: 'ananya.gupta@student.edu',    phone: '9432109876', age: 20, gender: 'Female', course: 'Computer Science',        year: '2', address: '67 Hazratganj, Lucknow',    enrollmentDate: '2024-08-01', status: 'Active',   guardianName: 'Ramesh Gupta',         guardianPhone: '9432109877', dateOfBirth: '2004-08-07' },
  { fullName: 'Karan Malhotra',      email: 'karan.malhotra@student.edu',  phone: '9321098765', age: 19, gender: 'Male',   course: 'Electrical Engineering',   year: '1', address: '90 Connaught Place, Delhi',  enrollmentDate: '2025-08-01', status: 'Active',   guardianName: 'Deepak Malhotra',      guardianPhone: '9321098766', dateOfBirth: '2005-12-20' },
  { fullName: 'Divya Iyer',          email: 'divya.iyer@student.edu',      phone: '9210987654', age: 22, gender: 'Female', course: 'Business Administration',  year: '4', address: '12 T Nagar, Chennai',       enrollmentDate: '2022-08-01', status: 'Active',   guardianName: 'Subramaniam Iyer',     guardianPhone: '9210987655', dateOfBirth: '2002-06-14' },
  { fullName: 'Rahul Desai',         email: 'rahul.desai@student.edu',     phone: '9109876543', age: 21, gender: 'Male',   course: 'Mechanical Engineering',   year: '3', address: '45 FC Road, Pune',          enrollmentDate: '2023-08-01', status: 'Active',   guardianName: 'Nilesh Desai',         guardianPhone: '9109876544', dateOfBirth: '2003-02-28' },
  { fullName: 'Meera Krishnamurthy', email: 'meera.k@student.edu',         phone: '9098765432', age: 19, gender: 'Female', course: 'Computer Science',        year: '1', address: '78 Indiranagar, Bangalore',  enrollmentDate: '2025-08-01', status: 'Active',   guardianName: 'Murthy Krishnamurthy', guardianPhone: '9098765433', dateOfBirth: '2005-10-03' },
  { fullName: 'Nikhil Tiwari',       email: 'nikhil.tiwari@student.edu',   phone: '8987654321', age: 20, gender: 'Male',   course: 'Civil Engineering',        year: '2', address: '23 Ashok Nagar, Bhopal',    enrollmentDate: '2024-08-01', status: 'Active',   guardianName: 'Santosh Tiwari',       guardianPhone: '8987654322', dateOfBirth: '2004-07-16' },
  { fullName: 'Pooja Verma',         email: 'pooja.verma@student.edu',     phone: '8876543210', age: 20, gender: 'Female', course: 'Business Administration',  year: '2', address: '56 Sector 22, Chandigarh',  enrollmentDate: '2024-08-01', status: 'Inactive', guardianName: 'Vinod Verma',          guardianPhone: '8876543211', dateOfBirth: '2004-01-09' },
  { fullName: 'Aditya Kumar',        email: 'aditya.kumar@student.edu',    phone: '8765432109', age: 22, gender: 'Male',   course: 'Electrical Engineering',   year: '4', address: '89 Boring Road, Patna',     enrollmentDate: '2022-08-01', status: 'Active',   guardianName: 'Sunil Kumar',          guardianPhone: '8765432110', dateOfBirth: '2002-04-21' },
  { fullName: 'Sakshi Bhatia',       email: 'sakshi.bhatia@student.edu',   phone: '8654321098', age: 21, gender: 'Female', course: 'Computer Science',        year: '3', address: '34 Model Town, Ludhiana',   enrollmentDate: '2023-08-01', status: 'Active',   guardianName: 'Rajiv Bhatia',         guardianPhone: '8654321099', dateOfBirth: '2003-09-05' },
  { fullName: 'Manish Agarwal',      email: 'manish.agarwal@student.edu',  phone: '8543210987', age: 19, gender: 'Male',   course: 'Mechanical Engineering',   year: '1', address: '67 Lal Bagh, Lucknow',      enrollmentDate: '2025-08-01', status: 'Active',   guardianName: 'Rakesh Agarwal',       guardianPhone: '8543210988', dateOfBirth: '2005-11-27' },
  { fullName: 'Tanya Saxena',        email: 'tanya.saxena@student.edu',    phone: '8432109876', age: 21, gender: 'Female', course: 'Civil Engineering',        year: '3', address: '90 Rajouri Garden, Delhi',  enrollmentDate: '2023-08-01', status: 'Active',   guardianName: 'Ashok Saxena',         guardianPhone: '8432109877', dateOfBirth: '2003-06-02' },
  { fullName: 'Suresh Pandey',       email: 'suresh.pandey@student.edu',   phone: '8321098765', age: 22, gender: 'Male',   course: 'Business Administration',  year: '4', address: '12 Sigra, Varanasi',        enrollmentDate: '2022-08-01', status: 'Active',   guardianName: 'Shyam Pandey',         guardianPhone: '8321098766', dateOfBirth: '2002-08-19' },
  { fullName: 'Riya Chaudhary',      email: 'riya.chaudhary@student.edu',  phone: '8210987654', age: 20, gender: 'Female', course: 'Computer Science',        year: '2', address: '45 Rajpura, Jaipur',        enrollmentDate: '2024-08-01', status: 'Active',   guardianName: 'Mahesh Chaudhary',     guardianPhone: '8210987655', dateOfBirth: '2004-02-14' },
];

// ── Helper: compute grade letter from marks ───────────────────────────────────
const getGrade = (marks) => {
  if (marks >= 90) return 'A+';
  if (marks >= 80) return 'A';
  if (marks >= 70) return 'B';
  if (marks >= 60) return 'C';
  if (marks >= 50) return 'D';
  return 'F';
};

// ── Main Seeder ───────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    console.log('');
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log(`✅ Connected to: ${mongoose.connection.host}`);
    console.log('');

    // ── Wipe existing data ──────────────────────────────────────────────────
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Attendance.deleteMany({}),
      Grade.deleteMany({}),
    ]);
    console.log('   ✓ All collections cleared');

    if (destroyOnly) {
      console.log('\n💥 --destroy flag detected. Database wiped, no data inserted.\n');
      process.exit(0);
    }

    // ── Seed Users ──────────────────────────────────────────────────────────
    console.log('\n👤 Seeding users...');
    const createdUsers = await User.create(USERS); // triggers bcrypt pre-save hook
    createdUsers.forEach((u) => console.log(`   ✓ ${u.role.padEnd(8)} → ${u.email}`));

    // ── Seed Students ───────────────────────────────────────────────────────
    console.log('\n🎓 Seeding students...');
    const year = new Date().getFullYear();
    const studentsWithIds = STUDENTS.map((s, i) => ({
      ...s,
      studentId: `SMS-${year}-${1000 + i}`,
    }));
    const createdStudents = await Student.insertMany(studentsWithIds, { ordered: false });
    console.log(`   ✓ Created ${createdStudents.length} students`);

    // ── Seed Attendance (today) ─────────────────────────────────────────────
    console.log('\n📅 Seeding attendance...');
    const today = new Date().toISOString().split('T')[0];
    const attendanceRecords = createdStudents.slice(0, 12).map((s) => ({
      studentId: s.studentId,
      status: Math.random() > 0.15 ? 'Present' : (Math.random() > 0.5 ? 'Absent' : 'Late'),
    }));

    await Attendance.create({
      course: 'Computer Science',
      date: today,
      records: attendanceRecords,
      updatedBy: 'admin@stuman.com',
    });
    console.log(`   ✓ Attendance for ${today} (${attendanceRecords.length} students)`);

    // ── Seed Grades ─────────────────────────────────────────────────────────
    console.log('\n📊 Seeding grades...');
    const gradeData = [];
    createdStudents.forEach((s) => {
      SUBJECTS.forEach((subject) => {
        const marks = Math.floor(45 + Math.random() * 55); // 45–100
        gradeData.push({
          studentId: s.studentId,
          subject,
          semester: 'Spring 2025',
          grade: getGrade(marks),
          marks,
          comments: '',
          createdBy: 'admin@stuman.com',
        });
      });
    });
    await Grade.insertMany(gradeData, { ordered: false });
    console.log(`   ✓ Created ${gradeData.length} grade records (${SUBJECTS.length} subjects × ${createdStudents.length} students)`);

    // ── Done ────────────────────────────────────────────────────────────────
    console.log('');
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║  🎉 Database seeded successfully!              ║');
    console.log('╠═══════════════════════════════════════════════╣');
    console.log('║  🔐 Login Credentials:                         ║');
    console.log('║     Admin   → admin@stuman.com / password123  ║');
    console.log('║     Teacher → teacher@stuman.com / password123 ║');
    console.log('╚═══════════════════════════════════════════════╝');
    console.log('');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    if (err.code === 11000) {
      console.error('   Hint: Database already has data. Run with --destroy first if you want to re-seed.');
    }
    process.exit(1);
  }
};

seed();
