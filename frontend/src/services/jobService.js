import api from './api';

export const jobService = {
  /**
   * Analyze raw job description and extract requirements
   * @param {string} jobDescriptionText
   * @param {string} resumeId - Optional linked resume
   */
  async analyzeJob(jobDescriptionText, resumeId) {
    const response = await api.post('/jobs/analyze', {
      jobDescriptionText,
      resumeId
    });
    return response.data;
  },

  /**
   * Compare a resume against a job description and calculate weighted match
   * @param {object} payload - { resumeId, jobId, jobDescriptionText }
   */
  async matchJob(payload) {
    const response = await api.post('/jobs/match', payload);
    return response.data;
  },

  /**
   * Get all past job match records for the authenticated user
   */
  async getJobMatches() {
    const response = await api.get('/jobs/matches');
    return response.data;
  },

  /**
   * Get specific job match details by ID
   * @param {string} id
   */
  async getJobMatchById(id) {
    const response = await api.get(`/jobs/matches/${id}`);
    return response.data;
  },

  /**
   * Get specific job description record by ID
   * @param {string} id
   */
  async getJobById(id) {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  /**
   * Delete a job match record
   * @param {string} id
   */
  async deleteJobMatch(id) {
    const response = await api.delete(`/jobs/matches/${id}`);
    return response.data;
  }
};
