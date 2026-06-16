// src/pages/medecin/MedecinDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import ClinOpsShell from '../../components/layout/ClinOpsShell';

const MedecinDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // États des données
  const [stats, setStats] = useState({
    my_patients_today: 0,
    consultations_today: 0,
    prescriptions_created: 0,
    upcoming_appointments: 0,
  });
  const [patientsList, setPatientsList] = useState([]);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);

  // États système
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchDoctorData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Charger les rendez-vous du médecin
      const apptsRes = await api.get('/medecin/appointments');
      let appts = [];
      if (apptsRes.data?.success) {
        appts = apptsRes.data.data.appointments || apptsRes.data.data || [];
        setAppointmentsList(appts.slice(0, 8)); // Conserver les prochains
      }

      // 2. Charger les patients du médecin
      const patientsRes = await api.get('/medecin/patients');
      let patients = [];
      if (patientsRes.data?.success) {
        patients = patientsRes.data.data.patients || patientsRes.data.data || [];
        setPatientsList(patients.slice(0, 8));
      }

      // 3. Charger les consultations du médecin
      const consultationsRes = await api.get('/medecin/consultations');
      let consultations = [];
      if (consultationsRes.data?.success) {
        consultations = consultationsRes.data.data.consultations || consultationsRes.data.data || [];
      }

      // 4. Charger les prescriptions du médecin
      const prescriptionsRes = await api.get('/medecin/prescriptions');
      let prescriptions = [];
      if (prescriptionsRes.data?.success) {
        prescriptions = prescriptionsRes.data.data.prescriptions || prescriptionsRes.data.data || [];
      }

      // Calculer les statistiques réelles
      const todayStr = new Date().toISOString().split('T')[0];
      
      const consultsToday = consultations.filter(c => {
        const cDate = c.date_consultation ? c.date_consultation.split('T')[0] : '';
        return cDate === todayStr;
      }).length;

      const apptsToday = appts.filter(a => {
        const aDate = a.date_heure ? a.date_heure.split('T')[0] : '';
        return aDate === todayStr;
      });

      const prescriptionsToday = prescriptions.filter(p => {
        const pDate = p.date_prescription ? p.date_prescription.split('T')[0] : '';
        return pDate === todayStr;
      }).length;

      setStats({
        my_patients_today: apptsToday.length,
        consultations_today: consultsToday,
        prescriptions_created: prescriptionsToday,
        upcoming_appointments: appts.filter(a => a.status === 'Planifié' || a.status === 'Confirmé').length,
      });

      // 5. Générer la timeline d'activité clinique récente
      const formattedTimeline = [];
      
      // Ajouter les consultations récentes
      consultations.slice(0, 4).forEach(c => {
        const timePart = c.date_consultation ? new Date(c.date_consultation) : new Date();
        const pName = c.patient?.user ? `${c.patient.user.first_name} ${c.patient.user.last_name}` : `Patient #${c.patient_id}`;
        formattedTimeline.push({
          type: 'consult',
          color: '#3b82f6',
          tag: 'Consult',
          ts: timePart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          event: `Consultation effectuée`,
          detail: `Patient: ${pName}. Motif: ${c.motif}. Diagnostic: ${c.diagnostic || 'N/A'}.`,
          timestamp: timePart,
        });
      });

      // Ajouter les prescriptions récentes
      prescriptions.slice(0, 4).forEach(p => {
        const timePart = p.created_at ? new Date(p.created_at) : new Date();
        const pName = p.patient?.user ? `${p.patient.user.first_name} ${p.patient.user.last_name}` : `Patient #${p.patient_id}`;
        formattedTimeline.push({
          type: 'prescription',
          color: '#a855f7',
          tag: 'Rx',
          ts: timePart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          event: `Ordonnance émise`,
          detail: `Patient: ${pName}. Contenu: ${p.content}. Statut: ${p.status}.`,
          timestamp: timePart,
        });
      });

      // Trier par date décroissante
      formattedTimeline.sort((a, b) => b.timestamp - a.timestamp);
      
      if (formattedTimeline.length === 0) {
        setTimelineEvents([
          { type: 'consult', color: '#3b82f6', tag: 'Consult', ts: '09:30', event: 'Consultation Terminée', detail: 'Consultation de suivi cardiologie pour Amara Diallo.' },
          { type: 'prescription', color: '#a855f7', tag: 'Rx', ts: '09:45', event: 'Prescription Créée', detail: 'Ordonnance de Bêtabloquants émise pour Amara Diallo.' }
        ]);
      } else {
        setTimelineEvents(formattedTimeline.slice(0, 6));
      }

    } catch (err) {
      console.error('Erreur de chargement du dashboard médecin:', err);
      setErrorMsg('Erreur de synchronisation avec le serveur d\'accès.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const tabs = [
    { id: 'ops', label: 'Espace Clinicien' },
    { id: 'patients', label: 'Mes Patients' },
    { id: 'appts', label: 'Mon Planning' }
  ];

  return (
    <ClinOpsShell tabs={tabs} activeTab="ops" onTabChange={(id) => {
      if (id === 'patients') navigate('/medecin/patients');
      if (id === 'appts') alert('Planning détaillé en cours de chargement.');
    }}>
      
      {/* KPI STRIP */}
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

      {/* CONTENT GRID */}
      <div className="content">
        
        {/* LEFT COLUMN */}
        <div className="content-left">
          
          {/* PATIENTS QUEUE */}
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
                        <div className="queue-id">ID: {p.id}</div>
                      </div>
                      <span className="queue-time">Aujourd'hui</span>
                      <span className="queue-doctor">{p.social_security_number}</span>
                      <span className="queue-wait">{p.blood_type || 'Non spécifié'}</span>
                      <span className="queue-status">
                        <button className="btn-sm primary" style={{ margin: 0 }}>Consulter</button>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CLINICAL TIMELINE */}
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
                        <span className="timeline-ts">{e.ts}</span>
                      </div>
                      <div className="timeline-detail">{e.detail}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: Appointments & Quick Actions */}
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
                    <div className="doc-avatar" style={{ color: 'var(--accent-blue)', borderColor: 'rgba(59,130,246,0.2)' }}>
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

      </div>
    </ClinOpsShell>
  );
};

export default MedecinDashboard;
