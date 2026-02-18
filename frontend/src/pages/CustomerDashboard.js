import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const [customerData, setCustomerData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem('customerData');
    if (!data) {
      navigate('/');
      return;
    }
    setCustomerData(JSON.parse(data));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('customerData');
    localStorage.removeItem('customerCode');
    navigate('/');
  };

  const handlePropertyClick = (property) => {
    localStorage.setItem('selectedProperty', JSON.stringify(property));
    navigate(`/property/${property.id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pass': return 'status-pass';
      case 'Fail': return 'status-fail';
      case 'Submitted to City': return 'status-submitted';
      case 'Certificate Processing': return 'status-processing';
      case 'Surveyed': return 'status-surveyed';
      case 'Request Received': return 'status-received';
      default: return '';
    }
  };

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
          <span className="customer-name">
            {customerData.customer.company_name}
          </span>
          <span className="customer-code">
            {customerData.customer.customer_code}
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Your Properties</h1>
          <p>{customerData.properties.length} properties found</p>
        </div>

        {/* Property Table */}
        <div className="table-container">
          <table className="property-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Address</th>
                <th>Service Type</th>
                <th>Order Date</th>
                <th>Current Status</th>
                <th>Attempt</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {customerData.properties.map((property, index) => (
                <tr key={property.id}>
                  <td>{index + 1}</td>
                  <td className="address-cell">{property.address}</td>
                  <td>{property.service_type}</td>
                  <td>{property.order_date}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(property.current_status)}`}>
                      {property.current_status}
                    </span>
                  </td>
                  <td className="attempt-cell">
                    {property.attempt_number > 1
                      ? `Attempt ${property.attempt_number}`
                      : '-'}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;