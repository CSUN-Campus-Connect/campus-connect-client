'use client';

// ═══════════════════════════════════════════════════════════════════════
// BACKEND INTEGRATION — ClubProfilePage
// ═══════════════════════════════════════════════════════════════════════
// This is the public-facing club profile, rendered at /clubs/[id].
// It doubles as a shared profile page — authorized members (leaders)
// see an "Edit / Manage" button that mounts <ClubEditPage>.
//
// DATA LOADING (replace mock imports below):
//   club    → GET /api/clubs/:clubId
//             Supabase: SELECT * FROM clubs WHERE id = :clubId
//   members → GET /api/clubs/:clubId/members
//             Supabase: SELECT users.*, club_members.role
//                       FROM club_members JOIN users ON users.id = club_members.user_id
//                       WHERE club_members.club_id = :clubId
//   posts   → GET /api/clubs/:clubId/posts
//             Supabase: SELECT * FROM club_posts WHERE club_id = :clubId ORDER BY created_at DESC
//   events  → GET /api/clubs/:clubId/events
//             Supabase: SELECT * FROM club_events WHERE club_id = :clubId ORDER BY date ASC
//
// AUTH / ROLE CHECK:
//   isLeader → check current user's club_members row:
//     SELECT role FROM club_members WHERE club_id = :clubId AND user_id = :userId
//     isLeader = ['President','VP','Officer'].includes(row?.role)
//   The hardcoded `const isLeader = true` below must be replaced.
//
// APPLY / JOIN:
//   ApplicationTab form → POST /api/clubs/:clubId/applications
//   body: { message, answers[] }
//   Supabase: INSERT INTO club_applications (club_id, user_id, message, status)
//
// SOCIAL FEED:
//   Like post   → POST /api/posts/:postId/like  (toggle)
//                 Supabase: INSERT/DELETE club_post_likes
//   Create post → POST /api/clubs/:clubId/posts  { content, imageUrl? }
//                 Only officers/presidents can post (enforce via RLS or middleware).
//
// INTRO MODAL:
//   Track "seen" state in localStorage keyed by clubId so it only shows once.
//   Or store in user_preferences table: { userId, clubId, seenIntro: true }
// ═══════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ClubEditPage from '@/components/clubs/ClubEdit/ClubEditPage';
import type { ClubDetail, ClubMember, ClubPost, ClubEvent } from '@/components/clubs/temp(mockdata)/clubs.data';

// BACKEND: Replace these mock imports with API/SWR calls (see header comments above).
// Example with SWR:
//   const { data: clubData } = useSWR(`/api/clubs/${clubId}`, fetcher)
//   const { data: members }  = useSWR(`/api/clubs/${clubId}/members`, fetcher)
//   const { data: posts }    = useSWR(`/api/clubs/${clubId}/posts`, fetcher)
//   const { data: events }   = useSWR(`/api/clubs/${clubId}/events`, fetcher)
import { MOCK_CLUB_DETAILS, MOCK_MEMBERS, MOCK_POSTS, MOCK_EVENTS } from '@/components/clubs/temp(mockdata)/mockData';

export type { ClubDetail as Club, ClubMember, ClubPost, ClubEvent };

type ClubWithUI = ClubDetail & {
  textMode?: 'dark' | 'light';
  bgColor?: string;
  card?: { blurb?: string; chips?: string[] };
  instagramUrl?: string;
};

// ── Text color tokens ────────────────────────────────────────────────────────
function getTextColors(textMode: 'dark' | 'light' = 'dark') {
  const isDark = textMode === 'dark';
  return {
    primary:     isDark ? '#ffffff' : '#0a0a0a',
    secondary:   isDark ? '#aaaaaa' : '#444444',
    muted:       isDark ? '#666666' : '#888888',
    faint:       isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
    border:      isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
    card:        isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    inputBg:     isDark ? '#1e1e1e' : '#f5f5f5',
    inputBorder: isDark ? '#3a3a3a' : '#d0d0d0',
    modalBg:     isDark ? '#1a1a1a' : '#ffffff',
    modalBorder: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)',
  };
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const roleColor = (role: ClubMember['role']) => {
  switch (role) {
    case 'President': return '#FFD700';
    case 'VP':        return '#C0C0C0';
    case 'Officer':   return '#D22030';
    default:          return '#6b7280';
  }
};

const FeedIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const EventIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const ApplyIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const DiscordIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>;
const InstagramIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
const MembersIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const HeartIcon   = ({ filled }: { filled: boolean }) => <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? '#D22030' : 'none'} stroke={filled ? '#D22030' : 'currentColor'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const CloseIcon   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const EditIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

// ── Modal shell ──────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, txt }: {
  open: boolean; onClose: () => void; title?: string;
  children: React.ReactNode; txt: ReturnType<typeof getTextColors>;
}) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: txt.modalBg, border: `1px solid ${txt.modalBorder}`, borderRadius: 16, padding: 28, maxWidth: 520, width: '90%', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          {title && <span style={{ fontWeight: 700, fontSize: 18, color: txt.primary }}>{title}</span>}
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: txt.muted, marginLeft: 'auto' }}><CloseIcon /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Intro / welcome modal ────────────────────────────────────────────────────
function IntroModal({ club, open, onClose, txt }: {
  club: ClubWithUI; open: boolean; onClose: () => void;
  txt: ReturnType<typeof getTextColors>;
}) {
  return (
    <Modal open={open} onClose={onClose} txt={txt}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: `3px solid ${club.accentColor}`, background: '#222' }}>
          {club.logoUrl && <img src={club.logoUrl} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <h2 style={{ color: txt.primary, fontFamily: "'Georgia', serif", fontSize: 22, marginBottom: 6 }}>{club.name}</h2>
        <span style={{ background: club.accentColor, color: '#fff', borderRadius: 20, padding: '2px 12px', fontSize: 12, fontWeight: 600 }}>{club.category}</span>
        <p style={{ color: txt.secondary, marginTop: 18, lineHeight: 1.7, whiteSpace: 'pre-line', fontSize: 14 }}>{club.introMessage}</p>
        {club.discordUrl && (
          <a href={club.discordUrl} target="_blank" rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 18, background: '#5865F2', color: '#fff', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
            <DiscordIcon /> Join our Discord
          </a>
        )}
        {club.instagramUrl && (
          <a href={club.instagramUrl} target="_blank" rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 18, marginLeft: club.discordUrl ? 8 : 0, background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', color: '#fff', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
            <InstagramIcon /> Follow on Instagram
          </a>
        )}
        <div style={{ marginTop: 20 }}>
          <button onClick={onClose} style={{ background: club.accentColor, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Let's Go →</button>
        </div>
      </div>
    </Modal>
  );
}

// ── Members modal ────────────────────────────────────────────────────────────
function MembersModal({ open, onClose, members, txt }: {
  open: boolean; onClose: () => void; members: ClubMember[];
  txt: ReturnType<typeof getTextColors>;
}) {
  const [search, setSearch] = useState('');
  const filtered = members.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <Modal open={open} onClose={onClose} title={`Members (${members.length})`} txt={txt}>
      <input
        placeholder="Search members..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', background: txt.inputBg, border: `1px solid ${txt.inputBorder}`, borderRadius: 8, padding: '8px 12px', color: txt.primary, fontSize: 14, marginBottom: 14, boxSizing: 'border-box', outline: 'none' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(m => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: txt.card, borderRadius: 10, border: `1px solid ${txt.border}` }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: '#333', flexShrink: 0 }}>
              {m.avatar
                ? <img src={m.avatar} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{m.name[0]}</div>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: txt.primary, fontWeight: 600, fontSize: 14 }}>{m.name}</div>
              <div style={{ color: txt.muted, fontSize: 12 }}>{m.major} · Joined {formatDate(m.joinedAt)}</div>
            </div>
            <span style={{ background: roleColor(m.role) + '22', color: roleColor(m.role), border: `1px solid ${roleColor(m.role)}55`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
              {m.role}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ── Social feed ──────────────────────────────────────────────────────────────
function SocialFeed({ posts, accentColor, txt }: {
  posts: ClubPost[]; accentColor: string; txt: ReturnType<typeof getTextColors>;
}) {
  const [localPosts, setLocalPosts] = useState(posts);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const toggleLike = (id: string) =>
    setLocalPosts(p => p.map(post => post.id === id
      ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
      : post));

  const submitComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    setLocalPosts(p => p.map(post => post.id === postId
      ? { ...post, comments: [...post.comments, { id: Date.now().toString(), author: 'You', text }] }
      : post));
    setCommentInputs(c => ({ ...c, [postId]: '' }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {localPosts.map(post => (
        <div key={post.id} style={{ background: txt.card, border: `1px solid ${txt.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: '#333' }}>
              {post.authorAvatar && <img src={post.authorAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div>
              <div style={{ color: txt.primary, fontWeight: 600, fontSize: 14 }}>{post.author}</div>
              <div style={{ color: txt.muted, fontSize: 12 }}>{timeAgo(post.createdAt)}</div>
            </div>
          </div>
          <p style={{ color: txt.secondary, lineHeight: 1.65, fontSize: 14, margin: '0 0 14px' }}>{post.content}</p>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <button onClick={() => toggleLike(post.id)}
              aria-label={post.liked ? 'Unlike post' : 'Like post'}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: post.liked ? accentColor : txt.muted, fontSize: 13 }}>
              <HeartIcon filled={post.liked} /> {post.likes}
            </button>
            <button
              onClick={() => setExpandedComments(s => { const n = new Set(s); n.has(post.id) ? n.delete(post.id) : n.add(post.id); return n; })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: txt.muted, fontSize: 13 }}>
              💬 {post.comments.length} comments
            </button>
          </div>
          {expandedComments.has(post.id) && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${txt.border}` }}>
              {post.comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <span style={{ color: txt.secondary, fontWeight: 600, fontSize: 13 }}>{c.author}:</span>
                  <span style={{ color: txt.secondary, fontSize: 13 }}>{c.text}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input
                  value={commentInputs[post.id] || ''}
                  onChange={e => setCommentInputs(c => ({ ...c, [post.id]: e.target.value }))}
                  placeholder="Write a comment..."
                  onKeyDown={e => e.key === 'Enter' && submitComment(post.id)}
                  style={{ flex: 1, background: txt.inputBg, border: `1px solid ${txt.inputBorder}`, borderRadius: 8, padding: '6px 12px', color: txt.primary, fontSize: 13, outline: 'none' }}
                />
                <button onClick={() => submitComment(post.id)}
                  style={{ background: accentColor, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Events tab ───────────────────────────────────────────────────────────────
function EventsTab({ events, accentColor, txt }: {
  events: ClubEvent[]; accentColor: string; txt: ReturnType<typeof getTextColors>;
}) {
  const [localEvents, setLocalEvents] = useState(events);
  const toggleRsvp = (id: string) =>
    setLocalEvents(e => e.map(ev => ev.id === id
      ? { ...ev, rsvped: !ev.rsvped, rsvpCount: ev.rsvped ? ev.rsvpCount - 1 : ev.rsvpCount + 1 }
      : ev));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {localEvents.map(ev => (
        <div key={ev.id} style={{ background: txt.card, border: `1px solid ${txt.border}`, borderRadius: 14, padding: 22, display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          <div style={{ background: accentColor + '22', border: `1px solid ${accentColor}44`, borderRadius: 10, padding: '10px 14px', textAlign: 'center', flexShrink: 0, minWidth: 56 }}>
            <div style={{ color: accentColor, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
              {new Date(ev.date).toLocaleString('default', { month: 'short' })}
            </div>
            <div style={{ color: txt.primary, fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{new Date(ev.date).getDate()}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: txt.primary, fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{ev.title}</div>
            <div style={{ color: txt.secondary, fontSize: 13, marginBottom: 6 }}>📍 {ev.location} · ⏰ {ev.time}</div>
            <p style={{ color: txt.secondary, fontSize: 13, lineHeight: 1.6, margin: '0 0 12px' }}>{ev.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => toggleRsvp(ev.id)}
                style={{ background: ev.rsvped ? accentColor : 'transparent', color: ev.rsvped ? '#fff' : accentColor, border: `1px solid ${accentColor}`, borderRadius: 8, padding: '6px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.15s' }}>
                {ev.rsvped ? '✓ Going' : 'RSVP'}
              </button>
              <span style={{ color: txt.muted, fontSize: 12 }}>{ev.rsvpCount} going</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Application tab ──────────────────────────────────────────────────────────
function ApplicationTab({ club, txt }: {
  club: ClubWithUI; txt: ReturnType<typeof getTextColors>;
}) {
  const [form, setForm] = useState({ name: '', email: '', major: '', year: '', why: '', experience: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (!form.why.trim()) e.why = 'Please tell us why you want to join';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    // BACKEND: supabase.from('club_applications').insert({ club_id: club.id, ...form })
    setSubmitted(true);
  };

  const iStyle: React.CSSProperties = {
    width: '100%', background: txt.inputBg, border: `1px solid ${txt.inputBorder}`,
    borderRadius: 10, padding: '10px 14px', color: txt.primary, fontSize: 14,
    boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
  };
  const lStyle: React.CSSProperties = { display: 'block', color: txt.secondary, fontSize: 13, fontWeight: 600, marginBottom: 6 };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <h3 style={{ color: txt.primary, fontFamily: "'Georgia', serif", fontSize: 22, marginBottom: 10 }}>Application Submitted!</h3>
        <p style={{ color: txt.secondary, fontSize: 14 }}>Thanks for applying to {club.name}. Leadership will review and reach out soon.</p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: '', email: '', major: '', year: '', why: '', experience: '' }); }}
          style={{ marginTop: 20, background: 'transparent', color: club.accentColor, border: `1px solid ${club.accentColor}`, borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontSize: 14 }}>
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 540 }}>
      <h3 style={{ color: txt.primary, fontFamily: "'Georgia', serif", fontSize: 18, marginBottom: 4 }}>Apply to {club.name}</h3>
      <p style={{ color: txt.muted, fontSize: 13, marginBottom: 24 }}>Fill out the form below and our officers will review your application.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={lStyle}>Full Name *</label>
          <input style={{ ...iStyle, borderColor: errors.name ? '#D22030' : txt.inputBorder }} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
          {errors.name && <span style={{ color: '#D22030', fontSize: 12 }}>{errors.name}</span>}
        </div>
        <div>
          <label style={lStyle}>Email *</label>
          <input style={{ ...iStyle, borderColor: errors.email ? '#D22030' : txt.inputBorder }} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@school.edu" />
          {errors.email && <span style={{ color: '#D22030', fontSize: 12 }}>{errors.email}</span>}
        </div>
        <div>
          <label style={lStyle}>Major</label>
          <input style={iStyle} value={form.major} onChange={e => setForm(f => ({ ...f, major: e.target.value }))} placeholder="e.g. Computer Science" />
        </div>
        <div>
          <label style={lStyle}>Year</label>
          <select style={iStyle} value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}>
            <option value="">Select year</option>
            <option>Freshman</option><option>Sophomore</option><option>Junior</option><option>Senior</option><option>Graduate</option>
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={lStyle}>Why do you want to join? *</label>
        <textarea style={{ ...iStyle, borderColor: errors.why ? '#D22030' : txt.inputBorder, minHeight: 100, resize: 'vertical' }} value={form.why} onChange={e => setForm(f => ({ ...f, why: e.target.value }))} placeholder="Tell us your motivation..." />
        {errors.why && <span style={{ color: '#D22030', fontSize: 12 }}>{errors.why}</span>}
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={lStyle}>Relevant Experience</label>
        <textarea style={{ ...iStyle, minHeight: 80, resize: 'vertical' }} value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} placeholder="Any projects, skills, or experience..." />
      </div>
      <button type="submit"
        style={{ background: club.accentColor, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px', cursor: 'pointer', fontWeight: 700, fontSize: 15, width: '100%', transition: 'opacity 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
        Submit Application
      </button>
    </form>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ClubPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const clubId = params?.id ?? 'club-001';

  // BACKEND: supabase.from('clubs').select('*').eq('id', clubId).single()
  const [club, setClub] = useState<ClubWithUI>(MOCK_CLUB_DETAILS[clubId] ?? MOCK_CLUB_DETAILS['club-001']);

  const members = MOCK_MEMBERS[clubId] ?? [];
  const posts   = MOCK_POSTS[clubId]   ?? [];
  const events  = MOCK_EVENTS[clubId]  ?? [];

  const [activeTab,    setActiveTab]    = useState<'feed' | 'events' | 'apply'>('feed');
  const [showIntro,    setShowIntro]    = useState(true);
  const [showMembers,  setShowMembers]  = useState(false);
  const [showEditPage, setShowEditPage] = useState(false);

  // bgColor and textMode are owned by the club object, set via the Appearance tab in the edit page.
  const bgColor = club.bgColor ?? '#0d0d0d';
  const txt = getTextColors(club.textMode ?? 'dark');

  // BACKEND: Replace with real role check:
  //   const { data: membership } = useSWR(`/api/clubs/${clubId}/membership`, fetcher)
  //   const isLeader = ['President','VP','Officer'].includes(membership?.role)
  // Until auth is wired, keep true for development; flip to false to test public view.
  const isLeader = true;

  if (showEditPage) {
    return (
      <ClubEditPage
        club={club}
        members={members}
        bgColor={bgColor}
        onSave={updated => {
          setClub(updated as ClubWithUI);
          setShowEditPage(false);
        }}
        onBack={() => setShowEditPage(false)}
      />
    );
  }

  const accent = club.accentColor;
  const tabs = [
    { id: 'feed'   as const, label: 'Social Feed', icon: <FeedIcon /> },
    { id: 'events' as const, label: 'Events',      icon: <EventIcon /> },
    { id: 'apply'  as const, label: 'Apply',       icon: <ApplyIcon /> },
  ];
  const bannerOverlay = `linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 35%, ${bgColor} 100%)`;

  return (
    <div style={{ minHeight: '100vh', background: bgColor, color: txt.primary, fontFamily: "'Segoe UI', system-ui, sans-serif", transition: 'background 0.35s ease' }}>
      <IntroModal club={club} open={showIntro} onClose={() => setShowIntro(false)} txt={txt} />
      <MembersModal open={showMembers} onClose={() => setShowMembers(false)} members={members} txt={txt} />

      {/* Banner */}
      <div style={{ position: 'relative', width: '100%', height: 280, background: '#222', overflow: 'visible' }}>
        {club.bannerUrl && <img src={club.bannerUrl} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
        <div style={{ position: 'absolute', inset: 0, background: bannerOverlay, pointerEvents: 'none' }} />

        {/* Top-left: back to hub */}
        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 30 }}>
          <button onClick={() => router.push('/clubs')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 8, color: '#fff', padding: '8px 13px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            ← All Clubs
          </button>
        </div>

        {/* Top-right: about + manage (Theme removed — lives in Appearance tab of edit page) */}
        <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 10, zIndex: 30 }}>
          <button onClick={() => setShowIntro(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 8, color: '#fff', padding: '8px 13px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            ℹ️ About
          </button>
          {isLeader && (
            <button onClick={() => setShowEditPage(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: accent, border: 'none', borderRadius: 8, color: '#fff', padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'opacity 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              <EditIcon /> Manage Club
            </button>
          )}
        </div>

        {/* Logo overlapping banner bottom */}
        <div style={{ position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)', zIndex: 40, width: 120, height: 120, borderRadius: '50%', padding: 4, background: bgColor, boxShadow: `0 0 0 4px ${accent}, 0 12px 40px rgba(0,0,0,0.7)`, transition: 'background 0.35s ease' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#1a1a1a' }}>
            {club.logoUrl
              ? <img src={club.logoUrl} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 900, color: accent }}>{club.name[0]}</div>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ height: 76 }} />

        {/* Club title & meta */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, fontFamily: "'Georgia', serif", color: txt.primary, letterSpacing: -0.5 }}>{club.name}</h1>
            <span style={{ background: accent + '25', color: accent, border: `1px solid ${accent}50`, borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>{club.category}</span>
          </div>
          <p style={{ color: txt.secondary, fontSize: 14, margin: '0 0 14px', fontStyle: 'italic' }}>{club.tagline}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            <button onClick={() => setShowMembers(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: txt.faint, border: `1px solid ${txt.border}`, borderRadius: 20, padding: '5px 14px', color: txt.secondary, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <MembersIcon /> {club.memberCount} members
            </button>
            <span style={{ color: txt.muted, fontSize: 13 }}>📅 Founded {club.founded}</span>
            {club.discordUrl && (
              <a href={club.discordUrl} target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#7289DA', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
                <DiscordIcon /> Join Discord
              </a>
            )}
            {club.instagramUrl && (
              <a href={club.instagramUrl} target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#E1306C', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
                <InstagramIcon /> Instagram
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        <div style={{ background: txt.card, border: `1px solid ${txt.border}`, borderRadius: 14, padding: '16px 22px', marginBottom: 24 }}>
          <p style={{ color: txt.secondary, fontSize: 14, lineHeight: 1.8, margin: 0 }}>{club.description}</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${txt.border}`, marginBottom: 24, gap: 2 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === tab.id ? accent : txt.muted, fontWeight: activeTab === tab.id ? 700 : 400, fontSize: 14, borderBottom: activeTab === tab.id ? `2px solid ${accent}` : '2px solid transparent', marginBottom: -1, transition: 'all 0.15s' }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div style={{ paddingBottom: 60 }}>
          {activeTab === 'feed'   && <SocialFeed posts={posts} accentColor={accent} txt={txt} />}
          {activeTab === 'events' && <EventsTab events={events} accentColor={accent} txt={txt} />}
          {activeTab === 'apply'  && <ApplicationTab club={club} txt={txt} />}
        </div>
      </div>
    </div>
  );
}
