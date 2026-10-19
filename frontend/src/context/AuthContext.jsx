import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('resumeiq_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state by verifying token with backend
  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('resumeiq_token');
      if (!storedToken) {
        if (isMounted) {
          setIsLoading(false);
          setUser(null);
          setToken(null);
        }
        return;
      }

      try {
        const response = await authService.getCurrentUser();
        if (isMounted) {
          setUser(response.user);
          setToken(storedToken);
          setError(null);
        }
      } catch (err) {
        console.warn('[Auth] Token verification failed:', err.message);
        if (isMounted) {
          localStorage.removeItem('resumeiq_token');
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.login({ email, password });
      localStorage.setItem('resumeiq_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.register({ name, email, password });
      localStorage.setItem('resumeiq_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('resumeiq_token');
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    error,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
