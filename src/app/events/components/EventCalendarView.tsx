'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { EventItem } from '../types';
import { CATEGORY_COLOR_MAP } from '../data/constants';

interface Props {
  events: EventItem[];
  onSelectEvent: (ev: EventItem) => void;
}

export default function EventCalendarView({ events, onSelectEvent }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 24)); // March 24, 2026

  const monthName = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(currentDate);

  const eventsByDate: Record<string, EventItem[]> = useMemo(() => {
    const map: Record<string, EventItem[]> = {};
    events.forEach((ev) => {
      const date = new Date(ev.startISO).toISOString().split('T')[0];
      if (!map[date]) map[date] = [];
      map[date].push(ev);
    });
    return map;
  }, [events]);

  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: lastDay }, (_, i) => i + 1);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      {/* Section header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: '#D22030', fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 6 }}>
          Monthly Overview
        </div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, color: '#111', marginBottom: 6 }}>
          Events Calendar
        </h2>
        <p style={{ fontSize: 13, color: '#999', fontFamily: "'DM Sans', sans-serif" }}>
          View all CSUN events for the selected month. Dots indicate days with events.
        </p>
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 32,
        }}
      >
        <button
          onClick={prevMonth}
          style={{
            background: '#f5f5f5',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 10,
            padding: '8px 16px',
            color: '#666',
            fontFamily: "'DM Sans', sans-serif",
            cursor: 'pointer',
          }}
        >
          ← Previous
        </button>

        <h3
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 18,
            color: '#111',
          }}
        >
          {monthName}
        </h3>

        <button
          onClick={nextMonth}
          style={{
            background: '#f5f5f5',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 10,
            padding: '8px 16px',
            color: '#666',
            fontFamily: "'DM Sans', sans-serif",
            cursor: 'pointer',
          }}
        >
          Next →
        </button>
      </div>

      {/* Calendar grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 12,
          marginBottom: 40,
        }}
      >
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontFamily: "'Syne', sans-serif",
              fontSize: 12,
              fontWeight: 700,
              color: '#D22030',
              padding: 12,
              textTransform: 'uppercase',
            }}
          >
            {day}
          </div>
        ))}

        {/* Empty cells */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {days.map((day) => {
          const dateStr = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
          )
            .toISOString()
            .split('T')[0];
          const dayEvents = eventsByDate[dateStr] || [];
          const isToday = new Date().toISOString().split('T')[0] === dateStr;

          return (
            <motion.div
              key={day}
              whileHover={{ y: -4 }}
              style={{
                background: isToday
                  ? '#fff2f5'
                  : '#ffffff',
                border: isToday
                  ? '1px solid #ffccdd'
                  : '1px solid rgba(0,0,0,0.08)',
                borderRadius: 12,
                padding: 12,
                minHeight: 100,
                cursor: dayEvents.length > 0 ? 'pointer' : 'default',
              }}
            >
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: isToday ? '#CC0033' : '#111',
                  marginBottom: 8,
                }}
              >
                {day}
              </div>

              {dayEvents.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {dayEvents.slice(0, 2).map((ev) => (
                    <motion.div
                      key={ev.id}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => onSelectEvent(ev)}
                      style={{
                        background: `${CATEGORY_COLOR_MAP[ev.category] ?? '#CC0033'}22`,
                        border: `1px solid ${CATEGORY_COLOR_MAP[ev.category] ?? '#CC0033'}44`,
                        borderRadius: 6,
                        padding: '4px 6px',
                        fontSize: 9,
                        color: '#111',
                        fontFamily: "'DM Sans', sans-serif",
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ev.title}
                    </motion.div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div
                      style={{
                        fontSize: 9,
                        color: '#999',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Events list for selected period */}
      <div>
        <h3
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: '#D22030',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: 16,
          }}
        >
          All Events This Month
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(eventsByDate)
            .filter(([date]) => {
              const d = new Date(date);
              return (
                d.getFullYear() === currentDate.getFullYear() &&
                d.getMonth() === currentDate.getMonth()
              );
            })
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([_, dayEvents]) =>
              dayEvents.map((ev) => (
                <motion.div
                  key={ev.id}
                  whileHover={{ x: 4 }}
                  onClick={() => onSelectEvent(ev)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 12,
                    padding: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: CATEGORY_COLOR_MAP[ev.category] ?? '#CC0033',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 700,
                        fontSize: 13,
                        color: '#111',
                        margin: 0,
                        marginBottom: 2,
                      }}
                    >
                      {ev.title}
                    </h4>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 11,
                        color: '#999',
                        margin: 0,
                      }}
                    >
                      {ev.time} · {ev.location}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
        </div>
      </div>
    </div>
  );
}
