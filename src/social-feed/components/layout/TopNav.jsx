// =============================================================================
// components/layout/TopNav.jsx
//
// Sticky top navigation bar -- always visible at the top of the page.
//
// Layout (left to right):
//   1. Logo + wordmark   -- CSUN gradient text, links to feed root
//   2. Search bar        -- centered, expands on focus with red glow;
//                           press "/" anywhere to focus (unless in a text field)
//   3. Notification bell -- badge count, opens NotifPanel popover
//   4. Settings button   -- shortcut to open the SettingsPanel drawer
//   5. Avatar dropdown   -- current user info + links to profile/settings
//
// Uses glassmorphism (backdrop-filter: blur) for the sticky header.
// Popovers close on outside click via document-level mousedown listener.
// =============================================================================

import { useState, useRef, useEffect } from 'react';
import { Avatar }       from '../ui/primitives';
import { LogoIcon, BellIcon, SearchIcon, CogIcon, UserIcon } from '../ui/primitives';
import { NotifPanel }   from '../modals/index';
import { displayName }  from '../../utils/avatar';

// ---------------------------------------------------------------------------

export function TopNav({ currentUser, unreadCount = 3, onSettings, onViewProfile, onSearch }) {
  const [showNotifs,   setShowNotifs]   = useState(false);
  const [showAvatar,   setShowAvatar]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const searchRef = useRef(null);
  const notifRef  = useRef(null);
  const avatarRef = useRef(null);

  // '/' shortcut to focus search
  useEffect(() => {
    const h = e => {
      if (e.key === '/' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  // Close popups on outside click
  useEffect(() => {
    const h = e => {
      if (!notifRef.current?.contains(e.target))  setShowNotifs(false);
      if (!avatarRef.current?.contains(e.target)) setShowAvatar(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) onSearch?.(searchQuery.trim());
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(var(--bg-card-rgb, 255,255,255), 0.88)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '0 24px', height: 60,
    }}>
      {/* -- Logo and wordmark with CSUN red gradient -- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <LogoIcon size={30} />
        <span style={{
          fontFamily: 'var(--font-head)', fontWeight: 900,
          fontSize: '1.1rem', letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, var(--red) 0%, #FF6B6B 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          CampusConnect
        </span>
      </div>

      {/* -- Centered search bar with "/" shortcut hint -- */}
      <form onSubmit={handleSearchSubmit} style={{ flex: 1, maxWidth: 480, margin: '0 auto' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {/* Icon wrapper — absolutely centered vertically */}
          <span style={{
            position: 'absolute', left: 12, top: 0, bottom: 0,
            display: 'flex', alignItems: 'center', pointerEvents: 'none',
            color: 'var(--text3)',
          }}>
            <SearchIcon size={15} />
          </span>
          <input
            ref={searchRef}
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search posts, topics, or people"
            placeholder='Search posts, topics, people… ("/" to focus)'
            style={{
              width: '100%', height: 38,
              paddingLeft: 36, paddingRight: 14,
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--r-full)',
              background: 'var(--bg-input)',
              fontFamily: 'var(--font-body)', fontSize: '0.875rem',
              color: 'var(--text1)', outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--red)';
              e.target.style.boxShadow   = 'var(--red-glow)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.boxShadow   = 'none';
            }}
          />
        </div>
      </form>

      {/* -- Right-side action buttons: notifications, settings, avatar -- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

        {/* Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowNotifs(v => !v); setShowAvatar(false); }}
            aria-label="Notifications"
            style={{
              width: 38, height: 38, borderRadius: '50%',
              border: '1px solid var(--border)',
              background: showNotifs ? 'var(--bg-hover)' : 'transparent',
              display: 'grid', placeItems: 'center',
              cursor: 'pointer', color: 'var(--text2)',
              position: 'relative', transition: 'background 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = showNotifs ? 'var(--bg-hover)' : 'transparent'}
          >
            <BellIcon size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 5, right: 5,
                width: 16, height: 16, borderRadius: '50%',
                background: 'var(--red)', color: '#fff',
                fontSize: '0.6rem', fontWeight: 800,
                display: 'grid', placeItems: 'center',
                border: '2px solid var(--bg-card)',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotifs && <NotifPanel onClose={() => setShowNotifs(false)} />}
        </div>

        {/* Settings shortcut */}
        <button
          onClick={onSettings}
          aria-label="Settings"
          style={{
            width: 38, height: 38, borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'transparent',
            display: 'grid', placeItems: 'center',
            cursor: 'pointer', color: 'var(--text2)',
            transition: 'background 0.12s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <CogIcon size={18} />
        </button>

        {/* Avatar dropdown */}
        <div ref={avatarRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowAvatar(v => !v); setShowNotifs(false); }}
            aria-label="Open account menu"
            aria-expanded={showAvatar}
            style={{
              background: 'none', border: 'none', padding: 0,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              borderRadius: 'var(--r-full)',
            }}
          >
            <Avatar user={currentUser} size={34} ring />
          </button>

          {showAvatar && (
            <div style={{
              position: 'absolute', top: 46, right: 0, zIndex: 300,
              width: 200, background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              animation: 'slideDown 0.18s var(--ease)',
            }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{displayName(currentUser)}</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text3)', textTransform: 'capitalize' }}>
                  {currentUser.userType}
                </div>
              </div>
              {[
                { icon: <UserIcon size={14} />, label: 'View profile', action: onViewProfile },
                { icon: <CogIcon size={14} />,  label: 'Settings',     action: onSettings },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => { item.action?.(); setShowAvatar(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '10px 14px',
                    border: 'none', background: 'transparent',
                    color: 'var(--text2)', fontSize: '0.875rem',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopNav;
