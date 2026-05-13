import { useState, useEffect } from 'react';
import { studentApi, gradesApi } from '../api/studentApi';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Award, Search, Loader2, Save } from 'lucide-react';

const COURSES = [
  'B.Sc B.Ed Computer Science',
  'B.Sc B.Ed Mathematics',
  'B.A B.Ed Hindi',
  'B.A B.Ed English',
  'B.A B.Ed Social Science'
];

const ResultsManagement = ({ addToast }) => {
  const [course, setCourse] = useState(COURSES[0]);
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState('Fall 2024');
  
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (subject.trim() === '') return;
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [course, semester, subject]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resStudents = await studentApi.getAll({ course, limit: 1000 });
      const currentStudents = resStudents.data.students;

      const resGrades = await gradesApi.getBatch(semester, subject);
      const existingGrades = resGrades.data || [];

      const marksMap = {};
      currentStudents.forEach(s => {
        const found = existingGrades.find(g => g.studentId === s.studentId);
        marksMap[s.studentId] = found ? found.grade : '';
      });

      setStudents(currentStudents);
      setMarks(marksMap);
    } catch (err) {
      addToast('Failed to load marks data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId, val) => {
    setMarks(prev => ({ ...prev, [studentId]: val }));
  };

  const handleSave = async () => {
    if (!subject || !semester) return addToast('Please specify Subject and Semester', 'error');
    setSaving(true);
    try {
      // Cleanest mapping payload dropping empties out
      const records = students
        .filter(s => marks[s.studentId] && marks[s.studentId].toString().trim() !== '')
        .map(s => ({
          studentId: s.studentId,
          grade: marks[s.studentId].toString()
        }));
      
      await gradesApi.saveBatch({ semester, subject, records });
      addToast('Results saved successfully', 'success');
    } catch (err) {
      addToast('Failed to save batch results', 'error');
    } finally {
      setSaving(false);
    }
  };

  const determineStatusBadge = (mark) => {
    if (!mark) return null;
    const numeric = parseFloat(mark);
    if (!isNaN(numeric)) {
      if (numeric >= 50) return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold ring-1 ring-emerald-300">PASS</span>;
      return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold ring-1 ring-red-300">FAIL</span>;
    }
    // Handling generic letter grades roughly
    const upper = mark.toString().toUpperCase();
    if (['A', 'A+', 'A-', 'B', 'B+', 'B-', 'C', 'C+', 'C-'].includes(upper)) {
        return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold ring-1 ring-emerald-300">PASS</span>;
    } else if (['D', 'E', 'F'].includes(upper)) {
        return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold ring-1 ring-red-300">FAIL</span>;
    }
    return <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs font-bold">LOGGED</span>;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Grade Management</h2>
          <p className="text-muted-foreground mt-1 text-sm bg-gradient-to-r from-emerald-500/10 to-transparent p-2 rounded inline-block">Evaluate class-level assignments and examinations</p>
        </div>
        <Button onClick={handleSave} disabled={saving || loading || students.length === 0 || subject.trim() === ''}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Publish Marks
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b bg-muted/10">
          <div className="flex flex-col xl:flex-row gap-4 justify-between w-full">
            <div className="space-y-1 my-auto shrink-0">
              <CardTitle className="flex items-center text-lg gap-2">
                <Award className="h-5 w-5 text-emerald-500" /> Assessment Criteria
              </CardTitle>
              <CardDescription>Lock in context to pull class array</CardDescription>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                className="flex h-10 w-full md:w-fit rounded-md border border-input bg-card text-card-foreground px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              >
                {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <Input
                placeholder="Semester (e.g. Fall 2024)"
                className="w-full md:w-[150px] bg-background"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              />
              <Input
                placeholder="Subject code or Name..."
                className="w-full md:w-[220px] bg-background"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {subject.trim() === '' ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Award className="h-8 w-8 text-muted-foreground mb-4 opacity-50" />
              <p>Type a Subject name above to unlock the grid.</p>
            </div>
          ) : loading ? (
             <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>Fetching class roster...</p>
             </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p>No students enrolled in this course track.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">Student ID</th>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Recorded Mark</th>
                    <th className="px-6 py-4 font-medium text-right w-32">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((student) => {
                    const mark = marks[student.studentId] || '';
                    return (
                      <tr key={student._id} className="bg-card hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground">{student.studentId}</span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap font-medium text-card-foreground">
                          {student.fullName}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                           <Input 
                             type="text"
                             className="h-9 w-32 font-bold focus:ring-emerald-500 border-muted-foreground/30 focus:border-emerald-500 transition-all dark:bg-background" 
                             placeholder="Score / Grade"
                             value={mark}
                             onChange={(e) => handleMarkChange(student.studentId, e.target.value)}
                           />
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-right h-full align-middle">
                           <div className="flex justify-end h-full items-center">
                              {determineStatusBadge(mark)}
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ResultsManagement;
