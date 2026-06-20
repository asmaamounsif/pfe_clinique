import React from 'react';

const KpiStrip = ({ stats, loading }) => {
  return (
    <div className="kpi-strip">
      <div className="kpi">
        <div className="kpi-accent" style={{ background: 'var(--accent-blue)' }}></div>
        <div className="kpi-content">
          <div className="kpi-label">Mes Patients (Jour)</div>
          <div className="kpi-value">{loading ? '...' : stats.my_patients_today}</div>
          <div className="kpi-meta">Inscrits aujourd'hui</div>
        </div>
      </div>

      <div className="kpi">
        <div className="kpi-accent" style={{ background: 'var(--priority-stable)' }}></div>
        <div className="kpi-content">
          <div className="kpi-label">Consultations Effectuées</div>
          <div className="kpi-value">{loading ? '...' : stats.consultations_today}</div>
          <div className="kpi-meta">Aujourd'hui</div>
        </div>
      </div>

      <div className="kpi">
        <div className="kpi-accent" style={{ background: 'var(--priority-new)' }}></div>
        <div className="kpi-content">
          <div className="kpi-label">Ordonnances Rédigées</div>
          <div className="kpi-value">{loading ? '...' : stats.prescriptions_created}</div>
          <div className="kpi-meta">Médicaments prescrits</div>
        </div>
      </div>

      <div className="kpi">
        <div className="kpi-accent" style={{ background: 'var(--priority-waiting)' }}></div>
        <div className="kpi-content">
          <div className="kpi-label">Rendez-vous à Venir</div>
          <div className="kpi-value">{loading ? '...' : stats.upcoming_appointments}</div>
          <div className="kpi-meta">Dans votre planning</div>
        </div>
      </div>
    </div>
  );
};

export default KpiStrip;
