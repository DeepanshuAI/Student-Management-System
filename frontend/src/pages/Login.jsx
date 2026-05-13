import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { GraduationCap, Loader2, Lock } from 'lucide-react';

const Login = ({ addToast }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return addToast('Please enter both email and password', 'error');

    setLoading(true);
    try {
      await login({ email, password });
      addToast('Login successful!', 'success');
      navigate('/');
    } catch (err) {
      if (!err.response) {
        // Network error — backend unreachable or CORS
        addToast(`Network error: Cannot reach server. Please try again in a moment.`, 'error');
      } else {
        addToast(err.response?.data?.message || 'Invalid email or password', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden rounded-2xl shadow-2xl glass-card transition-colors duration-300"
      >
        <div
          className="p-8 pb-6 border-b text-center relative overflow-hidden border-border/40"
        >
          <div className="absolute top-0 right-0 p-16 rotate-45 bg-primary/10 rounded-full blur-3xl -mx-10 -my-10 z-0"></div>
          <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-lg mb-4">
            <GraduationCap size={32} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground drop-shadow-sm">StuManSys</h2>
          <p className="text-sm mt-1 text-foreground/70">
            TGCE Port Blair — Student Management System
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-8 pt-6 space-y-5 relative">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/90">Email Address</label>
            <Input
              type="email"
              placeholder="admin@stuman.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background/80"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/90">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background/80"
            />
          </div>

          <Button type="submit" className="w-full h-11 text-base mt-2" disabled={loading}>
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Lock className="mr-2 h-4 w-4" /> Secure Sign In</>}
          </Button>

          <div className="text-center text-xs mt-6 space-y-1 text-muted-foreground">
            <p>Admin: admin@stuman.com / password123</p>
            <p>Teacher: teacher@stuman.com / password123</p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
