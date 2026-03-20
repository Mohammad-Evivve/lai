import React from 'react';
import { motion } from 'framer-motion';

const HomeObservedSystems = () => {
  const metrics = [
    {
      id: 'simulations',
      value: '20,000+',
      label: 'SIMULATED ENVIRONMENTS',
      annotation: 'High-fidelity behavioral datasets emerging from the LAI global observatory.',
      visual: 'network'
    },
    {
      id: 'pressure',
      value: '68%',
      label: 'BEHAVIORAL FRICTION',
      annotation: 'The observed delta between stated institutional intent and actual system action.',
      visual: 'convergence'
    },
    {
      id: 'friction',
      value: '#1',
      label: 'PRIMARY RISK: FRAGMENTATION',
      annotation: 'The breakdown of systemic coherence under environmental disruption.',
      visual: 'imbalance'
    },
    {
      id: 'gap',
      value: 'SOC v3',
      label: 'GOVERNANCE BASELINE',
      annotation: 'The institutional standard for measuring leadership system response velocity.',
      visual: 'drift'
    }
  ];

  return (
    <section className="observed-systems-section">
      <div className="section-container">
        <div className="section-header">
          <span className="header-label">Institutional Benchmarking</span>
          <div className="header-line"></div>
          <p className="header-subtitle">Measured through 20,000+ simulated environments and 100,000+ data points.</p>
        </div>

        <div className="metrics-grid">
          {metrics.map((metric, idx) => (
            <motion.div 
              key={metric.id}
              className="metric-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="metric-visual-container">
                <VisualElement type={metric.visual} />
              </div>
              
              <div className="metric-content">
                <h3 className="metric-value">{metric.value}</h3>
                <span className="metric-label">{metric.label}</span>
                <p className="metric-annotation">{metric.annotation}</p>
              </div>

              {idx < metrics.length - 1 && <div className="vertical-divider" />}
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .observed-systems-section {
          width: 100%;
          background: #ffffff;
          padding: 160px 0;
          border-top: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
          overflow: hidden;
          position: relative;
        }
        .observed-systems-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(180deg, rgba(248, 250, 252, 0) 0%, rgba(248, 250, 252, 0.3) 100%);
          pointer-events: none;
        }
        .section-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          position: relative;
          z-index: 1;
        }
        .section-header {
          margin-bottom: 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .header-label {
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #94a3b8;
          margin-bottom: 16px;
        }
        .header-line {
          width: 40px;
          height: 1px;
          background: #2dd4bf;
          margin-bottom: 16px;
        }
        .header-subtitle {
          font-family: var(--font-serif);
          font-size: 20px;
          color: #64748b;
          font-style: italic;
          opacity: 0.8;
        }
        .metrics-grid {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          width: 100%;
          gap: 0;
        }
        .metric-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          padding: 0 40px;
          transition: opacity 0.5s ease;
        }
        .metric-card:hover {
          opacity: 1 !important;
        }
        .metric-visual-container {
          height: 100px;
          width: 100%;
          margin-bottom: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vertical-divider {
          position: absolute;
          right: 0;
          top: 0;
          height: 100%;
          width: 1px;
          background: linear-gradient(to bottom, transparent, #f1f5f9 20%, #f1f5f9 80%, transparent);
        }
        .metric-value {
          font-family: var(--font-serif);
          font-size: 100px;
          font-weight: 500;
          line-height: 0.9;
          color: #0a192f;
          letter-spacing: -0.05em;
          margin-bottom: 32px;
        }
        .metric-label {
          display: block;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #0a192f;
          margin-bottom: 12px;
          text-align: center;
        }
        .metric-annotation {
          font-family: var(--font-mono);
          font-size: 10px;
          color: #94a3b8;
          max-width: 240px;
          margin: 0 auto;
          line-height: 1.6;
          text-align: center;
          opacity: 0.8;
        }

        @media (max-width: 1200px) {
          .metric-value { font-size: 80px; }
          .metric-card { padding: 0 20px; }
        }
        @media (max-width: 1024px) {
          .observed-systems-section { padding: 100px 0; }
          .metrics-grid { flex-wrap: wrap; }
          .metric-card { flex: 0 0 50%; margin-bottom: 80px; }
          .vertical-divider { display: none; }
          .metric-card:nth-child(even) { border-left: 1px solid #f1f5f9; }
        }
        @media (max-width: 640px) {
          .metric-card { flex: 0 0 100%; border-left: none !important; margin-bottom: 60px; }
          .metric-value { font-size: 64px; }
          .observed-systems-section { padding: 80px 0; }
          .section-header { margin-bottom: 60px; }
        }
      `}</style>
    </section>
  );
};

const VisualElement = ({ type }) => {
  if (type === 'network') {
    return (
      <svg width="240" height="100" viewBox="0 0 240 100">
        {[...Array(8)].map((_, i) => (
          <motion.circle
            key={i}
            cx={40 + i * 22 + (Math.sin(i) * 15)}
            cy={30 + (Math.cos(i) * 20) + 20}
            r="1.5"
            fill="#2dd4bf"
            animate={{ 
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.4, 1]
            }}
            transition={{ 
              duration: 4 + i % 3,
              repeat: Infinity,
              delay: i * 0.4
            }}
          />
        ))}
        <motion.path
          d="M40 30 Q 120 10, 200 60"
          stroke="#2dd4bf"
          strokeWidth="0.5"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.25 }}
          transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.path
          d="M30 70 Q 100 80, 210 20"
          stroke="#2dd4bf"
          strokeWidth="0.5"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.15 }}
          transition={{ duration: 7, repeat: Infinity, repeatType: "reverse", delay: 1 }}
        />
      </svg>
    );
  }

  if (type === 'convergence') {
    return (
      <svg width="240" height="100" viewBox="0 0 240 100">
        <motion.g
          animate={{ 
            x: [0, 2, -2, 1, -1, 0],
            filter: ["blur(0px)", "blur(1.2px)", "blur(0.5px)", "blur(1px)", "blur(0px)"]
          }}
          transition={{ 
            duration: 0.8, 
            repeat: Infinity, 
            repeatDelay: 2.5,
            ease: "easeInOut"
          }}
        >
          <motion.line
            x1="30" y1="45" x2="210" y2="45"
            stroke="#0a192f" strokeWidth="1.5"
            animate={{ 
              x1: [30, 105, 30], 
              x2: [210, 135, 210],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.line
            x1="30" y1="55" x2="210" y2="55"
            stroke="#0a192f" strokeWidth="1.5"
            animate={{ 
              x1: [30, 112, 30], 
              x2: [210, 128, 210],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.2, ease: "easeInOut" }}
          />
          {/* Subtle fragmentation particles at midpoint */}
          <motion.circle 
            cx="120" cy="50" r="1.5" fill="#2dd4bf"
            animate={{ 
              opacity: [0, 0.8, 0],
              scale: [0, 1.5, 0],
              x: [0, 15, -15, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
        </motion.g>
      </svg>
    );
  }

  if (type === 'imbalance') {
    return (
      <svg width="240" height="100" viewBox="0 0 240 100">
        <motion.line
          x1="50" y1="50" x2="190" y2="50"
          stroke="#0a192f"
          animate={{ strokeWidth: [1, 5, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.line
          x1="50" y1="38" x2="190" y2="38"
          stroke="#94a3b8"
          strokeWidth="0.5"
          animate={{ x: [-8, 8, -8] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.line
          x1="50" y1="62" x2="190" y2="62"
          stroke="#94a3b8"
          strokeWidth="0.5"
          animate={{ x: [8, -8, 8] }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    );
  }

  if (type === 'drift') {
    return (
      <svg width="240" height="100" viewBox="0 0 240 100">
        <motion.line
          x1="30" y1="45" x2="210" y2="45"
          stroke="#0a192f" strokeWidth="1.5"
          animate={{ x: [-12, 12, -12] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        <motion.line
          x1="30" y1="55" x2="210" y2="55"
          stroke="#2dd4bf" strokeWidth="1"
          animate={{ 
            x: [-40, 0, -40],
            opacity: [0.3, 0.9, 0.3],
            y: [55, 60, 55],
            skewX: [0, 5, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    );
  }

  return null;
};

export default HomeObservedSystems;
