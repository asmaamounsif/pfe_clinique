import React from 'react';

const MedicalAlerts = ({ patient }) => {
  const record = patient?.medical_record;
  const hasAllergies = record?.allergies && record.allergies.toLowerCase() !== 'aucune connue';

  return (
    <div className="section" style={{ borderBottom: 'none' }}>
      <div className="section-header">
        <div className="section-title">Dossier Médical Actif</div>
      </div>
      <div className="section-body" style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gap: '20px' }}>
          
          <div>
            <span style={{ 
              display: 'block', 
              color: hasAllergies ? 'var(--priority-urgent)' : 'var(--text-dim)', 
              fontWeight: 600, 
              marginBottom: '6px' 
            }}>
              Allergies & Intolérances
            </span>
            <div style={{ 
              padding: '12px', 
              background: hasAllergies ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-elevated)', 
              color: hasAllergies ? 'var(--priority-urgent)' : 'var(--text-primary)', 
              border: `1px solid ${hasAllergies ? 'rgba(239, 68, 68, 0.2)' : 'var(--border)'}`, 
              borderRadius: '8px', 
              fontSize: '13px', 
              fontWeight: hasAllergies ? 600 : 400,
              lineHeight: '1.6'
            }}>
              {record?.allergies || 'Aucune allergie connue.'}
            </div>
          </div>

          <div>
            <span style={{ display: 'block', color: 'var(--text-dim)', fontWeight: 600, marginBottom: '6px' }}>
              Traitements en cours
            </span>
            <div style={{ 
              padding: '12px', 
              background: 'var(--bg-elevated)', 
              color: 'var(--text-primary)', 
              border: '1px solid var(--border)', 
              borderRadius: '8px', 
              fontSize: '13px', 
              fontStyle: 'italic'
            }}>
              {record?.current_treatments || 'Aucun traitement actif.'}
            </div>
          </div>

          <div>
            <span style={{ display: 'block', color: 'var(--text-dim)', fontWeight: 600, marginBottom: '6px' }}>
              Antécédents Cliniques
            </span>
            <div style={{ 
              padding: '12px', 
              background: 'var(--bg-elevated)', 
              color: 'var(--text-primary)', 
              border: '1px solid var(--border)', 
              borderRadius: '8px', 
              fontSize: '13px', 
              lineHeight: '1.6', 
              whiteSpace: 'pre-wrap'
            }}>
              {record?.medical_history || 'Aucun antécédent clinique enregistré.'}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MedicalAlerts;
