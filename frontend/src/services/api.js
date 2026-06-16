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

    if (status === 401) {
      // 401 Unauthorized : Le token a expiré ou est invalide
      // On vide le stockage local et on redirige vers l'authentification
      localStorage.removeItem('hospital_token');
      localStorage.removeItem('hospital_user');
      
      // Évite les boucles infinies de redirection si on est déjà sur la page de connexion
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    } else if (status === 403) {
      // 403 Forbidden : Droits insuffisants (RBAC bloqué par le Gateway ou Laravel)
      window.location.href = '/unauthorized';
    }

    return Promise.reject(error);
  }
);

export default api;
