import api from './api';

export const interviewService = {
  /**
   * Start a new personalized mock interview session
   * @param {object} payload - { targetRole, interviewType, difficulty, duration, focus, resumeId }
   */
  async startInterview(payload) {
    const response = await api.post('/interview/start', payload);
    return response.data;
  },

  /**
   * Submit an answer to the current question and receive AI evaluation
   * @param {object} payload - { mockInterviewId, questionId, answerText, timeSpentSeconds, startedAt }
   */
  async submitAnswer(payload) {
    const response = await api.post('/interview/answer', payload);
    return response.data;
  },

  /**
   * Get full details and evaluation report of an interview session
   * @param {string} id - mockInterviewId
   */
  async getInterviewById(id) {
    const response = await api.get(`/interview/${id}`);
    return response.data;
  },

  /**
   * Get past mock interview history for authenticated user
   */
  async getInterviewHistory() {
    const response = await api.get('/interview/history');
    return response.data;
  },

  /**
   * Preview generated questions
   * @param {object} payload
   */
  async generateQuestions(payload) {
    const response = await api.post('/interview/generate', payload);
    return response.data;
  },

  /**
   * Get user's interview analytics
   */
  async getAnalytics() {
    const response = await api.get('/interview/analytics');
    return response.data.analytics || response.data;
  },

  /**
   * Start a practice session
   * @param {object} payload - { sessionType, targetRole, resumeId, duration, category, companyName, questionSetId, difficulty }
   */
  async startPracticeSession(payload) {
    const response = await api.post('/interview/practice/start', payload);
    return response.data;
  },

  /**
   * Submit an answer for practice session
   * @param {string} sessionId
   * @param {object} payload - { questionId, answerText, timeSpentSeconds, startedAt }
   */
  async submitPracticeAnswer(sessionId, payload) {
    const response = await api.post(`/interview/practice/${sessionId}/answer`, payload);
    return response.data;
  },

  /**
   * Complete practice session
   * @param {string} sessionId
   */
  async completePracticeSession(sessionId) {
    const response = await api.post(`/interview/practice/${sessionId}/complete`);
    return response.data;
  },

  /**
   * Get practice session by ID
   * @param {string} sessionId
   */
  async getPracticeSessionById(sessionId) {
    const response = await api.get(`/interview/practice/${sessionId}`);
    return response.data;
  },

  /**
   * Get user's practice history
   */
  async getPracticeHistory() {
    const response = await api.get('/interview/practice/history');
    return { ...response.data, history: response.data.sessions || response.data.history || [] };
  },

  /**
   * Get accessible community question sets
   */
  async getCommunitySets() {
    const response = await api.get('/interview/community/sets');
    return response.data;
  },

  /**
   * Create new question set
   */
  async createCommunitySet(payload) {
    const response = await api.post('/interview/community/sets', payload);
    return response.data;
  },

  /**
   * Update question set
   */
  async updateCommunitySet(id, payload) {
    const response = await api.put(`/interview/community/sets/${id}`, payload);
    return response.data;
  },

  /**
   * Delete question set
   */
  async deleteCommunitySet(id) {
    const response = await api.delete(`/interview/community/sets/${id}`);
    return response.data;
  }
};
