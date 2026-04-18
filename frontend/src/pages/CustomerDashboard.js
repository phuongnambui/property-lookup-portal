import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import './CustomerDashboard.css';

const FILTERS = ['All', 'In Progress', 'Passed', 'Failed', 'Cancelled'];

function normalise(status) {
  return (status || '').trim().toLowerCase();
}

function isCancelled(status) { return normalise(status) === 'cancelled'; }
function isPassed(status)    { return normalise(status) === 'passed'; }
function isFailed(status)    { return normalise(status) === 'failed'; }
function isCompleted(status) { return isPassed(status) || isFailed(status); }

function getStatusColor(status) {
  const n = normalise(status);
  if (n === 'passed')            return 'status-pass';
  if (n === 'failed')            return 'status-fail';
  if (n === 'cancelled')         return 'status-cancelled';
  if (n === 'submitted to city') return 'status-submitted';
  if (n === 'processing')        return 'status-processing';
  if (n === 'request received')  return 'status-received';
  return '';
}

const CustomerDashboard = () => {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('All');
  const [search, setSearch]             = useState('');
  const navigate = useNavigate();

  function fetchData() {
    const code = sessionStorage.getItem('customerCode');
    if (!code) { navigate('/'); return; }
    setLoading(true);
    axios.get(`${config.apiUrl}/api/customer/${code}`)
      .then((res) => {
        setCustomerData(res.data);
        sessionStorage.setItem('customerData', JSON.stringify(res.data));
      })
      .catch(() => {
        const cached = sessionStorage.getItem('customerData');
        if (cached) {
          setCustomerData(JSON.parse(cached));
        } else {
          navigate('/');
        }
      })
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, []);

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
    if (filter === 'All')         { /* no status filter */ }
    else if (filter === 'Cancelled')   { if (!isCancelled(p.current_status)) return false; }
    else if (filter === 'Passed')      { if (!isPassed(p.current_status)) return false; }
    else if (filter === 'Failed')      { if (!isFailed(p.current_status)) return false; }
    else if (filter === 'In Progress') { if (isCompleted(p.current_status) || isCancelled(p.current_status)) return false; }

    if (search) {
      const q = search.toLowerCase();
      return (
        p.address?.toLowerCase().includes(q) ||
        p.municipality?.toLowerCase().includes(q) ||
        p.service_type?.toLowerCase().includes(q)
      );
    }
    return true;
  }) || [];

  const getCount = (f) => {
    if (!customerData) return 0;
    const all = customerData.properties;
    if (f === 'All')         return all.length;
    if (f === 'Cancelled')   return all.filter(p => isCancelled(p.current_status)).length;
    if (f === 'Passed')      return all.filter(p => isPassed(p.current_status)).length;
    if (f === 'Failed')      return all.filter(p => isFailed(p.current_status)).length;
    if (f === 'In Progress') return all.filter(p => !isCompleted(p.current_status) && !isCancelled(p.current_status)).length;
    return 0;
  };

  if (loading) return <div className="dashboard-loading">Loading…</div>;
  if (!customerData) return null;

  const companyName  = customerData.company_name  || customerData.customer?.company_name;
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
          <button className="refresh-btn" onClick={fetchData}>↺ Refresh</button>
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
                <span className="filter-count">{getCount(f)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="cd-search-row">
          <input
            className="cd-search"
            placeholder="Search address, municipality, or service…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ── Desktop Table ── */}
        <div className="table-container">
          <table className="property-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Address</th>
                <th>Municipality</th>
                <th>Service Type</th>
                <th>Submission Date</th>
                <th>Status</th>
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
                    <td>{property.municipality || '—'}</td>
                    <td>{property.service_type}</td>
                    <td>{property.submission_date || '—'}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(property.current_status)}`}>
                        {property.current_status}
                      </span>
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

        {/* ── Mobile Cards ── */}
        <div className="property-cards">
          {filteredProperties.length === 0 ? (
            <div className="empty-cards">No properties found.</div>
          ) : (
            filteredProperties.map((property, index) => (
              <div key={property.id} className="property-card">
                <div className="card-top">
                  <div className="card-index">#{index + 1}</div>
                  <span className={`status-badge ${getStatusColor(property.current_status)}`}>
                    {property.current_status}
                  </span>
                </div>
                <div className="card-address">{property.address}</div>
                <div className="card-meta">
                  {property.municipality && (
                    <span className="card-meta-item">
                      <span className="card-meta-label">Municipality</span>
                      {property.municipality}
                    </span>
                  )}
                  <span className="card-meta-item">
                    <span className="card-meta-label">Service</span>
                    {property.service_type}
                  </span>
                  <span className="card-meta-item">
                    <span className="card-meta-label">Submitted</span>
                    {property.submission_date || '—'}
                  </span>
                </div>
                <div className="card-footer">
                  <button className="view-btn" onClick={() => handlePropertyClick(property)}>
                    View Timeline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default CustomerDashboard;