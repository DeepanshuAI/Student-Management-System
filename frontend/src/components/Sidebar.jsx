import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, UserPlus, GraduationCap, CalendarCheck, FileSpreadsheet, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher'], color: 'text-violet-500' },
    { path: '/students', label: 'Directory', icon: Users, roles: ['admin', 'teacher'], color: 'text-blue-500' },
    { path: '/attendance', label: 'Attendance', icon: CalendarCheck, roles: ['admin', 'teacher'], color: 'text-emerald-500' },
    { path: '/results', label: 'Marks & Results', icon: FileSpreadsheet, roles: ['admin', 'teacher'], color: 'text-amber-500' },
    { path: '/students/add', label: 'Add Student', icon: UserPlus, roles: ['admin'], color: 'text-rose-500' },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user?.role));

  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        variants={sidebarVariants}
        animate={isOpen ? 'open' : 'closed'}
        className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-bg))] shadow-glass dark:shadow-glass-dark lg:static lg:translate-x-0 lg:flex"
        style={{ translateX: undefined }}  
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-border/50">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-violet shadow-glow-sm">
              <GraduationCap size={18} className="text-white" />
              <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[hsl(var(--sidebar-bg))]" />
            </div>
            <div>
              <span className="font-display font-bold text-lg leading-none gradient-text block">StuManSys</span>
              <span className="text-[10px] text-muted-foreground font-medium">Management Portal</span>
            </div>
          </motion.div>

          <button
            className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Navigation
          </p>

          {filteredItems.map(({ path, label, icon: Icon, color }, index) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
            >
              {({ isActive }) => (
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                  whileHover={{ x: isActive ? 0 : 3 }}
                  whileTap={{ scale: 0.97 }}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-primary/10 text-primary shadow-glow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {/* Active bar */}
                  {isActive && (
                    <motion.div
                      layoutId="activeBar"
                      className="absolute left-0 w-0.5 h-6 bg-primary rounded-r-full"
                      style={{ marginLeft: '-0.75rem' }}
                    />
                  )}
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${
                    isActive ? 'bg-primary/15' : 'bg-muted/60 group-hover:bg-muted'
                  }`}>
                    <Icon size={15} className={isActive ? 'text-primary' : color} />
                  </div>
                  <span className="flex-1">{label}</span>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-1.5 w-1.5 rounded-full bg-primary"
                    />
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer user card */}
        <div className="p-3 border-t border-border/50">
          <div className="relative overflow-hidden flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent border border-primary/10">
            {/* Decorative blur blob */}
            <div className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-primary/20 blur-xl pointer-events-none" />

            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-violet text-white font-bold text-sm shadow-glow-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                <Sparkles size={9} className="text-violet-400" />
                {user?.role}
              </p>
            </div>
          </div>
          <p className="mt-2 text-center text-[10px] font-mono text-muted-foreground/40">v2.1.0 · Secured</p>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;

