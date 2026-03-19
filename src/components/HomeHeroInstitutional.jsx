import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SignalVisual from './SignalVisual';

const HomeHeroInstitutional = () => {
  return (
    <section className="hero-institutional">
      <div className="hero-visual-bg">
        <SignalVisual 
          type="CONVERGENCE" 
          width={1200} 
          height={600} 
          color="#2dd4bf" 
          opacity={0.15} 
        />
      </div>

      <div className="container hero-content">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="eyebrow-label">The Global Observatory</span>
          <h1 className="hero-headline">Leadership Adaptiveness Institute</h1>
          <p className="hero-subline">
            The institutional standard for measuring how leadership systems respond to disruption.
          </p>

          <div className="hero-actions">
            <Link to="/diagnostic" className="btn-institutional-hero primary">
              Measure Your Leadership System
            </Link>
            <Link to="/research/reports/state-of-cognition" className="btn-institutional-hero highlight">
              Explore Global Research
            </Link>
            <Link to="/observatory" className="btn-institutional-hero outline">
              How the Observatory Works
            </Link>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .hero-institutional {
          min-height: 90vh;
          width: 100%;
          background: #0a192f;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 120px 0;
        }
        .hero-visual-bg {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          opacity: 0.6;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 900px;
          margin: 0 auto;
        }
        .eyebrow-label {
          display: block;
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: #2dd4bf;
          margin-bottom: 24px;
          opacity: 0.9;
        }
        .hero-headline {
          font-family: var(--font-serif);
          font-size: 88px;
          font-weight: 500;
          color: #ffffff;
          line-height: 1.05;
          letter-spacing: -0.04em;
          margin-bottom: 32px;
        }
        .hero-subline {
          font-family: var(--font-sans);
          font-size: 22px;
          color: #94a3b8;
          max-width: 680px;
          margin: 0 auto 56px;
          line-height: 1.6;
          font-weight: 400;
        }
        .hero-actions {
          display: flex;
          gap: 24px;
          justify-content: center;
        }
        .btn-institutional-hero {
          padding: 1.25rem 3rem;
          border-radius: 4px;
          font-weight: 600;
          font-size: 15px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: var(--font-sans);
        }
        .btn-institutional-hero.primary {
          background: #2dd4bf;
          color: #0a192f;
        }
        .btn-institutional-hero.highlight {
          background: #ffffff;
          color: #0a192f;
        }
        .btn-institutional-hero.primary:hover, .btn-institutional-hero.highlight:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(45, 212, 191, 0.3);
        }
        .btn-institutional-hero.primary:hover { background: #14b8a6; }
        .btn-institutional-hero.highlight:hover { background: #f1f5f9; }
        .btn-institutional-hero.outline {
          background: transparent;
          border: 1px solid rgba(148, 163, 184, 0.3);
          color: #ffffff;
        }
        .btn-institutional-hero.outline:hover {
          border-color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
        }

        @media (max-width: 1024px) {
          .hero-headline { font-size: 64px; }
          .hero-subline { font-size: 18px; }
        }
        @media (max-width: 640px) {
          .hero-institutional { padding: 80px 20px; min-height: 80vh; }
          .hero-headline { font-size: 48px; }
          .hero-subline { font-size: 16px; margin-bottom: 40px; }
          .hero-actions { flex-direction: column; width: 100%; max-width: 320px; margin: 0 auto; }
          .btn-institutional-hero { padding: 1rem 2rem; width: 100%; text-align: center; }
        }
      `}</style>
    </section>
  );
};

export default HomeHeroInstitutional;
