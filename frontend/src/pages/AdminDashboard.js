import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'properties'
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const [customersRes, propertiesRes] = await Promise.all([
        axios.get('http://localhost:5001/api/admin/customers', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5001/api/admin/properties', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setCustomers(customersRes.data.customers);
      setProperties(propertiesRes.data.properties);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadStatus('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a CSV file first');
      return;
    }

    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('csvFile', selectedFile);

    setLoading(true);
    setUploadStatus('');

    try {
      const response = await axios.post('http://localhost:5001/api/admin/upload-csv', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadStatus(`✓ Success! Imported ${response.data.customersImported} customers and ${response.data.propertiesImported} properties`);
      setSelectedFile(null);
      fetchData(); // Refresh data
    } catch (err) {
      setUploadStatus('✗ Error uploading file. Please check format and try again.');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="admin-dashboard-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <h2 className="navbar-title">VNCO SURVEYS</h2>
          <span className="navbar-subtitle">Admin Dashboard</span>
        </div>
        <div className="navbar-right">
          <span className="admin-badge-nav">Admin</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="admin-content">
        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            📤 Upload CSV
          </button>
          <button
            className={`tab ${activeTab === 'properties' ? 'active' : ''}`}
            onClick={() => setActiveTab('properties')}
          >
            📋 View Properties ({properties.length})
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="tab-content">
            <div className="upload-section">
              <h2>Upload CSV File</h2>
              <p className="section-description">
                Upload a CSV file to update customer and property data. The file should include columns:
                customer_code, company_name, address, service_type, order_date, current_status, status_history, has_deficiency, deficiency_photo_url, attempt_number
              </p>

              <div className="upload-box">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  id="csv-upload"
                  className="file-input"
                />
                <label htmlFor="csv-upload" className="file-label">
                  {selectedFile ? (
                    <div className="file-selected">
                      <span className="file-icon">📄</span>
                      <span className="file-name">{selectedFile.name}</span>
                    </div>
                  ) : (
                    <div className="file-placeholder">
                      <span className="upload-icon">📁</span>
                      <span>Click to select CSV file</span>
                    </div>
                  )}
                </label>
              </div>

              {uploadStatus && (
                <div className={`upload-status ${uploadStatus.includes('✓') ? 'success' : 'error'}`}>
                  {uploadStatus}
                </div>
              )}

              <button
                className="upload-btn"
                onClick={handleUpload}
                disabled={loading || !selectedFile}
              >
                {loading ? 'Uploading...' : 'Upload and Import'}
              </button>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{customers.length}</div>
                  <div className="stat-label">Total Customers</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{properties.length}</div>
                  <div className="stat-label">Total Properties</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="tab-content">
            <div className="properties-section">
              <h2>All Properties</h2>
              
              <div className="table-container">
                <table className="property-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Address</th>
                      <th>Service Type</th>
                      <th>Order Date</th>
                      <th>Current Status</th>
                      <th>Attempt</th>
                      <th>Deficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property) => (
                      <tr key={property.id}>
                        <td>{property.id}</td>
                        <td className="customer-cell">
                            <div className="customer-name">
                                {customers.find(c => c.customer_code === property.customer_code)?.company_name || 'Unknown'}
                            </div>
                            <div className="customer-code-small">{property.customer_code}</div>
                        </td>
                        <td className="address-cell">{property.address}</td>
                        <td>{property.service_type}</td>
                        <td>{property.order_date}</td>
                        <td>
                          <span className={`status-badge ${getStatusColor(property.current_status)}`}>
                            {property.current_status}
                          </span>
                        </td>
                        <td>{property.attempt_number}</td>
                        <td>{property.has_deficiency ? 'Yes' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;