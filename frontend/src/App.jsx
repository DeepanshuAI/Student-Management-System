import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './components/ui/button';
import bgImage from './assets/tgce-port-blair.jpg';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.2, ease: 'easeIn' } },
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 h-12 w-12 rounded-full blur-md bg-primary/20" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

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
          <Route path="/" element={<Dashboard addToast={addToast} />} />
          <Route path="/students" element={<Students addToast={addToast} />} />
          <Route path="/students/:id" element={<StudentDetail addToast={addToast} />} />
          <Route path="/attendance" element={<Attendance addToast={addToast} />} />
          <Route path="/results" element={<ResultsManagement addToast={addToast} />} />

          {/* Admin Only Routes */}
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
              <p className="text-muted-foreground mb-8 max-w-sm text-balance">The page you're looking for doesn't exist or has been moved.</p>
              <Button onClick={() => window.history.back()} className="gap-2">← Go Back</Button>
            </motion.div>
          } />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const AppShell = ({ addToast }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { darkMode } = useTheme();

  // Always treat the app as "dark" over the image so text/icons are light
  const isDark = true;

  if (!user) {
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
        {/* Overlay — deep navy-purple tint so image is visible but text is readable */}
        <div
          className="min-h-screen"
          style={{
            background: darkMode
              ? 'rgba(6, 4, 18, 0.68)'
              : 'rgba(12, 8, 40, 0.58)',
          }}
        >
          <Routes>
            <Route path="/login" element={<Login addToast={addToast} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    );
  }

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
      {/* Dark semi-transparent overlay — image stays visible, text stays light */}
      <div
        className="flex w-full min-h-screen"
        style={{
          background: darkMode
            ? 'rgba(6, 4, 18, 0.72)'
            : 'rgba(12, 8, 40, 0.62)',
        }}
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

