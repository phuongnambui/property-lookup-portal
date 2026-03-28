import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import './CustomerDashboard.css';

const FILTERS = ['All', 'In Progress', 'Completed'];

function normalise(status) {
  return (status || '').trim().toLowerCase();
}

function isCompleted(status) {
  const n = normalise(status);
  return n === 'passed' || n === 'failed';
}

function getStatusColor(status) {
  const n = normalise(status);
  if (n === 'passed')           return 'status-pass';
  if (n === 'failed')           return 'status-fail';
  if (n === 'submitted to city') return 'status-submitted';
  if (n === 'processing')        return 'status-processing';
  if (n === 'request received')  return 'status-received';
  return '';
}

const CustomerDashboard = () => {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const code = sessionStorage.getItem('customerCode');
    if (!code) { navigate('/'); return; }

    // Always fetch fresh from API — never rely on cached sessionStorage data
    axios.get(`${config.apiUrl}/api/customer/${code}`)
      .then((res) => {
        setCustomerData(res.data);
        // Update sessionStorage with fresh data
        sessionStorage.setItem('customerData', JSON.stringify(res.data));
      })
      .catch(() => {
        // If fetch fails, fall back to cached data
        const cached = sessionStorage.getItem('customerData');
        if (cached) {
          setCustomerData(JSON.parse(cached));
        } else {
          navigate('/');
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('customerData');
    sessionStorage.removeItem('customerCode');
    navigate('/');
  };

  const handlePropertyClick = (property) => {
    sessionStorage.setItem('selectedProperty', JSON.stringify(property));
    sessionStorage.setItem('customerData', JSON.stringify(customerData));
    navigate(`/property/${property.id}`);
  };

  const filteredProperties = customerData?.properties.filter((p) => {
    if (filter === 'All')         return true;
    if (filter === 'Completed')   return isCompleted(p.current_status);
    if (filter === 'In Progress') return !isCompleted(p.current_status);
    return true;
  }) || [];

  if (loading) return <div className="dashboard-loading">Loading…</div>;
  if (!customerData) return null;

  const companyName = customerData.company_name || customerData.customer?.company_name;
  const customerCode = customerData.customer_code || customerData.customer?.customer_code;

  return (
    <div className="dashboard-container">

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <a href="https://vncosurveys.com" target="_blank" rel="noreferrer">
            <img src="/images/logo.png" alt="VNCO SURVEYS" className="navbar-logo" />
          </a>
          <span className="navbar-subtitle">Property Lookup Portal</span>
        </div>
        <div className="navbar-right">
          <span className="customer-name">{companyName}</span>
          <span className="customer-code">{customerCode}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Your Properties</h1>
            <p>{filteredProperties.length} of {customerData.properties.length} properties</p>
          </div>

          <div className="filter-tabs">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? 'filter-tab-active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
                <span className="filter-count">
                  {f === 'All'         ? customerData.properties.length
                   : f === 'Completed' ? customerData.properties.filter(p => isCompleted(p.current_status)).length
                   :                    customerData.properties.filter(p => !isCompleted(p.current_status)).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="table-container">
          <table className="property-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Address</th>
                <th>Service Type</th>
                <th>Submission Date</th>
                <th>Status</th>
                <th>Deficiency</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-row">No properties found.</td>
                </tr>
              ) : (
                filteredProperties.map((property, index) => (
                  <tr key={property.id}>
                    <td>{index + 1}</td>
                    <td className="address-cell">{property.address}</td>
                    <td>{property.service_type}</td>
                    <td>{property.submission_date || '—'}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(property.current_status)}`}>
                        {property.current_status}
                      </span>
                    </td>
                    <td className="deficiency-cell">
                      {property.has_deficiency ? (
                        <span className="deficiency-flag">⚠️ Yes</span>
                      ) : (
                        <span className="no-deficiency">—</span>
                      )}
                    </td>
                    <td>
                      <button className="view-btn" onClick={() => handlePropertyClick(property)}>
                        View Timeline
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;