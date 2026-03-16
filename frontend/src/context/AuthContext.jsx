import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Create axios instance ONCE and keep it stable across renders
  const apiRef = useRef(null);

  if (!apiRef.current) {
    apiRef.current = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const api = apiRef.current;

  // Update axios headers when token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token, api]);

  // Restore user and token from localStorage on app load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          // Set headers with stored token
          api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
          
          // Verify token is still valid by calling /auth/me
          try {
            const response = await api.get('/auth/me');
            setUser(response.data.user || JSON.parse(storedUser));
          } catch (err) {
            // Token is invalid, clear session
            console.log('Session expired, clearing...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            delete api.defaults.headers.common.Authorization;
          }
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Register function
  const register = async (nameOrData, email, password, role) => {
    try {
      setLoading(true);
      setError(null);
      
      // Support both old (individual params) and new (object) API
      let registerPayload = {};
      if (typeof nameOrData === 'object') {
        registerPayload = nameOrData;
      } else {
        registerPayload = { name: nameOrData, email, password, role };
      }
      
      const response = await api.post('/auth/register', registerPayload);

      const { token: newToken, user: newUser } = response.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { token: newToken, user: newUser } = response.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common.Authorization;
  };

  // Update user (for profile updates, etc.)
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;

  // Get current user
  const getCurrentUser = async () => {
    try {
      if (!token) return null;
      
      const response = await api.get('/auth/me');
      return response.data;
    } catch (err) {
      logout();
      return null;
    }
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    updateUser,
    isAuthenticated,
    getCurrentUser,
    api,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
