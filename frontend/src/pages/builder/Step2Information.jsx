import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';

export default function Step2Information() {
  const {
    personalInfo,
    updatePersonalInfo,
    summary,
    updateSummary,
    experience,
    addExperience,
    updateExperience,
    removeExperience,
    education,
    addEducation,
    updateEducation,
    removeEducation,
    skills,
    updateSkills,
    projects,
    addProject,
    updateProject,
    removeProject
  } = useBuilder();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { id: 'personal', label: 'Contact Info', icon: User },
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'experience', label: `Experience (${experience.length})`, icon: Briefcase },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'projects', label: `Projects (${projects.length})`, icon: FolderGit2 },
    { id: 'education', label: `Education (${education.length})`, icon: GraduationCap }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Section Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Form Content */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 shadow-sm">
        {/* 1. PERSONAL INFORMATION */}
        {activeTab === 'personal' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white m-0">
                Contact & Header Information
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ATS parsers look for standard contact information in the document header.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={personalInfo.fullName || ''}
                  onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Target Job Title *
                </label>
                <input
                  type="text"
                  value={personalInfo.title || ''}
                  onChange={(e) => updatePersonalInfo('title', e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={personalInfo.email || ''}
                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  placeholder="alex.morgan@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={personalInfo.phone || ''}
                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Location (City, State / Remote)
                </label>
                <input
                  type="text"
                  value={personalInfo.location || ''}
                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  placeholder="San Francisco, CA (Open to Remote)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  LinkedIn URL
                </label>
                <input
                  type="text"
                  value={personalInfo.linkedin || ''}
                  onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/alexmorgan"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  GitHub / Portfolio URL
                </label>
                <input
                  type="text"
                  value={personalInfo.portfolio || ''}
                  onChange={(e) => updatePersonalInfo('portfolio', e.target.value)}
                  placeholder="github.com/alexmorgan"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. SUMMARY */}
        {activeTab === 'summary' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white m-0">
                Professional Summary
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                A 3–4 sentence executive pitch highlighting years of experience, core stack, and measurable business impact.
              </p>
            </div>

            <textarea
              rows={6}
              value={summary || ''}
              onChange={(e) => updateSummary(e.target.value)}
              placeholder="e.g. Results-driven Senior Full Stack Engineer with 6+ years of experience architecting resilient cloud-native microservices..."
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none leading-relaxed"
            />

            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>{summary ? summary.split(/\s+/).filter(Boolean).length : 0} words</span>
              <span>Optimal length: 40–80 words</span>
            </div>
          </div>
        )}

        {/* 3. EXPERIENCE */}
        {activeTab === 'experience' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white m-0">
                  Work Experience
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Highlight key accomplishments using action verbs and measurable outcomes.
                </p>
              </div>
              <button
                type="button"
                onClick={addExperience}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-cyan-400 border border-sky-200 dark:border-sky-800 text-xs font-bold hover:bg-sky-100 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Position</span>
              </button>
            </div>

            <div className="space-y-6">
              {experience.map((exp, index) => (
                <div
                  key={exp.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Position #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                      title="Remove Position"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Job Title</label>
                      <input
                        type="text"
                        value={exp.jobTitle || ''}
                        onChange={(e) => updateExperience(exp.id, { jobTitle: e.target.value })}
                        placeholder="e.g. Senior Full Stack Engineer"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Company</label>
                      <input
                        type="text"
                        value={exp.company || ''}
                        onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                        placeholder="e.g. Apex Cloud Solutions"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Location</label>
                      <input
                        type="text"
                        value={exp.location || ''}
                        onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                        placeholder="e.g. San Francisco, CA"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate || ''}
                          onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                          placeholder="e.g. 2022-03"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">End Date</label>
                        <input
                          type="text"
                          disabled={exp.current}
                          value={exp.current ? 'Present' : exp.endDate || ''}
                          onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                          placeholder="e.g. Present"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`current-${exp.id}`}
                      checked={Boolean(exp.current)}
                      onChange={(e) => updateExperience(exp.id, { current: e.target.checked })}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <label htmlFor={`current-${exp.id}`} className="text-xs text-slate-600 dark:text-slate-400">
                      I currently work in this role
                    </label>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                      Key Accomplishments & Impact Bullets (one bullet per line)
                    </label>
                    <textarea
                      rows={4}
                      value={exp.description || ''}
                      onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                      placeholder="• Architected microservices backend in Node.js, improving throughput by 42%..."
                      className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. SKILLS */}
        {activeTab === 'skills' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white m-0">
                Skills & Technical Proficiencies
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Comma-separated lists of tools, languages, and competencies.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Languages & Frameworks (comma-separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(skills.technical) ? skills.technical.join(', ') : skills.technical || ''}
                  onChange={(e) => updateSkills('technical', e.target.value)}
                  placeholder="JavaScript, TypeScript, React, Node.js, Python, PostgreSQL, AWS"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Tools, Cloud & DevOps (comma-separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(skills.tools) ? skills.tools.join(', ') : skills.tools || ''}
                  onChange={(e) => updateSkills('tools', e.target.value)}
                  placeholder="Docker, Kubernetes, Git, Redis, Vite, Jest, GitHub Actions, Linux"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Methodologies & Paradigms (comma-separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(skills.other) ? skills.other.join(', ') : skills.other || ''}
                  onChange={(e) => updateSkills('other', e.target.value)}
                  placeholder="Microservices Architecture, System Design, CI/CD, Agile / Scrum"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white m-0">
                  Projects & Technical Initiatives
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Showcase open-source repositories, system redesigns, or impactful applications.
                </p>
              </div>
              <button
                type="button"
                onClick={addProject}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-cyan-400 border border-sky-200 dark:border-sky-800 text-xs font-bold hover:bg-sky-100 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            <div className="space-y-4">
              {projects.map((proj, index) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Project #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeProject(proj.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Project Name</label>
                      <input
                        type="text"
                        value={proj.projectName || ''}
                        onChange={(e) => updateProject(proj.id, { projectName: e.target.value })}
                        placeholder="e.g. CloudPulse — Real-Time Infrastructure Monitoring"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Description</label>
                      <textarea
                        rows={2}
                        value={proj.description || ''}
                        onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                        placeholder="Engineered telemetry dashboard visualizing cluster health and API latency..."
                        className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Technologies (comma-separated)</label>
                      <input
                        type="text"
                        value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies || ''}
                        onChange={(e) =>
                          updateProject(proj.id, {
                            technologies: e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                          })
                        }
                        placeholder="React, Node.js, WebSocket, Docker"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Measurable Impact / Outcome</label>
                      <input
                        type="text"
                        value={proj.outcome || ''}
                        onChange={(e) => updateProject(proj.id, { outcome: e.target.value })}
                        placeholder="e.g. Adopted by 800+ developers; cut anomaly response time by 50%"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. EDUCATION */}
        {activeTab === 'education' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white m-0">
                  Education & Credentials
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Degrees, institutions, graduation dates, and academic honors.
                </p>
              </div>
              <button
                type="button"
                onClick={addEducation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-cyan-400 border border-sky-200 dark:border-sky-800 text-xs font-bold hover:bg-sky-100 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Education</span>
              </button>
            </div>

            <div className="space-y-4">
              {education.map((edu, index) => (
                <div
                  key={edu.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Degree #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeEducation(edu.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Institution</label>
                      <input
                        type="text"
                        value={edu.institution || ''}
                        onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                        placeholder="e.g. University of Texas at Austin"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Degree & Major</label>
                      <input
                        type="text"
                        value={edu.degree || ''}
                        onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                        placeholder="e.g. Bachelor of Science in Computer Science"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Graduation Date</label>
                      <input
                        type="text"
                        value={edu.endDate || ''}
                        onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                        placeholder="e.g. 2019-05"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Details / Honors</label>
                      <input
                        type="text"
                        value={edu.details || ''}
                        onChange={(e) => updateEducation(edu.id, { details: e.target.value })}
                        placeholder="Magna Cum Laude, GPA 3.85"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => navigate('/resume-builder/template')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Templates</span>
        </button>

        <button
          onClick={() => navigate('/resume-builder/suggestions')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-sky-600/20 dark:shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Continue to AI Suggestions</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
