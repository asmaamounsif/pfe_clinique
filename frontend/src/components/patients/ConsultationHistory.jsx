import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ConsultationHistory = ({ consultations }) => {
  if (!consultations || consultations.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '8px' }}>
          Aucune consultation enregistrée pour ce patient.
        </p>
        <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
          L'historique clinique apparaîtra ici une fois la première visite effectuée.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flow-root">
        <ul className="-mb-8">
          {consultations.map((consultation, index) => {
            const dateFormatted = format(new Date(consultation.date_consultation), 'd MMMM yyyy à HH:mm', { locale: fr });
            return (
              <li key={consultation.id} style={{ position: 'relative', paddingBottom: '32px' }}>
                {index !== consultations.length - 1 && (
                  <span style={{ position: 'absolute', top: '16px', left: '16px', marginLeft: '-1px', height: '100%', width: '2px', background: 'var(--border)' }} />
                )}
                <div style={{ position: 'relative', display: 'flex', gap: '16px' }}>
                  <div>
                    <span style={{ height: '32px', width: '32px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', border: '1px solid var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)', fontWeight: 'bold' }}>
                      C
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>Motif : {consultation.motif}</h4>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, fontFamily: 'var(--mono)' }}>{dateFormatted}</span>
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)', display: 'grid', gap: '8px' }}>
                      {consultation.symptoms && (
                        <p style={{ margin: 0, whiteSpace: 'pre-line' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>Symptômes :</strong> {consultation.symptoms}
                        </p>
                      )}
                      {consultation.diagnostic && (
                        <p style={{ padding: '8px', background: 'rgba(59,130,246,0.05)', borderRadius: '6px', border: '1px solid rgba(59,130,246,0.1)', margin: 0, whiteSpace: 'pre-line' }}>
                          <strong style={{ color: 'var(--accent-blue)' }}>Diagnostic :</strong> {consultation.diagnostic}
                        </p>
                      )}
                    </div>
                    <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-dim)', borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Médecin : Dr. {consultation.doctor?.last_name}</span>
                      {consultation.tarif && <span>Honoraires : {consultation.tarif} €</span>}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ConsultationHistory;
