import React from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaGamepad, FaUsers, FaChartLine } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      icon: FaGamepad,
      label: 'Matches Played',
      value: '156',
      change: '+12',
      color: 'var(--color-primary)'
    },
    {
      icon: FaTrophy,
      label: 'Wins',
      value: '42',
      change: '+5',
      color: 'var(--color-success)'
    },
    {
      icon: FaChartLine,
      label: 'K/D Ratio',
      value: '2.34',
      change: '+0.15',
      color: 'var(--color-secondary)'
    },
    {
      icon: FaUsers,
      label: 'Team Rank',
      value: '#24',
      change: '↑3',
      color: 'var(--color-accent)'
    }
  ];

  const recentMatches = [
    { id: 1, mode: 'Squad', result: 'Winner', kills: 8, damage: 1250, date: '2 hours ago' },
    { id: 2, mode: 'Duo', result: '#3', kills: 5, damage: 890, date: '5 hours ago' },
    { id: 3, mode: 'Solo', result: '#2', kills: 6, damage: 1100, date: '1 day ago' },
    { id: 4, mode: 'Squad', result: '#5', kills: 4, damage: 750, date: '2 days ago' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome back, <span className="neon-text">{user?.username}</span>!
        </motion.h1>
        <p className="dashboard-subtitle">Here's your gaming overview</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="stat-card glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="stat-icon" style={{ color: stat.color }}>
              {React.createElement(stat.icon as any)}
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-change" style={{ color: stat.color }}>
                {stat.change}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="dashboard-content">
        <motion.div
          className="recent-matches"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="section-title">Recent Matches</h2>
          <div className="matches-list">
            {recentMatches.map((match) => (
              <div key={match.id} className="match-item glass-card">
                <div className="match-mode">{match.mode}</div>
                <div className={`match-result ${match.result === 'Winner' ? 'winner' : ''}`}>
                  {match.result}
                </div>
                <div className="match-stats">
                  <span className="match-stat">
                    <strong>{match.kills}</strong> Kills
                  </span>
                  <span className="match-stat">
                    <strong>{match.damage}</strong> Damage
                  </span>
                </div>
                <div className="match-date">{match.date}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="quick-actions"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-list">
            <button className="action-button glass-card">
              {React.createElement(FaTrophy as any)}
              <span>Find Tournament</span>
            </button>
            <button className="action-button glass-card">
              {React.createElement(FaUsers as any)}
              <span>Join Team</span>
            </button>
            <button className="action-button glass-card">
              {React.createElement(FaGamepad as any)}
              <span>Track Stats</span>
            </button>
            <button className="action-button glass-card">
              {React.createElement(FaChartLine as any)}
              <span>View Analytics</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;