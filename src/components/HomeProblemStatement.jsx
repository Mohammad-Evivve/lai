import React from 'react';
import { motion } from 'framer-motion';

const HomeProblemStatement = () => {
  return (
    <section className="problem-statement-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="problem-content"
        >
          <h2 className="statement-headline">
            Strategy does not fail in the planning.<br />It fails in the behavior.
          </h2>
          <p className="statement-body">
            The gap between <strong>institutional intent</strong> and <strong>observed behavior</strong> is where adaptiveness breaks down. The Institute measures this delta through high-fidelity simulation.
          </p>
          <div className="statement-divider"></div>
        </motion.div>
      </div>

      <style jsx>{`
        .problem-statement-section {
          padding: 180px 0;
          background: #ffffff;
          width: 100%;
          text-align: center;
        }
        .problem-content {
          max-width: 860px;
          margin: 0 auto;
        }
        .statement-headline {
          font-family: var(--font-serif);
          font-size: 52px;
          font-weight: 500;
          color: #0a192f;
          line-height: 1.25;
          margin-bottom: 40px;
          letter-spacing: -0.02em;
        }
        .statement-body {
          font-family: var(--font-sans);
          font-size: 19px;
          color: #64748b;
          line-height: 1.8;
          max-width: 640px;
          margin: 0 auto 48px;
        }
        .statement-divider {
          width: 60px;
          height: 1px;
          background: #f1f5f9;
          margin: 0 auto;
        }

        @media (max-width: 1024px) {
          .statement-headline { font-size: 40px; }
          .problem-statement-section { padding: 120px 0; }
        }
        @media (max-width: 640px) {
          .statement-headline { font-size: 32px; }
          .statement-body { font-size: 17px; }
          .problem-statement-section { padding: 100px 20px; }
        }
      `}</style>
    </section>
  );
};

export default HomeProblemStatement;
