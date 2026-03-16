import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, ShieldCheck, Info, ArrowRight, 
  Activity, Users, Brain, Target, Compass,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../supabase';

const dimensions = [
  { id: 'signal_detection', name: 'Signal Detection', subtitle: 'How early leaders recognize change', desc: 'Ability to detect emerging technological, geopolitical, and market signals.' },
  { id: 'cognitive_framing', name: 'Cognitive Framing', subtitle: 'How leaders interpret change', desc: 'Interpretation of market shifts (Opportunity vs. Threat).' },
  { id: 'decision_alignment', name: 'Decision Alignment', subtitle: 'How leaders converge on decisions', desc: 'Convergence of actions across the simulated system.' },
  { id: 'resource_calibration', name: 'Resource Calibration', subtitle: 'How quickly resources shift', desc: 'Velocity of capital and talent reallocation.' },
  { id: 'integrated_responsiveness', name: 'Integrated Responsiveness', subtitle: 'How strategy becomes action', desc: 'Systemic translation of strategy into behavioral output.' }
];

const RadarChart = ({ scores, teamScores }) => {
  const size = 300;
  const center = size / 2;
  const radius = size * 0.4;
  const angleStep = (Math.PI * 2) / 5;

  // Grid levels
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
    <div className="radar-container">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid lines */}
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
        
        {/* Axis lines */}
        {dimensions.map((_, i) => {
          const p = getPoint(100, i);
          return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#f1f5f9" strokeWidth="1" />;
        })}

        {/* Team Average Area (Backend Layer) */}
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

        {/* Individual Data Area (Fore Layer) */}
        <motion.polygon
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          points={pointsString}
          fill="rgba(20, 184, 166, 0.2)"
          stroke="#14b8a6"
          strokeWidth="3"
        />

        {/* Labels */}
        {dimensions.map((d, i) => {
          const p = getPoint(120, i);
          return (
            <text
              key={i} x={p.x} y={p.y} fontSize="8" fontWeight="800" fill="#94a3b8"
              textAnchor="middle" dominantBaseline="middle" className="radar-label"
              style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
            >
              {d.name.split(' ').map((word, wi) => <tspan key={wi} x={p.x} dy={wi === 0 ? 0 : 10}>{word}</tspan>)}
            </text>
          );
        })}
      </svg>
      {teamScores && (
        <div className="radar-legend">
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

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/diagnostic/${id}`);
        if (!response.ok) throw new Error('Report not found');
        const report = await response.json();
        setData(report);

        if (report.team_insights) {
          setTeamData(report.team_insights);
        }
      } catch (err) {
        console.error('Report Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) return <div className="report-loading">Synthesizing Institutional Profile...</div>;
  if (!data) return (
    <div className="report-error-container">
      <div className="error-card">
        <Activity size={48} className="text-rose mb-4" />
        <h2>Institutional Profile Not Found</h2>
        <p>We were unable to locate this specific perception profile. This may occur if the session expired or the record is still being synchronized.</p>
        <div className="error-actions">
          <Link to="/diagnostic" className="btn-institutional primary">Take Diagnostic</Link>
          <a href="mailto:support@lai.institute" className="btn-institutional outline">Contact Support</a>
        </div>
        <div className="debug-info">
          Attempted ID: {id}
        </div>
      </div>
      <style jsx>{`
        .report-error-container { 
          min-height: 100vh; display: flex; align-items: center; justify-content: center; 
          background: #f8fafc; padding: 2rem;
        }
        .error-card { 
          background: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 4rem; 
          max-width: 600px; text-align: center; box-shadow: 0 40px 100px -20px rgba(0,0,0,0.05);
        }
        .text-rose { color: #f43f5e; }
        .mb-4 { margin-bottom: 1rem; }
        h2 { font-size: 2rem; font-weight: 900; color: #0f172a; margin-bottom: 1rem; }
        p { color: #64748b; margin-bottom: 2rem; line-height: 1.6; }
        .error-actions { display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem; }
        .debug-info { font-size: 0.7rem; color: #94a3b8; font-family: monospace; border-top: 1px solid #f1f5f9; pt: 1rem; }
      `}</style>
    </div>
  );

  const scores = {
    signal_detection: data.signal_detection_score,
    cognitive_framing: data.cognitive_framing_score,
    decision_alignment: data.decision_alignment_score,
    resource_calibration: data.resource_calibration_score,
    integrated_responsiveness: data.integrated_responsiveness_score
  };

  // --- DYNAMIC VARIABLE ENGINE ---
  const sortedDims = [...dimensions].sort((a, b) => scores[b.id] - scores[a.id]);
  const highest_dimension = sortedDims[0];
  const lowest_dimension = sortedDims[dimensions.length - 1];
  const average_score = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / dimensions.length);

  // Team Derived Variables
  const teamMemberCount = teamData?.count || 0;
  const showTeamView = teamMemberCount > 0;
  const showVarianceAnalysis = teamMemberCount >= 3;
  
  let most_aligned_dimension = null;
  let most_divergent_dimension = null;
  let team_average_score = 0;

  if (showTeamView) {
    const teamAverages = teamData.averages;
    const sortedTeamAverages = [...dimensions].sort((a, b) => teamAverages[b.id] - teamAverages[a.id]);
    team_average_score = Math.round(Object.values(teamAverages).reduce((a, b) => a + b, 0) / dimensions.length);

    if (teamData.variance) {
      const varianceEntries = Object.entries(teamData.variance);
      if (varianceEntries.length > 0) {
        most_aligned_dimension = dimensions.find(d => d.id === varianceEntries.sort((a, b) => {
          const levels = { 'LOW': 0, 'MODERATE': 1, 'HIGH': 2 };
          return levels[a[1]] - levels[b[1]];
        })[0][0]);
        most_divergent_dimension = dimensions.find(d => d.id === varianceEntries.sort((a, b) => {
          const levels = { 'LOW': 0, 'MODERATE': 1, 'HIGH': 2 };
          return levels[b[1]] - levels[a[1]];
        })[0][0]);
      }
    }
  }

  // Leadership Risk Signal Logic
  let riskSignal = null;
  const hasLowScore = Object.values(scores).some(s => s <= 40);
  const hasHighVariance = showVarianceAnalysis && teamData?.variance && Object.values(teamData.variance).some(v => v === 'HIGH');
  const combinedFriction = scores.decision_alignment <= 50 && scores.integrated_responsiveness <= 50;

  if (hasLowScore || hasHighVariance || combinedFriction) {
    if (scores.signal_detection <= 40) riskSignal = "Signal Recognition Risk";
    else if (hasHighVariance) riskSignal = "Alignment Variance Risk";
    else if (combinedFriction) riskSignal = "Execution Friction Risk";
    else if (scores.resource_calibration <= 40) riskSignal = "Resource Reallocation Risk";
    else riskSignal = "Decision Friction Risk";
  }

  // --- RENDER HELPERS ---
  const getDimInterpretation = (id, score) => {
    const interpretations = {
      signal_detection: "Leaders scoring higher in Signal Detection tend to perceive emerging market and technological shifts earlier. Lower scores may indicate that signals are present but not consistently recognized across the leadership system.",
      cognitive_framing: "Cognitive Framing reflects how leaders interpret change. Leadership systems with stronger framing often translate external disruptions into strategic opportunity rather than operational threat.",
      decision_alignment: "Decision Alignment reflects the perceived convergence of leadership decisions once a signal is recognized. Lower perceived alignment often indicates that strategic intent and operational decisions are not experienced consistently across the leadership system.",
      resource_calibration: "Resource Calibration reflects how rapidly leaders believe capital, talent, and operational capacity can be redirected when conditions change.",
      integrated_responsiveness: "Integrated Responsiveness reflects how effectively strategy translates into coordinated execution across the organization."
    };
    return interpretations[id];
  };

  return (
    <div className="report-page">
      <div className="report-container">
        {/* 1. HEADER */}
        <header className="report-header">
          <div className="institutional-box">
             <div className="lai-logo">LAI</div>
             <div className="line" />
             <div className="report-type">LAI-CORE [Part 1 of 2]</div>
          </div>
          <h1>Leadership Adaptiveness Profile</h1>
          <div className="meta-row">
            <span>Institution: <strong>{data.organization_name}</strong></span>
            <span>Date: <strong>{new Date(data.created_at).toLocaleDateString()}</strong></span>
            <span>Report ID: <strong>{id.substring(0, 8)}</strong></span>
          </div>
          <div className="meta-row" style={{ marginTop: '0.5rem' }}>
            <span>Participant: <strong>{data.participants?.name || 'Leadership Team Member'}</strong></span>
            {showTeamView && <span>Leadership Team Participants: <strong>{teamMemberCount}</strong></span>}
          </div>
        </header>

        {/* 2. EXECUTIVE SUMMARY */}
        <section className="report-section summary-box">
          <h2>Executive Summary</h2>
          <div className="summary-grid">
            <div className="summary-bullets">
              <p style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.5rem' }}>
                Your leadership team shows <span className="text-teal">strong awareness of change</span>, but <span className="text-rose">decision alignment is significantly weaker</span>.
              </p>
              <ul className="m-bullets">
                <li>• Leaders detect external signals relatively well</li>
                <li>• Leaders interpret change constructively</li>
                <li>• Leadership decisions do not converge at the same speed</li>
              </ul>
            </div>
            <div className="primary-risk-card">
              <h4>Primary Risk</h4>
              <p>Your organization may recognize change early but struggle to <strong>translate that awareness into aligned decisions and resource shifts.</strong></p>
              <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>When this gap appears, organizations often continue executing strategies built on outdated assumptions.</p>
            </div>
          </div>
        </section>

        {/* 3. KEY INSIGHT */}
        <section className="report-section insight-sentence">
           <div className="high-insight">
             <p>Your leadership system <strong>interprets change well</strong> but <strong>struggles to align decisions quickly</strong> once change is recognized.</p>
             <p className="sub-insight">This pattern often produces decision friction during periods of rapid market shift.</p>
           </div>
        </section>

        {/* 3. LEADERSHIP RISK SIGNAL (CONDITIONAL) */}
        {riskSignal && (
          <section className="report-section risk-signal-section" style={{ background: '#fff1f2', border: '1px solid #fda4af', padding: '2.5rem', borderRadius: '20px', marginBottom: '4rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
               <AlertCircle size={32} className="text-rose" />
               <div>
                  <h3 style={{ margin: 0, color: '#9f1239', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Critical Observation</h3>
                  <div style={{ fontSize: '1.75rem', fontWeight: '950', color: '#0f172a', letterSpacing: '-0.02em' }}>{riskSignal}</div>
                  <p style={{ margin: '0.75rem 0 0', color: '#475569', fontSize: '0.95rem' }}>
                    A pattern in the perception data suggests a localized friction point that may impede systemic adaptiveness during periods of rapid environmental shift.
                  </p>
               </div>
            </div>
          </section>
        )}

        {/* 4. ADAPTIVENESS PROFILE */}
        <section className="report-section profile-section">
          <div className="chart-area">
             <h2>Leadership Adaptiveness Radar</h2>
             <p style={{ marginBottom: '2rem', fontSize: '1rem', color: '#475569', fontWeight: '500' }}>This chart shows how your leadership team performs across five dimensions of adaptiveness.</p>
             <div className="chart-flex-box">
                <RadarChart scores={scores} teamScores={teamData?.averages} />
                <div className="interpretation-scale">
                   <h4>Adaptiveness Scale</h4>
                   <div className="scale-node"><span className="s-range">80–100</span> <span className="s-label">Highly adaptive</span></div>
                   <div className="scale-node"><span className="s-range">60–79</span> <span className="s-label">Moderately adaptive</span></div>
                   <div className="scale-node"><span className="s-range">40–59</span> <span className="s-label">Constraints emerging</span></div>
                   <div className="scale-node"><span className="s-range">&lt; 40</span> <span className="s-label">High friction risk</span></div>
                </div>
             </div>
             <p className="chart-caption">Overlay reflects individual responses compared to the leadership team average.</p>
          </div>
          
          <div className="dimension-list">
             {dimensions.map(dim => (
               <div key={dim.id} className="dim-card-report">
                  <div className="dim-header">
                    <div>
                      <span className="dim-name">{dim.name}</span>
                      <div className="dim-subtitle-text">{dim.subtitle}</div>
                    </div>
                    <span className="dim-score" style={{ color: scores[dim.id] >= 75 ? '#14b8a6' : (scores[dim.id] <= 40 ? '#f43f5e' : '#14b8a6') }}>
                      {scores[dim.id]}
                    </span>
                  </div>
                  <div className="dim-bar">
                    <div className="fill" style={{ width: `${scores[dim.id]}%`, background: scores[dim.id] <= 40 ? '#f43f5e' : '#14b8a6' }} />
                  </div>
               </div>
             ))}
          </div>
        </section>

        {/* 5. DIMENSION INSIGHTS */}
        <section className="report-section detail-grid">
           <h2>Dimension Insights</h2>
           <div className="i-grid">
             {dimensions.map(dim => (
               <div key={dim.id} className="i-node">
                 <div className="i-header">
                    <div className="i-num">{scores[dim.id]}</div>
                    <div className="i-title-box">
                       <h4>{dim.name}</h4>
                       <span className="i-subtitle">{dim.subtitle}</span>
                    </div>
                 </div>
                 <div className="i-body">
                    <p>{dim.id === 'signal_detection' && (scores[dim.id] >= 60 ? "Leaders appear reasonably capable of detecting emerging signals in the market or environment." : "Signals exist, but are not consistently recognized across the leadership system.")}</p>
                    <p>{dim.id === 'cognitive_framing' && (scores[dim.id] >= 70 ? "Leaders generally interpret disruption as something that can be addressed strategically, translating uncertainty into opportunity." : "Disruption may be perceived primarily as an operational threat, limiting strategic experimentation.")}</p>
                    <p>{dim.id === 'decision_alignment' && (scores[dim.id] <= 40 ? "Lower alignment suggests that once signals are recognized, leaders may not reach decisions at the same speed. This often creates delayed responses and competing priorities." : "Leadership decisions appear to converge effectively once a signal is recognized.")}</p>
                    <p>{dim.id === 'resource_calibration' && "This dimension reflects how rapidly capital, talent, and operational capacity can be redirected when conditions change."}</p>
                    <p>{dim.id === 'integrated_responsiveness' && "Integrated responsiveness reflects whether leadership decisions convert into coordinated execution across teams."}</p>
                 </div>
               </div>
             ))}
           </div>
        </section>

        {/* 6. LEADERSHIP SYSTEM PERCEPTION (TEAM ONLY) */}
        {showTeamView && (
          <section className="report-section team-section">
            <div className="section-header-row">
              <Users size={20} />
              <h2>Leadership System Perception</h2>
            </div>
            <p>Aggregated results from <strong>{teamMemberCount}</strong> leadership team members.</p>
            
            <div className="team-insights-grid">
               <div className="comparison-card">
                  <h4>Team Alignment Status</h4>
                  <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>
                    {teamData.variance && Object.values(teamData.variance).some(v => v === 'HIGH') ? "Fragmented leadership perception" : (Object.values(teamData.variance || {}).some(v => v === 'MODERATE') ? "Mixed leadership perception" : "Strong shared perception")}
                  </p>
                  <p>
                    {hasHighVariance 
                      ? "Leadership team members are experiencing the decision system differently, which may create friction during rapid transitions."
                      : "This suggests leaders share a similar understanding of how the organization currently responds to change."}
                  </p>
                  
                  {showVarianceAnalysis ? (
                    <div className="variance-table-wrap" style={{ marginTop: '2rem' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ textAlign: 'left', borderBottom: '2px solid #0f172a' }}>
                            <th style={{ padding: '0.75rem 0' }}>Dimension</th>
                            <th style={{ padding: '0.75rem 0' }}>Variance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dimensions.map(dim => (
                            <tr key={dim.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '1rem 0', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem' }}>{dim.name}</td>
                              <td style={{ padding: '1rem 0' }}>
                                <span className={`v-status ${teamData.variance[dim.id]?.toLowerCase()}`}>
                                  {teamData.variance[dim.id]}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="variance-threshold-message" style={{ marginTop: '2rem' }}>
                      <Info size={14} /> Alignment variance analysis activates after 3 team members complete the assessment.
                    </div>
                  )}
               </div>
               
               <div className="team-stats">
                  <div className="stat-node">
                     <div className="s-label">Team Avg Score</div>
                     <div className="s-value">{team_average_score}</div>
                  </div>
                  <div className="stat-node">
                     <div className="s-label">Participants</div>
                     <div className="s-value">{teamMemberCount}</div>
                  </div>
               </div>
            </div>
          </section>
        )}

        {/* 8. RESEARCH INSIGHT */}
        <section className="report-section research-insight-compact">
           <div className="insight-box-m">
              <h3>Research Insight</h3>
              <p>Most leadership teams believe they adapt quickly. <strong>Behavioral observation often shows the opposite.</strong></p>
              <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Signals are detected faster than decisions and resources can realign. Understanding perception is the first step in measuring how the system actually behaves.</p>
           </div>
        </section>

        {/* 9. RECOMMENDED NEXT MEASUREMENT STEP */}
        <section className="report-section next-stage-polish">
            <div className="next-stage-brief">
               <div className="n-tag">Natural Progression</div>
               <h3>Next Step: Behavioral Observation</h3>
               <p>
                  This report measures <strong>how your leadership team perceives itself</strong>. The next stage measures <strong>how leadership decisions actually unfold under pressure</strong> through structured simulation.
               </p>
               <div className="sim-focus-grid">
                  <div className="f-item"><div className="f-dot" /> Signal recognition speed</div>
                  <div className="f-item"><div className="f-dot" /> Decision convergence</div>
                  <div className="f-item"><div className="f-dot" /> Resource reallocation</div>
                  <div className="f-item"><div className="f-dot" /> Systemic responsiveness</div>
               </div>
               <div className="stage-actions">
                  <Link to="/how-measured" className="btn-institutional primary">Begin Behavioral Diagnostic</Link>
                  <button className="btn-institutional outline" onClick={() => window.print()}>Download Brief</button>
               </div>
            </div>
        </section>

        <footer className="report-footer">
          <div className="footer-logo">LEADERSHIP ADAPTIVENESS INSTITUTE</div>
          <div className="legal">CONFIDENTIAL · EXECUTIVE INTELLIGENCE · © {new Date().getFullYear()} LAI</div>
        </footer>
      </div>

      <style jsx>{`
        .report-page { background: #f1f5f9; min-height: 100vh; padding: 4rem 2rem; color: #0f172a; }
        .report-container { 
          max-width: 900px; margin: 0 auto; background: white; 
          padding: 5rem; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.1);
        }
        
        /* Header */
        .report-header { border-bottom: 2px solid #0f172a; padding-bottom: 2rem; margin-bottom: 4rem; }
        .institutional-box { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
        .lai-logo { font-weight: 900; font-size: 1.25rem; letter-spacing: -1px; }
        .institutional-box .line { width: 1px; height: 20px; background: #e2e8f0; }
        .report-type { font-size: 0.65rem; font-weight: 800; letter-spacing: 2px; color: #94a3b8; }
        
        h1 { font-size: 2.75rem; font-weight: 950; margin-bottom: 1.5rem; font-family: 'Georgia', serif; }
        .meta-row { display: flex; gap: 3rem; font-size: 0.8rem; color: #64748b; }
        .meta-row strong { color: #0f172a; }

        /* Sections */
        .report-section { margin-bottom: 5rem; }
        h2 { font-size: 1.25rem; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #0f172a; margin-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem; }
        
        .overview-content { max-width: 650px; }
        .overview-content p { font-size: 1.1rem; line-height: 1.6; color: #475569; }
        
        .insight-callout { 
          margin-top: 2rem; padding: 1.5rem; background: #f8fafc; border-left: 3px solid #14b8a6;
          display: flex; gap: 1rem;
        }
        .insight-callout p { margin: 0; font-size: 0.95rem; font-style: italic; color: #64748b; }

        /* Profile Section */
        .profile-section { display: grid; grid-template-columns: 350px 1fr; gap: 4rem; align-items: center; }
        .chart-area { text-align: center; }
        .radar-legend { display: flex; justify-content: center; gap: 2rem; margin-top: 2rem; }
        .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #64748b; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.perception { background: #14b8a6; }
        .dot.team { background: #0f172a; border: 1px dashed #0f172a; }

        .chart-caption { font-size: 0.75rem; color: #94a3b8; font-style: italic; }
        
        .dimension-list { display: flex; flex-direction: column; gap: 1.5rem; }
        .dim-card-report { padding: 1.5rem; border: 1px solid #f1f5f9; border-radius: 12px; }
        .dim-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .dim-name { font-weight: 900; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
        .dim-score { font-size: 1.25rem; font-weight: 900; font-family: monospace; color: #14b8a6; }
        .dim-desc { font-size: 0.8rem; color: #64748b; margin-bottom: 1rem; }
        .dim-bar { height: 4px; background: #f1f5f9; border-radius: 2px; }
        .dim-bar .fill { height: 100%; background: #14b8a6; border-radius: 2px; }

        /* Team Section */
        .section-header-row { display: flex; align-items: center; gap: 1rem; color: #14b8a6; margin-bottom: 1rem; }
        .section-header-row h2 { flex: 1; border: none; margin: 0; }
        .team-insights-grid { display: grid; grid-template-columns: 1fr 200px; gap: 2rem; margin-top: 2rem; }
        .comparison-card { background: #f8fafc; padding: 2.5rem; border-radius: 20px; h4 { margin-top: 0; font-size: 1.1rem; } }
        
        .variance-list { margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem; }
        .variance-item { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
        .v-dim { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; }
        .v-status { font-size: 0.8rem; font-weight: 900; }
        .v-status.high { color: #f43f5e; }
        .v-status.low { color: #10b981; }
        
        .variance-threshold-message { margin-top: 2rem; padding: 1rem; background: #f1f5f9; border-radius: 8px; font-size: 0.8rem; color: #64748b; display: flex; gap: 0.5rem; align-items: center; }

        .team-stats { display: flex; flex-direction: column; gap: 1.5rem; }
        .stat-node { background: #0f172a; color: white; padding: 1.5rem; border-radius: 16px; text-align: center; }
        .s-label { font-size: 0.6rem; color: #94a3b8; font-weight: 800; letter-spacing: 2px; margin-bottom: 0.5rem; text-transform: uppercase; }
        .s-value { font-size: 2rem; font-weight: 900; font-family: monospace; }

        /* Research Insight */
        .research-insight { background: #0f172a; color: white; padding: 3rem; border-radius: 24px; }
        .insight-grid { display: flex; gap: 2.5rem; align-items: center; }
        .i-icon { color: #14b8a6; }
        .i-text h3 { color: white; margin-top: 0; font-size: 1.25rem; margin-bottom: 1rem; }
        .i-text p { color: #94a3b8; line-height: 1.6; margin: 0; }

        /* Next Stage */
        .next-stage-box { border: 2px solid #f1f5f9; border-radius: 24px; padding: 3rem; }
        .n-header { display: flex; align-items: center; gap: 1rem; color: #14b8a6; margin-bottom: 1.5rem; }
        .n-header h3 { margin: 0; font-size: 1.5rem; color: #0f172a; }
        .next-stage-box p { font-size: 1rem; line-height: 1.6; color: #475569; margin-bottom: 2.5rem; }
        .stage-actions { display: flex; gap: 1.5rem; }

        /* Footer */
        .report-footer { border-top: 1px solid #f1f5f9; padding-top: 3rem; display: flex; justify-content: space-between; align-items: center; }
        .footer-logo { font-size: 0.75rem; font-weight: 900; letter-spacing: 1.5px; }
        .legal { font-size: 0.6rem; color: #cbd5e1; font-weight: 800; }
        /* McKinsey Refinements */
        .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 24px; padding: 3rem; }
        .summary-grid { display: grid; grid-template-columns: 1fr 300px; gap: 4rem; }
        .m-bullets { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; }
        .m-bullets li { font-size: 1rem; color: #475569; font-weight: 500; }
        .primary-risk-card { background: white; border: 1px solid #fda4af; padding: 2rem; border-radius: 16px; h4 { color: #f43f5e; margin-top: 0; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px; } }

        .high-insight { text-align: center; max-width: 800px; margin: 4rem auto; p { font-size: 1.75rem; font-weight: 950; color: #0f172a; line-height: 1.2; } .sub-insight { font-size: 1.1rem; color: #64748b; font-weight: 400; margin-top: 1rem; } }

        .chart-flex-box { display: flex; align-items: center; gap: 4rem; justify-content: center; margin-bottom: 2rem; }
        .interpretation-scale { background: #f8fafc; padding: 1.5rem; border-radius: 12px; min-width: 220px; }
        .interpretation-scale h4 { margin-top: 0; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 1rem; }
        .scale-node { display: flex; justify-content: space-between; font-size: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9; }
        .s-range { font-weight: 800; color: #0f172a; }
        .s-label { color: #64748b; }

        .dim-subtitle-text { font-size: 0.7rem; color: #64748b; font-weight: 400; text-transform: none; letter-spacing: 0; margin-top: 2px; }

        .i-grid { display: grid; gap: 3rem; }
        .i-node { display: grid; grid-template-columns: 80px 1fr; gap: 2rem; }
        .i-header { display: flex; gap: 1.5rem; align-items: flex-start; }
        .i-num { font-size: 2.5rem; font-weight: 950; color: #14b8a6; line-height: 1; font-family: monospace; }
        .i-title-box h4 { margin: 0; font-size: 1.25rem; font-weight: 800; }
        .i-subtitle { font-size: 0.85rem; color: #64748b; }
        .i-body p { margin-top: 1rem; color: #475569; line-height: 1.6; }

        .research-insight-compact { background: #0f172a; color: white; padding: 4rem; border-radius: 24px; text-align: center; }
        .insight-box-m h3 { color: #14b8a6; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 2px; margin-bottom: 1.5rem; }
        .insight-box-m p { font-size: 1.5rem; font-weight: 800; line-height: 1.3; }

        .next-stage-polish { border-top: 2px solid #f1f5f9; padding-top: 5rem; }
        .next-stage-brief { max-width: 700px; margin: 0 auto; text-align: center; }
        .n-tag { display: inline-block; padding: 0.25rem 0.75rem; background: #f0fdfa; color: #14b8a6; font-size: 0.65rem; font-weight: 900; text-transform: uppercase; border-radius: 100px; margin-bottom: 1.5rem; }
        .next-stage-brief h3 { font-size: 2.25rem; font-weight: 950; margin-bottom: 1.5rem; }
        .sim-focus-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem 3rem; text-align: left; margin: 3rem 0; padding: 2rem; background: #f8fafc; border-radius: 16px; }
        .f-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; font-weight: 600; color: #475569; }
        .f-dot { width: 6px; height: 6px; background: #14b8a6; border-radius: 50%; }

        @media (max-width: 768px) {
          .summary-grid { grid-template-columns: 1fr; gap: 2rem; }
          .chart-flex-box { flex-direction: column; }
          .i-node { grid-template-columns: 1fr; gap: 1rem; }
        }

        @media print {
          .summary-box { background: #f8fafc !important; -webkit-print-color-adjust: exact; }
          .research-insight-compact { background: #0f172a !important; -webkit-print-color-adjust: exact; }
          .primary-risk-card { border: 1px solid #fda4af !important; -webkit-print-color-adjust: exact; }
          .sim-focus-grid { background: #f8fafc !important; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
};

export default Part1Report;
