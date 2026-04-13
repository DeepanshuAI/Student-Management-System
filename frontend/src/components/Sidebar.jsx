import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, UserPlus, GraduationCap, CalendarCheck, FileSpreadsheet, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher'] },
    { path: '/students', label: 'Directory', icon: Users, roles: ['admin', 'teacher'] },
    { path: '/attendance', label: 'Attendance', icon: CalendarCheck, roles: ['admin', 'teacher'] },
    { path: '/results', label: 'Marks/Results', icon: FileSpreadsheet, roles: ['admin', 'teacher'] },
    { path: '/students/add', label: 'Add Student', icon: UserPlus, roles: ['admin'] },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card shadow-lg lg:static lg:flex lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}
      >
        <div className="flex h-16 items-center px-6 border-b">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-3 font-bold"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap size={20} />
            </div>
            <span className="text-xl tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              StuManSys
            </span>
          </motion.div>
          
          <button 
            className="ml-auto rounded-md p-1 hover:bg-muted lg:hidden" 
            onClick={onClose}
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navItems
            .filter(item => item.roles.includes(user?.role))
            .map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={() => { if (window.innerWidth < 1024) onClose() }}
            >
              {({ isActive }) => (
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
                  {label}
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-2 mb-2 p-2 bg-muted/50 rounded-lg">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-[10px]">
              {user?.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-foreground">{user?.name}</p>
              <p className="text-[10px] capitalize">{user?.role}</p>
            </div>
          </div>
          <p className="mt-1 font-mono pl-2">v2.1.0 Secured</p>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
