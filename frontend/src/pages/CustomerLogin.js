import config from '../config';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const CustomerLogin = () => {
  const [customerCode, setCustomerCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.get(`${config.apiUrl}/api/customer/${customerCode}`);
      sessionStorage.setItem('customerData', JSON.stringify(response.data));
      sessionStorage.setItem('customerCode', customerCode);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Customer code not found. Please check and try again.');
      } else {
        setError('Unable to connect to server. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <main className="auth-main">
        <div className="auth-panel">
          <a href="https://vncosurveys.com" target="_blank" rel="noopener noreferrer">
            <img src="/images/logo.png" alt="VNCO SURVEYS" className="logo" />
          </a>
          <p className="auth-eyebrow">Property Lookup Portal</p>
          <h1>Find your properties</h1>
          <p className="subtitle">Enter the customer code VNCO gave you.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="customerCode">Customer code</label>
              <input
                type="text"
                id="customerCode"
                placeholder="e.g., VNCO-001"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                value={customerCode}
                onChange={(e) => setCustomerCode(e.target.value.toUpperCase())}
                required
              />
            </div>
            {error && <div className="error-message" role="alert">{error}</div>}
            <button type="submit" disabled={loading}>
              {loading ? 'Looking up…' : 'View properties'}
            </button>
          </form>
          <div className="footer-text">
            <p>Don't have a code? <a href="https://vncosurveys.com/contact-us-1" target="_blank" rel="noopener noreferrer">Contact VNCO SURVEYS</a></p>
            <a href="/admin" className="muted-link">Admin login</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerLogin;