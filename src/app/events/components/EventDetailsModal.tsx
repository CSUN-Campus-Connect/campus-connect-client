import React from 'react';
import type { CategoryId, EventItem } from '../types';

type Props = {
  event: EventItem | null;
  open: boolean;
  onClose: () => void;
  onRegister: (event: EventItem, e?: React.MouseEvent) => void;
  onAddToCalendar: (event: EventItem, e?: React.MouseEvent) => void;
  getCategoryColor: (categoryId: CategoryId) => string;
};

export default function EventDetailsModal({ open, event, onClose, onRegister, onAddToCalendar, getCategoryColor }: Props) {
  if (!open || !event) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(980px, 100%)',
          background: '#10121a',
          color: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <img src={event.image} alt={event.title} style={{ width: '100%', height: '260px', objectFit: 'cover' }} />
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>{event.title}</h3>
          <p style={{ opacity: 0.9, marginBottom: '1rem' }}>{event.fullDescription}</p>

          <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '1rem' }}>
            <div><b>Date/Time:</b> {event.date} • {event.time}</div>
            <div><b>Location:</b> {event.location} ({event.building})</div>
            <div><b>Price:</b> {event.price}</div>
            <div><b>Access:</b> {event.accessibility}</div>
            <div><b>Parking:</b> {event.parking}</div>
            <div><b>Audience:</b> {event.audience.join(', ')}</div>
            <div><b>Tags:</b> {event.tags.join(', ')}</div>
            {event.freebies?.length ? <div><b>Freebies:</b> {event.freebies.join(', ')}</div> : null}
            <div><b>Contact:</b> {event.contact} • {event.phone}</div>
          </div>

          {!!event.speakers.length && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Speakers</h4>
              <ul style={{ paddingLeft: '1rem', opacity: 0.9 }}>
                {event.speakers.map((s, i) => (
                  <li key={i}>{s.name} - {s.title}</li>
                ))}
              </ul>
            </div>
          )}

          {!!event.agenda.length && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Agenda</h4>
              <ul style={{ paddingLeft: '1rem', opacity: 0.9 }}>
                {event.agenda.map((a, i) => (
                  <li key={i}><b>{a.time}</b> - {a.activity}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                onClose();
                onRegister(event);
              }}
              style={{
                background: getCategoryColor(event.category),
                color: 'white',
                padding: '0.9rem 1.1rem',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Register
            </button>
            <button
              onClick={() => onAddToCalendar(event)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: 'white',
                padding: '0.9rem 1.1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
              }}
            >
              Add to Calendar
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: 'white',
                padding: '0.9rem 1.1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
