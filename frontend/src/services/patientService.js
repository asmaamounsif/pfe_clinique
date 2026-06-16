import api from './api';

// Récupère dynamiquement le préfixe d'URL requis par les groupes de routes Laravel en fonction du rôle
const getRolePrefix = () => {
  try {
    const userStr = localStorage.getItem('hospital_user');
    if (!userStr) return 'patient';
    const user = JSON.parse(userStr);
    const role = user.role?.slug;
    
    if (role === 'admin') return 'admin';
    if (role === 'medecin') return 'medecin';
    if (role === 'secretaire') return 'secretaire';
    return 'patient';
  } catch (e) {
    return 'patient';
  }
};

const patientService = {
  /**
   * Récupère la liste des patients paginée avec recherche optionnelle.
   */
  getPatients: (search = '', page = 1, perPage = 10) => {
    const prefix = getRolePrefix();
    return api.get(`/${prefix}/patients`, {
      params: { search, page, per_page: perPage }
    });
  },

  /**
   * Récupère la fiche détaillée d'un patient par son ID.
   */
  getPatient: (id) => {
    const prefix = getRolePrefix();
    // Gère la route spécifique profil pour le rôle patient
    const path = prefix === 'patient' ? `/patient/profile/${id}` : `/${prefix}/patients/${id}`;
    return api.get(path);
  },

  /**
   * Crée un nouveau patient (Secrétaire/Admin).
   */
  createPatient: (data) => {
    const prefix = getRolePrefix();
    return api.post(`/${prefix}/patients`, data);
  },

  /**
   * Met à jour les informations d'un patient.
   */
  updatePatient: (id, data) => {
    const prefix = getRolePrefix();
    const path = prefix === 'patient' ? `/patient/profile/${id}` : `/${prefix}/patients/${id}`;
    return api.put(path, data);
  },

  /**
   * Supprime un patient (Admin uniquement).
   */
  deletePatient: (id) => {
    return api.delete(`/admin/patients/${id}`);
  }
};

export default patientService;
