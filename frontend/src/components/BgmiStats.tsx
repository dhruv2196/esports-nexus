import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gameStatsService, BgmiPlayer } from '../services/gameStatsService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import './BgmiStats.css';

const BgmiStats: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BgmiPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [myStats, setMyStats] = useState<any>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadMyStats();
    }
  }, [user]);

  const loadMyStats = async () => {
    try {
      const stats = await gameStatsService.getMyBgmiStats();
      if (stats) {
        setMyStats(stats);
      }
    } catch (error) {
      console.log('No BGMI account linked');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await gameStatsService.searchBgmiPlayers(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        toast.error('No players found');
      }
    } catch (error) {
      toast.error('Error searching players');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAccount = async (player: BgmiPlayer) => {
    try {
      await gameStatsService.linkBgmiAccount(player.name);
      toast.success('BGMI account linked successfully!');
      loadMyStats();
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      toast.error('Error linking account');
    }
  };

  const viewPlayerStats = async (player: BgmiPlayer) => {
    setLoading(true);
    try {
      const stats = await gameStatsService.getBgmiPlayerStats(player.id);
      setSelectedPlayer(stats);
    } catch (error) {
      toast.error('Error loading player stats');
    } finally {
      setLoading(false);
    }
  };

  const renderStats = (stats: any) => {
    if (!stats || !stats.lifetimeStats) return null;

    const gameModeStats = stats.lifetimeStats.gameModeStats;
    const squadStats = gameModeStats?.['squad-fpp'] || gameModeStats?.['squad'] || {};

    const kills = squadStats.kills || 0;
    const deaths = squadStats.losses || 0;
    const wins = squadStats.wins || 0;
    const matches = squadStats.roundsPlayed || 0;
    const kd = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2);
    const winRate = matches > 0 ? ((wins / matches) * 100).toFixed(1) : '0';

    return (
      <div className="stats-grid">
        <motion.div
          className="stat-card glass-card"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="stat-icon">🏆</div>
          <h3>Wins</h3>
          <p className="stat-value">{wins}</p>
          <p className="stat-label">Chicken Dinners</p>
        </motion.div>

        <motion.div
          className="stat-card glass-card"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="stat-icon">🎯</div>
          <h3>Kills</h3>
          <p className="stat-value">{kills}</p>
          <p className="stat-label">Total Eliminations</p>
        </motion.div>

        <motion.div
          className="stat-card glass-card"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="stat-icon">💀</div>
          <h3>K/D Ratio</h3>
          <p className="stat-value">{kd}</p>
          <p className="stat-label">Kill/Death</p>
        </motion.div>

        <motion.div
          className="stat-card glass-card"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="stat-icon">📊</div>
          <h3>Win Rate</h3>
          <p className="stat-value">{winRate}%</p>
          <p className="stat-label">Victory Percentage</p>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="bgmi-stats-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="section-title">BGMI Stats Tracker</h2>

        {/* Search Section */}
        <div className="search-section glass-card">
          <h3>Search BGMI Player</h3>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Enter BGMI username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="search-button neon-button"
            >
              {loading ? 'Searching...' : '🔍'}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((player) => (
                <div key={player.id} className="player-result">
                  <span>{player.name}</span>
                  <div className="player-actions">
                    <button
                      onClick={() => viewPlayerStats(player)}
                      className="action-button"
                    >
                      View Stats
                    </button>
                    {user && !myStats && (
                      <button
                        onClick={() => handleLinkAccount(player)}
                        className="action-button link-button"
                      >
                        🔗 Link Account
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Stats Section */}
        {myStats && (
          <motion.div
            className="my-stats-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3>My BGMI Stats</h3>
            <p className="player-name">{myStats.playerName}</p>
            {renderStats(myStats)}
          </motion.div>
        )}

        {/* Selected Player Stats */}
        {selectedPlayer && (
          <motion.div
            className="selected-player-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3>{selectedPlayer.player.name}'s Stats</h3>
            {renderStats(selectedPlayer)}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default BgmiStats;