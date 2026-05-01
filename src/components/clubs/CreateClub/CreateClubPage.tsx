'use client';

// BACKEND INTEGRATION NOTES:
// handleSave() → POST /api/clubs
// Logo/banner → POST /api/upload (multipart) → { url: string }
// Auth: gate behind middleware

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Club, ClubDetail } from '@/components/clubs/temp(mockdata)/clubs.data';
import LinkIcon from '@mui/icons-material/Link';

// ─── Icons ────────────────────────────────────────────────────────────────────
const DiscordIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>;
const ChevronRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>;
const ChevronLeft  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>;
const CheckIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon        = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const SparkleIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>;
const ImageIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const PaletteIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>;
const TagIcon      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const InfoIcon     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const RocketIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>;
const EyeIcon      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

// ─── Design tokens ────────────────────────────────────────────────────────────
const RED       = '#B4002E';
const RED_DARK  = '#7a001f';
const INPUT_BG     = '#f3f3f3';
const INPUT_BORDER = 'rgba(0, 0, 0, 0.22)';
const T1   = '#111111';
const T2   = '#444444';
const T3   = 'rgba(0,0,0,0.45)';
const LBL  = '#000000';
const HINT = 'rgba(255, 0, 64, 0.91)';
const OUT_TITLE = '#ffffff';
const OUT_SUB   = 'rgba(255, 255, 255, 0.8)';
const OUT_MUTED = 'rgba(255, 255, 255, 0.6)';
const CARD_SHADOW = '0 8px 40px rgba(0,0,0,0.30), 0 1px 0 rgba(255,255,255,0.8) inset';

// ─── Animated Wave Background Canvas ─────────────────────────────────────────
// Rendered as position:fixed, z-index:-1 so it NEVER affects sticky/scroll
function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Wave layers: [amplitude, frequency, speed, yBase, color]
    const waves = [
      { amp: 38, freq: 0.008, speed: 0.18, yOff: 0.30, color: 'rgba(200,0,46,0.55)',   blur: 0  },
      { amp: 28, freq: 0.012, speed: 0.24, yOff: 0.45, color: 'rgba(210,0,120,0.38)',  blur: 0  },
      { amp: 22, freq: 0.016, speed: 0.14, yOff: 0.60, color: 'rgba(180,0,46,0.48)',   blur: 0  },
      { amp: 18, freq: 0.010, speed: 0.30, yOff: 0.72, color: 'rgba(255,80,20,0.28)',  blur: 0  },
      { amp: 44, freq: 0.006, speed: 0.10, yOff: 0.85, color: 'rgba(160,0,40,0.60)',   blur: 0  },
    ];

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      t += 0.006;

      // Deep dark base
      ctx.fillStyle = '#180008';
      ctx.fillRect(0, 0, W, H);

      // Draw each wave as a filled shape
      waves.forEach((w, i) => {
        ctx.beginPath();
        const yBase = H * w.yOff;
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 3) {
          // Two sine waves summed for organic feel
          const y = yBase
            + Math.sin(x * w.freq + t * w.speed * 6.28 + i) * w.amp
            + Math.sin(x * w.freq * 1.7 + t * w.speed * 4.2 + i * 2.1) * (w.amp * 0.45);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();

        // Gradient fill for each wave — red→magenta→orange tones
        const grad = ctx.createLinearGradient(0, yBase - w.amp * 2, 0, H);
        if (i % 3 === 0) {
          grad.addColorStop(0, 'rgba(220,0,50,0.0)');
          grad.addColorStop(0.4, w.color);
          grad.addColorStop(1,   'rgba(120,0,20,0.85)');
        } else if (i % 3 === 1) {
          grad.addColorStop(0, 'rgba(220,0,120,0.0)');
          grad.addColorStop(0.4, w.color);
          grad.addColorStop(1,   'rgba(100,0,30,0.80)');
        } else {
          grad.addColorStop(0, 'rgba(255,80,0,0.0)');
          grad.addColorStop(0.4, w.color);
          grad.addColorStop(1,   'rgba(140,0,20,0.80)');
        }
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Subtle pixel-grid shimmer overlay — digital feel
      ctx.fillStyle = 'rgba(255,30,60,0.018)';
      for (let gx = 0; gx < W; gx += 18) {
        for (let gy = 0; gy < H; gy += 18) {
          if (Math.sin(gx * 0.07 + t * 1.2) * Math.cos(gy * 0.09 + t * 0.8) > 0.7) {
            ctx.fillRect(gx, gy, 2, 2);
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: -1,          // behind everything, never affects layout
        display: 'block',
      }}
    />
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ClubDraft = {
  name: string; category: string; tagline: string; description: string; founded: string;
  cardHeadline: string; cardBlurb: string; cardChips: string[]; tags: string[];
  accentColor: string; bgColor: string; textMode: 'dark' | 'light';
  logoUrl: string; bannerUrl: string;
  introMessage: string; discordUrl: string; instagramUrl: string; memberCount: number;
};

const EMPTY_DRAFT: ClubDraft = {
  name: '', category: 'STEM', tagline: '', description: '', founded: '',
  cardHeadline: '', cardBlurb: '', cardChips: [], tags: [],
  accentColor: RED, bgColor: '#0d0d0d', textMode: 'dark',
  logoUrl: '', bannerUrl: '',
  introMessage: '', discordUrl: '', instagramUrl: '', memberCount: 0,
};

const CATEGORIES = ['STEM','Business','Arts','Cultural','Sports','Literature','Fraternity','Sorority'];

const CATEGORY_META: Record<string, { color: string; gradient: string; suggestedTags: string[] }> = {
  STEM:       { color: '#3b82f6', gradient: 'linear-gradient(135deg,#1e3a8a,#3b82f6)',
    suggestedTags: ['Hackathons','AI & Machine Learning','Robotics','Cybersecurity','Data Science','Research','Web Development','Workshops','Competitions','Open Source','Computer Science','Engineering','Mathematics','Physics','Chemistry','Biology','Networking','Projects','Internships'] },
  Business:   { color: '#10b981', gradient: 'linear-gradient(135deg,#064e3b,#10b981)',
    suggestedTags: ['Networking','Case Competitions','Startups','Finance','Marketing','Leadership','Consulting','Entrepreneurship','Real Estate','Accounting','Economics','Investing','Supply Chain','Management','MBA Prep','Sales','Analytics'] },
  Arts:       { color: '#ec4899', gradient: 'linear-gradient(135deg,#831843,#ec4899)',
    suggestedTags: ['Exhibitions','Performances','Digital Art','Illustration','Film','Music','Photography','Animation','Graphic Design','Sculpture','Fashion','Theatre','Dance','Creative Writing','Architecture','UI/UX Design'] },
  Cultural:   { color: '#f59e0b', gradient: 'linear-gradient(135deg,#78350f,#f59e0b)',
    suggestedTags: ['Heritage','Food','Dance','Language','Community','Festivals','International','Religion','LGBTQ+','Diversity & Inclusion','Asian Culture','Latino Culture','Black Student Union','Women in STEM','Middle Eastern','South Asian'] },
  Sports:     { color: '#ef4444', gradient: 'linear-gradient(135deg,#7f1d1d,#ef4444)',
    suggestedTags: ['Intramurals','Fitness','Tournaments','Training','Leagues','Recreation','Esports','Rock Climbing','Yoga','Martial Arts','Swimming','Running','Basketball','Soccer','Volleyball','Cycling','Tennis'] },
  Literature: { color: '#8b5cf6', gradient: 'linear-gradient(135deg,#4c1d95,#8b5cf6)',
    suggestedTags: ['Workshops','Fiction','Poetry','Open Mic','Publishing','Book Club','Journalism','Debate','Public Speaking','Philosophy','History','Political Science','Creative Writing','Law','Screenwriting'] },
  Fraternity: { color: '#14b8a6', gradient: 'linear-gradient(135deg,#134e4a,#14b8a6)',
    suggestedTags: ['Brotherhood','Rush','Philanthropy','Greek Life','Leadership','Alumni','Service','Professional Dev','Social Events','Recruitment','Academic Support','Mentorship','Networking'] },
  Sorority:   { color: '#f472b6', gradient: 'linear-gradient(135deg,#831843,#f472b6)',
    suggestedTags: ['Sisterhood','Rush','Service','Greek Life','Empowerment','Recruitment','Philanthropy','Leadership','Academic Support','Mentorship','Social Events','Professional Dev','Networking'] },
};

const BG_PRESETS = [
  { label: 'Midnight', value: '#0d0d0d' }, { label: 'Obsidian', value: '#2c1a44' },
  { label: 'Crimson',  value: '#770f0f' }, { label: 'Navy',     value: '#0e2447' },
  { label: 'Forest',   value: '#0f4927' }, { label: 'Slate',    value: '#516388' },
  { label: 'White',    value: '#f8f8f8' }, { label: 'Mustard',    value: '#e4c724' },
];

const STEPS = [
  { id: 1, label: 'Identity',   icon: InfoIcon    },
  { id: 2, label: 'Card',       icon: TagIcon     },
  { id: 3, label: 'Appearance', icon: PaletteIcon },
  { id: 4, label: 'Details',    icon: SparkleIcon },
  { id: 5, label: 'Review',     icon: EyeIcon     },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useIsNarrow(bp = 900) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const check = () => setNarrow(window.innerWidth < bp);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [bp]);
  return narrow;
}

// ─── Style helpers ────────────────────────────────────────────────────────────
function inp(extra?: React.CSSProperties): React.CSSProperties {
  return {
    width: '100%', background: INPUT_BG, border: `1.5px solid ${INPUT_BORDER}`,
    borderRadius: 12, padding: '11px 16px', color: T1, fontSize: 14,
    boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s', ...extra,
  };
}
function lbl(): React.CSSProperties {
  return { display: 'block', color: LBL, fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 };
}
function box(extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: '#ffffff',
    border: '1px solid rgba(180,0,46,0.14)',
    borderRadius: 20,
    boxShadow: CARD_SHADOW,
    ...extra,
  };
}

// ─── Live Flip Card ───────────────────────────────────────────────────────────
function LiveFlipCard({ draft }: { draft: ClubDraft }) {
  const [flipped, setFlipped] = useState(false);
  const meta = CATEGORY_META[draft.category] ?? CATEGORY_META['STEM'];
  const initials = draft.name.split(' ').filter(Boolean).slice(0,2).map(p => p[0]?.toUpperCase() ?? '').join('') || '?';
  const bannerStyle: React.CSSProperties = draft.bannerUrl
    ? { backgroundImage: `url(${draft.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: meta.gradient };

  return (
    <div style={{ perspective: '1200px', width: 260, margin: '0 auto', cursor: 'pointer', userSelect: 'none' }}
      onClick={() => setFlipped(v => !v)}>
      <div style={{
        position: 'relative', height: 290, transformStyle: 'preserve-3d',
        transition: 'transform 540ms cubic-bezier(0.2,0.8,0.2,1)',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        borderRadius: 20,
        boxShadow: '0 16px 50px rgba(0,0,0,0.55), 0 0 30px rgba(180,0,46,0.18)',
      }}>
        {/* FRONT */}
        <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden', borderRadius:20, overflow:'hidden', background:'#fff' }}>
          <div style={{ height: 110, position: 'relative', ...bannerStyle }}>
            <div style={{ position:'absolute', top:8, right:8, background: meta.color, color:'#fff', borderRadius:99, padding:'3px 10px', fontSize:11, fontWeight:800, letterSpacing:0.5, textTransform:'uppercase' }}>
              {draft.category || 'Category'}
            </div>
          </div>
          <div style={{ position:'absolute', top:74, left:14, width:56, height:56, borderRadius:'50%', border:'3px solid white', overflow:'hidden', background: meta.color, display:'grid', placeItems:'center', zIndex:10, boxShadow:'0 4px 12px rgba(0,0,0,0.18)' }}>
            {draft.logoUrl
              ? <img src={draft.logoUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => (e.target as HTMLImageElement).style.display='none'} />
              : <span style={{ color:'#fff', fontWeight:900, fontSize:18 }}>{initials}</span>}
          </div>
          <div style={{ paddingTop:34, paddingLeft:16, paddingRight:16, paddingBottom:12 }}>
            <div style={{ fontWeight:900, fontSize:15, color:'#111', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {draft.name || 'Club Name'}
            </div>
            <div style={{ fontSize:12, color:'rgba(0,0,0,0.55)', marginTop:4, lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
              {draft.tagline || 'Your tagline will appear here…'}
            </div>
          </div>
          <div style={{ position:'absolute', bottom:8, left:'50%', transform:'translateX(-50%)', fontSize:10, color:'rgba(0,0,0,0.28)', fontWeight:700, letterSpacing:0.6, whiteSpace:'nowrap' }}>
            CLICK TO FLIP
          </div>
        </div>
        {/* BACK */}
        <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden', transform:'rotateY(180deg)', borderRadius:20, overflow:'hidden', background:'#fff', padding:20, boxSizing:'border-box', display:'flex', flexDirection:'column' }}>
          <div style={{ fontWeight:900, fontSize:14, color:'#111' }}>{draft.cardHeadline || draft.name || 'Club Name'}</div>
          <div style={{ fontSize:12, color:'rgba(0,0,0,0.60)', lineHeight:1.55, marginTop:8, flex:1, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:4, WebkitBoxOrient:'vertical' }}>
            {draft.cardBlurb || draft.description || 'Your back-of-card description will appear here.'}
          </div>
          {draft.cardChips.length > 0 && (
            <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginTop:10 }}>
              {draft.cardChips.map(c => (
                <span key={c} style={{ fontSize:11, fontWeight:800, background:'rgba(180,0,46,0.08)', color: RED, border:`1px solid rgba(180,0,46,0.20)`, borderRadius:99, padding:'2px 8px' }}>{c}</span>
              ))}
            </div>
          )}
          <div style={{ marginTop:10, fontSize:11, color:'rgba(0,0,0,0.35)', fontWeight:700 }}>Click to flip back</div>
        </div>
      </div>
      {/* ↓ "live preview" text — dark so it reads on white card box */}
      <p style={{ textAlign:'center', fontSize:11, color: T3, marginTop:10, fontWeight:600 }}>
        Live preview · click card to flip
      </p>
    </div>
  );
}

// ─── ChipInput ────────────────────────────────────────────────────────────────
function ChipInput({ label: labelText, chips, onChange, suggestions = [], placeholder, accentColor = RED }: {
  label: string; chips: string[]; onChange: (c: string[]) => void;
  suggestions?: string[]; placeholder?: string; accentColor?: string;
}) {
  const [val, setVal] = useState('');
  const add    = (s: string) => { const t = s.trim(); if (!t || chips.includes(t)) return; onChange([...chips, t]); setVal(''); };
  const remove = (c: string) => onChange(chips.filter(x => x !== c));
  const remaining = suggestions.filter(s => !chips.includes(s));
  return (
    <div>
      <label style={lbl()}>{labelText}</label>
      {chips.length > 0 && (
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
          {chips.map(c => (
            <span key={c} style={{ display:'inline-flex', alignItems:'center', gap:5, background:`${accentColor}14`, border:`1px solid ${accentColor}40`, borderRadius:99, padding:'4px 12px', fontSize:12, fontWeight:700, color: accentColor }}>
              {c}
              <button onClick={() => remove(c)} aria-label={`Remove ${c} tag`} style={{ background:'none', border:'none', cursor:'pointer', padding:0, color: accentColor, display:'flex', alignItems:'center', opacity:0.7, lineHeight:1 }}><XIcon /></button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display:'flex', gap:8 }}>
        <input style={{ ...inp(), flex:1 }} value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key==='Enter'){e.preventDefault();add(val);}}}
          placeholder={placeholder ?? 'Type and press Enter…'} />
        <button onClick={() => add(val)} style={{ background: RED, color:'#fff', border:'none', borderRadius:12, padding:'0 18px', cursor:'pointer', fontWeight:700, fontSize:13, flexShrink:0 }}>Add</button>
      </div>
      {remaining.length > 0 && (
        <div style={{ marginTop:10 }}>
          <div style={{ fontSize:10, color: HINT, marginBottom:7, fontWeight:800, letterSpacing:0.7, textTransform:'uppercase' }}>Suggested</div>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {remaining.map(s => (
              <button key={s} onClick={() => add(s)} style={{ background:`${RED}0d`, border:`1px solid ${RED}30`, borderRadius:99, padding:'4px 12px', fontSize:11, fontWeight:700, color: RED, cursor:'pointer', transition:'all 0.15s' }}>+ {s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 1: Identity ─────────────────────────────────────────────────────────
function StepIdentity({ draft, set }: { draft: ClubDraft; set: (k: keyof ClubDraft, v: any) => void }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
      <div>
        <label style={lbl()}>Club Name *</label>
        <input style={{ ...inp(), fontSize:18, fontWeight:700 }} value={draft.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Robotics & AI Society" />
      </div>
      <div>
        <label style={lbl()}>Category *</label>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {CATEGORIES.map(cat => {
            const meta = CATEGORY_META[cat]; const active = draft.category === cat;
            return (
              <button key={cat} onClick={() => set('category', cat)} style={{
                border: active ? `2px solid ${meta.color}` : `1.5px solid rgba(180,0,46,0.16)`,
                borderRadius:12, padding:'10px 6px', cursor:'pointer', fontWeight:800, fontSize:12,
                background: active ? `${meta.color}18` : '#faf8f8', color: active ? meta.color : T2,
                transition:'all 0.18s', display:'flex', flexDirection:'column', alignItems:'center', gap:5,
                boxShadow: active ? `0 4px 14px ${meta.color}28` : '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background: meta.color }} />{cat}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label style={lbl()}>Tagline *</label>
        <input style={inp()} value={draft.tagline} onChange={e => set('tagline', e.target.value)} placeholder="One line that captures your club's vibe" maxLength={80} />
        <div style={{ textAlign:'right', fontSize:11, color: HINT, marginTop:4 }}>{draft.tagline.length}/80</div>
      </div>
      <div>
        <label style={lbl()}>Full Description *</label>
        <textarea style={{ ...inp(), minHeight:120, resize:'vertical', lineHeight:1.6 }} value={draft.description} onChange={e => set('description', e.target.value)} placeholder="Tell prospective members what your club is about, what you do, and why they should join." />
      </div>
      <div>
        <label style={lbl()}>Year Founded</label>
        <input style={{ ...inp(), maxWidth:160 }} value={draft.founded} onChange={e => set('founded', e.target.value)} placeholder="e.g. 2019" />
      </div>
    </div>
  );
}

// ─── Step 2: Card ─────────────────────────────────────────────────────────────
function StepCard({ draft, set }: { draft: ClubDraft; set: (k: keyof ClubDraft, v: any) => void }) {
  const meta = CATEGORY_META[draft.category] ?? CATEGORY_META['STEM'];
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
      <div style={{ background:'rgba(95, 170, 255, 0.85)', border:`1px solid rgba(180,0,46,0.14)`, borderRadius:14, padding:'14px 16px' }}>
        <p style={{ fontSize:13, color: T2, lineHeight:1.65, margin:0 }}>
          <strong style={{ color: T1 }}>Front of card</strong> — shows your name &amp; tagline (set in Step 1).&nbsp;&nbsp;
          <strong style={{ color: T1 }}>Back of card</strong> — shown when users flip the card on the hub grid.
        </p>
      </div>
      <div>
        <label style={lbl()}>Card Headline (back)</label>
        <input style={inp()} value={draft.cardHeadline} onChange={e => set('cardHeadline', e.target.value)} placeholder="e.g. Weekly builds and workshops" />
        <div style={{ fontSize:11, color: HINT, marginTop:5 }}>Defaults to your club name if left blank.</div>
      </div>
      <div>
        <label style={lbl()}>Card Short Description (back)</label>
        <textarea style={{ ...inp(), minHeight:88, resize:'vertical' }} value={draft.cardBlurb} onChange={e => set('cardBlurb', e.target.value)} placeholder="2–3 sentence hook for curious students…" />
      </div>
      <ChipInput label="Card Chips / Tags (back)" chips={draft.cardChips} onChange={v => set('cardChips', v)}
        suggestions={meta.suggestedTags} placeholder="e.g. Hackathons · press Enter" accentColor={draft.accentColor} />
    </div>
  );
}

// ─── Step 3: Appearance ───────────────────────────────────────────────────────
function StepAppearance({ draft, set }: { draft: ClubDraft; set: (k: keyof ClubDraft, v: any) => void }) {
  const meta = CATEGORY_META[draft.category] ?? CATEGORY_META['STEM'];
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:26 }}>
      <div>
        <label style={lbl()}>Club Logo / Avatar</label>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:72, height:72, borderRadius:'50%', overflow:'hidden', background:`${meta.color}22`, border:`3px solid ${draft.accentColor}`, flexShrink:0, display:'grid', placeItems:'center', boxShadow:`0 4px 18px ${draft.accentColor}30` }}>
            {draft.logoUrl
              ? <img src={draft.logoUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>(e.target as HTMLImageElement).style.display='none'} />
              : <span style={{ color:meta.color, fontWeight:900, fontSize:22 }}>{draft.name.split(' ').slice(0,2).map(p=>p[0]?.toUpperCase()).join('')||'?'}</span>}
          </div>
          <div style={{ flex:1 }}>
            <input style={{ ...inp(), marginBottom:8 }} value={draft.logoUrl} onChange={e => set('logoUrl', e.target.value)} placeholder="https://… (image URL)" />
            <label style={{ cursor:'pointer', color: RED, fontSize:13, fontWeight:700, display:'inline-flex', alignItems:'center', gap:6 }}>
              <LinkIcon />
               Upload from device
              <input type="file" accept="image/*" style={{ display:'none' }} onChange={e=>{const f=e.target.files?.[0];if(f){const r=new FileReader();r.onload=()=>set('logoUrl',r.result as string);r.readAsDataURL(f);}}} />
            </label>
          </div>
        </div>
      </div>
      <div>
        <label style={lbl()}>Banner Image</label>
        <div style={{ width:'100%', height:120, borderRadius:14, overflow:'hidden', background:meta.gradient, marginBottom:12, position:'relative', boxShadow:'0 4px 18px rgba(0,0,0,0.12)' }}>
          {draft.bannerUrl && <img src={draft.bannerUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>(e.target as HTMLImageElement).style.display='none'} />}
          {!draft.bannerUrl && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:6 }}><ImageIcon /><span style={{ color:'rgba(255,255,255,0.55)', fontSize:12 }}>Category gradient preview</span></div>}
        </div>
        <input style={{ ...inp(), marginBottom:8 }} value={draft.bannerUrl} onChange={e=>set('bannerUrl',e.target.value)} placeholder="https://… (banner image URL, 1280×320 recommended)" />
        <label style={{ cursor:'pointer', color:RED, fontSize:13, fontWeight:700, display:'inline-flex', alignItems:'center', gap:6 }}>
          <LinkIcon />
           Upload banner
          <input type="file" accept="image/*" style={{ display:'none' }} onChange={e=>{const f=e.target.files?.[0];if(f){const r=new FileReader();r.onload=()=>set('bannerUrl',r.result as string);r.readAsDataURL(f);}}} />
        </label>
      </div>
      <div>
        <label style={lbl()}>Accent Color</label>
        <div style={{ display:'flex', alignItems:'center', gap:10, background:INPUT_BG, border:`1.5px solid ${INPUT_BORDER}`, borderRadius:12, padding:'8px 12px' }}>
          <input type="color" value={draft.accentColor} onChange={e=>set('accentColor',e.target.value)} style={{ width:38, height:38, border:'none', borderRadius:8, cursor:'pointer', background:'none', padding:2, flexShrink:0 }} />
          <input style={{ ...inp(), flex:1, background:'transparent', border:`1.5px solid ${INPUT_BORDER}`, padding:'7px 12px', borderRadius:8 }} value={draft.accentColor} onChange={e=>set('accentColor',e.target.value)} placeholder="#B4002E" />
        </div>
        <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>
          {[RED,'#3b82f6','#10b981','#f59e0b','#ec4899','#8b5cf6','#14b8a6','#ef4444'].map(c => (
            <button key={c} onClick={() => set('accentColor',c)} aria-label={`Select accent color ${c}`} style={{ width:28, height:28, borderRadius:'50%', background:c, border:draft.accentColor===c?'3px solid #111':'2px solid rgba(0,0,0,0.10)', cursor:'pointer', transition:'all 0.15s', flexShrink:0 }} />
          ))}
        </div>
      </div>
      <div>
        <label style={lbl()}>Profile Page Background</label>
        <div style={{ display:'flex', alignItems:'center', gap:10, background:INPUT_BG, border:`1.5px solid ${INPUT_BORDER}`, borderRadius:12, padding:'8px 12px', marginBottom:10 }}>
          <input type="color" value={draft.bgColor} onChange={e=>set('bgColor',e.target.value)} style={{ width:38, height:38, border:'none', borderRadius:8, cursor:'pointer', background:'none', padding:2, flexShrink:0 }} />
          <input style={{ ...inp(), flex:1, background:'transparent', border:`1.5px solid ${INPUT_BORDER}`, padding:'7px 12px', borderRadius:8 }} value={draft.bgColor} onChange={e=>set('bgColor',e.target.value)} placeholder="#0d0d0d" />
          <div style={{ width:1, height:28, background:INPUT_BORDER, flexShrink:0 }} />
          <button onClick={()=>set('textMode',draft.textMode==='light'?'dark':'light')} style={{ display:'flex', alignItems:'center', gap:6, background:draft.textMode==='light'?'#fff':'#1a1a1a', border:`1px solid ${draft.textMode==='light'?'#ccc':'#444'}`, borderRadius:20, padding:'5px 14px', cursor:'pointer', flexShrink:0 }}>
            <span style={{ fontSize:13 }}>{draft.textMode==='light'?'☀️':'🌙'}</span>
            <span style={{ fontSize:12, fontWeight:700, color:draft.textMode==='light'?'#111':'#fff' }}>{draft.textMode==='light'?'Light':'Dark'}</span>
          </button>
        </div>
        <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
          {BG_PRESETS.map(p => (
            <button key={p.value} onClick={()=>set('bgColor',p.value)} style={{ display:'flex', alignItems:'center', gap:5, background:draft.bgColor===p.value?`${RED}14`:'rgba(0,0,0,0.04)', border:`1px solid ${draft.bgColor===p.value?RED:'rgba(0,0,0,0.10)'}`, borderRadius:8, padding:'5px 10px', cursor:'pointer', fontSize:11, fontWeight:700, color:T2, transition:'all 0.15s' }}>
              <span style={{ width:10, height:10, borderRadius:'50%', background:p.value, border:'1.5px solid rgba(0,0,0,0.14)', display:'inline-block', flexShrink:0 }} />{p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Details ──────────────────────────────────────────────────────────
function StepDetails({ draft, set }: { draft: ClubDraft; set: (k: keyof ClubDraft, v: any) => void }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
      <div>
        <label style={lbl()}>Welcome / Intro Message</label>
        <p style={{ fontSize:12, color:T3, marginBottom:10, lineHeight:1.55, marginTop:0 }}>Pops up the first time a student visits your club page.</p>
        <textarea style={{ ...inp(), minHeight:140, resize:'vertical', lineHeight:1.7 }} value={draft.introMessage} onChange={e=>set('introMessage',e.target.value)}
          placeholder={`Welcome to ${draft.name||'our club'}!\n\nWe meet every [day] at [time] in [location].\n\nTo join, [instructions]…`} />
      </div>
      <div>
        <label style={lbl()}><DiscordIcon /> Discord Server Invite URL</label>
        <input style={inp()} value={draft.discordUrl} onChange={e=>set('discordUrl',e.target.value)} placeholder="https://discord.gg/…" />
      </div>
      <div>
        <label style={{ ...lbl(), display:'flex', alignItems:'center', gap:6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          Instagram Profile URL <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0, color:T3, fontSize:10 }}>(optional)</span>
        </label>
        <input style={inp()} value={draft.instagramUrl} onChange={e=>set('instagramUrl',e.target.value)} placeholder="https://instagram.com/yourclub" />
      </div>
      <div>
        <label style={lbl()}>Estimated Member Count</label>
        <input style={{ ...inp(), maxWidth:160 }} type="number" min={0} value={draft.memberCount||''} onChange={e=>set('memberCount',parseInt(e.target.value)||0)} placeholder="e.g. 45" />
      </div>
    </div>
  );
}

// ─── Step 5: Review ───────────────────────────────────────────────────────────
function StepReview({ draft }: { draft: ClubDraft }) {
  const checks = [
    { ok:!!draft.name,        label:'Club name set' },
    { ok:!!draft.tagline,     label:'Tagline set' },
    { ok:!!draft.description, label:'Description written' },
    { ok:!!draft.cardBlurb||!!draft.description, label:'Card description ready' },
    { ok:draft.cardChips.length>0,               label:'Card chips added' },
    { ok:!!draft.logoUrl,     label:'Logo / avatar uploaded' },
    { ok:!!draft.bannerUrl,   label:'Banner image set' },
    { ok:!!draft.introMessage,label:'Intro message written' },
    { ok:!!draft.discordUrl,  label:'Discord link added' },
    { ok:!!draft.instagramUrl,label:'Instagram linked' },
  ];
  const done = checks.filter(c=>c.ok).length;
  const pct  = Math.round((done/checks.length)*100);
  const barColor = pct>=80?'#16a34a':pct>=50?'#d97706':RED;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <div style={{ background:'rgba(180,0,46,0.06)', border:`1px solid rgba(180,0,46,0.14)`, borderRadius:14, padding:'18px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <span style={{ color:T1, fontWeight:700, fontSize:14 }}>Profile Completion</span>
          <span style={{ color:barColor, fontWeight:900, fontSize:16 }}>{pct}%</span>
        </div>
        <div style={{ background:'rgba(0,0,0,0.07)', borderRadius:99, height:7, overflow:'hidden' }}>
          <div style={{ width:`${pct}%`, height:'100%', background:barColor, borderRadius:99, transition:'width 0.5s ease' }} />
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'10px 22px', marginTop:14 }}>
          {checks.map((c,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:c.ok?'#15803d':T3, fontWeight:600 }}>
              <div style={{ width:16, height:16, borderRadius:'50%', background:c.ok?'#dcfce7':'rgba(0,0,0,0.05)', border:`1.5px solid ${c.ok?'#86efac':'rgba(0,0,0,0.10)'}`, display:'grid', placeItems:'center', flexShrink:0 }}>
                {c.ok && <CheckIcon />}
              </div>
              {c.label}
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:'rgba(255,255,255,0.94)', borderRadius:14, overflow:'hidden', border:'1px solid rgba(0,0,0,0.07)' }}>
        {[
          ['Name',draft.name||'—'],['Category',draft.category],['Tagline',draft.tagline||'—'],
          ['Card Chips',draft.cardChips.join(', ')||'—'],
          ['Accent Color',draft.accentColor],['Discord',draft.discordUrl||'—'],
          ['Instagram',draft.instagramUrl||'—'],
          ['Members',draft.memberCount?`~${draft.memberCount}`:'—'],
        ].map(([k,v],i) => (
          <div key={i} style={{ display:'flex', padding:'11px 18px', borderBottom:'1px solid rgba(0,0,0,0.05)', gap:16 }}>
            <div style={{ width:120, flexShrink:0, color:T3, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5 }}>{k}</div>
            <div style={{ flex:1, color:T1, fontSize:13, wordBreak:'break-all' }}>
              {k==='Accent Color'
                ? <span style={{ display:'inline-flex', alignItems:'center', gap:8 }}><span style={{ width:14, height:14, borderRadius:'50%', background:v, display:'inline-block', border:'1px solid rgba(0,0,0,0.14)' }} />{v}</span>
                : v}
            </div>
          </div>
        ))}
      </div>
      {pct < 50 && <div style={{ background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.18)', borderRadius:12, padding:'12px 16px', fontSize:13, color:'#b91c1c', lineHeight:1.6 }}>⚠️ Less than 50% complete — a fuller profile attracts significantly more members!</div>}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface CreateClubPageProps {
  onClubCreated?: (club: Club, detail: ClubDetail) => void;
  onBack?: () => void;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CreateClubPage({ onClubCreated, onBack }: CreateClubPageProps) {
  const router   = useRouter();
  const isNarrow = useIsNarrow(900);
  const [step, setStep]               = useState(1);
  const [draft, setDraft]             = useState<ClubDraft>(EMPTY_DRAFT);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const set = useCallback((k: keyof ClubDraft, v: any) => setDraft(d => ({ ...d, [k]: v })), []);
  const stepValid = (s: number) => s===1 ? !!draft.name.trim()&&!!draft.tagline.trim()&&!!draft.description.trim() : true;
  const accent = draft.accentColor || RED;

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    const newId = `club-${Date.now()}`;
    const slug  = draft.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
    const newClub: Club = {
      id:newId, slug, name:draft.name, category:draft.category,
      tagline:draft.tagline, description:draft.description, tags:draft.tags,
      logoUrl:draft.logoUrl||undefined, bannerUrl:draft.bannerUrl||undefined,
      href:`/clubs/${newId}`,
      card:{ headline:draft.cardHeadline||draft.name, blurb:draft.cardBlurb||draft.description, chips:draft.cardChips },
    };
    const newDetail = {
      id:newId, name:draft.name, tagline:draft.tagline, description:draft.description,
      introMessage:draft.introMessage||`Welcome to ${draft.name}!`,
      logoUrl:draft.logoUrl||undefined, bannerUrl:draft.bannerUrl||undefined,
      accentColor:draft.accentColor, discordUrl:draft.discordUrl||undefined,
      instagramUrl:draft.instagramUrl||undefined,
      memberCount:draft.memberCount, category:draft.category,
      founded:draft.founded||new Date().getFullYear().toString(),
    } as ClubDetail;
    onClubCreated?.(newClub, newDetail);
    setSaving(false);
    setSaved(true);
  };

  // Success
  if (saved) {
    return (
      <>
        <WaveBackground />
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Segoe UI',system-ui,sans-serif", backgroundColor:'transparent' }}>
          <div style={{ ...box({ padding:'48px 40px', textAlign:'center' }), maxWidth:460, width:'100%' }}>
            <div style={{ fontSize:64, marginBottom:16 }}>🎉</div>
            <h1 style={{ color:T1, fontSize:30, fontWeight:900, margin:'0 0 12px', letterSpacing:-1 }}>{draft.name} is live!</h1>
            <p style={{ color:T2, fontSize:15, lineHeight:1.7, marginBottom:32 }}>Your club is now visible in Club Connect. Students can discover, join, and follow updates.</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={() => router.push(`/clubs/${draft.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}`) }
                style={{ background:RED, color:'#fff', border:'none', borderRadius:12, padding:'13px 28px', cursor:'pointer', fontWeight:800, fontSize:15, boxShadow:`0 8px 30px ${RED}55` }}>View Club Page →</button>
              <button onClick={() => router.push('/clubs')}
                style={{ background:'rgba(255,255,255,0.85)', color:RED_DARK, border:`1px solid rgba(180,0,46,0.22)`, borderRadius:12, padding:'13px 28px', cursor:'pointer', fontWeight:700, fontSize:15 }}>Back to Hub</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Wizard ───────────────────────────────────────────────────────────────────
  // KEY: The root element is a plain div with no position/overflow that could
  // interfere with sticky. WaveBackground is position:fixed z-index:-1.
  return (
    <>
      {/* Animated wave canvas — position:fixed, z-index:-1, zero layout impact */}
      <WaveBackground />

      {/* Page shell — transparent so canvas shows through */}
      <div style={{ minHeight:'100vh', fontFamily:"'Segoe UI',system-ui,sans-serif", backgroundColor:'transparent' }}>

        {/* ── STICKY HEADER ────────────────────────────────────────────────── */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(20,0,8,0.90)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 2px 24px rgba(0,0,0,0.40)',
          padding: '12px 24px',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <button onClick={onBack ?? (() => router.push('/clubs'))}
            style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(180,0,46,0.18)', border:'1px solid rgba(255,80,80,0.28)', borderRadius:10, color:'rgba(255,200,200,0.90)', padding:'7px 14px', cursor:'pointer', fontSize:13, fontWeight:700, flexShrink:0, transition:'all 0.15s' }}>
            <ChevronLeft /> Back
          </button>

          <div style={{ flex:1, minWidth:0 }}>
            <h1 style={{ margin:0, fontSize:16, fontWeight:900, color:'#fff', letterSpacing:-0.3 }}>Create New Club</h1>
            <div style={{ color:OUT_MUTED, fontSize:12, marginTop:1 }}>{draft.name?`"${draft.name}"` : 'Fill in the details below'}</div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            {STEPS.map((s, i) => {
              const state = step===s.id?'active':step>s.id?'done':'todo';
              return (
                <React.Fragment key={s.id}>
                  <button onClick={() => state==='done'&&setStep(s.id)} style={{
                    display:'flex', alignItems:'center', gap:5, borderRadius:99, padding:'5px 11px',
                    background: state==='active'?RED:state==='done'?'rgba(34,197,94,0.18)':'rgba(255,255,255,0.08)',
                    border:`1.5px solid ${state==='active'?RED:state==='done'?'#22c55e':'rgba(255,255,255,0.22)'}`,
                    color: state==='active'?'#fff':state==='done'?'#86efac':'rgba(255,255,255,0.60)',
                    fontWeight:700, fontSize:12, cursor:state==='done'?'pointer':'default', transition:'all 0.2s',
                  }}>
                    {state==='done'
                      ? <CheckIcon />
                      : <span style={{ width:8, height:8, borderRadius:'50%', background:'currentColor', opacity:0.6, flexShrink:0, display:'inline-block' }} />}
                    {!isNarrow && <span>{s.label}</span>}
                  </button>
                  {i<STEPS.length-1 && <div style={{ width:10, height:1, background:'rgba(255,80,80,0.18)' }} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ── BODY ─────────────────────────────────────────────────────────── */}
        <div style={{
          maxWidth:1100, margin:'0 auto', width:'100%',
          padding:'32px 20px',
          display:'grid',
          gridTemplateColumns: showPreview&&!isNarrow ? '1fr 300px' : '1fr',
          gap:28, alignItems:'start',
        }}>

          {/* Form column */}
          <div>
            <div style={{ marginBottom:22, display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:13, background:'rgba(255,255,255,0.12)', border:'1.5px solid rgba(255,255,255,0.22)', display:'grid', placeItems:'center', color:'#fff', flexShrink:0 }}>
                {React.createElement(STEPS[step-1].icon)}
              </div>
              <div>
                <div style={{ fontSize:22, fontWeight:900, color:OUT_TITLE, letterSpacing:-0.5 }}>Step {step} — {STEPS[step-1].label}</div>
                <div style={{ fontSize:13, color:OUT_SUB, marginTop:2 }}>
                  {step===1&&'Give your club a name, category, and description'}
                  {step===2&&'Customize how your club appears on the hub flip card'}
                  {step===3&&'Set your branding — logo, banner, and colors'}
                  {step===4&&'Intro message, Discord link, and extra details'}
                  {step===5&&'Review everything before publishing'}
                </div>
              </div>
            </div>

            <div style={box({ padding:28 })}>
              {step===1&&<StepIdentity   draft={draft} set={set} />}
              {step===2&&<StepCard       draft={draft} set={set} />}
              {step===3&&<StepAppearance draft={draft} set={set} />}
              {step===4&&<StepDetails    draft={draft} set={set} />}
              {step===5&&<StepReview     draft={draft} />}
            </div>

            {/* Navigation */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:20 }}>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                {step>1 && (
                  <button onClick={()=>setStep(s=>s-1)}
                    style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.22)', borderRadius:10, padding:'10px 20px', cursor:'pointer', color:'#fff', fontWeight:700, fontSize:14 }}>
                    <ChevronLeft /> Back
                  </button>
                )}
                <button onClick={()=>setShowPreview(v=>!v)}
                  style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:10, padding:'10px 14px', cursor:'pointer', color:'rgba(255,220,220,0.80)', fontSize:12, fontWeight:600 }}>
                  <EyeIcon /> {showPreview?'Hide':'Show'} Preview
                </button>
              </div>
              {step<5
                ? <button onClick={()=>setStep(s=>s+1)} disabled={!stepValid(step)} style={{ display:'flex', alignItems:'center', gap:8, background:stepValid(step)?RED:'rgba(255,255,255,0.10)', color:stepValid(step)?'#fff':'rgba(255,255,255,0.30)', border:'none', borderRadius:12, padding:'12px 28px', cursor:stepValid(step)?'pointer':'not-allowed', fontWeight:800, fontSize:15, transition:'all 0.2s', boxShadow:stepValid(step)?`0 6px 20px ${RED}55`:'none' }}>Continue <ChevronRight /></button>
                : <button onClick={handleSave} disabled={saving} style={{ display:'flex', alignItems:'center', gap:10, background:saving?'rgba(255,255,255,0.12)':RED, color:'#fff', border:'none', borderRadius:12, padding:'14px 36px', cursor:saving?'wait':'pointer', fontWeight:900, fontSize:16, boxShadow:saving?'none':`0 8px 30px ${RED}66`, transition:'all 0.3s' }}>
                    {saving?<><span style={{ animation:'spin 0.8s linear infinite', display:'inline-block' }}>⟳</span> Creating…</>:<><RocketIcon /> Publish Club</>}
                  </button>}
            </div>

            {/* Progress dots */}
            <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:18 }}>
              {STEPS.map(s => (
                <div key={s.id} style={{ width:step===s.id?28:8, height:8, borderRadius:99, background:step===s.id?RED:step>s.id?'rgba(180,0,46,0.45)':'rgba(255,255,255,0.15)', transition:'all 0.3s ease' }} />
              ))}
            </div>
          </div>

          {/* ── PREVIEW COLUMN — sticky below header ── */}
          {showPreview && !isNarrow && (
            <div style={{ position:'sticky', top:68, alignSelf:'start' }}>
              <div style={box({ padding:22 })}>
                <div style={{ fontSize:10, fontWeight:800, color:HINT, letterSpacing:0.9, textTransform:'uppercase', marginBottom:16, textAlign:'center' }}>Card Preview</div>
                <LiveFlipCard draft={draft} />
                {step>=3 && (
                  <div style={{ marginTop:22 }}>
                    <div style={{ fontSize:10, fontWeight:800, color:HINT, letterSpacing:0.9, textTransform:'uppercase', marginBottom:12, textAlign:'center' }}>Profile Page Theme</div>
                    <div style={{ borderRadius:12, overflow:'hidden', border:`1px solid rgba(180,0,46,0.16)`, boxShadow:'0 4px 14px rgba(0,0,0,0.08)' }}>
                      {draft.bannerUrl
                        ? <div style={{ height:50, backgroundImage:`url(${draft.bannerUrl})`, backgroundSize:'cover', backgroundPosition:'center' }} />
                        : <div style={{ height:50, background:`linear-gradient(135deg,${draft.accentColor},${draft.accentColor}99)` }} />}
                      <div style={{ background:draft.bgColor, padding:'8px 14px', display:'flex', alignItems:'center', gap:9 }}>
                        <div style={{ width:34, height:34, borderRadius:'50%', background:draft.accentColor, border:`2px solid ${draft.accentColor}`, flexShrink:0, overflow:'hidden', boxShadow:`0 0 0 2px ${draft.bgColor}` }}>
                          {draft.logoUrl&&<img src={draft.logoUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>(e.target as HTMLImageElement).style.display='none'} />}
                        </div>
                        <div>
                          <div style={{ fontSize:12, fontWeight:800, color:draft.textMode==='light'?'#111':'#fff', lineHeight:1.2 }}>{draft.name||'Club Name'}</div>
                          <div style={{ fontSize:10, color:draft.textMode==='light'?'#666':'rgba(255,255,255,0.5)' }}>{draft.category}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* Make browser background transparent so canvas wave is visible */
        html, body { background: transparent !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, textarea:focus, select:focus {
          border-color: ${RED} !important;
          box-shadow: 0 0 0 3px rgba(180,0,46,0.13) !important;
          outline: none !important;
        }
        input::placeholder, textarea::placeholder { color: rgba(0,0,0,0.28) !important; }
        ::-webkit-scrollbar { width: 6px; background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(180,0,46,0.30); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(180,0,46,0.50); }
      `}</style>
    </>
  );
}
