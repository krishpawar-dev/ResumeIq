import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Mic,
  Zap,
  BarChart3,
  Sparkles
} from 'lucide-react';

export default function InterviewNavTabs() {
  const tabs = [
    {
      name: 'Full Mock Interview',
      path: '/interview',
      exact: true,
      icon: Mic,
      description: 'Comprehensive 30–60 min simulation'
    },
    {
      name: 'Practice Modes',
      path: '/interview/practice',
      icon: Zap,
      description: '5 focused practice variations'
    },
    {
      name: 'Interview Analytics',
      path: '/interview/analytics',
      icon: BarChart3,
      description: 'Performance & readiness intelligence'
    }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.exact}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-white dark:bg-[#0f172a] text-sky-700 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-slate-700/80'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{tab.name}</span>
          </NavLink>
        );
      })}
    </div>
  );
}
