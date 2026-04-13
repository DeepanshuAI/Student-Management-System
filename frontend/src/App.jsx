import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
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
import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './components/ui/button';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

const AppShell = ({ addToast }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login addToast={addToast} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0 transition-all duration-300">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          <Routes>
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
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh] text-center"
              >
                <div className="rounded-full bg-destructive/10 p-6 mb-6">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Page Not Found</h2>
                <p className="text-muted-foreground mb-8 max-w-md">The page you're looking for doesn't exist.</p>
                <Button onClick={() => window.history.back()}>Go Back</Button>
              </motion.div>
            } />
          </Routes>
        </main>
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
