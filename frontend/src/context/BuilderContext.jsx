import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { builderService } from '../services/builderService';

const BuilderContext = createContext();

const INITIAL_DRAFT = {
  templateId: 'classic',
  personalInfo: {
    fullName: 'Alex Morgan',
    title: 'Senior Full Stack Software Engineer',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA (Open to Remote)',
    linkedin: 'linkedin.com/in/alexmorgan-dev',
    portfolio: 'github.com/alexmorgan'
  },
  summary: 'Results-driven Senior Full Stack Engineer with 6+ years of experience architecting resilient cloud-native microservices, scaling web platforms to 250,000+ active users, and reducing system latency by 35% through modern distributed caching and asynchronous pipelines.',
  experience: [
    {
      id: 'exp-1',
      jobTitle: 'Senior Full Stack Engineer',
      company: 'Apex Cloud Solutions',
      location: 'San Francisco, CA',
      startDate: '2022-03',
      endDate: '',
      current: true,
      description: '• Architected and deployed microservices backend in Node.js and TypeScript, improving API throughput by 42%.\n• Spearheaded migration of legacy frontend to React and Tailwind CSS, reducing bundle size by 30% and time-to-interactive by 1.8 seconds.\n• Mentored team of 6 engineers on clean architecture, automated integration testing, and CI/CD best practices.'
    },
    {
      id: 'exp-2',
      jobTitle: 'Software Engineer',
      company: 'DataFlow Systems',
      location: 'Austin, TX',
      startDate: '2019-06',
      endDate: '2022-02',
      current: false,
      description: '• Engineered data ingestion pipelines in Python and PostgreSQL processing 10M+ daily events with 99.98% uptime.\n• Implemented automated Redis caching layer, decreasing database query loads by 45% during peak hours.\n• Collaborated closely with product managers to deliver 14 major feature releases ahead of roadmap schedules.'
    }
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of Texas at Austin',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2015-08',
      endDate: '2019-05',
      details: 'Graduated Magna Cum Laude. Focus on Distributed Systems and Software Engineering.'
    }
  ],
  skills: {
    technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'GraphQL'],
    tools: ['Git', 'Redis', 'Kubernetes', 'Jest', 'GitHub Actions', 'Linux', 'Vite', 'Tailwind CSS'],
    other: ['Microservices Architecture', 'System Design', 'Agile / Scrum', 'CI/CD Pipelines', 'Performance Tuning']
  },
  projects: [
    {
      id: 'proj-1',
      projectName: 'CloudPulse — Real-Time Infrastructure Monitoring',
      description: 'Developed an open-source telemetry dashboard visualizing cluster health and API latency across distributed nodes.',
      technologies: ['React', 'Node.js', 'WebSocket', 'Docker', 'TimescaleDB'],
      outcome: 'Adopted by 800+ developers on GitHub with 1.2k stars; decreased anomaly response time by 50%.'
    }
  ]
};

export function BuilderProvider({ children }) {
  const [draft, setDraft] = useState(INITIAL_DRAFT);
  const [atsScore, setAtsScore] = useState(88);
  const [previousScore, setPreviousScore] = useState(88);
  const [scoreDelta, setScoreDelta] = useState(0);
  const [scoreBreakdown, setScoreBreakdown] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  const debounceTimerRef = useRef(null);

  const calculateScoreLocally = useCallback(async (draftData) => {
    try {
      const res = await builderService.calculateScore(draftData);
      setAtsScore(res.atsScore);
      setPreviousScore(res.atsScore);
      setScoreBreakdown(res.scoreBreakdown);
    } catch (_e) {
      // non-fatal
    }
  }, []);

  // Load draft from backend or fallback to initial
  useEffect(() => {
    let mounted = true;
    async function loadInitial() {
      try {
        setIsLoading(true);
        const data = await builderService.getDraft();
        if (mounted && data.draft && (data.draft.personalInfo?.fullName || data.draft.summary)) {
          setDraft(data.draft);
          if (data.draft.atsScore) {
            setAtsScore(data.draft.atsScore);
            setPreviousScore(data.draft.atsScore);
          }
          if (data.draft.scoreBreakdown) {
            setScoreBreakdown(data.draft.scoreBreakdown);
          }
        } else {
          // Calculate initial ATS score on starter template
          calculateScoreLocally(INITIAL_DRAFT);
        }
      } catch (err) {
        console.warn('[Builder Initial Load Warning]:', err.message);
        calculateScoreLocally(INITIAL_DRAFT);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadInitial();
    return () => {
      mounted = false;
    };
  }, [calculateScoreLocally]);

  // Debounced ATS score calculation & autosave
  const triggerDebouncedSync = useCallback((updatedDraft) => {
    setIsDirty(true);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        const res = await builderService.saveDraft(updatedDraft);
        if (res.atsResult) {
          const newScore = res.atsResult.atsScore;
          setAtsScore((curr) => {
            const delta = newScore - curr;
            if (delta !== 0) {
              setPreviousScore(curr);
              setScoreDelta(delta);
            }
            return newScore;
          });
          setScoreBreakdown(res.atsResult.scoreBreakdown);
        }
        setLastSaved(new Date());
        setIsDirty(false);
      } catch (err) {
        console.error('[Autosave failed]:', err);
      } finally {
        setIsSaving(false);
      }
    }, 1200);
  }, []);

  // State Mutators
  const setTemplate = (templateId) => {
    const next = { ...draft, templateId };
    setDraft(next);
    triggerDebouncedSync(next);
  };

  const updatePersonalInfo = (field, value) => {
    const next = {
      ...draft,
      personalInfo: { ...draft.personalInfo, [field]: value }
    };
    setDraft(next);
    triggerDebouncedSync(next);
  };

  const updateSummary = (summary) => {
    const next = { ...draft, summary };
    setDraft(next);
    triggerDebouncedSync(next);
  };

  const addExperience = () => {
    const newEntry = {
      id: `exp-${Date.now()}`,
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    const next = { ...draft, experience: [newEntry, ...draft.experience] };
    setDraft(next);
    triggerDebouncedSync(next);
  };

  const updateExperience = (id, fields) => {
    const nextExp = draft.experience.map((e) => (e.id === id ? { ...e, ...fields } : e));
    const next = { ...draft, experience: nextExp };
    setDraft(next);
    triggerDebouncedSync(next);
  };

  const removeExperience = (id) => {
    const nextExp = draft.experience.filter((e) => e.id !== id);
    const next = { ...draft, experience: nextExp };
    setDraft(next);
    triggerDebouncedSync(next);
  };

  const addEducation = () => {
    const newEntry = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      details: ''
    };
    const next = { ...draft, education: [...draft.education, newEntry] };
    setDraft(next);
    triggerDebouncedSync(next);
  };

  const updateEducation = (id, fields) => {
    const nextEdu = draft.education.map((e) => (e.id === id ? { ...e, ...fields } : e));
    const next = { ...draft, education: nextEdu };
    setDraft(next);
    triggerDebouncedSync(next);
  };

  const removeEducation = (id) => {
    const nextEdu = draft.education.filter((e) => e.id !== id);
    const next = { ...draft, education: nextEdu };
    setDraft(next);
    triggerDebouncedSync(next);
  };

  const updateSkills = (category, arrayOrStr) => {
    const items = Array.isArray(arrayOrStr)
      ? arrayOrStr
      : arrayOrStr.split(',').map((s) => s.trim()).filter(Boolean);
    const next = {
      ...draft,
      skills: { ...draft.skills, [category]: items }
    };
    setDraft(next);
    triggerDebouncedSync(next);
  };

  const addProject = () => {
    const newEntry = {
      id: `proj-${Date.now()}`,
      projectName: '',
      description: '',
      technologies: [],
      outcome: ''
    };
    const next = { ...draft, projects: [...draft.projects, newEntry] };
    setDraft(next);
    triggerDebouncedSync(next);
  };

  const updateProject = (id, fields) => {
    const nextProj = draft.projects.map((p) => (p.id === id ? { ...p, ...fields } : p));
    const next = { ...draft, projects: nextProj };
    setDraft(next);
    triggerDebouncedSync(next);
  };

  const removeProject = (id) => {
    const nextProj = draft.projects.filter((p) => p.id !== id);
    const next = { ...draft, projects: nextProj };
    setDraft(next);
    triggerDebouncedSync(next);
  };

  const saveDraftNow = async () => {
    try {
      setIsSaving(true);
      const res = await builderService.saveDraft(draft);
      if (res.atsResult) {
        setAtsScore(res.atsResult.atsScore);
        setScoreBreakdown(res.atsResult.scoreBreakdown);
      }
      setLastSaved(new Date());
      setIsDirty(false);
      return res;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BuilderContext.Provider
      value={{
        draft,
        setDraft,
        templateId: draft.templateId || 'classic',
        setTemplate,
        personalInfo: draft.personalInfo,
        updatePersonalInfo,
        summary: draft.summary,
        updateSummary,
        experience: draft.experience || [],
        addExperience,
        updateExperience,
        removeExperience,
        education: draft.education || [],
        addEducation,
        updateEducation,
        removeEducation,
        skills: draft.skills || { technical: [], tools: [], other: [] },
        updateSkills,
        projects: draft.projects || [],
        addProject,
        updateProject,
        removeProject,
        atsScore,
        previousScore,
        scoreDelta,
        scoreBreakdown,
        isLoading,
        isSaving,
        lastSaved,
        isDirty,
        saveDraftNow
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
}
