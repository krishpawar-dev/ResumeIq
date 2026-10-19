import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Tag,
  FileEdit,
  Briefcase,
  Database,
  Flag,
  CreditCard,
  ArrowLeft,
  LogOut,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ADMIN_NAV = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Interview Questions', path: '/admin/questions', icon: MessageSquare },
  { name: 'Interview Categories', path: '/admin/interview-categories', icon: Tag },
  { name: 'Resume Templates', path: '/admin/resume-templates', icon: FileEdit },
  { name: 'Job Categories', path: '/admin/job-categories', icon: Briefcase },
  { name: 'Skill Database', path: '/admin/skills', icon: Database },
  { name: 'Reports', path: '/admin/reports', icon: Flag },
  { name: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
];

export default function AdminSidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 dark:bg-[#0a0f1a] border-r border-slate-700/60 select-none">
      {/* Admin Brand */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-700/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-600 to-slate-500 flex items-center justify-center shadow">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm text-white tracking-tight">ResumeIQ Admin</div>
            <div className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Management Console</div>
          </div>
        </div>
        {mobileOpen && (
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white lg:hidden cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Admin user badge */}
      <div className="px-4 py-3 border-b border-slate-700/40">
        <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-800/60">
          <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user?.name || 'Admin'}</div>
            <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
          </div>
          <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold uppercase">
            Admin
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[9px] font-bold uppercase tracking-widest text-slate-500">
          Platform Management
        </div>
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-700/80 text-white border-l-2 border-sky-500 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-slate-700/60 space-y-1 shrink-0">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Back to ResumeIQ</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <div className="absolute left-0 top-0 bottom-0 w-64 z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
