import React from 'react';

const LoadingSpinner = ({ message = 'Chargement en cours...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-medical-800 border-t-transparent"></div>
      <p className="text-gray-500 font-medium text-sm">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
