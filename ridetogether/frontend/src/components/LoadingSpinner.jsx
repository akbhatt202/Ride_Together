import React from 'react';

export default function LoadingSpinner({ text = 'Loading...', size = 'medium' }) {
  const spinnerSize = size === 'small' ? '20px' : size === 'large' ? '48px' : '32px';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '0.75rem' }}>
      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: '3px solid #e2e8f0',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      {text && <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>{text}</span>}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
