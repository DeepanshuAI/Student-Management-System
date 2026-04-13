const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const firstNamesMale = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 
  'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Rishabh', 'Aryan', 'Kabir', 'Rudra', 'Ansh', 'Dev', 
  'Kartik', 'Vedant', 'Karan', 'Rahil', 'Samar', 'Tanish', 'Kush', 'Rahul', 'Rohit', 'Siddharth'
];

const firstNamesFemale = [
  'Aadhya', 'Diya', 'Kiara', 'Kavya', 'Sanya', 'Pari', 'Ananya', 'Myra', 'Aaradhya', 'Sarah', 
  'Prisha', 'Riya', 'Anika', 'Aahana', 'Navya', 'Avni', 'Vanya', 'Ira', 'Zara', 'Meera', 
  'Neha', 'Kriti', 'Nisha', 'Rachana', 'Sneha', 'Tanya', 'Tanvi', 'Ishita', 'Pooja', 'Shruti'
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Patel', 'Yadav', 'Rao', 'Reddy', 'Chauhan', 
  'Joshi', 'Mishra', 'Tiwari', 'Das', 'Roy', 'Agarwal', 'Pandey', 'Nair', 'Menon', 'Pillai', 
  'Bose', 'Chatterjee', 'Sen', 'Kapoor', 'Malhotra', 'Bhatia', 'Iyer', 'Deshmukh', 'Jain', 'Mehta'
];

const courses = [
  'B.Sc B.Ed Computer Science',
  'B.Sc B.Ed Mathematics',
  'B.A B.Ed Hindi',
  'B.A B.Ed English',
  'B.A B.Ed Social Science'
];

const states = [
  'Maharashtra', 'Karnataka', 'Delhi', 'Uttar Pradesh', 'Gujarat', 'Tamil Nadu', 
  'Kerala', 'West Bengal', 'Rajasthan', 'Madhya Pradesh', 'Punjab'
];

const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generatePhone = () => {
  return `+91 ${randomInt(6000, 9999)}${randomInt(100000, 999999)}`;
};

const students = [];
for (let i = 0; i < 100; i++) {
  const isMale = Math.random() > 0.5;
  const firstName = isMale ? randomChoice(firstNamesMale) : randomChoice(firstNamesFemale);
  const lastName = randomChoice(lastNames);
  const gender = isMale ? 'Male' : 'Female';
  
  const studentYear = randomInt(2023, 2026);
  const currentYearSuffix = i.toString().padStart(3, '0');
  const studentId = `SMS-${studentYear}-${1000 + i}`;
  
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 99)}@example.in`;
  const age = randomInt(18, 23);
  
  const course = randomChoice(courses);
  const address = `Block ${randomChoice('ABCDEF')}, Near ${randomChoice(['Temple', 'Market', 'Station', 'Park'])}, City, ${randomChoice(states)} ${randomInt(100000, 999999)}`;
  
  const enrollmentMonth = randomInt(1, 12).toString().padStart(2, '0');
  const enrollmentDay = randomInt(1, 28).toString().padStart(2, '0');
  const enrollmentDateStr = `${studentYear}-${enrollmentMonth}-${enrollmentDay}`;
  const enrollmentDateIso = new Date(`${enrollmentDateStr}T10:00:00.000Z`).toISOString();
  
  students.push({
    _id: crypto.randomUUID(),
    studentId,
    fullName: `${firstName} ${lastName}`,
    age: age.toString(),
    gender,
    email,
    phone: generatePhone(),
    address,
    course,
    enrollmentDate: enrollmentDateStr,
    createdAt: enrollmentDateIso,
    updatedAt: enrollmentDateIso
  });
}

// Write to array in descending order based on createdAt
students.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

const destPath = path.join(__dirname, '..', 'backend', 'data', 'students.json');
fs.writeFileSync(destPath, JSON.stringify(students, null, 2), 'utf-8');

console.log(`Successfully generated 100 Indian student records and saved to ${destPath}`);
