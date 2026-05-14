require('dotenv').config();
const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const records = await Attendance.find({});
  console.log('Attendance records:', JSON.stringify(records, null, 2));
  
  const todayStr = new Date().toISOString().split('T')[0];
  console.log('Server todayStr:', todayStr);
  
  const todayRecords = await Attendance.find({ date: todayStr });
  console.log('Today records count:', todayRecords.length);
  let presentToday = 0;
  todayRecords.forEach(doc => {
    if (doc.records) {
      presentToday += doc.records.filter(r => r.status === 'Present').length;
    }
  });
  console.log('Total present calculated:', presentToday);
  
  process.exit(0);
};

run();
