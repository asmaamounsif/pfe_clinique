import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

/**
 * Route sécurisée vérifiant l'authentification et les droits d'accès (rôles).
 * Affiche un indicateur de chargement pendant la restauration de session.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading, hasRole } = useAuth();
  const location = useLocation();

  // Affichage d'un spinner temporaire pendant la vérification du jeton d'accès
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-medical-800 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Redirection vers le formulaire de connexion si non connecté
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirection vers la page d'accès refusé (403) si le rôle n'est pas autorisé
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
