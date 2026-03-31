import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import './AdminLogin.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // On mount: if a remembered token exists, skip login entirely
  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      // Put it in sessionStorage too so the rest of the app finds it normally
      sessionStorage.setItem('adminToken', savedToken);
      navigate('/admin/dashboard');
    }
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
        localStorage.removeItem('adminToken'); // clear any old remembered token
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

  return (
    <div className="admin-login-container">
      <div className="login-card">
        <div className="admin-badge">Admin Portal</div>
        <h2 className="vnco-title">VNCO SURVEYS</h2>
        <h1>Admin Login</h1>
        <p className="subtitle">Manage customer properties and data</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter username"
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

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="footer-text">
          <a href="/">← Back to Customer Portal</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;