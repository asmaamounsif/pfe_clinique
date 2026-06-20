import React from 'react';

const PatientProfileCard = ({ patient }) => {
  const email = patient.user?.email || 'N/A';

  return (
    <div className="section" style={{ borderBottom: 'none' }}>
      <div className="section-header">
        <div className="section-title">Informations Générales</div>
      </div>
      <div className="section-body" style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gap: '16px', fontSize: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>Genre</span>
            <span className="status-pill pill-stable">{patient.gender}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>Date de naissance</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--mono)' }}>
              {patient.date_of_birth}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>Groupe Sanguin</span>
            <span className={patient.blood_type ? 'status-pill pill-urgent' : 'status-pill pill-stable'}>
              {patient.blood_type || 'Non renseigné'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>Téléphone</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--mono)' }}>
              {patient.phone || 'Non renseigné'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>Email</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
              {email}
            </span>
          </div>
          <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-dim)', fontWeight: 500, marginBottom: '4px' }}>Adresse</div>
            <div style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>
              {patient.address || 'Aucune adresse renseignée.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfileCard;
