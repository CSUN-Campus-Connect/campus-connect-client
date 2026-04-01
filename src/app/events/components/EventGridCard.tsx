import React from 'react';
import type { EventItem, CategoryId } from '../types';

type Props = {
  event: EventItem;
  isFavorite: boolean;
  onToggleFavorite: (id: number, e: React.MouseEvent) => void;
  onRegister: (event: EventItem, e?: React.MouseEvent) => void;
  onAddToCalendar: (event: EventItem, e?: React.MouseEvent) => void;
  onShare: (event: EventItem, e: React.MouseEvent) => void;
  getCategoryColor: (categoryId: CategoryId) => string;
};

export default function EventGridCard({
  event,
  isFavorite,
  onToggleFavorite,
  onRegister,
  onAddToCalendar,
  onShare,
  getCategoryColor,
}: Props) {
  return (
    <>
      <div style={{ position: 'relative', height: '14rem' }}>
        <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

        <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {event.featured && (
            <span
              style={{
                background: '#fbbf24',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 800,
              }}
            >
              Featured
            </span>
          )}
          {event.trending && (
            <span
              style={{
                background: '#D22030',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 800,
              }}
            >
              Trending
            </span>
          )}
        </div>

        <button
          onClick={(e) => onToggleFavorite(event.id, e)}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '0.75rem',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <svg width="24" height="24" fill={isFavorite ? '#D22030' : 'none'} stroke={isFavorite ? '#D22030' : '#374151'} strokeWidth="2.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {event.registered}/{event.capacity} Registered
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>
        <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>{event.title}</h3>

        <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1rem' }}>{event.shortDescription}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span style={{ fontSize: '0.95rem' }}>{event.date} • {event.time}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span style={{ fontSize: '0.95rem' }}>{event.location}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span style={{ fontSize: '0.95rem' }}>{event.price}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {event.tags.slice(0, 4).map((tag, i) => (
            <span
              key={i}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
              }}
            >
              {tag}
            </span>
          ))}
          {event.freebies?.length ? (
            <span
              style={{
                background: 'rgba(210, 32, 48, 0.2)',
                color: '#fff',
                padding: '0.25rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                border: '1px solid rgba(210,32,48,0.4)',
              }}
            >
              {event.freebies.join(' • ')}
            </span>
          ) : null}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={(e) => onRegister(event, e)}
            style={{
              flex: 1,
              background: getCategoryColor(event.category),
              color: 'white',
              padding: '1rem',
              borderRadius: '14px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            Register Now
          </button>
          <button
            onClick={(e) => onAddToCalendar(event, e)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              padding: '1rem',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
            </svg>
          </button>
          <button
            onClick={(e) => onShare(event, e)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              padding: '1rem',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="8.49" />
              <line x1="8.59" y1="10.49" x2="15.42" y2="15.51" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
