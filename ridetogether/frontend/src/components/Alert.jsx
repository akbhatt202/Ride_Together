import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;

  const isSuccess = type === 'success';
  const isInfo = type === 'info';

  const alertClass = isSuccess ? 'alert alert-success' : isInfo ? 'alert alert-info' : 'alert alert-error';

  return (
    <div className={alertClass} role="alert" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {isSuccess ? <CheckCircle size={18} /> : isInfo ? <Info size={18} /> : <AlertCircle size={18} />}
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0.2rem' }}
          title="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
