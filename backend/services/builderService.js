const ResumeDraft = require('../models/ResumeDraft');
const { analyzeResumeATS } = require('./resumeAnalysisService');

/**
 * Convert structured builder draft into clean text representation for standard ATS analysis
 */
const compileDraftToText = (draftData) => {
  const parts = [];

  // Contact Info / Header
  const p = draftData.personalInfo || {};
  const contactLines = [p.fullName, p.title, p.email, p.phone, p.location, p.linkedin, p.portfolio].filter(Boolean);
  if (contactLines.length > 0) {
    parts.push(contactLines.join(' | '));
  }

  // Summary
  if (draftData.summary && draftData.summary.trim()) {
    parts.push('PROFESSIONAL SUMMARY');
    parts.push(draftData.summary.trim());
  }

  // Experience
  if (Array.isArray(draftData.experience) && draftData.experience.length > 0) {
    parts.push('PROFESSIONAL EXPERIENCE');
    draftData.experience.forEach((exp) => {
      const expHeader = [exp.jobTitle, exp.company, exp.location, `${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}`]
        .filter(Boolean)
        .join(', ');
      parts.push(expHeader);
      if (exp.description) {
        parts.push(exp.description);
      }
    });
  }

  // Education
  if (Array.isArray(draftData.education) && draftData.education.length > 0) {
    parts.push('EDUCATION');
    draftData.education.forEach((edu) => {
      const eduHeader = [edu.degree, edu.field, edu.institution, `${edu.startDate || ''} - ${edu.endDate || ''}`]
        .filter(Boolean)
        .join(', ');
      parts.push(eduHeader);
      if (edu.details) parts.push(edu.details);
    });
  }

  // Skills
  const s = draftData.skills || {};
  const techSkills = Array.isArray(s.technical) ? s.technical.join(', ') : (s.technical || '');
  const toolSkills = Array.isArray(s.tools) ? s.tools.join(', ') : (s.tools || '');
  const otherSkills = Array.isArray(s.other) ? s.other.join(', ') : (s.other || '');
  if (techSkills || toolSkills || otherSkills) {
    parts.push('TECHNICAL SKILLS');
    if (techSkills) parts.push(`Languages & Frameworks: ${techSkills}`);
    if (toolSkills) parts.push(`Tools & Cloud: ${toolSkills}`);
    if (otherSkills) parts.push(`Core Competencies: ${otherSkills}`);
  }

  // Projects
  if (Array.isArray(draftData.projects) && draftData.projects.length > 0) {
    parts.push('PROJECTS');
    draftData.projects.forEach((proj) => {
      const projHeader = proj.projectName;
      parts.push(projHeader);
      if (proj.description) parts.push(proj.description);
      const projTech = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.technologies || '');
      if (projTech) parts.push(`Technologies: ${projTech}`);
      if (proj.outcome) parts.push(`Impact: ${proj.outcome}`);
    });
  }

  return parts.join('\n\n');
};

/**
 * Calculate live debounced ATS score for builder draft data
 */
const calculateBuilderATS = async (draftData) => {
  const compiledText = compileDraftToText(draftData);
  const wordCount = compiledText.split(/\s+/).filter(Boolean).length;
  const metadata = {
    wordCount,
    characterCount: compiledText.length
  };

  const analysis = await analyzeResumeATS(compiledText, metadata);
  return {
    atsScore: analysis.atsScore,
    scoreBreakdown: analysis.scoreBreakdown,
    wordCount,
    compiledText
  };
};

/**
 * Get or initialize draft for user
 */
const getUserDraft = async (userId) => {
  let draft = await ResumeDraft.findOne({ userId });
  if (!draft) {
    draft = await ResumeDraft.create({
      userId,
      templateId: 'classic',
      personalInfo: {
        fullName: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        portfolio: ''
      },
      summary: '',
      experience: [],
      education: [],
      skills: { technical: [], tools: [], other: [] },
      projects: []
    });
  }
  return draft;
};

/**
 * Save draft for user and update ATS score
 */
const saveUserDraft = async (userId, updateData) => {
  let draft = await ResumeDraft.findOne({ userId });
  if (!draft) {
    draft = new ResumeDraft({ userId });
  }

  // Merge fields
  if (updateData.templateId) draft.templateId = updateData.templateId;
  if (updateData.personalInfo) draft.personalInfo = { ...draft.personalInfo, ...updateData.personalInfo };
  if (updateData.summary !== undefined) draft.summary = updateData.summary;
  if (updateData.experience !== undefined) draft.experience = updateData.experience;
  if (updateData.education !== undefined) draft.education = updateData.education;
  if (updateData.skills !== undefined) draft.skills = updateData.skills;
  if (updateData.projects !== undefined) draft.projects = updateData.projects;

  // Compute live ATS score
  const atsResult = await calculateBuilderATS(draft);
  draft.atsScore = atsResult.atsScore;
  draft.scoreBreakdown = atsResult.scoreBreakdown;

  await draft.save();

  return {
    draft,
    atsResult
  };
};

module.exports = {
  compileDraftToText,
  calculateBuilderATS,
  getUserDraft,
  saveUserDraft
};
