import React from 'react';
import { Link } from 'react-router-dom';
import RelatedPathwaysSection from '../components/RelatedPathwaysSection';
import HomeHeroInstitutional from '../components/HomeHeroInstitutional';
import HomeProblemStatement from '../components/HomeProblemStatement';
import HomeObservedSystems from '../components/HomeObservedSystems';
import HomePatterns from '../components/HomePatterns';
import HomeObservatoryLogic from '../components/HomeObservatoryLogic';
import HomeFinalCTA from '../components/HomeFinalCTA';

const pageMeta = {
  id: "home",
  category: "home",
  dimension: null,
  related: ["/manifesto", "/gap", "/framework", "/observatory"]
};

const HomePage = () => {
  return (
    <div className="homepage font-sans">
      <HomeHeroInstitutional />
      <HomeProblemStatement />
      <HomeObservedSystems />
      <HomePatterns />
      <HomeObservatoryLogic />

      {/* ── SECTION 6: OBSERVATORY / RESEARCH (Institutional Depth) ─────────── */}
      <section className="research-depth-section py-24 bg-white border-y border-slate-100">
        <div className="container">
          <div className="editorial-header mb-16">
            <span className="eyebrow-label text-teal">From the Global Observatory</span>
            <h2 className="section-headline text-navy">Global Adaptiveness Index</h2>
            <p className="large-p text-slate-500 max-w-2xl">
              Establishing transparency in leadership behavior through a global dataset 
              of benchmarked organizations.
            </p>
          </div>

          <div className="research-grid">
            <div className="featured-observatory">
              <div className="observatory-meta">
                <div className="intelligence-legend compact">
                  <h4 className="legend-title">Hierarchy of Truth</h4>
                  <div className="legend-items">
                    <div className="legend-item">
                      <div className="legend-tier tier-0">Tier 0</div>
                      <div><strong>Sovereign</strong> (1.2x)</div>
                    </div>
                    <div className="legend-item">
                      <div className="legend-tier tier-1">Tier 1</div>
                      <div><strong>Observed</strong> (1.0x)</div>
                    </div>
                    <div className="legend-item">
                      <div className="legend-tier tier-2">Tier 2</div>
                      <div><strong>Perceived</strong> (0.8x)</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="observatory-cta mt-12">
                <Link to="/global-index" className="btn-institutional-custom">Explore the Full Index</Link>
              </div>
            </div>

            <div className="research-links">
               <div className="research-link-card">
                  <span className="r-label">Recent Publication</span>
                  <h3>The 2024 Alignment Paradox</h3>
                  <Link to="/library" className="r-button">Read Research</Link>
               </div>
               <div className="research-link-card">
                  <span className="r-label">Institutional Benchmarking</span>
                  <h3>Join the Research Flywheel</h3>
                  <Link to="/benchmark" className="r-button">View Parameters</Link>
               </div>
            </div>
          </div>
        </div>
      </section>

      <HomeFinalCTA />

      <RelatedPathwaysSection 
        relatedPaths={pageMeta.related}
        eyebrow="Navigation"
        title="Further Pathways"
      />

      <style jsx>{`
        .homepage { background: white; width: 100%; }
        .container { max-width: 1400px; margin: 0 auto; padding: 0 40px; }
        .eyebrow-label { 
          display: block; font-size: 13px; font-weight: 700; 
          text-transform: uppercase; letter-spacing: 0.25em; 
          margin-bottom: 20px; 
        }
        .section-headline { 
          font-family: var(--font-serif); font-size: 56px; 
          font-weight: 500; margin-bottom: 24px; color: #0a192f;
          letter-spacing: -0.02em;
        }
        .large-p { font-size: 20px; line-height: 1.6; color: #64748b; }
        
        .research-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .featured-observatory {
          background: #f8fafc;
          padding: 80px;
          border-radius: 4px;
          border: 1px solid #f1f5f9;
        }
        .research-links {
          display: flex;
          flex-direction: column;
          gap: 48px;
        }
        .research-link-card {
           border-bottom: 1px solid #f1f5f9;
           padding-bottom: 40px;
        }
        .r-label {
           font-family: var(--font-mono); font-size: 10px;
           color: #94a3b8; text-transform: uppercase;
           margin-bottom: 12px; display: block;
           letter-spacing: 0.1em;
        }
        .research-link-card h3 {
           font-family: var(--font-serif); font-size: 28px;
           color: #0a192f; margin-bottom: 24px;
           font-weight: 500;
        }
        .r-button {
           font-size: 12px; font-weight: 700;
           text-transform: uppercase; color: #2dd4bf;
           text-decoration: none; letter-spacing: 0.15em;
        }

        .btn-institutional-custom {
           display: inline-block;
           padding: 1rem 2.5rem;
           background: #2dd4bf;
           color: #0a192f;
           font-weight: 700;
           text-transform: uppercase;
           letter-spacing: 0.1em;
           font-size: 13px;
           border-radius: 4px;
           text-decoration: none;
           transition: all 0.3s ease;
        }
        .btn-institutional-custom:hover {
           background: #14b8a6;
           transform: translateY(-2px);
        }

        .intelligence-legend.compact .legend-items { display: flex; flex-direction: column; gap: 16px; }
        .legend-item { display: flex; gap: 16px; align-items: center; font-size: 14px; color: #475569; }
        .legend-tier { padding: 4px 10px; border-radius: 2px; color: white; font-weight: 700; font-size: 10px; min-width: 50px; text-align: center; }
        .tier-0 { background: #0f172a; }
        .tier-1 { background: #3b82f6; }
        .tier-2 { background: #0d9488; }

        @media (max-width: 1024px) {
          .research-grid { grid-template-columns: 1fr; }
          .featured-observatory { padding: 60px 20px; }
          .section-headline { font-size: 44px; }
        }
        @media (max-width: 640px) {
          .section-headline { font-size: 36px; }
          .research-depth-section { padding: 80px 0; }
          .container { padding: 0 20px; }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
