'use client';

// ============================================================================
// MATADOR COMPASS — Student Success Hub
//
// The single most important feature CampusConnect can offer to freshmen and
// transfers. Every milestone here is backed by research:
//
//   "Only 60% of graduating seniors ever received guidance on required courses"
//   "35% of first-gen students never visited the career center"
//   "70% of students struggle with mental health — 63% never seek help"
//   "Each major switch costs an average 6 months of extra time"
//
// This component is designed to be:
//   1. A standalone page at /compass
//   2. Embeddable as a dashboard widget (pass compact={true})
//
// It persists completion state to localStorage so progress survives page reload.
// When backend is ready, replace localStorage with a real API call.
// ============================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ALL_MILESTONES,
  CATEGORY_META,
  YEAR_LABELS,
  YEAR_OPTIONS,
  getMilestonesForYear,
  type CompassMilestone,
  type MilestoneStatus,
  type StudentYear,
  type MilestoneCategory,
} from './compass.data';

// ─── Storage ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'csun_compass_v1';

interface CompassState {
  year: StudentYear;
  statuses: Record<string, MilestoneStatus>;
  onboarded: boolean;
}

function loadState(): CompassState {
  if (typeof window === 'undefined') return { year: 'freshman', statuses: {}, onboarded: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { year: 'freshman', statuses: {}, onboarded: false };
  } catch { return { year: 'freshman', statuses: {}, onboarded: false }; }
}

function saveState(state: CompassState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

// ─── Icons (inline SVG, no emoji, no external deps) ──────────────────────────

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ChevronIcon({ down = true, size = 14 }: { down?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {down ? <polyline points="6 9 12 15 18 9" /> : <polyline points="6 15 12 9 18 15" />}
    </svg>
  );
}

function ExternalIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function CategorySVG({ path, color, size = 16 }: { path: string; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

// ─── Priority pill ────────────────────────────────────────────────────────────

function PriorityPill({ priority }: { priority: CompassMilestone['priority'] }) {
  const map = {
    critical: { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    high:     { label: 'High',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    medium:   { label: 'Medium',   color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  };
  const m = map[priority];
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: m.color, background: m.bg, border: `1px solid ${m.color}30`, borderRadius: 20, padding: '2px 8px', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
      {m.label}
    </span>
  );
}

// ─── Status button ────────────────────────────────────────────────────────────

interface StatusBtnProps {
  status: MilestoneStatus;
  onChange: (s: MilestoneStatus) => void;
}

function StatusButton({ status, onChange }: StatusBtnProps) {
  const options: MilestoneStatus[] = ['todo', 'in-progress', 'done', 'skipped'];
  const map: Record<MilestoneStatus, { label: string; color: string; bg: string }> = {
    locked:      { label: 'Locked',      color: '#6b7280', bg: '#f3f4f6' },
    todo:        { label: 'To Do',        color: '#374151', bg: '#f3f4f6' },
    'in-progress': { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    done:        { label: 'Done',         color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
    skipped:     { label: 'Skipped',      color: '#9ca3af', bg: '#f9fafb' },
  };
  const cur = map[status] ?? map.todo;
  const next = options[(options.indexOf(status as any) + 1) % options.length];

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(next); }}
      title={`Mark as ${map[next].label}`}
      style={{
        background: cur.bg, border: `1.5px solid ${cur.color}33`,
        borderRadius: 8, padding: '4px 10px',
        fontSize: 11, fontWeight: 700, color: cur.color,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
        transition: 'all 0.2s', whiteSpace: 'nowrap',
      }}
    >
      {status === 'done' && <CheckIcon />}
      {cur.label}
    </button>
  );
}

// ─── Milestone Card ───────────────────────────────────────────────────────────

interface MilestoneCardProps {
  milestone: CompassMilestone;
  status: MilestoneStatus;
  onStatusChange: (id: string, s: MilestoneStatus) => void;
}

function MilestoneCard({ milestone: m, status, onStatusChange }: MilestoneCardProps) {
  const [open, setOpen] = useState(false);
  const cat = CATEGORY_META[m.category];
  const done = status === 'done';
  const skipped = status === 'skipped';

  return (
    <div
      style={{
        background: done ? 'rgba(22,163,74,0.04)' : skipped ? '#fafafa' : '#fff',
        border: `1px solid ${done ? 'rgba(22,163,74,0.2)' : m.priority === 'critical' && !done ? 'rgba(210,32,48,0.2)' : '#e5e7eb'}`,
        borderLeft: `3px solid ${done ? '#16a34a' : skipped ? '#d1d5db' : cat.color}`,
        borderRadius: 12,
        marginBottom: 10,
        overflow: 'hidden',
        opacity: skipped ? 0.55 : 1,
        transition: 'border-color 0.2s, opacity 0.2s',
      }}
    >
      {/* Header row */}
      <div
        onClick={() => setOpen((v) => !v)}
        style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12 }}
      >
        {/* Category icon */}
        <div style={{ width: 32, height: 32, borderRadius: 8, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
          <CategorySVG path={cat.icon} color={cat.color} size={15} />
        </div>

        {/* Title + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: done ? '#6b7280' : '#111827', textDecoration: done ? 'line-through' : 'none', lineHeight: 1.3 }}>
              {m.title}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <PriorityPill priority={m.priority} />
            <span style={{ fontSize: 10, color: cat.color, fontWeight: 600, background: cat.bg, borderRadius: 10, padding: '2px 7px' }}>
              {cat.label}
            </span>
            {m.deadline && (
              <span style={{ fontSize: 10, color: '#6b7280' }}>{m.deadline}</span>
            )}
          </div>
        </div>

        {/* Status + expand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <StatusButton status={status} onChange={(s) => onStatusChange(m.id, s)} />
          <span style={{ color: '#9ca3af', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <ChevronIcon down={!open} />
          </span>
        </div>
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{ padding: '0 16px 16px' }}>
          {/* Research-backed stat */}
          <div style={{ background: 'rgba(210,32,48,0.04)', border: '1px solid rgba(210,32,48,0.12)', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#D22030', margin: 0, lineHeight: 1.5 }}>
              {m.whyItMatters}
            </p>
          </div>

          {/* Description */}
          <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.65, marginBottom: 14 }}>{m.description}</p>

          {/* Actions */}
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Action Steps</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {m.actions.map((action, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: cat.bg, border: `1px solid ${cat.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: cat.color }}>{i + 1}</span>
                  </div>
                  <span style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.5 }}>{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          {m.resources.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Resources</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {m.resources.map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 8, textDecoration: 'none', padding: '8px 10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, transition: 'border-color 0.2s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = cat.color; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e5e7eb'; }}
                  >
                    <div style={{ color: cat.color, marginTop: 1, flexShrink: 0 }}><ExternalIcon /></div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{r.name}</p>
                      {(r.location || r.phone || r.hours || r.note) && (
                        <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0', lineHeight: 1.4 }}>
                          {[r.location, r.phone, r.hours, r.note].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Linked feature */}
          {m.linkedFeature && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: '#9ca3af' }}>Available in CampusConnect:</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: cat.color, background: cat.bg, borderRadius: 10, padding: '2px 8px' }}>{m.linkedFeature}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 48, color }: { pct: number; size?: number; color: string }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.5s ease' }}
      />
    </svg>
  );
}

// ─── Onboarding year picker ───────────────────────────────────────────────────

function OnboardingScreen({ onSelect }: { onSelect: (y: StudentYear) => void }) {
  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '2rem 1.5rem', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(210,32,48,0.1)', border: '2px solid rgba(210,32,48,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D22030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
        </svg>
      </div>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
        Welcome to Your Matador Compass
      </h2>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28, lineHeight: 1.7 }}>
        A step-by-step guide to the things nobody teaches you in college — from your first week through graduation. Personalized to where you are right now.
      </p>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>
        Where are you in your CSUN journey?
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {YEAR_OPTIONS.map((year) => (
          <button
            key={year}
            onClick={() => onSelect(year)}
            style={{
              padding: '14px 20px',
              background: year === 'transfer' ? 'rgba(210,32,48,0.04)' : '#fff',
              border: `1.5px solid ${year === 'transfer' ? 'rgba(210,32,48,0.3)' : '#e5e7eb'}`,
              borderRadius: 12, cursor: 'pointer',
              fontSize: 14, fontWeight: 600, color: '#111827',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget).style.borderColor = '#D22030'; (e.currentTarget).style.background = 'rgba(210,32,48,0.03)'; }}
            onMouseLeave={(e) => {
              (e.currentTarget).style.borderColor = year === 'transfer' ? 'rgba(210,32,48,0.3)' : '#e5e7eb';
              (e.currentTarget).style.background = year === 'transfer' ? 'rgba(210,32,48,0.04)' : '#fff';
            }}
          >
            <span>{YEAR_LABELS[year]}</span>
            {year === 'transfer' && (
              <span style={{ fontSize: 10, fontWeight: 700, color: '#D22030', background: 'rgba(210,32,48,0.1)', borderRadius: 10, padding: '2px 8px' }}>
                Special Guide
              </span>
            )}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 16 }}>You can change this anytime in settings.</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  compact?: boolean;  // For dashboard widget mode
}

export default function MatadorCompass({ compact = false }: Props) {
  const [state, setState] = useState<CompassState>({ year: 'freshman', statuses: {}, onboarded: false });
  const [filter, setFilter] = useState<MilestoneCategory | 'all'>('all');
  const [showDone, setShowDone] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    setState(loadState());
  }, []);

  const updateState = useCallback((next: Partial<CompassState>) => {
    setState((prev) => {
      const merged = { ...prev, ...next };
      saveState(merged);
      return merged;
    });
  }, []);

  const handleStatusChange = useCallback((id: string, newStatus: MilestoneStatus) => {
    setState((prev) => {
      const merged = { ...prev, statuses: { ...prev.statuses, [id]: newStatus } };
      saveState(merged);
      return merged;
    });
  }, []);

  const handleYearSelect = (year: StudentYear) => {
    updateState({ year, onboarded: true });
  };

  const milestones = getMilestonesForYear(state.year);
  const filtered = milestones.filter((m) => {
    if (filter !== 'all' && m.category !== filter) return false;
    const status = state.statuses[m.id] ?? 'todo';
    if (!showDone && (status === 'done' || status === 'skipped')) return false;
    return true;
  });

  // Progress stats
  const total = milestones.length;
  const done  = milestones.filter((m) => state.statuses[m.id] === 'done').length;
  const inProg = milestones.filter((m) => state.statuses[m.id] === 'in-progress').length;
  const critical = milestones.filter((m) => m.priority === 'critical' && state.statuses[m.id] !== 'done' && state.statuses[m.id] !== 'skipped').length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Onboarding screen
  if (!state.onboarded) {
    return <OnboardingScreen onSelect={handleYearSelect} />;
  }

  // ── Compact widget mode ──────────────────────────────────────────────────

  if (compact) {
    const urgentItems = milestones.filter((m) => m.priority === 'critical' && !['done','skipped'].includes(state.statuses[m.id] ?? 'todo')).slice(0, 3);
    return (
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #D22030 0%, #8b1220 100%)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <ProgressRing pct={pct} size={40} color="#fff" />
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: 0 }}>Matador Compass</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', margin: 0 }}>{done}/{total} milestones complete</p>
          </div>
          {critical > 0 && (
            <div style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 20, padding: '3px 10px' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{critical} critical</span>
            </div>
          )}
        </div>
        {/* Urgent items */}
        <div style={{ padding: '12px 14px' }}>
          {urgentItems.length === 0 ? (
            <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, textAlign: 'center', padding: '8px 0' }}>All critical items complete!</p>
          ) : (
            urgentItems.map((m) => {
              const cat = CATEGORY_META[m.category];
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CategorySVG path={cat.icon} color={cat.color} size={12} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</p>
                    {m.deadline && <p style={{ fontSize: 10, color: '#9ca3af', margin: '1px 0 0' }}>{m.deadline}</p>}
                  </div>
                  <StatusButton status={state.statuses[m.id] ?? 'todo'} onChange={(s) => handleStatusChange(m.id, s)} />
                </div>
              );
            })
          )}
          <a href="/compass" style={{ display: 'block', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#D22030', textDecoration: 'none', marginTop: 10 }}>
            View full Compass
          </a>
        </div>
      </div>
    );
  }

  // ── Full page mode ───────────────────────────────────────────────────────

  const categoryTabs: Array<MilestoneCategory | 'all'> = ['all', 'academic', 'career', 'financial', 'wellbeing', 'social', 'graduation'];

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" />
      <style>{`
        @keyframes cpFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f8f9fa', animation: 'cpFade 0.4s ease' }}>
        {/* ── Hero banner ─────────────────────────────────────────────── */}
        <div style={{ background: 'linear-gradient(135deg, #D22030 0%, #8b1220 60%, #5a0118 100%)', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle pattern */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 41px)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                    </svg>
                  </div>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                    Student Success Guide
                  </span>
                </div>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: '#fff', margin: '0 0 8px', lineHeight: 1.15 }}>
                  Matador Compass
                </h1>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', maxWidth: 500, lineHeight: 1.65, margin: 0 }}>
                  The things nobody teaches you in college — mapped out for you, backed by research, and specific to where you are right now as a CSUN {YEAR_LABELS[state.year].toLowerCase()}.
                </p>
              </div>

              {/* Progress stats */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { label: 'Complete', value: done, pct, color: '#fff' },
                  { label: 'In Progress', value: inProg, pct: inProg > 0 ? 100 : 0, color: '#fbbf24' },
                  { label: 'Critical Remaining', value: critical, pct: 100, color: '#fca5a5' },
                ].map((stat) => (
                  <div key={stat.label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', minWidth: 90 }}>
                    <p style={{ fontSize: 24, fontWeight: 800, color: stat.color, margin: '0 0 2px', fontFamily: "'Syne', sans-serif" }}>{stat.value}</p>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', margin: 0 }}>{stat.label}</p>
                  </div>
                ))}
                <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', minWidth: 90 }}>
                  <p style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 2px', fontFamily: "'Syne', sans-serif" }}>{pct}%</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', margin: 0 }}>Overall</p>
                </div>
              </div>
            </div>

            {/* Year selector */}
            <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>YOUR YEAR:</span>
              {YEAR_OPTIONS.map((year) => (
                <button
                  key={year}
                  onClick={() => updateState({ year })}
                  style={{
                    padding: '6px 14px', borderRadius: 20,
                    background: state.year === year ? '#fff' : 'rgba(255,255,255,0.12)',
                    border: state.year === year ? 'none' : '1px solid rgba(255,255,255,0.25)',
                    color: state.year === year ? '#D22030' : 'rgba(255,255,255,0.85)',
                    fontSize: 12, fontWeight: state.year === year ? 700 : 500,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {YEAR_LABELS[year]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Filter bar ──────────────────────────────────────────────── */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0.75rem 2rem', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {categoryTabs.map((tab) => {
              const meta = tab === 'all' ? null : CATEGORY_META[tab];
              const active = filter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  style={{
                    padding: '6px 14px', borderRadius: 20,
                    background: active ? (meta?.bg ?? 'rgba(210,32,48,0.08)') : '#f3f4f6',
                    border: active ? `1.5px solid ${meta?.color ?? '#D22030'}` : '1.5px solid transparent',
                    color: active ? (meta?.color ?? '#D22030') : '#374151',
                    fontSize: 12, fontWeight: active ? 700 : 500,
                    cursor: 'pointer', transition: 'all 0.18s',
                  }}
                >
                  {tab === 'all' ? 'All' : meta?.label}
                </button>
              );
            })}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280', cursor: 'pointer' }}>
                <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} style={{ cursor: 'pointer' }} />
                Show completed
              </label>
            </div>
          </div>
        </div>

        {/* ── Milestones ──────────────────────────────────────────────── */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 2rem 4rem' }}>

          {/* Research context banner — shown once */}
          <div style={{ background: 'rgba(210,32,48,0.04)', border: '1px solid rgba(210,32,48,0.15)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(210,32,48,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D22030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p style={{ fontSize: 12.5, color: '#6b7280', margin: 0, lineHeight: 1.65 }}>
              Every milestone below is backed by national research on college student outcomes. The "Why It Matters" stat on each card is a real finding from studies of 80,000+ students. This is what we wish someone had shown us freshman year.
            </p>
          </div>

          {/* Critical items callout */}
          {critical > 0 && filter === 'all' && (
            <div style={{ background: '#fff', border: '1.5px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: 0 }}>
                  {critical} critical milestone{critical !== 1 ? 's' : ''} need your attention
                </p>
              </div>
              <button onClick={() => setFilter('all')} style={{ fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                View all
              </button>
            </div>
          )}

          {/* Milestone list */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <p style={{ fontSize: 15, fontWeight: 600 }}>No milestones match this filter.</p>
              <button onClick={() => { setFilter('all'); setShowDone(true); }} style={{ fontSize: 13, color: '#D22030', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginTop: 6 }}>
                Reset filters
              </button>
            </div>
          ) : (
            filtered.map((m) => (
              <MilestoneCard
                key={m.id}
                milestone={m}
                status={state.statuses[m.id] ?? 'todo'}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
