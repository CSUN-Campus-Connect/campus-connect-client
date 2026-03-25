import React from 'react';
import type { CategoryId, EventItem } from '../types';

type RegistrationData = { name: string; email: string; phone: string };

type Props = {
  open: boolean;
  event: EventItem | null;
  registrationData: RegistrationData;
  setRegistrationData: React.Dispatch<React.SetStateAction<RegistrationData>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  getCategoryColor: (categoryId: CategoryId) => string;
};

export default function EventRegisterModal({
  open,
  event,
  registrationData,
  setRegistrationData,
  onClose,
  onSubmit,
  getCategoryColor,
}: Props) {
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
        zIndex: 60,
      }}
    >
      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(520px, 100%)',
          background: '#10121a',
          color: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Register for {event.title}
        </h3>
        <p style={{ opacity: 0.8, marginBottom: '1rem' }}>
          {event.date} • {event.time}
        </p>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <input
            required
            placeholder="Full name"
            value={registrationData.name}
            onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px',
              padding: '0.85rem 0.9rem',
              color: 'white',
            }}
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={registrationData.email}
            onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px',
              padding: '0.85rem 0.9rem',
              color: 'white',
            }}
          />
          <input
            placeholder="Phone (optional)"
            value={registrationData.phone}
            onChange={(e) => setRegistrationData({ ...registrationData, phone: e.target.value })}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px',
              padding: '0.85rem 0.9rem',
              color: 'white',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button
            type="submit"
            style={{
              background: getCategoryColor(event.category),
              color: 'white',
              padding: '0.9rem 1.1rem',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              flex: 1,
            }}
          >
            Confirm Registration
          </button>
          <button
            type="button"
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
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
