import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook personnalisé pour simplifier la gestion des requêtes API Axios.
 * Gère automatiquement les états de chargement (loading) et les erreurs (error).
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (method, url, data = null, config = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api({
        method,
        url,
        data,
        ...config
      });
      setLoading(false);
      return { success: true, data: response.data.data, fullResponse: response.data };
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Une erreur de communication est survenue.';
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage, 
        errors: err.response?.data?.errors || null,
        status: err.response?.status
      };
    }
  }, []);

  return { loading, error, execute };
};

export default useApi;
