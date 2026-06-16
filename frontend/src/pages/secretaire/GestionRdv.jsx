import React, { useEffect, useState } from 'react';
import ClinOpsShell from '../../components/layout/ClinOpsShell';
import api from '../../services/api';

const weekDates = (start) => {
  const arr = [];
  const d = new Date(start);
  for (let i=0;i<7;i++) { arr.push(new Date(d)); d.setDate(d.getDate()+1); }
  return arr;
};

const GestionRdv = () => {
  const [startOfWeek, setStartOfWeek] = useState(() => {
    const d = new Date();
    const diff = d.getDate() - d.getDay() + 1; // Monday
    d.setDate(diff);
    return d.toISOString().slice(0,10);
  });
  const [appointments, setAppointments] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => { fetchUpcoming(); }, [startOfWeek]);

  const fetchUpcoming = async () => {
    try {
      const res = await api.get('/appointments/upcoming');
      if (res.data?.success) setAppointments(res.data.data.appointments || []);
    } catch (e) { console.error(e); }
  };

  const changeStatus = async (id, status) => {
    try {
      let endpoint = '';
      if (status === 'Confirmé') endpoint = `/appointments/${id}/confirm`;
      else if (status === 'Annulé') endpoint = `/appointments/${id}/cancel`;
      else if (status === 'Honoré') endpoint = `/appointments/${id}/complete`;
      if (!endpoint) return;
      await api.put(endpoint);
      fetchUpcoming();
    } catch (e) { console.error(e); }
  };

  const filtered = appointments.filter(a => {
    if (!query) return true;
    const name = a.patient?.user? `${a.patient.user.first_name} ${a.patient.user.last_name}` : '';
    return name.toLowerCase().includes(query.toLowerCase());
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <ClinOpsShell tabs={[{id:'gestion', label:'Gestion RDV'}]} activeTab={'gestion'}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Gestionnaire des Rendez-vous (Semaine)</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input placeholder="Rechercher patient" value={query} onChange={e=>setQuery(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8 }} />
            <button onClick={handlePrint} style={{ padding: '8px 10px', borderRadius: 8 }}>Imprimer agenda du jour</button>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: 10 }}>Heure</th>
                <th style={{ padding: 10 }}>Patient</th>
                <th style={{ padding: 10 }}>Médecin</th>
                <th style={{ padding: 10 }}>Date / Créneau</th>
                <th style={{ padding: 10 }}>Statut</th>
                <th style={{ padding: 10 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 10 }}>{new Date(a.date_heure).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</td>
                  <td style={{ padding: 10 }}>{a.patient?.user? `${a.patient.user.first_name} ${a.patient.user.last_name}` : 'N/A'}</td>
                  <td style={{ padding: 10 }}>{a.doctor? `Dr. ${a.doctor.first_name} ${a.doctor.last_name}` : 'N/A'}</td>
                  <td style={{ padding: 10 }}>{new Date(a.date_heure).toLocaleDateString('fr-FR')}</td>
                  <td style={{ padding: 10 }}>{a.status}</td>
                  <td style={{ padding: 10 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => changeStatus(a.id, 'Confirmé')} style={{ padding: '6px 8px', borderRadius: 6 }}>Confirm</button>
                      <button onClick={() => changeStatus(a.id, 'Annulé')} style={{ padding: '6px 8px', borderRadius: 6 }}>Cancel</button>
                      <button onClick={() => changeStatus(a.id, 'Honoré')} style={{ padding: '6px 8px', borderRadius: 6 }}>Complete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ClinOpsShell>
  );
};

export default GestionRdv;
