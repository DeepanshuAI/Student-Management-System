import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { studentApi, gradesApi } from '../api/studentApi';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, Edit, User, Mail, MapPin, Phone, 
  BookOpen, Calendar, Clock, Loader2, FileText, Upload, PlusCircle, Trash2, Award
} from 'lucide-react';

const StudentDetail = ({ addToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Grade Form State
  const [newGrade, setNewGrade] = useState({ subject: '', grade: '', semester: '' });
  const [addingGrade, setAddingGrade] = useState(false);

  // File Upload State
  const [docFile, setDocFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [studentRes, gradesRes] = await Promise.all([
        studentApi.getById(id),
        gradesApi.getForStudent(id)
      ]);
      setStudent(studentRes.data);
      setGrades(gradesRes.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      addToast('Student not found or access denied', 'error');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!newGrade.subject || !newGrade.grade || !newGrade.semester) {
      return addToast('Subject, grade, and semester are required', 'error');
    }
    setAddingGrade(true);
    try {
      const res = await gradesApi.addGrade(id, newGrade);
      setGrades([res.data, ...grades]);
      setNewGrade({ subject: '', grade: '', semester: '' });
      addToast('Grade successfully recorded', 'success');
    } catch (err) {
      addToast('Failed to add grade', 'error');
    } finally {
      setAddingGrade(false);
    }
  };

  const handleDeleteGrade = async (gradeId) => {
    try {
      await gradesApi.deleteGrade(gradeId);
      setGrades(grades.filter(g => g._id !== gradeId));
      addToast('Grade deleted', 'success');
    } catch (err) {
      addToast('Failed to delete grade. Only admins can delete grades.', 'error');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!docFile) return addToast('Please select a file first', 'error');
    
    setUploading(true);
    const formData = new FormData();
    formData.append('document', docFile);

    try {
      await studentApi.uploadDocument(id, formData);
      const updatedProfile = await studentApi.getById(id);
      setStudent(updatedProfile.data);
      setDocFile(null);
      // Reset file input
      document.getElementById('file-upload-input').value = '';
      addToast('Document successfully uploaded', 'success');
    } catch (err) {
      addToast('Failed to upload document. Must be an administrator.', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground font-medium animate-pulse">Loading profile...</p>
    </div>
  );

  if (!student) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/students')} className="-ml-4 text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Directory
        </Button>
        {user?.role === 'admin' && (
          <Link to={`/students/${id}/edit`}>
            <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
          </Link>
        )}
      </div>

      {/* Hero Profile Card */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-card to-muted/30">
        <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white shadow-xl ring-4 ring-background">
            <span className="text-4xl font-bold">{student.fullName[0].toUpperCase()}</span>
          </div>
          <div className="space-y-3 flex-1">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">{student.fullName}</h2>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mt-2">
                <span className="font-mono text-sm px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md font-medium">ID: {student.studentId}</span>
                <Badge variant="success" className="text-sm px-3 py-1">{student.course}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Info */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Profile Info</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">Age</div>
                <div className="font-medium text-right">{student.age} y/o</div>
                <div className="text-muted-foreground">Gender</div>
                <div className="font-medium text-right">{student.gender}</div>
                <div className="text-muted-foreground">Enrolled</div>
                <div className="font-medium text-right">{new Date(student.enrollmentDate).toLocaleDateString()}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4 text-amber-500" /> Contact</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{student.phone}</span>
                </div>
                <div className="flex items-center justify-between break-all">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{student.email}</span>
                </div>
                <div className="flex items-start justify-between gap-2 border-t pt-2 mt-2">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="font-medium text-right text-xs leading-relaxed">{student.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Dynamic Data (Transcripts & Documents) */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Grade Management */}
          <Card>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="flex items-center text-lg gap-2">
                <Award className="h-5 w-5 text-emerald-500" /> Academic Transcript
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Add Grade Form */}
              <div className="p-4 bg-muted/20 border-b">
                <form onSubmit={handleGradeSubmit} className="flex flex-col sm:flex-row gap-2">
                  <Input placeholder="Semester (e.g. Fall 2024)" className="h-9 text-xs" value={newGrade.semester} onChange={e => setNewGrade({...newGrade, semester: e.target.value})} />
                  <Input placeholder="Subject" className="h-9 text-xs" value={newGrade.subject} onChange={e => setNewGrade({...newGrade, subject: e.target.value})} />
                  <Input placeholder="Grade Rating (A+, 95)" className="h-9 text-xs" value={newGrade.grade} onChange={e => setNewGrade({...newGrade, grade: e.target.value})} />
                  <Button type="submit" size="sm" disabled={addingGrade}>
                    {addingGrade ? <Loader2 className="h-4 w-4 animate-spin" /> : <><PlusCircle className="h-4 w-4 mr-1" /> Add</>}
                  </Button>
                </form>
              </div>

              {/* Grades Table */}
              {grades.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No grades recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                      <tr>
                        <th className="px-4 py-3 font-medium">Semester</th>
                        <th className="px-4 py-3 font-medium">Subject</th>
                        <th className="px-4 py-3 font-medium">Grade</th>
                        {user?.role === 'admin' && <th className="px-4 py-3 font-medium"></th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {grades.map(g => (
                        <tr key={g._id} className="hover:bg-muted/10">
                          <td className="px-4 py-3">{g.semester}</td>
                          <td className="px-4 py-3 font-medium">{g.subject}</td>
                          <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">{g.grade}</td>
                          {user?.role === 'admin' && (
                            <td className="px-4 py-3 text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteGrade(g._id)} className="h-7 w-7 text-destructive/70 hover:text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Uploads */}
          <Card>
            <CardHeader className="pb-4 border-b flex flex-row items-center justify-between">
              <CardTitle className="flex items-center text-lg gap-2">
                <FileText className="h-5 w-5 text-indigo-500" /> Documents Vault
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Document upload is Admin Only primarily, but UI can show for both if the API allows it. We'll enforce Admin Only here. */}
              {user?.role === 'admin' && (
                <div className="p-4 bg-muted/20 border-b">
                  <form onSubmit={handleFileUpload} className="flex gap-2 items-center">
                    <Input id="file-upload-input" type="file" onChange={e => setDocFile(e.target.files[0])} className="text-xs file:h-full cursor-pointer h-9 w-full" />
                    <Button type="submit" size="sm" disabled={uploading}>
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4 mr-1" /> Upload</>}
                    </Button>
                  </form>
                </div>
              )}

              {/* Document List */}
              {(!student.documents || student.documents.length === 0) ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No documents attached to this profile.</div>
              ) : (
                <ul className="divide-y divide-border px-4 py-2">
                  {student.documents.map(doc => (
                    <li key={doc._id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-medium truncate">{doc.name}</span>
                          <span className="text-xs text-muted-foreground">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <a href={`http://localhost:5000${doc.path}`} target="_blank" rel="noreferrer">
                         <Button variant="outline" size="sm" className="h-7 text-xs">View Original</Button>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </motion.div>
  );
};

export default StudentDetail;
