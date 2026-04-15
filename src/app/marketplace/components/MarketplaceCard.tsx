'use client';

// ============================================================================
// MarketplaceCard — Revamped
// Features:
//  - Consistent 1:1 image with cover-fit (no distortion)
//  - Fly-to-fav animation when hearting an item
//  - Hover: image zooms + CTA slides up
//  - Owner badge + edit/delete actions
//  - No emojis — all icons are inline SVG
// ============================================================================

import React, { useRef, useState } from 'react';
import { MarketplaceListing } from '../types/marketplace.types';
import { getConditionMeta, getCategoryAccent } from '../constants/marketplace.constants';

interface Props {
  item: MarketplaceListing;
  isFavorite: boolean;
  currentUserId?: string;
  onToggleFavorite: (id: string) => void;
  onContactSeller: (item: MarketplaceListing) => void;
  onEdit?: (item: MarketplaceListing) => void;
  onDelete?: (id: string) => void;
  formatTimeAgo: (ts: string) => string;
  favButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#A80532' : 'none'} stroke={filled ? '#A80532' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

// ── Flying heart animation ─────────────────────────────────────────────────────
// Creates a temporary heart SVG that animates from the button to the fav counter

function spawnFlyingHeart(from: HTMLElement, to: HTMLElement | null) {
  if (!to) return;
  const fromRect = from.getBoundingClientRect();
  const toRect   = to.getBoundingClientRect();

  const el = document.createElement('div');
  el.style.cssText = `
    position:fixed;
    left:${fromRect.left + fromRect.width / 2}px;
    top:${fromRect.top + fromRect.height / 2}px;
    width:22px;height:22px;
    pointer-events:none;z-index:9999;
    transform:translate(-50%,-50%);
  `;
  el.innerHTML = `<svg viewBox="0 0 24 24" fill="#A80532" width="22" height="22"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  document.body.appendChild(el);

  const dx = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2);
  const dy = toRect.top  + toRect.height / 2 - (fromRect.top  + fromRect.height / 2);

  el.animate([
    { transform: 'translate(-50%,-50%) scale(1)',    opacity: 1 },
    { transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% + ${dy * 0.4}px)) scale(1.4)`, opacity: 0.9 },
    { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.6)`, opacity: 0 },
  ], { duration: 520, easing: 'cubic-bezier(0.25,0.46,0.45,0.94)' }).onfinish = () => el.remove();
}

// ── Card ──────────────────────────────────────────────────────────────────────

export default function MarketplaceCard({
  item,
  isFavorite,
  currentUserId,
  onToggleFavorite,
  onContactSeller,
  onEdit,
  onDelete,
  formatTimeAgo,
  favButtonRef,
}: Props) {
  const heartBtnRef   = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  const cond    = getConditionMeta(item.condition);
  const accent  = getCategoryAccent(item.category);
  const isOwner = !!(currentUserId && item.seller.id === currentUserId);
  const savings = item.originalPrice && item.originalPrice > item.price
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : null;

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFavorite) {
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 600);
      spawnFlyingHeart(heartBtnRef.current!, favButtonRef?.current ?? null);
    }
    onToggleFavorite(item.id);
  };

  const imgSrc = item.images?.[0] || '';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid rgba(0,0,0,0.07)',
        overflow: 'hidden',
        boxShadow: hovered ? '0 12px 32px rgba(168,5,50,0.13)' : '0 2px 10px rgba(0,0,0,0.07)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease',
        cursor: 'default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', width: '100%', paddingBottom: '72%', overflow: 'hidden', background: '#f3f4f6' }}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={item.title}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.45s ease',
            }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)', transition: 'opacity 0.3s', opacity: hovered ? 1 : 0.7 }} />

        {/* Condition badge */}
        <div style={{ position: 'absolute', top: 10, left: 10, background: cond.bg, color: cond.color, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, border: `1px solid ${cond.color}44`, letterSpacing: '0.3px', backdropFilter: 'blur(4px)' }}>
          {cond.label}
        </div>

        {/* Owner badge */}
        {isOwner && (
          <div style={{ position: 'absolute', top: 10, left: item.condition ? 90 : 10, background: 'rgba(168,5,50,0.85)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 9px', borderRadius: 20, letterSpacing: '0.5px', backdropFilter: 'blur(4px)' }}>
            YOUR LISTING
          </div>
        )}

        {/* Fav button */}
        <button
          ref={heartBtnRef}
          onClick={handleFav}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)',
            border: `1.5px solid ${isFavorite ? '#A80532' : 'rgba(255,255,255,0.6)'}`,
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transform: heartAnim ? 'scale(1.35)' : 'scale(1)',
            transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s',
          }}
        >
          <HeartIcon filled={isFavorite} />
        </button>

        {/* Slide-up CTA on hover */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px',
          transform: hovered ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); onContactSeller(item); }}
            style={{ width: '100%', background: '#A80532', border: 'none', borderRadius: 9, padding: '9px', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <ChatIcon /> Contact Seller
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Category label */}
        <div style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>
          {item.category}
        </div>

        {/* Title */}
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 4px', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {item.title}
        </h3>

        {/* Description */}
        <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 10px', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {item.description}
        </p>

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#A80532' }}>${item.price.toFixed(2)}</span>
          {item.originalPrice && (
            <span style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'line-through' }}>${item.originalPrice.toFixed(2)}</span>
          )}
          {savings && (
            <span style={{ fontSize: 11, fontWeight: 700, background: '#dcfce7', color: '#16a34a', padding: '2px 7px', borderRadius: 6 }}>
              Save {savings}%
            </span>
          )}
        </div>

        {/* Seller row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <img
            src={item.seller.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${item.seller.firstName}+${item.seller.lastName}`}
            alt={item.seller.firstName}
            style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #e5e7eb' }}
          />
          <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{item.seller.firstName} {item.seller.lastName}</span>
          <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>{item.location}</span>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9ca3af', fontSize: 11 }}>
            <EyeIcon /> {item.views}
          </div>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatTimeAgo(item.createdAt)}</span>
        </div>

        {/* Owner actions */}
        {isOwner && (
          <div style={{ display: 'flex', gap: 7, marginTop: 10, paddingTop: 10, borderTop: '1px solid #f3f4f6' }}>
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '7px', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={(e) => { (e.currentTarget).style.background = '#e5e7eb'; }}
                onMouseLeave={(e) => { (e.currentTarget).style.background = '#f3f4f6'; }}
              >
                <PencilIcon /> Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); if (confirm('Delete this listing?')) onDelete(item.id); }}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#fef2f2', border: 'none', borderRadius: 8, padding: '7px', fontSize: 12, fontWeight: 600, color: '#dc2626', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={(e) => { (e.currentTarget).style.background = '#fee2e2'; }}
                onMouseLeave={(e) => { (e.currentTarget).style.background = '#fef2f2'; }}
              >
                <TrashIcon /> Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
