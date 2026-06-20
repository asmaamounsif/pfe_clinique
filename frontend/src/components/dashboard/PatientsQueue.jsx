import React from 'react';
import { useNavigate } from 'react-router-dom';

const PatientsQueue = ({ patientsList, loading, errorMsg }) => {
  const navigate = useNavigate();

  return (
    <div className="section" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="section-header">
        <div className="section-title">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
          </svg>
          Mes Patients Attendus
        </div>
        <button onClick={() => navigate('/medecin/patients')} className="btn-sm primary">
          + Nouveau Dossier
        </button>
      </div>

      <div className="queue-header">
        <span className="queue-col">#</span>
        <span className="queue-col">Patient</span>
        <span className="queue-col">Heure RDV</span>
        <span className="queue-col">N° Séc. Sociale</span>
        <span className="queue-col">Groupe Sanguin</span>
        <span className="queue-col">Action</span>
      </div>

      <div className="section-body">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="queue-item" style={{ height: '54px' }}>
              <div className="queue-inner" style={{ gridTemplateColumns: '1fr' }}>
                <div className="clinops-skeleton" style={{ height: '16px', width: '80%' }}></div>
              </div>
            </div>
          ))
        ) : errorMsg ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--priority-urgent)' }}>{errorMsg}</div>
        ) : patientsList.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)' }}>Aucun dossier patient dans votre service.</div>
        ) : (
          patientsList.map((p, idx) => (
            <div key={idx} className="queue-item" onClick={() => navigate(`/medecin/patients/${p.id}`)}>
              <div className="queue-priority" style={{ background: 'var(--accent-blue)' }}></div>
              <div className="queue-inner">
                <span className="queue-rank">{String(idx + 1).padStart(2, '0')}</span>
                <div className="queue-patient">
                  <div className="queue-name">
                    {p.user ? `${p.user.first_name} ${p.user.last_name}` : 'Patient anonyme'}
                  </div>
                  <div className="queue-id" style={{ fontFamily: 'var(--mono)' }}>ID: {p.id}</div>
                </div>
                <span className="queue-time">Aujourd'hui</span>
                <span className="queue-doctor" style={{ fontFamily: 'var(--mono)' }}>{p.social_security_number}</span>
                <span className="queue-wait">{p.blood_type || 'Non spécifié'}</span>
                <span className="queue-status">
                  <button className="btn-sm primary" style={{ margin: 0 }} onClick={(e) => { e.stopPropagation(); navigate(`/medecin/patients/${p.id}`); }}>
                    Consulter
                  </button>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientsQueue;
