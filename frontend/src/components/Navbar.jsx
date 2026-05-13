import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Menu, Sun, Moon, Search, LogOut, Bell, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = ({ onMenuClick }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header
      className="sticky top-0 z-30 w-full border-b bg-background/70 backdrop-blur-xl border-border/60 transition-colors duration-300"
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 gap-4">

        {/* Left: Hamburger + Brand (mobile) + Search */}
        <div className="flex items-center gap-3 flex-1">
          <motion.button
            whileTap={{ scale: 0.92 }}
            className="inline-flex items-center justify-center rounded-xl p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 lg:hidden"
            onClick={onMenuClick}
            aria-label="Toggle Menu"
          >
            <Menu size={20} />
          </motion.button>

          {/* Mobile brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-violet shadow-glow-sm">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg gradient-text">StuManSys</span>
          </div>

          {/* Search bar */}
          <div className="hidden sm:flex relative w-72 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              id="navbar-search"
              placeholder="Search students, courses..."
              className="w-full h-9 rounded-xl border border-border/60 bg-muted/40 pl-9 pr-4 text-sm placeholder:text-muted-foreground/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 focus:bg-background"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-border/60 bg-muted px-1.5 text-[10px] font-mono text-muted-foreground">⌘K</kbd>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Notification bell */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            className="relative p-2 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 hidden sm:flex"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-background" />
          </motion.button>

          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92, rotate: 15 }}
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200"
            aria-label="Toggle dark mode"
          >
            <motion.div
              initial={false}
              animate={{ rotate: darkMode ? 0 : 180, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </motion.div>
          </motion.button>

          <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />

          {/* User avatar + logout */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold text-foreground leading-none">{user?.name}</span>
              <span className="text-[10px] text-muted-foreground capitalize mt-0.5">{user?.role}</span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-violet text-white font-bold text-sm shadow-glow-sm cursor-default select-none">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={logout}
              className="flex items-center gap-1.5 p-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
              aria-label="Logout"
            >
              <LogOut size={17} />
              <span className="hidden text-sm font-medium md:inline-block">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

