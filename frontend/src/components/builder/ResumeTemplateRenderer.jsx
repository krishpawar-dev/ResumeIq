import React from 'react';

export default function ResumeTemplateRenderer({ draft, templateId = 'classic', isPrintMode = false }) {
  const p = draft?.personalInfo || {};
  const summary = draft?.summary || '';
  const experience = draft?.experience || [];
  const education = draft?.education || [];
  const skills = draft?.skills || {};
  const projects = draft?.projects || [];

  const techSkills = Array.isArray(skills.technical) ? skills.technical : [];
  const toolSkills = Array.isArray(skills.tools) ? skills.tools : [];
  const otherSkills = Array.isArray(skills.other) ? skills.other : [];

  // Base container: 8.5 x 11 in / A4 proportion resume sheet
  const sheetClass = `w-full max-w-[800px] mx-auto bg-white text-slate-900 shadow-xl print:shadow-none print:m-0 print:p-0 transition-all ${
    isPrintMode ? 'p-8 text-[11px] leading-relaxed' : 'p-8 sm:p-12 text-xs sm:text-[13px] leading-relaxed rounded-2xl'
  }`;

  // 1. CLASSIC PROFESSIONAL TEMPLATE
  if (templateId === 'classic') {
    return (
      <div id="resume-export-sheet" className={sheetClass} style={{ fontFamily: 'Georgia, Cambria, serif' }}>
        {/* Header */}
        <div className="text-center pb-5 border-b-2 border-slate-800 space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 uppercase">
            {p.fullName || 'Candidate Name'}
          </h1>
          {p.title && (
            <p className="text-sm font-semibold tracking-wide text-slate-700 italic">
              {p.title}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-600 font-sans">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>&bull; {p.phone}</span>}
            {p.location && <span>&bull; {p.location}</span>}
            {p.linkedin && <span>&bull; {p.linkedin}</span>}
            {p.portfolio && <span>&bull; {p.portfolio}</span>}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="mt-5 space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 font-sans">
              Professional Summary
            </h2>
            <p className="text-slate-800 text-justify pt-1">
              {summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mt-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 font-sans">
              Professional Experience
            </h2>
            <div className="space-y-3 pt-1">
              {experience.map((exp) => (
                <div key={exp.id} className="space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <div>
                      <span className="font-bold text-slate-900">{exp.jobTitle || 'Job Title'}</span>
                      {exp.company && <span className="font-semibold text-slate-700">, {exp.company}</span>}
                    </div>
                    <div className="text-[11px] font-sans text-slate-600">
                      <span>{exp.location}</span>
                      {(exp.startDate || exp.endDate) && (
                        <span> | {exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                      )}
                    </div>
                  </div>
                  {exp.description && (
                    <div className="text-slate-700 whitespace-pre-line pl-2 text-[12px]">
                      {exp.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Skills */}
        {(techSkills.length > 0 || toolSkills.length > 0 || otherSkills.length > 0) && (
          <div className="mt-5 space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 font-sans">
              Technical Competencies
            </h2>
            <div className="space-y-1 pt-1 font-sans text-[12px]">
              {techSkills.length > 0 && (
                <p>
                  <strong className="font-semibold text-slate-900">Languages & Frameworks:</strong>{' '}
                  <span className="text-slate-700">{techSkills.join(', ')}</span>
                </p>
              )}
              {toolSkills.length > 0 && (
                <p>
                  <strong className="font-semibold text-slate-900">Cloud & Tools:</strong>{' '}
                  <span className="text-slate-700">{toolSkills.join(', ')}</span>
                </p>
              )}
              {otherSkills.length > 0 && (
                <p>
                  <strong className="font-semibold text-slate-900">Core Practices:</strong>{' '}
                  <span className="text-slate-700">{otherSkills.join(', ')}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="mt-5 space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 font-sans">
              Key Projects & Impact
            </h2>
            <div className="space-y-2.5 pt-1">
              {projects.map((proj) => (
                <div key={proj.id} className="space-y-0.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-slate-900">{proj.projectName}</span>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <span className="text-[11px] font-sans text-slate-600">
                        ({Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies})
                      </span>
                    )}
                  </div>
                  {proj.description && <p className="text-slate-700 text-[12px]">{proj.description}</p>}
                  {proj.outcome && (
                    <p className="text-[12px] text-slate-900 font-semibold pl-2">
                      &bull; Impact: {proj.outcome}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mt-5 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 font-sans">
              Education
            </h2>
            <div className="space-y-2 pt-1 font-sans">
              {education.map((edu) => (
                <div key={edu.id} className="flex flex-wrap items-baseline justify-between gap-1">
                  <div>
                    <span className="font-bold text-slate-900">{edu.degree} {edu.field && `in ${edu.field}`}</span>
                    {edu.institution && <span className="text-slate-700"> &bull; {edu.institution}</span>}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {edu.startDate && <span>{edu.startDate} - </span>}
                    {edu.endDate}
                  </div>
                  {edu.details && <p className="w-full text-xs text-slate-600 italic">{edu.details}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. MODERN MINIMAL TEMPLATE
  if (templateId === 'modern') {
    return (
      <div id="resume-export-sheet" className={sheetClass} style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        <div className="border-l-4 border-sky-600 pl-4 pb-4 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            {p.fullName || 'Candidate Name'}
          </h1>
          {p.title && (
            <p className="text-sm font-semibold tracking-wide text-sky-700 uppercase">
              {p.title}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.location && <span>{p.location}</span>}
            {p.linkedin && <span>{p.linkedin}</span>}
            {p.portfolio && <span>{p.portfolio}</span>}
          </div>
        </div>

        {summary && (
          <div className="mt-6 space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Profile
            </h2>
            <p className="text-slate-700 leading-relaxed">
              {summary}
            </p>
          </div>
        )}

        {experience.length > 0 && (
          <div className="mt-6 space-y-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Experience
            </h2>
            <div className="space-y-3.5">
              {experience.map((exp) => (
                <div key={exp.id} className="space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <span className="font-bold text-slate-900 text-sm">
                      {exp.jobTitle} <span className="font-normal text-slate-500">at {exp.company}</span>
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {exp.location} | {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.description && (
                    <div className="text-slate-600 whitespace-pre-line text-xs leading-relaxed">
                      {exp.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills with pill badges */}
        {(techSkills.length > 0 || toolSkills.length > 0 || otherSkills.length > 0) && (
          <div className="mt-6 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Skills & Expertise
            </h2>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[...techSkills, ...toolSkills, ...otherSkills].map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {projects.length > 0 && (
          <div className="mt-6 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Selected Projects
            </h2>
            <div className="space-y-2.5">
              {projects.map((proj) => (
                <div key={proj.id} className="space-y-0.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-slate-900">{proj.projectName}</span>
                    {proj.technologies && (
                      <span className="text-[11px] text-sky-700 font-medium">
                        {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                      </span>
                    )}
                  </div>
                  {proj.description && <p className="text-slate-600 text-xs">{proj.description}</p>}
                  {proj.outcome && <p className="text-xs font-semibold text-slate-800">&bull; {proj.outcome}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div className="mt-6 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="flex flex-wrap items-baseline justify-between gap-1 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{edu.degree} {edu.field && `in ${edu.field}`}</span>
                    <span className="text-slate-500"> — {edu.institution}</span>
                  </div>
                  <span className="text-slate-500">{edu.startDate && `${edu.startDate} - `}{edu.endDate}</span>
                  {edu.details && <p className="w-full text-slate-500 italic">{edu.details}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. EXECUTIVE TEMPLATE
  if (templateId === 'executive') {
    return (
      <div id="resume-export-sheet" className={sheetClass} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {/* Bold Executive Header Band */}
        <div className="bg-slate-900 text-white -mx-8 -mt-8 sm:-mx-12 sm:-mt-12 p-8 sm:p-10 mb-6 rounded-t-2xl space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
                {p.fullName || 'Candidate Name'}
              </h1>
              <p className="text-sm font-semibold tracking-wide text-sky-400 mt-0.5">
                {p.title || 'Senior Executive'}
              </p>
            </div>
            <div className="text-right sm:text-right text-[11px] text-slate-300 space-y-0.5">
              {p.email && <div>{p.email}</div>}
              {p.phone && <div>{p.phone}</div>}
              {p.location && <div>{p.location}</div>}
              {p.linkedin && <div>{p.linkedin}</div>}
            </div>
          </div>
        </div>

        {summary && (
          <div className="mb-6 space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1">
              Executive Profile & Core Value
            </div>
            <p className="text-slate-800 pt-1 leading-relaxed text-justify">
              {summary}
            </p>
          </div>
        )}

        {experience.length > 0 && (
          <div className="mb-6 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1">
              Leadership & Professional Experience
            </div>
            <div className="space-y-4 pt-1">
              {experience.map((exp) => (
                <div key={exp.id} className="space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <span className="font-extrabold text-slate-950 text-sm">
                      {exp.jobTitle} <span className="font-semibold text-slate-700">| {exp.company}</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {exp.location} ({exp.startDate} - {exp.current ? 'Present' : exp.endDate})
                    </span>
                  </div>
                  {exp.description && (
                    <div className="text-slate-700 whitespace-pre-line text-xs leading-relaxed pl-2 border-l-2 border-slate-200">
                      {exp.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Competencies */}
        {(techSkills.length > 0 || toolSkills.length > 0 || otherSkills.length > 0) && (
          <div className="mb-6 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1">
              Core Competencies & Capabilities
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
              {[...techSkills, ...toolSkills, ...otherSkills].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-slate-800 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {projects.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1">
              Strategic Initiatives & Deliverables
            </div>
            <div className="space-y-2.5 pt-1">
              {projects.map((proj) => (
                <div key={proj.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-slate-900">{proj.projectName}</span>
                    {proj.technologies && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                      </span>
                    )}
                  </div>
                  {proj.description && <p className="text-slate-700 text-xs">{proj.description}</p>}
                  {proj.outcome && (
                    <p className="text-xs font-bold text-slate-950">
                      Deliverable Impact: {proj.outcome}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1">
              Credentials & Education
            </div>
            <div className="space-y-2 pt-1 text-xs">
              {education.map((edu) => (
                <div key={edu.id} className="flex flex-wrap items-baseline justify-between gap-1">
                  <span className="font-bold text-slate-900">{edu.degree} {edu.field && `in ${edu.field}`} — {edu.institution}</span>
                  <span className="text-slate-600">{edu.startDate && `${edu.startDate} - `}{edu.endDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. TECHNICAL TEMPLATE
  return (
    <div id="resume-export-sheet" className={sheetClass} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Monospace touched technical header */}
      <div className="pb-4 border-b border-slate-300 space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            {p.fullName || 'Candidate Name'}
          </h1>
          <span className="text-xs font-mono font-semibold text-sky-800 bg-sky-50 px-2.5 py-1 rounded border border-sky-200">
            {p.title || 'Software Engineer'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-600 pt-1">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
          {p.portfolio && <span>{p.portfolio}</span>}
        </div>
      </div>

      {summary && (
        <div className="mt-5 space-y-1">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            // OVERVIEW
          </h2>
          <p className="text-slate-800 leading-relaxed text-xs">
            {summary}
          </p>
        </div>
      )}

      {/* Prominent Technical Taxonomy Box */}
      {(techSkills.length > 0 || toolSkills.length > 0 || otherSkills.length > 0) && (
        <div className="mt-5 p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 font-mono text-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            // TECHNICAL_STACK
          </div>
          {techSkills.length > 0 && (
            <div>
              <span className="font-bold text-slate-800">Languages/Frameworks:</span>{' '}
              <span className="text-slate-600">{techSkills.join(' | ')}</span>
            </div>
          )}
          {toolSkills.length > 0 && (
            <div>
              <span className="font-bold text-slate-800">Infrastructure/Tools:</span>{' '}
              <span className="text-slate-600">{toolSkills.join(' | ')}</span>
            </div>
          )}
          {otherSkills.length > 0 && (
            <div>
              <span className="font-bold text-slate-800">Paradigms:</span>{' '}
              <span className="text-slate-600">{otherSkills.join(' | ')}</span>
            </div>
          )}
        </div>
      )}

      {experience.length > 0 && (
        <div className="mt-5 space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            // WORK_HISTORY
          </h2>
          <div className="space-y-3">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex flex-wrap items-baseline justify-between gap-1 text-xs">
                  <span className="font-bold text-slate-900">
                    {exp.jobTitle} <span className="font-normal text-slate-600">@ {exp.company}</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {exp.startDate} ~ {exp.current ? 'PRESENT' : exp.endDate}
                  </span>
                </div>
                {exp.description && (
                  <div className="text-slate-700 whitespace-pre-line text-xs pl-2 border-l border-sky-400">
                    {exp.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div className="mt-5 space-y-2.5">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            // OPEN_SOURCE_AND_PROJECTS
          </h2>
          <div className="space-y-2">
            {projects.map((proj) => (
              <div key={proj.id} className="p-2.5 rounded bg-slate-50/70 border border-slate-200/80 space-y-1 text-xs">
                <div className="flex items-baseline justify-between font-mono">
                  <span className="font-bold text-slate-900">{proj.projectName}</span>
                  {proj.technologies && (
                    <span className="text-[11px] text-sky-700">
                      [{Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}]
                    </span>
                  )}
                </div>
                {proj.description && <p className="text-slate-600">{proj.description}</p>}
                {proj.outcome && <p className="font-semibold text-slate-800">&gt; {proj.outcome}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {education.length > 0 && (
        <div className="mt-5 space-y-1.5">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            // EDUCATION
          </h2>
          <div className="space-y-1 text-xs">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between">
                <span><strong>{edu.degree} in {edu.field}</strong> — {edu.institution}</span>
                <span className="font-mono text-slate-500">{edu.endDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
