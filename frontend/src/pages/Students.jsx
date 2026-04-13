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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Students Roster</h2>
          <p className="text-muted-foreground mt-1 text-sm">{total} student{total !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/students/add">
          <Button><UserPlus className="mr-2 h-4 w-4" /> Add Student</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card border rounded-lg shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-9"
          />
          {search && (
            <button 
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              onClick={() => { setSearch(''); setCurrentPage(1); }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-[180px]">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <select
              className="flex h-10 w-full appearance-none rounded-md border border-input bg-background pl-9 pr-8 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              value={course}
              onChange={(e) => { setCourse(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Courses</option>
              {COURSES.slice(1).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <select
            className="flex h-10 w-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            value={year}
            onChange={(e) => { setYear(e.target.value); setCurrentPage(1); }}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y === 'all' ? 'All Years' : y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[400px] gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm font-medium">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No students found</h3>
            <p className="text-muted-foreground mb-6 mt-1">We couldn't find anyone matching your current search and filters.</p>
            <Button variant="outline" onClick={() => {setSearch(''); setCourse('all'); setYear('all');}}>Clear Filters</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium transition-colors hover:text-foreground cursor-pointer" onClick={() => handleSort('studentId')}>
                    <div className="flex items-center">ID <SortIcon field="studentId" /></div>
                  </th>
                  <th className="px-6 py-4 font-medium transition-colors hover:text-foreground cursor-pointer" onClick={() => handleSort('fullName')}>
                    <div className="flex items-center">Name <SortIcon field="fullName" /></div>
                  </th>
                  <th className="px-6 py-4 font-medium transition-colors hover:text-foreground cursor-pointer" onClick={() => handleSort('course')}>
                    <div className="flex items-center">Course <SortIcon field="course" /></div>
                  </th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium transition-colors hover:text-foreground cursor-pointer" onClick={() => handleSort('enrollmentDate')}>
                    <div className="flex items-center">Enrolled <SortIcon field="enrollmentDate" /></div>
                  </th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student) => (
                  <tr key={student._id} className="bg-card hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground">{student.studentId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-primary-foreground font-bold shadow-sm">
                          {student.fullName[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-card-foreground">{student.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="success">{student.course}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs space-y-1">
                        <span className="text-foreground">{student.email}</span>
                        <span className="text-muted-foreground">{student.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {new Date(student.enrollmentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/students/${student._id}`)} title="View Detail">
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/students/${student._id}/edit`)} title="Edit Student">
                          <Edit className="h-4 w-4 text-amber-500" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(student._id)} title="Delete Student">
                          <Trash2 className="h-4 w-4 text-red-500" />
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
