import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../api/axios';
import { useAuthContext, GoogleSignInButton } from '../App';

export default function LoginPage({ defaultTab = 'login' }) {
  const [tab, setTab] = useState(defaultTab);
  const [fields, setFields] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { saveAuth, user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    if (user) {
      const redirectPath = new URLSearchParams(location.search).get('redirect') || '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, location.search]);

  const handleInput = e => setFields(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      let res;
      if (tab === 'register') {
        res = await axios.post('/auth/register', { name: fields.name, email: fields.email, password: fields.password });
      } else {
        res = await axios.post('/auth/login', { email: fields.email, password: fields.password });
      }
      const userObj = {
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        role: (() => {
          try {
            return JSON.parse(atob(res.data.token.split('.')[1])).role;
          } catch {
            return 'user';
          }
        })()
      };
      saveAuth({ token: res.data.token, user: userObj });
      setFields({ name: '', email: '', password: '' });
      const redirectPath = new URLSearchParams(location.search).get('redirect') || '/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="auth-page"
    >
      <div className="auth-page-container">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="auth-page-content"
        >
          <h2 className="auth-page-title">Welcome</h2>
          <p className="auth-page-subtitle">
            {tab === 'login' ? 'Sign in to your account' : 'Create your new account'}
          </p>

          <div className="tabs">
            <button
              className={`tab ${tab === 'login' ? 'tab-active' : ''}`}
              onClick={() => { setTab('login'); setError(null); }}
            >
              Sign In
            </button>
            <button
              className={`tab ${tab === 'register' ? 'tab-active' : ''}`}
              onClick={() => { setTab('register'); setError(null); }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {tab === 'register' && (
              <input
                name="name"
                autoComplete="name"
                value={fields.name}
                onChange={handleInput}
                placeholder="Full Name"
                required
                className="auth-input"
              />
            )}
            <input
              name="email"
              autoComplete="email"
              value={fields.email}
              onChange={handleInput}
              placeholder="Email Address"
              type="email"
              required
              className="auth-input"
            />
            <input
              name="password"
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              value={fields.password}
              onChange={handleInput}
              placeholder="Password"
              type="password"
              required
              className="auth-input"
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="error-message"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="auth-submit-btn premium-btn"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <span className="spinner"></span>
                  {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                tab === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <GoogleSignInButton
            onSuccess={() => {
              const redirectPath = new URLSearchParams(location.search).get('redirect') || '/dashboard';
              navigate(redirectPath, { replace: true });
            }}
            onError={err => setError(err.response?.data?.message || 'Google authentication failed')}
            className="w-full"
          />

          <div className="auth-page-footer">
            {tab === 'login' ? (
              <>
                Don't have an account?{' '}
                <button type="button" onClick={() => setTab('register')} className="auth-link">
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => setTab('login')} className="auth-link">
                  Sign In
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
