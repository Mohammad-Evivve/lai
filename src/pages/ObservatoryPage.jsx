import React from 'react';
import { motion } from 'framer-motion';
import { 
  Signal, Shield, Target, Activity, 
  Search, Eye, Globe, ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import RelatedPathwaysSection from '../components/RelatedPathwaysSection';

const pageMeta = {
  id: "observatory",
  category: "observatory",
  dimension: null,
  related: ["/global-index", "/completeness", "/how-measured", "/signals"]
};

const ObservatoryPage = () => {
  return (
    <div className="observatory-page">
      {/* HERO SECTION */}
      <header className="page-header bg-navy text-white">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="eyebrow text-teal">Structured Observation</span>
            <h1 className="text-white">The Leadership Adaptiveness Observatory</h1>
            <p className="hero-lead">Integrating diverse evidence sources to measure organizational response to disruption.</p>
          </motion.div>
        </div>
      </header>

      {/* DEFINITION SECTION */}
      <section className="py-20">
        <div className="container narrow">
          <h2 className="section-h2">A Structured Observation Platform</h2>
          <p className="large-p">The Observatory is not a real-time monitoring dashboard or a tactical command center. It is an institutional research platform designed to capture and synthesize behavioral evidence from across the global leadership landscape.</p>
          <div className="bg-navy p-8 rounded-2xl text-white mb-8 border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="body-p text-slate-300 m-0">See the latest synthesis of this data in our flagship report.</p>
            <Link to="/research/reports/state-of-cognition" className="text-teal font-bold flex items-center gap-2 whitespace-nowrap">
              State of Cognition 2026 <ArrowRight size={16} />
            </Link>
          </div>
          <p className="body-p">By moving beyond static self-reporting, the Observatory provides a transparent view into how organizations actually behave when confronted with environmental shifts.</p>
        </div>
      </section>

      {/* INTEGRATION LAYERS */}
      <section className="bg-light py-20 border-y border-slate-200">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-h2">Integrated Evidence Streams</h2>
            <p className="body-p max-w-2xl mx-auto">High-fidelity adaptiveness measurement requires the synchronization of four distinct evidentiary layers.</p>
          </div>
          
          <div className="grid-24 gap-8">
            <div className="evidence-card">
              <Signal className="text-teal mb-4" />
              <h3>Environmental Signals</h3>
              <p>External triggers harvested from public filings, patent activity, and market volatility to establish the context for adaptation.</p>
            </div>
            <div className="evidence-card">
              <Shield className="text-teal mb-4" />
              <h3>Diagnostic Assessments</h3>
              <p>Structured self-assessments that measure professional alignment and perceived adaptiveness within leadership teams.</p>
            </div>
            <div className="evidence-card">
              <Activity className="text-teal mb-4" />
              <h3>Behavioral Observation</h3>
              <p>Direct telemetry captured during high-fidelity leadership simulations (e.g., Evivve), measuring active decision response speed.</p>
            </div>
            <div className="evidence-card">
              <Search className="text-teal mb-4" />
              <h3>Institutional Research</h3>
              <p>Direct ingestion of analyst-verified data and expert research to calibrate and weight incoming signals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* OBSERVABILITY VS PERFORMANCE */}
      <section className="py-24">
        <div className="container grid-2 items-center">
          <div>
            <h2 className="section-h2">Transparency in Leadership Behavior</h2>
            <p className="body-p mb-6">The primary goal of the Observatory is **observability**. We do not reward speed for speed's sake; we measure the coherence and precision of the leadership response.</p>
            <div className="feature-list">
              <div className="feature-item">
                <Eye size={20} className="text-teal" />
                <span>Visibility into structural decision lag.</span>
              </div>
              <div className="feature-item">
                <Target size={20} className="text-teal" />
                <span>Benchmarking against industry response baselines.</span>
              </div>
              <div className="feature-item">
                <Globe size={20} className="text-teal" />
                <span>Regional adaptiveness patterns across 45+ countries.</span>
              </div>
            </div>
          </div>
          <div className="visual-block text-center">
             <div className="observatory-orb">
                <div className="orb-inner"></div>
                <div className="orb-signals"></div>
             </div>
          </div>
        </div>
      </section>

      <RelatedPathwaysSection 
        relatedPaths={pageMeta.related}
        eyebrow="Observatory Layer"
        title="Further Pathways"
      />

      <style jsx>{`
        .observatory-page { background: white; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
        .narrow { max-width: 800px; margin: 0 auto; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; }
        .grid-24 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 2rem; }
        .py-20 { padding: 8rem 0; }
        .py-24 { padding: 10rem 0; }
        
        .page-header { padding: 12rem 0 8rem; text-align: center; }
        .bg-navy { background: #0a192f; }
        .text-white { color: white; }
        .eyebrow { display: block; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1rem; }
        .text-teal { color: #2dd4bf; }
        h1 { font-size: 3.5rem; font-weight: 800; margin-bottom: 1rem; color: white; }
        .hero-lead { font-size: 1.5rem; color: #94a3b8; font-weight: 500; }

        .section-h2 { font-size: 2.5rem; font-weight: 800; color: #0a192f; margin-bottom: 1.5rem; }
        .large-p { font-size: 1.4rem; line-height: 1.8; color: #334155; margin-bottom: 2rem; }
        .body-p { font-size: 1.15rem; line-height: 1.8; color: #64748b; }

        .bg-light { background: #f8fafc; }

        .evidence-card { padding: 2.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 20px; transition: all 0.2s; }
        .evidence-card:hover { transform: translateY(-3px); border-color: #0d9488; }
        .evidence-card h3 { font-size: 1.25rem; font-weight: 800; color: #0a192f; margin-bottom: 1rem; }
        .evidence-card p { font-size: 0.95rem; color: #64748b; line-height: 1.6; }

        .feature-list { display: flex; flex-direction: column; gap: 1.25rem; }
        .feature-item { display: flex; align-items: center; gap: 1rem; font-weight: 600; color: #475569; }

        .observatory-orb { width: 300px; height: 300px; border: 1px solid #e2e8f0; border-radius: 50%; margin: 0 auto; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .orb-inner { width: 150px; height: 150px; background: #0a192f; border-radius: 50%; opacity: 0.1; }
        .orb-signals { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 1px dashed #2dd4bf; border-radius: 50%; animation: spin 20s linear infinite; opacity: 0.3; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        @media (max-width: 992px) {
          .grid-2 { grid-template-columns: 1fr; }
          h1 { font-size: 2.5rem; }
        }
      `}</style>
    </div>
  );
};

export default ObservatoryPage;
