import React from 'react';
import { motion } from 'framer-motion';
import SignalVisual from './SignalVisual';

const HomeObservatoryLogic = () => {
  const steps = [
    {
      title: "Signal Capture",
      description: "Real-time ingestion of market, technological, and regulatory shifts to establish the necessary environmental pressure.",
      visualType: "NETWORK"
    },
    {
      title: "System Observation",
      description: "Direct measurement of leadership system behavior during high-pressure transitions and strategic pivots.",
      visualType: "CONVERGENCE"
    },
    {
      title: "Pattern Diagnosis",
      description: "Identification of systemic friction and the gap between perceived alignment and behavioral reality.",
      visualType: "DIVERGENCE"
    }
  ];

  return (
    <section className="logic-section">
      <div className="container">
        <div className="section-header">
          <span className="eyebrow-label">Our Process</span>
          <h2 className="section-headline">How the Observatory Works</h2>
        </div>

        <div className="logic-grid">
          {steps.map((step, idx) => (
            <motion.div 
              key={idx} 
              className="logic-column"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1.2, delay: idx * 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="logic-visual-container">
                <SignalVisual 
                  type={step.visualType} 
                  width={200} 
                  height={120} 
                  color="#2dd4bf" 
                  opacity={0.3} 
                />
              </div>
              
              <div className="logic-content">
                <span className="logic-number">0{idx + 1}</span>
                <h3 className="logic-title">{step.title}</h3>
                <p className="logic-description">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .logic-section {
          padding: 140px 0;
          background: #0a192f;
          width: 100%;
          color: #ffffff;
        }
        .section-header {
          text-align: center;
          margin-bottom: 100px;
        }
        .eyebrow-label {
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #2dd4bf;
          display: block;
          margin-bottom: 16px;
        }
        .section-headline {
          font-family: var(--font-serif);
          font-size: 44px;
          font-weight: 500;
          color: #ffffff;
        }
        .logic-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 60px;
        }
        .logic-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 40px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .logic-visual-container {
          height: 120px;
          margin-bottom: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logic-number {
          font-family: var(--font-mono);
          font-size: 11px;
          color: #2dd4bf;
          font-weight: 700;
          margin-bottom: 24px;
          display: block;
        }
        .logic-title {
          font-family: var(--font-serif);
          font-size: 24px;
          font-weight: 500;
          color: #ffffff;
          margin-bottom: 24px;
        }
        .logic-description {
          font-family: var(--font-sans);
          font-size: 16px;
          color: #94a3b8;
          line-height: 1.7;
          max-width: 280px;
        }

        @media (max-width: 1024px) {
          .logic-grid { grid-template-columns: 1fr; gap: 40px; }
          .logic-column { padding: 40px 20px; }
          .logic-description { max-width: 400px; }
        }
        @media (max-width: 640px) {
          .section-headline { font-size: 32px; }
          .logic-section { padding: 80px 0; }
        }
      `}</style>
    </section>
  );
};

export default HomeObservatoryLogic;
