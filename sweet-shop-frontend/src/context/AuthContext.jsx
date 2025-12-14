import React, { createContext, useEffect, useState } from 'react';
import api from '../api/axios';
import jwt_decode from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      setToken(parsed.token);
      setUser(parsed.user);
      api.setToken(parsed.token);
    }
  }, []);

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token, id, name: rname, email: remail } = res.data;
    const userObj = { id, name: rname, email: remail, role: jwt_decode(token).role };
    localStorage.setItem('auth', JSON.stringify({ token, user: userObj }));
    api.setToken(token);
    setToken(token);
    setUser(userObj);
    return { user: userObj };
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, id, name, email: userEmail } = res.data;
    const userObj = { id, name, email: userEmail, role: jwt_decode(token).role };
    localStorage.setItem('auth', JSON.stringify({ token, user: userObj }));
    api.setToken(token);
    setToken(token);
    setUser(userObj);
    return { user: userObj };
  };

  const loginWithGoogle = async (idToken) => {
    const res = await api.post('/auth/google', { idToken });
    const { token, id, name, email: userEmail } = res.data;
    const userObj = { id, name, email: userEmail, role: jwt_decode(token).role };
    localStorage.setItem('auth', JSON.stringify({ token, user: userObj }));
    api.setToken(token);
    setToken(token);
    setUser(userObj);
    return { user: userObj };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    api.setToken(null);
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ user, token, register, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
