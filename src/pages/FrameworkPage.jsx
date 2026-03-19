import React from 'react';
import { motion } from 'framer-motion';
import { 
  Signal, Brain, Link as LinkIcon, Layers, Zap, 
  ArrowRight, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import RelatedPathwaysSection from '../components/RelatedPathwaysSection';

const pageMeta = {
  id: "framework",
  category: "framework",
  dimension: "all",
  related: ["/how-measured", "/signals", "/observatory", "/global-index"]
};

const PILLAR_DETAILS = [
  {
    icon: <Signal size={40} />,
    title: '1. Signal Detection',
    subtitle: 'Observation vs Noise',
    desc: 'Adaptiveness begins with the ability of leadership systems to recognize meaningful environmental change. This involves distinguishing specific signals—technological shifts, competitor moves, or regulatory changes—from background noise.',
    metrics: ['Recognition Speed', 'Signal Sensitivity', 'Signal-to-Noise Ratio']
  },
  {
    icon: <Brain size={40} />,
    title: '2. Cognitive Framing',
    subtitle: 'Interpretation vs Entrenchment',
    desc: 'Recognizing change is insufficient. Leadership systems must interpret uncertainty constructively. Frame-of-reference determines whether a team responds with defensive entrenchment or strategic curiosity.',
    metrics: ['Threat vs Opportunity Orientation', 'Forecast Horizon', 'Confidence Calibration']
  },
  {
    icon: <LinkIcon size={40} />,
    title: '3. Decision Alignment',
    subtitle: 'Coherence vs Fragmentation',
    desc: 'Leadership teams frequently agree on change intellectually but diverge in operational choices. Alignment measures whether team decisions converge around a shared adaptation pathway.',
    metrics: ['Strategic Consistency', 'Decision Latency', 'Convergence Rate']
  },
  {
    icon: <Layers size={40} />,
    title: '4. Resource Calibration',
    subtitle: 'Velocity vs Inertia',
    desc: 'Adaptiveness becomes observable when resource allocation shifts. Calibration measures the speed and precision of redirecting capital, talent, and attention the moment a strategic assumption is revised.',
    metrics: ['Reallocation Speed', 'Capital Agility', 'Talent Mobility']
  },
  {
    icon: <Zap size={40} />,
    title: '5. Integrated Responsiveness',
    subtitle: 'Response vs Latency',
    desc: 'The final measure of adaptiveness is the transition from intent to behavior. Integrated responsiveness measures how quickly shifted decisions translate into coordinated systemic action.',
    metrics: ['Pivot Execution Speed', 'Systemic Adaptation Index', 'Operational Lag']
  }
];

const SEC_STYLE = { padding: '8rem 0' };

const FrameworkPage = () => {
  return (
    <div className="framework-page">
      {/* HERO SECTION */}
      <header className="page-header pt-32 pb-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-teal/5 border border-teal/10 text-teal text-[11px] font-bold uppercase tracking-[0.2em] mb-8">
              Institutional Standards
            </span>
            <h1 className="text-5xl md:text-7xl font-serif text-slate-900 mb-8 tracking-tight leading-[1.1]">
              The Leadership <span className="text-slate-500 italic">Adaptiveness</span> Framework
            </h1>
            <p className="text-xl text-slate-500 font-light max-w-2xl mx-auto">The Behavioral Foundation of Organizational Resilience</p>
          </motion.div>
        </div>
      </header>

      {/* CORE LOGIC */}
      <section style={SEC_STYLE} className="logic-section">
        <div className="container narrow">
          <div className="text-center mb-5">
            <h2 className="section-h2">System Response Over Individual Competency</h2>
            <p className="large-p">Traditional leadership models focus on personality traits or leadership styles. The Leadership Adaptiveness Institute treats leadership as a <strong>behavioral system</strong>.</p>
          </div>
          
          <div className="contrast-box">
            <div className="contrast-side legacy">
              <h3>Traditional Models</h3>
              <p>Personality traits, competencies, perception-based assessments, and static styles.</p>
            </div>
            <div className="contrast-side modern">
              <h3>LAI Framework</h3>
              <p>Observable behavior, system response to signals, resource movement, and decision coherence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* THE FIVE DIMENSIONS */}
      <section className="bg-navy text-white" style={SEC_STYLE}>
        <div className="container">
          <div className="sec-header mb-5">
            <span className="eyebrow text-teal">The Dimensions</span>
            <h2 className="section-h2 text-white">The Leadership Adaptiveness System</h2>
          </div>
          
          <div className="dimensions-grid">
            {PILLAR_DETAILS.map((dim, i) => (
              <motion.div 
                key={dim.title}
                className="dim-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="dim-head">
                  <div className="dim-number">0{i+1}</div>
                  <div className="dim-icon">{dim.icon}</div>
                </div>
                <h3>{dim.title}</h3>
                <span className="dim-sub">{dim.subtitle}</span>
                <p className="dim-desc">{dim.desc}</p>
                <div className="dim-metrics">
                  <h4>Metrics</h4>
                  <ul>
                    {dim.metrics.map(m => <li key={m}>{m}</li>)}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MEASUREMENT CONTEXT */}
      <section style={SEC_STYLE}>
        <div className="container narrow text-center">
          <h2 className="section-h2">From Concept to Measurement</h2>
          <p className="body-p">This framework serves as the structural foundation for the Global Leadership Adaptiveness Index. By defining these five observable dimensions, the Institute can measure how organizations actually behave when reality changes.</p>
          <p className="text-teal font-bold mt-4 mb-2">
            <Link to="/research/reports/state-of-cognition" className="inline-flex items-center gap-2">
              See how this plays out globally in the State of Cognition Report <ArrowRight size={16} />
            </Link>
          </p>
          <div className="mt-5">
            <Link to="/how-measured" className="btn-institutional">
              Explore Our Measurement Methodology <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <RelatedPathwaysSection 
        relatedPaths={pageMeta.related}
        eyebrow="System Integration"
        title="Further Exploration"
      />

      <style jsx>{`
        .framework-page { background: white; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
        .narrow { max-width: 800px; margin: 0 auto; }
        .text-center { text-align: center; }
        .mb-5 { margin-bottom: 4rem; }
        .mt-5 { margin-top: 3rem; }
        
        .page-header { padding: 12rem 0 8rem; background: #f8fafc; text-align: center; }
        .eyebrow { display: block; font-size: 0.8rem; font-weight: 800; color: #0d9488; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1rem; }
        .text-teal { color: #2dd4bf; }
        h1 { font-size: 4rem; font-weight: 800; color: #0a192f; margin-bottom: 1rem; }
        .hero-lead { font-size: 1.5rem; color: #475569; font-weight: 500; }

        .large-p { font-size: 1.25rem; line-height: 1.8; color: #334155; }
        .body-p { font-size: 1.15rem; line-height: 1.8; color: #475569; }

        .contrast-box { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; margin-top: 4rem; }
        .contrast-side { padding: 3rem; }
        .contrast-side.legacy { background: #f8fafc; border-right: 1px solid #e2e8f0; }
        .contrast-side modern { background: white; }
        .contrast-side h3 { font-size: 1.2rem; font-weight: 800; color: #0a192f; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 1px; }
        .contrast-side p { color: #64748b; line-height: 1.6; }
        .contrast-side.modern p { color: #0a192f; font-weight: 600; }

        .bg-navy { background: #0a192f; }
        .text-white { color: white; }
        
        .dimensions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; }
        .dim-card { background: rgba(255,255,255,0.03); padding: 3rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); }
        .dim-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
        .dim-number { font-size: 3rem; font-weight: 900; color: rgba(45, 212, 191, 0.2); line-height: 1; }
        .dim-icon { color: #2dd4bf; }
        .dim-card h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; color: white; }
        .dim-sub { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #2dd4bf; letter-spacing: 1px; display: block; margin-bottom: 1.5rem; }
        .dim-desc { color: #94a3b8; line-height: 1.7; margin-bottom: 2rem; font-size: 1rem; }
        
        .dim-metrics h4 { font-size: 0.7rem; font-weight: 900; text-transform: uppercase; color: white; letter-spacing: 1px; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; }
        .dim-metrics ul { list-style: none; padding: 0; }
        .dim-metrics li { font-size: 0.9rem; color: #2dd4bf; margin-bottom: 0.5rem; font-weight: 600; }

        .section-h2 { font-size: 2.5rem; font-weight: 800; margin-bottom: 2rem; color: #0a192f; }
        .section-h2.text-white { color: white; }

        .btn-institutional { 
          display: inline-flex; 
          align-items: center; 
          gap: 0.75rem; 
          background: #0a192f; 
          color: white !important; 
          padding: 1.25rem 2.5rem; 
          border-radius: 12px; 
          font-weight: 800; 
          text-decoration: none;
          transition: transform 0.2s;
        }
        .btn-institutional:hover { transform: translateY(-2px); }

        @media (max-width: 992px) {
          h1 { font-size: 2.5rem; }
          .contrast-box { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default FrameworkPage;
