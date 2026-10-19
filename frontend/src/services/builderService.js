import api from './api';

export const builderService = {
  /**
   * Fetch current user's resume draft
   */
  async getDraft() {
    const response = await api.get('/builder/draft');
    return response.data;
  },

  /**
   * Save user's resume draft to server and recalculate ATS score
   * @param {object} draftData
   */
  async saveDraft(draftData) {
    const response = await api.put('/builder/draft', draftData);
    return response.data;
  },

  /**
   * Debounced live calculation of 7-factor ATS score for builder
   * @param {object} draftData
   */
  async calculateScore(draftData) {
    const response = await api.post('/builder/score', draftData);
    return response.data;
  },

  /**
   * Inline AI improvement for builder bullet or section
   * @param {object} payload - { originalText, sectionType }
   */
  async improveBullet(payload) {
    const response = await api.post('/builder/improve', payload);
    return response.data;
  }
};
