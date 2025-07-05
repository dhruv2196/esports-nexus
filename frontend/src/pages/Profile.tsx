import React from 'react';
import { FaUser } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: '100px 2rem', textAlign: 'center' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        {React.createElement(FaUser as any, { style: { color: 'var(--color-primary)' } })}
        Profile
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
        Welcome, {user?.username}!
      </p>
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
        Profile management coming soon...
      </p>
    </div>
  );
};

export default Profile;