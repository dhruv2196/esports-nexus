import React from 'react';
import { MdLiveTv } from 'react-icons/md';

const LiveMatches: React.FC = () => {
  return (
    <div style={{ padding: '100px 2rem', textAlign: 'center' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        {React.createElement(MdLiveTv as any, { style: { color: 'var(--color-danger)' } })}
        Live Matches
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
        Live streaming feature coming soon...
      </p>
    </div>
  );
};

export default LiveMatches;