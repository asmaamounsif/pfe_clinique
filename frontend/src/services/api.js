import axios from 'axios';

// Création de l'instance Axios
// En développement, Vite va rediriger '/api' vers 'http://localhost:3000' (Gateway)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// INTERCEPTEUR DE REQUÊTE : Injecte le token Bearer dans le header d'autorisation
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hospital_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// INTERCEPTEUR DE RÉPONSE : Gère les codes d'erreurs d'autorisation globaux
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 403) {
      // 403 Forbidden : Droits insuffisants (RBAC bloqué par le Gateway ou Laravel)
      window.location.href = '/unauthorized';
    }

    // 401 is now handled gracefully inside useApi.js which has access to the useAuth hook context.

    return Promise.reject(error);
  }
);

export default api;
