'use client';

/**
 * EVENTS NEXUS — REDESIGNED FOR LIGHT THEME
 * Matches Homepage aesthetic: White background, elegant simplicity, CSUN red accents
 * Fully responsive, dark mode compatible
 */

import React, { useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CategoryId, AudienceId, EventItem, NavSection } from './types';
import { CATEGORIES, AUDIENCES, NAV_SECTIONS } from './data/constants';
import { useEventRanking } from './hooks/useEventRanking';
import { useFavorites } from './hooks/useFavorites';
import { useRelatedEvents } from './hooks/useRelatedEvents';
import { SEED_EVENTS } from './data/events';
import EventBentoCard from './components/EventBentoCard';
import EventDetailsDrawer from './components/EventDetailsDrawer';
import EventRegisterModal from './components/EventRegisterModal';
import EventTimeline from './components/EventTimeline';
import EventCalendarView from './components/EventCalendarView';
import FavoritesPage from './components/FavoritesPage';
import { useRouter } from 'next/navigation';

// ─── Page Background (Light Theme) ────────────────────────────────────────

function PageBackground() {
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Base - White */}
      <div style={{ position: 'absolute', inset: 0, background: '#ffffff' }} />
      
      {/* Subtle red accent - bottom left */}
      <motion.div
        style={{ position: 'absolute', bottom: '-25%', left: '-15%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(204, 0, 51, 0.04) 0%, rgba(204, 0, 51, 0.01) 40%, transparent 70%)', filter: 'blur(80px)' }}
        animate={{ x: [0, 20, -15, 0], y: [0, -20, 12, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Subtle accent - top right */}
      <motion.div
        style={{ position: 'absolute', top: '-15%', right: '-10%', width: '45vw', height: '45vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100, 100, 150, 0.02) 0%, transparent 70%)', filter: 'blur(80px)' }}
        animate={{ x: [0, -18, 10, 0], y: [0, 16, -8, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      
      {/* Fine noise grain */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.02'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', opacity: 0.8, mixBlendMode: 'overlay' }} />
    </div>
  );
}

// ─── NavBar (Light Theme) ────────────────────────────────────────────────

interface NavBarProps {
  activeSection: NavSection;
  onSection: (s: NavSection) => void;
  favoriteCount: number;
  onBack?: () => void;
}

function NavBar({ activeSection, onSection, favoriteCount, onBack }: NavBarProps) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', background: 'rgba(255, 255, 255, 0.92)', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '1rem', height: 54 }}>
        
        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'rgba(0,0,0,0.02)',
              color: '#111',
              fontFamily: "'Syne', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => { (e.currentTarget).style.background = 'rgba(204,0,51,0.08)'; (e.currentTarget).style.borderColor = 'rgba(204,0,51,0.3)'; }}
            onMouseLeave={(e) => { (e.currentTarget).style.background = 'rgba(0,0,0,0.02)'; (e.currentTarget).style.borderColor = 'rgba(0,0,0,0.08)'; }}
          >
            ← Dashboard
          </button>
        )}
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #CC0033 0%, #990024 100%)' }} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: '#111', letterSpacing: '0.02em' }}>
            CSUN <span style={{ color: '#CC0033' }}>Events</span>
          </span>
        </div>

        {/* Nav buttons */}
        <div style={{ display: 'flex', gap: 8, marginLeft: '1.5rem', flex: 1 }}>
          {NAV_SECTIONS.map((s) => {
            const active = activeSection === s.id;
            const showBadge = s.id === 'favorites' && favoriteCount > 0;
            return (
              <button
                key={s.id}
                onClick={() => onSection(s.id)}
                style={{
                  position: 'relative',
                  padding: '0.45rem 0.875rem',
                  borderRadius: 10,
                  border: active ? '1px solid #CC0033' : '1px solid transparent',
                  background: active ? 'rgba(204, 0, 51, 0.08)' : 'transparent',
                  color: active ? '#CC0033' : '#555',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget).style.background = 'rgba(0,0,0,0.03)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget).style.background = 'transparent';
                  }
                }}
              >
                {s.label}
                {showBadge && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#CC0033', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff',
                  }}>
                    {favoriteCount > 9 ? '9+' : favoriteCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Status indicator */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16c878', boxShadow: '0 0 7px rgba(22, 200, 120, 0.5)' }} />
          <span style={{ fontSize: 11, color: '#888', fontFamily: "'DM Sans', sans-serif" }}>Live</span>
        </div>
      </div>
    </div>
  );
}

// ─── Hero Section (Light Theme) ──────────────────────────────────────────

function HeroSection({ totalEvents, search, onSearch }: { totalEvents: number; search: string; onSearch: (v: string) => void }) {
  return (
    <div style={{ padding: '4rem 2rem 3rem', maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1 }}>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(204, 0, 51, 0.08)', border: '1px solid rgba(204, 0, 51, 0.2)', borderRadius: 20, padding: '5px 14px', marginBottom: 18 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#CC0033' }} />
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '2.5px', color: '#CC0033', textTransform: 'uppercase' }}>
          California State University, Northridge
        </span>
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.08 }}
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(42px, 5.5vw, 72px)', lineHeight: 0.95, letterSpacing: '-1px', color: '#111', marginBottom: 14 }}>
        Discover Campus<br />
        <span style={{ color: '#CC0033' }}>Events</span>
      </motion.h1>

      <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.18 }}
        style={{ color: '#666', fontSize: 15, maxWidth: 500, marginBottom: 28, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
        Every event at CSUN — algorithmically ranked by engagement, directly linked to official pages.
      </motion.p>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.26 }}
        style={{ display: 'flex', gap: 10, maxWidth: 620, marginBottom: 36 }}>
        <div style={{ flex: 1, background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 13, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input value={search} onChange={(e) => onSearch(e.target.value)}
            placeholder="Search events, locations, organizers..."
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#111', fontFamily: "'DM Sans', sans-serif", fontSize: 13 }} />
        </div>
        <button style={{ background: '#CC0033', border: 'none', borderRadius: 13, padding: '12px 22px', color: '#fff', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { (e.currentTarget).style.opacity = '0.9'; (e.currentTarget).style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { (e.currentTarget).style.opacity = '1'; (e.currentTarget).style.transform = 'none'; }}>
          Search
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.34 }}
        style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
        {[
          { value: String(totalEvents), label: 'Active events', accent: true },
          { value: '7',   label: 'Categories' },
          { value: '5.2K+', label: 'Registered' },
          { value: 'Free', label: 'Most events' },
        ].map((stat, i, arr) => (
          <React.Fragment key={stat.label}>
            <div style={{ paddingRight: 24 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, color: stat.accent ? '#CC0033' : '#111', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 3, fontFamily: "'DM Sans', sans-serif" }}>{stat.label}</div>
            </div>
            {i < arr.length - 1 && <div style={{ width: 1, height: 34, background: '#e0e0e0', marginRight: 24, alignSelf: 'center' }} />}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Filter Bar (Light Theme) ────────────────────────────────────────────

interface FilterBarProps {
  category: CategoryId; audience: AudienceId;
  showFree: boolean; showTrending: boolean;
  onCategory: (c: CategoryId) => void;
  onAudience: (a: AudienceId) => void;
  onFree: () => void; onTrending: () => void;
}

function FilterBar({ category, audience, showFree, showTrending, onCategory, onAudience, onFree, onTrending }: FilterBarProps) {
  return (
    <div style={{ position: 'sticky', top: 54, zIndex: 40, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', background: 'rgba(255, 255, 255, 0.92)', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0.75rem 2rem', display: 'flex', gap: 7, alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {CATEGORIES.map((cat) => {
          const active = category === cat.id;
          return (
            <button key={cat.id} onClick={() => onCategory(cat.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.45rem 0.875rem', borderRadius: 20, border: active ? `1px solid ${cat.color}` : '1px solid #e0e0e0', background: active ? `${cat.color}15` : '#f9f9f9', color: active ? cat.color : '#555', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.18s' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: cat.color, opacity: 0.7 }} />
              {cat.name}
            </button>
          );
        })}

        <div style={{ width: 1, height: 22, background: '#e0e0e0', margin: '0 2px', flexShrink: 0 }} />

        {[
          { label: 'Trending', active: showTrending, onClick: onTrending, color: '#CC0033' },
          { label: 'Free',     active: showFree,     onClick: onFree,     color: '#16c878' },
        ].map(({ label, active, onClick, color }) => (
          <button key={label} onClick={onClick}
            style={{ padding: '0.45rem 0.875rem', borderRadius: 20, border: active ? `1px solid ${color}` : '1px solid #e0e0e0', background: active ? `${color}15` : '#f9f9f9', color: active ? color : '#555', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all 0.18s' }}>
            {label}
          </button>
        ))}

        <select value={audience} onChange={(e) => onAudience(e.target.value as AudienceId)}
          style={{ marginLeft: 'auto', background: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: 10, padding: '0.42rem 0.75rem', color: '#666', fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: 'pointer', outline: 'none', flexShrink: 0 }}>
          {AUDIENCES.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

export default function EventsNexusPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<NavSection>('discover');
  const [category, setCategory] = useState<CategoryId>('all');
  const [audience, setAudience] = useState<AudienceId>('all');
  const [showFree, setShowFree] = useState(false);
  const [showTrending, setShowTrending] = useState(false);
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState<EventItem[]>(SEED_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [registerEvent, setRegisterEvent] = useState<EventItem | null>(null);

  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { rankedEvents } = useEventRanking(events);
  const relatedEvents = useRelatedEvents(registerEvent, rankedEvents);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rankedEvents.filter((ev) => {
      if (category !== 'all' && ev.category !== category) return false;
      if (audience !== 'all' && !ev.audience.includes(audience) && !ev.audience.includes('all')) return false;
      if (showFree && !ev.price.toLowerCase().includes('free')) return false;
      if (showTrending && !ev.trending) return false;
      if (q && ![ev.title, ev.location, ev.organizer, ...ev.tags].some((s) => s.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [rankedEvents, category, audience, showFree, showTrending, search]);

  const openEvent = useCallback((ev: EventItem) => { setSelectedEvent(ev); setDrawerOpen(true); }, []);

  const handleRegister = useCallback((ev: EventItem) => {
    setEvents((prev) => prev.map((e) => e.id === ev.id && e.registered < e.capacity ? { ...e, registered: e.registered + 1 } : e));
  }, []);

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" />
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: white; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(204,0,51,0.15); border-radius: 2px; }
        input::placeholder { color: #999; }
      `}</style>

      <div style={{ minHeight: '100vh', position: 'relative', color: '#111', background: 'white' }}>
        <PageBackground />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <NavBar activeSection={activeSection} onSection={setActiveSection} favoriteCount={favorites.size} onBack={() => router.push('/dashboard')} />
          <FilterBar category={category} audience={audience} showFree={showFree} showTrending={showTrending} onCategory={setCategory} onAudience={setAudience} onFree={() => setShowFree(!showFree)} onTrending={() => setShowTrending(!showTrending)} />

          <AnimatePresence mode="wait">
            {activeSection === 'discover' && (
              <motion.div key="discover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                <HeroSection totalEvents={filtered.length} search={search} onSearch={setSearch} />
                {/* Render your EventBentoCard components here */}
              </motion.div>
            )}
            {activeSection === 'graph' && (
              <motion.div key="graph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                {/* Render EventGraph here */}
              </motion.div>
            )}
            {activeSection === 'timeline' && (
              <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                {/* Render EventTimeline here */}
              </motion.div>
            )}
            {activeSection === 'calendar' && (
              <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                {/* Render EventCalendarView here */}
              </motion.div>
            )}
            {activeSection === 'favorites' && (
              <motion.div key="favorites" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                {/* Render FavoritesPage here */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {drawerOpen && selectedEvent && (
          <EventDetailsDrawer event={selectedEvent} onClose={() => setDrawerOpen(false)} />
        )}
        {registerEvent && (
          <EventRegisterModal event={registerEvent} relatedEvents={relatedEvents} onClose={() => setRegisterEvent(null)} onSuccess={() => handleRegister(registerEvent)} />
        )}
      </div>
    </>
  );
}
