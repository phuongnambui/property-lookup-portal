import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import './Auth.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (!savedToken) {
      setChecking(false);
      return;
    }

    axios.get(`${config.apiUrl}/api/admin/verify`, {
      headers: { Authorization: `Bearer ${savedToken}` }
    })
      .then(() => {
        sessionStorage.setItem('adminToken', savedToken);
        navigate('/admin/dashboard');
      })
      .catch(() => {
        localStorage.removeItem('adminToken');
        setChecking(false);
      });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(`${config.apiUrl}/api/admin/login`, {
        username,
        password,
      });
      const token = response.data.token;
      sessionStorage.setItem('adminToken', token);
      if (rememberMe) {
        localStorage.setItem('adminToken', token);
      } else {
        localStorage.removeItem('adminToken');
      }
      navigate('/admin/dashboard');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid username or password');
      } else {
        setError('Unable to connect to server. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) return (
    <div className="auth-shell">
      <main className="auth-main">
        <p className="auth-loading">Loading…</p>
      </main>
    </div>
  );

  return (
    <div className="auth-shell">
      <main className="auth-main">
        <div className="auth-panel">
          <a href="https://vncosurveys.com" target="_blank" rel="noopener noreferrer">
            <img src="/images/logo.png" alt="VNCO SURVEYS" className="logo" />
          </a>
          <p className="auth-eyebrow">Admin portal</p>
          <h1>Sign in</h1>
          <p className="subtitle">Manage customer properties and data.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Enter username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe">Remember this device</label>
            </div>
            {error && <div className="error-message" role="alert">{error}</div>}
            <button type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <div className="footer-text">
            <a href="/">← Back to customer portal</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;