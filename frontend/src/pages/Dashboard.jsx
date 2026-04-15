import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentApi } from '../api/studentApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { 
  Users, BookOpen, UserPlus, Calendar,
  ArrowRight, Activity, AlertCircle, Loader2, Sparkles, TrendingUp
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
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
        <div className="absolute inset-0 h-16 w-16 rounded-full blur-xl bg-violet-500/20" />
      </div>
      <p className="text-muted-foreground font-medium animate-pulse">Loading insights...</p>
    </div>
  );

  if (error) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <div className="rounded-2xl bg-destructive/10 p-5 shadow-glow-sm relative">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <h3 className="text-2xl font-display font-bold">Connection Error</h3>
      <p className="text-muted-foreground">{error}</p>
      <Button onClick={() => window.location.reload()} className="mt-2" variant="outline">Retry Connection</Button>
    </motion.div>
  );

  const topCourses = Object.entries(stats.byCourse || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topYears = Object.entries(stats.byYear || {}).sort((a, b) => b[0] - a[0]).slice(0, 4);
  const totalCourses = Object.keys(stats.byCourse || {}).length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-8">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-medium text-sm mb-1">
            <Sparkles size={16} /> Welcome back
          </div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-foreground">Overview Insights</h2>
          <p className="text-muted-foreground max-w-xl text-balance">Here's a comprehensive look at your institution's enrollments and daily activities.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/students">
            <Button variant="outline" className="hidden sm:inline-flex bg-background/50 backdrop-blur">View Directory</Button>
          </Link>
          <Link to="/students/add">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow">
              <UserPlus className="h-4 w-4 mr-2" /> Enroll Student
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="kpi-card p-6">
          <div className="flex items-center justify-between pb-4">
            <p className="text-sm font-semibold tracking-wide text-muted-foreground">TOTAL ENROLLED</p>
            <div className="p-2.5 bg-violet-500/10 dark:bg-violet-500/20 rounded-xl"><Users className="h-5 w-5 text-violet-600 dark:text-violet-400" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-display font-bold tracking-tighter text-foreground">{stats.total}</h2>
            <span className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded gap-1"><TrendingUp size={10} /> +12%</span>
          </div>
        </div>
        
        <div className="kpi-card p-6">
          <div className="flex items-center justify-between pb-4">
            <p className="text-sm font-semibold tracking-wide text-muted-foreground">ACTIVE COURSES</p>
            <div className="p-2.5 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl"><BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
          </div>
          <div>
            <h2 className="text-4xl font-display font-bold tracking-tighter text-foreground">{totalCourses}</h2>
          </div>
        </div>

        <div className="kpi-card p-6">
           <div className="flex items-center justify-between pb-4">
            <p className="text-sm font-semibold tracking-wide text-muted-foreground">PRESENT TODAY</p>
            <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl"><Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-display font-bold tracking-tighter text-foreground">{stats.presentToday || 0}</h2>
          </div>
        </div>

        <div className="kpi-card p-6 border-transparent bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative">
          <div className="absolute inset-0 bg-mesh-light dark:bg-mesh-dark opacity-50 mix-blend-overlay pointer-events-none" />
           <div className="relative flex items-center justify-between pb-4">
            <p className="text-sm font-semibold tracking-wide text-primary">CURRENT BATCH</p>
            <div className="p-2.5 bg-background/50 rounded-xl backdrop-blur-sm"><Calendar className="h-5 w-5 text-primary" /></div>
          </div>
          <div className="relative flex items-baseline gap-2">
            <h2 className="text-4xl font-display font-bold tracking-tighter text-foreground">{stats.byYear?.[new Date().getFullYear()] || 0}</h2>
            <p className="text-xs text-primary font-medium">Class of {new Date().getFullYear()}</p>
          </div>
        </div>
      </motion.div>

      {/* Main Grid Data */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recents */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-card shadow-soft h-full flex flex-col border-none overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20 pb-4 px-6 pt-6">
              <div className="space-y-1">
                <CardTitle className="font-display text-xl">Recent Enrollments</CardTitle>
                <CardDescription>Latest students joined the institution.</CardDescription>
              </div>
              <Link to="/students"><Button variant="ghost" size="sm" className="hidden sm:inline-flex text-primary hover:bg-primary/10">View all <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {stats.recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                  <p>No students available.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {stats.recent.map((s, i) => (
                    <motion.div 
                      key={s._id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 + 0.3 }}
                      className="flex items-center justify-between p-4 px-6 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-violet text-white font-bold shadow-glow-sm">
                          {s.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">{s.fullName}</span>
                          <span className="text-xs text-muted-foreground font-medium mt-0.5">{s.studentId} <span className="mx-1.5 opacity-50">•</span> <span className="text-primary/80">{s.course}</span></span>
                        </div>
                      </div>
                      <Link to={`/students/${s._id}`}>
                        <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/10 hover:text-primary transition-all">Details</Button>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Breakdown */}
        <motion.div variants={itemVariants} className="space-y-6">
          <Card className="glass-card shadow-soft border-none overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20 px-5 pt-5">
              <CardTitle className="font-display text-lg">Top Courses</CardTitle>
            </CardHeader>
            <CardContent className="pt-5 px-5 space-y-5">
              {topCourses.map(([course, count]) => {
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={course} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-foreground">{course}</span>
                      <span className="text-muted-foreground font-mono">{count} <span className="text-xs ml-1 opacity-70">({pct}%)</span></span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary/80 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                        className="h-full bg-gradient-violet" 
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="glass-card shadow-soft border-none overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20 px-5 pt-5">
              <CardTitle className="font-display text-lg">Enrollment Timeline</CardTitle>
            </CardHeader>
            <CardContent className="pt-5 px-5 space-y-4">
              {topYears.map(([yr, count]) => {
                const max = Math.max(...topYears.map(y => y[1]));
                const pct = Math.round((count / (max || 1)) * 100);
                return (
                  <div key={yr} className="flex items-center gap-3">
                    <span className="flex items-center justify-center text-xs font-bold text-foreground w-12">{yr}</span>
                    <div className="flex-1 h-2 overflow-hidden rounded-full bg-secondary/80">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                        className="h-full bg-emerald-500" 
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground w-8 text-right font-mono">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;

