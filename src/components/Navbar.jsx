import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Manifesto', path: '/manifesto' },
    { name: 'Framework', path: '/framework' },
    { name: 'Observatory', path: '/observatory' },
    { name: 'Research', path: '/research' },
    { name: 'Benchmark', path: '/benchmark' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-content">
        <Link to="/" className="logo">
          LAI
          <span>Leadership Adaptiveness Institute</span>
        </Link>

        <div className="desktop-menu">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/diagnostic" className="btn-cta">
            Take Diagnostic <ArrowRight size={16} />
          </Link>
        </div>

        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            to={link.path} 
            onClick={() => setIsOpen(false)}
            className="mobile-nav-link"
          >
            {link.name}
          </Link>
        ))}
        <Link to="/diagnostic" onClick={() => setIsOpen(false)} className="mobile-btn-cta">
          Take Diagnostic
        </Link>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          padding: 1.5rem 0;
          transition: all 0.3s ease;
          background: transparent;
        }

        .navbar.scrolled {
          background: rgba(255, 255, 255, 0.95);
          padding: 1rem 0;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          backdrop-filter: blur(10px);
        }

        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-family: var(--font-serif);
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--navy);
          display: flex;
          flex-direction: column;
          line-height: 1;
        }

        .logo span {
          font-family: var(--font-sans);
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-top: 2px;
          color: var(--slate);
        }

        .desktop-menu {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-link {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-muted);
          position: relative;
        }

        .nav-link:hover, .nav-link.active {
          color: var(--navy);
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--teal);
        }

        .btn-cta {
          background: var(--navy);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .btn-cta:hover {
          background: var(--teal);
          transform: translateY(-2px);
        }

        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--navy);
          cursor: pointer;
        }

        @media (max-width: 992px) {
          .navbar { padding: 1rem 0; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); }
          .desktop-menu { display: none; }
          .mobile-toggle { display: block; }
          .logo { font-size: 1.4rem; }
          .logo span { font-size: 0.5rem; letter-spacing: 1px; }
        }

        .mobile-menu {
          position: fixed;
          top: 0;
          right: -100%;
          width: 80%;
          height: 100vh;
          background: white;
          z-index: 999;
          display: flex;
          flex-direction: column;
          padding: 6rem 2rem;
          gap: 2rem;
          transition: all 0.4s ease;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
        }

        .mobile-menu.open {
          right: 0;
        }

        .mobile-nav-link {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--navy);
        }

        .mobile-btn-cta {
          margin-top: 2rem;
          background: var(--navy);
          color: white;
          padding: 1rem;
          text-align: center;
          border-radius: 4px;
          font-weight: 600;
        }
      `}} />
    </nav>
  );
};

export default Navbar;
