import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText, Globe, Activity, ArrowRight, Target, Brain,
  ArrowDownUp, Minimize, FastForward, BookOpen,
  FileChartPie, Building2, BarChart3, Layers, Presentation, Newspaper
} from 'lucide-react';

// ── Relative time formatter ────────────────────────────────────────────────────
const formatDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  const now = Date.now();
  const diff = now - d.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  <  2)   return 'Just now';
  if (mins  < 60)   return `${mins} minutes ago`;
  if (hours <  2)   return '1 hour ago';
  if (hours < 24)   return `${hours} hours ago`;
  if (days  <  2)   return 'Yesterday';
  if (days  <  7)   return `${days} days ago`;
  if (days  < 14)   return '1 week ago';
  if (days  < 60)   return `${Math.floor(days / 7)} weeks ago`;
  // Older: show Month Year (e.g. "Feb 2026")
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

// ── Type Badge config ─────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  Framework:        { color: '#f59e0b', bg: '#fef3c7', border: '#fde68a', label: 'Framework',      Icon: Layers },
  Report:           { color: '#ef4444', bg: '#fee2e2', border: '#fca5a5', label: 'Research Brief',  Icon: FileChartPie },
  'Case Study':     { color: '#0d9488', bg: '#ccfbf1', border: '#99f6e4', label: 'Case Study',     Icon: Building2 },
  Article:          { color: '#3b82f6', bg: '#dbeafe', border: '#bfdbfe', label: 'Article',         Icon: Newspaper },
  'Strategic Deck': { color: '#8b5cf6', bg: '#ede9fe', border: '#ddd6fe', label: 'Strategy Deck',  Icon: Presentation },
  'Cognitive Framing': { color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', label: 'Cognitive Framing', Icon: Brain },
  Infographic:      { color: '#ec4899', bg: '#fce7f3', border: '#fbcfe8', label: 'Infographic',    Icon: BarChart3 },
};


const getTypeConfig = (resource) =>
  TYPE_CONFIG[resource.category] || TYPE_CONFIG[resource.type] || {
    color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0', label: resource.type || 'Resource', Icon: FileText
  };

// ── Resource Card (glassmorphism) ─────────────────────────────────────────────
const ResourceCard = ({ resource, index }) => {
  const cfg = getTypeConfig(resource);
  const Icon = cfg.Icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.6)',
        borderRadius: 24,
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        cursor: 'pointer',
        breakInside: 'avoid',
        marginBottom: '1.5rem',
      }}
      whileHover={{ y: -4, boxShadow: '0 20px 48px rgba(0,0,0,0.12)', borderColor: cfg.border }}
    >
      {/* Icon + Badge row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color }}>
          <Icon style={{ width: 22, height: 22 }} />
        </div>
        <span style={{ padding: '0.3rem 0.8rem', borderRadius: 9999, fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
          {cfg.label}
        </span>
      </div>

      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.35, marginBottom: '0.6rem', fontFamily: 'Georgia,serif' }}>
        {resource.title}
      </h3>
      <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6, flexGrow: 1, marginBottom: '1.5rem', fontWeight: 300 }}>
        {resource.description}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: cfg.color }}>
          {resource.category}
        </span>
        <a href={resource.link || '#'} target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.8rem', color: '#0f172a', textDecoration: 'none' }}>
          View <ArrowRight size={14} />
        </a>
      </div>
    </motion.div>
  );
};

// ── GLAM Signal Card ──────────────────────────────────────────────────────────
const SignalCard = ({ signal, index }) => {
  const isVolatile = signal.summary?.includes('GLAM Signal') || signal.summary?.includes('Volatile');
  const score = signal.overall_score || signal.adaptiveness_score;
  const dateStr = formatDate(signal.session_date);

  return (
    <motion.div
      key={signal.id || index}
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      style={{
        padding: '2rem',
        background: 'rgba(30,41,59,0.4)',
        backdropFilter: 'blur(12px)',
        borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.07)',
        transition: 'background 0.2s'
      }}
      whileHover={{ background: 'rgba(30,41,59,0.6)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1rem' }}>
              {signal.organization_name || (isVolatile ? '🔥 Volatility Signal' : 'Orion Scout')}
            </span>
            {signal.region && (
              <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', borderRadius: 9999, border: '1px solid rgba(255,255,255,0.1)' }}>
                {signal.region}
              </span>
            )}
            {isVolatile && (
              <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', borderRadius: 9999, border: '1px solid rgba(239,68,68,0.25)' }}>
                Volatile
              </span>
            )}
          </div>

          {/* Temporal */}
          {(dateStr || signal.duration_seconds) && (
            <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
              {dateStr && (
                <div>
                  <p style={{ fontSize: '0.6rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.15rem' }}>Date Played</p>
                  <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{dateStr}</p>
                </div>
              )}
              {signal.duration_seconds && (
                <div>
                  <p style={{ fontSize: '0.6rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.15rem' }}>Length</p>
                  <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                    {Math.floor(signal.duration_seconds / 60)}m {signal.duration_seconds % 60}s
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Summary text */}
          {signal.summary && (
            <p style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic', fontWeight: 300, lineHeight: 1.6, borderLeft: '2px solid rgba(13,148,136,0.5)', paddingLeft: '0.75rem' }}>
              {signal.summary.length > 160 ? signal.summary.slice(0, 160) + '…' : signal.summary}
            </p>
          )}
        </div>

        {score && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2dd4bf', fontFamily: 'Georgia,serif' }}>{score}</div>
            <p style={{ fontSize: '0.6rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>LAI Score (Adaptive Capacity)</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.62rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '0.5rem' }}>
        <Activity size={12} />
        AFERR Logic Sequence Validated
      </div>
    </motion.div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ResearchPage = () => {
  const [signals, setSignals]       = useState([]);
  const [resources, setResources]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const FILTERS = ['All', 'Framework', 'Report', 'Case Study', 'Article', 'Strategic Deck', 'Infographic'];

  const filteredResources = activeFilter === 'All'
    ? resources
    : resources.filter(r => r.category === activeFilter || r.type === activeFilter);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [signalRes, resourceRes] = await Promise.all([
          fetch('/api/research/live'),
          fetch('/api/resources'),
        ]);
        setSignals(await signalRes.json());
        setResources(await resourceRes.json());
      } catch (err) {
        console.error('Research fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif', paddingBottom: '6rem' }}>

      {/* ── Scrollbar styles ──────────────────────────────────────────────── */}
      <style>{`
        .glam-signal-list {
          scrollbar-width: thin;
          scrollbar-color: rgba(45,212,191,0.25) transparent;
        }
        .glam-signal-list::-webkit-scrollbar {
          width: 4px;
        }
        .glam-signal-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .glam-signal-list::-webkit-scrollbar-thumb {
          background: rgba(45,212,191,0.3);
          border-radius: 99px;
        }
        .glam-signal-list::-webkit-scrollbar-thumb:hover {
          background: rgba(45,212,191,0.55);
        }
      `}</style>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span style={{ display: 'inline-block', padding: '0.35rem 1.2rem', background: '#f0fdfa', color: '#0d9488', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', borderRadius: 9999, marginBottom: '1.5rem' }}>
              Research &amp; Insights
            </span>
            <h1 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontFamily: 'Georgia,serif', color: '#0f172a', marginBottom: '1.25rem', lineHeight: 1.15 }}>
              Advancing the global understanding and measurement of leadership adaptiveness.
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.7, fontWeight: 300, maxWidth: 760 }}>
              Grounded in a decade of behavioral science and 600+ high-fidelity leadership simulations, the LAI Research Engine is a self-publishing intelligence platform that synthesizes AFERR data into actionable business intelligence.
            </p>
          </motion.div>

          {/* Featured Report Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              marginTop: '4rem',
              background: '#0a192f',
              borderRadius: 32,
              padding: '3rem',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              md: { flexDirection: 'row' },
              gap: '2rem',
              alignItems: 'center',
              border: '1px solid rgba(45,212,191,0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.05))', pointerEvents: 'none' }} />
            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <span style={{ color: '#2dd4bf', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '3px', display: 'block', marginBottom: '1rem' }}>Flagship Report 2026</span>
              <h2 style={{ fontSize: '2.5rem', fontFamily: 'Georgia,serif', marginBottom: '1.5rem' }}>The State of Cognition</h2>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2rem', fontWeight: 300, maxWidth: 500 }}>
                A global behavioral analysis of how leadership systems translate awareness into action. 
                Based on 20,000+ simulation data points.
              </p>
              <Link to="/research/reports/state-of-cognition" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2rem', background: '#2dd4bf', color: '#0a192f', borderRadius: 9999, fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s' }}>
                Access Flagship Report <ArrowRight size={18} />
              </Link>
            </div>
            <div style={{ width: '200px', height: '280px', background: 'white', borderRadius: 4, transform: 'rotate(5deg)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', flexShrink: 0, display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
              <span style={{ fontSize: '8px', fontWeight: 900, color: '#0a192f' }}>LAI</span>
              <div style={{ marginTop: 'auto' }}>
                <div style={{ height: '2px', width: '20px', background: '#2dd4bf', marginBottom: '8px' }} />
                <p style={{ fontSize: '14px', fontFamily: 'Georgia,serif', color: '#0a192f', fontWeight: 600, lineHeight: 1.2 }}>State of <br/>Cognition</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── AFERR Dimensions ──────────────────────────────────────────────── */}
      <section style={{ background: 'white', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '5rem 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '2rem' }}>
          {[
            { Icon: Target,      name: 'Signal Detection',        desc: 'Identifying early indicators of change and differentiating meaningful signal from environmental noise.' },
            { Icon: Brain,       name: 'Cognitive Framing',       desc: 'Interpreting uncertainty productively and reframing disruption as opportunity rather than threat.' },
            { Icon: ArrowDownUp, name: 'Decision Alignment',      desc: 'Ensuring leadership decisions reinforce a shared strategic response and maintain coherent momentum.' },
            { Icon: Minimize,    name: 'Resource Calibration',   desc: 'The velocity of redirecting capital, talent, and attention toward emerging priorities.' },
            { Icon: FastForward, name: 'Integrated Responsiveness',desc: 'Speed of operationalizing strategic adjustments and integrating learning for systemic evolution.' },
          ].map(({ Icon, name, desc }) => (
            <div key={name} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon style={{ width: 20, height: 20, color: '#0d9488' }} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>{name}</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Resource Library ──────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 0', background: 'linear-gradient(135deg,#f8fafc 0%,#f0fdfa 100%)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>

          {/* Header + Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.5rem)', fontFamily: 'Georgia,serif', color: '#0f172a', marginBottom: '0.5rem' }}>The Research Library</h2>
              <p style={{ color: '#64748b', fontWeight: 300 }}>
                AI-synthesized from {loading ? '600+' : resources.length > 0 ? resources.length : '600+'} behavioral intelligence signals. Continuously updated.
              </p>
            </div>

            {/* Filter chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {FILTERS.map(f => {
                const cfg = TYPE_CONFIG[f];
                const isActive = activeFilter === f;
                return (
                  <button key={f} onClick={() => setActiveFilter(f)}
                    style={{
                      padding: '0.4rem 1.1rem', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', border: '1px solid',
                      background: isActive ? (cfg?.color || '#0a192f') : 'white',
                      color: isActive ? 'white' : (cfg?.color || '#64748b'),
                      borderColor: isActive ? (cfg?.color || '#0a192f') : (cfg?.border || '#e2e8f0'),
                    }}>
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Masonry grid */}
          {filteredResources.length > 0 ? (
            <div style={{ columnCount: 'auto', columnWidth: 320, columnGap: '1.5rem' }}>
              {filteredResources.map((resource, i) => (
                <ResourceCard key={resource.id || i} resource={resource} index={i} />
              ))}
            </div>
          ) : (
            <div style={{ padding: '4rem', background: 'white', borderRadius: 24, border: '2px dashed #e2e8f0', textAlign: 'center' }}>
              <BookOpen style={{ width: 48, height: 48, color: '#e2e8f0', margin: '0 auto 1rem' }} />
              <h3 style={{ fontWeight: 700, color: '#94a3b8', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Library Hydration Active</h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem', maxWidth: 300, margin: '0 auto' }}>
                NotebookLM Intelligence Engine is synthesizing AFERR signals into executive research assets. First briefs appear within minutes.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── GLAM Live Signals ─────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 0', background: 'white', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ background: 'linear-gradient(135deg,#0a192f 0%,#0f2744 100%)', borderRadius: 32, padding: 'clamp(2rem,5vw,4rem)', position: 'relative', overflow: 'hidden' }}>

            {/* Glow orbs */}
            <div style={{ position: 'absolute', top: '-6rem', right: '-6rem', width: '24rem', height: '24rem', background: 'radial-gradient(circle,rgba(13,148,136,0.15) 0%,transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-6rem', left: '-6rem', width: '24rem', height: '24rem', background: 'radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Header */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontFamily: 'Georgia,serif', color: 'white', marginBottom: '0.5rem' }}>Live Global Signals (GLAM)</h2>
                    <p style={{ color: '#64748b', fontWeight: 300, maxWidth: 480, fontSize: '0.95rem' }}>
                      Real-time signal extraction from the Orion Scout network. Volatility-hunting across 5 active sectors.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.68rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '2px', background: 'rgba(16,185,129,0.1)', padding: '0.6rem 1.2rem', borderRadius: 9999, border: '1px solid rgba(52,211,153,0.2)', flexShrink: 0 }}>
                    <span style={{ width: 8, height: 8, background: '#34d399', borderRadius: '50%', boxShadow: '0 0 8px #34d399', animation: 'pulse 1.5s infinite' }} />
                    Orion Scout Live
                  </div>
                </div>
              </div>

              {/* Signal list — glassmorphism scrollbar */}
              <div className="glam-signal-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: 600, overflowY: 'auto', paddingRight: '0.5rem' }}>
                {loading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} style={{ height: 120, background: 'rgba(30,41,59,0.4)', borderRadius: 20, animation: 'pulse 1.5s infinite' }} />
                  ))
                ) : signals.length > 0 ? (
                  signals.map((signal, i) => <SignalCard key={signal.id || i} signal={signal} index={i} />)
                ) : (
                  <div style={{ padding: '4rem', textAlign: 'center' }}>
                    <Globe style={{ width: 48, height: 48, color: 'rgba(255,255,255,0.1)', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: '#94a3b8', fontFamily: 'Georgia,serif', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Awaiting Intelligence Signals</h3>
                    <p style={{ color: '#475569', fontSize: '0.875rem', maxWidth: 300, margin: '0 auto' }}>The Orion network is scanning. Signals appear automatically as sectors are detected.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 1.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem,3vw,2.75rem)', fontFamily: 'Georgia,serif', color: '#0f172a', marginBottom: '1rem' }}>Contribute to the Map</h2>
          <p style={{ color: '#64748b', fontWeight: 300, marginBottom: '2rem', lineHeight: 1.7 }}>Benchmark your leadership cohort against 600+ global simulations and join the LAI Intelligence Index.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={{ padding: '0.875rem 2.5rem', background: '#0d9488', color: 'white', border: 'none', borderRadius: 9999, fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', letterSpacing: '0.5px' }}>
              Explore Research Library
            </button>
            <button onClick={() => window.location.href = '/diagnostic'}
              style={{ padding: '0.875rem 2.5rem', background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: 9999, fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
              Benchmark Your Team
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ResearchPage;
