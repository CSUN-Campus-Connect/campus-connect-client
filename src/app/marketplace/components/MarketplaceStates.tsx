'use client';

// ============================================================================
// MarketplaceStates — LoadingState, ErrorState, EmptyState
// No emojis. All icons are inline SVG.
// ============================================================================

import React from 'react';

export function LoadingState() {
  return (
    <div style={{ padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: 44, height: 44, border: '3px solid rgba(168,5,50,0.15)', borderTop: '3px solid #A80532', borderRadius: '50%', animation: 'mp-spin 0.8s linear infinite' }} />
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>Loading listings...</p>
    </div>
  );
}

interface ErrorProps { error: string; onRetry: () => void; }

export function ErrorState({ error, onRetry }: ErrorProps) {
  return (
    <div style={{ padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, padding: '2rem 2.5rem', textAlign: 'center', maxWidth: 360 }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto 14px' }}>
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Failed to Load</h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 18 }}>{error}</p>
        <button onClick={onRetry} style={{ background: '#A80532', color: '#fff', padding: '10px 24px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          Try Again
        </button>
      </div>
    </div>
  );
}

interface EmptyProps { onClearFilters: () => void; onAddListing: () => void; }

export function EmptyState({ onClearFilters, onAddListing }: EmptyProps) {
  return (
    <div style={{ padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ background: 'rgba(255,255,255,0.06)', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: 20, padding: '3rem 2.5rem', textAlign: 'center', maxWidth: 380 }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto 16px' }}>
          <rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>
          <line x1="12" y1="13" x2="12" y2="15"/><circle cx="12" cy="15" r="0.5" fill="currentColor"/>
        </svg>
        <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No Items Found</h3>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: 24 }}>Try adjusting your filters, or be the first to list something.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onClearFilters} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Clear Filters
          </button>
          <button onClick={onAddListing} style={{ padding: '10px 20px', background: '#A80532', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            List an Item
          </button>
        </div>
      </div>
    </div>
  );
}
