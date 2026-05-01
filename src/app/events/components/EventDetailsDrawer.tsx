'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EventItem } from '../types';
import { CATEGORY_COLOR_MAP } from '../data/constants';
import { buildICS } from '../utils/calendar';

interface Props {
  event: EventItem | null;
  open: boolean;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFav: (id: string, e: React.MouseEvent) => void;
  onRegister: (ev: EventItem) => void;
}

export default function EventDetailsDrawer({ event, open, isFavorite, onClose, onToggleFav, onRegister }: Props) {
  const catColor = event ? (CATEGORY_COLOR_MAP[event.category] ?? '#CC0033') : '#CC0033';
  const pct = event ? Math.min(Math.round((event.registered / event.capacity) * 100), 100) : 0;
  const full = event ? event.registered >= event.capacity : false;

  const handleCalendar = () => {
    if (!event) return;
    const ics = buildICS(event);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `${event.title.replace(/\s+/g, '_')}.ics`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {open && event && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 100,
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              bottom: 0,
              width: 'min(520px, 95vw)',
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRight: 'none',
              zIndex: 101,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header image */}
            <div style={{ position: 'relative', height: 220, flexShrink: 0 }}>
              <img
                src={event.image}
                alt={event.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%)',
                }}
              />

              {/* Close */}
              <button
                onClick={onClose}
                aria-label="Close event details"
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  color: '#111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                }}
              >
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Fav */}
              <button
                onClick={(e) => onToggleFav(event.id, e)}
                aria-label={isFavorite ? `Remove ${event.title} from favorites` : `Add ${event.title} to favorites`}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 56,
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)',
                  border: `1px solid ${isFavorite ? '#CC0033' : 'rgba(0,0,0,0.1)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                }}
              >
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill={isFavorite ? '#CC0033' : 'none'} stroke={isFavorite ? '#CC0033' : '#999'} strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>

              {/* Category badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 14,
                  left: 18,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: `${catColor}22`,
                  border: `1px solid ${catColor}55`,
                  borderRadius: 20,
                  padding: '4px 12px',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: catColor }} />
                <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: '1px', color: catColor, textTransform: 'uppercase' }}>
                  {event.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px 22px', flex: 1 }}>
              <h2
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: 22,
                  lineHeight: 1.2,
                  color: '#111',
                  marginBottom: 8,
                }}
              >
                {event.title}
              </h2>

              <p style={{ fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                {event.fullDescription}
              </p>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {[
                  { label: 'Date', value: event.date },
                  { label: 'Time', value: event.time },
                  { label: 'Location', value: event.location },
                  { label: 'Building', value: event.building },
                  { label: 'Organizer', value: event.organizer },
                  { label: 'Price', value: event.price },
                  { label: 'Accessibility', value: event.accessibility },
                  { label: 'Parking', value: event.parking },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      background: '#f5f5f5',
                      border: '1px solid rgba(0,0,0,0.06)',
                      borderRadius: 10,
                      padding: 12,
                    }}
                  >
                    <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '1px', color: '#999', marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 12, color: '#111', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Capacity */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: '#999', fontFamily: "'DM Sans', sans-serif" }}>Attendance</span>
                  <span style={{ fontSize: 11, color: '#666', fontFamily: "'DM Sans', sans-serif" }}>
                    {event.registered.toLocaleString()} / {event.capacity.toLocaleString()} ({pct}%)
                  </span>
                </div>
                <div style={{ height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: pct > 90 ? '#ef4444' : '#CC0033', borderRadius: 2 }} />
                </div>
              </div>

              {/* Speakers */}
              {event.speakers.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#D22030', marginBottom: 10, fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>
                    Speakers
                  </div>
                  {event.speakers.map((s) => (
                    <div key={s.name} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          background: `${catColor}12`,
                          border: `1px solid ${catColor}30`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: "'Syne', sans-serif",
                          color: catColor,
                          flexShrink: 0,
                        }}
                      >
                        {s.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111', fontFamily: "'DM Sans', sans-serif" }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: '#999', fontFamily: "'DM Sans', sans-serif" }}>
                          {s.title}{s.affiliation ? ` · ${s.affiliation}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Agenda */}
              {event.agenda.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#D22030', marginBottom: 10, fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>
                    Agenda
                  </div>
                  {event.agenda.map((item, i) => (
                    <div
                      key={item.time}
                      style={{
                        display: 'flex',
                        gap: 12,
                        paddingBottom: 12,
                        borderBottom: i < event.agenda.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: catColor, marginTop: 3 }} />
                        {i < event.agenda.length - 1 && (
                          <div style={{ width: 1, flex: 1, background: `${catColor}22` }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: catColor, fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '0.5px', marginBottom: 2 }}>
                          {item.time}
                        </div>
                        <div style={{ fontSize: 13, color: '#555', fontFamily: "'DM Sans', sans-serif" }}>
                          {item.activity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: '#f5f5f5',
                      border: '1px solid rgba(0,0,0,0.06)',
                      borderRadius: 6,
                      padding: '3px 10px',
                      fontSize: 11,
                      color: '#666',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => onRegister(event)}
                  disabled={full}
                  style={{
                    flex: 2,
                    background: full ? '#f5f5f5' : '#CC0033',
                    border: `1px solid ${full ? '#ddd' : '#CC0033'}`,
                    borderRadius: 12,
                    padding: '13px 0',
                    color: full ? '#999' : '#fff',
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: full ? 'not-allowed' : 'pointer',
                    letterSpacing: '0.5px',
                  }}
                >
                  {full ? 'Sold Out' : 'Register Now'}
                </button>

                <button
                  onClick={handleCalendar}
                  style={{
                    flex: 1,
                    background: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: 12,
                    padding: '13px 0',
                    color: '#666',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Add
                </button>

                {event.csunUrl && (
                  <a
                    href={event.csunUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      background: '#f5f5f5',
                      border: '1px solid #ddd',
                      borderRadius: 12,
                      padding: '13px 0',
                      color: '#666',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      textDecoration: 'none',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15,3 21,3 21,9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    CSUN
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
