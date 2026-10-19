import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, LayoutTemplate, Sparkles, Shield, Cpu, Award } from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';

export default function Step1Template() {
  const { templateId, setTemplate } = useBuilder();
  const navigate = useNavigate();

  const templates = [
    {
      id: 'classic',
      name: 'Classic Professional',
      badge: 'Most Popular',
      icon: Award,
      description: 'Traditional standard layout with balanced serif hierarchy, centered header, and elegant horizontal dividers. Universally trusted by Fortune 500 ATS parsers.',
      bestFor: 'Corporate, Finance, Consulting, Legal, and General Management roles.'
    },
    {
      id: 'modern',
      name: 'Modern Minimal',
      badge: 'Design Forward',
      icon: LayoutTemplate,
      description: 'Contemporary clean lines with a subtle left-accent border, sleek sans-serif typography, and pill skill tags. Clean, airy, and distraction-free.',
      bestFor: 'Tech Startups, Product Designers, Marketing, and Operations.'
    },
    {
      id: 'executive',
      name: 'Executive Leadership',
      badge: 'C-Suite Ready',
      icon: Shield,
      description: 'Sophisticated charcoal header band with white typography, prominent executive core-value statement, and high-impact deliverable callouts.',
      bestFor: 'Directors, VPs, Engineering Managers, and Senior Executives.'
    },
    {
      id: 'technical',
      name: 'Technical Architecture',
      badge: 'Developer Choice',
      icon: Cpu,
      description: 'Monospace accent touches, dedicated core technical stack taxonomy box, and impact-driven project outcome highlights.',
      bestFor: 'Full Stack Engineers, DevOps, Data Scientists, and Cloud Architects.'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
          Choose Your ATS-Optimized Template
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Every ResumeIQ template is engineered strictly against ATS parsing standards. No multi-column parsing traps, no unreadable graphics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tpl) => {
          const isSelected = templateId === tpl.id;
          const Icon = tpl.icon;
          return (
            <div
              key={tpl.id}
              onClick={() => setTemplate(tpl.id)}
              className={`relative rounded-3xl p-6 sm:p-7 border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-5 ${
                isSelected
                  ? 'border-sky-600 dark:border-cyan-400 bg-sky-50/40 dark:bg-sky-950/20 shadow-xl shadow-sky-600/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-sky-600 dark:bg-cyan-500 text-white dark:text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">
                        {tpl.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-sky-600 dark:text-cyan-400">
                        {tpl.badge}
                      </span>
                    </div>
                  </div>

                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-sky-600 dark:bg-cyan-500 text-white dark:text-slate-950'
                      : 'border-2 border-slate-300 dark:border-slate-700'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                <strong className="text-slate-700 dark:text-slate-300">Recommended for:</strong> {tpl.bestFor}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={() => navigate('/resume-builder/information')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-sky-600/20 dark:shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Continue to Enter Information</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
