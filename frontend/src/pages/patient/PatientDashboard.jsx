// src/pages/patient/PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import ClinOpsShell from '../../components/layout/ClinOpsShell';

const PatientDashboard = () => {
  const { user } = useAuth();
  
  // États des données
  const [patientProfile, setPatientProfile] = useState(null);
  const [stats, setStats] = useState({
    upcoming_appointments: 0,
    past_consultations: 0,
    active_prescriptions: 0,
    pending_exam_results: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [careHistory, setCareHistory] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState(null);

  // États système
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchPatientData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const patientId = user?.patient?.id || user?.id || '';
      
      // 1. Charger le profil patient
      let patientData = null;
      if (patientId) {
        try {
          const profileRes = await api.get(`/patient/profile/${patientId}`);
          if (profileRes.data?.success) {
            patientData = profileRes.data.data;
            setPatientProfile(patientData);
          }
        } catch (err) {
          console.warn('Erreur lors du chargement du profil patient:', err);
        }
      }

      // 2. Charger les rendez-vous
      let appts = [];
      try {
        const apptsRes = await api.get('/patient/appointments');
        if (apptsRes.data?.success) {
          appts = apptsRes.data.data.appointments || apptsRes.data.data || [];
          setAppointments(appts.slice(0, 5));
        }
      } catch (err) {
        console.warn('Erreur lors du chargement des rendez-vous:', err);
      }

      // 3. Charger les prescriptions
      let Rx = [];
      try {
        const RxRes = await api.get('/patient/prescriptions');
        if (RxRes.data?.success) {
          Rx = RxRes.data.data.prescriptions || RxRes.data.data || [];
          setPrescriptions(Rx);
        }
      } catch (err) {
        console.warn('Erreur lors du chargement des ordonnances:', err);
      }

      // 4. Charger et formater l'historique de soins (Timeline)
      const timeline = [];
      
      // Ajouter les rendez-vous passés/honorés
      appts.forEach(a => {
        const timePart = a.date_heure ? new Date(a.date_heure) : new Date();
        const docName = a.doctor ? `Dr. ${a.doctor.last_name}` : 'Médecin Hospitalier';
        
        if (a.status === 'Honoré') {
          timeline.push({
            type: 'consult',
            color: '#3b82f6',
            tag: 'Cons.',
            ts: timePart.toLocaleDateString('fr-FR'),
            event: 'Consultation clinique effectuée',
            detail: `Consultation avec ${docName}. Motif: ${a.motif || 'Suivi clinique'}.`,
            timestamp: timePart,
          });
        } else if (a.status === 'Planifié' || a.status === 'Confirmé') {
          timeline.push({
            type: 'checkin',
            color: '#14b8a6',
            tag: 'Rdv',
            ts: timePart.toLocaleDateString('fr-FR'),
            event: 'Rendez-vous planifié',
            detail: `Consultation avec ${docName} à ${timePart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}. Motif: ${a.motif || 'Suivi clinique'}.`,
            timestamp: timePart,
          });
        }
      });

      // Ajouter les prescriptions
      Rx.forEach(p => {
        const timePart = p.date_prescription ? new Date(p.date_prescription) : new Date();
        const docName = p.doctor ? `Dr. ${p.doctor.last_name}` : 'Médecin émetteur';
        
        timeline.push({
          type: 'prescription',
          color: '#a855f7',
          tag: 'Ordo.',
          ts: timePart.toLocaleDateString('fr-FR'),
          event: `Ordonnance médicale rédigée`,
          detail: `Traitement prescrit par ${docName}. Statut: ${p.status}. Médicaments: ${p.content}.`,
          timestamp: timePart,
        });
      });

      // Trier par date décroissante
      timeline.sort((a, b) => b.timestamp - a.timestamp);
      setCareHistory(timeline);

      // Mettre à jour les stats
      setStats({
        upcoming_appointments: appts.filter(a => a.status === 'Planifié' || a.status === 'Confirmé').length,
        past_consultations: appts.filter(a => a.status === 'Honoré').length,
        active_prescriptions: Rx.filter(p => p.status === 'Active').length,
        pending_exam_results: 0,
      });

      // Détecter le médecin traitant principal
      if (appts.length > 0 && appts[0].doctor) {
        setDoctorInfo(appts[0].doctor);
      }

    } catch (err) {
      console.error('Erreur lors du chargement des données du patient:', err);
      setErrorMsg('Impossible de charger votre dossier patient en temps réel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);

  const tabs = [
    { id: 'ops', label: 'Mon Espace Santé' },
    { id: 'prescriptions', label: 'Mes Ordonnances' },
    { id: 'appts', label: 'Mes Rendez-vous' }
  ];

  return (
    <ClinOpsShell tabs={tabs} activeTab="ops">
      {/* KPI STRIP */}
      <div className="kpi-strip">
        <div className="kpi">
          <div className="kpi-accent" style={{ background: 'var(--accent-blue)' }}></div>
          <div className="kpi-content">
            <div className="kpi-label">Prochains RDV</div>
            <div className="kpi-value">{loading ? '...' : stats.upcoming_appointments}</div>
            <div className="kpi-meta">Consultations planifiées</div>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-accent" style={{ background: 'var(--priority-stable)' }}></div>
          <div className="kpi-content">
            <div className="kpi-label">Visites Médicales</div>
            <div className="kpi-value">{loading ? '...' : stats.past_consultations}</div>
            <div className="kpi-meta">Consultations archivées</div>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-accent" style={{ background: 'var(--priority-new)' }}></div>
          <div className="kpi-content">
            <div className="kpi-label">Ordonnances Actives</div>
            <div className="kpi-value">{loading ? '...' : stats.active_prescriptions}</div>
            <div className="kpi-meta">Traitements en cours</div>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-accent" style={{ background: 'var(--priority-waiting)' }}></div>
          <div className="kpi-content">
            <div className="kpi-label">Examens Labo</div>
            <div className="kpi-value">{loading ? '...' : stats.pending_exam_results}</div>
            <div className="kpi-meta">Résultats en attente</div>
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="content">
        
        {/* LEFT COLUMN: Historique des soins */}
        <div className="content-left">
          <div className="section" style={{ height: '100%' }}>
            <div className="section-header">
              <div className="section-title">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Historique de mon Parcours de Soins
              </div>
            </div>

            <div className="section-body">
              {loading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)' }}>Chargement de votre dossier...</div>
              ) : errorMsg ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--priority-urgent)' }}>{errorMsg}</div>
              ) : careHistory.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)' }}>Aucun soin ou rendez-vous enregistré pour le moment.</div>
              ) : (
                careHistory.map((e, idx) => (
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

        {/* RIGHT COLUMN: Médecin traitant & Informations personnelles */}
        <div className="right-panel">
          
          {/* MÉDECIN CONSEILLÉ */}
          <div className="section-header">
            <div className="section-title">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              Mon Médecin Référent
            </div>
          </div>

          <div className="doc-row">
            <div className="doc-avatar" style={{ color: 'var(--accent-blue)', borderColor: 'rgba(59,130,246,0.2)' }}>
              {doctorInfo ? `${doctorInfo.first_name[0]}${doctorInfo.last_name[0]}`.toUpperCase() : 'MD'}
            </div>
            <div className="doc-info">
              <div className="doc-name">
                {doctorInfo ? `Dr. ${doctorInfo.first_name} ${doctorInfo.last_name}` : 'Médecin de garde'}
              </div>
              <div className="doc-spec">
                {doctorInfo?.email || 'Service de santé clinique'}
              </div>
            </div>
          </div>

          {/* INFORMATIONS PERSONNELLES */}
          <div className="section-header" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="section-title">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
              </svg>
              Mes Données Physiologiques
            </div>
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Groupe Sanguin :</span>
              <span style={{ fontWeight: 'bold' }}>{patientProfile?.blood_type || 'Non spécifié'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>N° Sécurité Sociale :</span>
              <span style={{ fontFamily: 'var(--mono)' }}>{patientProfile?.social_security_number || 'Non renseigné'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Contact d'Urgence :</span>
              <span>{patientProfile?.emergency_contact?.name || 'Aucun renseigné'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Allergies connues :</span>
              <span style={{ color: 'var(--priority-urgent)', fontWeight: 'semibold' }}>{patientProfile?.medical_record?.allergies || 'Aucune connue'}</span>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="quick-actions">
            <div className="qa-label">Mon Espace Client</div>
            <div className="qa-grid">
              <button onClick={() => alert('Prise de rendez-vous en ligne : contactez le secrétariat.')} className="qa-btn primary-action">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                Prendre Rendez-vous
              </button>
            </div>
          </div>

        </div>

      </div>
    </ClinOpsShell>
  );
};

export default PatientDashboard;
