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
  const size = 400; // Increased size to provide more room for labels
  const center = size / 2;
  const radius = size * 0.35; // Slightly reduced radius ratio for padding
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
        {/* Grid levels */}
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

        {/* Team Average Area */}
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

        {/* Individual Data Area */}
        <motion.polygon
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          points={pointsString}
          fill="rgba(20, 184, 166, 0.2)"
          stroke="#14b8a6"
          strokeWidth="3"
        />

        {/* Labels with improved positioning */}
        {dimensions.map((d, i) => {
          const p = getPoint(105, i); // Bring labels in more to prevent cutting
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
              How you and your leadership team perceive your organization’s adaptiveness across the LAI framework.
            </p>
            <div className="confidential-seal">Confidential Executive Intelligence</div>
          </div>

          <div className="header-metadata-grid">
            <div className="meta-col">
              <div className="meta-entry"><span className="m-label">Institution</span> <span className="m-val">{data.organization_name}</span></div>
              <div className="meta-entry"><span className="m-label">Participant</span> <span className="m-val">{data.participants?.name || 'Leadership Team Member'}</span></div>
              <div className="meta-entry"><span className="m-label">Leadership Team</span> <span className="m-val">{teamMemberCount} members</span></div>
            </div>
            <div className="meta-col">
              <div className="meta-entry"><span className="m-label">Assessment Date</span> <span className="m-val">{new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
              <div className="meta-entry"><span className="m-label">Report ID</span> <span className="m-val">{id.substring(0, 8).toUpperCase()}</span></div>
            </div>
          </div>
        </header>

        {/* 2. EXECUTIVE SUMMARY */}
        <section className="report-section summary-box page-section">
          <h2>Executive Summary</h2>
          <div className="summary-grid">
            <div className="summary-bullets">
              <p style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem' }}>
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
              <p style={{ lineHeight: '1.4' }}>Your organization may recognize change early but struggle to <strong>translate awareness into aligned decisions.</strong></p>
              <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#64748b', lineHeight: '1.3' }}>When signals move faster than decisions, organizations often execute outdated assumptions.</p>
            </div>
          </div>
        </section>

        {/* 3. THE ADAPTIVENESS GAP (NEW PAGE 2 - DECISION MOMENT) */}
        <section className="report-section gap-section page-section">
          <div className="gap-content-brief">
            <h2 className="gap-title">Measure the Adaptiveness Gap</h2>
            
            <div className="gap-split-grid">
              <div className="gap-col-perception">
                <div className="gap-tag">Verified Perception</div>
                <h3>What This Report Shows</h3>
                <p>This assessment measures <strong>how your leadership team perceives its adaptiveness.</strong></p>
                <div className="gap-insight-box">
                  <p>Your team believes it:</p>
                  <ul className="gap-list">
                    <li>• Recognizes signals early</li>
                    <li>• Interprets change as opportunity</li>
                    <li>• Struggles with systemic decision alignment</li>
                  </ul>
                </div>
              </div>

              <div className="gap-col-behavior">
                <div className="gap-tag-behavior">Behavioral Uncertainty</div>
                <h3>What This Report Cannot Yet Confirm</h3>
                <p>Perception alone does not reveal <strong>how leadership systems actually behave under pressure.</strong></p>
                <div className="gap-behavior-narrative">
                   Signals are often recognized early, but behavioral observation consistently reveals that decisions and resources take significantly longer to realign in dynamic conditions.
                </div>
              </div>
            </div>

            <div className="gap-decision-box">
              <div className="critical-question">
                <h3>The Critical Question</h3>
                <p>Does your leadership system <strong>actually behave</strong> the way it believes it does? Or does decision friction emerge when leaders must act under real strategic pressure?</p>
              </div>
              
              <div className="gap-cta-block">
                <div className="cta-narrative">
                   The Behavioral Adaptiveness Simulation observes leadership decision dynamics in real time, revealing the gap between perception and reality.
                </div>
                <div className="cta-actions-row">
                   <Link to="/how-measured" className="btn-institutional primary">Test Your Leadership System Under Pressure</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. KEY INSIGHT */}
        <section className="report-section insight-sentence page-section">
           <div className="high-insight">
             <p>Your leadership system <strong>interprets change well</strong> but <strong>struggles to align decisions quickly</strong> once change is recognized.</p>
             <p className="sub-insight">This pattern often produces decision friction during periods of rapid market shift.</p>
           </div>
        </section>

        {/* 3. LEADERSHIP RISK SIGNAL (CONDITIONAL) */}
        {riskSignal && (
          <section className="report-section risk-signal-section page-section">
            <div className="risk-banner-inner">
               <AlertCircle size={32} className="text-rose" />
               <div>
                  <h3 className="risk-tag">Critical Observation</h3>
                  <div className="risk-title">{riskSignal}</div>
                  <p className="risk-desc">
                    A pattern in the perception data suggests a localized friction point that may impede systemic adaptiveness during periods of rapid environmental shift.
                  </p>
               </div>
            </div>
          </section>
        )}

        {/* 4. ADAPTIVENESS PROFILE */}
        <section className="report-section profile-section page-section">
          <h2>Leadership Adaptiveness Radar</h2>
          <div className="radar-insight-text">
            This chart shows how your leadership team performs across five dimensions of adaptiveness. 
            Overlay reflects individual responses compared to the leadership team average.
          </div>
          
          <div className="radar-layout-grid">
            <div className="radar-visual-column">
               <RadarChart scores={scores} teamScores={teamData?.averages} />
            </div>
            
            <div className="dimension-bars-column">
               <div className="interpretation-scale-document">
                  <h4>Adaptiveness Interpretation</h4>
                  <div className="scale-node"><span className="s-range">80–100</span> <span className="s-label">Highly adaptive system</span></div>
                  <div className="scale-node"><span className="s-range">60–79</span> <span className="s-label">Moderately adaptive</span></div>
                  <div className="scale-node"><span className="s-range">40–59</span> <span className="s-label">Constraints emerging</span></div>
                  <div className="scale-node s-critical"><span className="s-range">&lt; 40</span> <span className="s-label">High friction risk</span></div>
               </div>

               <div className="brief-bars-list">
                 {dimensions.map(dim => {
                   const s = scores[dim.id];
                   const sClass = s >= 80 ? 'score-high' : (s <= 40 ? 'score-low' : 'score-medium');
                   return (
                     <div key={dim.id} className="document-dim-entry">
                        <div className="d-meta">
                          <span className="d-name">{dim.name}</span>
                          <span className={`d-score-val ${sClass}`}>{s}</span>
                        </div>
                        <div className="d-bar-bg">
                          <div className={`d-bar-fill ${sClass}`} style={{ width: `${s}%` }} />
                        </div>
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>
        </section>

        {/* 5. DIMENSION INSIGHTS */}
        <section className="report-section detail-grid page-section">
           <h2>Dimension Insights</h2>
           <div className="document-insight-grid">
             {dimensions.map(dim => {
                const s = scores[dim.id];
                const sClass = s >= 80 ? 'score-high' : (s <= 40 ? 'score-low' : 'score-medium');
                return (
                  <div key={dim.id} className="dim-insight-row">
                    <div className={`dim-score-col ${sClass}`}>{s}</div>
                    <div className="dim-text-col">
                       <h4>{dim.name}</h4>
                       <span className="dim-subtitle-brief">{dim.subtitle}</span>
                       <div className="dim-narrative">
                          <p>{dim.id === 'signal_detection' && (s >= 60 ? "Leaders appear reasonably capable of detecting emerging signals in the market or environment." : "Signals exist, but are not consistently recognized across the leadership system.")}</p>
                          <p>{dim.id === 'cognitive_framing' && (s >= 70 ? "Leaders generally interpret disruption as something that can be addressed strategically, translating uncertainty into opportunity." : "Disruption may be perceived primarily as an operational threat, limiting strategic experimentation.")}</p>
                          <p>{dim.id === 'decision_alignment' && (s <= 40 ? "Lower alignment suggests that once signals are recognized, leaders may not reach decisions at the same speed. This often creates delayed responses." : "Leadership decisions appear to converge effectively once a signal is recognized.")}</p>
                          <p>{dim.id === 'resource_calibration' && "Reflects how rapidly capital, talent, and operational capacity can be redirected when conditions change."}</p>
                          <p>{dim.id === 'integrated_responsiveness' && "Reflects whether leadership decisions convert into coordinated execution across teams."}</p>
                       </div>
                    </div>
                  </div>
                );
             })}
           </div>
        </section>

        {/* 6. LEADERSHIP SYSTEM PERCEPTION (TEAM ONLY) */}
        {showTeamView && (
          <section className="report-section team-section-document page-section">
            <div className="section-header-row-brief">
              <Users size={20} />
              <h2>Leadership System Perception</h2>
            </div>
            <p className="team-meta-brief">Aggregated results from <strong>{teamMemberCount}</strong> leadership team members.</p>
            
            <div className="perception-layout-grid">
               <div className="perception-analysis-col">
                  <h4>Team Alignment Status</h4>
                  <p className="alignment-status-title">
                    {teamData.variance && Object.values(teamData.variance).some(v => v === 'HIGH') ? "Fragmented leadership perception" : (Object.values(teamData.variance || {}).some(v => v === 'MODERATE') ? "Mixed leadership perception" : "Strong shared perception")}
                  </p>
                  <p className="alignment-description">
                    {hasHighVariance 
                      ? "Leadership team members are experiencing the decision system differently, which may create friction during rapid transitions."
                      : "Leaders appear to share a consistent understanding of how the organization responds to change."}
                  </p>
                  <p className="alignment-insight-line">
                    Shared perception alignment often indicates that leadership teams recognize similar challenges and opportunities in the current environment.
                  </p>
               </div>
               
               <div className="perception-stats-col">
                  <div className="doc-stat-card">
                     <div className="s-label">Team Avg Score</div>
                     <div className="s-value">{team_average_score}</div>
                  </div>
                  <div className="doc-stat-card">
                     <div className="s-label">Participants</div>
                     <div className="s-value">{teamMemberCount}</div>
                  </div>
               </div>
            </div>
          </section>
        )}

        {/* 8. RESEARCH INSIGHT */}
        <section className="report-section research-insight-brief page-section">
           <div className="insight-box-m-document">
              <h3>Research Insight</h3>
              <p>Most leadership teams believe they adapt quickly. <strong>Behavioral observation often shows the opposite.</strong></p>
              <div className="insight-brief-body">
                 Signals are detected faster than decisions and resources can realign. Understanding perception is the first step in measuring how the system actually behaves.
              </div>
           </div>
        </section>

        {/* 9. DOWNLOAD BRIEF OPTION */}
        <section className="report-section download-footer page-section">
            <div className="download-cta-centered">
               <h3>Secure Your Intelligence Brief</h3>
               <p>Download the high-fidelity perception profile for strategic review.</p>
               <button className="btn-institutional outline" onClick={() => window.print()}>Download Intelligence Brief</button>
            </div>
        </section>

        <footer className="footer-document">
           <div className="f-left">LEADERSHIP ADAPTIVENESS INSTITUTE</div>
           <div className="f-center">CONFIDENTIAL EXECUTIVE INTELLIGENCE</div>
           <div className="f-right">PAGE X</div>
        </footer>
      </div>

      <style jsx>{`
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

        .header-metadata-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4rem; border-top: 2px solid #0f172a; pt: 2rem; margin-top: 1rem; padding-top: 2rem;}
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
        .score-high { color: #1FA37A !important; } .d-bar-fill.score-high { background: #1FA37A !important; }
        .score-medium { color: #F2A93B !important; } .d-bar-fill.score-medium { background: #F2A93B !important; }
        .score-low { color: #D64545 !important; } .d-bar-fill.score-low { background: #D64545 !important; }

        /* Dimension Insight Grid Update */
        .document-insight-grid { display: flex; flex-direction: column; gap: 3rem; }
        .dim-insight-row { display: grid; grid-template-columns: 80px 1fr; gap: 2rem; align-items: start; }
        .dim-score-col { font-size: 42px; font-weight: 950; line-height: 1; font-family: monospace; text-align: right; }
        .dim-text-col h4 { margin: 0; font-size: 20px; font-weight: 800; }
        .dim-subtitle-brief { font-size: 14px; color: #64748b; display: block; margin-top: 2px; }
        .dim-narrative { margin-top: 1rem; color: #475569; line-height: 1.5; font-size: 15px; }

        .research-insight-brief { background: #0f172a; color: white; padding: 3rem 4rem; border-radius: 20px; max-width: 900px; margin: 0 auto 5rem; }
        .insight-box-m-document h3 { color: #14b8a6; text-transform: uppercase; font-size: 11px; letter-spacing: 2px; margin-bottom: 1.5rem; border: none; }
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

        /* Perception Section Brief */
        .team-section-document { border-top: 1px solid #f1f5f9; padding-top: 3rem; }
        .section-header-row-brief { display: flex; align-items: center; gap: 0.75rem; color: #14b8a6; margin-bottom: 0.5rem; h2 { border: none; margin: 0; } }
        .team-meta-brief { font-size: 0.85rem; color: #64748b; margin-bottom: 2rem; }
        .perception-layout-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 4rem; align-items: start; }
        .alignment-status-title { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem; }
        .alignment-description { color: #475569; line-height: 1.5; font-size: 1rem; margin-bottom: 1.5rem; }
        .alignment-insight-line { font-size: 0.9rem; color: #64748b; font-style: italic; border-top: 1px solid #f1f5f9; padding-top: 1.5rem; }
        
        .perception-stats-col { display: flex; flex-direction: column; gap: 1.5rem; }
        .doc-stat-card { background: #0f172a; color: white; padding: 1.5rem; border-radius: 16px; text-align: center; }

        /* Adaptiveness Gap Styling */
        .gap-section { background: white; border: 2px solid #0f172a; border-radius: 24px; padding: 4rem; margin-top: 4rem; }
        .gap-title { font-size: 32px; font-weight: 950; margin-bottom: 3rem; text-align: center; border: none; }
        .gap-split-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; margin-bottom: 4rem; }
        .gap-tag { font-size: 10px; font-weight: 900; color: #14b8a6; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1rem; }
        .gap-tag-behavior { font-size: 10px; font-weight: 900; color: #f43f5e; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1rem; }
        .gap-insight-box { background: #f0fdfa; padding: 1.5rem; border-radius: 12px; margin-top: 1.5rem; }
        .gap-list { list-style: none; padding: 0; margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; font-weight: 700; color: #0f172a; font-size: 14px; }
        .gap-behavior-narrative { font-size: 15px; color: #475569; line-height: 1.6; border-left: 2px solid #fda4af; padding-left: 1.5rem; margin-top: 1.5rem; }
        .gap-decision-box { border-top: 1px solid #e2e8f0; padding-top: 3rem; text-align: center; }
        .critical-question { max-width: 600px; margin: 0 auto 3rem; h3 { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 1rem; } p { font-size: 17px; color: #475569; line-height: 1.5; } }
        .gap-cta-block { max-width: 700px; margin: 0 auto; background: #0f172a; color: white; padding: 2.5rem; border-radius: 20px; }
        .cta-narrative { font-size: 15px; color: #94a3b8; margin-bottom: 2rem; line-height: 1.6; }

        .download-footer { text-align: center; padding: 4rem 0; border-top: 1px solid #f1f5f9; h3 { font-size: 24px; font-weight: 900; margin-bottom: 1rem; } p { color: #64748b; margin-bottom: 2rem; } }

        @media screen and (max-width: 900px) {
           .report-container { width: 95%; padding: 2rem; }
           .summary-grid, .radar-layout-grid, .dim-insight-row, .perception-layout-grid { grid-template-columns: 1fr; gap: 2rem; }
           .dim-score-col { text-align: left; font-size: 32px; }
        }

        @media print {
          @page { size: A4; margin: 20mm; }
          body { background: white !important; }
          
          /* Print Isolation */
          body * { visibility: hidden; }
          .report-container, .report-container * { visibility: visible; }
          .report-container { 
            position: absolute; left: 0; top: 0; width: 100% !important; 
            max-width: 100% !important; padding: 0 !important; box-shadow: none !important; margin: 0 !important; 
          }

          nav, header, .menu, .sidebar, .footer-nav, button, .cta, .download-button, .site-header, .btn-institutional, .breadcrumb { 
            display: none !important; 
          }

          .summary-box { background: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .risk-signal-section { background: #fff1f2 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .research-insight-brief { background: #0f172a !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .interpretation-scale-document, .sim-focus-grid-document { background: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .doc-stat-card { background: #0f172a !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .d-bar-bg { background: #f1f5f9 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .f-item { color: #475569 !important; }
        }
      `}</style>
    </div>
  );
};

export default Part1Report;
