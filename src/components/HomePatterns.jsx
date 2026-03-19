import React from 'react';
import { motion } from 'framer-motion';
import SignalVisual from './SignalVisual';

const HomePatterns = () => {
  const patterns = [
    {
      title: "Alignment Without Movement",
      description: "Agreement is achieved at the cognitive level, but structural inertia prevents the reallocation of resources. The system 'stalls' at the moment of transition.",
      visualType: "CONVERGENCE",
      tag: "PATTERN 01"
    },
    {
      title: "Shared Awareness, Fragmented Action",
      description: "Internal signals are recognized across the organization, but execution paths diverge as individual business units prioritize local stability over systemic pivot.",
      visualType: "DIVERGENCE",
      tag: "PATTERN 02"
    },
    {
      title: "Decision Confidence, Resource Drift",
      description: "Confidence remains high even as operating choices lose coherence across the system. Strategic intent weakens as resources drift toward legacy outcomes.",
      visualType: "STALL",
      tag: "PATTERN 03"
    }
  ];

  return (
    <section className="patterns-section">
      <div className="container">
        <div className="section-intro">
          <span className="eyebrow-label">Systemic Breakdowns</span>
          <h2 className="section-headline">Recurring System Patterns</h2>
        </div>

        <div className="patterns-list">
          {patterns.map((pattern, idx) => (
            <motion.div 
              key={idx} 
              className={`pattern-exhibit ${idx % 2 === 1 ? 'reverse' : ''}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: idx * 0.2 }}
            >
              <div className="pattern-visual">
                <div className="visual-wrapper">
                  <SignalVisual 
                    type={pattern.visualType} 
                    width={400} 
                    height={200} 
                    color="#2dd4bf" 
                    opacity={0.4} 
                  />
                </div>
              </div>
              
              <div className="pattern-content">
                <span className="pattern-tag">{pattern.tag}</span>
                <h3 className="pattern-title">{pattern.title}</h3>
                <p className="pattern-description">{pattern.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .patterns-section {
          padding: 160px 0;
          background: #ffffff;
          width: 100%;
        }
        .section-intro {
          margin-bottom: 120px;
          text-align: center;
        }
        .eyebrow-label {
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #94a3b8;
          display: block;
          margin-bottom: 16px;
        }
        .section-headline {
          font-family: var(--font-serif);
          font-size: 48px;
          font-weight: 500;
          color: #0a192f;
        }
        .patterns-list {
          display: flex;
          flex-direction: column;
          gap: 160px;
        }
        .pattern-exhibit {
          display: flex;
          align-items: center;
          gap: 100px;
          text-align: left;
        }
        .pattern-exhibit.reverse {
          flex-direction: row-reverse;
          text-align: right;
        }
        .pattern-visual {
          flex: 1.2;
          display: flex;
          justify-content: center;
          background: #f8fafc;
          padding: 80px;
          border-radius: 4px;
          border: 1px solid #f1f5f9;
        }
        .visual-wrapper {
          transform: scale(1.2);
        }
        .pattern-content {
          flex: 1;
          max-width: 500px;
        }
        .pattern-tag {
          font-family: var(--font-mono);
          font-size: 11px;
          color: #2dd4bf;
          font-weight: 600;
          letter-spacing: 0.1em;
          margin-bottom: 24px;
          display: block;
        }
        .pattern-title {
          font-family: var(--font-serif);
          font-size: 36px;
          font-weight: 500;
          color: #0a192f;
          line-height: 1.2;
          margin-bottom: 32px;
        }
        .pattern-description {
          font-family: var(--font-sans);
          font-size: 18px;
          color: #64748b;
          line-height: 1.7;
        }

        @media (max-width: 1024px) {
          .pattern-exhibit, .pattern-exhibit.reverse {
             flex-direction: column;
             gap: 60px;
             text-align: left;
          }
          .pattern-content { max-width: 100%; }
          .patterns-list { gap: 100px; }
          .pattern-visual { padding: 40px; }
        }
        @media (max-width: 640px) {
          .section-headline { font-size: 36px; }
          .pattern-title { font-size: 28px; }
          .pattern-description { font-size: 16px; }
          .patterns-section { padding: 80px 0; }
        }
      `}</style>
    </section>
  );
};

export default HomePatterns;
