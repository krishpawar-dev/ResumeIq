import React, { useState } from 'react';
import { User, Shield, Moon, Sun, Key, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCopyId = () => {
    if (user?._id) {
      navigator.clipboard.writeText(user._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
          Account & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your authenticated identity, security credentials, and platform interface settings.
        </p>
      </div>

      {/* User Identity Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <User className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 m-0">
            Authenticated Profile
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center font-bold text-white text-2xl shadow-lg shadow-sky-500/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="flex-1 space-y-1">
            <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{user?.name || 'Authenticated User'}</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                {user?.role || 'Member'}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {user?.email}
            </div>
            <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-2">
              <span>User ID:</span>
              <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px]">
                {user?._id || 'local-session'}
              </code>
              <button
                onClick={handleCopyId}
                className="text-sky-600 dark:text-cyan-400 hover:underline text-[10px] cursor-pointer"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Theme & Display Preferences */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          {isDark ? (
            <Moon className="w-4 h-4 text-cyan-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 m-0">
            Display & Appearance
          </h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Color Theme Mode
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Toggle between refined neutral Light theme and executive graphite Dark theme.
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs transition"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Light Theme</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span>Dark Theme</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Security & Authentication */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <Shield className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 m-0">
            Security & Session
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                Password Protection
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                Encrypted with bcrypt (12 rounds of salt).
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Secured
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                JWT Authentication Token
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                Server-side validated on every API request.
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-cyan-400 font-medium">
              Active Session
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-semibold text-xs border border-rose-200 dark:border-rose-900/60 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out of ResumeIQ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
