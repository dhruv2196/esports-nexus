import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTrophy, FaGamepad, FaUsers, FaChartBar } from 'react-icons/fa';
import { MdLiveTv } from 'react-icons/md';
import './Home.css';

const Home: React.FC = () => {
  const features = [
    {
      icon: FaGamepad,
      title: 'Track Gameplay',
      description: 'Connect your BGMI account and track your stats, match history, and performance trends.',
      color: 'var(--color-primary)'
    },
    {
      icon: MdLiveTv,
      title: 'Watch Live',
      description: 'Stream live matches, interact with viewers, and never miss exciting esports moments.',
      color: 'var(--color-secondary)'
    },
    {
      icon: FaTrophy,
      title: 'Join Tournaments',
      description: 'Participate in tournaments, create teams, and compete for amazing prizes.',
      color: 'var(--color-accent)'
    },
    {
      icon: FaUsers,
      title: 'Find Teams',
      description: 'Recruit teammates, join squads, and build your dream esports team.',
      color: 'var(--color-success)'
    },
    {
      icon: FaChartBar,
      title: 'Analytics',
      description: 'Deep dive into your gameplay with advanced statistics and insights.',
      color: 'var(--color-warning)'
    }
  ];

  return (
    <div className="home">
      <section className="hero">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="hero-title">
            Welcome to <span className="neon-text glow">Esports Nexus</span>
          </h1>
          <p className="hero-subtitle">
            Your ultimate platform for competitive gaming, tournaments, and esports community
          </p>
          <div className="hero-buttons">
            <Link to="/register">
              <button className="neon-button">Get Started</button>
            </Link>
            <Link to="/tournaments">
              <button className="neon-button secondary">Browse Tournaments</button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="hero-image"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <div className="floating-cards">
            <div className="floating-card card-1">
              <div className="stat-number">2.5K+</div>
              <div className="stat-label">Active Players</div>
            </div>
            <div className="floating-card card-2">
              <div className="stat-number">150+</div>
              <div className="stat-label">Tournaments</div>
            </div>
            <div className="floating-card card-3">
              <div className="stat-number">$50K</div>
              <div className="stat-label">Prize Pool</div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="features">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Everything You Need for <span className="neon-text">Competitive Gaming</span>
          </motion.h2>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card glass-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="feature-icon" style={{ color: feature.color }}>
                  {React.createElement(feature.icon as any)}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <motion.div
          className="cta-content"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="cta-title">Ready to Level Up Your Game?</h2>
          <p className="cta-subtitle">
            Join thousands of gamers competing in tournaments and tracking their progress
          </p>
          <Link to="/register">
            <button className="neon-button large">Join Now</button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;