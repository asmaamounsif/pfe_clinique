import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hospital_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restauration de session : vérifie le token et récupère le profil de l'utilisateur
  const restoreSession = useCallback(async () => {
    const savedToken = localStorage.getItem('hospital_token');
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    try {
      // Appel vers la route Laravel /api/me via le Gateway
      const response = await api.get('/me');
      if (response.data && response.data.success) {
        setUser(response.data.data);
        setIsAuthenticated(true);
      } else {
        // En cas d'erreur de format de réponse
        handleClearAuth();
      }
    } catch (error) {
      console.error('Erreur de restauration de session:', error);
      handleClearAuth();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Nettoyage de l'état d'authentification
  const handleClearAuth = () => {
    localStorage.removeItem('hospital_token');
    localStorage.removeItem('hospital_user');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  // Connexion de l'utilisateur
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await api.post('/login', { email, password });
      
      if (response.data && response.data.success) {
        const { user: loggedUser, access_token } = response.data.data;
        
        localStorage.setItem('hospital_token', access_token);
        localStorage.setItem('hospital_user', JSON.stringify(loggedUser));
        
        setToken(access_token);
        setUser(loggedUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true, user: loggedUser };
      } else {
        handleClearAuth();
        setIsLoading(false);
        return { 
          success: false, 
          message: response.data.message || 'Échec de la connexion' 
        };
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      handleClearAuth();
      setIsLoading(false);
      
      const errorMessage = error.response?.data?.message || 'Identifiants incorrects ou serveur injoignable.';
      return { 
        success: false, 
        message: errorMessage,
        errors: error.response?.data?.errors || null
      };
    }
  };

  // Déconnexion de l'utilisateur
  const logout = async () => {
    setIsLoading(true);
    try {
      // Appel de la route logout de Laravel pour révoquer le token côté serveur
      await api.post('/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion serveur:', error);
    } finally {
      handleClearAuth();
      setIsLoading(false);
      window.location.href = '/login';
    }
  };

  // Vérification de rôle (RBAC) - Accepte un string ou un tableau de rôles
  const hasRole = (roles) => {
    if (!user || !user.role) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role.slug);
    }
    return user.role.slug === roles;
  };

  // Vérification de permissions (extensible si des privilèges précis sont configurés)
  const hasPermission = (permission) => {
    if (!user) return false;
    // Par défaut si admin, tout est permis
    if (user.role?.slug === 'admin') return true;
    
    // Mappage simple Rôle -> Droits pour démonstration
    const permissionsMap = {
      medecin: ['view-patients', 'create-consultations', 'view-consultations', 'create-prescriptions', 'view-prescriptions', 'view-appointments', 'update-appointments'],
      secretaire: ['view-patients', 'create-patients', 'update-patients', 'create-appointments', 'view-appointments'],
      infirmier: ['view-patients', 'view-consultations', 'view-appointments'],
      patient: ['view-own-profile', 'view-own-prescriptions', 'view-own-appointments']
    };

    const userRole = user.role?.slug;
    const allowedPermissions = permissionsMap[userRole] || [];
    return allowedPermissions.includes(permission);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
    hasPermission,
    refreshUser: restoreSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
