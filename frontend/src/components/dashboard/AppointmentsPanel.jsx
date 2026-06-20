import React from 'react';
import { useNavigate } from 'react-router-dom';

const AppointmentsPanel = ({ appointmentsList, loading }) => {
  const navigate = useNavigate();

  return (
    <div className="right-panel">
      <div className="section-header">
        <div className="section-title">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          Prochains Rendez-vous
        </div>
      </div>

      <div className="section-body" style={{ flex: 1 }}>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)' }}>Chargement...</div>
        ) : appointmentsList.length === 0 ? (
          <div style={{ padding: '15px', textAlign: 'center', color: 'var(--text-dim)' }}>Aucun rendez-vous planifié.</div>
        ) : (
          appointmentsList.map((a, idx) => {
            const timeStr = a.date_heure ? new Date(a.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--';
            const pName = a.patient?.user ? `${a.patient.user.first_name} ${a.patient.user.last_name}` : `Patient #${a.patient_id}`;
            return (
              <div key={idx} className="doc-row" style={{ cursor: 'pointer' }} onClick={() => navigate(`/medecin/patients/${a.patient_id}`)}>
                <div className="doc-avatar" style={{ color: 'var(--accent-blue)', borderColor: 'rgba(59,130,246,0.2)', fontFamily: 'var(--mono)' }}>
                  {timeStr}
                </div>
                <div className="doc-info">
                  <div className="doc-name">{pName}</div>
                  <div className="doc-spec">{a.motif || 'Consultation générale'}</div>
                </div>
                <div className={`avail-dot ${a.status === 'Honoré' ? 'free' : 'consult'}`}></div>
              </div>
            );
          })
        )}
      </div>

      {/* QUICK ACTIONS */}
      <div className="quick-actions">
        <div className="qa-label">Outils Praticien</div>
        <div className="qa-grid">
          <button onClick={() => navigate('/medecin/patients')} className="qa-btn primary-action">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M9 12h6m-3-3v6M19 3H5a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2V5a2 2 0 00-2-2z"/>
            </svg>
            Nouvelle Ordonnance
          </button>
          <button onClick={() => navigate('/medecin/patients')} className="qa-btn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
            Liste Patients
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPanel;
