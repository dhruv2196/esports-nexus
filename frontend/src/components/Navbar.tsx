import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGamepad, FaTrophy, FaUsers, FaChartBar, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { MdLiveTv } from 'react-icons/md';
import { IconType } from 'react-icons';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  type NavItem = {
    path: string;
    label: string;
    icon: IconType;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navItems: NavItem[] = [
    { path: '/', label: 'Home', icon: FaGamepad },
    { path: '/tournaments', label: 'Tournaments', icon: FaTrophy },
    { path: '/live', label: 'Live', icon: MdLiveTv },
    { path: '/teams', label: 'Teams', icon: FaUsers },
    { path: '/stats', label: 'Stats', icon: FaChartBar },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <span className="logo-text neon-text glow">ESPORTS NEXUS</span>
          </motion.div>
        </Link>

        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className="navbar-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="navbar-icon">{React.createElement(Icon as any)}</span>
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            );
          })}

          {user ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link
                  to="/profile"
                  className="navbar-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="navbar-icon">{React.createElement(FaUser as any)}</span>
                  <span>{user.username}</span>
                </Link>
              </motion.div>
              <motion.button
                className="neon-button secondary"
                onClick={handleLogout}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Logout
              </motion.button>
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link to="/login" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <button className="neon-button">Sign Up</button>
                </Link>
              </motion.div>
            </>
          )}
        </div>

        <div className="mobile-menu-icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? React.createElement(FaTimes as any) : React.createElement(FaBars as any)}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;