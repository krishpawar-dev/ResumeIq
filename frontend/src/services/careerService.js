import api from './api';

export const careerService = {
  /**
   * Run AI Career Path and Roadmap Analysis
   * @param {object} payload - { targetRole, industryPreference, targetIndustry, careerGoal, customSkills, resumeId }
   */
  async analyzeCareer(payload) {
    const response = await api.post('/career/analyze', payload);
    return response.data;
  },

  /**
   * Get active CareerPath for authenticated user
   */
  async getCareerPath() {
    const response = await api.get('/career/path');
    return response.data;
  },

  /**
   * Get active LearningRoadmap for authenticated user
   */
  async getRoadmap() {
    const response = await api.get('/career/roadmap');
    return response.data;
  },

  /**
   * Toggle completion state of a roadmap item
   * @param {string} itemId
   * @param {boolean} completed
   */
  async toggleRoadmapItem(itemId, completed) {
    const response = await api.put(`/career/roadmap/${itemId}`, { completed });
    return response.data;
  }
};
