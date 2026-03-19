import React from 'react';

const HomeSignalStrip = () => {
  const data = [
    { value: '20,000+', label: 'SIMULATIONS ANALYZED' },
    { value: '68%', label: 'SHOW ALIGNMENT BREAKDOWN UNDER PRESSURE' },
    { value: '#1 friction', label: 'RESOURCE CALIBRATION' },
    { value: 'High gap', label: 'DECISION VS EXECUTION' }
  ];

  return (
    <div className="signal-strip-container">
      <div className="strip-eyebrow">Observed across leadership simulations</div>
      <div className="signal-strip">
        {data.map((item, index) => (
          <div key={index} className="signal-item">
            <div className="signal-value">{item.value}</div>
            <div className="signal-label">{item.label}</div>
          </div>
        ))}
      </div>
      <div className="strip-footer">
        These patterns consistently emerge when leadership systems are placed under pressure.
      </div>

      <style jsx>{`
        .signal-strip-container {
          width: 100%;
          margin-top: 40px;
          text-align: left;
        }
        .strip-eyebrow {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 6px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .signal-strip {
          background: #f1f5f9;
          border-radius: 12px;
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 32px;
        }
        .signal-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }
        .signal-value {
          font-size: 22px;
          font-weight: 700;
          color: #14b8a6;
          line-height: 1.1;
        }
        .signal-label {
          font-size: 10px;
          text-transform: uppercase;
          color: #94a3b8;
          font-weight: 700;
          letter-spacing: 0.05em;
          line-height: 1.2;
        }
        .strip-footer {
          margin-top: 12px;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          text-align: center;
        }

        @media (max-width: 992px) {
          .signal-strip {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }
        @media (max-width: 640px) {
          .signal-strip {
            grid-template-columns: 1fr;
          }
          .strip-footer {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};

export default HomeSignalStrip;
