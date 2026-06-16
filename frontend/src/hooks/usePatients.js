import { useState, useEffect, useCallback } from 'react';
import patientService from '../services/patientService';

/**
 * Hook personnalisé pour encapsuler l'état et la récupération des patients.
 * Gère le chargement, les erreurs, les filtres et la pagination.
 */
export const usePatients = (initialSearch = '', initialPage = 1) => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientService.getPatients(search, page);
      if (response.data && response.data.success) {
        const { patients: data, pagination } = response.data.data;
        setPatients(data);
        setTotalPages(pagination.total_pages);
        setTotalItems(pagination.total);
      } else {
        setError(response.data.message || 'Erreur inconnue de récupération.');
      }
    } catch (err) {
      console.error('Erreur du hook usePatients:', err);
      setError(err.response?.data?.message || 'Impossible de se connecter aux serveurs cliniques.');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  // Chargement automatique au montage et à chaque changement de page/recherche
  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  return {
    patients,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    totalItems,
    loading,
    error,
    reload: loadPatients
  };
};

export default usePatients;
