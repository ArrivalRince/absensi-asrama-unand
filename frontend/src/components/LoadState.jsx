import React from 'react';

export default function LoadState({ loading, error, children }) {
  if (loading) return <p className="state-message" aria-live="polite">Memuat data...</p>;
  if (error) return <p className="state-message state-error" role="alert">{error}</p>;
  return children;
}