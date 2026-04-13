const validateStudent = (req, res, next) => {
  const { fullName, age, gender, email, phone, address, course, enrollmentDate } = req.body;
  const errors = [];

  if (!fullName || fullName.trim() === '') errors.push('Full name is required');
  if (!age) {
    errors.push('Age is required');
  } else if (isNaN(age) || parseInt(age) < 1 || parseInt(age) > 120) {
    errors.push('Age must be a valid number between 1 and 120');
  }
  if (!gender || gender.trim() === '') errors.push('Gender is required');

  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) errors.push('Email must be a valid format');
  }

  if (!phone || phone.trim() === '') {
    errors.push('Phone number is required');
  } else {
    const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/;
    if (!phoneRegex.test(phone)) errors.push('Phone number must be valid');
  }

  if (!address || address.trim() === '') errors.push('Address is required');
  if (!course || course.trim() === '') errors.push('Course is required');
  if (!enrollmentDate || enrollmentDate.trim() === '') errors.push('Enrollment date is required');

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

module.exports = validateStudent;
