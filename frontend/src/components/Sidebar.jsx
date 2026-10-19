import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Target,
  Mic,
  Zap,
  BarChart3,
  Compass,
  Briefcase,
  FileEdit,
  Settings,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Resumes', path: '/resumes', icon: FileText },
  { name: 'Job Matching', path: '/job-matching', icon: Target },
  { name: 'Interview Prep', path: '/interview', icon: Mic },
  { name: 'Practice Modes', path: '/interview/practice', icon: Zap },
  { name: 'Analytics', path: '/interview/analytics', icon: BarChart3 },
  { name: 'Career GPS', path: '/career-gps', icon: Compass },
  { name: 'Applications', path: '/applications', icon: Briefcase },
  { name: 'Resume Builder', path: '/resume-builder', icon: FileEdit },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user } = useAuth();

  const navContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0b1120] border-r border-slate-200 dark:border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
        <NavLink to="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-sky-500 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            IQ
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Resume<span className="text-sky-600 dark:text-cyan-400">IQ</span></span>
            </div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400">
              Career Intelligence
            </div>
          </div>
        </NavLink>

        {mobileOpen && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Platform Modules
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-50 text-sky-800 font-semibold border-l-3 border-sky-600 dark:bg-slate-800/80 dark:text-cyan-400 dark:border-cyan-400 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-bold transition-all mt-3 border ${
                isActive
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/40 shadow-sm'
                  : 'text-amber-600 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 hover:bg-amber-100 dark:hover:bg-amber-950/40'
              }`
            }
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Admin Console</span>
          </NavLink>
        )}
      </div>

      {/* Intelligence Pipeline Badge */}
      <div className="p-4 m-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
          <span className="text-xs font-semibold text-slate-900 dark:text-white">AI Continuity</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          Resume &rarr; Job &rarr; Gaps &rarr; Interview connected across all modules.
        </p>
      </div>

      {/* Bottom Profile Summary */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-semibold text-xs text-slate-700 dark:text-slate-300 shrink-0">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
            {user?.name || 'Authenticated User'}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
            {user?.email || 'user@resumeiq.io'}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
