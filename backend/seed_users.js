const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { writeCollection } = require('./utils/fileStorage');

const seedUsers = async () => {
  const users = [];
  const adminPass = await bcrypt.hash('password123', 10);
  users.push({
    _id: crypto.randomUUID(),
    email: 'admin@stuman.com',
    password: adminPass,
    role: 'admin',
    name: 'Administrator',
    createdAt: new Date().toISOString()
  });

  const teacherPass = await bcrypt.hash('password123', 10);
  users.push({
    _id: crypto.randomUUID(),
    email: 'teacher@stuman.com',
    password: teacherPass,
    role: 'teacher',
    name: 'Mrs. Teacher',
    createdAt: new Date().toISOString()
  });

  writeCollection('users', users);
  console.log('Successfully seeded admin and teacher accounts to users.json');
};

seedUsers().catch(console.error);
