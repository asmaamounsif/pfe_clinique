import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePatients from '../../hooks/usePatients';
import useAuth from '../../hooks/useAuth';
import patientService from '../../services/patientService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import PatientForm from '../../components/patients/PatientForm';

const PatientsList = () => {
  const { hasRole } = useAuth();
  const {
    patients,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    loading,
    error,
    reload
  } = usePatients();

  // État local pour le debounce de l'input de recherche
  const [searchInput, setSearchInput] = useState(search);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Effet de Debounce (300ms) pour la saisie de recherche
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Réinitialise à la première page
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchInput, setSearch, setPage]);

  // Ouverture du formulaire en mode Création
  const handleCreate = () => {
    setSelectedPatient(null);
    setIsFormOpen(true);
  };

  // Ouverture du formulaire en mode Modification
  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setIsFormOpen(true);
  };

  // Action de suppression (Admin uniquement)
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous certain de vouloir supprimer définitivement ce patient et l\'ensemble de ses antécédents médicaux ?')) {
      try {
        setDeleteError(null);
        const response = await patientService.deletePatient(id);
        if (response.data && response.data.success) {
          reload(); // Recharger la liste
        }
      } catch (err) {
        setDeleteError(err.response?.data?.message || 'Erreur lors de la suppression du patient.');
      }
    }
  };

  // Soumission réussie du formulaire (callback)
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedPatient(null);
    reload();
  };

  return (
    <div className="space-y-6">
      {/* En-tête de page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Index des Dossiers Patients</h1>
          <p className="text-sm text-gray-500 mt-1">Recherchez et gérez les dossiers cliniques de l'établissement.</p>
        </div>
        
        {/* Ajouter patient visible par secrétaires et admins */}
        {hasRole(['admin', 'secretaire']) && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center rounded-md bg-medical-800 hover:bg-medical-700 px-4 py-2.5 text-sm font-semibold text-white shadow transition-colors space-x-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>Nouveau Patient</span>
          </button>
        )}
      </div>

      {deleteError && <ErrorMessage message={deleteError} />}

      {/* Barre de recherche */}
      <div className="flex items-center bg-white rounded-lg shadow px-4 py-3 border border-gray-200">
        <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Rechercher par Nom, Prénom, Téléphone ou N° Sécurité Sociale (CIN)..."
          className="w-full text-sm text-gray-700 focus:outline-none placeholder-gray-400"
        />
        {searchInput && (
          <button onClick={() => setSearchInput('')} className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Chargement et erreurs */}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {/* Tableau des patients */}
      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        {loading && !patients.length ? (
          <div className="py-12"><LoadingSpinner message="Chargement de l'index des patients..." /></div>
        ) : !patients.length ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            Aucun dossier patient ne correspond à votre recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Identité / SSN</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Genre</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date Naissance</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Groupe</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient) => {
                  const hasUserAccount = !!patient.user;
                  const fullName = hasUserAccount 
                    ? `${patient.user.first_name} ${patient.user.last_name}` 
                    : "Patient Non Enregistré";
                  const email = patient.user?.email || "Pas d'adresse email";

                  return (
                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">{fullName}</span>
                          <span className="text-xs text-gray-500 font-mono mt-0.5">{patient.social_security_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <Badge type={patient.gender === 'M' ? 'blue' : patient.gender === 'F' ? 'purple' : 'gray'}>
                          {patient.gender}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {patient.date_of_birth}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {patient.phone || 'Non renseigné'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge type={patient.blood_type ? 'red' : 'gray'}>
                          {patient.blood_type || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {hasRole(['admin', 'medecin', 'infirmier']) && (
                          <Link
                            to={`/medecin/patients/${patient.id}`}
                            className="inline-flex items-center text-medical-800 hover:text-medical-600 font-semibold"
                          >
                            Dossier
                          </Link>
                        )}
                        
                        {/* Modifier : Secrétaire ou Admin */}
                        {hasRole(['admin', 'secretaire']) && (
                          <button
                            onClick={() => handleEdit(patient)}
                            className="inline-flex items-center text-gray-600 hover:text-medical-800 font-semibold ml-2"
                          >
                            Modifier
                          </button>
                        )}
                        
                        {/* Supprimer : Admin uniquement */}
                        {hasRole('admin') && (
                          <button
                            onClick={() => handleDelete(patient.id)}
                            className="inline-flex items-center text-red-600 hover:text-red-800 font-semibold ml-2"
                          >
                            Supprimer
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />

      {/* Modale de Formulaire Patient (Ajout / Modification) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {selectedPatient ? 'Modifier la Fiche Patient' : 'Enregistrer un Nouveau Patient'}
            </h2>
            <PatientForm
              patient={selectedPatient}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsList;
