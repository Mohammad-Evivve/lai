import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Signal, Layers, Target, 
  Zap, Globe, Activity, Microscope,
  Brain, Shield, ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import RelatedPathwaysSection from '../components/RelatedPathwaysSection';

const pageMeta = {
  id: "home",
  category: "home",
  dimension: null,
  related: ["/manifesto", "/gap", "/framework", "/observatory"]
};

const HomePage = () => {
  return (
    <div className="homepage">
      {/* ── HERO SECTION ──────────────────────────────────────────────────────── */}
      <section className="hero bg-navy text-white">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero-content text-center"
          >
            <span className="eyebrow text-teal">The Global Observatory</span>
            <h1 className="text-white">Leadership Adaptiveness Institute</h1>
            <p className="hero-lead">The institutional standard for measuring how leadership systems respond to disruption.</p>
            <div className="hero-ctas">
              <Link to="/diagnostic" className="btn-institutional primary">Measure Your Leadership System</Link>
              <Link to="/observatory" className="btn-institutional outline white">How the Observatory Works</Link>
            </div>
            <div className="hero-tertiary">
              <Link to="/manifesto" className="text-link text-slate-400 hover:text-white transition-colors">Read the Manifesto</Link>
            </div>
          </motion.div>
          
          <div className="scroll-indicator">
             <ChevronDown className="animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── SECTION 1: DISRUPTION (The Context) ────────────────────────────────── */}
      <section className="disruption-section py-20">
        <div className="container narrow text-center">
          <h2 className="section-h2">The Age of Institutional Disruption</h2>
          <p className="large-p">We are living through a period where the rate of environmental change consistently exceeds the rate of internal organizational adaptation. This is not a strategic failure; it is an adaptiveness failure.</p>
        </div>
      </section>

      {/* ── SECTION 2: THE GAP (The Observation) ───────────────────────────────── */}
      <section className="gap-section bg-light py-20 border-y border-slate-200">
        <div className="container grid-2 items-center">
          <div>
            <span className="eyebrow">Core Insight</span>
            <h2 className="section-h2">The Adaptiveness Gap</h2>
            <p className="body-p mb-6">Most organizations believe they are adaptive. Our research shows a persistent delta between <strong>Perceived Adaptiveness</strong> and <strong>Behavioral Reality</strong>.</p>
            <div className="gap-bullets">
               <div className="gap-bullet">
                  <Shield size={20} className="text-teal" />
                  <span>Perception bias masks underlying complexity.</span>
               </div>
               <div className="gap-bullet">
                  <Activity size={20} className="text-teal" />
                  <span>Operation inertia slows resource redirection.</span>
               </div>
            </div>
            <Link to="/gap" className="inline-flex items-center gap-2 font-bold text-navy mt-8 hover:text-teal transition-colors">
               Explore the Gap Research <ArrowRight size={18} />
            </Link>
          </div>
          <div className="visual-box">
             <div className="gap-visual-mock">
                <div className="v-bar perceived">Perceived</div>
                <div className="v-bar behavioral">Behavioral</div>
                <div className="v-gap-indicator">THE GAP</div>
             </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: THE FRAMEWORK (The Approach) ───────────────────────────── */}
      <section className="framework-section py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-h2">The Five Dimensions of Adaptiveness</h2>
            <p className="large-p max-w-3xl mx-auto">The LAI Framework maps leadership behavior across the five stages where adaptiveness occurs.</p>
          </div>
          
          <div className="home-framework-grid">
            {[
              { id: '01', title: 'Signal Detection', icon: <Signal /> },
              { id: '02', title: 'Cognitive Framing', icon: <Brain /> },
              { id: '03', title: 'Decision Alignment', icon: <Target /> },
              { id: '04', title: 'Resource Calibration', icon: <Layers /> },
              { id: '05', title: 'Integrated Responsiveness', icon: <Zap /> }
            ].map(dim => (
              <div key={dim.id} className="home-f-card">
                 <div className="h-f-icon">{dim.icon}</div>
                 <span className="h-f-id">{dim.id}</span>
                 <h3>{dim.title}</h3>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
             <Link to="/framework" className="btn-institutional">View the Full Framework</Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: OBSERVATORY & GLOBAL INDEX (Real-time Signals) ────────────────── */}
      <section className="observatory-section bg-navy text-white py-24 overflow-hidden">
        <div className="container grid-2 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}>
            <span className="eyebrow text-teal">The Observatory</span>
            <h2 className="section-h2 text-white">Global Adaptiveness Index</h2>
            <p className="text-slate-400 mb-8">Our environmental intelligence engine ingests real-time signals from markets, technology shifts, and regulatory changes to measure organizational response speed.</p>
            
            <div className="glai-stats mb-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glai-stat" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Activity className="text-teal" />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem' }}>+12%</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Global Adaptiveness YOY</p>
                </div>
              </div>
            </div>

            <Link to="/global-index" className="btn-institutional primary">View Global Map</Link>
          </motion.div>

          <div className="observatory-visual">
            {/* Hierarchy of Truth Legend */}
            <div className="intelligence-legend">
              <h4 className="legend-title">Hierarchy of Truth</h4>
              <div className="legend-items">
                <div className="legend-item">
                  <div className="legend-tier tier-0">Tier 0</div>
                  <div>
                    <strong>Sovereign</strong>
                    <p>Proprietary Research & Expert Overrides (1.2x)</p>
                  </div>
                </div>
                <div className="legend-item">
                  <div className="legend-tier tier-1">Tier 1</div>
                  <div>
                    <strong>Observed</strong>
                    <p>Behavioral Simulation Telemetry (1.0x)</p>
                  </div>
                </div>
                <div className="legend-item">
                  <div className="legend-tier tier-2">Tier 2</div>
                  <div>
                    <strong>Perceived</strong>
                    <p>Internal Diagnostic & Sentiment Surveys (0.8x)</p>
                  </div>
                </div>
                <div className="legend-item">
                  <div className="legend-tier tier-3">Tier 3</div>
                  <div>
                    <strong>Inferred</strong>
                    <p>External Market Intelligence & Digital Signals (0.4x)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: THE INDEX (Result/Benchmarking) ────────────────────────── */}
      <section className="index-section py-20 bg-light">
        <div className="container text-center">
          <h2 className="section-h2">The Global Adaptiveness Index</h2>
          <p className="large-p max-w-2xl mx-auto mb-12">Establishing transparency in leadership behavior through a global dataset of benchmarked organizations.</p>
          
          <div className="index-preview-box">
             <div className="index-meta-header">
                <div className="completeness-indicator">
                   <div className="c-dot"></div>
                   <span>Emphasis: Data Completeness</span>
                </div>
                <div className="index-search-mock">Search Organizations...</div>
             </div>
             <div className="index-table-mock">
                {[1, 2, 3].map(i => (
                  <div key={i} className="table-row-mock">
                     <div className="row-entity">Entity {i}</div>
                     <div className="row-meter">
                        <div className="meter-bg"><div className="meter-fill" style={{ width: i === 1 ? '80%' : i === 2 ? '45%' : '20%' }}></div></div>
                     </div>
                     <div className="row-status">Status {i}</div>
                  </div>
                ))}
             </div>
          </div>
          
          <div className="mt-12">
             <Link to="/global-index" className="btn-institutional primary">Explore the Full Index</Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: PARTICIPATION (The Flywheel) ───────────────────────────── */}
      <section className="participation-section py-24 bg-teal text-navy">
        <div className="container narrow text-center">
          <Microscope size={48} className="mb-6 mx-auto" />
          <h2 className="section-h2 text-navy">Participate in the Research Flywheel</h2>
          <p className="large-p text-navy opacity-80 mb-10">We invite institutions and leaders to benchmark their adaptiveness and contribute their behavioral data to the global dataset.</p>
          <div className="participation-ctas">
             <Link to="/benchmark" className="btn-institutional bg-navy text-white">Institutional Benchmarking</Link>
             <Link to="/library" className="btn-institutional outline border-navy text-navy ml-4">Research Library</Link>
          </div>
        </div>
      </section>

      <RelatedPathwaysSection 
        relatedPaths={pageMeta.related}
        eyebrow="Navigation"
        title="Further Pathways"
      />

      <style jsx>{`
        .homepage { background: white; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
        .narrow { max-width: 800px; margin: 0 auto; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; }
        .py-20 { padding: 8rem 0; }
        .py-24 { padding: 10rem 0; }
        .bg-navy { background: #0a192f; }
        .bg-light { background: #f8fafc; }
        .bg-teal { background: #2dd4bf; }
        .text-white { color: white; }
        .text-teal { color: #2dd4bf; }
        .text-navy { color: #0a192f; }

        .eyebrow { display: block; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1rem; }
        .section-h2 { font-size: 2.75rem; font-weight: 800; color: #0a192f; margin-bottom: 1.5rem; }
        .section-h2.text-white { color: white; }
        .large-p { font-size: 1.35rem; line-height: 1.7; color: #475569; }
        .body-p { font-size: 1.15rem; line-height: 1.7; color: #475569; }

        /* Hero */
        .hero { min-height: 90vh; display: flex; align-items: center; justify-content: center; position: relative; }
        .hero h1 { font-size: 4.5rem; margin-bottom: 1.5rem; }
        .hero-lead { font-size: 1.5rem; color: #94a3b8; max-width: 600px; margin: 0 auto 3rem; }
        .hero-ctas { display: flex; gap: 1.5rem; justify-content: center; }
        .hero-tertiary { margin-top: 1.5rem; }
        .text-link { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; text-decoration: none; display: inline-block; }
        .scroll-indicator { position: absolute; bottom: 3rem; left: 50%; transform: translateX(-50%); color: #475569; }

        /* Gap Section */
        .gap-bullets { display: flex; flex-direction: column; gap: 1rem; }
        .gap-bullet { display: flex; align-items: center; gap: 1rem; font-weight: 600; color: #334155; }
        .gap-visual-mock { height: 300px; background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 2.5rem; display: flex; align-items: flex-end; gap: 2rem; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
        .v-bar { flex: 1; border-radius: 8px 8px 0 0; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; writing-mode: vertical-rl; rotate: 180deg; color: white; }
        .v-bar.perceived { height: 90%; background: #0a192f; }
        .v-bar.behavioral { height: 40%; background: #0d9488; }
        .v-gap-indicator { position: absolute; top: 40%; right: 2rem; border-right: 2px dashed #ef4444; border-top: 2px dashed #ef4444; border-bottom: 2px dashed #ef4444; padding: 1rem; color: #ef4444; font-weight: 900; font-size: 0.7rem; }

        /* Framework Section */
        .home-framework-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.5rem; margin-top: 4rem; }
        .home-f-card { background: white; border: 1px solid #e2e8f0; padding: 2rem; border-radius: 16px; text-align: center; position: relative; transition: all 0.2s; }
        .home-f-card:hover { border-color: #0d9488; transform: translateY(-3px); }
        .h-f-icon { color: #0d9488; margin-bottom: 1.5rem; display: flex; justify-content: center; }
        .h-f-id { position: absolute; top: 1rem; right: 1rem; font-size: 0.8rem; font-weight: 800; color: #cbd5e1; font-family: 'Inter', monospace; }
        .home-f-card h3 { font-size: 1rem; font-weight: 800; color: #0a192f; }

        /* Observatory Section */
        .observatory-visual { position: relative; display: flex; align-items: center; justify-content: center; }
        
        /* Index Section */
        .index-preview-box { background: white; border: 1px solid #e2e8f0; border-radius: 24px; max-width: 900px; margin: 0 auto; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05); }
        .index-meta-header { padding: 1.5rem 2rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .completeness-indicator { display: flex; align-items: center; gap: 0.75rem; font-size: 0.75rem; font-weight: 700; color: #0d9488; }
        .c-dot { width: 8px; height: 8px; background: #0d9488; border-radius: 50%; }
        .index-search-mock { font-size: 0.85rem; color: #94a3b8; border: 1px solid #e2e8f0; padding: 0.5rem 1.5rem; border-radius: 99px; background: white; }
        .index-table-mock { padding: 1rem; }
        .table-row-mock { display: flex; align-items: center; gap: 2rem; padding: 1.25rem 1rem; border-bottom: 1px solid #f1f5f9; }
        .row-entity { flex: 1; text-align: left; font-weight: 600; font-size: 0.95rem; }
        .row-meter { flex: 2; }
        .meter-bg { height: 8px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
        .meter-fill { height: 100%; background: #0d9488; }
        .row-status { flex: 1; text-align: right; font-size: 0.75rem; font-weight: 800; color: #64748b; }

        /* Participation Section */
        .participation-ctas { display: flex; justify-content: center; gap: 1rem; }

        /* Buttons */
        .btn-institutional:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

        .intelligence-legend { 
          background: white; padding: 2rem; border-radius: 12px; 
          border: 1px solid var(--border-color); box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }
        .legend-title { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: var(--slate-light); margin-bottom: 1.5rem; }
        .legend-items { display: grid; gap: 1.25rem; }
        .legend-item { display: flex; gap: 1rem; align-items: flex-start; }
        .legend-tier { 
          font-size: 0.6rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 4px; 
          color: white; text-transform: uppercase; min-width: 48px; text-align: center; margin-top: 0.2rem;
        }
        .tier-0 { background: #0f172a; }
        .tier-1 { background: #3b82f6; }
        .tier-2 { background: #0d9488; }
        .tier-3 { background: #64748b; }
        .legend-item strong { display: block; font-size: 0.9rem; color: var(--navy); }
        .legend-item p { font-size: 0.75rem; color: var(--text-muted); margin: 0; }

        @media (max-width: 992px) {
          .hero h1 { font-size: 3rem; }
          .grid-2 { grid-template-columns: 1fr; }
          .home-framework-grid { grid-template-columns: repeat(2, 1fr); }
          .home-framework-grid > *:last-child { grid-column: span 2; }
          .participation-ctas { flex-direction: column; gap: 1rem; }
          .participation-ctas .ml-4 { margin-left: 0; }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
