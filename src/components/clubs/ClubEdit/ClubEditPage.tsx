// ClubEditPage.tsx
'use client';

// ═══════════════════════════════════════════════════════════════════════
// BACKEND INTEGRATION — ClubEditPage
// ═══════════════════════════════════════════════════════════════════════
// This component renders the management dashboard for a club.
// It is rendered inside ClubProfilePage when isLeader === true.
//
// DATA LOADING:
//   - club, members, events are currently passed as props from ClubProfilePage.
//   - Replace prop-drilling with SWR/React Query hooks:
//       const { data: club } = useSWR(`/api/clubs/${clubId}`, fetcher)
//       const { data: members } = useSWR(`/api/clubs/${clubId}/members`, fetcher)
//       const { data: events } = useSWR(`/api/clubs/${clubId}/events`, fetcher)
//
// SAVE — handleSave():
//   PATCH /api/clubs/:clubId
//   body: { name, tagline, description, category, introMessage, discordUrl,
//           accentColor, bgColor, textMode, logoUrl, bannerUrl, card }
//   Auth: verify user is President/Officer via club_members row
//
// EVENTS:
//   Create → POST /api/clubs/:clubId/events  { title, description, date, time, location }
//   Delete → DELETE /api/events/:eventId
//
// MEMBER MANAGEMENT:
//   Kick   → DELETE /api/clubs/:clubId/members/:userId
//   Block  → PATCH  /api/clubs/:clubId/members/:userId  { blocked: true }
//   Role   → PATCH  /api/clubs/:clubId/members/:userId  { role: 'VP' | 'Officer' | 'Member' }
//   Note: President role change should require additional confirmation + ownership transfer logic.
//
// IMAGE UPLOAD (logo / banner):
//   POST /api/upload  (multipart/form-data)
//   Returns { url: string } — store in clubs.logo_url / clubs.banner_url
//   Currently uses FileReader base64 as a placeholder.
//
// AUTH GUARD:
//   Wrap this component render in:
//     if (!['President','VP','Officer'].includes(userMembership?.role)) return null
//   or enforce via middleware / RLS on Supabase.
// ═══════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { ClubDetail as ClubDetailBase, ClubMember } from '../temp(mockdata)/clubs.data';

// Extend ClubDetail locally to include editable UI fields
type Club = ClubDetailBase & {
  textMode?: 'dark' | 'light';
  bgColor?: string;
  instagramUrl?: string;
  card?: {
    blurb?: string;
    chips?: string[];
  };
};

const BackIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>;
const TrashIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>;
const BanIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>;
const AddIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const SaveIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>;
const XIcon     = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const InstagramIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;

function makeInputStyle(bg = '#1e1e1e', borderColor = '#3a3a3a', color = '#fff'): React.CSSProperties {
  return { width: '100%', background: bg, border: `1px solid ${borderColor}`, borderRadius: 10, padding: '10px 14px', color, fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' };
}

function makeLabelStyle(color = '#bbb'): React.CSSProperties {
  return { display: 'block', color, fontSize: 13, fontWeight: 600, marginBottom: 6 };
}

function makeSectionStyle(bg: string, border: string): React.CSSProperties {
  return { background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: 24, marginBottom: 20 };
}

function SectionTitle({ children, color = '#fff' }: { children: React.ReactNode; color?: string }) {
  return (
    <h3 style={{ color, fontSize: 16, fontWeight: 700, margin: '0 0 18px', paddingBottom: 10, borderBottom: '1px solid rgba(128,128,128,0.2)' }}>
      {children}
    </h3>
  );
}

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  React.useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1a8a4a', color: '#fff', borderRadius: 10, padding: '12px 20px', fontWeight: 600, fontSize: 14, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
      ✓ {msg}
    </div>
  );
}

type NewEvent = { title: string; description: string; date: string; time: string; location: string };

function NewEventForm({ accentColor, onAdd, inputStyle, labelStyle }: {
  accentColor: string;
  onAdd: (e: NewEvent) => void;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}) {
  const [form, setForm] = useState<NewEvent>({ title: '', description: '', date: '', time: '', location: '' });
  const [open, setOpen] = useState(false);

  const submit = () => {
    if (!form.title || !form.date) return;
    onAdd(form);
    setForm({ title: '', description: '', date: '', time: '', location: '' });
    setOpen(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: accentColor + '22', border: `1px dashed ${accentColor}66`, borderRadius: 10, padding: '12px 18px', color: accentColor, cursor: 'pointer', fontWeight: 600, fontSize: 14, width: '100%', justifyContent: 'center' }}>
        <AddIcon /> Create New Event
      </button>
    );
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${accentColor}44`, borderRadius: 12, padding: 20, marginBottom: 12 }}>
      <div style={{ color: inputStyle.color, fontWeight: 700, fontSize: 15, marginBottom: 16 }}>New Event</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={labelStyle}>Event Title *</label>
          <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Workshop, Meeting, Showcase..." />
        </div>
        <div>
          <label style={labelStyle}>Date *</label>
          <input style={inputStyle} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Time</label>
          <input style={inputStyle} type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={labelStyle}>Location</label>
          <input style={inputStyle} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Building, room, or 'Online'" />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What should members know?" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={submit} style={{ background: accentColor, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Add Event</button>
        <button onClick={() => setOpen(false)} style={{ background: 'transparent', color: '#888', border: '1px solid #444', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
      </div>
    </div>
  );
}

const roleColor = (role: ClubMember['role']) => {
  switch (role) {
    case 'President': return '#FFD700';
    case 'VP':        return '#C0C0C0';
    case 'Officer':   return '#D22030';
    default:          return '#6b7280';
  }
};

function MemberRow({ member, onKick, onBlock, onRoleChange }: {
  member: ClubMember;
  onKick: (id: string) => void;
  onBlock: (id: string) => void;
  onRoleChange: (id: string, role: ClubMember['role']) => void;
}) {
  const [confirm, setConfirm] = useState<'kick' | 'block' | null>(null);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid rgba(128,128,128,0.12)' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: '#333', flexShrink: 0 }}>
        {member.avatar
          ? <img src={member.avatar} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>{member.name[0]}</div>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: member.blocked ? '#666' : '#fff', fontWeight: 600, fontSize: 14 }}>
          {member.name} {member.blocked && <span style={{ color: '#D22030', fontSize: 11 }}>(blocked)</span>}
        </div>
        <div style={{ color: '#666', fontSize: 12 }}>{member.major}</div>
      </div>
      <select value={member.role} onChange={e => onRoleChange(member.id, e.target.value as ClubMember['role'])} disabled={member.role === 'President'}
        style={{ background: '#1e1e1e', border: `1px solid ${roleColor(member.role)}44`, borderRadius: 6, color: roleColor(member.role), padding: '4px 8px', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>
        <option value="President">President</option>
        <option value="VP">VP</option>
        <option value="Officer">Officer</option>
        <option value="Member">Member</option>
      </select>
      {confirm ? (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ color: '#ccc', fontSize: 12 }}>Sure?</span>
          <button onClick={() => { confirm === 'kick' ? onKick(member.id) : onBlock(member.id); setConfirm(null); }}
            style={{ background: '#D22030', color: '#fff', border: 'none', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: 12 }}>Yes</button>
          <button onClick={() => setConfirm(null)}
            style={{ background: '#333', color: '#fff', border: 'none', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: 12 }}>No</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 6 }}>
          <button aria-label={`Remove ${member.name} from club`} onClick={() => setConfirm('kick')} disabled={member.role === 'President'}
            style={{ background: 'rgba(210,32,48,0.1)', border: '1px solid rgba(210,32,48,0.3)', color: '#D22030', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: member.role === 'President' ? 0.3 : 1 }}>
            <TrashIcon />
          </button>
          <button aria-label={member.blocked ? `Unblock ${member.name}` : `Block ${member.name}`} onClick={() => setConfirm('block')} disabled={member.role === 'President'}
            style={{ background: 'rgba(255,160,0,0.1)', border: '1px solid rgba(255,160,0,0.3)', color: '#FFA000', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: member.role === 'President' ? 0.3 : 1 }}>
            <BanIcon />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Flip Card Preview ────────────────────────────────────────────────────────
function FlipCardPreview({ club, accentColor }: { club: Club; accentColor: string }) {
  const [flipped, setFlipped] = useState(false);
  const chips = club.card?.chips ?? [];

  const categoryColor: Record<string, string> = {
    STEM: 'rgba(59,130,246,0.85)', Business: 'rgba(16,185,129,0.85)', Arts: 'rgba(236,72,153,0.85)',
    Cultural: 'rgba(245,158,11,0.85)', Sports: 'rgba(239,68,68,0.85)', Literature: 'rgba(139,92,246,0.85)',
    Fraternity: 'rgba(20,184,166,0.85)', Sorority: 'rgba(244,114,182,0.85)',
  };
  const catColor = categoryColor[club.category ?? ''] ?? 'rgba(100,100,100,0.75)';

  return (
    <div onClick={() => setFlipped(v => !v)}
      style={{ position: 'relative', height: 280, perspective: '1200px', cursor: 'pointer', userSelect: 'none', width: 260, margin: '0 auto' }}>
      <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transition: 'transform 540ms cubic-bezier(0.2,0.8,0.2,1)', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', borderRadius: 20, boxShadow: '0 10px 35px rgba(0,0,0,0.5)' }}>
        {/* Front */}
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', borderRadius: 20, overflow: 'hidden', background: 'rgba(255,255,255,0.95)' }}>
          <div style={{ height: 110, background: club.bannerUrl ? undefined : `linear-gradient(135deg,#1e3a8a,#3b82f6)`, backgroundImage: club.bannerUrl ? `url(${club.bannerUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 8, right: 8, background: catColor, color: '#fff', borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase' }}>{club.category}</div>
          </div>
          <div style={{ position: 'absolute', top: 74, left: 14, width: 56, height: 56, borderRadius: '50%', border: '3px solid white', overflow: 'hidden', background: catColor, display: 'grid', placeItems: 'center', zIndex: 10 }}>
            {club.logoUrl
              ? <img src={club.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>{club.name?.[0]}</span>}
          </div>
          <div style={{ paddingTop: 36, paddingLeft: 16, paddingRight: 16 }}>
            <div style={{ fontWeight: 900, fontSize: 15, color: '#1a0408', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{club.name}</div>
            <div style={{ fontSize: 12, color: 'rgba(45,16,18,0.6)', marginTop: 4, lineHeight: 1.4 }}>{club.tagline}</div>
          </div>
        </div>
        {/* Back */}
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: 20, overflow: 'hidden', background: 'rgba(255,255,255,0.95)', padding: 20, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 900, fontSize: 15, color: '#1a0408' }}>{club.name}</div>
          <div style={{ fontSize: 12, color: 'rgba(45,16,18,0.7)', lineHeight: 1.55, marginTop: 8, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
            {club.card?.blurb || club.description || 'No description set.'}
          </div>
          {chips.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 10 }}>
              {chips.map(c => (
                <span key={c} style={{ fontSize: 11, fontWeight: 800, background: 'rgba(180,0,46,0.09)', color: '#B4002E', border: '1px solid rgba(180,0,46,0.18)', borderRadius: 99, padding: '2px 8px' }}>{c}</span>
              ))}
            </div>
          )}
          <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(45,16,18,0.4)', fontWeight: 700 }}>Click to flip back</div>
        </div>
      </div>
    </div>
  );
}

interface ClubEditPageProps {
  club: Club;
  members: ClubMember[];
  onSave: (updated: Club) => void;
  onBack: () => void;
  bgColor?: string;
}

export default function ClubEditPage({ club, members: initialMembers, onSave, onBack, bgColor: externalBg }: ClubEditPageProps) {
  const [form, setForm] = useState<Club>({ textMode: 'dark', bgColor: externalBg ?? '#0d0d0d', ...club });
  const [memberList, setMemberList] = useState<ClubMember[]>(initialMembers);
  const [events, setEvents] = useState([
    // BACKEND: Replace with useSWR(`/api/clubs/${club.id}/events`, fetcher)
    // Supabase: SELECT * FROM club_events WHERE club_id = :clubId ORDER BY date ASC
    { id: 'e1', title: 'Intro to ROS2 Workshop', date: '2025-02-27', time: '18:00', location: 'Eng. Bldg 204' },
    { id: 'e2', title: 'Spring Robotics Showcase', date: '2025-04-12', time: '14:00', location: 'Main Quad' },
  ]);
  const [toast, setToast] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [activeSection, setActiveSection] = useState<'info' | 'appearance' | 'events' | 'members'>('info');
  const [newChip, setNewChip] = useState('');

  const accentColor = form.accentColor;
  const isDark = form.textMode !== 'light';
  const pageBg   = form.bgColor ?? '#0d0d0d';
  const txtPrimary   = isDark ? '#ffffff' : '#0a0a0a';
  const txtSecondary = isDark ? '#aaaaaa' : '#555555';
  const sectionBg    = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const sectionBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)';
  const inputBg     = isDark ? '#1e1e1e' : '#f5f5f5';
  const inputBorder = isDark ? '#3a3a3a' : '#d0d0d0';
  const inputColor  = isDark ? '#fff' : '#111';

  const inputStyle  = makeInputStyle(inputBg, inputBorder, inputColor);
  const labelStyle  = makeLabelStyle(txtSecondary);
  const sectionStyle = makeSectionStyle(sectionBg, sectionBorder);

  const handleSave = () => {
    // BACKEND: Replace with API call:
    //   const res = await fetch(`/api/clubs/${club.id}`, {
    //     method: 'PATCH',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(form),
    //   })
    //   if (!res.ok) throw new Error('Save failed')
    //   const updated = await res.json()
    //   onSave(updated)
    onSave(form);
    setToast('Club updated successfully!');
  };

  // BACKEND — member actions:
  //   kickMember  → DELETE /api/clubs/:clubId/members/:userId
  //   blockMember → PATCH  /api/clubs/:clubId/members/:userId  { blocked: !current }
  //   changeRole  → PATCH  /api/clubs/:clubId/members/:userId  { role }
  //   removeEvent → DELETE /api/events/:eventId
  // After each mutation, call mutate() if using SWR to revalidate member/event lists.
  const kickMember  = (id: string) => { setMemberList(m => m.filter(x => x.id !== id)); setToast('Member removed.'); };
  const blockMember = (id: string) => { setMemberList(m => m.map(x => x.id === id ? { ...x, blocked: !x.blocked } : x)); setToast('Member block status updated.'); };
  const changeRole  = (id: string, role: ClubMember['role']) => { setMemberList(m => m.map(x => x.id === id ? { ...x, role } : x)); setToast('Role updated.'); };
  const removeEvent = (id: string) => { setEvents(e => e.filter(ev => ev.id !== id)); setToast('Event deleted.'); };

  const addChip = () => {
    const val = newChip.trim();
    if (!val) return;
    const existing = form.card?.chips ?? [];
    if (existing.includes(val)) return;
    setForm(f => ({ ...f, card: { ...f.card, chips: [...existing, val] } }));
    setNewChip('');
  };

  const removeChip = (chip: string) => {
    setForm(f => ({ ...f, card: { ...f.card, chips: (f.card?.chips ?? []).filter(c => c !== chip) } }));
  };

  const filteredMembers = memberList.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()));

  const navItems = [
    { id: 'info',       label: '📝 Club Info' },
    { id: 'appearance', label: '🎨 Appearance' },
    { id: 'events',     label: '📅 Events' },
    { id: 'members',    label: '👥 Members' },
  ] as const;

  return (
    <div style={{ minHeight: '100vh', background: pageBg, color: txtPrimary, fontFamily: "'Segoe UI', system-ui, sans-serif", transition: 'background 0.3s ease' }}>
      {toast && <Toast msg={toast} onClose={() => setToast('')} />}

      {/* Header */}
      <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)', borderBottom: `1px solid ${sectionBorder}`, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
        <button onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: `1px solid ${sectionBorder}`, borderRadius: 8, color: txtSecondary, padding: '7px 14px', cursor: 'pointer', fontSize: 13 }}>
          <BackIcon /> Back to Club
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: txtPrimary }}>Manage Club</h1>
          <div style={{ color: txtSecondary, fontSize: 12 }}>{club.name}</div>
        </div>
        <button onClick={handleSave}
          style={{ display: 'flex', alignItems: 'center', gap: 7, background: accentColor, border: 'none', borderRadius: 8, color: '#fff', padding: '9px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
          <SaveIcon /> Save Changes
        </button>
      </div>

      <div style={{ display: 'flex', maxWidth: 1000, margin: '0 auto', padding: '24px 16px', gap: 24, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <div style={{ width: 180, flexShrink: 0, position: 'sticky', top: 80 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setActiveSection(n.id)}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: activeSection === n.id ? accentColor + '22' : 'none', border: activeSection === n.id ? `1px solid ${accentColor}44` : '1px solid transparent', borderRadius: 9, padding: '10px 14px', color: activeSection === n.id ? accentColor : txtSecondary, cursor: 'pointer', fontSize: 14, fontWeight: activeSection === n.id ? 700 : 400, marginBottom: 4, transition: 'all 0.15s' }}>
              {n.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }}>

          {/* ── INFO ── */}
          {activeSection === 'info' && (
            <div>
              <div style={sectionStyle}>
                <SectionTitle color={txtPrimary}>Basic Information</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Club Name</label>
                    <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Tagline</label>
                    <input style={inputStyle} value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="One line that sums up your club" />
                  </div>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select style={inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      <option>STEM</option><option>Arts</option><option>Sports</option><option>Social</option>
                      <option>Academic</option><option>Cultural</option><option>Service</option><option>Gaming</option>
                      <option>Business</option><option>Literature</option><option>Fraternity</option><option>Sorority</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Full Description</label>
                    <textarea style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div style={sectionStyle}>
                <SectionTitle color={txtPrimary}>Intro Message (Welcome Modal)</SectionTitle>
                <p style={{ color: txtSecondary, fontSize: 13, marginBottom: 14 }}>This message appears as a popup when someone first visits your club page.</p>
                <textarea style={{ ...inputStyle, minHeight: 130, resize: 'vertical' }} value={form.introMessage} onChange={e => setForm(f => ({ ...f, introMessage: e.target.value }))} />
              </div>

              <div style={sectionStyle}>
                <SectionTitle color={txtPrimary}>Links & Social</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Discord Server Invite URL</label>
                    <input style={inputStyle} value={form.discordUrl || ''} onChange={e => setForm(f => ({ ...f, discordUrl: e.target.value }))} placeholder="https://discord.gg/..." />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <InstagramIcon /> Instagram Profile URL
                    </label>
                    <input style={inputStyle} value={form.instagramUrl || ''} onChange={e => setForm(f => ({ ...f, instagramUrl: e.target.value }))} placeholder="https://instagram.com/yourclub" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── APPEARANCE ── */}
          {activeSection === 'appearance' && (
            <div>
              {/* Flip Card Editor */}
              <div style={sectionStyle}>
                <SectionTitle color={txtPrimary}>Club Card (Flip Card)</SectionTitle>
                <p style={{ color: txtSecondary, fontSize: 13, marginBottom: 18 }}>
                  Edit how your club appears in the hub grid. The banner and logo are shared with your profile page.
                  Click the preview card to see the back face.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
                  {/* Left: editable fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Card Tagline <span style={{ color: txtSecondary, fontWeight: 400 }}>(front of card)</span></label>
                      <input
                        style={inputStyle}
                        value={form.tagline ?? ''}
                        onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                        placeholder="One-liner shown on the card front…"
                      />
                      {form.tagline && (
                        <div style={{ fontSize: 11, color: txtSecondary, marginTop: 4, opacity: 0.7 }}>
                          Currently showing: "{form.tagline}"
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={labelStyle}>Card Short Description <span style={{ color: txtSecondary, fontWeight: 400 }}>(back of card)</span></label>
                      <textarea
                        style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                        value={form.card?.blurb ?? form.description ?? ''}
                        onChange={e => setForm(f => ({ ...f, card: { ...f.card, blurb: e.target.value } }))}
                        placeholder="Short blurb shown on the back of the flip card..."
                      />
                      {!form.card?.blurb && form.description && (
                        <div style={{ fontSize: 11, color: txtSecondary, marginTop: 4, opacity: 0.7 }}>
                          Currently showing full description as fallback. Edit above to set a custom card blurb.
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={labelStyle}>Card Tags / Chips</label>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                        {(form.card?.chips ?? []).map(chip => (
                          <span key={chip} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: accentColor + '22', border: `1px solid ${accentColor}55`, borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: accentColor }}>
                            {chip}
                            <button onClick={() => removeChip(chip)} aria-label={`Remove ${chip} tag`} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: accentColor, display: 'flex', alignItems: 'center', opacity: 0.7 }}>
                              <XIcon />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          style={{ ...inputStyle, flex: 1 }}
                          value={newChip}
                          onChange={e => setNewChip(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addChip())}
                          placeholder="Add tag and press Enter..."
                        />
                        <button onClick={addChip}
                          style={{ background: accentColor, color: '#fff', border: 'none', borderRadius: 10, padding: '0 16px', cursor: 'pointer', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: live preview */}
                  <div>
                    <label style={{ ...labelStyle, textAlign: 'center', display: 'block', marginBottom: 12 }}>Live Preview</label>
                    <FlipCardPreview club={form} accentColor={accentColor} />
                    <p style={{ color: txtSecondary, fontSize: 11, textAlign: 'center', marginTop: 8 }}>Click to preview back face</p>
                  </div>
                </div>
              </div>

              {/* Logo */}
              <div style={sectionStyle}>
                <SectionTitle color={txtPrimary}>Club Logo / Profile Picture</SectionTitle>
                <p style={{ color: txtSecondary, fontSize: 13, marginBottom: 14 }}>Shared between the flip card and the club profile page.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', background: '#222', border: `3px solid ${accentColor}`, flexShrink: 0 }}>
                    {form.logoUrl && <img src={form.logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Logo URL</label>
                    <input style={inputStyle} value={form.logoUrl || ''} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))} placeholder="https://..." />
                    <label style={{ ...labelStyle, cursor: 'pointer', color: accentColor, marginTop: 8 }}>
                      📎 Upload from device
                      <input type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={e => { const file = e.target.files?.[0]; if (file) { const r = new FileReader(); r.onload = () => setForm(f => ({ ...f, logoUrl: r.result as string })); r.readAsDataURL(file); } }} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Banner */}
              <div style={sectionStyle}>
                <SectionTitle color={txtPrimary}>Banner Image</SectionTitle>
                <p style={{ color: txtSecondary, fontSize: 12, marginBottom: 12 }}>Shared between the flip card and the club profile page. Recommended: 1280×320px</p>
                <div style={{ width: '100%', height: 140, borderRadius: 10, overflow: 'hidden', background: '#1a1a1a', border: `1px solid ${sectionBorder}`, marginBottom: 14 }}>
                  {form.bannerUrl && <img src={form.bannerUrl} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <label style={labelStyle}>Banner URL</label>
                <input style={inputStyle} value={form.bannerUrl || ''} onChange={e => setForm(f => ({ ...f, bannerUrl: e.target.value }))} placeholder="https://..." />
                <label style={{ ...labelStyle, cursor: 'pointer', color: accentColor, marginTop: 8 }}>
                  📎 Upload banner image
                  <input type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => { const file = e.target.files?.[0]; if (file) { const r = new FileReader(); r.onload = () => setForm(f => ({ ...f, bannerUrl: r.result as string })); r.readAsDataURL(file); } }} />
                </label>
              </div>

              {/* ── THEME BOX ── accent + bg color + text mode all in one row */}
              <div style={sectionStyle}>
                <SectionTitle color={txtPrimary}>Theme</SectionTitle>
                <p style={{ color: txtSecondary, fontSize: 13, marginBottom: 16 }}>
                  These settings affect the club profile page, the welcome popup, and this edit page.
                </p>

                {/* Accent Color row */}
                <label style={labelStyle}>Accent Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 10, padding: '8px 12px', marginBottom: 14 }}>
                  <input type="color" value={form.accentColor}
                    onChange={e => setForm(f => ({ ...f, accentColor: e.target.value }))}
                    style={{ width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'none', padding: 2, flexShrink: 0 }} />
                  <input style={{ ...inputStyle, flex: 1, background: 'transparent', border: `1px solid ${inputBorder}`, padding: '6px 10px', borderRadius: 8 }}
                    value={form.accentColor} onChange={e => setForm(f => ({ ...f, accentColor: e.target.value }))} placeholder="#D22030" />
                </div>

                {/* Background Color + Text Mode — same box */}
                <label style={labelStyle}>Background Color & Text Mode</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 10, padding: '8px 12px' }}>
                  {/* Bg presets */}
                  <input type="color" value={form.bgColor ?? '#0d0d0d'}
                    onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))}
                    style={{ width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'none', padding: 2, flexShrink: 0 }} />
                  <input
                    style={{ ...inputStyle, flex: 1, background: 'transparent', border: `1px solid ${inputBorder}`, padding: '6px 10px', borderRadius: 8 }}
                    value={form.bgColor ?? '#0d0d0d'}
                    onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))}
                    placeholder="#0d0d0d"
                  />
                  {/* Divider */}
                  <div style={{ width: 1, height: 28, background: inputBorder, flexShrink: 0 }} />
                  {/* Text mode toggle */}
                  <span style={{ color: txtSecondary, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>Text</span>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, textMode: f.textMode === 'light' ? 'dark' : 'light' }))}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: form.textMode === 'light' ? '#ffffff' : '#2a2a2a',
                      border: `1px solid ${form.textMode === 'light' ? '#ccc' : '#555'}`,
                      borderRadius: 20, padding: '5px 14px', cursor: 'pointer',
                      transition: 'all 0.2s', flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: 13 }}>{form.textMode === 'light' ? '☀️' : '🌙'}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: form.textMode === 'light' ? '#111' : '#fff' }}>
                      {form.textMode === 'light' ? 'Light' : 'Dark'}
                    </span>
                  </button>
                </div>

                {/* Quick bg presets */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  {[
                    { label: 'Midnight', value: '#0d0d0d' }, { label: 'Obsidian', value: '#111827' },
                    { label: 'Crimson',  value: '#12000a' }, { label: 'Navy',     value: '#050d1a' },
                    { label: 'Forest',   value: '#030f08' }, { label: 'Slate',    value: '#0c0e12' },
                    { label: 'White',    value: '#f8f8f8' }, { label: 'Light',    value: '#f0f2f5' },
                  ].map(p => (
                    <button key={p.value} onClick={() => setForm(f => ({ ...f, bgColor: p.value }))}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, background: (form.bgColor ?? '#0d0d0d') === p.value ? accentColor + '33' : 'rgba(128,128,128,0.1)', border: `1px solid ${(form.bgColor ?? '#0d0d0d') === p.value ? accentColor : 'rgba(128,128,128,0.2)'}`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: txtSecondary, transition: 'all 0.15s' }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: p.value, border: '1px solid rgba(255,255,255,0.2)', display: 'inline-block', flexShrink: 0 }} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── EVENTS ── */}
          {activeSection === 'events' && (
            <div style={sectionStyle}>
              <SectionTitle color={txtPrimary}>Manage Events</SectionTitle>
              <NewEventForm accentColor={accentColor} inputStyle={inputStyle} labelStyle={labelStyle} onAdd={ev => {
                setEvents(e => [...e, { ...ev, id: Date.now().toString() }]);
                setToast('Event created!');
              }} />
              <div style={{ marginTop: 16 }}>
                {events.map(ev => (
                  <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: `1px solid ${sectionBorder}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: txtPrimary, fontWeight: 600, fontSize: 14 }}>{ev.title}</div>
                      <div style={{ color: txtSecondary, fontSize: 12 }}>📅 {ev.date} · ⏰ {ev.time} · 📍 {ev.location}</div>
                    </div>
                    <button onClick={() => removeEvent(ev.id)}
                      style={{ background: 'rgba(210,32,48,0.12)', border: '1px solid rgba(210,32,48,0.3)', color: '#D22030', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                      <TrashIcon /> Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MEMBERS ── */}
          {activeSection === 'members' && (
            <div style={sectionStyle}>
              <SectionTitle color={txtPrimary}>Member Management ({memberList.length})</SectionTitle>
              <p style={{ color: txtSecondary, fontSize: 13, marginBottom: 14 }}>
                Change roles, remove members, or block users from rejoining.
                <br /><span style={{ color: txtSecondary, fontSize: 12, opacity: 0.6 }}>The club President cannot be kicked or blocked.</span>
              </p>
              <input placeholder="Search members..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} style={{ ...inputStyle, marginBottom: 14 }} />
              {filteredMembers.map(m => (
                <MemberRow key={m.id} member={m} onKick={kickMember} onBlock={blockMember} onRoleChange={changeRole} />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}