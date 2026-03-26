import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerDashboard.css';

const FILTERS = ['All', 'In Progress', 'Completed'];

const CustomerDashboard = () => {
  const [customerData, setCustomerData] = useState(null);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const data = sessionStorage.getItem('customerData');
    if (!data) { navigate('/'); return; }
    setCustomerData(JSON.parse(data));
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pass':                   return 'status-pass';
      case 'Fail':                   return 'status-fail';
      case 'Submitted to City':      return 'status-submitted';
      case 'Certificate Processing': return 'status-processing';
      case 'Surveyed':               return 'status-surveyed';
      case 'Request Received':       return 'status-received';
      default: return '';
    }
  };

  const isCompleted = (status) => status === 'Pass' || status === 'Fail';

  const filteredProperties = customerData?.properties.filter((p) => {
    if (filter === 'All')         return true;
    if (filter === 'Completed')   return isCompleted(p.current_status);
    if (filter === 'In Progress') return !isCompleted(p.current_status);
    return true;
  }) || [];

  if (!customerData) return null;

  return (
    <div className="dashboard-container">

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <h2 className="navbar-title">VNCO SURVEYS</h2>
          <span className="navbar-subtitle">Property Lookup Portal</span>
        </div>
        <div className="navbar-right">
          <span className="customer-name">{customerData.customer?.company_name || customerData.company_name}</span>
          <span className="customer-code">{customerData.customer?.customer_code || customerData.customer_code}</span>
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

          {/* Filter tabs */}
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

        {/* Property Table */}
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
                      <button
                        className="view-btn"
                        onClick={() => handlePropertyClick(property)}
                      >
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