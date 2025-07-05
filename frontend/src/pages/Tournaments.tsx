import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTrophy, FaUsers, FaCalendar, FaDollarSign } from 'react-icons/fa';
import { tournamentService } from '../services/tournamentService';
import { Tournament } from '../types';
import './Tournaments.css';

const Tournaments: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadTournaments();
  }, [filter]);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const data = await tournamentService.getTournaments(
        filter === 'all' ? undefined : filter
      );
      setTournaments(data);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REGISTRATION_OPEN':
        return 'var(--color-success)';
      case 'ONGOING':
        return 'var(--color-primary)';
      case 'UPCOMING':
        return 'var(--color-secondary)';
      case 'COMPLETED':
        return 'var(--text-muted)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="tournaments-page">
      <div className="tournaments-header">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {React.createElement(FaTrophy as any, { className: "page-icon" })}
          Tournaments
        </motion.h1>
        <p className="page-subtitle">Compete in exciting tournaments and win amazing prizes</p>
      </div>

      <div className="tournaments-filters">
        <button
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Tournaments
        </button>
        <button
          className={`filter-button ${filter === 'REGISTRATION_OPEN' ? 'active' : ''}`}
          onClick={() => setFilter('REGISTRATION_OPEN')}
        >
          Open for Registration
        </button>
        <button
          className={`filter-button ${filter === 'ONGOING' ? 'active' : ''}`}
          onClick={() => setFilter('ONGOING')}
        >
          Ongoing
        </button>
        <button
          className={`filter-button ${filter === 'UPCOMING' ? 'active' : ''}`}
          onClick={() => setFilter('UPCOMING')}
        >
          Upcoming
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="tournaments-grid">
          {tournaments.map((tournament, index) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/tournaments/${tournament.id}`} className="tournament-card glass-card">
                <div className="tournament-banner">
                  {tournament.bannerImage ? (
                    <img src={tournament.bannerImage} alt={tournament.name} />
                  ) : (
                    <div className="tournament-banner-placeholder">
                      {React.createElement(FaTrophy as any)}
                    </div>
                  )}
                  <div
                    className="tournament-status"
                    style={{ backgroundColor: getStatusColor(tournament.status) }}
                  >
                    {tournament.status.replace('_', ' ')}
                  </div>
                </div>

                <div className="tournament-content">
                  <h3 className="tournament-name">{tournament.name}</h3>
                  <p className="tournament-description">{tournament.description}</p>

                  <div className="tournament-info">
                    <div className="info-item">
                      {React.createElement(FaUsers as any)}
                      <span>{tournament.registeredTeamIds.length}/{tournament.maxTeams} Teams</span>
                    </div>
                    <div className="info-item">
                      {React.createElement(FaCalendar as any)}
                      <span>{formatDate(tournament.startDate)}</span>
                    </div>
                    {tournament.prizePool && (
                      <div className="info-item">
                        {React.createElement(FaDollarSign as any)}
                        <span>${tournament.prizePool.totalAmount}</span>
                      </div>
                    )}
                  </div>

                  <div className="tournament-footer">
                    <span className="tournament-game">{tournament.game.toUpperCase()}</span>
                    <span className="tournament-type">{tournament.type}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && tournaments.length === 0 && (
        <div className="empty-state">
          {React.createElement(FaTrophy as any, { className: "empty-icon" })}
          <h3>No tournaments found</h3>
          <p>Check back later for new tournaments</p>
        </div>
      )}
    </div>
  );
};

export default Tournaments;