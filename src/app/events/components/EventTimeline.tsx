'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { EventItem } from '../types';
import { CATEGORY_COLOR_MAP } from '../data/constants';

interface Props {
  events: EventItem[];
  onSelectEvent: (ev: EventItem) => void;
}

export default function EventTimeline({ events, onSelectEvent }: Props) {
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) =>
      new Date(a.startISO).getTime() - new Date(b.startISO).getTime()
    );
  }, [events]);

  return (
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      {/* Section header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: '#D22030', fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 6 }}>
          Chronological View
        </div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, color: '#fff', marginBottom: 6 }}>
          Events Timeline
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Sans', sans-serif" }}>
          Explore upcoming events organized by date. Click any event to see full details.
        </p>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative' }}>
        {sortedEvents.map((event, idx) => {
          const catColor = CATEGORY_COLOR_MAP[event.category] ?? '#D22030';
          const eventDate = new Date(event.startISO);
          const dateStr = eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          });
          const timeStr = eventDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: '2rem',
                marginBottom: '3rem',
                paddingBottom: idx < sortedEvents.length - 1 ? '2rem' : 0,
                borderBottom:
                  idx < sortedEvents.length - 1
                    ? '1px solid rgba(255,255,255,0.05)'
                    : 'none',
              }}
            >
              {/* Date column */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12, color: catColor, marginBottom: 4 }}>
                  {timeStr}
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                  {dateStr}
                </div>
              </div>

              {/* Event card */}
              <motion.div
                whileHover={{ x: 8 }}
                onClick={() => onSelectEvent(event)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid rgba(255,255,255,0.07)`,
                  borderRadius: 14,
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <img
                    src={event.image}
                    alt={event.title}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 10,
                      objectFit: 'cover',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          background: `${catColor}22`,
                          border: `1px solid ${catColor}44`,
                          borderRadius: 6,
                          padding: '2px 8px',
                        }}
                      >
                        <div
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            background: catColor,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 9,
                            fontFamily: "'Syne', sans-serif",
                            fontWeight: 700,
                            color: '#fff',
                            textTransform: 'uppercase',
                          }}
                        >
                          {event.category}
                        </span>
                      </div>

                      {event.featured && (
                        <span
                          style={{
                            fontSize: 9,
                            fontFamily: "'Syne', sans-serif",
                            fontWeight: 700,
                            color: '#fbbf24',
                            textTransform: 'uppercase',
                          }}
                        >
                          Featured
                        </span>
                      )}
                    </div>

                    <h4
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 800,
                        fontSize: 14,
                        color: '#fff',
                        marginBottom: 6,
                      }}
                    >
                      {event.title}
                    </h4>

                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 12,
                        color: 'rgba(255,255,255,0.5)',
                        marginBottom: 8,
                      }}
                    >
                      {event.location} · {event.organizer}
                    </p>

                    <div
                      style={{
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.4)',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {event.registered} / {event.capacity} registered
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
