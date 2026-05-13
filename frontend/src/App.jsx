import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import AddStudent from './pages/AddStudent';
import StudentDetail from './pages/StudentDetail';
import EditStudent from './pages/EditStudent';
import Login from './pages/Login';
import Attendance from './pages/Attendance';
import ResultsManagement from './pages/ResultsManagement';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Button } from './components/ui/button';
import bgImage from './assets/tgce-port-blair.jpg';

// ── Page transition variants ─────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.2, ease: 'easeIn' } },
};

// ── Full-screen spinner while auth state is restoring ────────────────────────
const AuthLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-black/80">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="h-14 w-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute inset-0 h-14 w-14 rounded-full blur-lg bg-primary/20" />
      </div>
      <p className="text-sm font-medium text-white/60 animate-pulse tracking-wide">
        Restoring your session…
      </p>
    </div>
  </div>
);

// ── ProtectedRoute: Requires auth, optionally requires specific roles ─────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Show spinner while the token is being verified against the backend
  if (loading) return <AuthLoader />;

  // Not authenticated → go to login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Authenticated but wrong role → go to dashboard root
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

// ── PublicRoute: Authenticated users should not see the login page ────────────
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <AuthLoader />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

// ── Animated page routes (all protected) ─────────────────────────────────────
const AnimatedRoutes = ({ addToast }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex-1 overflow-x-hidden"
      >
        <Routes location={location}>
          {/* All dashboard routes are inside ProtectedRoute */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/students" element={
            <ProtectedRoute>
              <Students addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/students/:id" element={
            <ProtectedRoute>
              <StudentDetail addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/attendance" element={
            <ProtectedRoute>
              <Attendance addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute>
              <ResultsManagement addToast={addToast} />
            </ProtectedRoute>
          } />

          {/* Admin-only routes */}
          <Route path="/students/add" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AddStudent addToast={addToast} />
            </ProtectedRoute>
          } />
          <Route path="/students/:id/edit" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EditStudent addToast={addToast} />
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4"
            >
              <div className="relative mb-6">
                <div className="rounded-2xl bg-destructive/10 p-6">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
                <div className="absolute -inset-2 rounded-2xl bg-destructive/5 blur-xl -z-10" />
              </div>
              <h2 className="text-3xl font-display font-bold tracking-tight mb-2">Page Not Found</h2>
              <p className="text-muted-foreground mb-8 max-w-sm text-balance">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <Button onClick={() => window.history.back()} className="gap-2">← Go Back</Button>
            </motion.div>
          } />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

// ── AppShell: Renders login shell or dashboard shell depending on auth ─────────
const AppShell = ({ addToast }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Listen for session-expired events from the auth system
  useEffect(() => {
    const handleExpired = () => {
      addToast('Your session has expired. Please sign in again.', 'error');
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:session_expired', handleExpired);
    return () => window.removeEventListener('auth:session_expired', handleExpired);
  }, [addToast, navigate]);

  // While restoring session, show full-screen loader (prevents flicker to login)
  if (loading) return <AuthLoader />;

  // ── Unauthenticated shell: login page only ──────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div
        className="dark min-h-screen"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div
          className="min-h-screen"
          style={{ background: darkMode ? 'rgba(6, 4, 18, 0.68)' : 'rgba(12, 8, 40, 0.58)' }}
        >
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Login addToast={addToast} />
              </PublicRoute>
            } />
            {/* Redirect everything else to login when not authenticated */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    );
  }

  // ── Authenticated shell: full dashboard layout ──────────────────────────────
  return (
    <div
      className="dark flex min-h-screen font-sans text-foreground"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div
        className="flex w-full min-h-screen"
        style={{ background: darkMode ? 'rgba(6, 4, 18, 0.72)' : 'rgba(12, 8, 40, 0.62)' }}
      >
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col min-w-0">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
            <AnimatedRoutes addToast={addToast} />
          </main>
        </div>
      </div>
    </div>
  );
};

// ── Root App ─────────────────────────────────────────────────────────────────
const App = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppShell addToast={addToast} />
          <Toast toasts={toasts} removeToast={removeToast} />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
