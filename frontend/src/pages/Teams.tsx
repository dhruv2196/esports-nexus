import React from 'react';
import { FaUsers } from 'react-icons/fa';

const Teams: React.FC = () => {
  return (
    <div style={{ padding: '100px 2rem', textAlign: 'center' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        {React.createElement(FaUsers as any, { style: { color: 'var(--color-primary)' } })}
        Teams
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
        Team recruitment and management coming soon...
      </p>
    </div>
  );
};

export default Teams;