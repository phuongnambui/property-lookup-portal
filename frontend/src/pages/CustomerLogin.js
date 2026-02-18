import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CustomerLogin.css';

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
      const response = await axios.get(`http://localhost:5001/api/customer/${customerCode}`);
      
      // Store customer data in localStorage
      localStorage.setItem('customerData', JSON.stringify(response.data));
      localStorage.setItem('customerCode', customerCode);
      
      // Navigate to dashboard
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
    <div className="customer-login-container">
      <div className="login-card">
        <img src="/images/logo.png" alt="VNCO SURVEYS" className="logo" />
        <h1>Property Lookup Portal</h1>
        <p className="subtitle">Enter your customer code to view your properties</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="customerCode">Customer Code</label>
            <input
              type="text"
              id="customerCode"
              placeholder="e.g., VNCO-001"
              value={customerCode}
              onChange={(e) => setCustomerCode(e.target.value.toUpperCase())}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'View Properties'}
          </button>
        </form>

        <div className="footer-text">
          <p>Don't have a customer code? Contact VNCO SURVEYS</p>
          <a href="/admin">Admin Login</a>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;