import React from 'react';

export default function StatsCard({ icon: Icon, label, value, subtext, color = 'green' }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {subtext && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>{subtext}</div>}
      </div>
    </div>
  );
}
