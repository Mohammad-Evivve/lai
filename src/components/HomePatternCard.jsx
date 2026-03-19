import React from 'react';

const HomePatternCard = ({ title, body, consequence }) => {
  return (
    <div className="pattern-card">
      <span className="pattern-label">OBSERVED PATTERN</span>
      <h3 className="pattern-title">{title}</h3>
      <p className="pattern-body">{body}</p>
      <div className="pattern-consequence">
        <span className="consequence-label">SYSTEMIC CONSEQUENCE:</span>
        <span className="consequence-text">{consequence}</span>
      </div>
      
      <style jsx>{`
        .pattern-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-left: 3px solid #14b8a6;
          border-radius: 8px;
          padding: 24px;
          text-align: left;
          width: 100%;
          transition: all 0.2s ease;
        }
        .pattern-card:hover {
          border-color: #cbd5e1;
          border-left-width: 4px;
          transform: translateX(2px);
        }
        .pattern-label {
          display: block;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 12px;
          letter-spacing: 0.1em;
        }
        .pattern-title {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 12px 0;
          text-transform: uppercase;
          letter-spacing: -0.01em;
        }
        .pattern-body {
          font-size: 15px;
          line-height: 1.6;
          color: #334155;
          margin: 0 0 20px 0;
          font-weight: 500;
        }
        .pattern-consequence {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }
        .consequence-label {
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .consequence-text {
          font-size: 14px;
          color: #0f172a;
          font-weight: 600;
          line-height: 1.4;
        }

        @media (max-width: 640px) {
          .pattern-card { padding: 20px; }
          .pattern-title { font-size: 16px; }
          .pattern-body { font-size: 14px; }
        }
      `}</style>
    </div>
  );
};

export default HomePatternCard;
