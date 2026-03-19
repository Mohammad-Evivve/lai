import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Download, Globe, Shield, Target, 
  Activity, Users, FileText, Lock, CheckCircle2,
  AlertCircle, ChevronRight, BarChart3, Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import RelatedPathwaysSection from '../components/RelatedPathwaysSection';

// --- Animated Heatmap Component ---
const GlobalHeatmap = () => {
  return (
    <div className="relative w-full h-[400px] bg-slate-900/50 rounded-3xl overflow-hidden border border-white/5">
      <svg viewBox="0 0 800 400" className="w-full h-full opacity-40">
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Abstract World Map Dots */}
        {[...Array(200)].map((_, i) => {
          const x = Math.random() * 800;
          const y = Math.random() * 400;
          const isActive = Math.random() > 0.7;
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={isActive ? Math.random() * 2 + 1 : 0.5}
              fill={isActive ? '#2dd4bf' : '#475569'}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: isActive ? [0.2, 0.8, 0.2] : 0.2,
                scale: isActive ? [1, 1.2, 1] : 1
              }}
              transition={{ 
                duration: Math.random() * 3 + 2, 
                repeat: Infinity,
                delay: Math.random() * 5
              }}
              filter={isActive ? "url(#glow)" : ""}
            />
          );
        })}

        {/* Connections */}
        {[...Array(15)].map((_, i) => (
          <motion.path
            key={i}
            d={`M ${Math.random() * 800} ${Math.random() * 400} Q ${Math.random() * 800} ${Math.random() * 400} ${Math.random() * 800} ${Math.random() * 400}`}
            stroke="#2dd4bf"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.2, 0] }}
            transition={{ 
              duration: Math.random() * 5 + 5, 
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}

        {/* Data Markers (Purposeful Evidence) */}
        {[...Array(6)].map((_, i) => {
          const x = 100 + (i * 120);
          const y = 100 + (Math.sin(i) * 50);
          return (
            <g key={`marker-${i}`}>
              <circle cx={x} cy={y} r="2" fill="#2dd4bf" />
              <text x={x + 5} y={y + 3} fill="#94a3b8" className="text-[6px] font-mono uppercase">SIG_{i+102}</text>
              <motion.rect 
                x={x-4} y={y-4} width="8" height="8" stroke="#2dd4bf" strokeWidth="0.5" fill="none"
                animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 1] }}
                transition={{ duration: 4, repeat: Infinity, delay: i }}
              />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      
      {/* Evidence Label */}
      <div className="absolute top-8 left-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-teal shadow-[0_0_8px_#2dd4bf] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal">Global Behavioral Evidence</span>
        </div>
      </div>

      {/* Caption */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-6 text-center">
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.1em]">
          A visual abstraction of the measured behavioral signals behind the 2026 State of Cognition report.
        </p>
      </div>
    </div>
  );
};

// --- Custom SVG Chart Components ---
const AdaptivenessByRegion = () => (
  <div className="bg-slate-900/40 p-8 rounded-2xl border border-white/5 h-full">
    <h4 className="text-white font-serif text-lg mb-6">Adaptiveness by Region</h4>
    <div className="space-y-4">
      {[
        { region: 'North America', score: 68, color: '#3b82f6' },
        { region: 'Europe', score: 72, color: '#2dd4bf' },
        { region: 'Asia Pacific', score: 64, color: '#8b5cf6' },
        { region: 'Global Average', score: 67, color: '#f59e0b' }
      ].map((item) => (
        <div key={item.region}>
          <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            <span>{item.region}</span>
            <span>{item.score}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: `${item.score}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: item.color }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const GapIndexDistribution = () => (
  <div className="bg-slate-900/40 p-8 rounded-2xl border border-white/5 h-full">
    <h4 className="text-white font-serif text-lg mb-6">The Gap Index Distribution</h4>
    <div className="flex items-end justify-between h-32 gap-2">
      {[15, 25, 45, 80, 60, 40, 20].map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <motion.div 
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            className={`w-full rounded-t-sm ${i === 3 ? 'bg-teal' : 'bg-slate-700'}`}
            transition={{ duration: 1, delay: i * 0.1 }}
          />
        </div>
      ))}
    </div>
    <div className="flex justify-between mt-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
      <span>Narrow Gap</span>
      <span>Structural Collapse</span>
    </div>
  </div>
);

// --- Section Header ---
const SectionHeader = ({ eyebrow, title, light = false }) => (
  <div className="mb-12">
    <span className={`inline-block mb-4 text-[11px] font-bold uppercase tracking-[0.3em] ${light ? 'text-slate-400' : 'text-teal'}`}>
      {eyebrow}
    </span>
    <h2 className={`text-3xl md:text-4xl font-serif ${light ? 'text-white' : 'text-slate-900'}`}>
      {title}
    </h2>
  </div>
);

const StateOfCognitionPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    industry: '',
    role: '',
    region: 'North America'
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/report-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to submit');
      
      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 bg-slate-950 overflow-hidden">
        {/* Ambient background */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-teal text-[11px] font-bold uppercase tracking-[0.2em] mb-8">
                Flagship Research Report
              </span>
              <h1 className="text-5xl md:text-7xl font-serif text-white mb-8 tracking-tight leading-[1.1]">
                The State of <span className="text-slate-400 italic">Cognition</span> 2026
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 font-light leading-relaxed mb-12 max-w-3xl mx-auto">
                A global behavioral analysis of how leaders interpret change, 
                make decisions, and translate awareness into action.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <GlobalHeatmap />
            </motion.div>

            {/* Authority Metrics Strip */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 border-t border-white/10 pt-12 text-left">
              {[
                { label: 'Behaviors Analyzed', val: '715 Records' },
                { label: 'Locations', val: '10 Global' },
                { label: 'Dimensions', val: '5 Measured' },
                { label: 'Methodology', val: 'Evivve + LAI' }
              ].map((m, i) => (
                <div key={i}>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">{m.label}</p>
                  <p className="text-xl font-serif text-white">{m.val}</p>
                </div>
              ))}
            </div>

            {/* Hero CTAs */}
            <div className="mt-12 flex flex-col md:flex-row gap-6 justify-center">
              <a href="#download" className="bg-teal text-slate-950 px-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-teal/90 transition-all group">
                Download Full Report <Download size={20} />
              </a>
              <a href="#findings" className="px-10 py-5 rounded-2xl font-bold border border-white/20 text-white flex items-center justify-center gap-3 hover:bg-white/5 transition-all">
                Explore Key Findings <ArrowRight size={20} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* --- KEY FINDINGS SECTION (Editorial) --- */}
      <section id="findings" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <SectionHeader eyebrow="Executive Summary" title="Key Findings 2026" />
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  title: 'The Conversion Gap', 
                  desc: 'Organizations are detecting disruption 14 months before they are able to pivot. This delay is the single largest contributor to competitive erosion.',
                  stat: '14mo Lag'
                },
                { 
                  title: 'Cognitive Geography', 
                  desc: 'Adaptiveness is no longer bound by sector but by regulatory posture. High-trust societies demonstrate 2.4x higher velocity in signal processing.',
                  stat: '2.4x Velocity'
                },
                { 
                  title: 'Execution Bottlenecks', 
                  desc: 'The primary constraint is not technical capability but social alignment. Decisions stall at the "mid-level freeze" during high-uncertainty events.',
                  stat: '68% Stall'
                }
              ].map((card, i) => (
                <div key={i} className="group p-10 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-slate-950 hover:text-white transition-all duration-500">
                  <p className="text-teal font-black text-sm mb-6 uppercase tracking-widest">{card.stat}</p>
                  <h3 className="text-2xl font-serif mb-4 group-hover:text-white">{card.title}</h3>
                  <p className="text-slate-500 group-hover:text-slate-400 font-light leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- PROBLEM SECTION --- */}
      <section id="problem" className="py-24 bg-slate-50 border-y border-slate-100">

        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeader eyebrow="The Behavioral Paradox" title="The Adaptiveness Gap" />
              <div className="space-y-6 text-lg text-slate-600 font-light leading-relaxed">
                <p>
                  Leadership today does not fail because it cannot see change. 
                  It fails because it cannot translate recognition into action.
                </p>
                <p>
                  Our research reveals a structural disconnect between executive 
                  awareness and systemic responsiveness—a gap that defines the 
                  difference between institutional survival and collapse.
                </p>
              </div>
              <div className="mt-10 flex gap-12">
                <div>
                  <p className="text-4xl font-serif text-slate-900 mb-1">82%</p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Correctly detect signals</p>
                </div>
                <div className="w-px h-12 bg-slate-200" />
                <div>
                  <p className="text-4xl font-serif text-slate-900 mb-1">14%</p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reallocate resources in time</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-12 rounded-3xl border border-slate-100">
              <blockquote className="text-2xl font-serif text-slate-800 italic leading-relaxed">
                "Modern volatility has outpaced the human capacity for unassisted alignment. 
                The 'Gap' is no longer a performance issue—it is an existential risk."
              </blockquote>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Dr. Helena Vance</p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Director of Research, LAI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- ADVANCED MEASUREMENTS SECTION --- */}
      <section id="measurements" className="py-24 bg-slate-950 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-2xl">
                <SectionHeader eyebrow="Deep Evidence" title="Measurement Architecture" light={true} />
                <p className="text-slate-400 font-light text-lg">
                  Visualizing the behavioral telemetry gathered from 715 global leadership records.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-white/5 rounded border border-white/10 text-[10px] font-bold uppercase tracking-widest text-teal">
                  AFERR Telemetry
                </div>
                <div className="px-4 py-2 bg-white/5 rounded border border-white/10 text-[10px] font-bold uppercase tracking-widest text-teal">
                  98.4% Confidence
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Visual 1: Score by Location */}
              <div className="bg-white/5 p-10 rounded-3xl border border-white/10">
                <h4 className="font-serif text-xl mb-8">Adaptiveness by Location</h4>
                <div className="space-y-6">
                  {[
                    { loc: 'Singapore', val: 74.2 },
                    { loc: 'London', val: 68.5 },
                    { loc: 'New York', val: 67.8 },
                    { loc: 'Dubai', val: 62.1 }
                  ].map((item, i) => (
                    <div key={item.loc}>
                      <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.loc}</span>
                        <span className="text-teal font-serif">{item.val}</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.val}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full bg-teal"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual 2: Forecasting Gap */}
              <div className="bg-white/5 p-10 rounded-3xl border border-white/10 flex flex-col">
                <h4 className="font-serif text-xl mb-6">Forecasting vs Realization Gap</h4>
                <div className="flex-1 flex items-end gap-1 min-h-[160px]">
                  {[40, 55, 45, 70, 85, 60, 45, 30].map((h, i) => (
                    <div key={i} className="flex-1 space-y-1">
                      <motion.div initial={{ height: 0 }} whileInView={{ height: `${h}%` }} className="bg-teal/20 rounded-t-sm" transition={{ duration: 1, delay: i * 0.05 }} />
                      <motion.div initial={{ height: 0 }} whileInView={{ height: `${h * 0.6}%` }} className="bg-teal rounded-t-sm" transition={{ duration: 1, delay: 0.5 + (i * 0.05) }} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Recognition Velocity</span>
                  <span>Execution Responsiveness</span>
                </div>
              </div>

              {/* Visual 3: 5-Dimension Radar */}
              <div className="bg-white/5 p-10 rounded-3xl border border-white/10">
                <h4 className="font-serif text-xl mb-6">5-Dimension Portfolio</h4>
                <div className="aspect-square relative flex items-center justify-center p-8">
                   <svg viewBox="0 0 200 200" className="w-full max-w-[200px] overflow-visible">
                      <circle cx="100" cy="100" r="80" stroke="rgba(255,255,255,0.05)" fill="none" />
                      <circle cx="100" cy="100" r="60" stroke="rgba(255,255,255,0.05)" fill="none" />
                      <circle cx="100" cy="100" r="40" stroke="rgba(255,255,255,0.05)" fill="none" />
                      <motion.polygon 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        points="100,20 180,80 150,160 50,160 20,80" 
                        fill="rgba(45,212,191,0.15)" 
                        stroke="#2dd4bf" 
                        strokeWidth="1.5"
                      />
                   </svg>
                   <div className="absolute inset-0 flex flex-col justify-between text-[7px] font-bold text-slate-500 uppercase p-2 text-center pointer-events-none">
                      <span className="text-teal">Signal Detection</span>
                      <div className="flex justify-between w-full mt-auto mb-10 translate-y-4">
                        <span>Calibration</span>
                        <span>Coherence</span>
                      </div>
                      <div className="flex justify-around w-full mb-4">
                        <span>Velocity</span>
                        <span>Resilience</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* Visual 4: Architecture */}
              <div className="bg-white/5 p-10 rounded-3xl border border-white/10">
                <h4 className="font-serif text-xl mb-8">Architecture of Measurement</h4>
                <div className="flex flex-col gap-8">
                  {[
                    { label: 'Evivve Behavioral Simulation', desc: 'Raw telemetry from high-stakes leadership events.' },
                    { label: 'AFERR Logics Engine', desc: 'Decoding 5 dimensions of systemic response.' },
                    { label: 'Institutional LAI Score', desc: 'The definitive adaptive capacity benchmark.' }
                  ].map((step, i) => (
                    <div key={step.label} className="relative flex gap-6">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-teal font-bold shrink-0">
                        {i+1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white mb-1">{step.label}</p>
                        <p className="text-xs text-slate-500 font-light">{step.desc}</p>
                      </div>
                      {i < 2 && <div className="absolute left-5 top-10 w-px h-8 bg-white/10" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* --- INSIGHTS SECTION --- */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <SectionHeader eyebrow="Institutional Insights" title="Core Research Findings" />
            
            <div className="space-y-12 mt-16">
              {[
                { 
                  id: '01', 
                  title: 'Awareness is not the constraint', 
                  body: 'Leaders across regions demonstrate strong signal detection but fail in execution responsiveness. The bottleneck is not vision—it is internal structural inertia.' 
                },
                { 
                  id: '02', 
                  title: 'The Gap is systemic, not individual', 
                  body: 'Failure frequently occurs at the system level through misaligned reporting structures and incentive models that prioritize stability over response.' 
                },
                { 
                  id: '03', 
                  title: 'Resource inertia remains the primary failure mode', 
                  body: 'Budgets lag cognition by 18-24 months in 62% of observed organizations, creating a permanent state of strategic obsolescence.' 
                }
              ].map((insight) => (
                <div key={insight.id} className="flex gap-10 items-start border-b border-slate-100 pb-12">
                  <span className="text-5xl font-serif text-slate-100">{insight.id}</span>
                  <div>
                    <h3 className="text-2xl font-serif text-slate-900 mb-4">{insight.title}</h3>
                    <p className="text-lg text-slate-500 font-light leading-relaxed max-w-3xl">{insight.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- DOWNLOAD SECTION --- */}
      <section id="download" className="py-24 bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto bg-slate-950 rounded-[40px] overflow-hidden border border-white/5 shadow-2xl relative">
            <div className="grid lg:grid-cols-2">
              {/* Left: Visual */}
              <div className="p-16 lg:p-24 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.1),transparent)] flex flex-col justify-center items-center text-center">
                  <div className="relative group cursor-pointer h-full flex flex-col items-center py-8">
                    {/* Shadow Layer 2 */}
                    <div className="absolute w-[280px] h-[380px] bg-slate-800 rounded shadow-2xl translate-x-4 translate-y-4 -rotate-3 opacity-20" />
                    {/* Shadow Layer 1 */}
                    <div className="absolute w-[280px] h-[380px] bg-slate-700 rounded shadow-xl translate-x-2 translate-y-2 -rotate-1 opacity-20" />
                    
                    {/* Primary Page */}
                    <div className="relative w-[280px] h-[380px] bg-[#fdfdfd] rounded shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col p-8 text-left transition-all duration-500 group-hover:scale-[1.05] group-hover:-rotate-2 rotate-2 border-l-[12px] border-slate-100">
                      {/* Paper Texture Overlay */}
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]" />
                      
                      <div className="flex justify-between items-start mb-12 relative z-10">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-black tracking-tighter text-slate-900">LAI</span>
                          <span className="text-[7px] font-mono text-slate-400 mt-0.5">REF_2026_SOC</span>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-slate-900/10 flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full border-2 border-slate-900 opacity-20" />
                        </div>
                      </div>

                      <div className="mt-auto relative z-10">
                        <div className="mb-6 opacity-40">
                          <div className="h-0.5 w-12 bg-slate-200 mb-1" />
                          <div className="h-0.5 w-8 bg-slate-200" />
                        </div>
                        
                        <h4 className="text-3xl font-serif text-slate-900 font-medium leading-tight mb-6">
                          State of <br/>
                          <span className="italic text-slate-500">Cognition</span><br/>
                          2026
                        </h4>
                        
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-1 bg-teal" />
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Institutional Edition</span>
                        </div>
                        
                        <div className="pt-6 border-t border-slate-100">
                          <p className="text-[9px] font-bold text-slate-900 uppercase tracking-widest mb-1">Global Behavioral Analysis</p>
                          <p className="text-[7px] text-slate-400 uppercase tracking-widest">Evidence-Based Research Framework</p>
                        </div>
                      </div>

                      {/* Administrative Stamp */}
                      <div className="absolute top-1/2 right-4 -translate-y-1/2 rotate-90 opacity-[0.05] pointer-events-none">
                        <span className="text-4xl font-black text-slate-900 whitespace-nowrap tracking-[0.5em]">CONFIDENTIAL</span>
                      </div>
                    </div>
                  <div className="mt-12">
                    <p className="text-slate-400 font-light italic mb-2">124 Pages of Behavior-First Insights</p>
                    <div className="flex items-center justify-center gap-2 text-teal">
                      <FileText size={16} />
                      <span className="text-[11px] font-bold uppercase tracking-widest">PDF | 14.2 MB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Form */}
              <div className="p-12 lg:p-20 bg-slate-900/50">
                <div className="mb-10 text-center lg:text-left">
                  <h2 className="text-3xl font-serif text-white mb-4">Download the Full Report</h2>
                  <p className="text-slate-400 font-light">Enter your details to receive the flagship research publication via email.</p>
                </div>

                {!submitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-slate-800 border-none rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal outline-none transition-all"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Work Email</label>
                        <input 
                          type="email" 
                          required
                          className="w-full bg-slate-800 border-none rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal outline-none transition-all"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Organization</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-800 border-none rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal outline-none transition-all"
                        value={formData.organization}
                        onChange={(e) => setFormData({...formData, organization: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Primary Role / Title</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-800 border-none rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal outline-none transition-all"
                        placeholder="e.g. VP Strategy"
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Industry</label>
                        <select 
                          className="w-full bg-slate-800 border-none rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal outline-none transition-all appearance-none"
                          value={formData.industry}
                          onChange={(e) => setFormData({...formData, industry: e.target.value})}
                          required
                        >
                          <option value="">Select Industry</option>
                          <option value="Technology">Technology</option>
                          <option value="Finance & Insurance">Finance & Insurance</option>
                          <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                          <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                          <option value="Energy & Utilities">Energy & Utilities</option>
                          <option value="Retail & Consumer Goods">Retail & Consumer Goods</option>
                          <option value="Education">Education</option>
                          <option value="Government & Public Sector">Government & Public Sector</option>
                          <option value="Professional Services">Professional Services</option>
                          <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                          <option value="Non-Profit">Non-Profit & Social Impact</option>
                          <option value="Media & Telecom">Media & Telecom</option>
                          <option value="Real Estate">Real Estate & Construction</option>
                          <option value="Hospitality">Hospitality & Tourism</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Region</label>
                        <select 
                          className="w-full bg-slate-800 border-none rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal outline-none transition-all appearance-none"
                          value={formData.region}
                          onChange={(e) => setFormData({...formData, region: e.target.value})}
                        >
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

                    {error && (
                      <div className="flex items-center gap-2 text-rose-500 text-xs font-bold bg-rose-500/10 p-4 rounded-lg border border-rose-500/20">
                        <AlertCircle size={14} />
                        {error}
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="w-full bg-teal hover:bg-teal/90 text-slate-950 font-black uppercase tracking-[0.2em] text-[12px] py-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>Processing...</>
                      ) : (
                        <>Request Download <ChevronRight size={18} /></>
                      )}
                    </button>
                    
                    <p className="text-[9px] text-slate-500 text-center uppercase tracking-widest leading-relaxed">
                      By downloading, you agree to the LAI Data Privacy Standards. 
                      Your data is encrypted and used exclusively for institutional research.
                    </p>
                  </form>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-teal/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-teal/20">
                      <CheckCircle2 size={40} className="text-teal" />
                    </div>
                    <h3 className="text-3xl font-serif text-white mb-4">Request Received</h3>
                    <p className="text-slate-400 font-light mb-8 max-w-sm mx-auto">
                      A secure link to the 2026 report has been sent to <span className="text-teal font-medium">{formData.email}</span>.
                    </p>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="text-[11px] font-bold text-teal uppercase tracking-widest border-b border-teal/30 pb-1"
                    >
                      Request another copy
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTINUATION CTA --- */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <span className="text-teal font-bold uppercase tracking-[0.3em] text-[11px] mb-6 block">The Flywheel</span>
            <h2 className="text-4xl font-serif text-slate-900 mb-8 lowercase">
              how does your <span className="italic text-slate-400">leadership system</span> compare?
            </h2>
            <p className="text-xl text-slate-500 font-light mb-12 leading-relaxed">
              Transition from global benchmarks to individual insight. 
              Run the Leadership Adaptiveness Diagnostic for your team.
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <Link to="/diagnostic" className="bg-slate-950 text-white px-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all group">
                Measure Your System <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/observatory" className="px-10 py-5 rounded-2xl font-bold border border-slate-200 text-slate-900 flex items-center justify-center gap-3 hover:bg-slate-50 transition-all">
                Explore the Observatory
              </Link>
            </div>
          </div>
        </div>
      </section>

      <RelatedPathwaysSection 
        relatedPaths={['/research', '/observatory', '/framework', '/gap']}
        eyebrow="Evolution"
        title="Further Pathways"
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .container { max-width: 1400px; }
        @media (max-width: 768px) {
          .font-serif { font-size: 2.5rem !important; }
        }
      `}} />
    </div>
  );
};

export default StateOfCognitionPage;
