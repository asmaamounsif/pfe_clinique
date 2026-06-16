import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import ClinOpsShell from '../../components/layout/ClinOpsShell';

const SecretaireDashboard = () => {
  const { user } = useAuth();
  
  // Date filter initialized to today (local YYYY-MM-DD)
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [activeTab, setActiveTab] = useState('agenda');
  const [dateFilter, setDateFilter] = useState(getTodayString());
  
  // Data states
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Booking Form states
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    date_heure: '',
    motif: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Fetch appointments for selected date
  const fetchAppointments = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.get('/secretaire/appointments', {
        params: { date: dateFilter }
      });
      if (response.data?.success) {
        const list = response.data.data.appointments || response.data.data || [];
        setAppointments(list);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Erreur lors du chargement des rendez-vous.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctors and patients for dropdowns
  const fetchMetadata = async () => {
    try {
      const docRes = await api.get('/secretaire/doctors');
      if (docRes.data?.success) {
        setDoctors(docRes.data.data || []);
      }
      
      const patRes = await api.get('/secretaire/patients', {
        params: { per_page: 100 }
      });
      if (patRes.data?.success) {
        const rawPats = patRes.data.data.data || patRes.data.data.patients || patRes.data.data || [];
        setPatients(rawPats);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des métadonnées:', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [dateFilter]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  // Update appointment status (e.g. Check-in or cancel)
  const handleUpdateStatus = async (appId, newStatus) => {
    setActionLoading(prev => ({ ...prev, [appId]: true }));
    try {
      const response = await api.put(`/secretaire/appointments/${appId}`, {
        status: newStatus
      });
      if (response.data?.success) {
        // Refresh local state list
        setAppointments(prev => prev.map(app => 
          app.id === appId ? { ...app, status: newStatus } : app
        ));
      }
    } catch (err) {
      console.error(err);
      alert('Impossible de mettre à jour le statut du rendez-vous.');
    } finally {
      setActionLoading(prev => ({ ...prev, [appId]: false }));
    }
  };

  // Submit new appointment booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setFormErrors(null);
    setBookingSuccess(false);

    if (!formData.patient_id || !formData.doctor_id || !formData.date_heure) {
      setFormErrors({ general: ['Veuillez renseigner tous les champs obligatoires.'] });
      return;
    }

    try {
      const response = await api.post('/secretaire/appointments', formData);
      if (response.data?.success) {
        setBookingSuccess(true);
        // Reset form
        setFormData({
          patient_id: '',
          doctor_id: '',
          date_heure: '',
          motif: '',
          notes: '',
        });
        // Refresh agenda & switch tabs
        fetchAppointments();
        setTimeout(() => {
          setBookingSuccess(false);
          setActiveTab('agenda');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors || { general: [err.response.data.message] });
      } else {
        setFormErrors({ general: [err.response?.data?.message || 'Erreur lors de la réservation.'] });
      }
    }
  };

  const tabs = [
    { id: 'agenda', label: "Agenda d'Accueil" },
    { id: 'booking', label: 'Planifier un Rendez-vous' }
  ];

  // Helper for status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'Confirmé': return 'pill-stable';
      case 'Honoré': return 'pill-consult';
      case 'Annulé': return 'pill-urgent';
      case 'Non Honoré': return 'pill-waiting';
      default: return 'pill-new'; // Planifié
    }
  };

  // Quick stats computed on the fly
  const totalCheckedIn = appointments.filter(a => a.status === 'Confirmé').length;
  const totalHonored = appointments.filter(a => a.status === 'Honoré').length;
  const totalCanceled = appointments.filter(a => a.status === 'Annulé').length;
  const totalWaiting = appointments.filter(a => a.status === 'Planifié').length;

  return (
    <ClinOpsShell tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id)}>
      
      {/* KPI STRIP */}
      <div className="kpi-strip">
        <div className="kpi">
          <div className="kpi-accent" style={{ background: 'var(--accent-blue)' }}></div>
          <div className="kpi-content">
            <div className="kpi-label">Rendez-vous Total</div>
            <div className="kpi-value">{loading ? '...' : appointments.length}</div>
            <div className="kpi-meta">Planifiés pour cette date</div>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-accent" style={{ background: 'var(--priority-new)' }}></div>
          <div className="kpi-content">
            <div className="kpi-label">En Attente</div>
            <div className="kpi-value">{loading ? '...' : totalWaiting}</div>
            <div className="kpi-meta">Attendent leur check-in</div>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-accent" style={{ background: 'var(--priority-stable)' }}></div>
          <div className="kpi-content">
            <div className="kpi-label">Présents (Checked-in)</div>
            <div className="kpi-value">{loading ? '...' : totalCheckedIn}</div>
            <div className="kpi-meta">Prêts pour la consultation</div>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-accent" style={{ background: 'var(--accent-teal)' }}></div>
          <div className="kpi-content">
            <div className="kpi-label">Honorés</div>
            <div className="kpi-value">{loading ? '...' : totalHonored}</div>
            <div className="kpi-meta">Consultation achevée</div>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-accent" style={{ background: 'var(--priority-urgent)' }}></div>
          <div className="kpi-content">
            <div className="kpi-label">Annulés</div>
            <div className="kpi-value">{loading ? '...' : totalCanceled}</div>
            <div className="kpi-meta">Décommandés ou reportés</div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="content" style={{ display: 'block', padding: '24px' }}>
        
        {activeTab === 'agenda' && (
          <div className="section" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            
            {/* Agenda Header Controls */}
            <div className="section-header" style={{ borderBottom: '1px solid var(--border)', padding: '16px 20px' }}>
              <div className="section-title" style={{ fontSize: '15px' }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', color: 'var(--accent-teal)' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                Agenda d'accueil des patients
              </div>
              <div className="section-actions" style={{ gap: '12px' }}>
                <span className="section-badge" style={{ background: 'rgba(59,130,246,.1)', color: 'var(--accent-blue)' }}>
                  {dateFilter === getTodayString() ? "Aujourd'hui" : dateFilter}
                </span>
                
                {/* Datepicker input fitted to the ClinOps style */}
                <input 
                  type="date" 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    padding: '4px 10px',
                    fontSize: '12.5px',
                    outline: 'none'
                  }}
                />
                <button className="btn-sm primary" onClick={() => setActiveTab('booking')}>
                  + Planifier
                </button>
              </div>
            </div>

            {/* List Body */}
            <div className="section-body" style={{ padding: '0 20px 20px' }}>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Chargement de l'agenda clinique...
                </div>
              ) : errorMsg ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--priority-urgent)' }}>
                  {errorMsg}
                </div>
              ) : appointments.length === 0 ? (
                <div style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  Aucun rendez-vous planifié pour cette date.
                </div>
              ) : (
                <div style={{ overflowX: 'auto', marginTop: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <th style={{ padding: '12px 8px' }}>Heure</th>
                        <th style={{ padding: '12px 8px' }}>Patient / CIN</th>
                        <th style={{ padding: '12px 8px' }}>Médecin / Spécialité</th>
                        <th style={{ padding: '12px 8px' }}>Motif</th>
                        <th style={{ padding: '12px 8px' }}>Statut</th>
                        <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions d'Accueil</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((app) => {
                        const appTime = new Date(app.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                        const patientName = app.patient?.user 
                          ? `${app.patient.user.first_name} ${app.patient.user.last_name}`
                          : `Patient #${app.patient_id}`;
                        const docName = app.doctor 
                          ? `Dr. ${app.doctor.first_name} ${app.doctor.last_name}`
                          : 'Non assigné';

                        return (
                          <tr key={app.id} style={{ borderBottom: '1px solid var(--border-light)', fontSize: '13px' }} className="queue-item">
                            <td style={{ padding: '14px 8px', fontWeight: '600', color: 'var(--accent-blue)', fontFamily: 'var(--mono)' }}>
                              {appTime}
                            </td>
                            <td style={{ padding: '14px 8px' }}>
                              <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{patientName}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--mono)', marginTop: '2px' }}>
                                SSN: {app.patient?.social_security_number || 'N/A'} {app.patient?.phone && `• Tél: ${app.patient.phone}`}
                              </div>
                            </td>
                            <td style={{ padding: '14px 8px' }}>
                              <div style={{ color: 'var(--text-primary)' }}>{docName}</div>
                              <span style={{ fontSize: '11px', background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', padding: '1px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
                                {app.doctor?.specialty || 'Généraliste'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 8px', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.motif}>
                              {app.motif || 'Non renseigné'}
                            </td>
                            <td style={{ padding: '14px 8px' }}>
                              <span className={`status-pill ${getStatusClass(app.status)}`}>
                                {app.status}
                              </span>
                            </td>
                            <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                
                                {/* Check-in Button */}
                                {app.status === 'Planifié' && (
                                  <button
                                    onClick={() => handleUpdateStatus(app.id, 'Confirmé')}
                                    disabled={actionLoading[app.id]}
                                    style={{
                                      background: 'rgba(34, 197, 94, 0.12)',
                                      color: 'var(--priority-stable)',
                                      border: '1px solid rgba(34, 197, 94, 0.2)',
                                      padding: '4px 10px',
                                      borderRadius: '6px',
                                      fontSize: '11.5px',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.22)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.12)'}
                                  >
                                    {actionLoading[app.id] ? '...' : 'Check-in'}
                                  </button>
                                )}

                                {/* Cancel Button */}
                                {(app.status === 'Planifié' || app.status === 'Confirmé') && (
                                  <button
                                    onClick={() => handleUpdateStatus(app.id, 'Annulé')}
                                    disabled={actionLoading[app.id]}
                                    style={{
                                      background: 'rgba(239, 68, 68, 0.12)',
                                      color: 'var(--priority-urgent)',
                                      border: '1px solid rgba(239, 68, 68, 0.2)',
                                      padding: '4px 10px',
                                      borderRadius: '6px',
                                      fontSize: '11.5px',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.22)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'}
                                  >
                                    {actionLoading[app.id] ? '...' : 'Annuler'}
                                  </button>
                                )}

                                {/* Restore Button (if canceled) */}
                                {app.status === 'Annulé' && (
                                  <button
                                    onClick={() => handleUpdateStatus(app.id, 'Planifié')}
                                    disabled={actionLoading[app.id]}
                                    style={{
                                      background: 'rgba(255, 255, 255, 0.05)',
                                      color: 'var(--text-secondary)',
                                      border: '1px solid var(--border)',
                                      padding: '4px 10px',
                                      borderRadius: '6px',
                                      fontSize: '11.5px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Restaurer
                                  </button>
                                )}

                                {app.status === 'Honoré' && (
                                  <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontStyle: 'italic', padding: '4px 0' }}>
                                    Complété
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'booking' && (
          <div className="section" style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px', color: 'var(--accent-blue)' }}>
                <path d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                Enregistrer un nouveau rendez-vous
              </h2>
            </div>

            {bookingSuccess && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.12)',
                color: 'var(--priority-stable)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '13.5px',
                fontWeight: '500'
              }}>
                ✓ Rendez-vous planifié et enregistré avec succès. Redirection vers l'agenda...
              </div>
            )}

            {formErrors && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                color: 'var(--priority-urgent)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '13px'
              }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Erreur de validation :</strong>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {Object.values(formErrors).flat().map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleBookingSubmit}>
              {/* Patient Select */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Patient <span style={{ color: 'var(--priority-urgent)' }}>*</span>
                </label>
                <select
                  value={formData.patient_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, patient_id: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    padding: '10px 12px',
                    fontSize: '13.5px',
                    outline: 'none'
                  }}
                >
                  <option value="">-- Sélectionner un patient --</option>
                  {patients.map(p => {
                    const name = p.user ? `${p.user.first_name} ${p.user.last_name}` : `Patient #${p.id}`;
                    return (
                      <option key={p.id} value={p.id}>
                        {name} (CIN: {p.social_security_number})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Doctor Select */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Médecin Praticien <span style={{ color: 'var(--priority-urgent)' }}>*</span>
                </label>
                <select
                  value={formData.doctor_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, doctor_id: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    padding: '10px 12px',
                    fontSize: '13.5px',
                    outline: 'none'
                  }}
                >
                  <option value="">-- Sélectionner un médecin --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.first_name} {d.last_name} ({d.specialty || 'Généraliste'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Date & Heure du créneau <span style={{ color: 'var(--priority-urgent)' }}>*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.date_heure}
                  onChange={(e) => setFormData(prev => ({ ...prev, date_heure: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    padding: '10px 12px',
                    fontSize: '13.5px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Motif */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Motif de consultation
                </label>
                <input
                  type="text"
                  placeholder="Ex: Consultation cardiologique de routine"
                  value={formData.motif}
                  onChange={(e) => setFormData(prev => ({ ...prev, motif: e.target.value }))}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    padding: '10px 12px',
                    fontSize: '13.5px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Notes complémentaires
                </label>
                <textarea
                  placeholder="Notes optionnelles sur le patient..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows="3"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    padding: '10px 12px',
                    fontSize: '13.5px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('agenda');
                    setFormErrors(null);
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'var(--accent-blue)',
                    border: 'none',
                    color: '#fff',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'opacity 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                  onMouseLeave={e => e.currentTarget.style.opacity = 1}
                >
                  Confirmer la réservation
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </ClinOpsShell>
  );
};

export default SecretaireDashboard;
