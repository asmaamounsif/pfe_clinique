import React from 'react';

const Badge = ({ type = 'gray', children }) => {
  const styles = {
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const selectedStyle = styles[type] || styles.gray;

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold border ${selectedStyle}`}>
      {children}
    </span>
  );
};

export default Badge;
