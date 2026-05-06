'use client';

/**
 * Events Nexus — Main Page
 *
 * Sections:
 *   Discover   – ranked bento grid with filter bar
 *   Graph      – radial engagement cluster graph (canvas)
 *   Timeline   – chronological list grouped by month
 *   Calendar   – monthly grid calendar
 *   Favorites  – heart-saved events with crimson shimmer
 */

import React, { useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/sidebar';
import type { CategoryId, AudienceId, EventItem, NavSection } from './types';
import { CATEGORIES, AUDIENCES, NAV_SECTIONS } from './data/constants';
import { useEventRanking } from './hooks/useEventRanking';
import { useFavorites } from './hooks/useFavorites';
import { useRelatedEvents } from './hooks/useRelatedEvents';
import { SEED_EVENTS } from './data/events';
import EventBentoCard from './components/EventBentoCard';
import EventDetailsDrawer from './components/EventDetailsDrawer';
import EventRegisterModal from './components/EventRegisterModal';
import EventGraph from './components/EventGraph';
import EventTimeline from './components/EventTimeline';
import EventCalendarView from './components/EventCalendarView';
import FavoritesPage from './components/FavoritesPage';

// ─── Background ───────────────────────────────────────────────────────────────

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

// ─── NavBar ───────────────────────────────────────────────────────────────────

interface NavBarProps {
  activeSection: NavSection;
  onSection: (s: NavSection) => void;
  favoriteCount: number;
}

function NavBar({ activeSection, onSection, favoriteCount }: NavBarProps) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', background: 'rgba(255, 255, 255, 0.92)', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', height: 54 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginRight: '1.5rem' }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #CC0033 0%, #9a0029 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'rgba(255,255,255,0.9)' }} />
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 13, color: '#111', letterSpacing: '0.02em' }}>
            CSUN <span style={{ color: '#CC0033' }}>Events</span>
          </span>
        </div>

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
                color: active ? '#CC0033' : '#999',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.18s',
                whiteSpace: 'nowrap',
              }}
            >
              {s.label}
              {showBadge && (
                <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#D22030', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff' }}>
                  {favoriteCount > 9 ? '9+' : favoriteCount}
                </span>
              )}
            </button>
          );
        })}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16c878', boxShadow: '0 0 7px rgba(22,200,120,0.7)', animation: 'livePulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, color: '#999', fontFamily: "'DM Sans', sans-serif" }}>Live</span>
        </div>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({ totalEvents, search, onSearch }: { totalEvents: number; search: string; onSearch: (v: string) => void }) {
  return (
    <div style={{ padding: '5rem 2rem 3rem', maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1 }}>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(204,0,51,0.08)', border: '1px solid rgba(204,0,51,0.2)', borderRadius: 20, padding: '5px 14px', marginBottom: 18 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#CC0033', animation: 'livePulse 1.5s ease-in-out infinite' }} />
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '2.5px', color: '#CC0033', textTransform: 'uppercase' }}>
          California State University, Northridge
        </span>
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.08 }}
        style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(42px, 5.5vw, 76px)', lineHeight: 0.95, letterSpacing: '-3px', color: '#111', marginBottom: 14 }}>
        Campus<br />
        <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(204,0,51,0.6)' }}>Events</span>
        <span style={{ color: '#CC0033' }}> Nexus</span>
      </motion.h1>

      <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.18 }}
        style={{ color: '#666', fontSize: 15, maxWidth: 500, marginBottom: 28, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
        Every event at CSUN — algorithmically ranked by engagement, directly linked to the official event pages.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.26 }}
        style={{ display: 'flex', gap: 10, maxWidth: 620, marginBottom: 36 }}>
        <div style={{ flex: 1, background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 13, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input value={search} onChange={(e) => onSearch(e.target.value)}
            placeholder="Search events, buildings, organizers..."
            aria-label="Search events, buildings, organizers"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#111', fontFamily: "'DM Sans', sans-serif", fontSize: 13 }} />
        </div>
        <button style={{ background: '#CC0033', border: 'none', borderRadius: 13, padding: '12px 22px', color: '#fff', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
          Search
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.34 }}
        style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
        {[
          { value: String(totalEvents), label: 'Active events', accent: true },
          { value: '7',     label: 'Categories' },
          { value: '5.2K+', label: 'Registered students' },
          { value: 'Free',  label: 'Admission — most events' },
        ].map((stat, i, arr) => (
          <React.Fragment key={stat.label}>
            <div style={{ paddingRight: 24 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: stat.accent ? '#CC0033' : '#111', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 3, fontFamily: "'DM Sans', sans-serif" }}>{stat.label}</div>
            </div>
            <div style={{ width: 1, height: 38, background: 'rgba(0,0,0,0.08)', marginRight: 24, alignSelf: 'center' }} />
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

interface FilterBarProps {
  category: CategoryId; audience: AudienceId;
  showFree: boolean; showTrending: boolean;
  onCategory: (c: CategoryId) => void;
  onAudience: (a: AudienceId) => void;
  onFree: () => void; onTrending: () => void;
}

function FilterBar({ category, audience, showFree, showTrending, onCategory, onAudience, onFree, onTrending }: FilterBarProps) {
  return (
    <div style={{ position: 'sticky', top: 54, zIndex: 40, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.88)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0.75rem 2rem', display: 'flex', gap: 7, alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {CATEGORIES.map((cat) => {
          const active = category === cat.id;
          return (
            <button key={cat.id} onClick={() => onCategory(cat.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.45rem 0.875rem', borderRadius: 20, border: active ? `1px solid ${cat.color}` : '1px solid rgba(0,0,0,0.08)', background: active ? `${cat.color}15` : 'rgba(0,0,0,0.02)', color: active ? cat.color : '#777', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.18s' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: cat.color, opacity: active ? 1 : 0.5 }} />
              {cat.name}
            </button>
          );
        })}

        <div style={{ width: 1, height: 22, background: 'rgba(0,0,0,0.08)', margin: '0 2px', flexShrink: 0 }} />

        {[
          { label: 'Trending', active: showTrending, onClick: onTrending, activeColor: '#D22030' },
          { label: 'Free',     active: showFree,     onClick: onFree,     activeColor: '#16c878' },
        ].map(({ label, active, onClick, activeColor }) => (
          <button key={label} onClick={onClick}
            style={{ padding: '0.45rem 0.875rem', borderRadius: 20, border: active ? `1px solid ${activeColor}` : '1px solid rgba(0,0,0,0.08)', background: active ? `${activeColor}12` : 'rgba(0,0,0,0.02)', color: active ? activeColor : '#777', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all 0.18s' }}>
            {label}
          </button>
        ))}

        <select value={audience} onChange={(e) => onAudience(e.target.value as AudienceId)}
          style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: '0.42rem 0.75rem', color: '#666', fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: 'pointer', outline: 'none', flexShrink: 0 }}>
          {AUDIENCES.map((a) => <option key={a.id} value={a.id} style={{ background: '#fff', color: '#111' }}>{a.name}</option>)}
        </select>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EventsNexusPage() {
  const router = useRouter();
  const [sidebarWidth, setSidebarWidth] = useState(220);

  const [activeSection,  setActiveSection]  = useState<NavSection>('discover');
  const [category,       setCategory]       = useState<CategoryId>('all');
  const [audience,       setAudience]       = useState<AudienceId>('all');
  const [showFree,       setShowFree]       = useState(false);
  const [showTrending,   setShowTrending]   = useState(false);
  const [search,         setSearch]         = useState('');
  const [events,         setEvents]         = useState<EventItem[]>(SEED_EVENTS);
  const [selectedEvent,  setSelectedEvent]  = useState<EventItem | null>(null);
  const [drawerOpen,     setDrawerOpen]     = useState(false);
  const [registerEvent,  setRegisterEvent]  = useState<EventItem | null>(null);

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
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap" />
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(0.85);} }
        @keyframes spin { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(210,32,48,0.28);border-radius:2px;}
        input::placeholder{color:#aaa;}
        select option{background:#fff;color:#111;}
      `}</style>

      <div style={{ minHeight: '100vh', position: 'relative', color: '#111' }}>
        <PageBackground />

        {/* ── Page content ── */
        <Box sx={{
          ml: `${sidebarWidth}px`,
          flex: 1,
          minWidth: 0,
          minHeight: '100vh',
          position: 'relative',
          color: '#fff',
          transition: 'margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <PageBackground />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <NavBar activeSection={activeSection} onSection={setActiveSection} favoriteCount={favorites.size} />

            <AnimatePresence mode="wait">
              {/* ── DISCOVER ── */}
              {activeSection === 'discover' && (
                <motion.div key="discover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                  <HeroSection totalEvents={filtered.length} search={search} onSearch={setSearch} />
                  <FilterBar category={category} audience={audience} showFree={showFree} showTrending={showTrending} onCategory={setCategory} onAudience={setAudience} onFree={() => setShowFree((v) => !v)} onTrending={() => setShowTrending((v) => !v)} />

                  <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 2rem 1rem', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: '#D22030', fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 4 }}>
                        Ranked by Engagement Score
                      </div>
                      <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: '#fff', margin: 0 }}>
                        {category === 'all' ? 'All Events' : CATEGORIES.find((c) => c.id === category)?.name}
                        <span style={{ color: '#D22030', marginLeft: 8 }}>({filtered.length})</span>
                      </h2>
                    </div>
                  </div>

                {/* Bento grid */}
                <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 2rem 4rem' }}>
                  {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 6 }}>No events found</div>
                      <div style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Try adjusting your filters</div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                      <AnimatePresence mode="popLayout">
                        {filtered.map((event, idx) => (
                          <EventBentoCard
                            key={event.id}
                            event={event}
                            index={idx}
                            isFavorite={isFavorite(event.id)}
                            onOpen={openEvent}
                            onToggleFav={toggleFavorite}
                            onRegister={(ev) => setRegisterEvent(ev)}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

              {/* ── GRAPH ── */}
              {activeSection === 'graph' && (
                <motion.div key="graph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                  <EventGraph events={rankedEvents} onSelectEvent={openEvent} />
                </motion.div>
              )}

              {/* ── TIMELINE ── */}
              {activeSection === 'timeline' && (
                <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                  <EventTimeline events={events} onSelectEvent={openEvent} />
                </motion.div>
              )}

              {/* ── CALENDAR ── */}
              {activeSection === 'calendar' && (
                <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                  <EventCalendarView events={events} onSelectEvent={openEvent} />
                </motion.div>
              )}

              {/* ── FAVORITES ── */}
              {activeSection === 'favorites' && (
                <motion.div key="favorites" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                  <FavoritesPage
                    allEvents={rankedEvents}
                    favorites={favorites}
                    onOpen={openEvent}
                    onRemove={toggleFavorite}
                    onDiscover={() => setActiveSection('discover')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Details drawer */}
          <EventDetailsDrawer
            event={selectedEvent}
            open={drawerOpen}
            isFavorite={selectedEvent ? isFavorite(selectedEvent.id) : false}
            onClose={() => setDrawerOpen(false)}
            onToggleFav={toggleFavorite}
            onRegister={(ev) => { setDrawerOpen(false); setRegisterEvent(ev); }}
          />

          {/* Register modal */}
          <EventRegisterModal
            event={registerEvent}
            open={!!registerEvent}
            relatedEvents={relatedEvents}
            onClose={() => setRegisterEvent(null)}
            onConfirm={handleRegister}
            onOpenRelated={(ev) => { setRegisterEvent(null); openEvent(ev); }}
          />
        </Box>
      </Box>
    </>
  );
}
