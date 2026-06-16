import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import patientService from '../../services/patientService';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const NewConsultation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulaire Consultation
  const [motif, setMotif] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnostic, setDiagnostic] = useState('');
  const [observations, setObservations] = useState('');
  const [tarif, setTarif] = useState('50.00');

  // Ordonnance dynamique
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '' }
  ]);

  // Récupération des informations du patient
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await patientService.getPatient(id);
        if (response.data && response.data.success) {
          setPatient(response.data.data);
        }
      } catch (err) {
        console.error(err);
        setError('Impossible de charger le dossier du patient.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  // Ajouter une ligne de médicament
  const addMedicationRow = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  // Supprimer une ligne de médicament
  const removeMedicationRow = (index) => {
    const list = [...medications];
    list.splice(index, 1);
    setMedications(list);
  };

  // Mise à jour d'un champ d'une ligne de médicament
  const handleMedicationChange = (index, field, value) => {
    const list = [...medications];
    list[index][field] = value;
    setMedications(list);
  };

  // Validation et soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!motif.trim()) {
      alert('Le motif de consultation est obligatoire.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Création de la Consultation
      const consultationResponse = await api.post('/medecin/consultations', {
        patient_id: id,
        date_consultation: new Date().toISOString(),
        motif,
        symptoms,
        diagnostic,
        observations,
        tarif: parseFloat(tarif)
      });

      if (consultationResponse.data && consultationResponse.data.success) {
        const newConsultation = consultationResponse.data.data;

        // 2. Vérification s'il y a des médicaments saisis pour l'ordonnance
        const filledMedications = medications.filter(m => m.name.trim() !== '');

        if (filledMedications.length > 0) {
          // Formatage du texte de l'ordonnance
          const prescriptionContent = filledMedications
            .map((m, idx) => `${idx + 1}. ${m.name} - ${m.dosage} (${m.frequency}) pendant ${m.duration}`)
            .join('\n');

          // Création de la Prescription liée à la consultation
          await api.post('/medecin/prescriptions', {
            consultation_id: newConsultation.id,
            patient_id: id,
            date_prescription: new Date().toISOString().split('T')[0],
            status: 'Active',
            content: prescriptionContent
          });
        }

        // Redirection vers le dossier du patient
        navigate(`/medecin/patients/${id}`);
      } else {
        setError('Impossible d\'enregistrer la consultation.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement de la visite médicale.');
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="py-12"><LoadingSpinner message="Chargement du dossier patient..." /></div>;
  if (error && !patient) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center space-x-3 border-b border-gray-200 pb-5">
        <Link to={`/medecin/patients/${id}`} className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle Consultation Clinique</h1>
          <p className="text-sm text-gray-500 mt-1">
            Patient : <strong className="text-gray-700">{patient?.user ? `${patient.user.first_name} ${patient.user.last_name}` : 'N/A'}</strong> (SSN: {patient?.social_security_number})
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6 text-sm">
        
        {/* Section 1: Examen Clinique */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Comptes-rendus d'Examen</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Motif */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Motif de la visite *
              </label>
              <input
                type="text"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Ex: Douleurs thoraciques, renouvellement ordonnance, suivi..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:border-medical-800"
                required
              />
            </div>

            {/* Symptômes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Symptômes observés
              </label>
              <textarea
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Description des symptômes signalés par le patient..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:border-medical-800"
              />
            </div>

            {/* Diagnostic */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Diagnostic clinique
              </label>
              <textarea
                rows={3}
                value={diagnostic}
                onChange={(e) => setDiagnostic(e.target.value)}
                placeholder="Hypothèse de diagnostic ou conclusion clinique..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:border-medical-800"
              />
            </div>

            {/* Observations / Notes */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Remarques & Observations confidentielles
              </label>
              <textarea
                rows={2}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Notes de suivi ou recommandations..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:border-medical-800"
              />
            </div>

            {/* Tarif */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Tarif Consultation (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={tarif}
                onChange={(e) => setTarif(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:border-medical-800"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Prescription / Ordonnance */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-lg font-bold text-gray-900">Médication (Ordonnance numérique)</h3>
            <button
              type="button"
              onClick={addMedicationRow}
              className="inline-flex items-center text-xs font-bold text-medical-800 hover:text-medical-600 space-x-1"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Ajouter un médicament</span>
            </button>
          </div>

          <div className="space-y-3">
            {medications.map((med, index) => (
              <div key={index} className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2 border-b border-gray-100 pb-3 md:pb-0 md:border-b-0">
                {/* Nom médicament */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={med.name}
                    onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                    placeholder="Nom du médicament (ex: Doliprane 1g)"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:border-medical-800"
                  />
                </div>

                {/* Posologie / Dosage */}
                <div className="w-full md:w-36">
                  <input
                    type="text"
                    value={med.dosage}
                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    placeholder="Posologie (ex: 1000mg)"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:border-medical-800"
                  />
                </div>

                {/* Fréquence */}
                <div className="w-full md:w-44">
                  <input
                    type="text"
                    value={med.frequency}
                    onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                    placeholder="Fréquence (ex: 3x par jour)"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:border-medical-800"
                  />
                </div>

                {/* Durée */}
                <div className="w-full md:w-36">
                  <input
                    type="text"
                    value={med.duration}
                    onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                    placeholder="Durée (ex: 7 jours)"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:border-medical-800"
                  />
                </div>

                {/* Supprimer la ligne */}
                {medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedicationRow(index)}
                    className="text-red-500 hover:text-red-700 pt-2 md:pt-0 self-end md:self-auto"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions Soumission */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Link
            to={`/medecin/patients/${id}`}
            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-medical-800 px-5 py-2 font-bold text-white hover:bg-medical-700 shadow transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Enregistrement...</span>
              </div>
            ) : (
              'Valider la Consultation & Ordonnance'
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default NewConsultation;
