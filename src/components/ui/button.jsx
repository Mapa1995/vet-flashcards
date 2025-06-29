import React from 'react';

// Einfache Tailwind-Button-Komponente
export function Button({ variant = 'primary', className = '', ...props }) {
  const base = 'px-4 py-2 rounded font-medium transition';
  const styles = {
    primary:     'bg-blue-600 hover:bg-blue-700 text-white',
    secondary:   'bg-gray-200 hover:bg-gray-300 text-gray-900',
    outline:     'border border-gray-400 text-gray-900 bg-white hover:bg-gray-100',
    destructive: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <button
      className={`${base} ${styles[variant] || styles.primary} ${className}`}
      {...props}
    />
  );
}
