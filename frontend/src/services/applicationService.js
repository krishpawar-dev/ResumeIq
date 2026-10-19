import api from './api';

export const applicationService = {
  /**
   * Get all job applications with optional status / search filter
   * @param {object} params - { status, search }
   */
  async getApplications(params = {}) {
    const response = await api.get('/applications', { params });
    return response.data;
  },

  /**
   * Get single application by ID
   * @param {string} id
   */
  async getApplicationById(id) {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  /**
   * Create new job application
   * @param {object} payload
   */
  async createApplication(payload) {
    const response = await api.post('/applications', payload);
    return response.data;
  },

  /**
   * Update existing job application
   * @param {string} id
   * @param {object} payload
   */
  async updateApplication(id, payload) {
    const response = await api.put(`/applications/${id}`, payload);
    return response.data;
  },

  /**
   * Delete job application
   * @param {string} id
   */
  async deleteApplication(id) {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  }
};
