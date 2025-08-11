import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set up axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/profile');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      const { user: newUser, token: newToken } = response.data;
      
      setUser(newUser);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      
      return { success: true, message: 'Registration successful!' };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      return { success: false, message };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
      const { user: loggedInUser, token: newToken } = response.data;
      
      setUser(loggedInUser);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      
      return { success: true, message: 'Login successful!' };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('http://localhost:5000/api/auth/profile', profileData);
      setUser(response.data.user);
      return { success: true, message: 'Profile updated successfully!' };
    } catch (error) {
      const message = error.response?.data?.error || 'Profile update failed';
      return { success: false, message };
    }
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 