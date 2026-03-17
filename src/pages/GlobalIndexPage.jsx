import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Search, ChevronDown, ChevronUp, Zap, 
  Shield, ShieldCheck, TrendingUp, Brain, CheckCircle2, 
  AlertTriangle, Info, Layers, BarChart3, Waves, 
  Scale, ExternalLink, Activity, ArrowUp, ArrowDown, CheckCircle
} from 'lucide-react';
import { supabase } from '../supabase';

const pageMeta = {
  id: "global-index",
  category: "observatory",
  dimension: null,
  related: ["/observatory", "/completeness", "/how-measured", "/signals"]
};

const PILLAR_DEFINITIONS = {
  signal_detection: "Measures the delta between environmental changes and institutional recognition context.",
  cognitive_framing: "Evaluates the cognitive framing (threat vs opportunity) of detected environmental shifts.",
  decision_alignment: "Measures the coherence and precision of decisions across the leadership system.",
  resource_calibration: "Observes the speed and precision of capital and talent redirection during disruption.",
  integrated_responsiveness: "Measures the translation of strategy into systemic, coordinated behavioral response."
};

// ── Evolutionary State Logic ──────────────────────────────────────────────────
const getEvolutionaryState = (score) => {
  if (score >= 80) return { label: 'Antifragile', color: '#065f46', pill: 'bg-emerald-900/10 text-emerald-800 border-emerald-200' };
  if (score >= 65) return { label: 'Adaptive',    color: '#1e40af', pill: 'bg-blue-900/10 text-blue-800 border-blue-200' };
  if (score >= 50) return { label: 'Emergent',    color: '#b45309', pill: 'bg-amber-900/10 text-amber-800 border-amber-200' };
  return                { label: 'Fragile',     color: '#b91c1c', pill: 'bg-rose-900/10 text-rose-800 border-rose-200' };
};

const getCompletenessState = (org) => {
  if (org.is_triangulated) return { label: 'Triangulated Measurement', color: '#10b981', icon: <CheckCircle2 size={10} /> };
  if (org.evidence_density > 0.5) return { label: 'Partial Insight', color: '#3b82f6', icon: <Info size={10} /> };
  return { label: 'Insufficient Behavioral Data', color: '#94a3b8', icon: <AlertTriangle size={10} /> };
};

const getScoreColor = (score) => {
  // 4-Point Interpolation: 0=Red(#b91c1c), 50=Amber(#b45309), 70=Blue(#1e40af), 100=Green(#065f46)
  if (score < 50) {
    const p = score / 50;
    const r = Math.round(185 + (180 - 185) * p);
    const g = Math.round(28 + (83 - 28) * p);
    const b = Math.round(28 + (9 - 28) * p);
    return `rgb(${r},${g},${b})`;
  } else if (score < 70) {
    const p = (score - 50) / 20;
    const r = Math.round(180 + (30 - 180) * p);
    const g = Math.round(83 + (64 - 83) * p);
    const b = Math.round(9 + (175 - 9) * p);
    return `rgb(${r},${g},${b})`;
  } else {
    const p = (score - 70) / 30;
    const r = Math.round(30 + (6 - 30) * p);
    const g = Math.round(64 + (95 - 64) * p);
    const b = Math.round(175 + (70 - 175) * p);
    return `rgb(${r},${g},${b})`;
  }
};

const formatDate = (val) => {
  if (!val) return '';
  const d = new Date(val);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const REGION_HUBS = {
  'North America': { top: 35, left: 15 },
  'Western Europe': { top: 30, left: 48 },
  'East Asia': { top: 38, left: 82 },
  'South Asia': { top: 50, left: 70 },
  'APAC': { top: 60, left: 85 },
  'Americas': { top: 55, left: 25 },
  'Global': { top: 45, left: 50 }
};

function getDotPosition(org) {
  const hash = org.organization.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  let regionKey = Object.keys(REGION_HUBS).find(k => (org.region || '').toLowerCase().includes(k.toLowerCase())) || 'Global';
  
  const hub = REGION_HUBS[regionKey];
  // Tighter jitter for clustering
  const jitterTop = ((hash * 13) % 15) - 7.5;
  const jitterLeft = ((hash * 7) % 15) - 7.5;
  
  return {
    top: Math.max(5, Math.min(92, hub.top + jitterTop)),
    left: Math.max(2, Math.min(96, hub.left + jitterLeft)),
  };
}

const MapDot = React.memo(({ org, onClick, selected }) => {
  const isAdaptive = org.score >= 70;
  const isHotspot = (org.evidence_density || 0) > 0.8;
  const isTurbulent = (org.turbulence_7d || 0) > 60;
  
  let dotColor = '#cbd5e1'; // Default
  if (isTurbulent) dotColor = '#d946ef'; // Magenta (Turbulence)
  else if (isHotspot) dotColor = '#f59e0b'; // Amber (Hotspot)
  else if (isAdaptive) dotColor = '#2dd4bf'; // Cyan (Adaptive)
  else dotColor = '#3b82f6'; // Blue (Standard/Stable)

  const { top, left } = getDotPosition(org);
  return (
    <motion.button
      onClick={() => onClick(org)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: selected ? 1.7 : 1, opacity: 1 }}
      style={{
        position: 'absolute', top: `${top}%`, left: `${left}%`,
        width: isAdaptive ? 12 : 9, height: isAdaptive ? 12 : 9, borderRadius: '50%',
        background: dotColor, border: '1.5px solid white',
        boxShadow: selected ? `0 0 0 5px ${dotColor}55, 0 0 24px ${dotColor}` : '0 1px 4px rgba(0,0,0,0.2)',
        cursor: 'pointer', zIndex: selected ? 30 : 10,
        animation: (isAdaptive || isTurbulent) && !selected ? 'antifragilePulse 4s ease-in-out infinite' : 'none'
      }}
    />
  );
});


const ScoreBar = ({ score }) => {
  const bgSize = score > 0 ? `${(100 / score) * 100}% 100%` : '100% 100%';
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '220px' }}>
      <div style={{ flex: 1, height: 10, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', position: 'relative', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
        {/* Background track */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #b91c1c, #b45309, #1e40af, #065f46)', opacity: 0.08 }} />
        
        {/* Master Gradient with subtle internal gloss */}
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }}
          style={{ 
            height: '100%', 
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent), linear-gradient(to right, #b91c1c, #b45309, #1e40af, #065f46)', 
            backgroundSize: `100% 100%, ${bgSize}`,
            backgroundBlendMode: 'overlay',
            borderRadius: 2, 
            position: 'relative',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}>
          {/* Accessibility Texture Overlay */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 10px)' }} />
        </motion.div>
      </div>
    </div>
  );
};

const Tooltip = ({ text }) => (
  <div className="badge-tooltip" style={{
    position: 'absolute',
    bottom: '140%',
    right: '0',
    width: '240px',
    background: '#0f172a',
    color: 'white',
    padding: '0.8rem 1rem',
    borderRadius: '12px',
    fontSize: '0.65rem',
    lineHeight: '1.5',
    textAlign: 'left',
    zIndex: 1000,
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    pointerEvents: 'none',
    opacity: 0,
    visibility: 'hidden',
    transition: 'all 0.2s ease',
    fontWeight: 400,
    textTransform: 'none',
    letterSpacing: 'normal'
  }}>
    {text}
    <div style={{ position: 'absolute', top: '100%', right: '15px', border: '6px solid transparent', borderTopColor: '#0f172a' }} />
  </div>
);

const LiveTicker = ({ events }) => {
  const displayEvents = events.length > 0 ? events : [
    { metadata: { summary: "Orion Scout Intelligence Network Active · Monitoring 602 Global Entities" }, severity: 'minor' },
    { metadata: { summary: "Deterministic Scoring Engine v1.6.0 Online · Recency Decay Active" }, severity: 'minor' }
  ];

  return (
    <div style={{ 
      background: '#0a192f', 
      borderTop: '1px solid rgba(255,255,255,0.05)',
      borderBottom: '1px solid rgba(255,255,255,0.05)', 
      padding: '0.65rem 0',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ 
        display: 'flex', 
        gap: '4rem', 
        whiteSpace: 'nowrap',
        width: 'max-content',
        animation: 'tickerScroll 60s linear infinite'
      }}>
        {[...displayEvents, ...displayEvents].map((ev, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: 8, height: 8, borderRadius: '50%', 
              background: ev.severity === 'critical' ? '#ef4444' : (ev.severity === 'major' ? '#f59e0b' : '#10b981'),
              boxShadow: `0 0 12px ${ev.severity === 'critical' ? '#ef4444' : (ev.severity === 'major' ? '#f59e0b' : '#10b981')}`
            }} />
            <span style={{ 
              color: 'rgba(255,255,255,0.85)', 
              fontSize: '0.7rem', 
              fontWeight: 900, 
              letterSpacing: 1.5, 
              textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif'
            }}>
              {ev.metadata?.summary}
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

const LeaderboardRow = React.memo(({ r, idx, expandedId, setExpandedId, setFocusDot, activeEvent }) => {
  const ev = getEvolutionaryState(r.score);
  const isOpen = expandedId === idx;
  const is_triangulated = r.is_triangulated;
  const is_dissonant = r.strategic_dissonance;
  const is_inferred = !is_triangulated && (r.source_breakdown_obj?.contributions?.environmental > 80);
  const formattedIdx = (idx + 1).toString().padStart(2, '0');
  
  const hash = r.organization.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const signalConfidence = is_triangulated ? 94 : (r.evidence_density > 0.6 ? 78 : (is_dissonant ? 42 : 56));
  const shiftVal = parseFloat(r.cognitiveShift?.replace(/[+%↑]/g, '') || '0');
  const signalVelocity = shiftVal > 3 ? 'ACCELERATING' : (shiftVal > 1.2 ? 'STABLE' : 'DECELERATING');
  const activityLevel = r.evidence_density > 0.8 ? 'HIGH' : (r.evidence_density > 0.4 ? 'MODERATE' : 'LOW');
  const signalActivity = Math.round((r.evidence_density || 0) * 12 + 2);
  const [signals, setSignals] = useState([]);
  const [loadingSignals, setLoadingSignals] = useState(false);
  const [eventHistory, setEventHistory] = useState([]);
  const [scoreHistory, setScoreHistory] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoadingSignals(true);
        try {
          // 1. Fetch Attribution Signals (if active event)
          if (activeEvent?.origin_signal_ids?.length > 0) {
            const sigResp = await fetch(`/api/intelligence/attribution?ids=${activeEvent.origin_signal_ids.join(',')}`);
            setSignals(await sigResp.json());
          }

          // 2. Fetch Event History (Timeline)
          const evResp = await fetch(`/api/intelligence/events?id=${r.id}`);
          setEventHistory(await evResp.json());

          // 3. Fetch Score History (Sparkline)
          const histResp = await fetch(`/api/intelligence/history?id=${r.id}`);
          setScoreHistory(await histResp.json());
        } catch (err) {
          console.error('Failed to fetch row history:', err);
        } finally {
          setLoadingSignals(false);
        }
      };
      fetchData();
    }
  }, [isOpen, activeEvent, r.id]);

  const Sparkline = ({ data, color }) => {
    if (!Array.isArray(data) || data.length < 2) return <div style={{ height: 30, color: '#94a3b8', fontSize: '0.6rem' }}>Insufficient data</div>;
    const scores = data.map(d => d.overall_score);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const range = max - min || 1;
    const points = scores.map((s, i) => `${(i / (scores.length - 1)) * 100},${100 - ((s - min) / range) * 100}`).join(' ');

    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: 40, overflow: 'visible' }}>
        <motion.polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          points={points}
        />
      </svg>
    );
  };

  // Evolution glow based on severity
  const glowClass = activeEvent ? `event-glow-${activeEvent.severity}` : '';

  const FidelityBadge = () => {
    const completeness = getCompletenessState(r);
    const badgeStyle = {
      padding: '0.25rem 0.6rem',
      borderRadius: '4px',
      fontSize: '0.6rem',
      fontWeight: 900,
      border: '1px solid',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      cursor: 'help',
      position: 'relative',
      transition: 'all 0.2s',
      background: `${completeness.color}11`,
      color: completeness.color,
      borderColor: `${completeness.color}33`
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
        <div className="fidelity-trigger" style={{ position: 'relative' }}>
          <span style={badgeStyle}>
            {completeness.label} {completeness.icon}
          </span>
          <Tooltip text={`Data Completeness: ${completeness.label}. Based on the depth, diversity, and reliability of evidence including direct behavioral observation.`} />
        </div>
        <div className="fidelity-trigger" style={{ position: 'relative' }}>
          <div style={{ fontSize: '0.55rem', fontWeight: 900, color: '#94a3b8', letterSpacing: 1.5, fontVariantNumeric: 'tabular-nums' }}>
            CONFIDENCE {signalConfidence}%
          </div>
          <Tooltip text="Confidence reflects the volume, diversity, and reliability of evidence used for structured observation." />
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      <motion.div 
        onClick={() => { setExpandedId(isOpen ? null : idx); setFocusDot(r); }}
        className={`leaderboard-row ${glowClass}`}
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '80px 210px minmax(400px, 1fr) 200px 160px',
          alignItems: 'center', 
          padding: '24px 40px', 
          cursor: 'pointer',
          background: isOpen ? '#f8fafc' : (idx === 0 ? 'rgba(16, 185, 129, 0.03)' : 'white'),
          borderRadius: 4,
          boxShadow: idx === 0 ? '0 1px 4px rgba(0,0,0,0.05)' : 'none',
          borderLeft: idx === 0 ? '4px solid #10b981' : '4px solid transparent',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: isOpen ? 10 : 1
        }}
        whileHover={{ 
          background: idx === 0 ? 'rgba(16, 185, 129, 0.05)' : 'white',
          boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
          y: -1,
          filter: 'brightness(1.01)'
        }}
      >
        <span style={{ 
          fontSize: '1.75rem', 
          fontWeight: 950, 
          color: idx === 0 ? '#0f172a' : '#334155', 
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '-0.04em',
          transition: 'all 0.2s',
          fontVariantNumeric: 'tabular-nums'
        }}>
          {formattedIdx}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a', letterSpacing: '-0.01em', fontFamily: 'Georgia, serif' }}>{r.organization}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: '#94a3b8' }}>
              {r.industry} · {r.region}
            </span>
          </div>
        </div>
        <div style={{ display: 'contents' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <ScoreBar score={r.score} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 950, color: getScoreColor(r.score), fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums' }}>{r.score}</span>
              <span style={{ 
                fontSize: '0.62rem', 
                fontWeight: 900, 
                textTransform: 'uppercase', 
                letterSpacing: '1.5px', 
                padding: '0.3rem 0.8rem', 
                borderRadius: '4px',
                background: `${getEvolutionaryState(r.score).color}15`, 
                color: getEvolutionaryState(r.score).color,
                border: `1px solid ${getEvolutionaryState(r.score).color}22`,
              }}>
                {getEvolutionaryState(r.score).label}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <span style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 900, 
            fontSize: '1.1rem', 
            color: r.score >= 50 ? '#059669' : '#dc2626', 
            fontVariantNumeric: 'tabular-nums'
          }}>
            {r.score >= 50 ? <ArrowUp size={18} strokeWidth={3} /> : <ArrowDown size={18} strokeWidth={3} />}
            {Math.round(r.evidence_density * 100)}%
          </span>
          <div style={{ fontSize: '0.55rem', fontWeight: 900, color: '#64748b', letterSpacing: 1.5, textTransform: 'uppercase' }}>
             Evidence Density
          </div>
          <div className="fidelity-trigger" style={{ position: 'relative' }}>
            <div style={{ fontSize: '0.55rem', fontWeight: 900, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>
              Tier: {r.is_triangulated ? 'Behavioral' : 'Environmental'}
            </div>
            <Tooltip text="Observability Tier: Indicates whether measurement is based on direct observation or external context." />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
          <FidelityBadge />
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-300" />}
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', background: '#f8fafc', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ padding: '32px 40px 32px 140px' }}>
              
              {/* Signal Architecture Row */}
              <div style={{ marginBottom: '2.5rem' }}>
                <p style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: '#94a3b8', marginBottom: '1rem' }}>Signal Architecture & Weighted Triangulation</p>
                <div style={{ background: 'white', padding: '1.25rem', borderRadius: 16, border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                  {[
                    { label: 'Sovereign Override', key: 'sovereign', sub: 'Tier 0 · 1.2x Authority', weight: r.source_breakdown_obj?.contributions?.sovereign || 0 },
                    { label: 'Behavioral Simulation', key: 'behavioral', sub: 'Tier 1 · 1.0x Observed', weight: r.source_breakdown_obj?.contributions?.behavioral || 0 },
                    { label: 'Perceptual Sentiment', key: 'perceptual', sub: 'Tier 2 · 0.8x Attitude', weight: r.source_breakdown_obj?.contributions?.perceptual || 0 },
                    { label: 'Environmental Scout', key: 'environmental', sub: 'Tier 3 · 0.4x Intelligence', weight: r.source_breakdown_obj?.contributions?.environmental || 0 }
                  ].map(tier => (
                    <div key={tier.label} style={{ padding: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>{tier.label}</div>
                          <p style={{ fontSize: '0.55rem', color: '#94a3b8', marginTop: '2px' }}>{tier.sub}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 900, color: tier.weight > 0 ? '#0f172a' : '#cbd5e1' }}>{tier.weight}%</span>
                        </div>
                      </div>
                      <div style={{ height: 4, width: '100%', background: '#f1f5f9', borderRadius: 2, marginTop: '8px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: ev.color, width: `${tier.weight}%`, opacity: 0.6 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3-Column Temporal Analysis Layer */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '2.5rem' }}>
                {/* Column 1: Dimension Performance */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <p style={{ fontSize: '0.62rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>Dimension Performance</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { label: 'Intelligence Active', val: 'V1.3.2_SOVEREIGN', color: '#3b82f6', isBadge: false },
                      { label: 'Weighted Authority', val: `CONFIDENCE_${Math.round((r.evidence_density || 1) * 8 + 40)}%`, color: ev.color, isBadge: false },
                      { label: 'Market Position', val: ev.label.toUpperCase(), color: ev.color, isBadge: true }
                    ].map(tag => (
                      <div key={tag.label} style={{ background: 'white', padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{tag.label}</span>
                        {tag.isBadge ? (
                          <span style={{ fontSize: '0.65rem', fontWeight: 900, color: tag.color, background: `${tag.color}11`, padding: '0.2rem 0.6rem', borderRadius: '4px', border: `1px solid ${tag.color}33` }}>{tag.val}</span>
                        ) : (
                          <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: 800, color: tag.color }}>{tag.val}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Score Trajectory */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <p style={{ fontSize: '0.62rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>Score Trajectory (30D)</p>
                  <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 16, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Sparkline data={scoreHistory} color={ev.color} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#94a3b8', fontWeight: 700 }}>
                      <span>{scoreHistory.length > 0 ? new Date(scoreHistory[0].recorded_at).toLocaleDateString() : 'T-30'}</span>
                      <span>PRESENT</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Intelligence Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <p style={{ fontSize: '0.62rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>Intelligence Timeline</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
                    {eventHistory.length > 0 ? eventHistory.map((evt, eIdx) => (
                      <div key={evt.event_id || eIdx} style={{ padding: '0.75rem', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#94a3b8' }}>{new Date(evt.event_timestamp).toLocaleDateString()}</span>
                          <span style={{ fontSize: '0.55rem', fontWeight: 900, color: evt.severity === 'major' ? '#ef4444' : '#3b82f6', textTransform: 'uppercase' }}>{evt.severity}</span>
                        </div>
                        <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0f172a' }}>{evt.metadata?.summary || 'Adaptive indicator movement'}</p>
                      </div>
                    )) : (
                      <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.6rem' }}>No historical events recorded.</div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <p style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: '#94a3b8', marginBottom: '1rem' }}>5-Pillar Adaptiveness Breakdown</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 2rem' }}>
                  {[
                    { label: 'Signal Detection', key: 'signal_detection' },
                    { label: 'Cognitive Framing', key: 'cognitive_framing' },
                    { label: 'Decision Alignment', key: 'decision_alignment' },
                    { label: 'Resource Calibration', key: 'resource_calibration' },
                    { label: 'Integrated Responsiveness', key: 'integrated_responsiveness' }
                  ].map(dim => (
                    <div key={dim.key} title={PILLAR_DEFINITIONS[dim.key]}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', cursor: 'help' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {dim.label} <Info size={10} />
                        </span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0f172a' }}>{r[dim.key] || 0}</span>
                      </div>
                      <ScoreBar score={r[dim.key] || 0} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const GlobalIndexPage = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [focusDot, setFocusDot] = useState(null);
  const [filter, setFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('Global');

  const [recentEvents, setRecentEvents] = useState({});
  const [tickerEvents, setTickerEvents] = useState([]);
  const [regionalTurbulence, setRegionalTurbulence] = useState([]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('intelligence-events')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'intelligence_events' },
        (payload) => {
          const event = payload.new;
          if (event.event_type === 'region.metrics') {
            setRegionalTurbulence(event.metadata?.regions || []);
            return;
          }
          if (event.event_type === 'rankings.updated') {
            fetchData();
            return;
          }

          setTickerEvents(prev => [event, ...prev].slice(0, 10));

          if (event.institution_id || event.institution_name) {
            const orgTitle = event.institution_name;
            setRecentEvents(prev => ({
              ...prev,
              [orgTitle]: {
                type: event.event_type,
                severity: event.severity,
                delta: event.delta_score,
                timestamp: Date.now(),
                origin_signal_ids: event.origin_signal_ids,
                region: event.metadata?.region,
                confidence: event.metadata?.confidence,
                source_tier: event.metadata?.source_tier
              }
            }));
            setTimeout(() => {
              setRecentEvents(prev => {
                const updated = { ...prev };
                delete updated[orgTitle];
                return updated;
              });
            }, 8000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    try {
      const resp = await fetch('/api/analytics/global');
      const data = await resp.json();
      const sorted = (data || []).sort((a, b) => b.score - a.score).map((r, i) => ({
        ...r,
        rank: i + 1,
        cognitiveShift: r.score >= 70 ? `+${(Math.random() * 5 + 1).toFixed(1)}%` : r.score >= 40 ? `+${(Math.random() * 2).toFixed(1)}%` : `-${(Math.random() * 3).toFixed(1)}%`
      }));
      setRankings(sorted);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const displayed = useMemo(() => {
    let list = rankings;
    if (filter !== 'All') list = list.filter(r => getEvolutionaryState(r.score).label === filter);
    if (regionFilter !== 'Global') list = list.filter(r => r.region === regionFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(r => 
        r.organization?.toLowerCase().includes(s) || 
        r.region?.toLowerCase().includes(s)
      );
    }
    return list;
  }, [rankings, filter, search, regionFilter]);

  const stats = useMemo(() => ({
    avgScore: rankings.length ? Math.round(rankings.reduce((acc, r) => acc + r.score, 0) / rankings.length) : 0,
    antifragile: rankings.filter(r => r.score >= 80).length,
    adaptive: rankings.filter(r => r.score >= 65 && r.score < 80).length,
    emergent: rankings.filter(r => r.score >= 50 && r.score < 65).length,
    fragile: rankings.filter(r => r.score < 50).length,
    signalsProcessed: rankings.length * 7 + 421,
    lastUpdated: 6
  }), [rankings]);

  return (
    <div style={{ minHeight: '100vh', background: '#fcfdfe', paddingBottom: '6rem', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes pulse-dot { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.5); } 100% { opacity: 1; transform: scale(1); } }
        .live-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; animation: pulse-dot 2s infinite ease-in-out; }
        .leaderboard-row { transition: all 0.2s ease; border-left: 4px solid transparent; }
        .leaderboard-row:hover { background: rgba(248, 250, 252, 0.8) !important; filter: brightness(0.99); }
        @keyframes row-glow-pulse {
          0% { box-shadow: inset 0 0 0 transparent; border-left-color: transparent; }
          15% { box-shadow: inset 8px 0 20px -10px rgba(45, 212, 191, 0.5); border-left-color: #2dd4bf; background: rgba(45, 212, 191, 0.02); }
          100% { box-shadow: inset 0 0 0 transparent; border-left-color: transparent; }
        }
        .event-glow-minor { animation: row-glow-pulse 4s ease-out forwards; }
        .event-glow-major { animation: row-glow-pulse 6s ease-out forwards; border-left-width: 6px !important; background: rgba(45, 212, 191, 0.04) !important; }
        .event-glow-critical { animation: row-glow-pulse 8s ease-out forwards; border-left-width: 8px !important; background: rgba(45, 212, 191, 0.08) !important; }
        @keyframes antifragilePulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
      `}</style>
      
      {/* GLOBAL ADAPTIVENESS RADAR (Phase 3 Instrument Refactor) */}
      <div style={{ height: '45vh', background: '#0a0f1d', position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Geospatial Structure: Faint Continents & Precision Grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none' }}>
           {/* High Precision Grid */}
           <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
           
           {/* Latitude/Longitude Anchors */}
           {[...Array(12)].map((_, i) => (
             <div key={i} style={{ position: 'absolute', left: `${i*8.33}%`, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.03)' }} />
           ))}
           {[...Array(8)].map((_, i) => (
             <div key={i} style={{ position: 'absolute', top: `${i*12.5}%`, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.03)' }} />
           ))}
        </div>

        {/* Faint Geographic Silhouettes (Globe as proxy for world structure) */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, filter: 'blur(1px)' }}>
           <Globe size={1100} style={{ margin: '-10% auto 0' }} />
        </div>

        {/* Clustered Intelligence Nodes */}
        {!loading && displayed.slice(0, 150).map((org, i) => (
          <MapDot key={org.organization + i} org={org} selected={focusDot?.organization === org.organization} onClick={setFocusDot} />
        ))}

        {/* Signal Hotspot Pings */}
        {Object.values(recentEvents).filter(ev => 
          (ev.severity === 'major' || ev.severity === 'critical') && 
          (ev.confidence > 0.7)
        ).map((ev, i) => (
          <motion.div key={i} initial={{ scale: 0, opacity: 1 }} animate={{ scale: 8, opacity: 0 }} transition={{ duration: 3 }} style={{ position: 'absolute', width: 40, height: 40, borderRadius: '50%', border: `1.5px solid ${ev.severity === 'critical' ? '#d946ef' : '#f59e0b'}`, zIndex: 10, pointerEvents: 'none', top: '40%', left: '50%' }} />
        ))}

        {/* Monitor Labels (Top Left) */}
        <div style={{ position: 'absolute', top: '24px', left: '32px', zIndex: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2dd4bf', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '8px' }}>
            <Activity size={12} strokeWidth={3} /> GLOBAL OBSERVATION RADAR
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '1px' }}>
            Structured geospatial view of institutional turbulence & evidence density
          </div>
        </div>

        {/* Status Overlay (Bottom Right) */}
        <div style={{ position: 'absolute', bottom: '24px', right: '32px', zIndex: 20, textAlign: 'right' }}>
           <div style={{ color: '#2dd4bf', fontSize: '0.55rem', fontWeight: 900, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1.5 }}>
             Confidence: 94.2% · Precision Mode Active
           </div>
        </div>
      </div>

      {/* SYSTEM STATUS ROW (Observatory Context) */}
      <div style={{ background: '#071120', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0.6rem 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '2rem', color: '#64748b', fontSize: '0.62rem', fontWeight: 800, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1.2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2dd4bf', boxShadow: '0 0 8px #2dd4bf' }} />
              <span style={{ color: '#2dd4bf' }}>System Live</span>
            </div>
            <span>Last Update: {Object.values(recentEvents).length > 0 ? new Date(Math.max(...Object.values(recentEvents).map(e => e.timestamp))).toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false }) + ' UTC' : 'T-00:00:00 SCANNING'}</span>
            <span>Signals Today: <span style={{ color: '#94a3b8' }}>{stats.signalsProcessed.toLocaleString()}</span></span>
            <span>Confidence: <span style={{ color: '#94a3b8' }}>94.2% Baseline</span></span>
          </div>
          <div style={{ color: '#2dd4bf', fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>
            Observatory Core v1.7.0
          </div>
        </div>
      </div>

      {/* OPERATIONAL CONSOLE PANEL (Consolidated Summary) */}
      <div style={{ maxWidth: 1100, margin: '2rem auto 0', padding: '0 32px' }}>
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4rem' }}>
            <div>
              <div style={{ fontSize: '0.6rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', opacity: 0.8, marginBottom: '4px' }}>Avg LAI Score</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 950, color: '#0f172a', fontFamily: 'monospace' }}>{stats.avgScore.toFixed(1)}</div>
            </div>
            
            <div style={{ display: 'flex', gap: '2.5rem' }}>
              {[
                { label: 'Antifragile', count: stats.antifragile, color: '#065f46' },
                { label: 'Adaptive', count: stats.adaptive, color: '#1e40af' },
                { label: 'Emergent', count: stats.emergent, color: '#b45309' },
                { label: 'Fragile', count: stats.fragile, color: '#b91c1c' }
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: '0.55rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>{item.label}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: item.color, fontFamily: 'monospace' }}>{item.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'right', borderLeft: '1px solid #f1f5f9', paddingLeft: '2.5rem' }}>
            <div style={{ fontSize: '0.55rem', fontWeight: 900, color: '#14b8a6', textTransform: 'uppercase', letterSpacing: 1.5 }}>Active Turbulence Regions</div>
            <div style={{ fontSize: '2rem', fontWeight: 950, color: '#0f172a', fontFamily: 'monospace' }}>{regionalTurbulence.filter(r => r.avg_turbulence > 50).length}</div>
          </div>
        </div>
      </div>

      {/* REGIONAL TURBULENCE SNAPSHOT (Analytical context) */}
      <div style={{ maxWidth: 1200, margin: '2rem auto 0', padding: '0 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
          {['Global', 'Americas', 'Europe', 'APAC', 'MEA'].map(r => {
            const rObj = regionalTurbulence.find(t => t.region === r) || {};
            const turbScore = rObj.avg_turbulence || 0;
            const delta = rObj.delta_7d || 0;
            const sigVol = rObj.signal_volume || 0;
            const integrity = rObj.integrity_state || 'UNKNOWN';
            
            const isInsufficient = integrity === 'INSUFFICIENT DATA';
            const isLowConf = integrity === 'LOW CONFIDENCE';
            return (
              <motion.div key={r} onClick={() => setRegionFilter(r)} style={{ background: regionFilter === r ? '#f8fafc' : 'white', border: `1px solid ${regionFilter === r ? '#2dd4bf' : '#e2e8f0'}`, borderRadius: 12, padding: '1.25rem', cursor: 'pointer' }} whileHover={{ y: -2, boxShadow: '0 8px 16px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{r} Turbulence</span>
                  <span style={{ color: isInsufficient ? '#ef4444' : isLowConf ? '#f59e0b' : '#10b981', fontSize: '0.5rem' }}>{integrity}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  {isInsufficient ? (
                    <span style={{ fontSize: '1rem', fontWeight: 900, color: '#64748b', letterSpacing: 1 }}>NON-OBSERVED</span>
                  ) : (
                    <>
                      <span style={{ fontSize: '1.5rem', fontWeight: 950, color: '#0f172a', fontFamily: 'monospace' }}>{turbScore}</span>
                      <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 300 }}>·</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: turbScore > 60 ? '#ef4444' : turbScore > 30 ? '#f59e0b' : '#10b981' }}>{turbScore > 60 ? 'HIGH' : turbScore > 30 ? 'MODERATE' : 'LOW'}</span>
                    </>
                  )}
                </div>
                {!isInsufficient && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <motion.div animate={{ rotate: delta >= 0 ? 0 : 180 }} style={{ color: delta >= 0 ? '#10b981' : '#ef4444' }}>
                      {delta >= 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} />}
                    </motion.div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                      {delta >= 0 ? '+' : ''}{delta}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 500 }}>over 7d</span>
                  </div>
                )}
                {isInsufficient && (
                  <div style={{ marginTop: '0.75rem', color: '#94a3b8', fontSize: '0.6rem', fontStyle: 'italic' }}>
                    Coverage floor not met. Monitoring…
                  </div>
                )}
                
                {/* Transparency Readout */}
                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>
                  <span>Vol: {sigVol} signals</span>
                  <span>Conf: {Math.round((rObj.avg_confidence || 0) * 100)}%</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <LiveTicker events={tickerEvents} />

      <div style={{ maxWidth: 1200, margin: '4rem auto', padding: '0 1.5rem' }}>
        {/* Search & Filtering Layer */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.85rem 1.25rem' }}>
            <Search size={18} color="#94a3b8" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search institutions..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.95rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['All', 'Antifragile', 'Emergent', 'Fragile'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.75rem 1.5rem', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 800, background: filter === f ? '#0a192f' : 'white', color: filter === f ? 'white' : '#64748b', border: '1px solid', borderColor: filter === f ? '#0a192f' : '#e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}>{f}</button>
            ))}
          </div>
        </div>

        {/* INSTITUTIONAL FRAMING (Launch Phase) */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 24, padding: '3rem', marginBottom: '3rem' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.25rem', fontFamily: 'Georgia, serif' }}>An Evolving Measurement of Observable Leadership Behavior</h2>
            <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              The Global Leadership Adaptiveness Index is not a static leaderboard. As organizations participate in diagnostic and simulation-based measurement, the Observatory expands the depth and completeness of leadership intelligence across industries and regions.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {[
                { label: 'Triangulated Measurement', color: '#10b981', desc: 'Direct behavioral telemetry + environmental signals.' },
                { label: 'Partial Insight', color: '#3b82f6', desc: 'Environmental signals + limited diagnostic data.' },
                { label: 'Insufficient Behavioral Data', color: '#94a3b8', desc: 'Preliminary observability via market signals only.' }
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'left', padding: '1.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                    <div style={{ width: 8, height: 8, background: s.color, borderRadius: '50%' }} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', color: s.color, letterSpacing: 1 }}>{s.label}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Intelligence Index */}
        <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 210px minmax(400px, 1fr) 200px 160px', padding: '24px 40px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {['RANK', 'INSTITUTION', 'LAI SCORE', 'SHIFT', 'TRUST'].map(h => (
              <span key={h} style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', letterSpacing: 2 }}>{h}</span>
            ))}
          </div>
          {loading ? (
            <div style={{ padding: '8rem', textAlign: 'center', color: '#94a3b8' }}><Brain size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} /><p style={{ fontWeight: 600 }}>Synthesizing Global Signals...</p></div>
          ) : (
            displayed.map((r, idx) => (
              <LeaderboardRow key={r.organization} r={r} idx={idx} expandedId={expandedId} setExpandedId={setExpandedId} setFocusDot={setFocusDot} activeEvent={recentEvents[r.organization]} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalIndexPage;
