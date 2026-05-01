'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { EventItem } from '../types';
import { CATEGORY_COLOR_MAP, CARD_SPRING, CARD_STAGGER_DELAY } from '../data/constants';

// ─── Capacity indicator bar ───────────────────────────────────────────────────

function CapacityBar({ registered, capacity }: { registered: number; capacity: number }) {
  if (capacity === 0) return null;
  const pct  = Math.min(Math.round((registered / capacity) * 100), 100);
  const full = registered >= capacity;
  const color = full ? '#ef4444' : pct > 80 ? '#f59e0b' : '#D22030';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}>
        {registered.toLocaleString()} / {capacity.toLocaleString()}
      </span>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface Props {
  event: EventItem;
  index: number;
  isFavorite: boolean;
  onOpen: (ev: EventItem) => void;
  onToggleFav: (id: string, e: React.MouseEvent) => void;
  onRegister: (ev: EventItem, e: React.MouseEvent) => void;
}

export default function EventBentoCard({ event, index, isFavorite, onOpen, onToggleFav, onRegister }: Props) {
  const catColor = CATEGORY_COLOR_MAP[event.category] ?? '#D22030';
  const full = event.capacity > 0 && event.registered >= event.capacity;

  return (
    <motion.div
      layout                       // enables smooth reorder animation on filter
      key={event.id}
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.96 }}
      // Faster spring + per-card stagger (CARD_STAGGER_DELAY * index)
      transition={{ ...CARD_SPRING, delay: index * CARD_STAGGER_DELAY }}
      whileHover={{ y: -5, scale: 1.007, transition: { duration: 0.18, ease: 'easeOut' } }}
      onClick={() => onOpen(event)}
      style={{ cursor: 'pointer' }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: `1px solid ${event.featured ? 'rgba(210,32,48,0.28)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 20,
          overflow: 'hidden',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          transition: 'border-color 0.2s',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${catColor}44`; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = event.featured ? 'rgba(210,32,48,0.28)' : 'rgba(255,255,255,0.07)'; }}
      >
        {/* ── Image ── */}
        <div style={{ position: 'relative', height: 180, overflow: 'hidden', flexShrink: 0 }}>
          <img
            src={event.image}
            alt={event.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.45s ease' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
            // Fallback: hide broken image rather than showing broken icon
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.style.display = 'none';
              const parent = img.parentElement;
              if (parent) parent.style.background = '#1a0508';
            }}
          />

          {/* Gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 35%, rgba(10,3,5,0.82) 100%)' }} />

          {/* Status badges */}
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 5 }}>
            {event.featured && <StatusBadge label="Featured" bg="rgba(251,191,36,0.2)" border="rgba(251,191,36,0.4)" color="#fbbf24" />}
            {event.trending && <StatusBadge label="Trending" bg="rgba(210,32,48,0.22)" border="rgba(210,32,48,0.45)" color="#ff6b6b" />}
            {isFreeEvent(event.price) && <StatusBadge label="Free" bg="rgba(22,200,120,0.18)" border="rgba(22,200,120,0.35)" color="#16c878" />}
            {full && <StatusBadge label="Sold Out" bg="rgba(255,255,255,0.08)" border="rgba(255,255,255,0.15)" color="rgba(255,255,255,0.45)" />}
          </div>

          {/* Favorites toggle */}
          <button
            onClick={(e) => onToggleFav(event.id, e)}
            aria-label={isFavorite ? `Remove ${event.title} from favorites` : `Add ${event.title} to favorites`}
            style={{
              position: 'absolute', top: 8, right: 8,
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(0,0,0,0.52)',
              border: `1px solid ${isFavorite ? 'rgba(210,32,48,0.6)' : 'rgba(255,255,255,0.15)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
              transition: 'transform 0.15s, border-color 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
          >
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24"
              fill={isFavorite ? '#D22030' : 'none'}
              stroke={isFavorite ? '#D22030' : 'rgba(255,255,255,0.7)'} strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Category pill */}
          <CategoryPill category={event.category} color={catColor} />
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, lineHeight: 1.3, color: '#fff', marginBottom: 6 }}>
            {event.title}
          </h3>

          <p style={{
            fontSize: 12, color: 'rgba(255,255,255,0.48)', marginBottom: 12,
            lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif",
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {event.shortDescription}
          </p>

          {/* Meta rows */}
          <div style={{ marginBottom: 10 }}>
            {[
              { svg: calSVG, text: `${event.date} · ${event.time}` },
              { svg: pinSVG, text: event.location },
              { svg: orgSVG, text: event.organizer },
            ].map(({ svg, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <span style={{ color: 'rgba(255,255,255,0.28)', flexShrink: 0 }}>{svg}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.52)', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {text}
                </span>
              </div>
            ))}
          </div>

          {/* Capacity */}
          <div style={{ marginBottom: 10 }}>
            <CapacityBar registered={event.registered} capacity={event.capacity} />
          </div>

          {/* Engagement score chip */}
          {event.engagementScore !== undefined && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(210,32,48,0.07)', border: '1px solid rgba(210,32,48,0.14)',
              borderRadius: 20, padding: '2px 10px', fontSize: 10,
              color: 'rgba(210,32,48,0.75)', fontFamily: "'Syne', sans-serif",
              fontWeight: 700, letterSpacing: '0.3px', marginBottom: 14,
              width: 'fit-content',
            }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#D22030' }} />
              Score {Math.round(event.engagementScore)}
            </div>
          )}

          {/* Push actions to bottom */}
          <div style={{ marginTop: 'auto', display: 'flex', gap: 7 }}>
            <button
              onClick={(e) => { e.stopPropagation(); if (!full) onRegister(event, e); }}
              disabled={full}
              style={{
                flex: 1, background: full ? 'rgba(255,255,255,0.04)' : catColor,
                border: `1px solid ${full ? 'rgba(255,255,255,0.08)' : catColor}`,
                borderRadius: 10, padding: '9px 0',
                color: full ? 'rgba(255,255,255,0.28)' : '#fff',
                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12,
                cursor: full ? 'not-allowed' : 'pointer', letterSpacing: '0.3px',
                transition: 'background 0.2s',
              }}
            >
              {full ? 'Sold Out' : 'Register'}
            </button>

            {/* Details arrow */}
            <button
              onClick={(e) => { e.stopPropagation(); onOpen(event); }}
              aria-label={`View details for ${event.title}`}
              style={{ ...iconBtnStyle }}
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5">
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </button>

            {/* External CSUN link */}
            {event.csunUrl && (
              <a
                href={event.csunUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ ...iconBtnStyle, textDecoration: 'none' }}
                title="View on csun.edu"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5">
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

// ─── Helpers & small sub-components ──────────────────────────────────────────

function isFreeEvent(price: string) {
  return price === 'Free' || price.toLowerCase().startsWith('free');
}

function StatusBadge({ label, bg, border, color }: { label: string; bg: string; border: string; color: string }) {
  return (
    <div style={{
      background: bg, border: `1px solid ${border}`,
      borderRadius: 20, padding: '2px 9px',
      fontSize: 9, fontWeight: 700,
      fontFamily: "'Syne', sans-serif",
      letterSpacing: '0.5px', color,
      textTransform: 'uppercase',
    }}>
      {label}
    </div>
  );
}

function CategoryPill({ category, color }: { category: string; color: string }) {
  return (
    <div style={{
      position: 'absolute', bottom: 10, left: 10,
      display: 'flex', alignItems: 'center', gap: 5,
      background: `${color}1a`, border: `1px solid ${color}44`,
      borderRadius: 20, padding: '3px 10px',
      backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
    }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
      <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: '0.5px', color: '#fff', textTransform: 'uppercase' }}>
        {category}
      </span>
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 10, padding: '9px 12px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'border-color 0.2s',
};

// ─── Inline SVG icons (no emoji, no external libs) ───────────────────────────

const calSVG = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const pinSVG = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const orgSVG = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);