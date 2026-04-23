// =============================================================================
// components/modals/index.jsx
//
// All modal dialogs and popover panels for the social feed.
//
// Exports:
//   ModalShell    -- reusable backdrop + centered container with scaleIn
//                    animation, Escape-to-close, and click-outside-to-close
//   CommentModal  -- view comment thread + post a reply
//   RepostModal   -- quote-repost with optional comment
//   ProfileModal  -- full user profile with gradient cover + their posts
//   SavedModal    -- list of bookmarked posts
//   NotifPanel    -- notification dropdown popover (not a true modal)
//
// Shared button styles (ghostBtnStyle, primaryBtnStyle) are defined at
// the bottom of this file and reused across modals for consistency.
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import { Avatar, Spinner, Tag } from '../ui/primitives';
import {
  HeartIcon, CommentIcon, CloseIcon, SendIcon,
  RepostIcon, BookmarkIcon,
} from '../ui/primitives';
import { displayName, timeAgo, fmtCount } from '../../utils/avatar';
import { getComments, createComment } from '../../api/posts';

// ---------------------------------------------------------------------------
// ModalShell -- reusable backdrop + centered container.
// All modals are built on top of this shell.
// ---------------------------------------------------------------------------

export function ModalShell({ title, onClose, children, width = 560, noPad = false }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(15,17,23,0.55)',
        backdropFilter: 'blur(8px)',
        display: 'grid', placeItems: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: `min(${width}px, 100%)`,
          maxHeight: '90vh',
          background: 'var(--bg-card)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex', flexDirection: 'column',
          animation: 'scaleIn 0.22s var(--spring)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px', borderBottom: '1px solid var(--border)', flexShrink: 0,
        }}>
          <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1rem', margin: 0 }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)',
              background: 'transparent', display: 'grid', placeItems: 'center',
              cursor: 'pointer', color: 'var(--text2)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <CloseIcon aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: noPad ? 0 : '20px 22px', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CommentModal -- shows original post preview + comment thread + reply box.
// Fetches comments from the API on mount; new replies appear instantly.
// ---------------------------------------------------------------------------

export function CommentModal({ post, currentUser, onClose, onCommentPosted }) {
  const [comments,   setComments]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [text,       setText]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    let alive = true;
    getComments(post.id).then(data => {
      if (alive) { setComments(data.comments); setLoading(false); }
    }).catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [post.id]);

  async function handleSubmit() {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await createComment(post.id, text.trim());
      setComments(prev => [result.comment, ...prev]);
      setText('');
      onCommentPosted(post.id);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit();
  }

  return (
    <ModalShell title={`${fmtCount(post._count.Comment)} Comments`} onClose={onClose} width={600} noPad>
      {/* Original post preview */}
      <div style={{
        padding: '16px 22px', borderBottom: '1px solid var(--border)',
        display: 'flex', gap: 12,
      }}>
        <Avatar user={post.User} size={38} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{displayName(post.User)}</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text2)', marginTop: 4, lineHeight: 1.55 }}>
            {post.content.slice(0, 160)}{post.content.length > 160 ? '…' : ''}
          </p>
        </div>
      </div>

      {/* Reply composer */}
      <div style={{
        padding: '14px 22px', borderBottom: '1px solid var(--border)',
        display: 'flex', gap: 10,
      }}>
        <Avatar user={currentUser} size={36} />
        <div style={{ flex: 1 }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Write a reply"
            placeholder="Write a reply... (Cmd+Enter to post)"
            autoFocus
            maxLength={300}
            style={{
              width: '100%', minHeight: 72, border: '1.5px solid var(--border)',
              borderRadius: 'var(--r-md)', padding: '10px 14px', resize: 'none',
              fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none',
              transition: 'border-color 0.15s', background: 'var(--bg-input)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--red)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          {error && <p style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: 4 }}>{error}</p>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{300 - text.length} chars</span>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || submitting}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 18px', borderRadius: 'var(--r-sm)',
                border: 'none', fontWeight: 700, fontSize: '0.84rem',
                fontFamily: 'var(--font-head)',
                background: text.trim() ? 'var(--red)' : 'var(--border)',
                color: text.trim() ? '#fff' : 'var(--text3)',
                cursor: text.trim() ? 'pointer' : 'not-allowed',
                boxShadow: text.trim() ? 'var(--red-glow)' : 'none',
                transition: 'all 0.18s var(--spring)',
              }}
            >
              {submitting ? <Spinner size={14} color="#fff" /> : <SendIcon size={13} />}
              Reply
            </button>
          </div>
        </div>
      </div>

      {/* Comment thread */}
      <div style={{ padding: '8px 22px 20px' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
            <Spinner size={22} />
          </div>
        )}
        {!loading && comments.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text3)', padding: 24, fontSize: '0.88rem' }}>
            No comments yet. Be the first to reply.
          </p>
        )}
        {comments.map(c => (
          <div key={c.id} style={{
            display: 'flex', gap: 10, padding: '14px 0',
            borderBottom: '1px solid var(--border)',
          }}>
            <Avatar user={c.User} size={34} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{displayName(c.User)}</span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text3)' }}>{timeAgo(c.createdAt)}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text2)', marginTop: 4, lineHeight: 1.55 }}>
                {c.content}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// RepostModal -- quote repost with optional comment text.
// Shows a preview of the original post + textarea for quote comment.
// ---------------------------------------------------------------------------

export function RepostModal({ post, onClose, onRepost }) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  async function handleRepost() {
    setLoading(true);
    setError(null);
    try {
      await onRepost(post.id, comment.trim() || undefined);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell title="Repost" onClose={onClose} width={520}>
      <div style={{
        border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
        padding: '14px', background: 'var(--bg)', marginBottom: 16,
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
          <Avatar user={post.User} size={30} />
          <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{displayName(post.User)}</span>
          <span style={{ color: 'var(--text3)', fontSize: '0.78rem' }}>· {timeAgo(post.createdAt)}</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text2)', lineHeight: 1.55 }}>
          {post.content.slice(0, 120)}{post.content.length > 120 ? '…' : ''}
        </p>
      </div>

      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        aria-label="Add a comment to your repost (optional)"
        placeholder="Add a comment... (optional)"
        maxLength={500}
        style={{
          width: '100%', minHeight: 80, border: '1.5px solid var(--border)',
          borderRadius: 'var(--r-md)', padding: '10px 14px', resize: 'none',
          fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none',
          background: 'var(--bg-input)', marginBottom: 12,
          transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--red)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />

      {error && <p style={{ color: '#DC2626', fontSize: '0.78rem', marginBottom: 10 }}>{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button onClick={onClose} style={ghostBtnStyle}>Cancel</button>
        <button onClick={handleRepost} disabled={loading} style={primaryBtnStyle}>
          {loading ? <Spinner size={14} color="#fff" /> : <RepostIcon size={14} />}
          Repost
        </button>
      </div>
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// ProfileModal -- full user profile with gradient cover, avatar, stats,
// follow button, and a list of their posts.
// Uses locally-passed data (allUsers + posts) so no API call needed for demo.
// ---------------------------------------------------------------------------

export function ProfileModal({ userId, currentUserId, allUsers = [], posts = [], following, onFollow, onClose }) {
  // Look up user from the passed-in allUsers list (works fully offline/demo)
  const user = allUsers.find(u => u.id === userId) ?? null;
  // Get their posts from the feed
  const userPosts = posts.filter(p => p.User?.id === userId);

  const isFollowing = following.has(userId);
  const isMe = userId === currentUserId;

  return (
    <ModalShell title="Profile" onClose={onClose} width={580} noPad>
      <>
        <div style={{
          height: 90,
          background: 'linear-gradient(130deg, var(--red) 0%, #FF6B6B 55%, #FFAA8A 100%)',
        }} />

        <div style={{ padding: '0 22px 18px', marginTop: -30, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            {user && <Avatar user={user} size={58} ring style={{ border: '3px solid var(--bg-card)' }} />}
            {!user && <div style={{ width: 58, height: 58 }} />}
            {!isMe && user && (
              <button
                onClick={() => onFollow(userId)}
                style={{
                  padding: '8px 20px', borderRadius: 'var(--r-full)', marginBottom: 4,
                  fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
                  border: isFollowing ? '1.5px solid var(--border)' : '1.5px solid var(--red)',
                  background: isFollowing ? 'transparent' : 'var(--red)',
                  color: isFollowing ? 'var(--text2)' : '#fff',
                  transition: 'all 0.18s',
                }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.1rem' }}>
              {user ? displayName(user) : 'Unknown User'}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text3)', marginTop: 2, textTransform: 'capitalize' }}>
              {user?.userType ?? 'student'}
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
              <div>
                <span style={{ fontWeight: 800, fontFamily: 'var(--font-head)' }}>{fmtCount(userPosts.length)}</span>
                <span style={{ color: 'var(--text3)', fontSize: '0.82rem', marginLeft: 4 }}>Posts</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {userPosts.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text3)', padding: '20px 0', fontSize: '0.88rem' }}>
              No posts yet.
            </p>
          )}
          {userPosts.map(p => (
            <div key={p.id} style={{
              padding: '14px', borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)', background: 'var(--bg)',
            }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text1)', lineHeight: 1.6 }}>
                {p.content}
              </p>
              <div style={{ display: 'flex', gap: 14, marginTop: 10, color: 'var(--text3)', fontSize: '0.8rem' }}>
                <span>{timeAgo(p.createdAt)}</span>
                <span>{fmtCount(p._count.Like)} likes</span>
                <span>{fmtCount(p._count.Comment)} comments</span>
              </div>
            </div>
          ))}
        </div>
      </>
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// SavedModal -- displays the user's bookmarked/saved posts.
// Shows an empty state with bookmark icon when no posts are saved.
// ---------------------------------------------------------------------------

export function SavedModal({ savedPosts, onClose }) {
  return (
    <ModalShell title={`Saved Posts (${savedPosts.length})`} onClose={onClose} width={560}>
      {savedPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
          <BookmarkIcon size={32} />
          <p style={{ marginTop: 12, fontSize: '0.9rem' }}>Nothing saved yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {savedPosts.map(p => (
            <div key={p.id} style={{
              display: 'flex', gap: 12,
              padding: '14px', borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)', background: 'var(--bg)',
            }}>
              <Avatar user={p.User} size={36} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{displayName(p.User)}</div>
                <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginTop: 4, lineHeight: 1.5 }}>
                  {p.content.slice(0, 120)}{p.content.length > 120 ? '…' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// NotifPanel -- notification popover dropdown (not a full-screen modal).
// Positioned absolutely below the bell icon in TopNav.
// Uses demo data for now; in production, fetched from notifications API.
// ---------------------------------------------------------------------------

const NOTIF_ICONS = {
  like:    { icon: <HeartIcon size={13} />,   color: 'var(--red)'    },
  comment: { icon: <CommentIcon size={13} />, color: 'var(--blue)'   },
  follow:  { icon: null,                       color: 'var(--green)'  },
  repost:  { icon: <RepostIcon size={13} />,  color: 'var(--green)'  },
  mention: { icon: <CommentIcon size={13} />, color: 'var(--purple)' },
};

const DEMO_NOTIFS = [
  { id:'n1', type:'like',    from:'Elijah Cortez',   preview:'AI Resume Generator is live…', time:'5m',  read:false },
  { id:'n2', type:'comment', from:'Ivan Juarez',     preview:'AI Resume Generator is live…', time:'12m', read:false },
  { id:'n3', type:'follow',  from:'Gisselle Burgos', preview:null,                            time:'1h',  read:false },
  { id:'n4', type:'mention', from:'Joseph Forsyth',  preview:'Marketplace card layout A vs B…',time:'2h', read:true  },
];

export function NotifPanel({ onClose }) {
  const [notifs, setNotifs] = useState(DEMO_NOTIFS);

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute', top: 48, right: 0, zIndex: 400,
        width: 340, background: 'var(--bg-card)',
        border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-xl)',
        animation: 'slideDown 0.2s var(--ease)',
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.95rem' }}>
          Notifications
        </span>
        <button
          onClick={markAllRead}
          style={{ fontSize: '0.76rem', color: 'var(--red)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Mark all read
        </button>
      </div>

      {notifs.map(n => {
        const conf = NOTIF_ICONS[n.type] ?? NOTIF_ICONS.comment;
        return (
          <div
            key={n.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderBottom: '1px solid var(--border)',
              background: n.read ? 'transparent' : 'var(--red-muted)',
              cursor: 'pointer', transition: 'background 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'var(--red-muted)'}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: `${conf.color}14`, color: conf.color,
              display: 'grid', placeItems: 'center',
            }}>
              {conf.icon ?? (
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: conf.color }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text1)' }}>
                <strong>{n.from}</strong>{' '}
                <span style={{ fontWeight: 400, color: 'var(--text2)' }}>
                  {n.type === 'like'    && 'liked your post'}
                  {n.type === 'comment' && 'commented on your post'}
                  {n.type === 'follow'  && 'followed you'}
                  {n.type === 'repost'  && 'reposted your post'}
                  {n.type === 'mention' && 'mentioned you'}
                </span>
              </div>
              {n.preview && (
                <div style={{
                  fontSize: '0.76rem', color: 'var(--text3)',
                  marginTop: 2, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {n.preview}
                </div>
              )}
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text3)', flexShrink: 0 }}>{n.time}</span>
            {!n.read && (
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared button style objects reused by RepostModal and other modals.
// ---------------------------------------------------------------------------

const ghostBtnStyle = {
  padding: '9px 20px', borderRadius: 'var(--r-md)',
  border: '1px solid var(--border)', background: 'transparent',
  color: 'var(--text2)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
};

const primaryBtnStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '9px 20px', borderRadius: 'var(--r-md)',
  border: 'none', fontWeight: 700, fontSize: '0.875rem',
  fontFamily: 'var(--font-head)',
  background: 'var(--red)', color: '#fff',
  boxShadow: 'var(--red-glow)', cursor: 'pointer',
  transition: 'all 0.18s var(--spring)',
};
