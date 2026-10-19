import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, LogOut, Settings, User as UserIcon, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ROUTE_NAMES = {
  '/dashboard': 'Dashboard',
  '/resumes': 'Resume Intelligence',
  '/job-matching': 'Job Matching',
  '/job-matching/history': 'Match Archive',
  '/interview-prep': 'Interview Prep',
  '/career-gps': 'Career GPS',
  '/resume-builder': 'Resume Builder',
  '/settings': 'Account Settings'
};

export default function TopBar({ onOpenMobileMenu }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentPageTitle =
    ROUTE_NAMES[location.pathname] ||
    (location.pathname.startsWith('/resumes/')
      ? 'ATS Diagnostic'
      : location.pathname.startsWith('/job-matching/history/')
      ? 'Role Fit Diagnostic'
      : 'Overview');

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="h-full px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu Trigger + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 lg:hidden"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-sm">
            <span className="hidden sm:inline text-slate-600 dark:text-slate-300 font-medium">ResumeIQ</span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">/</span>
            <h1 className="font-semibold text-slate-900 dark:text-white text-base tracking-tight m-0">
              {currentPageTitle}
            </h1>
          </div>
        </div>

        {/* Right Section: Theme Toggle + User Profile */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left"
              aria-expanded={dropdownOpen}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                  {user?.name || 'My Account'}
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-300 capitalize">
                  {user?.role || 'User'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {user?.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.email}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                      <Shield className="w-2.5 h-2.5" />
                      {user?.role || 'Member'}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Admin Console
                    </Link>
                  )}
                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    Account Settings
                  </Link>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
