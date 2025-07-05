import React from 'react';
import { motion } from 'framer-motion';
import BgmiStats from '../components/BgmiStats';
import './Stats.css';

const Stats: React.FC = () => {
  return (
    <motion.div
      className="stats-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <h1 className="page-title">Game Statistics</h1>
        <p className="page-subtitle">Track your performance across different games</p>
        
        <div className="stats-content">
          <BgmiStats />
        </div>
      </div>
    </motion.div>
  );
};

export default Stats;