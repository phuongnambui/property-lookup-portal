import React from 'react';
import './Timeline.css';

const Timeline = ({ statusHistory, currentStatus }) => {
  const allStatuses = [
    'Request Received',
    'Surveyed',
    'Certificate Processing',
    'Submitted to City',
    'Pass'
  ];

  const getStatusState = (status) => {
    const currentIndex = allStatuses.indexOf(currentStatus);
    const statusIndex = allStatuses.indexOf(status);
    
    const hasCompleted = statusHistory.findIndex(s => s.status === status) !== -1;
    
    if (hasCompleted) return 'completed';
    if (status === currentStatus) return 'current';
    if (statusIndex === currentIndex + 1) return 'next';
    return 'pending';
  };

  const getStatusDate = (status) => {
    const entry = statusHistory.find(s => s.status === status);
    return entry ? entry.date : null;
  };

  return (
    <div className="timeline-container">
      {allStatuses.map((status, index) => {
        const state = getStatusState(status);
        const date = getStatusDate(status);

        return (
          <div key={status} className="timeline-item">
            <div className={`timeline-step ${state}`}>
              <div className="step-circle">
                {state === 'completed' && '✓'}
                {state === 'current' && <div className="pulse"></div>}
              </div>
              {index < allStatuses.length - 1 && (
                <div className={`step-line ${state === 'completed' ? 'completed' : ''}`}></div>
              )}
            </div>
            <div className="step-content">
              <div className={`step-label ${state}`}>{status}</div>
              {date && <div className="step-date">{date}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;