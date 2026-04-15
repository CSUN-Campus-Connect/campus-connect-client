'use client';

// ============================================================================
// ContactSellerModal
// ============================================================================

import React, { useState } from 'react';
import { MarketplaceListing } from '../types/marketplace.types';

interface Props {
  item: MarketplaceListing | null;
  onClose: () => void;
}

export default function ContactSellerModal({ item, onClose }: Props) {
  const [msg, setMsg]         = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);

  if (!item) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setSending(true);
    // Placeholder — replace with real messaging API call
    await new Promise((r) => setTimeout(r, 900));
    setSent(true);
    setSending(false);
    setTimeout(() => { setSent(false); setMsg(''); onClose(); }, 1800);
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 18, maxWidth: 480, width: '100%', boxShadow: '0 24px 60px rgba(168,5,50,0.18)', overflow: 'hidden' }}
      >
        {/* Item preview header */}
        <div style={{ background: 'linear-gradient(135deg, #A80532 0%, #8b0428 100%)', padding: '1.25rem 1.5rem', display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(255,255,255,0.25)' }}>
            {item.images?.[0] ? (
              <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.1)' }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 3 }}>Contact Seller</p>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</h3>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#fca5a5', margin: '2px 0 0' }}>${item.price.toFixed(2)}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(22,200,120,0.12)', border: '2px solid rgba(22,200,120,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16c878" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Message Sent</p>
              <p style={{ fontSize: 13, color: '#6b7280' }}>{item.seller.firstName} will be in touch via email.</p>
            </div>
          ) : (
            <form onSubmit={handleSend}>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
                Sending to <strong style={{ color: '#374151' }}>{item.seller.firstName} {item.seller.lastName}</strong>
              </p>
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                rows={5}
                placeholder={`Hi! I'm interested in your "${item.title}". Is it still available?`}
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 14 }}
                onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = '#A80532'; }}
                onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = '#e5e7eb'; }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={onClose} style={{ flex: 1, padding: 12, background: '#f3f4f6', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', color: '#374151' }}>Cancel</button>
                <button type="submit" disabled={sending || !msg.trim()} style={{ flex: 2, padding: 12, background: sending || !msg.trim() ? '#9ca3af' : '#A80532', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14, cursor: sending || !msg.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  {sending ? (
                    <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'mp-spin 0.7s linear infinite' }} />Sending...</>
                  ) : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
