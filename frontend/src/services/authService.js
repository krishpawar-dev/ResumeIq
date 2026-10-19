import api from './api';

export const authService = {
  /**
   * Register a new user
   * @param {Object} data - { name, email, password }
   */
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Login an existing user
   * @param {Object} data - { email, password }
   */
  async login(data) {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
