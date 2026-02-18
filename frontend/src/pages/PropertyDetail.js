import config from '../config';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Timeline from '../components/Timeline';
import './PropertyDetail.css';

const PropertyDetail = () => {
  const [property, setProperty] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const storedProperty = localStorage.getItem('selectedProperty');
    const storedCustomer = localStorage.getItem('customerData');

    if (!storedProperty || !storedCustomer) {
      navigate('/');
      return;
    }

    setProperty(JSON.parse(storedProperty));
    setCustomerData(JSON.parse(storedCustomer));
  }, [navigate, id]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (!property || !customerData) return null;

  return (
    <div className="property-detail-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <h2 className="navbar-title">VNCO SURVEYS</h2>
          <span className="navbar-subtitle">Property Details</span>
        </div>
        <div className="navbar-right">
          <span className="customer-name">{customerData.customer.company_name}</span>
          <button className="back-btn" onClick={handleBack}>
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="detail-content">
        <div className="detail-card">
          {/* Property Header */}
          <div className="property-header">
            <div>
              <h1>{property.address}</h1>
              <p className="property-meta">
                {property.service_type} • Ordered on {property.order_date}
              </p>
            </div>
            {property.attempt_number > 1 && (
              <div className="attempt-badge">
                Attempt #{property.attempt_number}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="timeline-section">
            <h2>Status Timeline</h2>
            <Timeline
              statusHistory={property.status_history}
              currentStatus={property.current_status}
            />
          </div>

          {/* Deficiency Photo */}
          {property.has_deficiency && property.deficiency_photo_url && (
            <div className="deficiency-section">
              <h2>Deficiency Photo</h2>
              <div className="photo-container">
              <img
                src={`${config.apiUrl}/${property.deficiency_photo_url}`}
                alt="Deficiency"
                className="deficiency-photo"
              />
              </div>
            </div>
          )}

          {/* Property Details */}
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Service Type</span>
              <span className="detail-value">{property.service_type}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Order Date</span>
              <span className="detail-value">{property.order_date}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Current Status</span>
              <span className="detail-value">{property.current_status}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Has Deficiency</span>
              <span className="detail-value">{property.has_deficiency ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;