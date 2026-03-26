// pages/PropertyDetail.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './PropertyDetail.css';

// ─── Stage order ──────────────────────────────────────────────────────────────

const STAGES = [
  { key: 'Request Received',       label: 'Request\nReceived' },
  { key: 'Surveyed',               label: 'Surveyed' },
  { key: 'Certificate Processing', label: 'Certificate\nProcessing' },
  { key: 'Submitted to City',      label: 'Submitted\nto City' },
  { key: 'Pass',                   label: 'Pass' },
];

// ─── Timeline ─────────────────────────────────────────────────────────────────

function Timeline({ currentStatus }) {
  const isFail = currentStatus === 'Fail';
  const currentIndex = STAGES.findIndex((s) => s.key === currentStatus);
  const displayStages = isFail
    ? [...STAGES, { key: 'Fail', label: 'Fail' }]
    : STAGES;

    const getState = (stageKey, index) => {
      if (isFail) return stageKey === 'Fail' ? 'fail' : 'completed';
      if (index < currentIndex)  return 'completed';
      if (index === currentIndex) return currentStatus === 'Pass' ? 'completed' : 'current';
      return 'pending';
    };

  return (
    <div className="tl-wrapper">
      <div className="tl-track">
        {displayStages.map((stage, i) => {
          const state   = getState(stage.key, i);
          const isLast  = i === displayStages.length - 1;
          // connector is "done" if this node AND the next are completed/fail
          const nextState = !isLast ? getState(displayStages[i + 1].key, i + 1) : null;
          const connDone  = state === 'completed' && (nextState === 'completed' || nextState === 'current' || nextState === 'fail');

          return (
            <React.Fragment key={stage.key}>
              <div className={`tl-node tl-${state}`}>
                <div className="tl-circle">
                  {state === 'completed' && <span>✓</span>}
                  {state === 'fail'      && <span>✕</span>}
                </div>
                {state === 'current' && <div className="tl-pulse" />}
                <div className="tl-label">
                  {stage.label.split('\n').map((line, j) => (
                    <span key={j}>{line}<br /></span>
                  ))}
                </div>
              </div>
              {!isLast && (
                <div className={`tl-connector ${connDone ? 'tl-conn-done' : 'tl-conn-pending'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PropertyDetail() {
  const [property, setProperty]         = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [imgLoaded, setImgLoaded]       = useState(false);
  const navigate = useNavigate();
  const { id }   = useParams();

  useEffect(() => {
    const storedProperty = sessionStorage.getItem('selectedProperty');
    const storedCustomer = sessionStorage.getItem('customerData');
    if (!storedProperty || !storedCustomer) { navigate('/'); return; }
    try {
      setProperty(JSON.parse(storedProperty));
      setCustomerData(JSON.parse(storedCustomer));
    } catch { navigate('/'); }
  }, [navigate, id]);

  if (!property || !customerData) return null;

  const isPass   = property.current_status === 'Pass';
  const isFail   = property.current_status === 'Fail';
  const badgeCls = isPass ? 'badge-pass' : isFail ? 'badge-fail' : 'badge-progress';

  return (
    <div className="pd-root">

      {/* Nav */}
      <nav className="pd-nav">
        <div className="pd-nav-left">
          <button className="pd-back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
          <span className="pd-nav-brand">VNCO SURVEYS</span>
        </div>
        <span className="pd-nav-client">{customerData.customer?.company_name || customerData.company_name}</span>
      </nav>

      {/* Hero */}
      <div className="pd-hero">
        <div className="pd-hero-inner">
          <div className="pd-hero-meta">
            <span className="pd-service-tag">{property.service_type}</span>
            {property.attempt_number > 1 && (
              <span className="pd-attempt-tag">Attempt #{property.attempt_number}</span>
            )}
          </div>
          <h1 className="pd-address">{property.address}</h1>
          <span className={`pd-status-badge ${badgeCls}`}>{property.current_status}</span>
        </div>
      </div>

      {/* Content */}
      <div className="pd-content">

        <div className="pd-card">
          <p className="pd-card-title">Certification Progress</p>
          <Timeline currentStatus={property.current_status} />
        </div>

        {property.has_deficiency && (
          <div className="pd-card pd-deficiency-card">
            <div className="pd-deficiency-header">
              <span className="pd-def-icon">⚠️</span>
              <div>
                <p className="pd-card-title" style={{ marginBottom: 4 }}>Deficiency Recorded</p>
                <p className="pd-def-note">
                  A deficiency was identified during the survey. Please review
                  and address the issue before resubmission.
                </p>
              </div>
            </div>
            {property.deficiency_photo_url ? (
              <div className="pd-photo-wrap">
                {!imgLoaded && <div className="pd-skeleton">Loading photo…</div>}
                <img
                  src={property.deficiency_photo_url}
                  alt="Deficiency"
                  className={`pd-photo ${imgLoaded ? 'img-show' : 'img-hide'}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgLoaded(true)}
                />
              </div>
            ) : (
              <p className="pd-no-photo">Photo not yet uploaded.</p>
            )}
          </div>
        )}

        <div className="pd-card">
          <p className="pd-card-title">Property Details</p>
          <div className="pd-details-grid">
            <div className="pd-detail-item">
              <span className="pd-detail-label">Service Type</span>
              <span className="pd-detail-value">{property.service_type}</span>
            </div>
            <div className="pd-detail-item">
              <span className="pd-detail-label">Submission Date</span>
              <span className="pd-detail-value">{property.submission_date || '—'}</span>
            </div>
            <div className="pd-detail-item">
              <span className="pd-detail-label">Attempt</span>
              <span className="pd-detail-value">#{property.attempt_number}</span>
            </div>
            <div className="pd-detail-item">
              <span className="pd-detail-label">Deficiency</span>
              <span className="pd-detail-value">{property.has_deficiency ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}