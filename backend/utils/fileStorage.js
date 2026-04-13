const fs = require('fs');
const path = require('path');

const getDataFilePath = (collectionName) => path.join(__dirname, `../data/${collectionName}.json`);

const ensureDataFile = (collectionName) => {
  const file = getDataFilePath(collectionName);
  const dir = path.dirname(file);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify([], null, 2));
  }
};

const readCollection = (collectionName) => {
  ensureDataFile(collectionName);
  const data = fs.readFileSync(getDataFilePath(collectionName), 'utf8');
  try {
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const writeCollection = (collectionName, dataArray) => {
  ensureDataFile(collectionName);
  fs.writeFileSync(getDataFilePath(collectionName), JSON.stringify(dataArray, null, 2));
};

// Backwards compatibility wrappers explicitly mapping to "students"
const readStudents = () => readCollection('students');
const writeStudents = (students) => writeCollection('students', students);

module.exports = { 
  readCollection, 
  writeCollection,
  readStudents, 
  writeStudents 
};
