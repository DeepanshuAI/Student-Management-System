import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi } from '../api/studentApi';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, User, Mail, BookOpen, Loader2 } from 'lucide-react';

const COURSES = [
  'B.Sc B.Ed Computer Science',
  'B.Sc B.Ed Mathematics',
  'B.A B.Ed Hindi',
  'B.A B.Ed English',
  'B.A B.Ed Social Science'
];
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

const initialForm = {
  fullName: '', age: '', gender: '', email: '',
  phone: '', address: '', course: '', enrollmentDate: '',
};

const AddStudent = ({ addToast }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.age) e.age = 'Age is required';
    else if (isNaN(form.age) || +form.age < 1 || +form.age > 120) e.age = 'Age must be between 1 and 120';
    if (!form.gender) e.gender = 'Gender is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^[+]?[\d\s\-().]{7,20}$/.test(form.phone)) e.phone = 'Invalid phone number';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.course) e.course = 'Course is required';
    if (!form.enrollmentDate) e.enrollmentDate = 'Enrollment date is required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // scroll to top to see errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSubmitting(true);
    try {
      await studentApi.create(form);
      addToast('Student added successfully!', 'success');
      navigate('/students');
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        addToast(serverErrors.join(', '), 'error');
      } else {
        addToast('Failed to add student. Please try again.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const ErrorMsg = ({ msg }) => msg ? <p className="text-[12px] font-medium text-destructive mt-1.5">{msg}</p> : null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add New Student</h2>
          <p className="text-muted-foreground mt-1 text-sm bg-gradient-to-r from-primary/10 to-transparent p-2 rounded inline-block">Enroll a new student into the system</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4 border-b bg-muted/10">
              <CardTitle className="flex items-center text-lg gap-2">
                <User className="h-5 w-5 text-primary" /> Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Full Name <span className="text-destructive">*</span></label>
                  <Input name="fullName" value={form.fullName} onChange={handleChange} placeholder="First and Last name" className={errors.fullName ? 'border-destructive focus-visible:ring-destructive' : ''} />
                  <ErrorMsg msg={errors.fullName} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Age <span className="text-destructive">*</span></label>
                  <Input type="number" name="age" value={form.age} onChange={handleChange} placeholder="e.g. 21" className={errors.age ? 'border-destructive focus-visible:ring-destructive' : ''} />
                  <ErrorMsg msg={errors.age} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium leading-none">Gender <span className="text-destructive">*</span></label>
                  <select 
                    name="gender" 
                    value={form.gender} 
                    onChange={handleChange} 
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.gender ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  >
                    <option value="" disabled>Select a gender identifier</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <ErrorMsg msg={errors.gender} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 border-b bg-muted/10">
              <CardTitle className="flex items-center text-lg gap-2">
                <Mail className="h-5 w-5 text-amber-500" /> Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address <span className="text-destructive">*</span></label>
                  <Input type="email" name="email" value={form.email} onChange={handleChange} placeholder="student@example.edu" className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''} />
                  <ErrorMsg msg={errors.email} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number <span className="text-destructive">*</span></label>
                  <Input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className={errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''} />
                  <ErrorMsg msg={errors.phone} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Physical Address <span className="text-destructive">*</span></label>
                  <textarea 
                    name="address" 
                    value={form.address} 
                    onChange={handleChange} 
                    placeholder="Full street address, city, state, zip" 
                    rows={3}
                    className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y ${errors.address ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  <ErrorMsg msg={errors.address} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 border-b bg-muted/10">
              <CardTitle className="flex items-center text-lg gap-2">
                <BookOpen className="h-5 w-5 text-emerald-500" /> Academic Enrollment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Course Assignment <span className="text-destructive">*</span></label>
                  <select 
                    name="course" 
                    value={form.course} 
                    onChange={handleChange} 
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.course ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  >
                    <option value="" disabled>Assign to a course track</option>
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ErrorMsg msg={errors.course} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Enrollment Date <span className="text-destructive">*</span></label>
                  <Input type="date" name="enrollmentDate" value={form.enrollmentDate} onChange={handleChange} className={errors.enrollmentDate ? 'border-destructive focus-visible:ring-destructive' : ''} />
                  <ErrorMsg msg={errors.enrollmentDate} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4 p-4 rounded-lg bg-muted/30 border">
            <Button type="button" variant="ghost" onClick={() => setForm(initialForm)}>
              Reset Form
            </Button>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enrolling...</>
              ) : 'Complete Enrollment Registration'}
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default AddStudent;
