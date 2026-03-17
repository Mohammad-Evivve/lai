import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Mail, Globe, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="persistent-cta">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h3>Measure Your Leadership System</h3>
              <p>Understand how your leadership team detects signals, aligns decisions, and responds when reality changes.</p>
            </div>
            <Link to="/diagnostic" className="btn-cta-footer">Take the Leadership Adaptiveness Diagnostic <ArrowRight size={18} /></Link>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="footer-top grid-12">
          <div className="footer-brand">
            <Link to="/" className="f-logo">LAI</Link>
            <p>The Leadership Adaptiveness Institute is a global research body dedicated to establishing standards for leadership behavior in complex environments.</p>
            <div className="social-links">
              <a href="#"><Linkedin size={20} /></a>
              <a href="#"><Twitter size={20} /></a>
              <a href="#"><Mail size={20} /></a>
            </div>
          </div>
          
          <div className="footer-links">
            <h4>Institute</h4>
            <ul>
              <li><Link to="/about">About the Institute</Link></li>
              <li><Link to="/council">Advisory / Research Council</Link></li>
              <li><Link to="/library">Research Library</Link></li>
              <li><Link to="/aferr">AFERR Research Program</Link></li>
              <li><Link to="/simulation">Simulation-Based Measurement</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Participation</h4>
            <ul>
              <li><Link to="/diagnostic">Leadership Diagnostic</Link></li>
              <li><Link to="/benchmark">Benchmark Your Organization</Link></li>
              <li><Link to="/journey">Measurement Journey</Link></li>
              <li><a href="#">Contact / Collaborate</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Data Ethics</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2026 Leadership Adaptiveness Institute. All rights reserved.</p>
          <div className="footer-meta">
            <span><Globe size={14} /> Global Secretariat: Geneva / New York</span>
            <span style={{ marginLeft: '1.5rem', fontFamily: 'monospace', fontSize: '0.72rem', color: '#94a3b8' }}>LAI v1.2.0-FINAL</span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .footer {
          background: #f8fafc;
          padding: 0;
          border-top: 1px solid var(--border-color);
          color: var(--navy);
        }

        .persistent-cta {
          background: #0a192f;
          padding: 4rem 0;
          color: white;
        }

        .cta-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .cta-text h3 {
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          color: white;
        }

        .cta-text p {
          color: #94a3b8;
          font-size: 1.1rem;
          max-width: 600px;
        }

        .btn-cta-footer {
          background: #2dd4bf;
          color: #0a192f;
          padding: 1rem 2rem;
          border-radius: 4px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .btn-cta-footer:hover {
          background: #14b8a6;
          transform: translateY(-2px);
        }

        .footer-top {
          padding: 6rem 0 4rem;
        }

        .footer-brand { grid-column: span 4; }
        .footer-links { grid-column: span 2; }

        .f-logo {
          font-family: var(--font-serif);
          font-size: 2rem;
          font-weight: 700;
          color: var(--navy);
          margin-bottom: 1.5rem;
          display: block;
        }

        .footer-brand p {
          color: var(--text-muted);
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          max-width: 300px;
        }

        .social-links { display: flex; gap: 1.25rem; color: var(--slate); }
        .social-links a:hover { color: var(--teal); }

        .footer-links h4 {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 2rem;
          color: var(--slate-light);
        }

        .footer-links ul { display: flex; flex-direction: column; gap: 1rem; }
        .footer-links a {
          color: var(--navy);
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        .footer-links a:hover { color: var(--teal); }

        .footer-bottom {
          margin-top: 5rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          color: var(--slate-light);
        }

        .footer-meta { display: flex; align-items: center; gap: 0.5rem; }

        @media (max-width: 992px) {
          .footer-brand, .footer-links { grid-column: span 6; margin-bottom: 3rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}} />
    </footer>
  );
};

export default Footer;
