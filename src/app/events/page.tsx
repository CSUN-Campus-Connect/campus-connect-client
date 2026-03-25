'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CategoryId, AudienceId, EventItem, NavSection } from './types';
import { CATEGORIES, AUDIENCES, NAV_SECTIONS } from './data/constants';
import { useEventRanking } from './hooks/useEventRanking';
import { SEED_EVENTS } from './data/events';
import EventBentoCard from './components/EventBentoCard';
import EventDetailsDrawer from './components/EventDetailsDrawer';
import EventRegisterModal from './components/EventRegisterModal';
import EventGraph from './components/EventGraph';
import EventTimeline from './components/EventTimeline';
import EventCalendarView from './components/EventCalendarView';

// ─── Background Canvas ────────────────────────────────────────────────────────
// Replicates the crimson-over-black atmospheric depth from the reference images.
// Uses layered radial gradients + a subtle SVG noise texture — no canvas required.

function PageBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Base — near-black with deep crimson warmth */}
      <div style={{ position: 'absolute', inset: 0, background: '#100608' }} />

      {/* Primary crimson glow — bottom-left, like the ember in reference image 10 */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '70vw',
          height: '70vw',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(180,18,28,0.35) 0%, rgba(130,10,18,0.18) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Secondary highlight — top-right, the lighter pinkish-crimson from reference */}
      <motion.div
        style={{
          position: 'absolute',
          top: '-15%',
          right: '-15%',
          width: '55vw',
          height: '55vw',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(210,32,48,0.2) 0%, rgba(160,24,36,0.1) 45%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{ x: [0, -25, 10, 0], y: [0, 20, -10, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      {/* Subtle metallic sheen — mimics the dusted-crimson texture of reference image 9 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          opacity: 0.6,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Top vignette */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '30vh',
          background: 'linear-gradient(to bottom, rgba(8,2,3,0.7) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}

// ─── Top Navigation Bar ───────────────────────────────────────────────────────

interface NavBarProps {
  activeSection: NavSection;
  onSection: (s: NavSection) => void;
}

function NavBar({ activeSection, onSection }: NavBarProps) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        background: 'rgba(16,4,6,0.82)',
        borderBottom: '1px solid rgba(210,32,48,0.15)',
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          height: 56,
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginRight: '2rem',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D22030 0%, #8b1220 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.9)',
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: '0.02em',
              color: '#fff',
            }}
          >
            CSUN <span style={{ color: '#D22030' }}>Events</span>
          </span>
        </div>

        {NAV_SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => onSection(s.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 10,
              border: activeSection === s.id ? '1px solid rgba(210,32,48,0.5)' : '1px solid transparent',
              background: activeSection === s.id ? 'rgba(210,32,48,0.12)' : 'transparent',
              color: activeSection === s.id ? '#fff' : 'rgba(255,255,255,0.5)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: activeSection === s.id ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {s.label}
          </button>
        ))}

        {/* Live indicator */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#16c878',
              boxShadow: '0 0 8px rgba(22,200,120,0.8)',
              animation: 'livePulse 2s ease-in-out infinite',
            }}
          />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif" }}>
            Live
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

interface HeroProps {
  totalEvents: number;
  search: string;
  onSearch: (v: string) => void;
}

function HeroSection({ totalEvents, search, onSearch }: HeroProps) {
  return (
    <div style={{ padding: '5rem 2rem 3rem', maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1 }}>
      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(210,32,48,0.1)',
          border: '1px solid rgba(210,32,48,0.25)',
          borderRadius: 20,
          padding: '5px 14px',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#D22030',
            animation: 'livePulse 1.5s ease-in-out infinite',
          }}
        />
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: '2.5px',
            color: '#D22030',
            textTransform: 'uppercase',
          }}
        >
          California State University, Northridge
        </span>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(44px, 6vw, 80px)',
          lineHeight: 0.95,
          letterSpacing: '-3px',
          color: '#fff',
          marginBottom: 16,
        }}
      >
        Campus
        <br />
        <span
          style={{
            color: 'transparent',
            WebkitTextStroke: '1.5px rgba(210,32,48,0.6)',
          }}
        >
          Events
        </span>
        <span style={{ color: '#D22030' }}> Nexus</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: 16,
          maxWidth: 520,
          marginBottom: 32,
          lineHeight: 1.7,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Every event at CSUN — ranked by engagement, clustered by affinity, and
        surfaced when it matters to you.
      </motion.p>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{ display: 'flex', gap: 12, maxWidth: 640, marginBottom: 40 }}
      >
        <div
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 14,
            padding: '13px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transition: 'border-color 0.2s',
          }}
          onFocus={() => {}}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search events, buildings, organizers..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
            }}
          />
        </div>
        <button
          style={{
            background: '#D22030',
            border: 'none',
            borderRadius: 14,
            padding: '13px 24px',
            color: '#fff',
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            letterSpacing: '0.5px',
          }}
        >
          Search
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}
      >
        {[
          { value: String(totalEvents), label: 'Active events' },
          { value: '7', label: 'Categories' },
          { value: '5.2K+', label: 'Registered students' },
          { value: 'Free', label: 'Most events' },
        ].map((stat, i, arr) => (
          <React.Fragment key={stat.label}>
            <div style={{ paddingRight: 28 }}>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: 28,
                  color: i === 0 ? '#D22030' : '#fff',
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3, fontFamily: "'DM Sans', sans-serif" }}>
                {stat.label}
              </div>
            </div>
            {i < arr.length - 1 && (
              <div
                style={{
                  width: 1,
                  height: 40,
                  background: 'rgba(255,255,255,0.08)',
                  marginRight: 28,
                  alignSelf: 'center',
                }}
              />
            )}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

interface FilterBarProps {
  category: CategoryId;
  audience: AudienceId;
  showFree: boolean;
  showTrending: boolean;
  onCategory: (c: CategoryId) => void;
  onAudience: (a: AudienceId) => void;
  onFree: () => void;
  onTrending: () => void;
}

function FilterBar({
  category, audience, showFree, showTrending,
  onCategory, onAudience, onFree, onTrending,
}: FilterBarProps) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 56,
        zIndex: 40,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(14,4,6,0.75)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0.875rem 2rem',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategory(cat.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '0.5rem 1rem',
              borderRadius: 20,
              border:
                category === cat.id
                  ? `1px solid ${cat.color}`
                  : '1px solid rgba(255,255,255,0.08)',
              background:
                category === cat.id
                  ? `${cat.color}22`
                  : 'rgba(255,255,255,0.03)',
              color: category === cat.id ? '#fff' : 'rgba(255,255,255,0.45)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              fontWeight: category === cat.id ? 600 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: cat.color,
                opacity: category === cat.id ? 1 : 0.5,
              }}
            />
            {cat.name}
          </button>
        ))}

        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

        <button
          onClick={onTrending}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 20,
            border: showTrending ? '1px solid #D22030' : '1px solid rgba(255,255,255,0.08)',
            background: showTrending ? 'rgba(210,32,48,0.15)' : 'rgba(255,255,255,0.03)',
            color: showTrending ? '#D22030' : 'rgba(255,255,255,0.45)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            fontWeight: showTrending ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Trending
        </button>

        <button
          onClick={onFree}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 20,
            border: showFree ? '1px solid #16c878' : '1px solid rgba(255,255,255,0.08)',
            background: showFree ? 'rgba(22,200,120,0.12)' : 'rgba(255,255,255,0.03)',
            color: showFree ? '#16c878' : 'rgba(255,255,255,0.45)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            fontWeight: showFree ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Free
        </button>

        <select
          value={audience}
          onChange={(e) => onAudience(e.target.value as AudienceId)}
          style={{
            marginLeft: 'auto',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: '0.45rem 0.875rem',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {AUDIENCES.map((a) => (
            <option key={a.id} value={a.id} style={{ background: '#1a0408' }}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EventsNexusPage() {
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
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [registrationData, setRegistrationData] = useState({ name: '', email: '', phone: '' });

  const { rankedEvents } = useEventRanking(events);

  // Filter pipeline
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rankedEvents.filter((ev) => {
      if (category !== 'all' && ev.category !== category) return false;
      if (audience !== 'all' && !ev.audience.includes(audience) && !ev.audience.includes('all')) return false;
      if (showFree && ev.price !== 'Free' && !ev.price.toLowerCase().includes('free')) return false;
      if (showTrending && !ev.trending) return false;
      if (q && !ev.title.toLowerCase().includes(q) && !ev.location.toLowerCase().includes(q) &&
          !ev.organizer.toLowerCase().includes(q) && !ev.tags.some((t) => t.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [rankedEvents, category, audience, showFree, showTrending, search]);

  const openEvent = useCallback((ev: EventItem) => {
    setSelectedEvent(ev);
    setDrawerOpen(true);
  }, []);

  const toggleFav = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const handleRegister = useCallback((ev: EventItem) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === ev.id && e.registered < e.capacity
          ? { ...e, registered: e.registered + 1 }
          : e
      )
    );
  }, []);

  const getCategoryColor = (categoryId: CategoryId): string => {
    const CATEGORY_COLOR_MAP: Record<CategoryId, string> = {
      all: '#D22030',
      academic: '#3B82F6',
      career: '#10B981',
      social: '#F59E0B',
      wellness: '#8B5CF6',
      sports: '#EC4899',
      arts: '#14B8A6',
      workshop: '#F97316',
    };
    return CATEGORY_COLOR_MAP[categoryId] || '#D22030';
  };

  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerEvent) {
      handleRegister(registerEvent);
      setRegisterEvent(null);
      setRegistrationData({ name: '', email: '', phone: '' });
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap"
      />
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(210,32,48,0.3); border-radius: 2px; }
        input::placeholder { color: rgba(255,255,255,0.3); }
        select option { background: #1a0408; }
      `}</style>

      <div style={{ minHeight: '100vh', position: 'relative', color: '#fff' }}>
        <PageBackground />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <NavBar activeSection={activeSection} onSection={setActiveSection} />

          <AnimatePresence mode="wait">
            {activeSection === 'discover' && (
              <motion.div
                key="discover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <HeroSection totalEvents={filtered.length} search={search} onSearch={setSearch} />

                <FilterBar
                  category={category}
                  audience={audience}
                  showFree={showFree}
                  showTrending={showTrending}
                  onCategory={setCategory}
                  onAudience={setAudience}
                  onFree={() => setShowFree((v) => !v)}
                  onTrending={() => setShowTrending((v) => !v)}
                />

                {/* Section heading */}
                <div
                  style={{
                    maxWidth: 1400,
                    margin: '0 auto',
                    padding: '2.5rem 2rem 1.25rem',
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 700,
                        fontSize: 9,
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        color: '#D22030',
                        marginBottom: 4,
                      }}
                    >
                      Ranked by Engagement Score
                    </div>
                    <h2
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 800,
                        fontSize: 22,
                        color: '#fff',
                        margin: 0,
                      }}
                    >
                      {category === 'all'
                        ? 'All Events'
                        : CATEGORIES.find((c) => c.id === category)?.name ?? 'Events'}
                      <span style={{ color: '#D22030', marginLeft: 10 }}>({filtered.length})</span>
                    </h2>
                  </div>
                </div>

                {/* Bento Grid */}
                <div
                  style={{
                    maxWidth: 1400,
                    margin: '0 auto',
                    padding: '0 2rem 4rem',
                  }}
                >
                  {filtered.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '80px 0',
                        color: 'rgba(255,255,255,0.3)',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Syne', sans-serif",
                          fontWeight: 700,
                          fontSize: 18,
                          marginBottom: 8,
                        }}
                      >
                        No events found
                      </div>
                      <div style={{ fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
                        Try adjusting your filters or search terms
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                        gap: 18,
                      }}
                    >
                      <AnimatePresence mode="popLayout">
                        {filtered.map((event, idx) => (
                          <EventBentoCard
                            key={event.id}
                            event={event}
                            index={idx}
                            isFavorite={favorites.has(event.id)}
                            onOpen={openEvent}
                            onToggleFav={toggleFav}
                            onRegister={(ev) => {
                              setRegisterEvent(ev);
                            }}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeSection === 'graph' && (
              <motion.div
                key="graph"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <EventGraph events={events} onSelectEvent={openEvent} />
              </motion.div>
            )}

            {activeSection === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <EventTimeline events={events} onSelectEvent={openEvent} />
              </motion.div>
            )}

            {activeSection === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <EventCalendarView events={events} onSelectEvent={openEvent} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Details Drawer */}
        <EventDetailsDrawer
          event={selectedEvent}
          open={drawerOpen}
          isFavorite={selectedEvent ? favorites.has(selectedEvent.id) : false}
          onClose={() => setDrawerOpen(false)}
          onToggleFav={(id, e) => toggleFav(id, e)}
          onRegister={(ev) => {
            setDrawerOpen(false);
            setRegisterEvent(ev);
          }}
        />

        {/* Register Modal */}
        <EventRegisterModal
          event={registerEvent}
          open={!!registerEvent}
          registrationData={registrationData}
          setRegistrationData={setRegistrationData}
          onClose={() => {
            setRegisterEvent(null);
            setRegistrationData({ name: '', email: '', phone: '' });
          }}
          onSubmit={handleRegistrationSubmit}
          getCategoryColor={getCategoryColor}
        />
      </div>
    </>
  );
}