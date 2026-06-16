import React, { useEffect, useState } from 'react';
import ClinOpsShell from '../../components/layout/ClinOpsShell';
import api from '../../services/api';

const Steps = ({ current }) => {
  const labels = ['Spécialité', 'Médecin', 'Date', 'Créneau', 'Confirmer'];
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      {labels.map((l,i) => (
        <div key={l} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, background: i===current? 'var(--accent-blue)': 'transparent', color: i===current? '#fff':'var(--text-dim)', textAlign: 'center', fontWeight: 700, fontSize: 13 }}>
          {l}
        </div>
      ))}
    </div>
  );
};

const PrendreRdv = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState(0);
  const [patientId, setPatientId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchDoctors(); }, []);
  useEffect(() => { if (selectedDoctor && date) fetchSlots(); }, [selectedDoctor, date]);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/secretaire/doctors');
      const data = (res.data && res.data.data) || [];
      setDoctors(data);
      const unique = [...new Set(data.map(d => d.specialty || 'Généraliste'))];
      setSpecialties(unique);
    } catch (e) { console.error(e); }
  };

  const fetchSlots = async () => {
    if (!selectedDoctor) return;
    setLoading(true);
    try {
      const r = await api.get(`/appointments/slots/${selectedDoctor.id}/${date}`);
      setSlots((r.data && r.data.data && r.data.data.slots) || r.data.data.slots || []);
    } catch (e) { console.error(e); setSlots([]); }
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (!patientId || !selectedDoctor || !selectedSlot) { alert('Complétez les étapes'); return; }
    try {
      await api.post('/appointments', {
        patient_id: patientId,
        doctor_id: selectedDoctor.id,
        date_heure: selectedSlot.datetime,
        motif: 'Prise via patient UI'
      });
      alert('Rendez-vous confirmé');
      setStep(4);
    } catch (e) { console.error(e); alert('Erreur lors de la réservation'); }
  };

  return (
    <ClinOpsShell tabs={[{id:'prendre', label: 'Prendre RDV'}]} activeTab={'prendre'}>
      <div style={{ padding: 24, maxWidth: 920, margin: '0 auto' }}>
        <h2>Prendre Rendez-vous</h2>
        <Steps current={step} />

        {step === 0 && (
          <div>
            <label>Choisir une spécialité</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {specialties.map(s => (
                <button key={s} onClick={() => { setSelectedSpecialty(s); setStep(1); }} style={{ padding: '10px 12px', borderRadius: 8, background: selectedSpecialty===s? 'var(--accent-blue)': 'var(--bg-elevated)', color: selectedSpecialty===s? '#fff': 'var(--text-primary)' }}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <label>Choisir un médecin ({selectedSpecialty})</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 12 }}>
              {doctors.filter(d => (d.specialty || 'Généraliste') === selectedSpecialty).map(d => (
                <div key={d.id} style={{ borderRadius: 8, padding: 12, background: selectedDoctor?.id===d.id?'var(--bg-elevated)':'transparent', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700 }}>Dr. {d.first_name} {d.last_name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>{d.specialty || 'Généraliste'}</div>
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => { setSelectedDoctor(d); setStep(2); }} style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--accent-blue)', color: '#fff' }}>Choisir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <label>Choisir la date</label>
            <div style={{ marginTop: 8 }}>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8 }} />
              <div style={{ marginTop: 10 }}>
                <button onClick={() => setStep(3)} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--accent-blue)', color: '#fff' }}>Voir les créneaux</button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <label>Sélectionner un créneau ({date})</label>
            <div style={{ marginTop: 12 }}>
              {loading ? <div>Chargement...</div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                  {slots.map(s => (
                    <div key={s.datetime} style={{ padding: 10, borderRadius: 8, background: s.available? 'var(--bg-elevated)':'rgba(59,130,246,0.08)', border: s.available? '1px solid var(--border)': '1px solid rgba(59,130,246,0.12)', cursor: s.available? 'pointer':'not-allowed' }} onClick={() => s.available && setSelectedSlot(s)}>
                      <div style={{ fontWeight: 700 }}>{s.time}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{s.available ? 'Libre' : 'Occupé'}</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 12 }}>
                <button onClick={() => setStep(2)} style={{ padding: '8px 12px', borderRadius: 8, marginRight: 8 }}>Retour</button>
                <button onClick={() => setStep(4)} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--accent-blue)', color: '#fff' }}>Valider le créneau</button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <label>Confirmer la réservation</label>
            <div style={{ marginTop: 10 }}>
              <div style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-surface)' }}>
                <div><strong>Médecin:</strong> Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}</div>
                <div><strong>Date:</strong> {date}</div>
                <div><strong>Créneau:</strong> {selectedSlot?.time}</div>
              </div>

              <div style={{ marginTop: 12 }}>
                <input placeholder="Votre ID patient" value={patientId} onChange={e => setPatientId(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, width: 260 }} />
              </div>

              <div style={{ marginTop: 12 }}>
                <button onClick={() => setStep(3)} style={{ padding: '8px 12px', borderRadius: 8, marginRight: 8 }}>Retour</button>
                <button onClick={handleConfirm} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--accent-blue)', color: '#fff' }}>Confirmer la réservation</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ClinOpsShell>
  );
};

export default PrendreRdv;
