// src/pages/infirmier/InfirmierDashboard.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import ClinOpsShell from '../../components/layout/ClinOpsShell';

const InfirmierDashboard = () => {
  const { user } = useAuth();
  
  // États des données
  const [stats, setStats] = useState({
    patients_in_ward: 12,
    active_alerts: 2,
    care_today: 18,
  });
  const [patientsToWatch, setPatientsToWatch] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  
  // États système
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchNurseData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Charger les patients via l'API Laravel
      const res = await api.get('/infirmier/patients');
      if (res.data?.success) {
        const patients = res.data.data.patients || res.data.data || [];
        
        // Simuler ou mapper les constantes à prendre et l'état de surveillance
        const formattedPatients = patients.map((p, idx) => {
          const pName = p.user ? `${p.user.first_name} ${p.user.last_name}` : `Patient #${p.id}`;
          
          let alertStatus = 'stable';
          let statusLabel = 'Stable';
          let careDetails = 'Suivi des constantes standard';
          
          if (idx % 3 === 0) {
            alertStatus = 'waiting';
            statusLabel = 'Surveillance';
            careDetails = 'Prendre tension artérielle (toutes les 4h)';
          } else if (idx % 5 === 0) {
            alertStatus = 'urgent';
            statusLabel = 'Alerte Clinique';
            careDetails = 'Glycémie et ECG requis immédiatement';
          }

          return {
            id: p.id,
            name: pName,
            room: `Chambre ${101 + idx}`,
            ssn: p.social_security_number,
            alertStatus,
            statusLabel,
            careDetails,
            blood_type: p.blood_type || 'N/A',
          };
        });

        setPatientsToWatch(formattedPatients);
        setStats({
          patients_in_ward: formattedPatients.length,
          active_alerts: formattedPatients.filter(p => p.alertStatus === 'urgent').length,
          care_today: formattedPatients.length * 2,
        });

        // Générer le panneau d'alertes actives
        const alerts = formattedPatients
          .filter(p => p.alertStatus === 'urgent' || p.alertStatus === 'waiting')
          .map(p => ({
            room: p.room,
            patient: p.name,
            detail: p.careDetails,
            type: p.alertStatus,
          }));
        setActiveAlerts(alerts);
      }
    } catch (err) {
      console.error('Erreur de chargement du dashboard infirmier:', err);
      setErrorMsg('Erreur de connexion lors du chargement des données de soins.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNurseData();
  }, []);

  const tabs = [
    { id: 'ops', label: 'Surveillance Clinique' },
    { id: 'alerts', label: 'Alertes Actives' }
  ];

  return (
    <ClinOpsShell tabs={tabs} activeTab="ops">
      {/* KPI STRIP */}
      <div className="kpi-strip">
        <div className="kpi">
          <div className="kpi-accent" style={{ background: 'var(--accent-blue)' }}></div>
          <div className="kpi-content">
            <div className="kpi-label">Patients du service</div>
            <div className="kpi-value">{loading ? '...' : stats.patients_in_ward}</div>
            <div className="kpi-meta">Actifs sous surveillance</div>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-accent" style={{ background: 'var(--priority-urgent)' }}></div>
          <div className="kpi-content">
            <div className="kpi-label">Alertes Actives</div>
            <div className="kpi-value" style={{ color: stats.active_alerts > 0 ? 'var(--priority-urgent)' : 'inherit' }}>
              {loading ? '...' : stats.active_alerts}
            </div>
            <div className="kpi-meta">Prise en charge immédiate</div>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-accent" style={{ background: 'var(--priority-waiting)' }}></div>
          <div className="kpi-content">
            <div className="kpi-label">Soins Requis (Jour)</div>
            <div className="kpi-value">{loading ? '...' : stats.care_today}</div>
            <div className="kpi-meta">Constantes & injections</div>
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="content">
        
        {/* LEFT COLUMN: Patients à surveiller */}
        <div className="content-left">
          <div className="section" style={{ height: '100%' }}>
            <div className="section-header">
              <div className="section-title">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/>
                </svg>
                Tableau de Suivi des Constantes (Service)
              </div>
            </div>

            <div className="queue-header">
              <span className="queue-col">Chambre</span>
              <span className="queue-col">Patient</span>
              <span className="queue-col">Groupe Sang.</span>
              <span className="queue-col">Instructions Cliniques</span>
              <span className="queue-col">Statut</span>
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
              ) : patientsToWatch.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)' }}>Aucun patient affecté à ce service.</div>
              ) : (
                patientsToWatch.map((p, idx) => {
                  let pillClass = 'pill-stable';
                  let barColor = 'var(--priority-stable)';
                  if (p.alertStatus === 'urgent') {
                    pillClass = 'pill-urgent';
                    barColor = 'var(--priority-urgent)';
                  } else if (p.alertStatus === 'waiting') {
                    pillClass = 'pill-waiting';
                    barColor = 'var(--priority-waiting)';
                  }

                  return (
                    <div key={idx} className="queue-item">
                      <div className="queue-priority" style={{ background: barColor }}></div>
                      <div className="queue-inner" style={{ gridTemplateColumns: '80px 1.2fr 100px 2fr 110px' }}>
                        <span className="queue-rank" style={{ color: 'var(--text-primary)', textAlign: 'left', fontWeight: 'bold' }}>
                          {p.room}
                        </span>
                        <div>
                          <div className="queue-name">{p.name}</div>
                          <div className="queue-id">{p.ssn}</div>
                        </div>
                        <span className="queue-time">{p.blood_type}</span>
                        <span className="queue-doctor" style={{ fontSize: '12px' }}>{p.careDetails}</span>
                        <span className="queue-status">
                          <span className={`status-pill ${pillClass}`}>{p.statusLabel}</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Alertes actives et actions */}
        <div className="right-panel">
          <div className="section-header">
            <div className="section-title">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              Alertes & Tâches Critiques
            </div>
          </div>

          <div className="section-body" style={{ flex: 1 }}>
            {activeAlerts.length === 0 ? (
              <div style={{ padding: '15px', textAlign: 'center', color: 'var(--text-dim)' }}>Aucune alerte active dans le service.</div>
            ) : (
              activeAlerts.map((a, idx) => (
                <div 
                  key={idx} 
                  className="doc-row"
                  style={{
                    backgroundColor: a.type === 'urgent' ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                  }}
                >
                  <div 
                    className="doc-avatar" 
                    style={{ 
                      color: a.type === 'urgent' ? 'var(--priority-urgent)' : 'var(--priority-waiting)', 
                      borderColor: a.type === 'urgent' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(249, 115, 22, 0.2)'
                    }}
                  >
                    {a.room.replace('Chambre ', '')}
                  </div>
                  <div className="doc-info">
                    <div className="doc-name" style={{ color: a.type === 'urgent' ? 'var(--priority-urgent)' : 'inherit' }}>
                      {a.patient}
                    </div>
                    <div className="doc-spec">{a.detail}</div>
                  </div>
                  <div className={`avail-dot ${a.type === 'urgent' ? 'busy' : 'consult'}`}></div>
                </div>
              ))
            )}
          </div>

          {/* QUICK ACTIONS */}
          <div className="quick-actions">
            <div className="qa-label">Actions Infirmières</div>
            <div className="qa-grid">
              <button onClick={() => alert('Prise de constantes : Tension, Température, Pouls.')} className="qa-btn primary-action">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                Enregistrer Constantes
              </button>
              <button onClick={() => alert('Appel d\'urgence au médecin de garde émis.')} className="qa-btn" style={{ borderColor: 'var(--priority-urgent)', color: 'var(--priority-urgent)' }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                Déclencher Alerte
              </button>
            </div>
          </div>

        </div>

      </div>
    </ClinOpsShell>
  );
};

export default InfirmierDashboard;
