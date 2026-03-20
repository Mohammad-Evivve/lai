import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, CheckCircle, ChevronLeft, AlertCircle, 
  BarChart3, TrendingUp, Sparkles, Brain, Users, 
  User, Link as LinkIcon, Mail, ShieldCheck, Globe,
  Briefcase, Activity, Target
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const dimensions = [
  { 
    id: 'signal_detection', 
    name: 'Signal Detection', 
    description: 'Ability to detect emerging technological, geopolitical, and market signals.',
    questions: [
      {
        text: "How quickly does your leadership system recognize emerging technological and market shifts?",
        labels: ["Significant Lag", "Instantaneous"]
      },
      {
        text: "How frequently are external 'weak signals' accurately prioritized in strategic discussions?",
        labels: ["Frequently Minimized", "Systemically Prioritized"]
      }
    ] 
  },
  { 
    id: 'cognitive_framing', 
    name: 'Cognitive Framing', 
    description: 'Interpretation of market shifts (Opportunity vs. Threat).',
    questions: [
      {
        text: "When facing disruption, how often do leaders frame change as an opportunity rather than a threat?",
        labels: ["Perceived as Threat", "Perceived as Opportunity"]
      },
      {
        text: "How effectively does the leadership system challenge its own core assumptions when reality shifts?",
        labels: ["Rigid Assumptions", "Continuous Recalibration"]
      }
    ] 
  },
  { 
    id: 'decision_alignment', 
    name: 'Decision Alignment', 
    description: 'Convergence of actions across the simulated system.',
    questions: [
      {
        text: "How consistently do leadership decisions converge around a shared response to environmental changes?",
        labels: ["Strategic Fragmentation", "Systems-wide Convergence"]
      },
      {
        text: "How clearly are strategic shifts translated into coherent decisions across all leadership levels?",
        labels: ["Significant Dilution", "Total Strategic Coherence"]
      }
    ] 
  },
  { 
    id: 'resource_calibration', 
    name: 'Resource Calibration', 
    description: 'Velocity of capital and talent reallocation.',
    questions: [
      {
        text: "How quickly can your organization redirect capital and talent to support new strategic priorities?",
        labels: ["Stagnant Allocation", "Dynamic Resource Mobility"]
      },
      {
        text: "How often are resources withdrawn from legacy projects that no longer align with the environment?",
        labels: ["Legacy Retention", "Immediate Realignment"]
      }
    ] 
  },
  { 
    id: 'integrated_responsiveness', 
    name: 'Integrated Responsiveness', 
    description: 'Systemic translation of strategy into behavioral output.',
    questions: [
      {
        text: "How effectively is systemic behavioral change synchronized across the entire organization?",
        labels: ["Operational Silos", "Total Interdependence"]
      },
      {
        text: "How quickly does execution across teams adjust once a leadership pivot has been decided?",
        labels: ["Extended Execution Lag", "Immediate Behavioral Shift"]
      }
    ] 
  }
];

const DiagnosticPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); 
  const [mode, setMode] = useState(null); // 'individual', 'team_create', 'team_join'
  const [identity, setIdentity] = useState({ name: '', email: '' });
  const [teamCode, setTeamCode] = useState('');
  const [teamOrgName, setTeamOrgName] = useState('');
  const [invites, setInvites] = useState(['']);
  const [consent, setConsent] = useState(false);
  const [meta, setMeta] = useState({ 
    organization_name: '', 
    industry: '', 
    region: 'Global',
    role_level: '',
    org_size: ''
  });
  
  const [currentDimIndex, setCurrentDimIndex] = useState(0);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [serverTeamCode, setServerTeamCode] = useState('');
  const [submissionError, setSubmissionError] = useState(null);
  const [isInviting, setIsInviting] = useState(false);
  const [copied, setCopied] = useState(null); // 'report' or 'team'

  const totalQuestions = dimensions.length * 2;
  const currentGlobalIndex = currentDimIndex * 2 + currentQIndex;

  // v1.8.0: Handle Join Link and Initial State
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('team');
    if (code) {
      setMode('team_join');
      setTeamCode(code.toUpperCase());
      setStep(1); // Jump to mode to confirm joining
      
      // Fetch team context if code provided
      fetch(`/api/teams/${code}`)
        .then(res => res.json())
        .then(data => {
          if (data.organization_name) {
            setTeamOrgName(data.organization_name);
            setMeta(prev => ({ 
              ...prev, 
              organization_name: data.organization_name,
              industry: data.industry || prev.industry,
              org_size: data.org_size || prev.org_size
              // Note: role_level and region are omitted as per user request (personal data)
            }));
          }
        })
        .catch(err => console.error('Team verify error:', err));
    }
  }, []);

  const handleAnswer = (value) => {
    const dimId = dimensions[currentDimIndex].id;
    const qKey = `${dimId}_${currentQIndex}`;
    
    setAnswers({ ...answers, [qKey]: value });

    if (currentQIndex < 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else if (currentDimIndex < dimensions.length - 1) {
      setCurrentDimIndex(currentDimIndex + 1);
      setCurrentQIndex(0);
    } else {
      submitDiagnostic();
    }
  };

  const submitDiagnostic = async () => {
    setIsSubmitting(true);
    
    const overallScore = calculateOverallScore();
    const resultData = {
      name: identity.name,
      email: identity.email,
      organization_name: meta.organization_name,
      industry: meta.industry,
      region: meta.region,
      role_level: meta.role_level,
      org_size: meta.org_size,
      participation_mode: mode,
      team_code: mode === 'team_join' ? teamCode : (mode === 'team_create' ? serverTeamCode : null),
      overall_score: overallScore,
      signal_detection_score: calculateDimScore('signal_detection'),
      cognitive_framing_score: calculateDimScore('cognitive_framing'),
      decision_alignment_score: calculateDimScore('decision_alignment'),
      resource_calibration_score: calculateDimScore('resource_calibration'),
      integrated_responsiveness_score: calculateDimScore('integrated_responsiveness'),
      answers, // Granular scores for variance
      metadata: {
        research_consent: consent,
        invites: mode === 'team_create' ? invites.filter(i => i) : [],
        source: 'Perceptual'
      }
    };

    let success = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    while (attempts < MAX_ATTEMPTS && !success) {
      try {
        attempts++;
        const response = await fetch('/api/diagnostic', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resultData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to submit diagnostic');
        
        console.log('[DIAGNOSTIC] Submission success:', data);
        setReportId(data.id);
        if (data.team_code) setServerTeamCode(data.team_code);
        setStep(7);
        success = true;
        setSubmissionError(null);
      } catch (err) {
        console.error(`[DIAGNOSTIC] Attempt ${attempts} failed:`, err);
        if (attempts < MAX_ATTEMPTS) {
          // Linear backoff
          await new Promise(r => setTimeout(r, 2000 * attempts));
        } else {
          // Final failure - Show error state instead of hallucinating ID
          setSubmissionError('The secure link to the Leadership Observatory could not be established. Your data is preserved locally. Please retry the final transmission.');
        }
      }
    }
    setIsSubmitting(false);
  };

  const calculateDimScore = (dimId) => {
    const dimAnswers = Object.keys(answers)
      .filter(key => key.startsWith(dimId))
      .map(key => answers[key]);
    if (dimAnswers.length === 0) return 0;
    const avg = dimAnswers.reduce((a, b) => a + b, 0) / dimAnswers.length;
    return Math.round(avg * 10);
  };

  const calculateOverallScore = () => {
    const allScores = dimensions.map(d => calculateDimScore(d.id));
    return Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
  };

  const addInvite = () => setInvites([...invites, '']);
  const updateInvite = (idx, val) => {
    const newInvites = [...invites];
    newInvites[idx] = val;
    setInvites(newInvites);
  };

  return (
    <div className="diagnostic-page">
      <div className="container narrow">
        <AnimatePresence mode="wait">
          {/* STEP 0: INTRODUCTION */}
          {step === 0 && (
            <motion.div key="intro" className="diag-card intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="institutional-badge">Measurement Cycle: LAI-CORE [Part 1 of 2]</div>
              <h1>Perceptual Measurement</h1>
              <p className="lead-text">
                Assess how your leadership system detects change, aligns decisions, and adapts in complex environments.
              </p>
              <div className="process-preview">
                <div className="preview-item">
                  <div className="p-icon"><Brain size={20} /></div>
                  <div className="p-text"><strong>Perception Assessment</strong> Answer a short perception diagnostic to benchmark institutional mindset.</div>
                </div>
                <div className="preview-item">
                  <div className="p-icon"><BarChart3 size={20} /></div>
                  <div className="p-text"><strong>Adaptiveness Profile</strong> Receive your high-fidelity Organizational Adaptiveness Chart.</div>
                </div>
                <div className="preview-item">
                  <div className="p-icon"><Activity size={20} /></div>
                  <div className="p-text"><strong>Behavioral Simulation</strong> Observe decisions in high-stakes practice</div>
                </div>
                <div className="preview-item">
                  <div className="p-icon"><Target size={20} /></div>
                  <div className="p-text"><strong>Reveal the Gap</strong> Understand your Divergent Dimensions and the delta between perception and action.</div>
                </div>
              </div>
              <button onClick={() => setStep(1)} className="btn-institutional primary full-width">Begin Diagnostic <ArrowRight size={18} /></button>
            </motion.div>
          )}

          {/* STEP 1: PARTICIPATION MODE */}
          {step === 1 && (
            <motion.div key="mode" className="diag-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button className="btn-back-nav" onClick={() => setStep(0)}><ChevronLeft size={16} /> Back</button>
              <div className="step-count">Step 1 of 6</div>
              <h2>Participation Mode</h2>
              <p>Choose how you would like to participate in this measurement cycle.</p>
              
              <div className="mode-grid">
                <button className={`mode-btn ${mode === 'team_join' ? 'active' : ''}`} onClick={() => setMode('team_join')}>
                  <Users size={24} />
                  <strong>Join a Team</strong>
                  <span>Existing project with a code.</span>
                </button>
                <button className={`mode-btn ${mode === 'team_create' ? 'active' : ''}`} onClick={() => setMode('team_create')}>
                  <Users size={24} className="text-teal" />
                  <strong>Create a Team</strong>
                  <span>Invite colleagues to benchmark.</span>
                </button>
                <button className={`mode-btn ${mode === 'individual' ? 'active' : ''}`} onClick={() => setMode('individual')}>
                  <User size={24} />
                  <strong>Individual</strong>
                  <span>Contribute to global research.</span>
                </button>
              </div>

              {mode === 'team_join' && (
                <div className="mode-input-row">
                  <input type="text" placeholder="Enter Team Code" value={teamCode} onChange={(e) => setTeamCode(e.target.value.toUpperCase())} maxLength={8} />
                  {teamOrgName && <div className="team-found-label">Joining: <strong>{teamOrgName}</strong></div>}
                </div>
              )}

              <div className="diag-actions">
                <button disabled={!mode || (mode === 'team_join' && teamCode.length < 4)} onClick={() => setStep(2)} className="btn-institutional primary">Continue</button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: IDENTITY */}
          {step === 2 && (
            <motion.div key="identity" className="diag-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button className="btn-back-nav" onClick={() => setStep(1)}><ChevronLeft size={16} /> Back</button>
              <div className="step-count">Step 2 of 6</div>
              <h2>Identify Yourself</h2>
              <p>Reports and invitations are linked to your professional identity.</p>
              
              <div className="meta-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="Your Name" value={identity.name} onChange={(e) => setIdentity({...identity, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Professional Email</label>
                  <input type="email" placeholder="you@org.com" value={identity.email} onChange={(e) => setIdentity({...identity, email: e.target.value})} />
                </div>
              </div>

              <div className="diag-actions">
                <button 
                  disabled={!identity.name || !identity.email || !identity.email.includes('@')} 
                  onClick={() => setStep(3)} 
                  className="btn-institutional primary">Continue</button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: RESEARCH CONSENT */}
          {step === 3 && (
            <motion.div key="consent" className="diag-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button className="btn-back-nav" onClick={() => setStep(1)}><ChevronLeft size={16} /> Back</button>
              <div className="step-count">Step 3 of 6</div>
              <h2>Research Consent</h2>
              <p>Institutional measurement relies on data completeness and integrity.</p>
              
              <div className="consent-box">
                <div className="consent-check" onClick={() => setConsent(!consent)}>
                  <div className={`checkbox ${consent ? 'checked' : ''}`}>{consent && <CheckCircle size={16} />}</div>
                  <p>I agree that anonymized responses may contribute to research conducted by the Leadership Adaptiveness Institute.</p>
                </div>
                <div className="consent-info">
                  <ShieldCheck size={14} /> This data allows the Observatory to expand the depth of leadership intelligence across industries.
                </div>
              </div>

              <div className="diag-actions">
                <button disabled={!consent} onClick={() => setStep(4)} className="btn-institutional primary">I Agree</button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: CONTEXT FIELDS */}
          {step === 4 && (
            <motion.div key="context" className="diag-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button className="btn-back-nav" onClick={() => setStep(3)}><ChevronLeft size={16} /> Back</button>
              <div className="step-count">Step 4 of 6</div>
              <h2>Context Metadata</h2>
              <p>Meta-data helps us provide accurate benchmarking for your role and organization.</p>
              
              <div className="meta-grid">
                <div className="form-group">
                  <label>Organization Name {mode === 'team_create' && <span className="text-red-500">*</span>}</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Modern Logistics" 
                    value={meta.organization_name} 
                    onChange={(e) => setMeta({...meta, organization_name: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Industry</label>
                  <select value={meta.industry} onChange={(e) => setMeta({...meta, industry: e.target.value})}>
                    <option value="">Select Industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance & Insurance">Finance & Insurance</option>
                    <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                    <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                    <option value="Energy & Utilities">Energy & Utilities</option>
                    <option value="Retail & Consumer Goods">Retail & Consumer Goods</option>
                    <option value="Education">Education</option>
                    <option value="Government & Public Sector">Government & Public Sector</option>
                    <option value="Professional Services">Professional Services (Consulting, Legal)</option>
                    <option value="Logistics & Supply Chain">Logistics, Supply Chain & Transport</option>
                    <option value="Non-Profit">Non-Profit & Social Impact</option>
                    <option value="Media & Telecom">Media, Entertainment & Telecom</option>
                    <option value="Real Estate">Real Estate & Construction</option>
                    <option value="Hospitality">Hospitality & Tourism</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Role Level</label>
                  <select value={meta.role_level} onChange={(e) => setMeta({...meta, role_level: e.target.value})}>
                    <option value="">Select Level</option>
                    <option value="C-Suite">C-Suite</option>
                    <option value="SVP/VP/Director">SVP/VP / Director</option>
                    <option value="Middle Management">Middle Management</option>
                    <option value="Individual Contributor">Individual Contributor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Organization Size</label>
                  <select value={meta.org_size} onChange={(e) => setMeta({...meta, org_size: e.target.value})}>
                    <option value="">Select Size</option>
                    <option value="1-50">1-50 Employees</option>
                    <option value="51-500">51-500 Employees</option>
                    <option value="501-5000">501-5,000 Employees</option>
                    <option value="5000+">5,000+ Employees</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Region</label>
                  <select value={meta.region} onChange={(e) => setMeta({...meta, region: e.target.value})}>
                    <option value="North America">North America</option>
                    <option value="Europe (West/North)">Europe (Western & Northern)</option>
                    <option value="Europe (Central/East)">Europe (Central & Eastern)</option>
                    <option value="APAC - Southeast Asia">APAC - Southeast Asia</option>
                    <option value="APAC - East Asia">APAC - East Asia</option>
                    <option value="APAC - South Asia">APAC - South Asia</option>
                    <option value="APAC - Oceania">APAC - Oceania</option>
                    <option value="MENA">Middle East & North Africa (MENA)</option>
                    <option value="Sub-Saharan Africa">Sub-Saharan Africa</option>
                    <option value="Latin America">Latin America & Caribbean</option>
                    <option value="Global">Global / Other</option>
                  </select>
                </div>
              </div>

              <div className="diag-actions">
                <button 
                  disabled={ (mode === 'team_create' && !meta.organization_name) || !meta.industry || !meta.role_level || !meta.org_size} 
                  onClick={async () => {
                    try {
                      fetch('/api/diagnostic/start', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          email: identity.email,
                          name: identity.name,
                          organization: meta.organization_name || teamOrgName,
                          industry: meta.industry,
                          role_level: meta.role_level,
                          org_size: meta.org_size,
                          region: meta.region
                        })
                      }); // Non-blocking fire/forget
                    } catch (e) {
                      console.error('Failed to notify start:', e);
                    }
                    setStep(mode === 'team_create' ? 5 : 6);
                  }} 
                  className="btn-institutional primary"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: TEAM CONFIGURATION */}
          {step === 5 && (
            <motion.div key="invites" className="diag-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button className="btn-back-nav" onClick={() => setStep(4)}><ChevronLeft size={16} /> Back</button>
              <div className="step-count">Step 5 of 6</div>
              <h2>Team Configuration</h2>
              <p>Measure the alignment of your leadership system by inviting multiple perspectives.</p>
              
              <div className="team-intro-graphic">
                <Users size={48} className="text-teal mb-4" />
                <h3>Enable Team Analysis</h3>
                <p className="text-sm text-slate-500">A unique Team Code will be generated after you complete the diagnostic. You can invite colleagues now or share the link later.</p>
              </div>

              <div className="invites-list">
                <div className="label-row">
                  <label>Colleague Emails</label>
                  <span>Optional</span>
                </div>
                {invites.map((email, idx) => (
                  <div key={idx} className="invite-row">
                    <Mail size={16} className="text-slate-400" />
                    <input type="email" placeholder="colleague@org.com" value={email} onChange={(e) => updateInvite(idx, e.target.value)} />
                  </div>
                ))}
                <button className="btn-add-invite" onClick={addInvite}>+ Add Another</button>
              </div>

              <div className="diag-actions">
                <button 
                  disabled={isInviting}
                  onClick={async () => {
                    if (invites.some(i => i && i.includes('@'))) {
                      setIsInviting(true);
                      try {
                        const res = await fetch('/api/diagnostic/invite', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            email: identity.email,
                            name: identity.name,
                            organization: meta.organization_name || teamOrgName,
                            invites
                          })
                        });
                        const data = await res.json();
                        if (data.team_code) setServerTeamCode(data.team_code);
                      } catch (e) {
                        console.error('Invite failed:', e);
                      } finally {
                        setIsInviting(false);
                        setStep(6);
                      }
                    } else {
                      setStep(6);
                    }
                  }} 
                  className="btn-institutional primary"
                >
                  {isInviting ? 'Sending Invites...' : 'Continue to Assessment'}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 6: DIAGNOSTIC QUESTIONS */}
          {step === 6 && (
            <motion.div key="questions" className="diag-card questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {isSubmitting ? (
                <div className="submission-loading-view" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <Activity className="animate-pulse text-teal-600 mb-6 mx-auto" size={64} />
                  <h2 style={{ fontSize: '1.75rem', fontWeight: '950', marginBottom: '1rem' }}>Establishing Secure Connection</h2>
                  <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '400px', marginInline: 'auto' }}>
                    Transmitting behavioral signals to the Leadership Observatory for synthesis...
                  </p>
                  <div className="transmitting-bar-container" style={{ width: '100%', height: '4px', background: '#f1f5f9', borderRadius: '4px', marginTop: '3rem', overflow: 'hidden' }}>
                    <motion.div 
                      className="transmitting-bar-fill"
                      style={{ height: '100%', background: '#14b8a6' }}
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </div>
              ) : submissionError ? (
                <div className="submission-error-view" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <AlertCircle className="text-rose mb-6 mx-auto" size={64} />
                  <h2 style={{ fontSize: '1.75rem', fontWeight: '950', marginBottom: '1rem', color: '#0f172a' }}>Transmission Interrupted</h2>
                  <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                    {submissionError}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button onClick={submitDiagnostic} className="btn-institutional primary">Retry final transmission</button>
                    <button onClick={() => setStep(mode === 'team_create' ? 5 : 4)} className="btn-institutional outline">Review Form</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="diag-progress">
                    <div className="diag-progress-bar">
                      <div className="fill" style={{ width: `${(currentGlobalIndex / totalQuestions) * 100}%` }}></div>
                    </div>
                    <div className="diag-progress-label">Question {currentGlobalIndex + 1} of {totalQuestions} · {dimensions[currentDimIndex].name}</div>
                  </div>

                  <div className="question-content">
                    <motion.div key={currentGlobalIndex} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                      <p className="q-text">{dimensions[currentDimIndex].questions[currentQIndex].text}</p>
                      <div className="scale-legend">
                        <span>{dimensions[currentDimIndex].questions[currentQIndex].labels[0]}</span>
                        <span>{dimensions[currentDimIndex].questions[currentQIndex].labels[1]}</span>
                      </div>
                      <div className="scale-options-10">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                          <button key={val} className="scale-node" onClick={() => handleAnswer(val)}>
                            {val}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  <button className="btn-back-nav" onClick={() => {
                    if (currentQIndex > 0) setCurrentQIndex(0);
                    else if (currentDimIndex > 0) { setCurrentDimIndex(currentDimIndex - 1); setCurrentQIndex(1); }
                    else setStep(mode === 'team_create' ? 5 : 4);
                  }}><ChevronLeft size={16} /> Previous Question</button>
                </>
              )}
            </motion.div>
          )}

          {/* STEP 7: RESULTS */}
          {step === 7 && (
            <motion.div key="results" className="diag-card results-preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="results-body" style={{ textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.1)', color: '#14b8a6', marginBottom: '2rem' }}>
                  <TrendingUp size={40} />
                </div>
                <h1 style={{ fontSize: '2.5rem', color: '#0f172a', marginBottom: '0.75rem', fontWeight: '950', letterSpacing: '-0.03em' }}>Part 1 Complete</h1>
                <p style={{ color: '#64748b', fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '600px', marginInline: 'auto' }}>Your Perceptual Adaptiveness Profile has been successfully generated. Part 2 (Behavioral Measurement) is currently pending activation.</p>
              </div>
              
              {serverTeamCode && (
                <div className="team-code-badge" style={{ background: '#f8fafc', border: '2px solid #e2e8f0', padding: '2.5rem', borderRadius: '20px', marginBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#14b8a6' }}></div>
                  <div className="badge-label" style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em', marginBottom: '1rem', textTransform: 'uppercase' }}>TEAM ACCESS CODE</div>
                  <div className="code-display" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                    <span style={{ fontSize: '3rem', fontWeight: '900', fontFamily: 'monospace', color: '#0f172a', letterSpacing: '0.2em' }}>{serverTeamCode}</span>
                    <button 
                      className="btn-copy" 
                      onClick={() => {
                        navigator.clipboard.writeText(serverTeamCode);
                        setCopied('team');
                        setTimeout(() => setCopied(null), 2000);
                      }}
                      style={{ background: '#0f172a', border: 'none', color: 'white', width: '56px', height: '56px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    >
                      {copied === 'team' ? <CheckCircle size={24} color="#14b8a6" /> : <LinkIcon size={24} />}
                    </button>
                  </div>
                  {copied === 'team' && <div style={{ color: '#14b8a6', fontSize: '0.75rem', fontWeight: '800', marginTop: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Code Copied to Clipboard</div>}
                  {!copied && <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '1.5rem', fontWeight: '500' }}>Share this code with your team to enable aggregate alignment variance mapping.</p>}
                </div>
              )}

              <div className="report-access-card" style={{ background: '#0f172a', color: 'white', padding: '3rem', borderRadius: '24px', marginBottom: '3rem', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)', textAlign: 'left' }}>
                <div style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem', letterSpacing: '-0.02em', color: '#ffffff' }}>Leadership Adaptiveness Profile</h3>
                  <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.5' }}>Your individual results and research brief are now available for review.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <Link to={`/report/perception/${reportId}`} className="btn-institutional primary" style={{ background: '#14b8a6', color: 'white', padding: '1rem 2rem', borderRadius: '12px', textAlign: 'center', fontWeight: '700', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', textDecoration: 'none', flex: '1', minWidth: '200px' }}>
                    View Results Brief <ArrowRight size={20} />
                  </Link>
                  
                  <button 
                    onClick={() => {
                      const url = `${window.location.origin}/report/perception/${reportId}`;
                      navigator.clipboard.writeText(url);
                      setCopied('report');
                      setTimeout(() => setCopied(null), 2000);
                    }}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', padding: '1rem 2rem', borderRadius: '12px', color: 'white', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', transition: 'all 0.2s', flex: '1', minWidth: '200px' }}
                  >
                    {copied === 'report' ? <><CheckCircle size={18} color="#14b8a6" /> Copied!</> : <><LinkIcon size={18} /> Copy Report Link</>}
                  </button>
                </div>
              </div>

              <div className="next-steps-grid">
                <div className="info-node-premium">
                  <div className="info-icon">
                    <Mail size={24} />
                  </div>
                  <div className="info-content">
                    <strong className="info-title">Persistence Link</strong>
                    <span className="info-desc">A secure access link has been dispatched to <strong>{identity.email}</strong>.</span>
                  </div>
                </div>
                <div className="info-node-premium">
                  <div className="info-icon">
                    <TrendingUp size={24} />
                  </div>
                  <div className="info-content">
                    <strong className="info-title">Analytics Threshold</strong>
                    <span className="info-desc">Team-wide variance mapping activates upon reaching <strong>3+ completions</strong>.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .diagnostic-page { padding: 10rem 0 6rem; background: #f8fafc; min-height: 100vh; }
        .diag-card { 
          background: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 4rem; 
          box-shadow: 0 40px 100px -20px rgba(0,0,0,0.05); text-align: left;
        }
        .diag-card.intro { text-align: center; }
        .institutional-badge { 
          display: inline-block; padding: 0.5rem 1rem; background: #f1f5f9; color: #64748b; 
          border-radius: 99px; font-size: 0.65rem; font-weight: 900; letter-spacing: 2px;
          text-transform: uppercase; margin-bottom: 2rem;
        }
        h1 { font-size: 3rem; font-weight: 900; color: #0f172a; margin-bottom: 1.5rem; letter-spacing: -0.02em; }
        h2 { font-size: 2rem; font-weight: 950; color: #0f172a; margin-bottom: 1rem; }
        .lead-text { font-size: 1.25rem; color: #64748b; margin-bottom: 3rem; line-height: 1.6; }
        
        .process-preview { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; text-align: left; margin-bottom: 4rem; }
        .preview-item { display: flex; gap: 1rem; align-items: flex-start; }
        .p-icon { width: 40px; height: 40px; background: #f1f5f9; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #0f172a; flex-shrink: 0; }
        .p-text { font-size: 0.95rem; color: #64748b; line-height: 1.4; }
        .p-text strong { display: block; color: #0f172a; margin-bottom: 0.25rem; }

        .btn-back-nav { 
          background: none; border: none; color: #94a3b8; font-weight: 800; font-size: 0.75rem; 
          text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 0.5rem;
          margin-bottom: 2rem; cursor: pointer; padding: 0;
        }

        .step-count { font-size: 0.65rem; font-weight: 900; color: #14b8a6; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 0.5rem; }
        
        /* Mode Grid */
        .mode-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin: 2rem 0; }
        .mode-btn { 
          background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2rem;
          display: flex; flex-direction: column; align-items: center; text-align: center;
          cursor: pointer; transition: all 0.2s;
        }
        .mode-btn:hover { border-color: #2dd4bf; y: -2px; }
        .mode-btn.active { border-color: #0f172a; background: #f8fafc; border-width: 2px; }
        .mode-btn strong { display: block; margin: 1rem 0 0.5rem; font-size: 1.1rem; color: #0f172a; }
        .mode-btn span { font-size: 0.8rem; color: #64748b; }

        .mode-input-row { margin-bottom: 2rem; position: relative; }
        .mode-input-row input { 
          width: 100%; padding: 1.25rem; border: 1px solid #e2e8f0; border-radius: 12px;
          font-family: monospace; font-size: 1.5rem; text-align: center; letter-spacing: 0.5rem;
          color: #0f172a; outline: none; transition: border-color 0.2s;
        }
        .mode-input-row input:focus { border-color: #2dd4bf; }
        .team-found-label { position: absolute; bottom: -1.5rem; left: 0; width: 100%; text-align: center; font-size: 0.75rem; color: #64748b; }

        /* Consent Box */
        .consent-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2rem; margin: 2rem 0; }
        .consent-check { display: flex; gap: 1rem; align-items: center; cursor: pointer; margin-bottom: 1.5rem; }
        .checkbox { 
          width: 24px; height: 24px; border: 2px solid #cbd5e1; border-radius: 6px; 
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .checkbox.checked { border-color: #14b8a6; background: #14b8a6; color: white; }
        .consent-check p { margin: 0; font-size: 1rem; color: #0f172a; font-weight: 500; }
        .consent-info { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; color: #64748b; font-style: italic; }

        /* Meta Grid */
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.65rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; }
        .form-group input, .form-group select { 
          padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; color: #0f172a; outline: none;
        }
        .form-group input:focus { border-color: #2dd4bf; }

        /* Team Invite */
        .team-intro-graphic { text-align: center; margin-bottom: 2.5rem; background: #f8fafc; padding: 2rem; border-radius: 16px; border: 1px solid #e2e8f0; }
        .team-intro-graphic h3 { font-size: 1.25rem; margin-bottom: 0.5rem; color: #0f172a; }

        .team-code-badge { background: #0f172a; color: white; padding: 2rem; border-radius: 16px; display: flex; flex-direction: column; align-items: center; margin: 2rem 0; }
        .team-code-badge.success { background: #14b8a6; }
        .badge-label { font-size: 0.6rem; font-weight: 900; letter-spacing: 2px; color: rgba(255,255,255,0.6); margin-bottom: 1rem; }
        .code-display { display: flex; align-items: center; gap: 1rem; font-size: 2.5rem; font-weight: 900; font-family: monospace; letter-spacing: 0.5rem; }
        .btn-copy { background: rgba(255,255,255,0.1); border: none; color: white; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        
        .invites-list { margin-bottom: 2.5rem; }
        .label-row { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
        .label-row span { font-size: 0.65rem; color: #cbd5e1; font-weight: 600; text-transform: uppercase; }
        .invite-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem; }
        .invite-row input { border: none; flex: 1; outline: none; padding: 0.5rem 0; font-size: 1rem; }
        .btn-add-invite { background: none; border: none; color: #14b8a6; font-size: 0.85rem; font-weight: 800; cursor: pointer; padding: 0.5rem 0; }

        /* Questions */
        .diag-progress { margin-bottom: 4rem; }
        .diag-progress-bar { height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; margin-bottom: 1rem; }
        .diag-progress-bar .fill { height: 100%; background: #2dd4bf; transition: width 0.3s ease; }
        .diag-progress-label { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }

        .question-content { min-height: 300px; margin-bottom: 4rem; }
        .q-text { font-size: 2.25rem; font-weight: 900; color: #0f172a; margin-bottom: 4rem; line-height: 1.2; letter-spacing: -0.02em; }
        
        .scale-legend { display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.7rem; font-weight: 900; color: #cbd5e1; text-transform: uppercase; letter-spacing: 1.5px; }
        .scale-options-10 { display: grid; grid-template-columns: repeat(10, 1fr); gap: 0.75rem; }
        .scale-node { 
          aspect-ratio: 1; border: 1.5px solid #e2e8f0; border-radius: 12px; 
          font-weight: 800; color: #64748b; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; font-size: 1.1rem;
        }
        .scale-node:hover { border-color: #0f172a; color: #0f172a; background: #f8fafc; transform: translateY(-3px); }

        /* Results */
        .results-preview { text-align: center; }
        .results-intro { margin-bottom: 4rem; }
        .results-intro h1 { margin-top: 1.5rem; }
        
        .report-access-card { 
          background: #0f172a; border-radius: 20px; padding: 3rem; color: white;
          display: flex; justify-content: space-between; align-items: center; text-align: left;
          margin-bottom: 4rem;
        }
        .access-info h3 { font-size: 1.5rem; margin-bottom: 0.5rem; color: white; }
        .access-info p { color: #94a3b8; margin: 0; }

        .next-steps-info { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; text-align: left; border-top: 1px solid #f1f5f9; pt: 3rem; }
        .info-node { display: flex; gap: 1rem; }
        .info-node strong { display: block; color: #0f172a; margin-bottom: 0.25rem; }
        .info-node span { font-size: 0.85rem; color: #64748b; line-height: 1.4; }

        .diag-actions { display: flex; justify-content: flex-end; margin-top: 3rem; }
        
        .btn-institutional.full-width { width: 100%; justify-content: center; padding: 1.5rem; font-size: 1.25rem; }

        @media (max-width: 768px) {
          .mode-grid, .meta-grid, .process-preview, .next-steps-info, .next-steps-grid { grid-template-columns: 1fr; }
          .diag-card { padding: 2rem; }
          .report-access-card { padding: 2rem !important; flex-direction: column !important; gap: 2rem !important; }
          .report-access-card > div { width: 100%; }
          .report-access-card .btn-institutional { width: 100%; }
          .scale-options-10 { grid-template-columns: repeat(5, 1fr); gap: 0.5rem; }
          .results-body h1 { font-size: 2rem !important; }
          .results-body p { font-size: 1.1rem !important; }
          .team-code-badge { padding: 1.5rem !important; }
          .code-display { font-size: 2rem !important; gap: 0.75rem !important; }
        }

        .next-steps-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .info-node-premium { background: white; padding: 2rem; border-radius: 20px; border: 1px solid #e2e8f0; display: flex; gap: 1.5rem; align-items: flex-start; text-align: left; }
        .info-icon { width: 48px; height: 48px; border-radius: 12px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #14b8a6; flex-shrink: 0; }
        .info-title { display: block; fontSize: 1.1rem; color: #0f172a; margin-bottom: 0.5rem; }
        .info-desc { fontSize: 0.9rem; color: #64748b; margin-bottom: 0.5rem; line-height: 1.6; }
      `}</style>
    </div>
  );
};

export default DiagnosticPage;
