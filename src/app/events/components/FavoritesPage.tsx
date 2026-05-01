'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EventItem } from '../types';
import { CATEGORY_COLOR_MAP } from '../data/constants';

// ─── Shimmer Card ─────────────────────────────────────────────────────────────
// Crimson-burgundy sweep shimmer — references the Deep Garnet / Smoky Ruby
// palette from the user's reference images (not a generic grey skeleton).

function ShimmerCard() {
  return (
    <div
      style={{
        background: '#f5f5f5',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 20,
        overflow: 'hidden',
        height: 320,
      }}
    >
      {/* Image placeholder */}
      <div style={{
        height: 160,
        background: 'linear-gradient(90deg, #1a0508 0%, #3c1218 40%, #1a0508 100%)',
        backgroundSize: '200% 100%',
        animation: 'crimsonShimmer 1.8s ease-in-out infinite',
      }} />
      {/* Text lines */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ height: 16, borderRadius: 4, width: '75%', background: 'linear-gradient(90deg, #1a0508 0%, #3c1218 40%, #1a0508 100%)', backgroundSize: '200% 100%', animation: 'crimsonShimmer 1.8s ease-in-out 0.1s infinite' }} />
        <div style={{ height: 12, borderRadius: 4, width: '55%', background: 'linear-gradient(90deg, #1a0508 0%, #3c1218 40%, #1a0508 100%)', backgroundSize: '200% 100%', animation: 'crimsonShimmer 1.8s ease-in-out 0.2s infinite' }} />
        <div style={{ height: 12, borderRadius: 4, width: '40%', background: 'linear-gradient(90deg, #1a0508 0%, #3c1218 40%, #1a0508 100%)', backgroundSize: '200% 100%', animation: 'crimsonShimmer 1.8s ease-in-out 0.3s infinite' }} />
        <div style={{ marginTop: 'auto', height: 36, borderRadius: 8, background: 'linear-gradient(90deg, #1a0508 0%, #3c1218 40%, #1a0508 100%)', backgroundSize: '200% 100%', animation: 'crimsonShimmer 1.8s ease-in-out 0.4s infinite' }} />
      </div>
    </div>
  );
}

// ─── Favorite Event Card ──────────────────────────────────────────────────────

interface FavCardProps {
  event: EventItem;
  onOpen: (ev: EventItem) => void;
  onRemove: (id: string, e: React.MouseEvent) => void;
}

function FavCard({ event, onOpen, onRemove }: FavCardProps) {
  const catColor = CATEGORY_COLOR_MAP[event.category] ?? '#D22030';
  const pct = event.capacity > 0 ? Math.min(Math.round((event.registered / event.capacity) * 100), 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      whileHover={{ y: -5 }}
      onClick={() => onOpen(event)}
      style={{ cursor: 'pointer' }}
    >
      <div
        style={{
          background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 20,
          overflow: 'hidden',
          transition: 'border-color 0.25s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${catColor}44`; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,0,0,0.08)'; }}
      >
        {/* Image */}
        <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
          <img
            src={event.image}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.15))' }} />

          {/* Category pill */}
          <div style={{
            position: 'absolute', bottom: 10, left: 12,
            display: 'flex', alignItems: 'center', gap: 5,
            background: `${catColor}20`, border: `1px solid ${catColor}44`,
            borderRadius: 20, padding: '3px 10px',
            backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: catColor }} />
            <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: '0.5px', color: '#fff', textTransform: 'uppercase' }}>
              {event.category}
            </span>
          </div>

          {/* Remove from favorites */}
          <button
            onClick={(e) => onRemove(event.id, e)}
            aria-label={`Remove ${event.title} from favorites`}
            style={{
              position: 'absolute', top: 10, right: 10,
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(210,32,48,0.85)',
              border: '1px solid rgba(210,32,48,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="1">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '14px 16px 16px' }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14, color: '#111', marginBottom: 5, lineHeight: 1.3 }}>
            {event.title}
          </div>

          {[
            { icon: calIcon, text: `${event.date} · ${event.time}` },
            { icon: pinIcon, text: event.location },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
              <div style={{ color: '#999', flexShrink: 0 }}>{icon}</div>
              <span style={{ fontSize: 11, color: '#666', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</span>
            </div>
          ))}

          {/* Capacity */}
          <div style={{ margin: '10px 0 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: '#999', fontFamily: "'DM Sans', sans-serif" }}>Attendance</span>
              <span style={{ fontSize: 10, color: '#666', fontFamily: "'DM Sans', sans-serif" }}>{event.registered} / {event.capacity}</span>
            </div>
            <div style={{ height: 3, background: 'rgba(204,0,51,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: pct >= 90 ? '#ef4444' : catColor, borderRadius: 2 }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onOpen(event); }}
              style={{
                flex: 1, background: catColor, border: 'none',
                borderRadius: 9, padding: '9px 0',
                color: '#fff', fontFamily: "'Syne', sans-serif",
                fontWeight: 700, fontSize: 12, cursor: 'pointer',
                letterSpacing: '0.3px',
              }}
            >
              View Details
            </button>
            {event.csunUrl && (
              <a
                href={event.csunUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: '#f5f5f5',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 9, padding: '9px 12px',
                  display: 'flex', alignItems: 'center',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = `${catColor}55`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0,0,0,0.08)'; }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15,3 21,3 21,9" /><line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyFavorites({ onDiscover }: { onDiscover: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ textAlign: 'center', padding: '80px 40px' }}
    >
      {/* Heart icon (SVG — no emoji) */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'rgba(210,32,48,0.08)',
        border: '1px solid rgba(210,32,48,0.2)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 20px',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(210,32,48,0.6)" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>

      <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: '#111', marginBottom: 8 }}>
        No saved events yet
      </h3>
      <p style={{ fontSize: 14, color: '#999', marginBottom: 28, maxWidth: 340, margin: '0 auto 28px', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
        Press the heart icon on any event card to save it here for quick access.
      </p>
      <button
        onClick={onDiscover}
        style={{
          background: '#CC0033', border: 'none', borderRadius: 12,
          padding: '12px 28px', color: '#fff',
          fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13,
          cursor: 'pointer', letterSpacing: '0.3px',
        }}
      >
        Browse Events
      </button>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  allEvents: EventItem[];
  favorites: Set<string>;
  onOpen: (ev: EventItem) => void;
  onRemove: (id: string, e: React.MouseEvent) => void;
  onDiscover: () => void;
}

export default function FavoritesPage({ allEvents, favorites, onOpen, onRemove, onDiscover }: Props) {
  const favEvents = useMemo(
    () => allEvents.filter((ev) => favorites.has(ev.id)),
    [allEvents, favorites]
  );

  // Category breakdown for the shimmer-accented header stat
  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    favEvents.forEach((ev) => {
      counts[ev.category] = (counts[ev.category] ?? 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [favEvents]);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '3rem 2rem' }}>
      <style>{`
        @keyframes crimsonShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase',
          color: '#D22030', fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 6,
        }}>
          Your Collection
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: '#fff', margin: 0 }}>
            Saved Events
            {favEvents.length > 0 && (
              <span style={{ color: '#D22030', marginLeft: 10 }}>({favEvents.length})</span>
            )}
          </h2>

          {/* Category breakdown pills */}
          {categoryBreakdown.length > 0 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {categoryBreakdown.map(([cat, count]) => {
                const color = CATEGORY_COLOR_MAP[cat as keyof typeof CATEGORY_COLOR_MAP] ?? '#D22030';
                return (
                  <div key={cat} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: `${color}12`, border: `1px solid ${color}30`,
                    borderRadius: 20, padding: '4px 12px',
                  }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: 11, color: '#666', fontFamily: "'DM Sans', sans-serif" }}>
                      {count} {cat}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Shimmer accent bar */}
        {favEvents.length > 0 && (
          <div style={{
            marginTop: 14, height: 2, borderRadius: 1,
            background: 'linear-gradient(90deg, #D22030 0%, #6b1118 50%, #D22030 100%)',
            backgroundSize: '200% 100%',
            animation: 'crimsonShimmer 2.5s ease-in-out infinite',
            maxWidth: 120,
          }} />
        )}
      </div>

      {/* Content */}
      {favEvents.length === 0 ? (
        <EmptyFavorites onDiscover={onDiscover} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
          <AnimatePresence mode="popLayout">
            {favEvents.map((ev) => (
              <FavCard key={ev.id} event={ev} onOpen={onOpen} onRemove={onRemove} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

const calIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const pinIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
