import api from './api';

export const adminService = {
  // Dashboard
  async getDashboardMetrics() {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },
  async getGrowthData(range = '30d') {
    const res = await api.get(`/admin/dashboard/growth?range=${range}`);
    return res.data;
  },

  // Users
  async getUsers(params = {}) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },
  async getUserById(id) {
    const res = await api.get(`/admin/users/${id}`);
    return res.data;
  },
  async updateUser(id, data) {
    const res = await api.put(`/admin/users/${id}`, data);
    return res.data;
  },
  async deleteUser(id) {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  // Questions
  async getQuestions(params = {}) {
    const res = await api.get('/admin/questions', { params });
    return res.data;
  },
  async getQuestionById(id) {
    const res = await api.get(`/admin/questions/${id}`);
    return res.data;
  },
  async createQuestion(data) {
    const res = await api.post('/admin/questions', data);
    return res.data;
  },
  async updateQuestion(id, data) {
    const res = await api.put(`/admin/questions/${id}`, data);
    return res.data;
  },
  async deleteQuestion(id) {
    const res = await api.delete(`/admin/questions/${id}`);
    return res.data;
  },

  // Interview Categories
  async getCategories(params = {}) {
    const res = await api.get('/admin/interview-categories', { params });
    return res.data;
  },
  async createCategory(data) {
    const res = await api.post('/admin/interview-categories', data);
    return res.data;
  },
  async updateCategory(id, data) {
    const res = await api.put(`/admin/interview-categories/${id}`, data);
    return res.data;
  },
  async deleteCategory(id) {
    const res = await api.delete(`/admin/interview-categories/${id}`);
    return res.data;
  },

  // Skills
  async getSkills(params = {}) {
    const res = await api.get('/admin/skills', { params });
    return res.data;
  },
  async createSkill(data) {
    const res = await api.post('/admin/skills', data);
    return res.data;
  },
  async updateSkill(id, data) {
    const res = await api.put(`/admin/skills/${id}`, data);
    return res.data;
  },
  async deleteSkill(id) {
    const res = await api.delete(`/admin/skills/${id}`);
    return res.data;
  },

  // Job Categories
  async getJobCategories(params = {}) {
    const res = await api.get('/admin/job-categories', { params });
    return res.data;
  },
  async createJobCategory(data) {
    const res = await api.post('/admin/job-categories', data);
    return res.data;
  },
  async updateJobCategory(id, data) {
    const res = await api.put(`/admin/job-categories/${id}`, data);
    return res.data;
  },
  async deleteJobCategory(id) {
    const res = await api.delete(`/admin/job-categories/${id}`);
    return res.data;
  },

  // Resume Templates
  async getTemplates(params = {}) {
    const res = await api.get('/admin/resume-templates', { params });
    return res.data;
  },
  async createTemplate(data) {
    const res = await api.post('/admin/resume-templates', data);
    return res.data;
  },
  async updateTemplate(id, data) {
    const res = await api.put(`/admin/resume-templates/${id}`, data);
    return res.data;
  },
  async deleteTemplate(id) {
    const res = await api.delete(`/admin/resume-templates/${id}`);
    return res.data;
  },

  // Reports
  async getReports(params = {}) {
    const res = await api.get('/admin/reports', { params });
    return res.data;
  },
  async getReportById(id) {
    const res = await api.get(`/admin/reports/${id}`);
    return res.data;
  },
  async updateReport(id, data) {
    const res = await api.put(`/admin/reports/${id}`, data);
    return res.data;
  },
  async deleteReport(id) {
    const res = await api.delete(`/admin/reports/${id}`);
    return res.data;
  },

  // Subscriptions
  async getSubscriptions(params = {}) {
    const res = await api.get('/admin/subscriptions', { params });
    return res.data;
  },
  async getSubscriptionById(id) {
    const res = await api.get(`/admin/subscriptions/${id}`);
    return res.data;
  },
  async updateSubscription(id, data) {
    const res = await api.put(`/admin/subscriptions/${id}`, data);
    return res.data;
  }
};
