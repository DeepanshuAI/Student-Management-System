import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentApi } from '../api/studentApi';
import ConfirmDialog from '../components/ConfirmDialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Search, ArrowUpDown, ChevronUp, ChevronDown, 
  Eye, Edit, Trash2, UserPlus, Filter, X, Loader2 
} from 'lucide-react';

const COURSES = [
  'All Courses',
  'B.Sc B.Ed Computer Science',
  'B.Sc B.Ed Mathematics',
  'B.A B.Ed Hindi',
  'B.A B.Ed English',
  'B.A B.Ed Social Science'
];

const Students = ({ addToast }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('all');
  const [year, setYear] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchStudents();
  }, [debouncedSearch, course, year, sortBy, sortOrder, currentPage]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 10, sortBy, sortOrder };
      if (debouncedSearch) params.search = debouncedSearch;
      if (course !== 'all') params.course = course;
      if (year !== 'all') params.year = year;

      const res = await studentApi.getAll(params);
      setStudents(res.data.students);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      addToast('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    try {
      await studentApi.delete(deleteTarget);
      addToast('Student deleted successfully', 'success');
      setDeleteTarget(null);
      fetchStudents();
    } catch (err) {
      addToast('Failed to delete student', 'error');
      setDeleteTarget(null);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ArrowUpDown size={14} className="ml-1 text-muted-foreground/50" />;
    return sortOrder === 'asc' ? <ChevronUp size={14} className="ml-1 text-primary" /> : <ChevronDown size={14} className="ml-1 text-primary" />;
  };

  const years = ['all', ...Array.from({ length: 6 }, (_, i) => (new Date().getFullYear() - i).toString())];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
        <div className="space-y-1">
          <h2 className="text-4xl font-display font-bold tracking-tight text-foreground">Students Roster</h2>
          <p className="text-muted-foreground mt-1 text-sm font-medium">{total} student{total !== 1 ? 's' : ''} total in the system</p>
        </div>
        <Link to="/students/add">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"><UserPlus className="mr-2 h-4 w-4" /> Add Student</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 glass-card rounded-2xl shadow-soft">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name, ID or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-10 h-11 bg-muted/30 border-border/60 hover:bg-muted/50 rounded-xl transition-all focus-visible:ring-primary/40 focus-visible:border-primary focus-visible:bg-background"
          />
          {search && (
            <button 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-muted p-1 rounded-full transition-colors"
              onClick={() => { setSearch(''); setCurrentPage(1); }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-[180px]">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary pointer-events-none" />
            <select
              className="flex h-11 w-full appearance-none rounded-xl border border-border/60 bg-card text-card-foreground hover:bg-muted pl-10 pr-8 py-2 text-sm ring-offset-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium"
              value={course}
              onChange={(e) => { setCourse(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Courses</option>
              {COURSES.slice(1).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          <div className="relative">
            <select
              className="flex h-11 w-[130px] appearance-none rounded-xl border border-border/60 bg-card text-card-foreground hover:bg-muted px-4 pr-8 py-2 text-sm ring-offset-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium"
              value={year}
              onChange={(e) => { setYear(e.target.value); setCurrentPage(1); }}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y === 'all' ? 'All Years' : y}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl shadow-soft overflow-hidden border-border/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[400px] gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 h-12 w-12 rounded-full blur-md bg-primary/20" />
            </div>
            <p className="text-muted-foreground text-sm font-medium animate-pulse">Loading directory...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-4 shadow-glow-sm">
              <Search className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-display font-bold">No students found</h3>
            <p className="text-muted-foreground mb-6 mt-2 max-w-sm">We couldn't find anyone matching your current search and filters.</p>
            <Button variant="outline" className="border-border/60 hover:bg-muted/50" onClick={() => {setSearch(''); setCourse('all'); setYear('all');}}>Clear Filtering</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider transition-colors hover:text-primary cursor-pointer select-none" onClick={() => handleSort('studentId')}>
                    <div className="flex items-center">ID <SortIcon field="studentId" /></div>
                  </th>
                  <th className="px-6 py-4 font-semibold tracking-wider transition-colors hover:text-primary cursor-pointer select-none" onClick={() => handleSort('fullName')}>
                    <div className="flex items-center">Student Name <SortIcon field="fullName" /></div>
                  </th>
                  <th className="px-6 py-4 font-semibold tracking-wider transition-colors hover:text-primary cursor-pointer select-none" onClick={() => handleSort('course')}>
                    <div className="flex items-center">Course Program <SortIcon field="course" /></div>
                  </th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Contact Info</th>
                  <th className="px-6 py-4 font-semibold tracking-wider transition-colors hover:text-primary cursor-pointer select-none" onClick={() => handleSort('enrollmentDate')}>
                    <div className="flex items-center">Enrolled <SortIcon field="enrollmentDate" /></div>
                  </th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {students.map((student) => (
                  <tr key={student._id} className="bg-transparent hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-secondary/50 text-secondary-foreground border border-border/50">{student.studentId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-violet text-white font-bold shadow-glow-sm">
                          {student.fullName[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">{student.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">{student.course}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-foreground font-medium">{student.email}</span>
                        <span className="text-muted-foreground text-xs">{student.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground font-medium">
                      {new Date(student.enrollmentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-muted-foreground">
                      <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:text-blue-500 hover:bg-blue-500/10" onClick={() => navigate(`/students/${student._id}`)} title="View Detail">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:text-amber-500 hover:bg-amber-500/10" onClick={() => navigate(`/students/${student._id}/edit`)} title="Edit Student">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:text-red-500 hover:bg-red-500/10" onClick={() => setDeleteTarget(student._id)} title="Delete Student">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/20">
            <p className="text-sm text-muted-foreground hidden sm:block">
              Showing page <span className="font-medium text-foreground">{currentPage}</span> of <span className="font-medium text-foreground">{totalPages}</span>
            </p>
            <div className="flex gap-1 ml-auto">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                Previous
              </Button>
              <div className="hidden sm:flex gap-1 mx-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <Button 
                    key={p} 
                    variant={p === currentPage ? "default" : "outline"}
                    size="sm"
                    className="w-9"
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Student Record"
        message="Are you absolutely sure you want to permanently delete this student from the database? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  );
};

export default Students;
