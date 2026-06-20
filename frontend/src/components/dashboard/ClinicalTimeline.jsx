import React from 'react';

const ClinicalTimeline = ({ timelineEvents, loading }) => {
  return (
    <div className="section">
      <div className="section-header">
        <div className="section-title">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          Activité Clinique Récente
        </div>
      </div>

      <div className="section-body">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)' }}>Chargement...</div>
        ) : timelineEvents.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)' }}>Aucune activité enregistrée récemment.</div>
        ) : (
          timelineEvents.map((e, idx) => (
            <div key={idx} className="timeline-item">
              <div className="timeline-line-col">
                <div className="timeline-node" style={{ color: e.color, borderColor: e.color }}></div>
                <div className="timeline-vline"></div>
              </div>
              <div className="timeline-content">
                <div className="timeline-top">
                  <div className="timeline-event">
                    <span className="timeline-tag" style={{ background: `${e.color}15`, color: e.color }}>
                      {e.tag}
                    </span>
                    {e.event}
                  </div>
                  <span className="timeline-ts" style={{ fontFamily: 'var(--mono)' }}>{e.ts}</span>
                </div>
                <div className="timeline-detail">{e.detail}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClinicalTimeline;
