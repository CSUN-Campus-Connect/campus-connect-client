'use client';

// ============================================================================
// Matador Marketplace — Full Revamp
//
// Architecture:
//  - All data logic lives in useMarketplace hook (no fetch code in this file)
//  - Components: MarketplaceCard, AddListingModal, ContactSellerModal, States
//  - Background: animated mesh gradient + drifting orbs (CSS only)
//  - Filter bar: sticky, scrolls independently from the content
//  - Fly-to-fav: heart bounces from card to "My Favorites" counter in the nav
//  - No emojis anywhere
// ============================================================================

import React, { useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthorize } from '@/lib/useAuthorize';
import { useMarketplace } from './hooks/useMarketplace';
import MarketplaceCard from './components/MarketplaceCard';
import AddListingModal from './components/AddListingModal';
import ContactSellerModal from './components/ContactSellerModal';
import { LoadingState, ErrorState, EmptyState } from './components/MarketplaceStates';
import { MarketplaceListing } from './types/marketplace.types';
import { CATEGORIES, SORT_OPTIONS, LISTING_TYPES } from './constants/marketplace.constants';
import { useState } from 'react';

// ── Inline SVG icons ───────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function HeartFilledIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

// ── Animated background ────────────────────────────────────────────────────────

function MarketplaceBackground() {
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Base gradient */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #A80532 0%, #7a0222 40%, #5a0118 100%)' }} />

      {/* Animated drifting orbs */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,100,100,0.15) 0%, transparent 60%)', filter: 'blur(40px)', animation: 'mp-orb1 20s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '-25%', right: '-15%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,50,50,0.12) 0%, transparent 60%)', filter: 'blur(50px)', animation: 'mp-orb2 25s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', top: '30%', right: '10%', width: '35vw', height: '35vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,200,255,0.05) 0%, transparent 60%)', filter: 'blur(60px)', animation: 'mp-orb3 30s ease-in-out infinite' }} />

      {/* Subtle diagonal texture lines */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 60px, rgba(255,255,255,0.015) 60px, rgba(255,255,255,0.015) 61px)', }} />

      {/* Noise grain */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', mixBlendMode: 'overlay', opacity: 0.6 }} />
    </div>
  );
}

// ── Hero Section ───────────────────────────────────────────────────────────────

interface HeroProps {
  favCount: number;
  favBtnRef: React.RefObject<HTMLButtonElement | null>;
  onFavClick: () => void;
  onBack: () => void;
  onSell: () => void;
  isLoggedIn: boolean;
}

function HeroSection({ favCount, favBtnRef, onFavClick, onBack, onSell, isLoggedIn }: HeroProps) {
  return (
    <div style={{ position: 'relative', zIndex: 2, backdropFilter: 'blur(16px)', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.12)', padding: '1.5rem 2rem' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Back */}
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '8px 14px', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.2s', flexShrink: 0 }}
          onMouseEnter={(e) => { (e.currentTarget).style.background = 'rgba(255,255,255,0.2)'; }}
          onMouseLeave={(e) => { (e.currentTarget).style.background = 'rgba(255,255,255,0.12)'; }}>
          <BackIcon /> Back
        </button>

        {/* Title block */}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.5px', lineHeight: 1 }}>
            Matador <span style={{ color: '#fca5a5' }}>Marketplace</span>
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: '3px 0 0' }}>
            Buy and sell with fellow CSUN students
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, flexShrink: 0, alignItems: 'center' }}>
          <button
            ref={favBtnRef as React.RefObject<HTMLButtonElement>}
            onClick={onFavClick}
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '8px 16px', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, transition: 'background 0.2s, transform 0.2s', position: 'relative' }}
            onMouseEnter={(e) => { (e.currentTarget).style.background = 'rgba(255,255,255,0.2)'; (e.currentTarget).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.currentTarget).style.background = 'rgba(255,255,255,0.12)'; (e.currentTarget).style.transform = 'translateY(0)'; }}
          >
            <HeartFilledIcon />
            My Favorites
            {favCount > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, background: '#fca5a5', borderRadius: '50%', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a0222' }}>
                {favCount > 9 ? '9+' : favCount}
              </span>
            )}
          </button>

          <button
            onClick={onSell}
            style={{ background: '#fff', border: 'none', borderRadius: 10, padding: '9px 20px', color: '#A80532', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.2s', letterSpacing: '0.2px' }}
            onMouseEnter={(e) => { (e.currentTarget).style.transform = 'translateY(-2px)'; (e.currentTarget).style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'; }}
            onMouseLeave={(e) => { (e.currentTarget).style.transform = 'translateY(0)'; (e.currentTarget).style.boxShadow = 'none'; }}
          >
            <PlusIcon /> Sell an Item
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Filter + Search bar ───────────────────────────────────────────────────────

interface FilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  category: string;
  onCategory: (c: any) => void;
  listingType: string;
  onListingType: (lt: any) => void;
  sort: string;
  onSort: (s: any) => void;
  count: number;
}

function FilterBar({ search, onSearch, category, onCategory, listingType, onListingType, sort, onSort, count }: FilterBarProps) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(18px)', background: 'rgba(100,2,20,0.75)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0.875rem 2rem' }}>
        {/* Search row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', transition: 'border-color 0.2s' }}
            onFocusCapture={(e) => { (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.5)'; }}
            onBlurCapture={(e) => { (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.2)'; }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}><SearchIcon /></span>
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search textbooks, electronics, furniture..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14 }}
            />
          </div>
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 13, cursor: 'pointer', outline: 'none', fontWeight: 600 }}
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value} style={{ background: '#7a0222' }}>{o.label}</option>)}
          </select>
        </div>

        {/* Listing type pills */}
        <div style={{ display: 'flex', gap: 7, marginBottom: 12, overflowX: 'auto', scrollbarWidth: 'none', alignItems: 'center' }}>
          <button
            onClick={() => onListingType('all')}
            style={{
              padding: '6px 16px', borderRadius: 20, border: listingType === 'all' ? 'none' : '1px solid rgba(255,255,255,0.25)',
              background: listingType === 'all' ? '#fff' : 'rgba(255,255,255,0.08)',
              color: listingType === 'all' ? '#A80532' : 'rgba(255,255,255,0.8)',
              fontWeight: listingType === 'all' ? 700 : 500, fontSize: 12,
              cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              letterSpacing: '0.2px',
            }}
            onMouseEnter={(e) => { if (listingType !== 'all') { (e.currentTarget).style.background = 'rgba(255,255,255,0.18)'; } }}
            onMouseLeave={(e) => { if (listingType !== 'all') { (e.currentTarget).style.background = 'rgba(255,255,255,0.08)'; } }}
          >
            All Types
          </button>
          {LISTING_TYPES.map((type) => {
            const active = listingType === type.value;
            return (
              <button
                key={type.value}
                onClick={() => onListingType(type.value)}
                style={{
                  padding: '6px 16px', borderRadius: 20, border: active ? 'none' : '1px solid rgba(255,255,255,0.25)',
                  background: active ? '#fff' : 'rgba(255,255,255,0.08)',
                  color: active ? '#A80532' : 'rgba(255,255,255,0.8)',
                  fontWeight: active ? 700 : 500, fontSize: 12,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  letterSpacing: '0.2px',
                }}
                onMouseEnter={(e) => { if (!active) { (e.currentTarget).style.background = 'rgba(255,255,255,0.18)'; } }}
                onMouseLeave={(e) => { if (!active) { (e.currentTarget).style.background = 'rgba(255,255,255,0.08)'; } }}
              >
                {type.emoji} {type.label}
              </button>
            );
          })}
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', scrollbarWidth: 'none', alignItems: 'center' }}>
          {CATEGORIES.map((cat) => {
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategory(cat.id)}
                style={{
                  padding: '6px 16px', borderRadius: 20, border: active ? 'none' : '1px solid rgba(255,255,255,0.25)',
                  background: active ? '#fff' : 'rgba(255,255,255,0.08)',
                  color: active ? '#A80532' : 'rgba(255,255,255,0.8)',
                  fontWeight: active ? 700 : 500, fontSize: 12,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  letterSpacing: '0.2px',
                }}
                onMouseEnter={(e) => { if (!active) { (e.currentTarget).style.background = 'rgba(255,255,255,0.18)'; } }}
                onMouseLeave={(e) => { if (!active) { (e.currentTarget).style.background = 'rgba(255,255,255,0.08)'; } }}
              >
                {cat.label}
              </button>
            );
          })}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {count} {count === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const router = useRouter();
  const { auth, token, user } = useAuthorize();
  const favBtnRef = useRef<HTMLButtonElement>(null);

  const [showAdd, setShowAdd]           = useState(false);
  const [contactItem, setContactItem]   = useState<MarketplaceListing | null>(null);

  const mp = useMarketplace({ token: token ?? null, userId: user?.id });

  const handleSellClick = () => {
    if (!auth || !token) { alert('Please log in to sell items.'); router.push('/login'); return; }
    setShowAdd(true);
  };

  const handleFavToggle = useCallback((id: string) => {
    if (!auth || !token) { alert('Please log in to save favourites.'); router.push('/login'); return; }
    mp.toggleFavorite(id);
  }, [auth, token, mp.toggleFavorite]);

  const handleContactSeller = (item: MarketplaceListing) => {
    if (!auth || !token) { alert('Please log in to contact sellers.'); router.push('/login'); return; }
    setContactItem(item);
  };

  const formatTimeAgo = (ts: string): string => {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (m < 60)  return `${m}m ago`;
    if (h < 24)  return `${h}h ago`;
    if (d < 7)   return `${d}d ago`;
    return `${Math.floor(d / 7)}w ago`;
  };

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap" />
      <style>{`
        @keyframes mp-spin  { to { transform: rotate(360deg); } }
        @keyframes mp-orb1  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(4%,3%)} }
        @keyframes mp-orb2  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-3%,4%)} }
        @keyframes mp-orb3  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(2%,-3%)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { height: 3px; width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
        input::placeholder { color: rgba(255,255,255,0.4); }
      `}</style>

      <div style={{ minHeight: '100vh', position: 'relative', color: '#fff' }}>
        <MarketplaceBackground />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <HeroSection
            favCount={mp.favorites.size}
            favBtnRef={favBtnRef}
            onFavClick={() => router.push('/marketplace/favorites')}
            onBack={() => router.push('/dashboard')}
            onSell={handleSellClick}
            isLoggedIn={!!(auth && token)}
          />

          <FilterBar
            search={mp.search}
            onSearch={mp.setSearch}
            category={mp.category}
            onCategory={mp.setCategory}
            listingType={mp.listingType}
            onListingType={mp.setListingType}
            sort={mp.sort}
            onSort={mp.setSort}
            count={mp.listings.length}
          />

          {/* Grid */}
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 2rem 4rem' }}>
            {mp.loading && <LoadingState />}
            {!mp.loading && mp.error && <ErrorState error={mp.error} onRetry={mp.triggerRefresh} />}
            {!mp.loading && !mp.error && mp.listings.length === 0 && (
              <EmptyState
                onClearFilters={() => { mp.setCategory('all'); mp.setSearch(''); }}
                onAddListing={handleSellClick}
              />
            )}
            {!mp.loading && !mp.error && mp.listings.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {mp.listings.map((item) => (
                  <MarketplaceCard
                    key={item.id}
                    item={item}
                    isFavorite={mp.favorites.has(item.id)}
                    currentUserId={user?.id}
                    onToggleFavorite={handleFavToggle}
                    onContactSeller={handleContactSeller}
                    onDelete={async (id) => { const ok = await mp.deleteListing(id); if (!ok) alert('Failed to delete listing.'); }}
                    formatTimeAgo={formatTimeAgo}
                    favButtonRef={favBtnRef}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <AddListingModal
          isOpen={showAdd}
          onClose={() => setShowAdd(false)}
          onSuccess={mp.triggerRefresh}
          token={token ?? null}
        />
        <ContactSellerModal item={contactItem} onClose={() => setContactItem(null)} token={token ?? null} />
      </div>
    </>
  );
}
