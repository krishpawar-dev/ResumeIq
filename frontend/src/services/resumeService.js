import api from './api';

export const resumeService = {
  /**
   * Upload a resume file (PDF or DOCX)
   * @param {FormData} formData - Contains 'resume' file
   * @param {Function} onUploadProgress - Optional upload progress callback
   */
  async uploadResume(formData, onUploadProgress) {
    const response = await api.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
    return response.data;
  },

  /**
   * Run or re-run ATS analysis on an existing resume
   * @param {string} resumeId
   */
  async analyzeResume(resumeId) {
    const response = await api.post(`/resume/${resumeId}/analyze`);
    return response.data;
  },

  /**
   * Get all resumes belonging to the authenticated user
   */
  async getResumes() {
    const response = await api.get('/resume');
    return response.data;
  },

  /**
   * Get full details of a specific resume
   * @param {string} id
   */
  async getResumeById(id) {
    const response = await api.get(`/resume/${id}`);
    return response.data;
  },

  /**
   * Update resume details (e.g. rename)
   * @param {string} id
   * @param {object} data
   */
  async updateResume(id, data) {
    const response = await api.put(`/resume/${id}`, data);
    return response.data;
  },

  /**
   * Delete a resume
   * @param {string} id
   */
  async deleteResume(id) {
    const response = await api.delete(`/resume/${id}`);
    return response.data;
  },

  /**
   * Improve a specific resume section or bullet point with AI
   * @param {string} resumeId
   * @param {object} payload - { sectionId, originalText, sectionType }
   */
  async improveSection(resumeId, payload) {
    const response = await api.post(`/resume/${resumeId}/improve`, payload);
    return response.data;
  },

  /**
   * Save an accepted/edited suggestion as a new ResumeVersion
   * @param {string} resumeId
   * @param {object} payload - { sectionId, originalText, aiSuggestion, acceptedText, reasons, explanation }
   */
  async saveVersion(resumeId, payload) {
    const response = await api.post(`/resume/${resumeId}/versions`, payload);
    return response.data;
  },

  /**
   * Get version history for a resume
   * @param {string} resumeId
   */
  async getVersions(resumeId) {
    const response = await api.get(`/resume/${resumeId}/versions`);
    return response.data;
  }
};
