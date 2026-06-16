import React, { useEffect, useState } from 'react';
import ClinOpsShell from '../../components/layout/ClinOpsShell';
import api from '../../services/api';

const HOURS_START = 8;
const HOURS_END = 18;
const SLOT_MINUTES = 30;

const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const AgendaJour = () => {
  const getToday = () => {
    const d = new Date();
    return d.toISOString().slice(0,10);
  };

  const [date, setDate] = useState(getToday());
  const [doctors, setDoctors] = useState([]);
  const [slotsByDoctor, setSlotsByDoctor] = useState({});
  const [loading, setLoading] = useState(false);
  const [filterDoctor, setFilterDoctor] = useState('all');

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (doctors.length) fetchAllSlots();
  }, [doctors, date]);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/secretaire/doctors');
      if (res.data?.success) setDoctors(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAllSlots = async () => {
    setLoading(true);
    const map = {};
    await Promise.all(doctors.map(async (doc) => {
      try {
        const r = await api.get(`/appointments/slots/${doc.id}/${date}`);
        if (r.data?.success) map[doc.id] = r.data.data.slots || r.data.data.slots || [];
      } catch (e) {
        map[doc.id] = [];
      }
    }));
    setSlotsByDoctor(map);
    setLoading(false);
  };

  const timeSlots = () => {
    const arr = [];
    const d = new Date(date + 'T00:00:00');
    d.setHours(HOURS_START,0,0,0);
    const end = new Date(date + 'T00:00:00');
    end.setHours(HOURS_END,0,0,0);
    while (d < end) {
      arr.push(new Date(d));
      d.setMinutes(d.getMinutes() + SLOT_MINUTES);
    }
    return arr;
  };

  const onQuickBook = (docId, slotDateTime) => {
    // Open a quick modal - for brevity, we do a prompt
    const patientId = prompt('ID patient pour réservation rapide:');
    if (!patientId) return;
    api.post('/secretaire/appointments', {
      patient_id: patientId,
      doctor_id: docId,
      date_heure: slotDateTime,
      motif: 'Prise rapide via agenda'
    }).then(() => {
      alert('Rendez-vous réservé');
      fetchAllSlots();
    }).catch(err => {
      console.error(err);
      alert('Échec de la réservation.');
    });
  };

  const onOpenAppointment = (appointment) => {
    // Simple details + actions
    const action = window.prompt(`Rendez-vous: ${appointment.id} - Actions: confirm/cancel/complete`);
    if (!action) return;
    let endpoint;
    if (action === 'confirm') endpoint = `/appointments/${appointment.id}/confirm`;
    if (action === 'cancel') endpoint = `/appointments/${appointment.id}/cancel`;
    if (action === 'complete') endpoint = `/appointments/${appointment.id}/complete`;
    if (!endpoint) return;
    api.put(endpoint).then(() => {
      alert('Statut mis à jour');
      fetchAllSlots();
    }).catch(err => { console.error(err); alert('Erreur'); });
  };

  return (
    <ClinOpsShell tabs={[{id:'agenda', label:'Agenda Jour'}]} activeTab={'agenda'}>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <h3 style={{ margin: 0 }}>Agenda Journalier</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6 }}>
              <option value="all">Tous les médecins</option>
              {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name} ({d.specialty || 'Généraliste'})</option>)}
            </select>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6 }} />
          </div>
        </div>

        <div style={{ marginTop: 14, overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${filterDoctor==='all'?doctors.length:1}, minmax(200px, 1fr))`, gap: 8 }}>
            <div style={{ background: 'var(--bg-surface)', borderRadius: 8, padding: 8 }}>
              {timeSlots().map(t => (
                <div key={t.toISOString()} style={{ height: 44, borderBottom: '1px dashed var(--border)', display: 'flex', alignItems: 'center', paddingLeft: 8, color: 'var(--text-dim)' }}>
                  {t.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              ))}
            </div>

            {(filterDoctor==='all'?doctors:doctors.filter(d=>String(d.id)===String(filterDoctor))).map(doc => (
              <div key={doc.id} style={{ background: 'var(--bg-surface)', borderRadius: 8, padding: 6 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', padding: '6px 8px', borderBottom: '1px solid var(--border)' }}>Dr. {doc.first_name} {doc.last_name}</div>
                <div>
                  {loading ? (
                    <div style={{ padding: 20, textAlign: 'center' }}>Chargement...</div>
                  ) : (
                    timeSlots().map(t => {
                      const key = t.toISOString();
                      const slots = slotsByDoctor[doc.id] || [];
                      const found = slots.find(s => s.datetime.startsWith(t.toISOString().slice(0,10)) && s.time === t.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}));

                      if (found && !found.available) {
                        const app = found.appointment;
                        const style = { background: 'rgba(59,130,246,0.12)', color: 'var(--accent-blue)', borderLeft: '3px solid var(--accent-blue)', padding: '8px', margin: '6px', borderRadius: 6, cursor: 'pointer' };
                        return (
                          <div key={key} style={style} onClick={() => onOpenAppointment(app)}>
                            <div style={{ fontSize: 12, fontWeight: 700 }}>{formatTime(found.datetime)}</div>
                            <div style={{ fontSize: 12 }}>{app?.patient?.user ? `${app.patient.user.first_name} ${app.patient.user.last_name}` : `Patient #${app.patient_id}`}</div>
                          </div>
                        );
                      }

                      return (
                        <div key={key} style={{ height: 44, margin: '6px', borderRadius: 6, background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => onQuickBook(doc.id, new Date(t).toISOString())}>
                          <span style={{ color: 'var(--text-dim)' }}>Libre</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ClinOpsShell>
  );
};

export default AgendaJour;
