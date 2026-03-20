import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SignalVisual from './SignalVisual';

const HomeFinalCTA = () => {
  return (
    <section className="final-cta-section">
      <div className="cta-visual-bg">
        <SignalVisual 
          type="COHERENCE" 
          width={800} 
          height={300} 
          color="#2dd4bf" 
          opacity={0.1} 
        />
      </div>

      <div className="container cta-content">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="cta-headline">
            Reveal the gap between perceived alignment and observed system behavior.
          </h2>
          
          <div className="cta-actions">
            <Link to="/diagnostic" className="btn-institutional-final primary">
              Initiate Measurement Cycle
            </Link>
            <Link to="/framework" className="btn-institutional-final outline">
              Institutional Framework
            </Link>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .final-cta-section {
          padding: 160px 0;
          background: #0a192f;
          width: 100%;
          position: relative;
          overflow: hidden;
          text-align: center;
        }
        .cta-visual-bg {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          opacity: 0.5;
        }
        .cta-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          margin: 0 auto;
        }
        .cta-headline {
          font-family: var(--font-serif);
          font-size: 44px;
          font-weight: 500;
          color: #ffffff;
          line-height: 1.25;
          margin-bottom: 64px;
          letter-spacing: -0.01em;
        }
        .cta-actions {
          display: flex;
          gap: 24px;
          justify-content: center;
        }
        .btn-institutional-final {
          padding: 1.25rem 3rem;
          border-radius: 4px;
          font-weight: 600;
          font-size: 15px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: var(--font-sans);
          cursor: pointer;
        }
        .btn-institutional-final.primary {
          background: #2dd4bf;
          color: #0a192f;
          border: none;
        }
        .btn-institutional-final.primary:hover {
          background: #14b8a6;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(45, 212, 191, 0.3);
        }
        .btn-institutional-final.outline {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }
        .btn-institutional-final.outline:hover {
          border-color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
        }

        @media (max-width: 768px) {
          .cta-headline { font-size: 32px; margin-bottom: 48px; }
          .cta-actions { flex-direction: column; width: 100%; max-width: 320px; margin: 0 auto; }
          .btn-institutional-final { width: 100%; text-align: center; }
          .final-cta-section { padding: 100px 20px; }
        }
      `}</style>
    </section>
  );
};

export default HomeFinalCTA;
