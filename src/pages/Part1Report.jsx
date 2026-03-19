import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, ShieldCheck, Info, ArrowRight, 
  Activity, Users, Brain, Target, Compass,
  AlertCircle, CheckCircle, Lightbulb, Link as LinkIcon,
  Printer
} from 'lucide-react';
import { supabase } from '../supabase';

const dimensions = [
  { id: 'signal_detection', name: 'Signal Detection', subtitle: 'How early leaders recognize change', desc: 'Ability to detect emerging technological, geopolitical, and market signals.' },
  { id: 'cognitive_framing', name: 'Cognitive Framing', subtitle: 'How leaders interpret change', desc: 'Interpretation of market shifts (Opportunity vs. Threat).' },
  { id: 'decision_alignment', name: 'Decision Alignment', subtitle: 'How leaders converge on decisions', desc: 'Convergence of actions across the simulated system.' },
  { id: 'resource_calibration', name: 'Resource Calibration', subtitle: 'How quickly resources shift', desc: 'Velocity of capital and talent reallocation.' },
  { id: 'integrated_responsiveness', name: 'Integrated Responsiveness', subtitle: 'How strategy becomes action', desc: 'Systemic translation of strategy into behavioral output.' }
];

const summaries = {
  A: {
    headline: "Leaders believe change is recognized and understood, but decision convergence may lag behind awareness.",
    bullets: [
      "Awareness of emerging signals is notably high across the leadership system.",
      "Change is interpreted strategically, but often lacks a unified tactical roadmap.",
      "A visible gap exists between recognition of disruption and coordinated systemic action."
    ],
    risk: "Awareness without coordination creates 'strategic paralysis'—the organization sees the need to change but fails to move as a single unit."
  },
  B: {
    headline: "The leadership system may not yet interpret emerging change with sufficient clarity or shared awareness.",
    bullets: [
      "Detection of weak signals appears inconsistent across varying organizational layers.",
      "The system may be filter-heavy, potentially missing early geopolitical or market shifts.",
      "Strategic response often becomes reactive and fragmented rather than intentional."
    ],
    risk: "Consistent recognition lag means the organization remains optimized for past conditions while new threats materialize unnoticed."
  },
  C: {
    headline: "Leadership appears aligned on direction but may struggle with the velocity of resource reallocation.",
    bullets: [
      "Decision convergence is relatively high, indicating shared strategic intent.",
      "There is strong agreement on the path forward among key decision-makers.",
      "Capital and talent do not yet shift quickly enough to match the speed of decisions."
    ],
    risk: "Alignment without resource mobility creates 'strategy gridlock'—decisions are made but the organizational mass remains anchored to legacy priorities."
  },
  D: {
    headline: "Perception across the five dimensions appears balanced without a dominant strength or constraint.",
    bullets: [
      "Confidence is evenly distributed across the adaptiveness framework.",
      "No single dimension indicates critical systemic failure or exceptional capability.",
      "The leadership system appears stable but potentially optimized for moderate environments."
    ],
    risk: "A balanced profile can mask underlying bottlenecks that only manifest under periods of extreme or non-linear systemic pressure."
  }
};

const getScoreInterpretation = (score) => {
  if (score >= 75) return "strong perceived capability";
  if (score >= 60) return "moderate perceived capability";
  if (score >= 40) return "mixed confidence";
  return "potential structural friction";
};

const getBehavioralText = (id, type) => {
  const map = {
    'signal_detection': {
      shared: "Leaders consistently recognize the same external signals. There is little disagreement on what is happening.",
      divergent: "The team recognizes entirely different external shifts. There is fundamental disagreement on what signals actually matter to the organization."
    },
    'cognitive_framing': {
      shared: "The team shares a common lens for interpreting disruption. Threats and opportunities are framed in the exact same way.",
      divergent: "Leaders are interpreting the same external shifts differently. What one views as an opportunity, another may view as a threat."
    },
    'decision_alignment': {
      shared: "There is unified agreement on how the organization must respond. The team actively coordinates its strategic priorities.",
      divergent: "When action is required, interpretations begin to diverge. Some leaders push urgency, while others maintain the status quo. This creates misalignment in timing, priorities, and ownership."
    },
    'resource_calibration': {
      shared: "Capital, talent, and attention are reallocated systematically. The team aligns heavily on where and when to invest resources to meet the new reality.",
      divergent: "There is significant friction in how resources should be deployed. While the strategy may be agreed upon, disagreements remain regarding budget adjustments and talent distribution."
    },
    'integrated_responsiveness': {
      shared: "Strategy translates cleanly into systemic momentum. The combined actions of the leadership team are creating a unified, agile response.",
      divergent: "The organization’s execution feels disconnected across different divisions. Even if initial decisions align, the implementation is fracturing across the broader system."
    }
  };
  return map[id]?.[type] || "Insufficient data to translate behavioral pattern.";
};

const PrintFooter = ({ reportId }) => (
  <footer className="print-only-persistent-footer">
    <div className="pf-left">LEADERSHIP ADAPTIVENESS INSTITUTE</div>
    <div className="pf-center">CONFIDENTIAL EXECUTIVE INTELLIGENCE</div>
    <div className="pf-right">
      <span className="page-number-display" /> | ID: {reportId}
    </div>
  </footer>
);

const RadarChart = ({ scores, teamScores }) => {
  const size = 400;
  const center = size / 2;
  const radius = size * 0.35;
  const angleStep = (Math.PI * 2) / 5;
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  
  const getPoint = (score, index, r = radius) => {
    const angle = angleStep * index - Math.PI / 2;
    const factor = (score || 0) / 100;
    const x = center + r * factor * Math.cos(angle);
    const y = center + r * factor * Math.sin(angle);
    return { x, y };
  };

  const points = dimensions.map((d, i) => getPoint(scores[d.id], i));
  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');

  const teamPoints = teamScores ? dimensions.map((d, i) => getPoint(teamScores[d.id], i)) : null;
  const teamPointsString = teamPoints ? teamPoints.map(p => `${p.x},${p.y}`).join(' ') : null;

  return (
    <div className="radar-container-brief">
      <svg width="100%" height="auto" viewBox={`0 0 ${size} ${size}`} preserveAspectRatio="xMidYMid meet">
        {gridLevels.map((level, i) => (
          <polygon
            key={i}
            points={dimensions.map((_, j) => {
              const p = getPoint(100, j, radius * level);
              return `${p.x},${p.y}`;
            }).join(' ')}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}
        {dimensions.map((_, i) => {
          const p = getPoint(100, i);
          return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#f1f5f9" strokeWidth="1" />;
        })}
        {teamPointsString && (
          <motion.polygon
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            points={teamPointsString}
            fill="rgba(15, 23, 42, 0.1)"
            stroke="#0f172a"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        )}
        <motion.polygon
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          points={pointsString}
          fill="rgba(20, 184, 166, 0.15)"
          stroke="#14b8a6"
          strokeWidth="3"
        />
        {dimensions.map((d, i) => {
          const p = getPoint(105, i);
          return (
            <text
              key={i} x={p.x} y={p.y} fontSize="10" fontWeight="950" fill="#94a3b8"
              textAnchor="middle" dominantBaseline="middle"
              style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
            >
              {d.name.split(' ').map((word, wi) => (
                <tspan key={wi} x={p.x} dy={wi === 0 ? 0 : 12}>{word}</tspan>
              ))}
            </text>
          );
        })}
      </svg>
      {teamScores && (
        <div className="radar-legend-brief">
          <div className="legend-item"><span className="dot perception" /> Individual</div>
          <div className="legend-item"><span className="dot team" /> Team Avg</div>
        </div>
      )}
    </div>
  );
};

const Part1Report = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState(null);
  const [activeTabs, setActiveTabs] = useState({});
  const [copied, setCopied] = useState(null);

  const reportIdDisplay = useMemo(() => id ? id.substring(0, 8).toUpperCase() : '', [id]);

  const reportLogic = useMemo(() => {
    if (!data) return { scores: {}, team_average_score: 0, summaryPattern: 'D' };

    const scoresObj = {
      signal_detection: data.signal_detection_score || 0,
      cognitive_framing: data.cognitive_framing_score || 0,
      decision_alignment: data.decision_alignment_score || 0,
      resource_calibration: data.resource_calibration_score || 0,
      integrated_responsiveness: data.integrated_responsiveness_score || 0
    };

    const team_avg = teamData?.averages 
      ? Math.round(Object.values(teamData.averages).reduce((a, b) => a + (b || 0), 0) / 5) 
      : 0;

    const pA = scoresObj.signal_detection >= 65 && scoresObj.cognitive_framing >= 65 && scoresObj.decision_alignment <= 50;
    const pB = scoresObj.signal_detection <= 45 && scoresObj.cognitive_framing <= 45;
    const pC = scoresObj.decision_alignment >= 60 && scoresObj.resource_calibration <= 50;
    
    let pattern = 'D';
    if (pA) pattern = 'A';
    else if (pB) pattern = 'B';
    else if (pC) pattern = 'C';

    return { scores: scoresObj, team_average_score: team_avg, summaryPattern: pattern };
  }, [data, teamData]);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/diagnostic/${id}`);
        if (!response.ok) throw new Error('Report not found');
        const report = await response.json();
        setData(report);
        if (report.team_insights) setTeamData(report.team_insights);
      } catch (err) {
        console.error('Report Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  useEffect(() => {
    // Ensure the page always loads at the very top and stays there during hydration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    
    if (data) {
      const timer = setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (loading) return <div className="report-loading">Synthesizing Institutional Profile...</div>;
  if (!data) return (
    <div className="report-error-container">
      <div className="error-card">
        <Activity size={48} className="text-rose mb-4" />
        <h2>Institutional Profile Not Found</h2>
        <p>We were unable to locate this specific perception profile.</p>
        <div className="error-actions">
          <Link to="/diagnostic" className="btn-institutional primary">Take Diagnostic</Link>
          <a href="mailto:support@lai.institute" className="btn-institutional outline">Contact Support</a>
        </div>
        <div className="debug-info">Attempted ID: {id}</div>
      </div>
    </div>
  );

  const { scores, team_average_score, summaryPattern } = reportLogic;
  const teamMemberCount = teamData?.count || 0;
  const showTeamView = teamMemberCount > 0;
  const showVarianceAnalysis = teamMemberCount >= 3;

  const { most_aligned_dimension, most_divergent_dimension } = (() => {
    if (!teamData?.variance || Object.keys(teamData.variance).length === 0) return { most_aligned_dimension: dimensions[0], most_divergent_dimension: dimensions[1] };
    
    // Sort ascending based on explicitly provided numerical diff or fallback categorical strings.
    const sorted = [...dimensions].sort((a, b) => {
      const vA = teamData.variance[a.id];
      const vB = teamData.variance[b.id];
      const diffA = vA?.diff !== undefined ? vA.diff : (typeof vA === 'string' && vA.toLowerCase().includes('low') ? 0 : typeof vA === 'string' && vA.toLowerCase().includes('moderate') ? 3 : 6);
      const diffB = vB?.diff !== undefined ? vB.diff : (typeof vB === 'string' && vB.toLowerCase().includes('low') ? 0 : typeof vB === 'string' && vB.toLowerCase().includes('moderate') ? 3 : 6);
      return diffA - diffB;
    });

    return { 
      most_aligned_dimension: sorted[0], 
      most_divergent_dimension: sorted[sorted.length - 1] 
    };
  })();

  const selectedSummary = summaries[summaryPattern];
  
  let riskSignal = null;
  const hasLowScore = Object.values(scores).some(s => s !== undefined && s !== null && s <= 40);
  const frictionPattern = scores.decision_alignment <= 45 && scores.integrated_responsiveness <= 45;
  const lowVarAlignmentThreshold = showVarianceAnalysis && teamData?.variance && Object.values(teamData.variance).some(v => (v?.diff > 25) || (typeof v === 'string' && v?.toLowerCase()?.includes('high')));

  if (hasLowScore || lowVarAlignmentThreshold || frictionPattern) {
    if (scores.signal_detection <= 40) riskSignal = "Signal Recognition Risk";
    else if (lowVarAlignmentThreshold) riskSignal = "Leadership Alignment Risk";
    else if (scores.resource_calibration <= 40) riskSignal = "Resource Reallocation Risk";
    else if (frictionPattern) riskSignal = "Decision Friction Risk";
    else riskSignal = "Institutional Alignment Risk";
  }

  const toggleTab = (dimId, tab) => {
    setActiveTabs(prev => ({ ...prev, [dimId]: tab }));
  };

  const topInsightsDimensions = (() => {
    if (!teamData?.averages) {
      // Fallback: If no team data exists, show the 3 dimensions with lowest individual score (highest personal risk)
      return [...dimensions].sort((a, b) => (scores[a.id] || 0) - (scores[b.id] || 0)).slice(0, 3);
    }
    // Primary: Sort by highest absolute variance between individual score and team average
    return [...dimensions].sort((a, b) => {
      const deltaA = Math.abs((scores[a.id] || 0) - (teamData.averages[a.id] || 0));
      const deltaB = Math.abs((scores[b.id] || 0) - (teamData.averages[b.id] || 0));
      return deltaB - deltaA; // Descending (highest variance first)
    }).slice(0, 3);
  })();

  return (
    <div className="report-page report-print">
      <div className="report-container">
        {/* 1. INSTITUTIONAL HEADER */}
        <header className="report-header-premium">
          <div className="institution-brand-line">
            <span className="brand-logo">LAI</span>
            <span className="brand-divider">|</span>
            <span className="brand-name">Leadership Adaptiveness Institute</span>
          </div>

          <div className="product-identity-row">
            <span className="product-name">LAI-CORE Diagnostic</span>
            <span className="product-divider">|</span>
            <span className="part-indicator">Part 1 of 2</span>
          </div>

          <div className="report-title-block">
            <h1 className="report-main-title">Leadership Adaptiveness</h1>
            <h2 className="report-subtitle-intelligence">Perception Intelligence Report</h2>
            <p className="report-description-institutional">
              How leadership perceives organizational adaptiveness across the LAI framework.
            </p>
            <div className="confidential-seal">Confidential Executive Intelligence</div>
          </div>

          <div className="header-metadata-grid" style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div className="meta-col">
              <div className="meta-entry"><span className="m-label">Institution</span> <span className="m-val">{data.organization_name}</span></div>
              <div className="meta-entry"><span className="m-label">Participant</span> <span className="m-val">{data.participants?.name || 'Leadership Team Member'}</span></div>
              <div className="meta-entry"><span className="m-label">Leadership Team</span> <span className="m-val">{teamMemberCount} members</span></div>
            </div>
            <div className="meta-col">
              <div className="meta-entry"><span className="m-label">Assessment Date</span> <span className="m-val">{new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
              <div className="meta-entry"><span className="m-label">Report ID</span> <span className="m-val">{id.substring(0, 8).toUpperCase()}</span></div>
            </div>
            <div className="meta-col-actions no-print" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                className="btn-institutional premium-download-btn"
                onClick={() => window.print()}
                style={{ 
                  background: '#0f172a', color: 'white', border: 'none', 
                  padding: '10px 20px', borderRadius: '10px', fontWeight: '700', 
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                  fontSize: '13px', transition: 'all 0.2s', whiteSpace: 'nowrap',
                  width: window.innerWidth < 640 ? '100%' : 'auto',
                  justifyContent: 'center'
                }}
              >
                <Printer size={15} /> Download Report
              </button>
            </div>
          </div>
        </header>

        {/* 2. EXECUTIVE SUMMARY (Rules-Based Pattern Engine) */}
        <section className="report-section summary-box page-section">
          <h2>Executive Summary</h2>
          <div className="summary-grid">
            <div className="summary-bullets">
              <p style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem' }}>
                {selectedSummary.headline}
              </p>
              <ul className="m-bullets">
                {selectedSummary.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
            <div className="primary-risk-card">
              <h4>Primary Risk</h4>
              <p style={{ lineHeight: '1.4' }}>{selectedSummary.risk}</p>
              <p style={{ marginTop: '0.75rem', fontStyle: 'italic', fontSize: '0.85rem', color: '#64748b' }}>
                Perception data indicates a localized friction point that may impede systemic adaptiveness.
              </p>
            </div>
          </div>
        </section>

        {/* 3. LEADERSHIP RISK SIGNAL (CONDITIONAL) */}
        {riskSignal && (
          <section className="report-section risk-signal-section page-section">
            <div className="risk-banner-inner">
               <AlertCircle size={40} className="text-rose" />
               <div style={{ flex: 1 }}>
                  <h3 className="risk-tag">Institutional Alert</h3>
                  <div className="risk-title">{riskSignal}</div>
                  <div className="risk-content-expanded" style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(244, 63, 94, 0.2)', paddingTop: '1.5rem' }}>
                    <p className="risk-desc" style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>
                      Why this matters operationally:
                    </p>
                    <p className="risk-desc" style={{ marginBottom: '1.5rem' }}>
                      {riskSignal === "Decision Friction Risk" && "This pattern occurs when leadership teams recognize change but struggle to converge quickly on coordinated decisions. Awareness of the problem is not the bottleneck—synchronization is."}
                      {riskSignal === "Signal Recognition Risk" && "When early signals are missed, the organization remains optimized for past conditions. This creates a 'blind spot' where threats materialize fully before a response is even conceptualized."}
                      {riskSignal === "Resource Reallocation Risk" && "The organization may be aligned on strategy but anchored by its capital and talent. Without resource mobility, strategic decisions remain theoretical and lack systemic impact."}
                      {riskSignal === "Leadership Alignment Risk" && "Divergent perceptions across the team indicate that operational realities vary significantly by business unit. This fragmentation prevents the organization from responding as a single, coherent system."}
                      {(!riskSignal || !["Decision Friction Risk", "Signal Recognition Risk", "Resource Reallocation Risk", "Leadership Alignment Risk"].includes(riskSignal)) && "A pattern in perception suggests a structural friction point that may impede systemic adaptiveness during periods of rapid environmental shift."}
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <li style={{ fontSize: '0.85rem', color: '#9f1239', fontWeight: '700', padding: '0.5rem', background: 'rgba(244, 63, 94, 0.05)', borderRadius: '6px' }}>• Delayed Strategic Response</li>
                      <li style={{ fontSize: '0.85rem', color: '#9f1239', fontWeight: '700', padding: '0.5rem', background: 'rgba(244, 63, 94, 0.05)', borderRadius: '6px' }}>• Persistence in Outdated Assumptions</li>
                      <li style={{ fontSize: '0.85rem', color: '#9f1239', fontWeight: '700', padding: '0.5rem', background: 'rgba(244, 63, 94, 0.05)', borderRadius: '6px' }}>• Fragmented Regional Execution</li>
                    </ul>
                  </div>
               </div>
            </div>
          </section>
        )}

        {/* 4. LEADERSHIP ADAPTIVENESS RADAR & INVITATION */}
        <section className="report-section profile-section page-section">
          <h2>Leadership Adaptiveness Radar</h2>
          <div className="radar-insight-text">
            How leadership adaptiveness is perceived across the organization. 
            Overlay reflects individual responses compared to the leadership team average where available.
          </div>
          
          <div className="radar-layout-grid-refined">
            <div className="radar-visual-column">
               <RadarChart scores={scores} teamScores={teamData?.averages} />
            </div>
            
            {/* Screen: invitation + interpretation */}
            <div className="invitation-cta-column no-print">
               <div className="team-invitation-block">
                  <h4>Enable Systems Intelligence</h4>
                  <p>Leadership adaptiveness is a collective property. Invite your team to build a shared map of perception.</p>
                  
                   <div className="invite-actions-brief">
                    <button 
                      className="btn-invite" 
                      onClick={() => {
                        const url = `${window.location.origin}/diagnostic?team=${data?.team_code || ''}`;
                        navigator.clipboard.writeText(url);
                        setCopied('team');
                        setTimeout(() => setCopied(null), 2000);
                      }}
                    >
                      {copied === 'team' ? 'Invite Link Copied' : 'Copy Invite Link'}
                    </button>
                    <div className="team-code-display">
                      <span className="code-label">Team Code:</span>
                      <span className="code-value">{data?.team_code || 'LAI-XXXX'}</span>
                    </div>
                  </div>
               </div>

               {showTeamView && (
                 <div className="radar-comparison-callout" style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                    <h4 style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Perception Gap Insight</h4>
                    <p style={{ fontSize: '0.95rem', color: '#0f172a', lineHeight: '1.4', margin: 0 }}>
                      You rated <strong>Decision Alignment</strong> at <strong style={{ color: '#f43f5e' }}>{scores.decision_alignment}</strong>. 
                      The leadership team average is <strong style={{ color: '#14b8a6' }}>{Math.round(teamData?.averages?.decision_alignment || 0)}</strong>.
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                      This variance suggests you may be experiencing decision latency that is not yet visible to the broader team.
                    </p>
                 </div>
               )}

               <div className="interpretation-scale-document-tiny">
                  <h4>Adaptiveness Interpretation</h4>
                  <div className="scale-node"><span className="s-range">80–100</span> <span className="s-label">Strong perceived capability</span></div>
                  <div className="scale-node"><span className="s-range">60–79</span> <span className="s-label">Moderate capability</span></div>
                  <div className="scale-node"><span className="s-range">40–59</span> <span className="s-label">Mixed confidence</span></div>
                  <div className="scale-node s-critical"><span className="s-range">&lt; 40</span> <span className="s-label">Structural friction</span></div>
               </div>
            </div>

            {/* Print-only: informative side panel */}
            <div className="print-linear-only" style={{ display: 'none', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Legend */}
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#475569' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#14b8a6', display: 'inline-block' }} />
                  Individual
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#475569' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px dashed #0f172a', display: 'inline-block' }} />
                  Team Avg
                </div>
              </div>

              {/* Score overview */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#94a3b8', marginBottom: '1rem' }}>Your Scores</div>
                {dimensions.map(d => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>{d.name}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '900', color: scores[d.id] >= 70 ? '#14b8a6' : scores[d.id] >= 50 ? '#f2a93b' : '#f43f5e' }}>
                      {scores[d.id]}
                    </span>
                  </div>
                ))}
              </div>

              {/* Interpretation scale */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#94a3b8', marginBottom: '0.75rem' }}>Score Interpretation</div>
                {[
                  { range: '80–100', label: 'Strong perceived capability', color: '#14b8a6' },
                  { range: '60–79', label: 'Moderate capability', color: '#f2a93b' },
                  { range: '40–59', label: 'Mixed confidence', color: '#f97316' },
                  { range: '< 40',  label: 'Structural friction', color: '#f43f5e' },
                ].map(({ range, label, color }) => (
                  <div key={range} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.35rem 0' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '900', color, minWidth: '48px' }}>{range}</span>
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. DIMENSION INSIGHTS (Two Tab System) */}
        <section className="report-section dimension-insights-section page-section">
           <h2>Dimension Insights</h2>
           <div className="document-insight-grid-phased">
             {topInsightsDimensions.map(dim => {
                const s = scores[dim.id];
                const teamAvg = teamData?.averages?.[dim.id];
                const activeTab = activeTabs[dim.id] || 'your';
                const delta = teamAvg ? s - teamAvg : null;

                const renderYourPerception = () => (
                  <div className="tab-pane-brief">
                    <div className="t-score-indicator">
                      <span className="t-label">Your Score</span>
                      <span className="t-val">{s}</span>
                      <span className="t-desc">({getScoreInterpretation(s)})</span>
                    </div>
                    <p className="t-narrative">
                      {dim.id === 'signal_detection' && (s >= 75 ? "Leaders in this system appear highly confident in recognizing emerging signals. This suggests a proactive stance toward disruption and market shifts." : (s >= 60 ? "Moderate confidence suggests signals are noticed, but not always translated immediately into coordinated action across the system." : "Signals may be present but are not consistently recognized, making the organization reactive rather than anticipatory."))}
                      {dim.id === 'cognitive_framing' && (s >= 75 ? "The leadership system interprets market disruption as a strategic opportunity. This mindset is a critical precursor to adaptiveness." : (s >= 60 ? "There is moderate success in framing uncertainty as opportunity, though some threat-based filters remain at the operational level." : "Disruption is primarily experienced as an operational threat, potentially leading to defensive decision-making under pressure."))}
                      {dim.id === 'decision_alignment' && (s >= 75 ? "Leaders converge quickly on a shared path. This allows for rapid systemic response during environmental shifts." : (s >= 60 ? "Decision latency exists. While leaders agree on direction, the speed of convergence varies across the system." : "Leadership decisions do not converge at the same speed. This fragmentation creates structural latency in responding to change."))}
                      {dim.id === 'resource_calibration' && (s >= 75 ? "Capital and talent move rapidly to match strategic shifts. The organization avoids being anchored to legacy priorities." : (s >= 60 ? "Resource movement is moderate. Legacy commitments occasionally slow down the reallocation of institutional energy." : "Resources are slow to move. The organization may remain optimized for past conditions even after a new direction is set."))}
                      {dim.id === 'integrated_responsiveness' && (s >= 75 ? "Strategic intent is seamlessly translated into operational output. The organization moves as a single, coherent system." : (s >= 60 ? "Functional output is moderate. Strategic decisions occasionally lose momentum before they reach behavioral execution." : "A disconnect exists between strategy and operative output. Decisions are made, but behavior on the ground remains legacy-bound."))}
                    </p>
                  </div>
                );

                const renderTeamPerception = () => (
                  <div className="tab-pane-brief team-tab">
                    <div className="team-stats-row-brief">
                      <div className="t-stat">
                        <span className="ts-label">Team Avg</span>
                        <span className="ts-val">{Math.round(teamAvg)}</span>
                      </div>
                      <div className="t-stat">
                        <span className="ts-label">Your Delta</span>
                        <span className={`ts-val ${Math.abs(delta) > 15 ? highDeltaClass : ''}`}>
                          {delta > 0 ? `+${Math.round(delta)}` : Math.round(delta)}
                        </span>
                      </div>
                    </div>
                    <div className="team-interpretation-box">
                      {Math.abs(delta) < 10 ? (
                        <p>Your perception is <strong>closely aligned</strong> with the leadership team average on this dimension, indicating a shared experience of the current system.</p>
                      ) : delta > 0 ? (
                        <p>You perceive <strong>stronger capability</strong> than the team average. This may indicate confidence that is not yet broadly shared, or that you are experiencing systemic success more directly than others.</p>
                      ) : (
                        <p>You perceive <strong>weaker capability</strong> than the team average. This may indicate a more skeptical reading of the system's current effectiveness, or that you are experiencing friction points that the broader team has not yet identified.</p>
                      )}
                    </div>
                  </div>
                );

                const highDeltaClass = 'high-delta';

                return (
                  <div key={dim.id} className="phased-dim-row">
                    <div className="phased-dim-header">
                       <div className="p-dim-info">
                          <h3>{dim.name}</h3>
                          <span className="p-dim-subtitle">{dim.subtitle}</span>
                       </div>
                       <div className="p-dim-tabs no-print">
                          <button 
                            className={`p-tab ${activeTab === 'your' ? 'active' : ''}`}
                            onClick={() => toggleTab(dim.id, 'your')}
                          >
                            Your Perception
                          </button>
                          {showTeamView && (
                            <button 
                              className={`p-tab ${activeTab === 'team' ? 'active' : ''}`}
                              onClick={() => toggleTab(dim.id, 'team')}
                            >
                              Team Comparison
                            </button>
                          )}
                       </div>
                    </div>

                    <div className="phased-dim-content">
                       {/* Mobile/Screen View: Interactive Tabs */}
                       <div className="screen-tabs-only no-print">
                         {activeTab === 'your' ? renderYourPerception() : renderTeamPerception()}
                       </div>

                       {/* Print View: Linearized Sections */}
                       <div className="print-linear-only" style={{ display: 'none' }}>
                         <div className="print-subheading-label">Individual Perception</div>
                         {renderYourPerception()}
                         
                         {showTeamView && (
                           <div style={{ marginTop: '2rem', borderTop: '1px dashed #e2e8f0', paddingTop: '2rem' }}>
                             <div className="print-subheading-label">Team Alignment Analysis</div>
                             {renderTeamPerception()}
                           </div>
                         )}
                       </div>
                    </div>
                  </div>
                );
             })}
           </div>
        </section>

        {/* 6. LEADERSHIP ALIGNMENT STATUS (Narrative Translation) */}
        {showTeamView && (
          <section className="report-section team-alignment-section page-section">
            <div className="section-header-row-brief" style={{ alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div style={{ marginTop: '0.25rem' }}><Users size={20} /></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ marginBottom: '0.25rem' }}>Leadership Alignment Status (Perceived)</h2>
                <div style={{ fontSize: '0.95rem', color: '#166534', fontWeight: '600' }}>How consistently your leadership team believes it interprets and responds to change.</div>
              </div>
            </div>
            
            <div className="perception-layout-grid-narrative" style={{ display: 'flex', gap: '3rem', alignItems: 'stretch' }}>
               <div className="perception-analysis-col" style={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column' }}>
                  <h3 className="alignment-status-label">
                    {teamData?.variance && Object.values(teamData.variance).some(v => (v?.diff > 25) || (typeof v === 'string' && v?.toLowerCase()?.includes('high'))) 
                      ? "Fragmented Perception" 
                      : (Object.values(teamData?.variance || {}).some(v => (v?.diff > 10) || (typeof v === 'string' && v?.toLowerCase()?.includes('moderate'))) 
                       ? "Mixed Perception" 
                       : "Shared Perception")}
                  </h3>
                  <p className="alignment-description-narrative">
                    {teamData?.variance && Object.values(teamData.variance).some(v => (v?.diff > 25) || (typeof v === 'string' && v?.toLowerCase()?.includes('high'))) 
                      ? "Leadership team members are experiencing the organization’s capability in significantly different ways. This fragmentation often indicates that operational realities vary across different parts of the leadership system."
                      : (Object.values(teamData?.variance || {}).some(v => (v?.diff > 10) || (typeof v === 'string' && v?.toLowerCase()?.includes('moderate')))
                        ? "There is moderate divergence in how leaders experience the system. While shared understanding exists in some areas, key dimensions of adaptiveness are being interpreted differently across the team."
                        : "Leaders share a consistently strong understanding of how the organization responds to change. This alignment is a critical foundation for coordinated action during transitions.")
                    }
                  </p>
                  
                   <div className="shared-divergent-callouts" style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                      <div className="callout-box" style={{ padding: '1.25rem', background: '#f0fdf4', border: '1px solid #bcf0da', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
                         <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#166534', fontWeight: '800', letterSpacing: '0.5px' }}>Most Shared Dimension</span>
                         <h4 style={{ margin: '0.5rem 0', fontSize: '1.1rem', color: '#065f46' }}>{most_aligned_dimension?.name || 'Cognitive Framing'}</h4>
                         <p style={{ fontSize: '0.85rem', color: '#14532d', margin: 0, lineHeight: '1.4' }}>This dimension represents the highest level of perceptual agreement and shared reality within the leadership team.</p>
                      </div>
                      <div className="callout-box" style={{ padding: '1.25rem', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
                         <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9f1239', fontWeight: '800', letterSpacing: '0.5px' }}>Most Divergent Dimension</span>
                         <h4 style={{ margin: '0.5rem 0', fontSize: '1.1rem', color: '#f43f5e' }}>{most_divergent_dimension?.name || 'Decision Alignment'}</h4>
                         <p style={{ fontSize: '0.85rem', color: '#881337', margin: 0, lineHeight: '1.4' }}>This dimension reveals the greatest variance in how adaptiveness is currently being experienced across the system.</p>
                      </div>
                   </div>
               </div>
               
               <div className="perception-stats-summary-col" style={{ flex: '1 1 40%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                       <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Team Avg</div>
                       <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>{team_average_score}</div>
                    </div>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                       <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Participants</div>
                       <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>{teamMemberCount}</div>
                    </div>
                  </div>
                  
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '4px solid #14b8a6', borderRadius: '12px', padding: '1.5rem', marginTop: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <Lightbulb size={18} color="#14b8a6" strokeWidth={2.5} />
                      <div style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: '#14b8a6', letterSpacing: '0.5px' }}>What this suggests</div>
                    </div>
                    <p style={{ fontSize: '0.95rem', color: '#334155', margin: 0, lineHeight: '1.6', fontWeight: '500' }}>
                      {teamData?.variance && Object.values(teamData.variance).some(v => (v?.diff > 10) || (typeof v === 'string' && v.toLowerCase().includes('moderate')))
                        ? "Your leadership team appears aligned in how it sees change — but not necessarily in how it responds to it. This gap often creates systematic execution friction."
                        : "Your leadership team reports high interpretive alignment. The critical next step is verifying if this perception holds true under actual operational pressure."}
                    </p>
                  </div>
               </div>
            </div>

            <div className="alignment-behavioral-narrative" style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid #e2e8f0' }}>
               <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.5rem' }}>What this likely looks like inside your team</h3>
               <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', alignItems: 'flex-start' }}>
                     <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%', background: '#dcfce7', color: '#14b8a6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>+</div>
                     <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: '#14b8a6', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Shared Pattern: {most_aligned_dimension?.name}</div>
                        <div style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.5' }}>
                          {getBehavioralText(most_aligned_dimension?.id, 'shared')}
                        </div>
                     </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', alignItems: 'flex-start' }}>
                     <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%', background: '#fee2e2', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>−</div>
                     <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: '#f43f5e', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Divergent Pattern: {most_divergent_dimension?.name}</div>
                        <div style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.5' }}>
                          {getBehavioralText(most_divergent_dimension?.id, 'divergent')}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="alignment-two-stories" style={{ marginTop: '4rem', background: '#0f172a', borderRadius: '16px', padding: '3rem' }}>
               <h3 style={{ color: 'white', fontSize: '1.75rem', fontWeight: '800', marginBottom: '2rem', textAlign: 'center' }}>Your system is telling two different stories</h3>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #14b8a6' }}>
                     <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px', marginBottom: '0.5rem' }}>You believe</div>
                     <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: '600', lineHeight: '1.4' }}>Your team sees change the exact same way.</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #f43f5e' }}>
                     <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px', marginBottom: '0.5rem' }}>At the same time</div>
                     <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: '600', lineHeight: '1.4' }}>Your team does not align on what to do about it.</div>
                  </div>
               </div>
               <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                 <div style={{ color: '#0ea5e9', fontSize: '1.25rem', fontWeight: '700' }}>Alignment in awareness is not producing alignment in action.</div>
               </div>
            </div>
          </section>
        )}

        {/* 7. INVITE YOUR TEAM (Conditional for small teams) */}
        {teamMemberCount < 3 && data?.team_code && (
          <section className="report-section invite-team-brief page-section no-print">
            <div className="invite-box-institutional" style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '24px', padding: '3rem', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', background: '#f1f5f9', color: '#14b8a6', marginBottom: '1.5rem' }}>
                <Users size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '950', color: '#0f172a', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Build Your Team Benchmark</h3>
              <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '2rem', maxWidth: '500px', marginInline: 'auto' }}>
                Comparison averages and alignment mapping activate when 3+ leaders contribute to this profile.
              </p>
              
              <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: '1.5rem 2rem', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', gap: '2rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Access Code</div>
                  <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', fontFamily: 'monospace', letterSpacing: '0.1em' }}>{data.team_code}</div>
                </div>
                <button 
                  onClick={() => {
                    const url = `${window.location.origin}/diagnostic?team=${data.team_code}`;
                    navigator.clipboard.writeText(url);
                    setCopied('team_invite');
                    setTimeout(() => setCopied(null), 2000);
                  }}
                  style={{ background: '#0f172a', color: 'white', border: 'none', padding: '1rem 1.5rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {copied === 'team_invite' ? <><CheckCircle size={18} color="#14b8a6" /> Copied!</> : <><LinkIcon size={18} /> Copy Invite Link</>}
                </button>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>Invite colleagues to complete their perception diagnostic.</div>
            </div>
          </section>
        )}

        {/* 8 + 9. RESEARCH SIGNAL + NEXT STEP — Unified Storytelling CTA */}
        <section className="report-section page-section no-print" style={{ marginBottom: '3rem' }}>
          <div style={{
            background: '#0f172a',
            borderRadius: '20px',
            padding: '3.5rem 4rem',
            color: 'white'
          }}>

            {/* ── PART 1: Insight → Risk ── */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{
                fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase',
                letterSpacing: '2.5px', color: '#14b8a6', marginBottom: '1.25rem'
              }}>
                🧠 Research Signal
              </div>

              <p style={{ fontSize: '1.35rem', fontWeight: '800', color: 'white', lineHeight: '1.4', marginBottom: '1rem', margin: '0 0 1rem' }}>
                Most leadership teams believe they adapt quickly.<br />
                <span style={{ color: '#94a3b8' }}>Behavioral observation shows they don't.</span>
              </p>

              <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: '1.7', maxWidth: '640px', margin: '0 0 1.5rem' }}>
                When decisions and resources don't realign at the speed of change, strategy begins to drift. Often invisibly. Often before leaders notice.
              </p>

              <div style={{
                borderLeft: '3px solid #475569',
                paddingLeft: '1.25rem',
                color: '#64748b',
                fontSize: '0.95rem',
                fontStyle: 'italic',
                lineHeight: '1.6'
              }}>
                "By the time decisions are acted on, the world has already moved."
              </div>
            </div>

            {/* ── DIVIDER ── */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0 0 2.5rem' }} />

            {/* ── PART 2: Doubt → Decision ── */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{
                fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase',
                letterSpacing: '2.5px', color: '#94a3b8', marginBottom: '1.25rem'
              }}>
                You've seen how your system is perceived
              </div>

              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', lineHeight: '1.5', margin: '0', maxWidth: '560px' }}>
                The question is:<br />
                <span style={{ color: '#e2e8f0' }}>does it behave the same way under pressure?</span>
              </p>
            </div>

            {/* ── CTAS ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '440px' }}>

              {/* Primary CTA */}
              <Link
                to="/intake"
                style={{
                  display: 'block', textAlign: 'center',
                  background: '#14b8a6', color: 'white',
                  padding: '1rem 2rem', borderRadius: '10px',
                  fontWeight: '800', fontSize: '0.95rem',
                  textDecoration: 'none', transition: 'opacity 0.2s',
                  letterSpacing: '0.01em'
                }}
              >
                Run Behavioral Diagnostic
              </Link>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '-0.5rem', paddingLeft: '0.25rem' }}>
                See how your leadership team actually makes decisions under pressure.
              </div>

              {/* Secondary CTA */}
              {data?.team_code && (
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/diagnostic?team=${data.team_code}`;
                    navigator.clipboard.writeText(url);
                    setCopied('cta_invite');
                    setTimeout(() => setCopied(null), 2000);
                  }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'center',
                    background: 'transparent', color: '#e2e8f0',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    padding: '0.875rem 2rem', borderRadius: '10px',
                    fontWeight: '700', fontSize: '0.95rem',
                    cursor: 'pointer', transition: 'border-color 0.2s',
                    letterSpacing: '0.01em'
                  }}
                >
                  {copied === 'cta_invite' ? '✓ Link Copied' : 'Invite Your Leadership Team'}
                </button>
              )}
              {data?.team_code && (
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '-0.5rem', paddingLeft: '0.25rem' }}>
                  Map where perception aligns — and where it breaks.
                </div>
              )}
            </div>

          </div>

          {/* ── UTILITY ROW (outside card) ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '2rem', marginTop: '1.5rem'
          }}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied('report_footer');
                setTimeout(() => setCopied(null), 2000);
              }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8',
                textTransform: 'uppercase', letterSpacing: '1px',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0', transition: 'color 0.2s'
              }}
            >
              <FileText size={14} />
              {copied === 'report_footer' ? 'Link Copied' : 'Share Report'}
            </button>

            <span style={{ color: '#e2e8f0', fontSize: '0.8rem' }}>•</span>

            <button
              onClick={() => window.print()}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8',
                textTransform: 'uppercase', letterSpacing: '1px',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0', transition: 'color 0.2s'
              }}
            >
              <Printer size={14} />
              Download Full Report
            </button>
          </div>
        </section>

        {/* Print version of the Research Signal + CTA with QR code */}
        <section className="report-section page-section print-linear-only" style={{ display: 'none' }}>
          <div style={{
            background: '#0f172a',
            borderRadius: '16px',
            padding: '2.5rem 3rem',
            display: 'flex',
            gap: '3rem',
            alignItems: 'flex-start',
            breakInside: 'avoid'
          }}>

            {/* Left: Research narrative */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.6rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', color: '#14b8a6', marginBottom: '1rem' }}>
                Research Signal
              </div>

              <p style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', lineHeight: '1.4', margin: '0 0 1rem' }}>
                Most leadership teams believe they adapt quickly.<br />
                <span style={{ color: '#94a3b8' }}>Behavioral observation shows they don't.</span>
              </p>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.6', margin: '0 0 1.25rem' }}>
                When decisions and resources don't realign at the speed of change, strategy begins to drift. Often invisibly. Often before leaders notice.
              </p>
              <div style={{ borderLeft: '2px solid #475569', paddingLeft: '1rem', color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                "By the time decisions are acted on, the world has already moved."
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', color: '#94a3b8', marginBottom: '0.75rem' }}>
                  You've seen how your system is perceived
                </div>
                <p style={{ fontSize: '1rem', fontWeight: '700', color: 'white', lineHeight: '1.4', margin: 0 }}>
                  The question is: does it behave the same way under pressure?
                </p>
              </div>
            </div>

            {/* Right: QR Code */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '0.75rem', flexShrink: 0
            }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=ffffff&bgcolor=0f172a&margin=10&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/diagnostic` : 'https://lai.com/diagnostic')}`}
                alt="QR Code: Run Behavioral Diagnostic"
                style={{ width: '160px', height: '160px', borderRadius: '8px' }}
              />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '900', color: '#14b8a6', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.25rem' }}>
                  Run Behavioral Diagnostic
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', lineHeight: '1.4' }}>
                  Scan to test how your leadership<br />team behaves under pressure.
                </div>
              </div>
            </div>

          </div>
        </section>

        <footer className="footer-document no-print">
           <div className="f-left">LEADERSHIP ADAPTIVENESS INSTITUTE</div>
           <div className="f-center">CONFIDENTIAL EXECUTIVE INTELLIGENCE</div>
           <div className="f-right">PAGE X</div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .report-page { background: #f1f5f9; min-height: 100vh; padding: 4rem 2rem; color: #0f172a; font-family: 'Inter', -apple-system, sans-serif; }
        .report-container { 
          width: 900px; margin: 0 auto; background: white; 
          padding: 5rem; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.1);
        }
        
        /* Typography Hierarchy */
        h1 { font-size: 42px; font-weight: 950; margin-bottom: 1.5rem; font-family: 'Georgia', serif; letter-spacing: -0.02em; }
        h2 { font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #0f172a; margin-bottom: 1.5rem; border-bottom: 2px solid #0f172a; padding-bottom: 0.5rem; }
        h3 { font-size: 20px; font-weight: 800; }
        h4 { font-size: 16px; font-weight: 800; color: #0f172a; }

        /* Document Primitives */
        .page-section { break-inside: avoid; page-break-inside: avoid; margin-bottom: 5rem; }
        
        /* Institutional Header Overhaul */
        .report-header-premium { margin-bottom: 5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 4rem; }
        
        .institution-brand-line { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2.5rem; }
        .brand-logo { font-weight: 950; font-size: 1.25rem; letter-spacing: -1px; color: #0f172a; }
        .brand-divider { color: #e2e8f0; font-weight: 300; }
        .brand-name { font-size: 0.9rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }

        .product-identity-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; }
        .product-divider { color: #e2e8f0; }

        .report-title-block { margin-bottom: 4rem; }
        .report-main-title { font-size: 48px !important; font-weight: 950; margin-bottom: 0.75rem !important; margin-top: 0 !important; border: none !important; padding: 0 !important; }
        .report-subtitle-intelligence { font-size: 22px !important; font-weight: 800 !important; color: #14b8a6 !important; text-transform: none !important; letter-spacing: 0 !important; margin-bottom: 1rem !important; border: none !important; padding: 0 !important; }
        .report-description-institutional { font-size: 16px; color: #475569; max-width: 700px; line-height: 1.5; margin-bottom: 1.5rem; }
        .confidential-seal { font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; display: inline-block; padding: 4px 0; border-top: 1px solid #f1f5f9; }

        .header-metadata-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4rem; border-top: 2px solid #0f172a; padding-top: 2rem; margin-top: 1rem; }
        .meta-entry { display: grid; grid-template-columns: 140px 1fr; gap: 1rem; margin-bottom: 0.75rem; font-size: 14px; }
        .m-label { color: #94a3b8; font-weight: 600; }
        .m-val { color: #0f172a; font-weight: 800; }

        /* Typography Hierarchy (Base) */
        .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 32px; max-width: 900px; }
        .summary-grid { display: grid; grid-template-columns: 1fr 280px; gap: 3rem; }
        .m-bullets { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
        .m-bullets li { font-size: 1rem; color: #475569; font-weight: 500; }
        .primary-risk-card { background: white; border: 1px solid #fda4af; padding: 1.5rem; border-radius: 12px; }
        .primary-risk-card h4 { color: #f43f5e; margin: 0 0 0.5rem; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }

        .high-insight { text-align: center; max-width: 800px; margin: 3rem auto; p { font-size: 24px; font-weight: 950; color: #0f172a; line-height: 1.25; } .sub-insight { font-size: 1.1rem; color: #64748b; margin-top: 1rem; } }

        /* Risk Banner */
        .risk-signal-section { background: #fff1f2; border: 1px solid #fda4af; border-radius: 20px; padding: 2.5rem; }
        .risk-banner-inner { display: flex; gap: 1.5rem; align-items: center; }
        .risk-tag { margin: 0; color: #9f1239; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 0.25rem; border: none; }
        .risk-title { font-size: 1.75rem; font-weight: 950; color: #0f172a; letter-spacing: -0.02em; }
        .risk-desc { margin: 0.5rem 0 0; color: #475569; font-size: 0.95rem; }

        /* Radar Section Update */
        .radar-container-brief { width: 100%; display: flex; flex-direction: column; align-items: center; }
        .radar-legend-brief { display: flex; justify-content: center; gap: 2rem; margin-top: 2rem; }
        .legend-item { display: flex; align-items: center; gap: 0.75rem; font-size: 13px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 1px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
        .dot.perception { background: #14b8a6; }
        .dot.team { border: 2px dashed #0f172a; background: rgba(15, 23, 42, 0.1); }

        .radar-insight-text { font-size: 1rem; color: #475569; font-weight: 500; margin-bottom: 2.5rem; max-width: 600px; }
        .radar-layout-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 3rem; align-items: start; }
        
        .interpretation-scale-document { background: #f8fafc; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid #f1f5f9; }
        .interpretation-scale-document h4 { margin: 0 0 1rem; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; }
        .scale-node { display: flex; justify-content: space-between; font-size: 11px; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9; }
        .s-range { font-weight: 800; color: #0f172a; }
        .s-critical { border-left: 2px solid #f43f5e; padding-left: 0.5rem; }

        .document-dim-entry { margin-bottom: 1.5rem; }
        .d-meta { display: flex; justify-content: space-between; margin-bottom: 0.25rem; align-items: flex-end; }
        .d-name { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 1px; }
        .d-score-val { font-size: 18px; font-weight: 950; font-family: monospace; }
        .d-bar-bg { height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
        .d-bar-fill { height: 100%; border-radius: 3px; }

        /* Score States */
        .score-high { color: #14b8a6 !important; } .d-bar-fill.score-high { background: #14b8a6 !important; }
        .score-medium { color: #f2a93b !important; } .d-bar-fill.score-medium { background: #f2a93b !important; }
        .score-low { color: #f43f5e !important; } .d-bar-fill.score-low { background: #f43f5e !important; }

        /* Dimension Insight Grid Update */
        .document-insight-grid { display: flex; flex-direction: column; gap: 3rem; }
        .dim-insight-row { display: grid; grid-template-columns: 80px 1fr; gap: 2rem; align-items: start; }
        .dim-score-col { font-size: 42px; font-weight: 950; line-height: 1; font-family: monospace; text-align: right; }
        .dim-text-col h4 { margin: 0; font-size: 20px; font-weight: 800; }
        .dim-subtitle-brief { font-size: 14px; color: #64748b; display: block; margin-top: 2px; }
        .dim-narrative { margin-top: 1rem; color: #475569; line-height: 1.5; font-size: 15px; }

        .research-insight-brief { background: #0f172a; color: white; padding: 3rem 4rem; border-radius: 20px; max-width: 900px; margin: 0 auto 5rem; }
        .insight-box-m-document h3 { color: #0ea5e9; text-transform: uppercase; font-size: 11px; letter-spacing: 2px; margin-bottom: 1.5rem; border: none; }
        .insight-box-m-document p { font-size: 22px; font-weight: 800; line-height: 1.3; }
        .insight-brief-body { margin-top: 1.5rem; color: #94a3b8; font-size: 16px; line-height: 1.6; max-width: 720px; margin-left: auto; margin-right: auto; }

        .next-stage-brief { max-width: 700px; margin: 0 auto; text-align: center; }
        .n-tag { display: inline-block; padding: 4px 12px; background: #f0fdfa; color: #14b8a6; font-size: 10px; font-weight: 900; text-transform: uppercase; border-radius: 100px; margin-bottom: 1.5rem; }
        .next-stage-brief h3 { font-size: 32px; font-weight: 950; margin-bottom: 1.5rem; }
        .brief-desc { font-size: 16px; color: #475569; margin-bottom: 2.5rem; line-height: 1.6; }
        .sim-focus-grid-document { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem 3rem; text-align: left; margin: 3rem 0; padding: 2rem; background: #f8fafc; border-radius: 16px; }
        .f-item { display: flex; align-items: center; gap: 0.75rem; font-size: 14px; font-weight: 700; color: #475569; }
        .f-dot { width: 6px; height: 6px; background: #14b8a6; border-radius: 50%; }

        /* Document Footer Component */
        .footer-document { border-top: 1px solid #f1f5f9; padding-top: 2rem; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; letter-spacing: 1px; font-weight: 700; }

        /* Pass 1 Logic & Layout Updates */
        .radar-layout-grid-refined { display: grid; grid-template-columns: 1.2fr 1fr; gap: 4rem; align-items: center; }
        .team-invitation-block { background: #0f172a; color: white; padding: 2rem; border-radius: 20px; margin-bottom: 2.5rem; }
        .team-invitation-block h4 { color: #14b8a6; margin: 0 0 0.5rem; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
        .team-invitation-block p { font-size: 0.9rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1.5rem; }
        .invite-actions-brief { display: flex; flex-direction: column; gap: 1rem; }
        .btn-invite { background: #14b8a6; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 14px; }
        .team-code-display { display: flex; justify-content: space-between; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); }
        .team-code-display .code-label { color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .team-code-display .code-value { color: white; font-family: monospace; font-weight: 800; }
        
        .interpretation-scale-document-tiny { padding: 1rem; border-radius: 12px; border: 1px solid #f1f5f9; }
        .interpretation-scale-document-tiny h4 { margin: 0 0 0.75rem; font-size: 10px; text-transform: uppercase; color: #94a3b8; }
        
        /* Dimension Phased Grid */
        .document-insight-grid-phased { display: flex; flex-direction: column; gap: 4rem; }
        .phased-dim-row { background: white; border-bottom: 1px solid #f1f5f9; padding-bottom: 4rem; }
        .phased-dim-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .p-dim-info h3 { font-size: 1.5rem; font-weight: 900; margin: 0; }
        .p-dim-subtitle { font-size: 0.9rem; color: #64748b; }
        .p-dim-tabs { display: flex; background: #f1f5f9; padding: 4px; border-radius: 8px; }
        .p-tab { border: none; background: none; padding: 8px 16px; font-size: 12px; font-weight: 800; cursor: pointer; border-radius: 6px; color: #64748b; transition: all 0.2s; }
        .p-tab.active { background: white; color: #0f172a; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        
        .t-score-indicator { display: flex; align-items: baseline; gap: 0.75rem; margin-bottom: 1rem; }
        .t-label { font-size: 11px; font-weight: 900; text-transform: uppercase; color: #94a3b8; }
        .t-val { font-size: 2rem; font-weight: 950; color: #0f172a; }
        .t-desc { font-size: 0.9rem; font-weight: 700; color: #14b8a6; text-transform: capitalize; }
        .t-narrative { color: #475569; line-height: 1.6; font-size: 1rem; max-width: 700px; }
        
        .team-stats-row-brief { display: flex; gap: 3rem; margin-bottom: 1.5rem; }
        .ts-label { display: block; font-size: 11px; font-weight: 900; text-transform: uppercase; color: #94a3b8; }
        .ts-val { font-size: 2rem; font-weight: 950; color: #0f172a; }
        .ts-val.high-delta { color: #f43f5e; }
        .team-interpretation-box { background: #f8fafc; padding: 1.5rem; border-radius: 12px; border-left: 4px solid #14b8a6; color: #475569; line-height: 1.6; }
        
        /* Alignment Status Refined */
        .perception-layout-grid-narrative { display: grid; grid-template-columns: 2fr 1fr; gap: 4rem; align-items: start; }
        .alignment-status-label { font-size: 2rem !important; font-weight: 950; color: #0f172a; margin-bottom: 1rem !important; margin-top: 0 !important; border: none !important; }
        .alignment-description-narrative { color: #475569; font-size: 1.1rem; line-height: 1.6; margin-bottom: 2.5rem; }
        .most-shared-fragmented-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; border-top: 1px solid #f1f5f9; padding-top: 2rem; }
        .sf-label { display: block; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.5rem; }
        .sf-val { font-size: 1rem; font-weight: 800; color: #0f172a; }
        
        .perception-stats-summary-col { display: flex; flex-direction: column; gap: 1.5rem; }
        .doc-stat-card-lean { background: #f8fafc; border: 1px solid #e2e8f0; padding: 1.5rem; border-radius: 16px; text-align: center; }

        @media screen and (max-width: 900px) {
           .report-container { width: 95%; padding: 2rem; }
           .summary-grid, .radar-layout-grid, .dim-insight-row, .perception-layout-grid { grid-template-columns: 1fr; gap: 2rem; }
           .dim-score-col { text-align: left; font-size: 32px; }
        }

        @media print {
          /* Page setup */
          @page { size: A4 portrait; margin: 18mm 20mm; }

          /* React SPA print isolation: use visibility (overridable by children),
             NOT display:none on body>* which kills the #root element entirely */
          html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden; }
          .report-container, .report-container * { visibility: visible; }
          .report-container {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 2rem !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
          }

          /* Hide all interactive / screen-only UI */
          .no-print,
          nav, .site-header, .site-nav,
          button, a.btn-institutional, .btn-invite,
          .p-dim-tabs, .screen-tabs-only,
          .team-invitation-block, .invite-team-brief,
          .radar-comparison-callout {
            display: none !important;
          }

          /* Show print-only content */
          .print-linear-only { display: block !important; }
          .print-institutional-cta-block { display: block !important; }

          /* Color preservation */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

          /* Preserve background blocks */
          .summary-box { background: #f8fafc !important; }
          .risk-signal-section { background: #fff1f2 !important; }
          .team-interpretation-box { background: #f8fafc !important; }

          /* ── PAGE-BREAK CONTROLS ─────────────────────────── */
          .page-section { page-break-inside: avoid !important; break-inside: avoid !important; }
          .phased-dim-row { page-break-inside: avoid !important; break-inside: avoid !important; }
          h2, h3 { page-break-after: avoid !important; break-after: avoid !important; }

          /* ── 1. RADAR: shrink chart column so radar page fits in one page ── */
          .radar-layout-grid-refined {
            display: grid !important;
            grid-template-columns: 260px 1fr !important;
            gap: 1.5rem !important;
            align-items: start !important;
          }
          .radar-visual-column {
            max-width: 260px !important;
          }
          .radar-container-brief {
            max-width: 260px !important;
          }
          .profile-section { margin-bottom: 2rem !important; }
          .radar-insight-text { font-size: 0.8rem !important; margin-bottom: 0.75rem !important; }
          .profile-section h2 { margin-bottom: 0.75rem !important; }

          /* ── 2. INSTITUTIONAL ALERT: compress so it fits with Executive Summary ── */
          .risk-signal-section {
            background: #fff1f2 !important;
            margin-bottom: 1.5rem !important;
            page-break-before: avoid !important;
            break-before: avoid !important;
          }
          .risk-banner-inner { padding: 1.25rem !important; gap: 1rem !important; }
          .risk-title { font-size: 1.1rem !important; }
          .risk-content-expanded {
            margin-top: 0.75rem !important;
            padding-top: 0.75rem !important;
          }
          .risk-content-expanded ul { gap: 0.5rem !important; }
          .risk-desc { font-size: 0.85rem !important; margin-bottom: 0.75rem !important; }

          /* ── 3. TEAM ALIGNMENT (Fragmented Perception): keep on one page ── */
          .team-alignment-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-before: auto !important;
            break-before: auto !important;
          }
          .perception-layout-grid-narrative {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 1.5rem !important;
          }
          .shared-divergent-callouts {
            grid-template-columns: 1fr 1fr !important;
          }
          .team-alignment-section .page-section { margin-bottom: 1.5rem !important; }

          /* Compress the large internal gaps inside Fragmented Perception */
          .alignment-behavioral-narrative {
            margin-top: 1.25rem !important;
            padding-top: 1rem !important;
          }
          .alignment-behavioral-narrative h3 { font-size: 1rem !important; margin-bottom: 0.75rem !important; }
          .alignment-behavioral-narrative > div > div { padding: 0.75rem !important; gap: 0.75rem !important; }
          
          .alignment-two-stories {
            margin-top: 1rem !important;
            padding: 1.25rem 1.5rem !important;
            border-radius: 10px !important;
          }
          .alignment-two-stories h3 { font-size: 1rem !important; margin-bottom: 0.75rem !important; }
          .alignment-two-stories > div { gap: 0.75rem !important; }
          .alignment-two-stories > div > div { padding: 0.75rem !important; }
          .alignment-two-stories > div:last-child { margin-top: 0.75rem !important; padding-top: 0.75rem !important; }
          .alignment-two-stories > div:last-child > div { font-size: 0.9rem !important; }

          /* Compress shared/divergent callouts */
          .callout-box { padding: 0.75rem !important; }
          .callout-box h4 { font-size: 0.9rem !important; margin: 0.25rem 0 !important; }
          .callout-box p { font-size: 0.75rem !important; }

          /* Print subheading label */
          .print-subheading-label {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 800;
            color: #94a3b8;
            margin-bottom: 0.75rem;
            display: block;
          }

          /* Footer */
          .footer-document { display: flex !important; }
          .print-only-persistent-footer { display: flex !important; }
        }

        .print-only-persistent-footer { display: none; }
      `}} />
      <PrintFooter reportId={reportIdDisplay} />
    </div>
  );
};

export default Part1Report;
