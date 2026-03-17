import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Target, Shield, Globe, 
  ArrowRight, Activity, TrendingUp, Layers,
  Compass, CheckCircle, FlaskConical
} from 'lucide-react';
import { Link } from 'react-router-dom';
import RelatedPathwaysSection from '../components/RelatedPathwaysSection';

const pageMeta = {
  id: "benchmark",
  category: "participation",
  dimension: null,
  related: ["/global-index", "/diagnostic", "/how-measured", "/observatory"]
};

const BenchmarkPage = () => {
  return (
    <div className="benchmark-page">
      {/* ── HERO SECTION ──────────────────────────────────────────────────────── */}
      <header className="page-header bg-navy text-white">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="eyebrow text-teal">Institutional Comparison</span>
            <h1 className="text-white">Benchmark Your Organization</h1>
            <p className="hero-lead">Move beyond internal metrics to understand how your leadership system performs against global adaptiveness standards.</p>
          </motion.div>
        </div>
      </header>

      {/* ── THE COMPARATIVE VALUE ─────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container grid-2 items-center">
          <div>
            <h2 className="section-h2">The Strategic Value of Benchmarking</h2>
            <p className="large-p mb-6">Internal performance metrics often mask structural decision lag. Benchmarking provides the external context necessary to calibrate leadership response speeds.</p>
            
            <div className="benefit-list">
               <div className="benefit-item">
                  <Target className="text-teal" size={24} />
                  <div>
                     <h4>Eliminate Strategic Dissonance</h4>
                     <p>Identify the delta between leadership's perceived adaptiveness and observable behavioral reality.</p>
                  </div>
               </div>
               <div className="benefit-item">
                  <Globe className="text-teal" size={24} />
                  <div>
                     <h4>Global Context</h4>
                     <span>Compare your response velocity against 600+ benchmarked institutions across 12 sectors.</span>
                  </div>
               </div>
               <div className="benefit-item">
                  <Activity className="text-teal" size={24} />
                  <div>
                     <h4>Evidence Calibration</h4>
                     <span>Understand how your organization's data completeness compares to the highest institutional standards.</span>
                  </div>
               </div>
            </div>
          </div>
          <div className="visual-container">
             <div className="benchmark-comparison-mock">
                <div className="comp-item">
                   <div className="comp-label">Group Benchmark</div>
                   <div className="comp-bar-track">
                      <div className="comp-bar-fill benchmark-avg" style={{ width: '65%' }}></div>
                   </div>
                   <div className="comp-val">65.2</div>
                </div>
                <div className="comp-item organization">
                   <div className="comp-label">Your Organization (Est)</div>
                   <div className="comp-bar-track">
                      <div className="comp-bar-fill org-val" style={{ width: '42%' }}></div>
                   </div>
                   <div className="comp-val">42.8</div>
                </div>
                <div className="comp-delta text-rose-500">-22.4 GAP</div>
             </div>
          </div>
        </div>
      </section>

      {/* ── THE BENCHMARKING JOURNEY ───────────────────────────────────────────── */}
      <section className="bg-light py-24 border-y border-slate-200">
        <div className="container">
          <div className="text-center mb-16">
             <h2 className="section-h2">The Measurement Pathway</h2>
             <p className="body-p max-w-2xl mx-auto">Benchmarking is an iterative process of deepening institutional visibility and evidentiary depth.</p>
          </div>

          <div className="journey-grid">
             {[
               { 
                 step: '01', 
                 title: 'Environmental Audit', 
                 desc: 'Establish the baseline by ingesting external signals and contextual market data.',
                 icon: <Compass />
               },
               { 
                 step: '02', 
                 title: 'Professional Diagnostic', 
                 desc: 'Measure perceptual alignment across your leadership system via the LAI Diagnostic.',
                 icon: <CheckCircle2 />
               },
               { 
                 step: '03', 
                 title: 'Behavioral Simulation', 
                 desc: 'Observe ground-truth decision response within a high-fidelity AFERR environment.',
                 icon: <FlaskConical />
               },
               { 
                 step: '04', 
                 title: 'Triangulated Insight', 
                 desc: 'Synthesize all data streams into a definitive, high-confidence institutional benchmark.',
                 icon: <Layers />
               }
             ].map((j, idx) => (
               <div key={idx} className="journey-card">
                  <div className="j-step">{j.step}</div>
                  <div className="j-icon">{j.icon}</div>
                  <h3>{j.title}</h3>
                  <p>{j.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* ── CONVERT TO PARTICIPATION ─────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container narrow text-center">
           <TrendingUp size={48} className="text-teal mb-6 mx-auto" />
           <h2 className="section-h2">Begin Your Measurement Journey</h2>
           <p className="large-p mb-10">The first step to institutional benchmarking is establishing your perceptual baseline through the Leadership Adaptiveness Diagnostic.</p>
           <div className="cta-group">
              <Link to="/diagnostic" className="btn-institutional primary">Start the Professional Diagnostic</Link>
              <Link to="/how-measured" className="btn-institutional outline ml-4">View Measurement Methodology</Link>
           </div>
        </div>
      </section>

      <RelatedPathwaysSection 
        relatedPaths={pageMeta.related}
        eyebrow="Participation"
        title="Further Pathways"
      />

      <style jsx>{`
        .benchmark-page { background: white; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
        .narrow { max-width: 800px; margin: 0 auto; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6.25rem; }
        .py-20 { padding: 8rem 0; }
        .py-24 { padding: 10rem 0; }
        
        .page-header { padding: 12rem 0 8rem; text-align: center; }
        .bg-navy { background: #0a192f; }
        .bg-light { background: #f8fafc; }
        .text-navy { color: #0a192f; }
        .text-white { color: white; }
        .eyebrow { display: block; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 1.5rem; }
        .text-teal { color: #2dd4bf; }
        h1 { font-size: 3.75rem; font-weight: 800; margin-bottom: 1rem; letter-spacing: -0.02em; color: white; }
        .hero-lead { font-size: 1.6rem; color: #94a3b8; font-weight: 500; max-width: 700px; margin: 0 auto; line-height: 1.6; }

        .section-h2 { font-size: 2.75rem; font-weight: 800; color: #0a192f; margin-bottom: 2rem; }
        .large-p { font-size: 1.35rem; line-height: 1.7; color: #475569; }
        .body-p { font-size: 1.15rem; line-height: 1.7; color: #64748b; }

        .benefit-list { display: flex; flex-direction: column; gap: 2.5rem; margin-top: 3rem; }
        .benefit-item { display: flex; gap: 1.5rem; align-items: flex-start; }
        .benefit-item h4 { font-size: 1.2rem; font-weight: 800; color: #0a192f; margin-bottom: 0.5rem; }
        .benefit-item p, .benefit-item span { font-size: 1.05rem; color: #64748b; line-height: 1.6; display: block; }

        .benchmark-comparison-mock { background: white; padding: 3rem; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 40px 80px -15px rgba(0,0,0,0.08); }
        .comp-item { margin-bottom: 2rem; }
        .comp-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 0.75rem; }
        .comp-bar-track { height: 12px; background: #f1f5f9; border-radius: 6px; overflow: hidden; margin-bottom: 0.5rem; }
        .comp-bar-fill { height: 100%; border-radius: 6px; }
        .benchmark-avg { background: #cbd5e1; }
        .org-val { background: #f43f5e; }
        .comp-val { font-family: 'Inter', monospace; font-weight: 950; font-size: 1.5rem; color: #0a192f; }
        .organization .comp-val { color: #f43f5e; }
        .comp-delta { font-weight: 900; font-size: 0.75rem; letter-spacing: 1px; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; }

        .journey-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; }
        .journey-card { background: white; padding: 2.5rem; border-radius: 20px; border: 1px solid #e2e8f0; position: relative; transition: all 0.3s; }
        .journey-card:hover { transform: translateY(-5px); border-color: #0d9488; }
        .j-step { position: absolute; top: 1.5rem; right: 2rem; font-size: 0.75rem; font-weight: 900; color: #cbd5e1; font-family: 'Inter', monospace; }
        .j-icon { color: #0d9488; margin-bottom: 1.5rem; }
        .journey-card h3 { font-size: 1.1rem; font-weight: 800; color: #0a192f; margin-bottom: 1rem; }
        .journey-card p { font-size: 0.95rem; line-height: 1.6; color: #64748b; }

        .btn-institutional { 
          padding: 1.15rem 2.75rem; 
          border-radius: 12px; 
          font-weight: 800; 
          text-decoration: none; 
          transition: all 0.2s;
          display: inline-block;
          font-size: 1rem;
        }
        .btn-institutional.primary { background: #0a192f; color: white !important; }
        .btn-institutional.outline { border: 1px solid #cbd5e1; color: #0a192f; }
        .btn-institutional:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

        @media (max-width: 992px) {
          .grid-2 { grid-template-columns: 1fr; gap: 4rem; }
          .journey-grid { grid-template-columns: 1fr 1fr; }
          h1 { font-size: 2.75rem; }
        }
        @media (max-width: 640px) {
          .journey-grid { grid-template-columns: 1fr; }
          .cta-group { display: flex; flex-direction: column; gap: 1rem; }
          .cta-group .ml-4 { margin-left: 0; }
        }
      `}</style>
    </div>
  );
};

export default BenchmarkPage;
