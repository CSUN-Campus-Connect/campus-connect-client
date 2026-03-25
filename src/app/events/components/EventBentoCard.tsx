'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { EventItem } from '../types';
import { CATEGORY_COLOR_MAP } from '../data/constants';

interface Props {
  event: EventItem;
  index: number;
  isFavorite: boolean;
  onOpen: (ev: EventItem) => void;
  onToggleFav: (id: string, e: React.MouseEvent) => void;
  onRegister: (ev: EventItem) => void;
}

function CapacityBar({ registered, capacity }: { registered: number; capacity: number }) {
  const pct = Math.min(Math.round((registered / capacity) * 100), 100);
  const full = registered >= capacity;
  const color = full ? '#ef4444' : pct > 80 ? '#f59e0b' : '#D22030';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          flex: 1,
          height: 3,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            borderRadius: 2,
            transition: 'width 0.6s ease',
          }}
        />
      </div>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}>
        {registered.toLocaleString()} / {capacity.toLocaleString()}
      </span>
    </div>
  );
}

export default function EventBentoCard({ event, index, isFavorite, onOpen, onToggleFav, onRegister }: Props) {
  const catColor = CATEGORY_COLOR_MAP[event.category] ?? '#D22030';
  const full = event.registered >= event.capacity;

  return (
    <motion.div
      layout
      key={event.id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 180, damping: 22 }}
      whileHover={{ y: -6, scale: 1.008 }}
      onClick={() => onOpen(event)}
      style={{ cursor: 'pointer' }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${event.featured ? 'rgba(210,32,48,0.3)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 20,
          overflow: 'hidden',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          transition: 'border-color 0.25s',
          position: 'relative',
          minHeight: '580px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
          <img
            src={event.image}
            alt={event.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.06)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
          />

          {/* Gradient overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, transparent 40%, rgba(10,3,5,0.85) 100%)',
            }}
          />

          {/* Badges */}
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
            {event.featured && (
              <div
                style={{
                  background: 'rgba(251,191,36,0.2)',
                  border: '1px solid rgba(251,191,36,0.4)',
                  borderRadius: 20,
                  padding: '3px 10px',
                  fontSize: 9,
                  fontWeight: 700,
                  fontFamily: "'Syne', sans-serif",
                  letterSpacing: '1px',
                  color: '#fbbf24',
                  textTransform: 'uppercase',
                }}
              >
                Featured
              </div>
            )}
            {event.trending && (
              <div
                style={{
                  background: 'rgba(210,32,48,0.25)',
                  border: '1px solid rgba(210,32,48,0.5)',
                  borderRadius: 20,
                  padding: '3px 10px',
                  fontSize: 9,
                  fontWeight: 700,
                  fontFamily: "'Syne', sans-serif",
                  letterSpacing: '1px',
                  color: '#ff6b6b',
                  textTransform: 'uppercase',
                }}
              >
                Trending
              </div>
            )}
            {(event.price === 'Free' || event.price.toLowerCase().includes('free')) && (
              <div
                style={{
                  background: 'rgba(22,200,120,0.18)',
                  border: '1px solid rgba(22,200,120,0.35)',
                  borderRadius: 20,
                  padding: '3px 10px',
                  fontSize: 9,
                  fontWeight: 700,
                  fontFamily: "'Syne', sans-serif",
                  letterSpacing: '1px',
                  color: '#16c878',
                  textTransform: 'uppercase',
                }}
              >
                Free
              </div>
            )}
          </div>

          {/* Fav button */}
          <button
            onClick={(e) => onToggleFav(event.id, e)}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              border: `1px solid ${isFavorite ? 'rgba(210,32,48,0.6)' : 'rgba(255,255,255,0.15)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          >
            {/* Heart SVG */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill={isFavorite ? '#D22030' : 'none'} stroke={isFavorite ? '#D22030' : 'rgba(255,255,255,0.7)'} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Category dot — bottom-left over image */}
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(0,0,0,0.5)',
              border: `1px solid ${catColor}44`,
              borderRadius: 20,
              padding: '3px 10px',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: catColor }} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "'Syne', sans-serif",
                letterSpacing: '0.5px',
                color: '#fff',
                textTransform: 'uppercase',
              }}
            >
              {event.category}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 16,
              lineHeight: 1.3,
              color: '#fff',
              marginBottom: 6,
            }}
          >
            {event.title}
          </h3>

          <p
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.5)',
              marginBottom: 14,
              lineHeight: 1.6,
              fontFamily: "'DM Sans', sans-serif",
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {event.shortDescription}
          </p>

          {/* Meta rows */}
          {[
            { icon: calendarIcon, text: `${event.date} · ${event.time}` },
            { icon: pinIcon,      text: `${event.location}` },
            { icon: userIcon,     text: event.organizer },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
              <div style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{icon}</div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {text}
              </span>
            </div>
          ))}

          {/* Capacity bar */}
          <div style={{ margin: '12px 0' }}>
            <CapacityBar registered={event.registered} capacity={event.capacity} />
          </div>

          {/* Engagement score chip */}
          {event.engagementScore !== undefined && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(210,32,48,0.08)',
                border: '1px solid rgba(210,32,48,0.15)',
                borderRadius: 20,
                padding: '2px 10px',
                fontSize: 10,
                color: 'rgba(210,32,48,0.8)',
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                letterSpacing: '0.3px',
                marginBottom: 14,
              }}
            >
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#D22030' }} />
              Score {Math.round(event.engagementScore)}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
            <button
              onClick={(e) => { e.stopPropagation(); onRegister(event); }}
              disabled={full}
              style={{
                flex: 1,
                background: full ? 'rgba(255,255,255,0.05)' : '#D22030',
                border: `1px solid ${full ? 'rgba(255,255,255,0.08)' : '#D22030'}`,
                borderRadius: 10,
                padding: '9px 0',
                color: full ? 'rgba(255,255,255,0.3)' : '#fff',
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                cursor: full ? 'not-allowed' : 'pointer',
                letterSpacing: '0.3px',
                transition: 'all 0.2s',
              }}
            >
              {full ? 'Sold Out' : 'Register'}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onOpen(event); }}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                padding: '9px 14px',
                color: 'rgba(255,255,255,0.5)',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s',
              }}
            >
              {/* Arrow icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </button>

            {event.csunUrl && (
              <a
                href={event.csunUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  padding: '9px 14px',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
              >
                {/* External link icon */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15,3 21,3 21,9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Inline SVG icons (no emoji) ─────────────────────────────────────────────

const calendarIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const pinIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const userIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
  </svg>
);
