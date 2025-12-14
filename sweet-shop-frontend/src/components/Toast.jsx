import React, { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`fixed top-6 left-1/2 z-50 -translate-x-1/2 px-6 py-3 rounded shadow-lg text-white text-base font-medium transition-all
      ${type === 'success' ? 'bg-green-600' : 'bg-rose-600'}`}
      role="alert"
    >
      {message}
      <button onClick={onClose} className="ml-4 text-white/80 hover:text-white font-bold">×</button>
    </div>
  );
}
