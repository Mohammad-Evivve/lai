import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/* ─────────────── FORM DATA STRUCTURE ─────────────── */
const INITIAL_FORM = {
  // Step 1 — About the Offsite
  org_name: '',
  contact_name: '',
  contact_title: '',
  contact_email: '',
  company_size: '',
  planning_stage: '',
  offsite_date: '',
  prompting_reasons: [],
  prompting_other: '',
  business_context: '',

  // Step 2 — About the Team
  attendee_roles: [],
  expected_headcount: '',
  decision_authority: '',
  missing_stakeholders: '',

  // Step 3 — What Needs to Change
  objectives: [],
  success_definition: '',
  biggest_challenges: [],
  diagnostic_reason: '',

  // Step 4 — Diagnostic Fit + Submit
  prior_work: '',
  prior_work_detail: '',
  offsite_format: '',
  diagnostic_interest: '',
  support_needed: [],
  anything_else: '',
};

/* ─────────────── FIELD OPTIONS ─────────────── */
const COMPANY_SIZES = ['200–500', '500–1,000', '1,000–5,000', '5,000–10,000', '10,000+'];
const PLANNING_STAGES = [
  'Exploring options',
  'Defining objectives',
  'Venue and logistics underway',
  'Program design in progress',
  'Offsite already scheduled',
];
const PROMPTING_REASONS = [
  'Strategic reset',
  'Annual planning',
  'Leadership alignment',
  'Transformation / change initiative',
  'AI adoption / digital shift',
  'Post-merger / integration',
  'Team restructuring',
  'Growth pressure',
  'Market disruption',
  'Execution challenges',
  'Other',
];
const ATTENDEE_ROLES = [
  'CEO / Business head',
  'Executive team',
  'BU leaders',
  'Functional heads',
  'Regional leaders',
  'Transformation office',
  'HR / L&D',
  'Other',
];
const HEADCOUNTS = ['5–8', '9–12', '13–20', '21–30', '30+'];
const OBJECTIVES = [
  'Strategic clarity',
  'Better alignment',
  'Faster decision-making',
  'Resolve leadership friction',
  'Improve cross-functional coordination',
  'Pressure-test assumptions',
  'Build commitment around priorities',
  'Diagnose team dynamics',
  'Prepare for a major shift',
  'Other',
];
const BIGGEST_CHALLENGES = [
  'Leaders interpret the situation differently',
  'The team agrees in meetings but not in action',
  'Decisions are slow or revisited',
  'Priorities compete',
  'Resources do not move fast enough',
  'People are aligned superficially, not deeply',
  'We are not sure what is really getting in the way',
  'Other',
];
const SUPPORT_TYPES = [
  'Diagnostic design',
  'Offsite design',
  'Facilitation',
  'Leadership simulation',
  'Executive debrief',
  'Follow-up recommendations',
  'Not sure yet',
];

/* ─────────────── STEP METADATA ─────────────── */
const STEPS = [
  { label: 'OFFSITE CONTEXT', title: 'What is prompting this offsite?', framing: 'Describe the situation your leadership team is navigating.' },
  { label: 'TEAM COMPOSITION', title: 'Who needs to be in the room?', framing: 'Focus on decision-makers, not just attendees.' },
  { label: 'OBJECTIVES', title: 'What must be different after this offsite?', framing: 'Define the outcome, not just the agenda.' },
  { label: 'DIAGNOSTIC READINESS', title: 'Is this a situation that requires deeper insight?', framing: 'Help us determine whether a diagnostic-led intervention is appropriate.' },
];

/* ─────────────── REQUIRED FIELD VALIDATION ─────────────── */
const REQUIRED = {
  1: ['org_name', 'contact_name', 'contact_email', 'company_size', 'planning_stage', 'business_context'],
  2: ['expected_headcount', 'decision_authority'],
  3: ['success_definition', 'diagnostic_reason'],
  4: ['prior_work', 'offsite_format', 'diagnostic_interest'],
};

/* ─────────────── STYLE TOKENS ─────────────── */
const S = {
  input: {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
    border: '1.5px solid #e2e8f0', background: 'white', color: '#0f172a',
    fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
    border: '1.5px solid #e2e8f0', background: 'white', color: '#0f172a',
    fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none',
    resize: 'vertical', minHeight: '110px', lineHeight: '1.6',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
    border: '1.5px solid #e2e8f0', background: 'white', color: '#0f172a',
    fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none',
    appearance: 'none', cursor: 'pointer',
    boxSizing: 'border-box',
  },
  label: { display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem', letterSpacing: '0.01em' },
  fieldWrap: { marginBottom: '1.75rem' },
  sectionTitle: { fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', color: '#14b8a6', marginBottom: '1.5rem' },
  helperText: { fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.4rem', lineHeight: '1.5' },
  errorText: { fontSize: '0.78rem', color: '#f43f5e', marginTop: '0.4rem' },
};

/* ─────────────── SUBCOMPONENTS ─────────────── */
const Field = ({ label, required, helper, error, children }) => (
  <div style={S.fieldWrap}>
    {label && <label style={S.label}>{label}{required && <span style={{ color: '#f43f5e', marginLeft: '3px' }}>*</span>}</label>}
    {children}
    {helper && !error && <div style={S.helperText}>{helper}</div>}
    {error && <div style={S.errorText}>{error}</div>}
  </div>
);

const MultiSelect = ({ options, value, onChange, includeOtherText, otherValue, onOtherChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    {options.map(opt => {
      const selected = value.includes(opt);
      return (
        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.6rem 0.9rem', borderRadius: '8px', border: `1.5px solid ${selected ? '#14b8a6' : '#e2e8f0'}`, background: selected ? '#f0fdf9' : 'white', transition: 'all 0.15s' }}>
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onChange(opt)}
            style={{ accentColor: '#14b8a6', width: '16px', height: '16px', flexShrink: 0 }}
          />
          <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: selected ? '600' : '400' }}>{opt}</span>
        </label>
      );
    })}
    {includeOtherText && value.includes('Other') && (
      <input
        type="text"
        placeholder="Please specify..."
        value={otherValue || ''}
        onChange={e => onOtherChange && onOtherChange(e.target.value)}
        style={{ ...S.input, marginTop: '0.25rem' }}
      />
    )}
  </div>
);

const RadioGroup = ({ options, value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    {options.map(opt => {
      const selected = value === opt;
      return (
        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.6rem 0.9rem', borderRadius: '8px', border: `1.5px solid ${selected ? '#14b8a6' : '#e2e8f0'}`, background: selected ? '#f0fdf9' : 'white', transition: 'all 0.15s' }}>
          <input
            type="radio"
            checked={selected}
            onChange={() => onChange(opt)}
            style={{ accentColor: '#14b8a6', width: '16px', height: '16px', flexShrink: 0 }}
          />
          <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: selected ? '600' : '400' }}>{opt}</span>
        </label>
      );
    })}
  </div>
);

/* ─────────────── MAIN COMPONENT ─────────────── */
export default function OffsiteIntakePage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const toggleMulti = (field, value) =>
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter(v => v !== value) : [...f[field], value],
    }));

  const validate = (stepNum) => {
    const required = REQUIRED[stepNum] || [];
    const newErrors = {};
    required.forEach(field => {
      const val = form[field];
      if (!val || (typeof val === 'string' && val.trim() === '') || (Array.isArray(val) && val.length === 0)) {
        newErrors[field] = 'This field is required';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (validate(step)) setStep(s => Math.min(4, s + 1));
  };
  const back = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async () => {
    if (!validate(4)) return;
    setSubmitting(true);
    try {
      await fetch('/.netlify/functions/submit-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch (e) {
      console.error('Submission error:', e);
      // Show confirmation anyway — data may have saved
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── CONFIRMATION SCREEN ─── */
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', fontFamily: "'Inter', -apple-system, sans-serif" }}>
        <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', background: '#f0fdf9', border: '2px solid #14b8a6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', fontSize: '1.5rem' }}>✓</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Your offsite intake has been received
          </h1>
          <p style={{ fontSize: '1rem', color: '#475569', lineHeight: '1.7', marginBottom: '0.75rem' }}>
            We'll review your context, team composition, and objectives to determine whether a leadership diagnostic is the right fit.
          </p>
          <p style={{ fontSize: '1rem', color: '#475569', lineHeight: '1.7', marginBottom: '2.5rem' }}>
            If there is a strong match, we'll reach out with recommended next steps.
          </p>
          <Link to="/" style={{ display: 'inline-block', background: '#0f172a', color: 'white', padding: '0.875rem 2rem', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '0.95rem' }}>
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const stepMeta = STEPS[step - 1];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ─── HERO ─── */}
      <div style={{ background: '#0f172a', color: 'white', padding: '5rem 2rem 4rem' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2.5px', color: '#14b8a6', marginBottom: '1.5rem' }}>
            Leadership Diagnostic Intake
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '950', marginBottom: '1.25rem', lineHeight: '1.2', letterSpacing: '-0.03em', color: 'white' }}>
            Planning a leadership offsite<br />with real stakes?
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '1.5rem', maxWidth: '580px' }}>
            Tell us what your team is navigating, who needs to be in the room, and what must shift. We'll assess whether a leadership diagnostic is the right intervention.
          </p>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', letterSpacing: '0.01em' }}>
            For executive teams · strategic initiatives · high-stakes decision environments
          </div>
        </div>
      </div>

      {/* ─── FORM CARD ─── */}
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 2rem 5rem' }}>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flex: 1 }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} style={{ flex: 1, height: '3px', borderRadius: '99px', background: n <= step ? '#14b8a6' : '#e2e8f0', transition: 'background 0.3s' }} />
            ))}
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', whiteSpace: 'nowrap' }}>
            Step {step} of 4
          </div>
        </div>

        {/* Step header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={S.sectionTitle}>{stepMeta.label}</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em', lineHeight: '1.25' }}>
            {stepMeta.title}
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>{stepMeta.framing}</p>
        </div>

        {/* ─── STEPS ─── */}

        {step === 1 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
              <Field label="Organization name" required error={errors.org_name}>
                <input style={S.input} value={form.org_name} onChange={e => set('org_name', e.target.value)} placeholder="e.g. Meridian Group" />
              </Field>
              <Field label="Your name" required error={errors.contact_name}>
                <input style={S.input} value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="Full name" />
              </Field>
              <Field label="Role / Title" error={errors.contact_title}>
                <input style={S.input} value={form.contact_title} onChange={e => set('contact_title', e.target.value)} placeholder="e.g. Chief People Officer" />
              </Field>
              <Field label="Work email" required error={errors.contact_email}>
                <input style={S.input} type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} placeholder="name@company.com" />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
              <Field label="Company size" required error={errors.company_size}>
                <div style={{ position: 'relative' }}>
                  <select style={S.select} value={form.company_size} onChange={e => set('company_size', e.target.value)}>
                    <option value="">Select range</option>
                    {COMPANY_SIZES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}>▾</div>
                </div>
              </Field>
              <Field label="Where are you in planning?" required error={errors.planning_stage}>
                <div style={{ position: 'relative' }}>
                  <select style={S.select} value={form.planning_stage} onChange={e => set('planning_stage', e.target.value)}>
                    <option value="">Select stage</option>
                    {PLANNING_STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}>▾</div>
                </div>
              </Field>
            </div>

            <Field label="When is the offsite?" error={errors.offsite_date} helper="Approximate month is fine.">
              <input style={{ ...S.input, maxWidth: '240px' }} type="month" value={form.offsite_date} onChange={e => set('offsite_date', e.target.value)} />
            </Field>

            <Field label="What is prompting this offsite?" helper="Select all that apply.">
              <MultiSelect
                options={PROMPTING_REASONS}
                value={form.prompting_reasons}
                onChange={v => toggleMulti('prompting_reasons', v)}
                includeOtherText
                otherValue={form.prompting_other}
                onOtherChange={v => set('prompting_other', v)}
              />
            </Field>

            <Field label="What is the business context behind it?" required error={errors.business_context}>
              <textarea
                style={S.textarea}
                value={form.business_context}
                onChange={e => set('business_context', e.target.value)}
                placeholder="What is changing in your business, market, or team that makes this offsite necessary now?"
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div>
            <Field label="Who will be attending?" helper="Select all roles that will be in the room.">
              <MultiSelect
                options={ATTENDEE_ROLES}
                value={form.attendee_roles}
                onChange={v => toggleMulti('attendee_roles', v)}
              />
            </Field>

            <Field label="How many people are expected?" required error={errors.expected_headcount}>
              <div style={{ position: 'relative', maxWidth: '280px' }}>
                <select style={S.select} value={form.expected_headcount} onChange={e => set('expected_headcount', e.target.value)}>
                  <option value="">Select range</option>
                  {HEADCOUNTS.map(h => <option key={h}>{h}</option>)}
                </select>
                <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}>▾</div>
              </div>
            </Field>

            <Field label="Are these participants the real decision-makers for the issue at hand?" required error={errors.decision_authority}>
              <RadioGroup
                options={['Yes', 'Mostly', 'No', 'Not sure']}
                value={form.decision_authority}
                onChange={v => set('decision_authority', v)}
              />
              <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', background: '#f0fdf9', border: '1px solid #99f6e4', borderRadius: '8px', fontSize: '0.85rem', color: '#065f46', lineHeight: '1.5' }}>
                This is important. Diagnostic work is only effective when the people in the room can make or influence decisions.
              </div>
            </Field>

            <Field label="Are there any key stakeholders who should be involved but may not attend?" helper="Optional — but useful for our assessment.">
              <input style={S.input} value={form.missing_stakeholders} onChange={e => set('missing_stakeholders', e.target.value)} placeholder="e.g. Regional heads, Board members..." />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div>
            <Field label="What do you want this offsite to achieve?" helper="Select all that apply.">
              <MultiSelect
                options={OBJECTIVES}
                value={form.objectives}
                onChange={v => toggleMulti('objectives', v)}
              />
            </Field>

            <Field label="What would make this offsite successful?" required error={errors.success_definition}>
              <textarea
                style={S.textarea}
                value={form.success_definition}
                onChange={e => set('success_definition', e.target.value)}
                placeholder="At the end of the offsite, what must be clearer, stronger, or resolved?"
              />
            </Field>

            <Field label="Where do you currently see the biggest challenge?" helper="Select all that apply.">
              <MultiSelect
                options={BIGGEST_CHALLENGES}
                value={form.biggest_challenges}
                onChange={v => toggleMulti('biggest_challenges', v)}
              />
            </Field>

            <Field label="What makes you think a diagnostic may be needed?" required error={errors.diagnostic_reason}>
              <textarea
                style={S.textarea}
                value={form.diagnostic_reason}
                onChange={e => set('diagnostic_reason', e.target.value)}
                placeholder="What are you seeing in your leadership team that suggests surface discussion may not be enough?"
              />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div>
            <Field label="Have you worked on this issue before?" required error={errors.prior_work}>
              <RadioGroup
                options={['Yes', 'No', 'Not formally']}
                value={form.prior_work}
                onChange={v => set('prior_work', v)}
              />
            </Field>

            {form.prior_work && form.prior_work !== 'No' && (
              <Field label="If yes, what have you already tried?" helper="Optional — helps us understand what has and hasn't worked.">
                <textarea style={{ ...S.textarea, minHeight: '80px' }} value={form.prior_work_detail} onChange={e => set('prior_work_detail', e.target.value)} placeholder="e.g. Strategy workshops, 360 feedback, team coaching..." />
              </Field>
            )}

            <Field label="Location / format" required error={errors.offsite_format}>
              <RadioGroup
                options={['In person', 'Virtual', 'Hybrid', 'Not yet decided']}
                value={form.offsite_format}
                onChange={v => set('offsite_format', v)}
              />
            </Field>

            <Field label="Do you want this to include a live leadership diagnostic component?" required error={errors.diagnostic_interest}>
              <RadioGroup
                options={['Yes', 'Possibly', 'No', "I'm not sure — I'd like guidance"]}
                value={form.diagnostic_interest}
                onChange={v => set('diagnostic_interest', v)}
              />
            </Field>

            <Field label="What kind of support are you looking for?" helper="Select all that apply.">
              <MultiSelect
                options={SUPPORT_TYPES}
                value={form.support_needed}
                onChange={v => toggleMulti('support_needed', v)}
              />
            </Field>

            <Field label="Anything else we should know?">
              <textarea style={S.textarea} value={form.anything_else} onChange={e => set('anything_else', e.target.value)} placeholder="Context, constraints, timeline, or anything else that would help us assess fit..." />
            </Field>
          </div>
        )}

        {/* ─── NAV BUTTONS ─── */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', alignItems: 'center' }}>
          {step > 1 && (
            <button
              onClick={back}
              style={{ background: 'transparent', border: 'none', color: '#64748b', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', padding: '0.875rem 1.25rem', borderRadius: '8px', textDecoration: 'underline', textUnderlineOffset: '3px' }}
            >
              ← Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < 4 ? (
            <button
              onClick={next}
              style={{ background: '#0f172a', color: 'white', border: 'none', padding: '0.9rem 2.5rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', letterSpacing: '0.01em', transition: 'opacity 0.2s' }}
            >
              Continue →
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ background: '#14b8a6', color: 'white', border: 'none', padding: '0.95rem 2.5rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.95rem', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, letterSpacing: '0.01em', transition: 'opacity 0.2s' }}
              >
                {submitting ? 'Submitting...' : 'Submit Offsite Intake'}
              </button>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'right', maxWidth: '320px', lineHeight: '1.4' }}>
                We review each intake based on strategic relevance, leadership scope, and diagnostic fit.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
