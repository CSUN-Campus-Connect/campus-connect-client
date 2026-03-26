'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EventItem, RegistrationForm, RelatedEventSlot } from '../types';
import { CATEGORY_COLOR_MAP } from '../data/constants';

// ─── Shimmer skeleton ─────────────────────────────────────────────────────────
// Uses a sweeping gradient in the deep-crimson palette from the reference images.
// NOT a generic grey shimmer — it reads as "Matador" branded.

function Shimmer({ width = '100%', height = 14, borderRadius = 6 }: {
  width?: string | number;
  height?: number;
  borderRadius?: number;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #2c0812 0%, #4a1020 40%, #2c0812 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmerSweep 1.6s ease-in-out infinite',
      }}
    />
  );
}

// ─── Related Event Mini Card ──────────────────────────────────────────────────

interface RelatedCardProps {
  slot: RelatedEventSlot;
  onOpen: (ev: EventItem) => void;
}

function RelatedCard({ slot, onOpen }: RelatedCardProps) {
  const { event, reason } = slot;
  const catColor = CATEGORY_COLOR_MAP[event.category] ?? '#D22030';
  const reasonLabel: Record<RelatedEventSlot['reason'], string> = {
    same_category: 'Same category',
    same_audience: 'Similar audience',
    trending:      'Trending now',
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      onClick={() => onOpen(event)}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid rgba(255,255,255,0.07)`,
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${catColor}44`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
    >
      <div style={{ height: 80, overflow: 'hidden', position: 'relative' }}>
        <img
          src={event.image}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(10,3,5,0.85))' }} />
        <div
          style={{
            position: 'absolute',
            bottom: 6,
            left: 8,
            fontSize: 9,
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            letterSpacing: '0.5px',
            color: catColor,
            background: `${catColor}15`,
            border: `1px solid ${catColor}33`,
            borderRadius: 10,
            padding: '2px 7px',
            textTransform: 'uppercase',
          }}
        >
          {reasonLabel[reason]}
        </div>
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12, color: '#fff', marginBottom: 3, lineHeight: 1.3 }}>
          {event.title}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif" }}>
          {event.date}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface Props {
  event: EventItem | null;
  open: boolean;
  relatedEvents: RelatedEventSlot[];
  onClose: () => void;
  onConfirm: (ev: EventItem) => void;
  onOpenRelated: (ev: EventItem) => void;
}

type ModalStep = 'form' | 'success';

export default function EventRegisterModal({
  event, open, relatedEvents, onClose, onConfirm, onOpenRelated,
}: Props) {
  const [form, setForm] = useState<RegistrationForm>({ name: '', email: '', phone: '' });
  const [step, setStep] = useState<ModalStep>('form');
  const [loading, setLoading] = useState(false);

  const catColor = event ? (CATEGORY_COLOR_MAP[event.category] ?? '#D22030') : '#D22030';

  const resetAndClose = () => {
    setStep('form');
    setForm({ name: '', email: '', phone: '' });
    setLoading(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setLoading(true);
    // Simulate async network call — replace with real API call in production
    await new Promise((res) => setTimeout(res, 900));
    onConfirm(event);
    setLoading(false);
    setStep('success');
  };

  return (
    <>
      <style>{`
        @keyframes shimmerSweep {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes successPop {
          0%   { transform: scale(0.7); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset: 30; }
          to   { stroke-dashoffset: 0;  }
        }
      `}</style>

      <AnimatePresence>
        {open && event && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetAndClose}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.78)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 200,
              }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(540px, 95vw)',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: '#130608',
                border: `1px solid ${catColor}33`,
                borderRadius: 22,
                zIndex: 201,
                scrollbarWidth: 'none',
              }}
            >
              <AnimatePresence mode="wait">
                {/* ── REGISTRATION FORM ─────────────────────────────────── */}
                {step === 'form' && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Event image header */}
                    <div style={{ position: 'relative', height: 140, overflow: 'hidden', borderRadius: '22px 22px 0 0' }}>
                      <img
                        src={event.image}
                        alt={event.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(10,3,5,0.9))' }} />
                      <button
                        onClick={resetAndClose}
                        style={{
                          position: 'absolute', top: 12, right: 12,
                          width: 30, height: 30, borderRadius: '50%',
                          background: 'rgba(0,0,0,0.6)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: '#fff', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>

                    <div style={{ padding: '20px 24px 24px' }}>
                      <div
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: `${catColor}18`, border: `1px solid ${catColor}33`,
                          borderRadius: 20, padding: '3px 12px', marginBottom: 10,
                        }}
                      >
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: catColor }} />
                        <span style={{ fontSize: 9, fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '1px', color: catColor, textTransform: 'uppercase' }}>
                          {event.category}
                        </span>
                      </div>

                      <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff', marginBottom: 4, lineHeight: 1.2 }}>
                        {event.title}
                      </h3>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>
                        {event.date} &nbsp;&middot;&nbsp; {event.time} &nbsp;&middot;&nbsp; {event.location}
                      </p>

                      <form onSubmit={handleSubmit}>
                        {/* Form fields */}
                        {[
                          { key: 'name',  label: 'Full Name',    type: 'text',  placeholder: 'Your full name',    required: true  },
                          { key: 'email', label: 'CSUN Email',   type: 'email', placeholder: 'you@my.csun.edu',   required: true  },
                          { key: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '(818) 555-0000', required: false },
                        ].map(({ key, label, type, placeholder, required }) => (
                          <div key={key} style={{ marginBottom: 14 }}>
                            <label style={{
                              display: 'block', fontSize: 10, textTransform: 'uppercase',
                              letterSpacing: '1px', color: 'rgba(255,255,255,0.35)',
                              marginBottom: 6, fontFamily: "'DM Sans', sans-serif",
                            }}>
                              {label}
                            </label>
                            <input
                              type={type}
                              required={required}
                              placeholder={placeholder}
                              value={form[key as keyof RegistrationForm]}
                              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                              style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 10, padding: '11px 14px',
                                color: '#fff', fontFamily: "'DM Sans', sans-serif",
                                fontSize: 13, outline: 'none',
                                transition: 'border-color 0.2s',
                              }}
                              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = `${catColor}66`; }}
                              onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                            />
                          </div>
                        ))}

                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                          <button
                            type="button"
                            onClick={resetAndClose}
                            style={{
                              flex: 1, background: 'transparent',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: 12, padding: 12,
                              color: 'rgba(255,255,255,0.45)',
                              fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontSize: 13,
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            style={{
                              flex: 2, background: loading ? 'rgba(210,32,48,0.5)' : catColor,
                              border: 'none', borderRadius: 12, padding: 12,
                              color: '#fff', fontFamily: "'Syne', sans-serif",
                              fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
                              letterSpacing: '0.3px', display: 'flex',
                              alignItems: 'center', justifyContent: 'center', gap: 8,
                              transition: 'background 0.2s',
                            }}
                          >
                            {loading ? (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                Registering...
                              </>
                            ) : 'Confirm Registration'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}

                {/* ── SUCCESS STATE ──────────────────────────────────────── */}
                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ padding: '32px 28px 28px' }}
                  >
                    {/* Animated success icon */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                      <div
                        style={{
                          width: 64, height: 64, borderRadius: '50%',
                          background: 'rgba(22,200,120,0.12)',
                          border: '2px solid rgba(22,200,120,0.4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          animation: 'successPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
                        }}
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16c878" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline
                            points="20,6 9,17 4,12"
                            strokeDasharray="30"
                            style={{ animation: 'checkDraw 0.35s 0.2s ease forwards', strokeDashoffset: 30 }}
                          />
                        </svg>
                      </div>
                    </div>

                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: '#fff', textAlign: 'center', marginBottom: 6 }}>
                      You are registered!
                    </h3>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
                      {event.title}
                    </p>
                    <p style={{ fontSize: 12, color: '#16c878', textAlign: 'center', marginBottom: 24, fontFamily: "'DM Sans', sans-serif" }}>
                      Confirmation sent to {form.email || 'your email'}
                    </p>

                    {/* Registration summary */}
                    <div
                      style={{
                        background: 'rgba(22,200,120,0.06)',
                        border: '1px solid rgba(22,200,120,0.15)',
                        borderRadius: 14, padding: '14px 16px', marginBottom: 24,
                      }}
                    >
                      {[
                        { label: 'Date',     value: event.date },
                        { label: 'Time',     value: event.time },
                        { label: 'Location', value: event.location },
                        { label: 'Price',    value: event.price },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
                          <span style={{ fontSize: 12, color: '#fff', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{value}</span>
                        </div>
                      ))}
                      {event.csunUrl && (
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, marginTop: 6 }}>
                          <a
                            href={event.csunUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              fontSize: 12, color: '#16c878', textDecoration: 'none',
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15,3 21,3 21,9" /><line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                            View full details on csun.edu
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Related events */}
                    {relatedEvents.length > 0 && (
                      <div>
                        <div style={{
                          fontSize: 9, textTransform: 'uppercase', letterSpacing: '2px',
                          color: 'rgba(255,255,255,0.3)', fontFamily: "'Syne', sans-serif",
                          fontWeight: 700, marginBottom: 12,
                        }}>
                          You might also like
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                          {relatedEvents.map((slot) => (
                            <RelatedCard
                              key={slot.event.id}
                              slot={slot}
                              onOpen={(ev) => { resetAndClose(); onOpenRelated(ev); }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={resetAndClose}
                      style={{
                        width: '100%', marginTop: 20,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12, padding: 12,
                        color: 'rgba(255,255,255,0.6)',
                        fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      Close
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
