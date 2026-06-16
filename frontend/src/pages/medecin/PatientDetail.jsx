import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import patientService from '../../services/patientService';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Badge from '../../components/common/Badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PatientDetail = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('consultations');

  const loadPatientData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const patientResponse = await patientService.getPatient(id);
      if (patientResponse.data && patientResponse.data.success) {
        setPatient(patientResponse.data.data);
      }

      const consultationsResponse = await api.get('/medecin/consultations', {
        params: { patient_id: id }
      });
      if (consultationsResponse.data && consultationsResponse.data.success) {
        setConsultations(consultationsResponse.data.data.consultations);
      }

      const prescriptionsResponse = await api.get('/medecin/prescriptions', {
        params: { patient_id: id }
      });
      if (prescriptionsResponse.data && prescriptionsResponse.data.success) {
        setPrescriptions(prescriptionsResponse.data.data.prescriptions);
      }
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des détails médicaux du patient.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  if (loading) return <div className="py-12"><LoadingSpinner message="Récupération du dossier médical complet..." /></div>;
  if (error) return <ErrorMessage message={error} onRetry={loadPatientData} />;
  if (!patient) return <div className="text-center py-12 text-gray-500">Patient introuvable.</div>;

  const hasUser = !!patient.user;
  const fullName = hasUser ? `${patient.user.first_name} ${patient.user.last_name}` : 'Profil Clinique Uniquement';
  const email = patient.user?.email || 'N/A';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 border-b border-gray-200 pb-5">
        <div className="flex items-center space-x-3">
          <Link to="/medecin/patients" className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
            <p className="text-sm text-gray-500 font-mono mt-0.5">ID Dossier : {patient.social_security_number}</p>
          </div>
        </div>

        <Link
          to={`/medecin/patients/${patient.id}/new-consultation`}
          className="inline-flex items-center justify-center rounded-md bg-medical-800 hover:bg-medical-700 px-4 py-2.5 text-sm font-semibold text-white shadow transition-colors space-x-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Nouvelle Consultation</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Informations Générales</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Genre</span>
                <Badge type={patient.gender === 'M' ? 'blue' : patient.gender === 'F' ? 'purple' : 'gray'}>
                  {patient.gender}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Date de naissance</span>
                <span className="text-gray-900 font-semibold">{patient.date_of_birth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Groupe Sanguin</span>
                <Badge type={patient.blood_type ? 'red' : 'gray'}>
                  {patient.blood_type || 'Non renseigné'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Téléphone</span>
                <span className="text-gray-900 font-semibold">{patient.phone || 'Non renseigné'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Email</span>
                <span className="text-gray-955 truncate max-w-[180px] font-semibold">{email}</span>
              </div>
              <div className="flex flex-col pt-2 border-t border-gray-100">
                <span className="text-gray-500 font-medium mb-1">Adresse</span>
                <span className="text-gray-700 italic">{patient.address || 'Aucune adresse renseignée.'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Dossier Médical Actif</h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="block text-red-700 font-bold mb-1">Allergies & Intolérances</span>
                <div className="p-2.5 bg-red-50 text-red-800 border border-red-100 rounded-lg text-xs font-semibold leading-relaxed">
                  {patient.medical_record?.allergies || 'Aucune allergie connue.'}
                </div>
              </div>
              <div>
                <span className="block text-gray-500 font-bold mb-1">Traitements en cours</span>
                <p className="text-gray-800 bg-gray-50 p-2.5 border border-gray-200 rounded-lg italic">
                  {patient.medical_record?.current_treatments || 'Aucun traitement actif.'}
                </p>
              </div>
              <div>
                <span className="block text-gray-500 font-bold mb-1">Antécédents Cliniques</span>
                <p className="text-gray-700 bg-gray-50 p-2.5 border border-gray-200 rounded-lg leading-relaxed whitespace-pre-wrap">
                  {patient.medical_record?.medical_history || 'Aucun antécédent.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {['consultations', 'prescriptions'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-2 py-4 px-1 text-sm font-semibold capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-medical-800 text-medical-800'
                      : 'border-transparent text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {tab === 'consultations' ? `Consultations (${consultations.length})` : `Ordonnances (${prescriptions.length})`}
                </button>
              ))}
            </nav>
          </div>

          {activeTab === 'consultations' && (
            <div className="space-y-6 mt-4">
              {!consultations.length ? (
                <p className="text-sm text-gray-500 py-6 text-center">Aucune consultation enregistrée.</p>
              ) : (
                <div className="flow-root">
                  <ul className="-mb-8">
                    {consultations.map((consultation, index) => {
                      const dateFormatted = format(new Date(consultation.date_consultation), 'd MMMM yyyy à HH:mm', { locale: fr });
                      return (
                        <li key={consultation.id}>
                          <div className="relative pb-8">
                            {index !== consultations.length - 1 && (
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                            )}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-medical-50 border border-medical-200 flex items-center justify-center text-medical-800 font-bold">C</span>
                              </div>
                              <div className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-bold text-gray-900">Motif : {consultation.motif}</h4>
                                  <span className="text-xs text-gray-500 font-semibold">{dateFormatted}</span>
                                </div>
                                <div className="mt-2 text-sm text-gray-700 space-y-2">
                                  {consultation.symptoms && <p><strong className="text-gray-900">Symptômes :</strong> {consultation.symptoms}</p>}
                                  {consultation.diagnostic && <p className="p-2 bg-blue-50/50 rounded border"><strong className="text-medical-800">Diagnostic :</strong> {consultation.diagnostic}</p>}
                                </div>
                                <div className="mt-3 text-xs text-gray-400 border-t border-gray-100 pt-2 flex items-center justify-between">
                                  <span>Médecin : Dr. {consultation.doctor?.last_name}</span>
                                  {consultation.tarif && <span>Honoraires : {consultation.tarif} €</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="space-y-4 mt-4">
              {!prescriptions.length ? (
                <p className="text-sm text-gray-500 py-6 text-center">Aucune ordonnance rédigée.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex justify-between items-center border-b pb-2 mb-2">
                        <span className="text-xs text-gray-500 font-semibold">Le {prescription.date_prescription}</span>
                        <Badge type={prescription.status === 'Active' ? 'green' : 'gray'}>{prescription.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-line font-mono bg-white p-2.5 rounded border">
                        {prescription.content}
                      </p>
                      <div className="mt-2 text-right text-xs text-gray-400">Dr. {prescription.doctor?.last_name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
