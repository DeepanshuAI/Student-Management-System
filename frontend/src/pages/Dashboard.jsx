import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentApi } from '../api/studentApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { 
  Users, BookOpen, UserPlus, Calendar,
  ArrowRight, Search, Activity, AlertCircle, Loader2
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await studentApi.getStats();
        setStats(res.data);
      } catch (err) {
        setError('Failed to load dashboard data. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground font-medium animate-pulse">Loading dashboard insights...</p>
    </div>
  );

  if (error) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <div className="rounded-full bg-destructive/10 p-4"><AlertCircle className="h-8 w-8 text-destructive" /></div>
      <h3 className="text-xl font-bold">Connection Error</h3>
      <p className="text-muted-foreground">{error}</p>
      <Button onClick={() => window.location.reload()} className="mt-2">Retry Connection</Button>
    </motion.div>
  );

  const topCourses = Object.entries(stats.byCourse || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topYears = Object.entries(stats.byYear || {}).sort((a, b) => b[0] - a[0]).slice(0, 4);
  const totalCourses = Object.keys(stats.byCourse || {}).length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1 text-sm">Welcome back! Here's an overview of your student metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/students"><Button variant="outline" className="hidden sm:inline-flex">View All</Button></Link>
          <Link to="/students/add"><Button><UserPlus className="h-4 w-4 mr-2" /> Add Student</Button></Link>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card animateHover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium leading-none tracking-tight">Total Students</p>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full"><Users className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>
            </div>
            <div className="flex items-baseline space-x-2">
              <h2 className="text-3xl font-bold tracking-tighter">{stats.total}</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">All enrolled students</p>
          </CardContent>
        </Card>
        
        <Card animateHover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium leading-none tracking-tight">Active Courses</p>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full"><BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" /></div>
            </div>
            <div className="flex items-baseline space-x-2">
              <h2 className="text-3xl font-bold tracking-tighter">{totalCourses}</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Unique departments</p>
          </CardContent>
        </Card>

        <Card animateHover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium leading-none tracking-tight">Present Today</p>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-full"><Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /></div>
            </div>
            <div className="flex items-baseline space-x-2">
              <h2 className="text-3xl font-bold tracking-tighter">{stats.presentToday || 0}</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Students marked present</p>
          </CardContent>
        </Card>

        <Card animateHover>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium leading-none tracking-tight">Current Year</p>
              <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full"><Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" /></div>
            </div>
            <div className="flex items-baseline space-x-2">
              <h2 className="text-3xl font-bold tracking-tighter">{stats.byYear?.[new Date().getFullYear()] || 0}</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Class of {new Date().getFullYear()}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Grid Data */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recents */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div className="space-y-1">
                <CardTitle>Recent Students</CardTitle>
                <CardDescription>The latest student enrollments in the system.</CardDescription>
              </div>
              <Link to="/students"><Button variant="ghost" size="sm" className="hidden sm:inline-flex">View all <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {stats.recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                  <p>No students available.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {stats.recent.map((s) => (
                    <div key={s._id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold shadow-sm">
                          {s.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{s.fullName}</span>
                          <span className="text-xs text-muted-foreground">{s.studentId} · {s.course}</span>
                        </div>
                      </div>
                      <Link to={`/students/${s._id}`}>
                        <Button variant="ghost" size="sm">Details</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Breakdown */}
        <motion.div variants={itemVariants} className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base">Students by Course</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {topCourses.map(([course, count]) => {
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={course} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{course}</span>
                      <span className="text-muted-foreground">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-primary" 
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base">Enrollment by Year</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {topYears.map(([yr, count]) => (
                <div key={yr} className="flex items-center gap-3">
                  <span className="flex items-center justify-center text-xs font-bold bg-accent text-accent-foreground px-2 py-1 rounded w-12">{yr}</span>
                  <div className="flex-1 h-2 overflow-hidden rounded-full bg-secondary">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((count / (stats.total || 1)) * 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-emerald-500" 
                    />
                  </div>
                  <span className="text-sm font-medium w-6 text-right text-muted-foreground">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
