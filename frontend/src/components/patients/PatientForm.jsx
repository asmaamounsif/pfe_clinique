import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../services/api';
import patientService from '../../services/patientService';
import ErrorMessage from '../common/ErrorMessage';

// Schéma de validation Zod en Français
const patientSchema = z.object({
  user_id: z.string().nullable().optional()
    .transform(val => val === '' || val === 'null' ? null : parseInt(val, 10)),
  social_security_number: z.string()
    .min(1, 'Le numéro de sécurité sociale (CIN) est obligatoire.')
    .max(30, 'Le SSN ne doit pas dépasser 30 caractères.'),
  date_of_birth: z.string()
    .min(1, 'La date de naissance est obligatoire.')
    .refine(val => new Date(val) < new Date(), {
      message: 'La date de naissance doit être dans le passé.'
    }),
  gender: z.enum(['M', 'F', 'Autre'], {
    errorMap: () => ({ message: 'Le genre doit être M, F ou Autre.' })
  }),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''], {
    errorMap: () => ({ message: 'Groupe sanguin non valide.' })
  }).transform(val => val === '' ? null : val),
  emergency_contact_name: z.string().nullable().optional(),
  emergency_contact_phone: z.string().nullable().optional(),
});

const PatientForm = ({ patient, onSuccess, onCancel }) => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialisation du formulaire
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      user_id: 'null',
      social_security_number: '',
      date_of_birth: '',
      gender: 'M',
      phone: '',
      address: '',
      blood_type: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
    }
  });

  // Chargement des utilisateurs (rôle Patient) disponibles pour association
  useEffect(() => {
    const fetchAvailableUsers = async () => {
      setLoadingUsers(true);
      try {
        // Appelle une route système ou admin pour récupérer les utilisateurs sans dossier patient
        const response = await api.get('/admin/users'); // Mocké ou réel
        if (response.data && response.data.success) {
          // Filtrer les utilisateurs qui ont le rôle 'patient'
          const patientUsers = response.data.data.filter(u => u.role?.slug === 'patient');
          setUsers(patientUsers);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des comptes utilisateurs:', err);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (!patient) {
      fetchAvailableUsers();
    }
  }, [patient]);

  // Si on est en édition, préremplir les données
  useEffect(() => {
    if (patient) {
      setValue('user_id', patient.user?.id ? String(patient.user.id) : 'null');
      setValue('social_security_number', patient.social_security_number || '');
      setValue('date_of_birth', patient.date_of_birth || '');
      setValue('gender', patient.gender || 'M');
      setValue('phone', patient.phone || '');
      setValue('address', patient.address || '');
      setValue('blood_type', patient.blood_type || '');
      setValue('emergency_contact_name', patient.emergency_contact_name || '');
      setValue('emergency_contact_phone', patient.emergency_contact_phone || '');
    }
  }, [patient, setValue]);

  // Soumission du formulaire
  const onSubmit = async (data) => {
    setIsSaving(true);
    setApiError(null);

    try {
      let response;
      if (patient) {
        // Modification (PUT)
        response = await patientService.updatePatient(patient.id, data);
      } else {
        // Création (POST)
        response = await patientService.createPatient(data);
      }

      if (response.data && response.data.success) {
        setIsSaving(false);
        onSuccess();
      } else {
        setApiError(response.data.message || 'Une erreur est survenue.');
        setIsSaving(false);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Erreur lors de l\'enregistrement des données.';
      setApiError(msg);
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-sm">
      {apiError && <ErrorMessage message={apiError} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Choix du compte utilisateur (optionnel, uniquement en création) */}
        {!patient && (
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Associer un compte d'accès (Optionnel)
            </label>
            <select
              {...register('user_id')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:border-medical-800"
            >
              <option value="null">Aucun compte (Patient physique uniquement)</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.first_name} {u.last_name} ({u.email})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Sélectionnez un compte si le patient s'est déjà inscrit en ligne.</p>
          </div>
        )}

        {/* Numéro de sécurité sociale / CIN */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            N° Sécurité Sociale / CIN *
          </label>
          <input
            type="text"
            {...register('social_security_number')}
            placeholder="Ex: 1890975123456"
            className={`w-full rounded-lg border px-3 py-2 text-gray-700 focus:outline-none focus:border-medical-800 ${
              errors.social_security_number ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.social_security_number && (
            <p className="text-xs text-red-600 font-semibold mt-1">{errors.social_security_number.message}</p>
          )}
        </div>

        {/* Date de naissance */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Date de naissance *
          </label>
          <input
            type="date"
            {...register('date_of_birth')}
            className={`w-full rounded-lg border px-3 py-2 text-gray-700 focus:outline-none focus:border-medical-800 ${
              errors.date_of_birth ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {errors.date_of_birth && (
            <p className="text-xs text-red-600 font-semibold mt-1">{errors.date_of_birth.message}</p>
          )}
        </div>

        {/* Genre */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Genre *
          </label>
          <select
            {...register('gender')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:border-medical-800"
          >
            <option value="M">Masculin (M)</option>
            <option value="F">Féminin (F)</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        {/* Groupe Sanguin */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Groupe Sanguin
          </label>
          <select
            {...register('blood_type')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:border-medical-800"
          >
            <option value="">Non renseigné</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Téléphone de contact
          </label>
          <input
            type="text"
            {...register('phone')}
            placeholder="Ex: 0612345678"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:border-medical-800"
          />
        </div>

        {/* Adresse */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Adresse de résidence
          </label>
          <input
            type="text"
            {...register('address')}
            placeholder="Ex: 12 Rue des Fleurs, Lyon"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:border-medical-800"
          />
        </div>

        {/* Nom contact d'urgence */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Nom contact d'urgence
          </label>
          <input
            type="text"
            {...register('emergency_contact_name')}
            placeholder="Nom & Prénom"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:border-medical-800"
          />
        </div>

        {/* Téléphone contact d'urgence */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            N° Téléphone urgence
          </label>
          <input
            type="text"
            {...register('emergency_contact_phone')}
            placeholder="Ex: 0687654321"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:border-medical-800"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 border-t border-gray-100 pt-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-medical-800 px-4 py-2 text-white font-bold hover:bg-medical-700 shadow transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
};

export default PatientForm;
