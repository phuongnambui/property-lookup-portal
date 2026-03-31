// pages/AdminDashboard.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import config from '../config';
import './AdminDashboard.css';

const STAGES = [
  'Request Received',
  'Processing',
  'Submitted to City',
  'Passed',
  'Failed',
  'Cancelled',
];

function normalise(status) {
  return (status || '').trim().toLowerCase();
}

function StatusBadge({ status }) {
  const n = normalise(status);
  const cls =
    n === 'passed'      ? 'badge-pass'
    : n === 'failed'    ? 'badge-fail'
    : n === 'cancelled' ? 'badge-cancelled'
    : 'badge-progress';
  return <span className={`ad-badge ${cls}`}>{status}</span>;
}

function PhotoUploadModal({ property, onClose, onSuccess, onRemove }) {
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(property.deficiency_photo_url || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const inputRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const token = sessionStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('rowId', property.id);
      const res = await axios.post(`${config.apiUrl}/api/admin/upload-photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      onSuccess(property.id, res.data.photoUrl);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Deficiency Photo</h3>
            <p className="modal-subtitle">{property.address}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div
          className="drop-zone"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current.click()}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="drop-preview" />
          ) : (
            <div className="drop-placeholder">
              <span className="drop-icon">📷</span>
              <span className="drop-label">Drop image here or click to browse</span>
              <span className="drop-hint">JPG, PNG, WEBP, HEIC · max 15 MB</span>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFile}
          />
        </div>
        {error && <p className="modal-error">{error}</p>}
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          {property.deficiency_photo_url && (
            <button
              className="btn-secondary"
              style={{ color: '#dc2626', borderColor: '#dc2626' }}
              onClick={() => onRemove(property.id)}
            >
              Remove Photo
            </button>
          )}
          <button className="btn-primary" onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? 'Uploading…' : 'Upload Photo'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusUpdateModal({ property, onClose, onSuccess }) {
  const [selected, setSelected] = useState(property.current_status);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const handleSave = async () => {
    if (selected === property.current_status) { onClose(); return; }
    setSaving(true);
    setError('');
    try {
      const token = sessionStorage.getItem('adminToken');
      await axios.patch(
        `${config.apiUrl}/api/admin/properties/${property.id}/status`,
        { status: selected },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onSuccess(property.id, selected);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Update Status</h3>
            <p className="modal-subtitle">{property.address}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="stage-picker">
          {STAGES.map((stage) => (
            <button
              key={stage}
              className={`stage-option ${selected === stage ? 'stage-option-active' : ''} ${stage === 'Cancelled' ? 'stage-option-cancel' : ''}`}
              onClick={() => setSelected(stage)}
            >
              {stage}
            </button>
          ))}
        </div>
        {error && <p className="modal-error">{error}</p>}
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving || selected === property.current_status}
          >
            {saving ? 'Saving…' : 'Save Status'}
          </button>
        </div>
      </div>
    </div>
  );
}

const TERMINAL = ['Passed', 'Cancelled'];

export default function AdminDashboard() {
  const [properties, setProperties]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [photoModal, setPhotoModal]     = useState(null);
  const [statusModal, setStatusModal]   = useState(null);
  const [jobNumbers, setJobNumbers]     = useState({});

  useEffect(() => { fetchProperties(); }, []);

  useEffect(() => {
    const init = {};
    properties.forEach((p) => { init[p.id] = p.job_number || ''; });
    setJobNumbers(init);
  }, [properties]);

  const fetchProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const token = sessionStorage.getItem('adminToken');
      const res = await axios.get(`${config.apiUrl}/api/admin/properties`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties(res.data.properties || res.data);
    } catch (err) {
      setError('Failed to load properties. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSuccess = (rowId, photoUrl) => {
    setProperties((prev) =>
      prev.map((p) => p.id === rowId ? { ...p, deficiency_photo_url: photoUrl } : p)
    );
  };

  const handleStatusSuccess = (rowId, newStatus) => {
    setProperties((prev) =>
      prev.map((p) => p.id === rowId ? { ...p, current_status: newStatus } : p)
    );
  };

  const handleJobNumberChange = (rowId, value) => {
    setJobNumbers((prev) => ({ ...prev, [rowId]: value }));
  };

  const handleJobNumberSave = async (rowId) => {
    const value = jobNumbers[rowId] ?? '';
    try {
      const token = sessionStorage.getItem('adminToken');
      await axios.patch(
        `${config.apiUrl}/api/admin/properties/${rowId}/job-number`,
        { jobNumber: value },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (err) {
      console.error('Failed to save job number', err);
    }
  };

  const handleRemovePhoto = async (rowId) => {
    if (!window.confirm('Remove this photo?')) return;
    try {
      const token = sessionStorage.getItem('adminToken');
      await axios.delete(`${config.apiUrl}/api/admin/properties/${rowId}/photo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties((prev) =>
        prev.map((p) => p.id === rowId ? { ...p, deficiency_photo_url: '' } : p)
      );
      setPhotoModal(null);
    } catch (err) {
      console.error('Failed to remove photo', err);
    }
  };

  const filtered = properties.filter((p) => {
    const matchesSearch =
      !search ||
      p.address?.toLowerCase().includes(search.toLowerCase()) ||
      p.customer_code?.toLowerCase().includes(search.toLowerCase()) ||
      p.company_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || p.current_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total:     properties.length,
    active:    properties.filter((p) => !TERMINAL.includes(p.current_status) && p.current_status !== 'Failed').length,
    pass:      properties.filter((p) => p.current_status === 'Passed').length,
    fail:      properties.filter((p) => p.current_status === 'Failed').length,
    cancelled: properties.filter((p) => p.current_status === 'Cancelled').length,
  };

  return (
    <div className="ad-root">
      {/* Nav */}
      <nav className="ad-nav">
        <a href="https://vncosurveys.com" target="_blank" rel="noreferrer">
          <img src="/images/logo.png" alt="VNCO SURVEYS" className="navbar-logo" />
        </a>
        <div className="ad-nav-right">
          <button className="ad-refresh-btn" onClick={fetchProperties}>↺ Refresh</button>
          <button className="ad-refresh-btn" onClick={() => window.location.href = '/'}>Back</button>
          <button
            className="ad-logout-btn"
            onClick={() => {
              sessionStorage.removeItem('adminToken');
              localStorage.removeItem('adminToken');
              window.location.href = '/admin';
            }}
          >
            Log out
          </button>
        </div>
      </nav>

      <div className="ad-content">

        {/* Stats */}
        <div className="ad-stats-row">
          <div className="ad-stat">
            <span className="ad-stat-num">{stats.total}</span>
            <span className="ad-stat-label">Total</span>
          </div>
          <div className="ad-stat">
            <span className="ad-stat-num ad-stat-active">{stats.active}</span>
            <span className="ad-stat-label">In Progress</span>
          </div>
          <div className="ad-stat">
            <span className="ad-stat-num ad-stat-pass">{stats.pass}</span>
            <span className="ad-stat-label">Passed</span>
          </div>
          <div className="ad-stat">
            <span className="ad-stat-num ad-stat-fail">{stats.fail}</span>
            <span className="ad-stat-label">Failed</span>
          </div>
          <div className="ad-stat">
            <span className="ad-stat-num ad-stat-cancelled">{stats.cancelled}</span>
            <span className="ad-stat-label">Cancelled</span>
          </div>
        </div>

        {/* Search + filter */}
        <div className="ad-filters">
          <input
            className="ad-search"
            placeholder="Search address, code, or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="ad-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="ad-loading">Loading properties…</div>
        ) : error ? (
          <div className="ad-error">{error}</div>
        ) : (
          <>
            {/* ── Desktop Table ── */}
            <div className="ad-table-wrapper">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Company</th>
                    <th>Address</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Job #</th>
                    <th>Photo</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="ad-empty">No properties match your search.</td></tr>
                  ) : (
                    filtered.map((p) => (
                      <tr key={p.id}>
                        <td className="ad-code">{p.customer_code}</td>
                        <td>{p.company_name}</td>
                        <td className="ad-address-cell">{p.address}</td>
                        <td className="ad-service">{p.service_type}</td>
                        <td><StatusBadge status={p.current_status} /></td>
                        <td>
                          <input
                            className="ad-job-input"
                            value={jobNumbers[p.id] ?? ''}
                            onChange={(e) => handleJobNumberChange(p.id, e.target.value)}
                            onBlur={() => handleJobNumberSave(p.id)}
                            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                            placeholder="—"
                          />
                        </td>
                        <td className="ad-center">
                          {p.deficiency_photo_url ? (
                            <a href={p.deficiency_photo_url} target="_blank" rel="noreferrer" className="ad-photo-link">View</a>
                          ) : (
                            <span className="ad-none">—</span>
                          )}
                        </td>
                        <td>
                          <div className="ad-action-btns">
                            <button className="ad-action-btn" onClick={() => setStatusModal(p)}>Update Status</button>
                            {normalise(p.current_status) !== 'passed' && normalise(p.current_status) !== 'cancelled' && (
                              <button className="ad-action-btn ad-photo-btn" onClick={() => setPhotoModal(p)}>
                                {p.deficiency_photo_url ? 'Replace Photo' : 'Upload Photo'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="ad-cards">
              {filtered.length === 0 ? (
                <div className="ad-empty-cards">No properties match your search.</div>
              ) : (
                filtered.map((p) => (
                  <div key={p.id} className="ad-card">
                    <div className="ad-card-top">
                      <span className="ad-card-code">{p.customer_code}</span>
                      <StatusBadge status={p.current_status} />
                    </div>
                    <div className="ad-card-address">{p.address}</div>
                    <div className="ad-card-meta">
                      <span className="ad-card-meta-item">
                        <span className="ad-card-meta-label">Company</span>
                        {p.company_name}
                      </span>
                      <span className="ad-card-meta-item">
                        <span className="ad-card-meta-label">Service</span>
                        {p.service_type}
                      </span>
                    </div>
                    <div className="ad-card-meta">
                      <span className="ad-card-meta-item">
                        <span className="ad-card-meta-label">Job #</span>
                        <input
                          className="ad-job-input"
                          value={jobNumbers[p.id] ?? ''}
                          onChange={(e) => handleJobNumberChange(p.id, e.target.value)}
                          onBlur={() => handleJobNumberSave(p.id)}
                          onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                          placeholder="—"
                        />
                      </span>
                      {p.deficiency_photo_url && (
                        <span className="ad-card-meta-item">
                          <span className="ad-card-meta-label">Photo</span>
                          <a href={p.deficiency_photo_url} target="_blank" rel="noreferrer" className="ad-photo-link">View</a>
                        </span>
                      )}
                    </div>
                    <div className="ad-card-footer">
                      <button className="ad-action-btn" onClick={() => setStatusModal(p)}>Update Status</button>
                      {normalise(p.current_status) !== 'passed' && normalise(p.current_status) !== 'cancelled' && (
                        <button className="ad-action-btn ad-photo-btn" onClick={() => setPhotoModal(p)}>
                          {p.deficiency_photo_url ? 'Replace Photo' : 'Upload Photo'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {photoModal && (
        <PhotoUploadModal
          property={photoModal}
          onClose={() => setPhotoModal(null)}
          onSuccess={handlePhotoSuccess}
          onRemove={handleRemovePhoto}
        />
      )}
      {statusModal && (
        <StatusUpdateModal
          property={statusModal}
          onClose={() => setStatusModal(null)}
          onSuccess={handleStatusSuccess}
        />
      )}
    </div>
  );
}