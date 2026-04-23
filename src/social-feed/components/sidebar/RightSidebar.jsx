// =============================================================================
// components/sidebar/RightSidebar.jsx
//
// Right sidebar -- sticky panel anchored to the right of the feed.
// Visible on screens >= 1280px (BREAKPOINT_LG).
//
// Contains three stacked cards:
//   1. TrendingTopics -- tag cloud showing popular discussion topics
//   2. WhoToFollow    -- user suggestions with follow/unfollow buttons;
//                        hover on "Following" shows red "Unfollow" hint
//   3. AboutCard      -- project credits, CSUN branding, and course info
//
// All sub-components are file-private; only RightSidebar is exported.
// =============================================================================

import { Avatar, Card, SectionLabel, Tag } from '../ui/primitives';
import { displayName } from '../../utils/avatar';

// ---------------------------------------------------------------------------
// TrendingTopics -- tag cloud for popular discussion categories.
// Excludes the 'All' meta-tag (first item in array).
// ---------------------------------------------------------------------------──

function TrendingTopics({ tags, activeTag, onTagSelect }) {
  return (
    <Card style={{ padding: '16px' }}>
      <SectionLabel>Trending Topics</SectionLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {tags.slice(1).map(t => (
          <Tag
            key={t}
            label={t}
            active={activeTag === t}
            onClick={() => onTagSelect(activeTag === t ? 'All' : t)}
          />
        ))}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// WhoToFollow -- suggested user cards with follow/unfollow toggle.
// ---------------------------------------------------------------------------────

function WhoToFollow({ suggestions, following, onFollow, onViewProfile }) {
  if (!suggestions.length) return null;

  return (
    <Card style={{ padding: '16px' }}>
      <SectionLabel>Who to Follow</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {suggestions.map(u => {
          const isFollowing = following.has(u.id);
          return (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div onClick={() => onViewProfile(u.id)} style={{ cursor: 'pointer' }}>
                <Avatar user={u} size={36} ring />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <button
                  onClick={() => onViewProfile(u.id)}
                  style={{
                    fontWeight: 700, fontSize: '0.875rem',
                    color: 'var(--text1)', background: 'none', border: 'none',
                    cursor: 'pointer', padding: 0, display: 'block',
                    lineHeight: 1.25, textAlign: 'left',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    maxWidth: '100%',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text1)'}
                >
                  {displayName(u)}
                </button>
                <div style={{ fontSize: '0.76rem', color: 'var(--text3)' }}>
                  {u.userType}
                </div>
              </div>

              <FollowBtn isFollowing={isFollowing} onToggle={() => onFollow(u.id)} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function FollowBtn({ isFollowing, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        padding: '5px 14px', borderRadius: 'var(--r-full)', flexShrink: 0,
        fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
        border: isFollowing ? '1.5px solid var(--border)' : '1.5px solid var(--red)',
        background: isFollowing ? 'transparent' : 'var(--red)',
        color: isFollowing ? 'var(--text2)' : '#fff',
        transition: 'all 0.18s var(--ease)',
      }}
      onMouseEnter={e => {
        if (isFollowing) { e.currentTarget.style.borderColor = '#DC2626'; e.currentTarget.style.color = '#DC2626'; }
        else { e.currentTarget.style.filter = 'brightness(0.9)'; }
      }}
      onMouseLeave={e => {
        if (isFollowing) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }
        else { e.currentTarget.style.filter = 'none'; }
      }}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}

// ---------------------------------------------------------------------------
// AboutCard -- project credits and CSUN course information.
// ---------------------------------------------------------------------------────

function AboutCard() {
  return (
    <Card style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: 'var(--red)', display: 'grid', placeItems: 'center',
          boxShadow: '0 2px 8px rgba(210,32,48,0.28)',
        }}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.95rem' }}>
          Matador Connect
        </span>
      </div>
      <p style={{ fontSize: '0.80rem', color: 'var(--text2)', lineHeight: 1.65, marginBottom: 12 }}>
        Built by CSUN students for CSUN students. One platform to share ideas, find teammates, and stay connected with campus life. Go Matadors!
      </p>
      <p style={{ marginTop: 10, fontSize: '0.72rem', color: 'var(--text3)' }}>
        COMP 490 · California State University, Northridge · 2025
      </p>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// RightSidebar -- composed export that stacks the three cards vertically.
// ---------------------------------------------------------------------------────

export function RightSidebar({ tags, activeTag, onTagSelect, suggestions, following, onFollow, onViewProfile }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <TrendingTopics tags={tags} activeTag={activeTag} onTagSelect={onTagSelect} />
      <WhoToFollow
        suggestions={suggestions}
        following={following}
        onFollow={onFollow}
        onViewProfile={onViewProfile}
      />
      <AboutCard />
    </div>
  );
}
