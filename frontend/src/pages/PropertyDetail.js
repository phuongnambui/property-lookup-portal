// pages/PropertyDetail.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './PropertyDetail.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const STAGES = [
  { key: 'Request Received',  label: 'Request\nReceived' },
  { key: 'Processing',        label: 'Processing' },
  { key: 'Submitted to City', label: 'Submitted\nto City' },
  { key: 'Result',            label: 'Result' },
];

function normalise(status) {
  return (status || '').trim().toLowerCase();
}

function isPassed(status)    { return normalise(status) === 'passed'; }
function isFailed(status)    { return normalise(status) === 'failed'; }
function isCancelled(status) { return normalise(status) === 'cancelled'; }
function isResult(status)    { return isPassed(status) || isFailed(status); }

// ─── Timeline ─────────────────────────────────────────────────────────────────
function Timeline({ currentStatus }) {
  if (isCancelled(currentStatus)) {
    return (
      <div className="tl-wrapper">
        <div className="tl-cancelled-node">
          <div className="tl-circle tl-cancelled-circle">
            <span>✕</span>
          </div>
          <div className="tl-label tl-cancelled-label">Request Cancelled</div>
        </div>
      </div>
    );
  }

  const norm = normalise(currentStatus);
  const stageKeyMap = {
    'request received':  0,
    'processing':        1,
    'submitted to city': 2,
    'passed':            3,
    'failed':            3,
  };
  const currentIndex = stageKeyMap[norm] ?? -1;

  const getState = (stageKey, index) => {
    const sk = stageKey.toLowerCase();
    if (sk === 'result') {
      if (isPassed(currentStatus)) return 'pass';
      if (isFailed(currentStatus)) return 'fail';
      return 'pending';
    }
    if (index < currentIndex)  return 'completed';
    if (index === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="tl-wrapper">
      <div className="tl-track">
        {STAGES.map((stage, i) => {
          const state     = getState(stage.key, i);
          const isLast    = i === STAGES.length - 1;
          const nextState = !isLast ? getState(STAGES[i + 1].key, i + 1) : null;
          const connDone  = state === 'completed' &&
            (nextState === 'completed' || nextState === 'current' ||
             nextState === 'pass'      || nextState === 'fail');

          const displayLabel =
            stage.key === 'Result' && isResult(currentStatus)
              ? (isPassed(currentStatus) ? 'Passed' : 'Failed')
              : stage.label;

          return (
            <React.Fragment key={stage.key}>
              <div className={`tl-node tl-${state}`}>
                <div className="tl-circle">
                  {state === 'completed' && <span>✓</span>}
                  {state === 'pass'      && <span>✓</span>}
                  {state === 'fail'      && <span>✕</span>}
                  {state === 'current'   && <span>✓</span>}
                </div>
                {state === 'current' && <div className="tl-pulse" />}
                <div className="tl-label">
                  {displayLabel.split('\n').map((line, j) => (
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

// ─── PDF Viewer Modal ─────────────────────────────────────────────────────────
function PdfViewerModal({ url, onClose }) {
  useEffect(() => {
    window.open(url, '_blank');
    onClose();
  }, []);

  return null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PropertyDetail() {
  const [property, setProperty]         = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [imgLoaded, setImgLoaded]       = useState(false);
  const [pdfOpen, setPdfOpen]           = useState(false);
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

  const passed    = isPassed(property.current_status);
  const cancelled = isCancelled(property.current_status);

  const badgeCls = passed                          ? 'badge-pass'
    : isFailed(property.current_status) ? 'badge-fail'
    : cancelled                         ? 'badge-cancelled'
    :                                     'badge-progress';

  return (
    <div className="pd-root">
      {/* Nav */}
      <nav className="pd-nav">
        <div className="pd-nav-left">
          <button className="pd-back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
          <a href="https://vncosurveys.com" target="_blank" rel="noreferrer">
            <img src="/images/logo.png" alt="VNCO SURVEYS" className="navbar-logo" />
          </a>
        </div>
        <span className="pd-nav-client">
          {customerData.customer?.company_name || customerData.company_name}
        </span>
      </nav>

      {/* Hero */}
      <div className="pd-hero">
        <div className="pd-hero-inner">
          <div className="pd-hero-meta">
            <span className="pd-service-tag">{property.service_type}</span>
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

        {/* Deficiency photo */}
        {property.deficiency_photo_url && !passed && !cancelled && (
          <div className="pd-card pd-deficiency-card">
            <div className="pd-deficiency-header">
              <span className="pd-def-icon">⚠️</span>
              <div>
                <p className="pd-card-title" style={{ marginBottom: 4 }}>Deficiency Recorded</p>
              </div>
            </div>
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
          </div>
        )}

        {/* Deficiency PDF */}
        {property.deficiency_pdf_url && !passed && !cancelled && (
          <div className="pd-card pd-deficiency-card">
            <div className="pd-deficiency-header">
              <span className="pd-def-icon">📄</span>
              <div>
                <p className="pd-card-title" style={{ marginBottom: 4 }}>Deficiency Report</p>
              </div>
            </div>
            <button className="pd-pdf-btn" onClick={() => setPdfOpen(true)}>
              View PDF Report
            </button>
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
              <span className="pd-detail-label">Job Number</span>
              <span className="pd-detail-value">{property.job_number || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {pdfOpen && property.deficiency_pdf_url && (
        <PdfViewerModal url={property.deficiency_pdf_url} onClose={() => setPdfOpen(false)} />
      )}
    </div>
  );
}