import api from './api';

/**
 * Phase 7 Intelligence Features Service
 * Handles: Job X-Ray, Ghost Job Detector, Resume Truth Detector,
 * Reverse Interview, Career Twin, Skill Battle, Career Health Score
 */
export const intelligenceService = {
  /**
   * Run Job X-Ray deep analysis on a job match or job+resume pair
   * @param {object} payload - { jobMatchId } or { jobId, resumeId }
   */
  async runJobXRay(payload) {
    const response = await api.post('/jobs/xray', payload);
    return response.data;
  },

  /**
   * Run Ghost Job Detection on a job description
   * @param {object} payload - { jobDescriptionText } or { jobId }
   */
  async detectGhostJob(payload) {
    const response = await api.post('/jobs/ghost-detect', payload);
    return response.data;
  },

  /**
   * Run Resume Truth Detector on a specific resume
   * @param {string} resumeId
   */
  async runTruthDetector(resumeId) {
    const response = await api.post(`/resume/${resumeId}/truth-detector`, {});
    return response.data;
  },

  /**
   * Generate Reverse Interview questions from an interview session
   * @param {string} interviewId
   */
  async generateReverseInterview(interviewId) {
    const response = await api.post(`/interview/${interviewId}/reverse-interview`, {});
    return response.data;
  },

  /**
   * Run Career Twin analysis
   * @param {object} payload - { resumeId, targetRole, currentRole }
   */
  async getCareerTwin(payload) {
    const response = await api.post('/career/twin', payload);
    return response.data;
  }
};
