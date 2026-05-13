import { useState, useEffect } from 'react';
import { studentApi, attendanceApi } from '../api/studentApi';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CalendarCheck, Search, Loader2, Save } from 'lucide-react';

const COURSES = [
  'B.Sc B.Ed Computer Science',
  'B.Sc B.Ed Mathematics',
  'B.A B.Ed Hindi',
  'B.A B.Ed English',
  'B.A B.Ed Social Science'
];

const Attendance = ({ addToast }) => {
  const [course, setCourse] = useState(COURSES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [course, date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Students in the selected course (simulate no limits for class size)
      const resStudents = await studentApi.getAll({ course, limit: 1000 });
      const currentStudents = resStudents.data.students;
      
      // 2. Fetch existing attendance records
      const resAttendance = await attendanceApi.get(course, date);
      const records = resAttendance.data.records || [];

      // 3. Map status to quick dictionary
      const attendanceMap = {};
      currentStudents.forEach(s => {
        const existing = records.find(r => r.studentId === s.studentId);
        attendanceMap[s.studentId] = existing ? existing.status : 'Present'; // Default Present
      });

      setStudents(currentStudents);
      setAttendance(attendanceMap);
    } catch (err) {
      addToast('Failed to load attendance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = students.map(s => ({
        studentId: s.studentId,
        status: attendance[s.studentId]
      }));
      
      await attendanceApi.save({ course, date, records });
      addToast('Attendance records saved successfully', 'success');
    } catch (err) {
      addToast('Failed to save attendance', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Present') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    if (status === 'Absent') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
    if (status === 'Late') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    return '';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance Roll-Call</h2>
          <p className="text-muted-foreground mt-1 text-sm bg-gradient-to-r from-blue-500/10 to-transparent p-2 rounded inline-block">Manage daily class presence and absence records</p>
        </div>
        <Button onClick={handleSave} disabled={saving || loading || students.length === 0}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Attendance
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b bg-muted/10 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center text-lg gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" /> Filter Class
            </CardTitle>
            <CardDescription>Select a specific course track and date</CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="flex h-10 w-full sm:w-[250px] rounded-md border border-input bg-card text-card-foreground px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            >
              {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="date"
              className="flex h-10 w-full sm:w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
             <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>Loading roster...</p>
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
                    <th className="px-6 py-4 font-medium">Quick Mark</th>
                    <th className="px-6 py-4 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((student) => {
                    const status = attendance[student.studentId];
                    return (
                      <tr key={student._id} className="bg-card hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground">{student.studentId}</span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap font-medium text-card-foreground">
                          {student.fullName}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStatusChange(student.studentId, 'Present')}
                              className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${status === 'Present' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-transparent text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800'}`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleStatusChange(student.studentId, 'Late')}
                              className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${status === 'Late' ? 'bg-amber-500 text-white border-amber-600' : 'bg-transparent text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 border-amber-200 dark:border-amber-800'}`}
                            >
                              Late
                            </button>
                            <button
                              onClick={() => handleStatusChange(student.studentId, 'Absent')}
                              className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${status === 'Absent' ? 'bg-red-500 text-white border-red-600' : 'bg-transparent text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 border-red-200 dark:border-red-800'}`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-right">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(status)}`}>
                            {status}
                          </span>
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

export default Attendance;
