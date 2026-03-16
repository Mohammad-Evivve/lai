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
  const [activeTabs, setActiveTabs] = useState({});

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

  // Team Logic Primitives
  const teamMemberCount = teamData?.count || 0;
  const showTeamView = teamMemberCount > 0;
  const showVarianceAnalysis = teamMemberCount >= 3;
  const team_average_score = teamData?.averages 
    ? Math.round(Object.values(teamData.averages).reduce((a, b) => a + b, 0) / 5) 
    : 0;

  // Alignment Narrative Helpers
  const most_aligned_dimension = teamData?.variance 
    ? dimensions.find(d => teamData.variance[d.id]?.toLowerCase().includes('low'))
    : null;
  const most_divergent_dimension = teamData?.variance
    ? dimensions.find(d => teamData.variance[d.id]?.toLowerCase().includes('high'))
    : null;

  // --- NARRATIVE ENGINE (PASS 1) ---
  
  // 1. Executive Summary Patterns
  const patternA = scores.signal_detection >= 65 && scores.cognitive_framing >= 65 && scores.decision_alignment <= 50;
  const patternB = scores.signal_detection <= 45 && scores.cognitive_framing <= 45;
  const patternC = scores.decision_alignment >= 60 && scores.resource_calibration <= 50;
  
  let summaryPattern = 'D'; // Default
  if (patternA) summaryPattern = 'A';
  else if (patternB) summaryPattern = 'B';
  else if (patternC) summaryPattern = 'C';

  const summaries = {
    A: {
      headline: "Leaders believe change is recognized and understood, but decision convergence may lag behind awareness.",
      bullets: [
        "Awareness of emerging signals is notably high.",
        "Change is interpreted strategically across the system.",
        "A visible gap exists between recognition and coordinated action."
      ],
      risk: "Awareness is high but coordination lags, meaning the organization may see the need to change but fail to move as one."
    },
    B: {
      headline: "The leadership system may not yet interpret emerging change with sufficient clarity or shared awareness.",
      bullets: [
        "Detection of weak signals appears inconsistent.",
        "The system may be filter-heavy, potentially missing early shifts.",
        "Alignment and response often become reactive rather than intentional."
      ],
      risk: "When change is weakly recognized, the organization remains optimized for past conditions while new threats emerge."
    },
    C: {
      headline: "Leadership may be aligned on direction but less confident in the ability to shift resources quickly.",
      bullets: [
        "Decision convergence is relatively high.",
        "There is shared intent on the strategic path forward.",
        "A friction point exists in the velocity of resource reallocation."
      ],
      risk: "Alignment without resource mobility creates 'strategy gridlock'—decisions are made but capital and talent don't move."
    },
    D: {
      headline: "Perception across the five dimensions appears relatively balanced without a dominant strength or constraint.",
      bullets: [
        "Confidence is evenly distributed across the framework.",
        "No single dimension indicates critical failure or excellence.",
        "Systemic stability suggests moderate confidence in current adaptiveness."
      ],
      risk: "A balanced profile can mask underlying bottlenecks that only appear under significant external pressure."
    }
  };

  const selectedSummary = summaries[summaryPattern];

  // 2. Risk Signal Banner (Keep It Rare)
  let riskSignal = null;
  const hasLowScore = Object.values(scores).some(s => s !== undefined && s !== null && s <= 40);
  const frictionPattern = scores.decision_alignment <= 45 && scores.integrated_responsiveness <= 45;
  const lowVarAlignmentThreshold = showVarianceAnalysis && teamData?.variance && Object.values(teamData.variance).some(v => v?.toLowerCase().includes('high'));

  if (hasLowScore || lowVarAlignmentThreshold || frictionPattern) {
    if (scores.signal_detection <= 40) riskSignal = "Signal Recognition Risk";
    else if (lowVarAlignmentThreshold) riskSignal = "Leadership Alignment Risk";
    else if (scores.resource_calibration <= 40) riskSignal = "Resource Reallocation Risk";
    else if (frictionPattern) riskSignal = "Decision Friction Risk";
    else riskSignal = "Institutional Alignment Risk";
  }

  // --- RENDER HELPERS ---
  const getScoreInterpretation = (score) => {
    if (score >= 75) return "strong perceived capability";
    if (score >= 60) return "moderate perceived capability";
    if (score >= 40) return "mixed confidence";
    return "potential structural friction";
  };

  const toggleTab = (dimId, tab) => {
    setActiveTabs(prev => ({ ...prev, [dimId]: tab }));
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
               <AlertCircle size={32} className="text-rose" />
               <div>
                  <h3 className="risk-tag">Institutional Alert</h3>
                  <div className="risk-title">{riskSignal}</div>
                  <p className="risk-desc">
                    A pattern in the perception data suggests a localized friction point that may impede systemic adaptiveness during periods of rapid environmental shift.
                  </p>
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
            
            <div className="invitation-cta-column">
               <div className="team-invitation-block">
                  <h4>Invite your leadership team to compare perception</h4>
                  <p>Leadership perception becomes more meaningful when multiple leaders participate. Copy the link below to invite others.</p>
                  
                  <div className="invite-actions-brief">
                    <button className="btn-invite" onClick={() => {
                      const url = `${window.location.origin}/diagnostic/join/${data?.team_code || ''}`;
                      navigator.clipboard.writeText(url);
                      alert('Invite Link Copied');
                    }}>
                      Copy Invite Link
                    </button>
                    <div className="team-code-display">
                      <span className="code-label">Team Code:</span>
                      <span className="code-value">{data?.team_code || 'LAI-XXXX'}</span>
                    </div>
                  </div>
               </div>

               <div className="interpretation-scale-document-tiny">
                  <h4>Adaptiveness Interpretation</h4>
                  <div className="scale-node"><span className="s-range">80–100</span> <span className="s-label">Strong perceived capability</span></div>
                  <div className="scale-node"><span className="s-range">60–79</span> <span className="s-label">Moderate capability</span></div>
                  <div className="scale-node"><span className="s-range">40–59</span> <span className="s-label">Mixed confidence</span></div>
                  <div className="scale-node s-critical"><span className="s-range">&lt; 40</span> <span className="s-label">Structural friction</span></div>
               </div>
            </div>
          </div>
        </section>

        {/* 5. DIMENSION INSIGHTS (Two Tab System) */}
        <section className="report-section dimension-insights-section page-section">
           <h2>Dimension Insights</h2>
           <div className="document-insight-grid-phased">
             {dimensions.map(dim => {
                const s = scores[dim.id];
                const teamAvg = teamData?.averages?.[dim.id];
                const activeTab = activeTabs[dim.id] || 'your';
                const delta = teamAvg ? s - teamAvg : null;

                return (
                  <div key={dim.id} className="phased-dim-row">
                    <div className="phased-dim-header">
                       <div className="p-dim-info">
                          <h3>{dim.name}</h3>
                          <span className="p-dim-subtitle">{dim.subtitle}</span>
                       </div>
                       <div className="p-dim-tabs">
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
                       {activeTab === 'your' ? (
                         <div className="tab-pane-brief">
                            <div className="t-score-indicator">
                               <span className="t-label">Your Score</span>
                               <span className="t-val">{s}</span>
                               <span className="t-desc">({getScoreInterpretation(s)})</span>
                            </div>
                            <p className="t-narrative">
                               {dim.id === 'signal_detection' && (s >= 75 ? "Your score suggests strong perceived capability in detecting technological and market signals before they become mainstream." : (s >= 60 ? "Your score reflects moderate confidence in the system's ability to recognize signals early." : "Your score suggests that signals may be present but are not consistently being recognized."))}
                               {dim.id === 'cognitive_framing' && (s >= 75 ? "You perceive a strong ability within leadership to interpret disruption as a strategic opportunity." : (s >= 60 ? "You perceive a moderate success in framing uncertainty as opportunity rather than threat." : "Your score suggests disruption is primarily experienced as an operational threat."))}
                               {dim.id === 'decision_alignment' && (s >= 75 ? "You view the leadership system as highly aligned in its decision-making convergence." : (s >= 60 ? "You see moderate alignment, suggesting some latency in how leadership decisions converge." : "Lower alignment suggests leaders do not reach decisions at the same speed, creating latency."))}
                               {dim.id === 'resource_calibration' && (s >= 75 ? "You perceive a high velocity in the redirection of capital and talent toward new priorities." : (s >= 60 ? "You see moderate flexibility in resource reallocation when conditions change." : "Your score reflects a perception that resources are slow to move from legacy priorities."))}
                               {dim.id === 'integrated_responsiveness' && (s >= 75 ? "You view the organization as highly responsive in translating strategy into coordinated behavioral output." : (s >= 60 ? "You perceive moderate effectiveness in systemic execution." : "Your score suggests a disconnect between strategic decisions and operational output."))}
                            </p>
                         </div>
                       ) : (
                         <div className="tab-pane-brief team-tab">
                            <div className="team-stats-row-brief">
                               <div className="t-stat">
                                  <span className="ts-label">Team Avg</span>
                                  <span className="ts-val">{Math.round(teamAvg)}</span>
                               </div>
                               <div className="t-stat">
                                  <span className="ts-label">Your Delta</span>
                                  <span className={`ts-val ${Math.abs(delta) > 15 ? 'high-delta' : ''}`}>
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
                       )}
                    </div>
                  </div>
                );
             })}
           </div>
        </section>

        {/* 6. LEADERSHIP ALIGNMENT STATUS (Narrative Translation) */}
        {showTeamView && (
          <section className="report-section team-alignment-section page-section">
            <div className="section-header-row-brief">
              <Users size={20} />
              <h2>Leadership Alignment Status</h2>
            </div>
            
            <div className="perception-layout-grid-narrative">
               <div className="perception-analysis-col">
                  <h3 className="alignment-status-label">
                    {teamData.variance && Object.values(teamData.variance).some(v => v?.toLowerCase().includes('high')) 
                      ? "Fragmented Perception" 
                      : (Object.values(teamData.variance || {}).some(v => v?.toLowerCase().includes('moderate')) 
                       ? "Mixed Perception" 
                       : "Shared Perception")}
                  </h3>
                  <p className="alignment-description-narrative">
                    {teamData.variance && Object.values(teamData.variance).some(v => v?.toLowerCase().includes('high')) 
                      ? "Leadership team members are experiencing the organization’s capability in significantly different ways. This fragmentation often indicates that operational realities vary across different parts of the leadership system."
                      : (Object.values(teamData.variance || {}).some(v => v?.toLowerCase().includes('moderate'))
                        ? "There is moderate divergence in how leaders experience the system. While shared understanding exists in some areas, key dimensions of adaptiveness are being interpreted differently across the team."
                        : "Leaders share a consistently strong understanding of how the organization responds to change. This alignment is a critical foundation for coordinated action during transitions.")
                    }
                  </p>
                  
                  <div className="most-shared-fragmented-grid">
                     <div className="sf-item">
                        <span className="sf-label">Most Shared Perception</span>
                        <span className="sf-val">{most_aligned_dimension?.name || 'N/A'}</span>
                     </div>
                     <div className="sf-item">
                        <span className="sf-label">Most Fragmented Perception</span>
                        <span className="sf-val">{most_divergent_dimension?.name || 'N/A'}</span>
                     </div>
                  </div>
               </div>
               
               <div className="perception-stats-summary-col">
                  <div className="doc-stat-card-lean">
                     <div className="s-label">Team Avg</div>
                     <div className="s-value">{team_average_score}</div>
                  </div>
                  <div className="doc-stat-card-lean">
                     <div className="s-label">Participants</div>
                     <div className="s-value">{teamMemberCount}</div>
                  </div>
               </div>
            </div>
          </section>
        )}

        {/* 8. RESEARCH INTERPRETATION (Flywheel Context) */}
        <section className="report-section research-insight-brief page-section">
           <div className="insight-box-m-document">
              <h3>Research Insight</h3>
              <p>Most leadership teams believe they adapt quickly. <strong>Behavioral observation often shows the opposite.</strong></p>
              <div className="insight-brief-body">
                 Signals are often recognized early, but behavioral observation consistently reveals that decisions and resources take significantly longer to realign in dynamic conditions.
              </div>
           </div>
        </section>

        {/* 9. RECOMMENDED NEXT MEASUREMENT STEP (Perception to Behavior) */}
        <section className="report-section next-stage-polish page-section">
            <div className="next-stage-brief">
               <div className="n-tag">Decision Moment</div>
               <h3>Does Behavior Match Belief?</h3>
               <p className="brief-desc">
                  This report measures <strong>how the leadership team perceives its adaptiveness</strong>. The next phase moves from perception to behavioral observation, measuring how decisions actually unfold under pressure.
               </p>
               <div className="sim-focus-grid-document">
                  <div className="f-item"><div className="f-dot" /> Signal recognition speed</div>
                  <div className="f-item"><div className="f-dot" /> Decision convergence</div>
                  <div className="f-item"><div className="f-dot" /> Resource reallocation velocity</div>
                  <div className="f-item"><div className="f-dot" /> Coordinated system output</div>
               </div>
               <div className="stage-actions">
                  <Link to="/how-measured" className="btn-institutional primary">Begin Behavioral Observation</Link>
                  <button className="btn-institutional outline" onClick={() => window.print()}>Download Perception Brief</button>
               </div>
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
