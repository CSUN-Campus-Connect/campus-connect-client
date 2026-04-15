'use client';

// ============================================================================
// Marketplace Favorites Page — Revamped
// Uses real API. Shows loading/error/empty states cleanly.
// No emojis.
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthorize } from '@/lib/useAuthorize';
import MarketplaceCard from '../components/MarketplaceCard';
import ContactSellerModal from '../components/ContactSellerModal';
import { LoadingState, ErrorState } from '../components/MarketplaceStates';
import { MarketplaceListing } from '../types/marketplace.types';
import { API_BASE } from '../constants/marketplace.constants';

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

export default function FavoritesPage() {
  const router = useRouter();
  const { auth, token, user, loading: authLoading } = useAuthorize();

  const [favorites, setFavorites]   = useState<MarketplaceListing[]>([]);
  const [favIds, setFavIds]         = useState<Set<string>>(new Set());
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [retry, setRetry]           = useState(0);
  const [contactItem, setContactItem] = useState<MarketplaceListing | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!auth || !token) { alert('Please log in to view your favorites.'); router.push('/login'); }
  }, [auth, token, authLoading, router]);

  useEffect(() => {
    if (!auth || !token) return;
    const fetch = async () => {
      setLoading(true); setError(null);
      try {
        const { data } = await axios.get(`${API_BASE}/api/v1/marketplace/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(data);
        setFavIds(new Set(data.map((l: MarketplaceListing) => l.id)));
      } catch (err: any) {
        setError(err.response?.data?.message ?? 'Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [auth, token, retry]);

  const toggleFavorite = useCallback(async (id: string) => {
    if (!token) return;
    // Optimistic remove
    setFavIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setFavorites((prev) => prev.filter((l) => l.id !== id));
    try {
      await axios.post(`${API_BASE}/api/v1/marketplace/${id}/favorite`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      setRetry((r) => r + 1); // revert by refetching
    }
  }, [token]);

  const handleContact = (item: MarketplaceListing) => setContactItem(item);

  const formatTimeAgo = (ts: string): string => {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (d < 7)  return `${d}d ago`;
    return `${Math.floor(d / 7)}w ago`;
  };

  if (authLoading || (loading && favorites.length === 0)) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #A80532 0%, #7a0222 40%, #5a0118 100%)' }}>
      <LoadingState />
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes mp-spin { to { transform: rotate(360deg); } }
        @keyframes mp-orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(4%,3%)} }
        @keyframes mp-orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-3%,4%)} }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ minHeight: '100vh', position: 'relative', color: '#fff' }}>
        {/* Background */}
        <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #A80532 0%, #7a0222 40%, #5a0118 100%)' }} />
          <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,100,100,0.12) 0%, transparent 60%)', filter: 'blur(40px)', animation: 'mp-orb1 20s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,50,50,0.1) 0%, transparent 60%)', filter: 'blur(50px)', animation: 'mp-orb2 25s ease-in-out infinite' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ backdropFilter: 'blur(16px)', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.12)', padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => router.push('/marketplace')} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '7px 14px', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              onMouseEnter={(e) => { (e.currentTarget).style.background = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={(e) => { (e.currentTarget).style.background = 'rgba(255,255,255,0.12)'; }}>
              <BackIcon /> Marketplace
            </button>
            <div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>
                Saved Items
              </h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: '2px 0 0' }}>
                {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>

          {/* Content */}
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 2rem 4rem' }}>
            {error && <ErrorState error={error} onRetry={() => setRetry((r) => r + 1)} />}

            {!error && favorites.length === 0 && !loading && (
              <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.07)', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: 20, padding: '3rem 2rem', display: 'inline-block' }}>
                  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 14px' }}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Saved Items</h3>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: 20 }}>Browse the marketplace and tap the heart to save items.</p>
                  <button onClick={() => router.push('/marketplace')} style={{ background: '#fff', color: '#A80532', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    Browse Marketplace
                  </button>
                </div>
              </div>
            )}

            {!error && favorites.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {favorites.map((item) => (
                  <MarketplaceCard
                    key={item.id}
                    item={item}
                    isFavorite={favIds.has(item.id)}
                    currentUserId={user?.id}
                    onToggleFavorite={toggleFavorite}
                    onContactSeller={handleContact}
                    formatTimeAgo={formatTimeAgo}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <ContactSellerModal item={contactItem} onClose={() => setContactItem(null)} />
      </div>
    </>
  );
}
