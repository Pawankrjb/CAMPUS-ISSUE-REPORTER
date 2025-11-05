import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import Loading from '../components/common/Loading';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user data
      api.get('/auth/me')
        .then(response => {
          setCurrentUser(response.data.user);
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          localStorage.removeItem('token');
          setCurrentUser(null);
        })
        .finally(() => {
          setLoading(false);
          setAuthChecked(true);
        });
    } else {
      setCurrentUser(null);
      setLoading(false);
    }
  }, []); // Empty dependency array to run only once

  const login = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const value = {
    user: currentUser,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
