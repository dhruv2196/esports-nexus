import React from 'react';
import { useParams } from 'react-router-dom';

const TournamentDetail: React.FC = () => {
  const { id } = useParams();

  return (
    <div style={{ padding: '100px 2rem', textAlign: 'center' }}>
      <h1>Tournament Details</h1>
      <p>Tournament ID: {id}</p>
      <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
        Tournament detail page coming soon...
      </p>
    </div>
  );
};

export default TournamentDetail;