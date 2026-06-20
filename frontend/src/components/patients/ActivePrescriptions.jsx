import React from 'react';
import { downloadPdf } from '../../utils/pdfHelper';

const ActivePrescriptions = ({ prescriptions }) => {
  if (!prescriptions || prescriptions.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '8px' }}>
          Aucune ordonnance rédigée pour ce patient.
        </p>
        <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
          Les traitements prescrits apparaîtront ici.
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
      {prescriptions.map((prescription) => (
        <div key={prescription.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', background: 'var(--bg-elevated)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, fontFamily: 'var(--mono)' }}>
              Le {prescription.date_prescription}
            </span>
            <span className={prescription.status === 'Active' ? 'status-pill pill-new' : 'status-pill pill-stable'}>
              {prescription.status}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'pre-line', fontFamily: 'var(--mono)', background: 'var(--bg-base)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', margin: 0 }}>
            {prescription.content}
          </p>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-dim)' }}>Dr. {prescription.doctor?.last_name}</span>
            <button 
              onClick={() => downloadPdf(`/api/pdf/ordonnance/${prescription.id}`, `ordonnance_${prescription.id}.pdf`)}
              className="btn-sm"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)', margin: 0 }}
            >
              Imprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivePrescriptions;
