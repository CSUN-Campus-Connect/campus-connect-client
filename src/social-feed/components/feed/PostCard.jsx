// =============================================================================
// components/feed/PostCard.jsx
//
// Individual post card -- the core visual unit of the feed.
//
// Each card displays:
//   - Author header with avatar, name, role badge, and relative timestamp
//   - Tags row (clickable pills that filter the feed)
//   - Post body text
//   - Image gallery (responsive grid, shimmer placeholder, overflow count)
//   - Repost embed (if the post is a quote-repost)
//   - Action bar (comment, repost, like with heart animation, bookmark)
//   - Overflow menu (copy link, save/unsave, delete for owner)
//   - Double-click on post body to like (Instagram-style)
//
// Props:
//   post            -- the post data object
//   currentUserId   -- logged-in user's id (controls delete visibility)
//   showImages      -- whether to render image attachments
//   onLike          -- (id) => void
//   onComment       -- (post) => void -- opens CommentModal
//   onRepost        -- (post) => void -- opens RepostModal
//   onDelete        -- (id) => void
//   onSave          -- (post) => void -- toggles bookmark
//   onViewProfile   -- (userId) => void
//   onTagClick      -- (tag) => void
// =============================================================================

import { useState, useRef } from 'react';
import {
  Avatar, Tag, ActionButton, Card,
  HeartIcon, CommentIcon, RepostIcon, BookmarkIcon,
  ShareIcon, TrashIcon,
} from '../ui/primitives';
import { displayName, timeAgo, fmtCount } from '../../utils/avatar';

export function PostCard({
  post,
  currentUserId,
  showImages = true,
  onLike,
  onComment,
  onRepost,
  onDelete,
  onViewProfile,
  onTagClick,
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [likeAnim,  setLikeAnim]  = useState(false);
  const [dblLikeAnim, setDblLikeAnim] = useState(false);
  const menuRef = useRef(null);
  const isOwner = post.User.id === currentUserId;
  const isLiked = post.isLikedByUser ?? false;

  /** Trigger the heart pop animation and call onLike */
  function handleLike() {
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);
    onLike(post.id);
  }

  /** Double-click on post body to like (Instagram-style interaction) */
  function handleDoubleClickLike() {
    if (!isLiked) handleLike();
    setDblLikeAnim(true);
    setTimeout(() => setDblLikeAnim(false), 600);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/social#${post.id}`);
    setMenuOpen(false);
  }

  function handleMenuBlur(e) {
    if (!menuRef.current?.contains(e.relatedTarget)) setMenuOpen(false);
  }

  return (
    <Card className="feed-card anim-fade-up" style={{ padding: 0 }}>
      {/* Repost banner */}
      {post.isRepost && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 20px 0',
          fontSize: '0.76rem', fontWeight: 600, color: 'var(--text3)',
        }}>
          <RepostIcon size={13} />
          <span onClick={() => onViewProfile(post.User.id)} style={{ cursor: 'pointer' }}>
            {displayName(post.User)} reposted
          </span>
          {post.repostComment && (
            <span style={{ color: 'var(--text2)', fontStyle: 'italic' }}>
              — "{post.repostComment}"
            </span>
          )}
        </div>
      )}

      <div style={{ padding: '16px 20px' }}>
        {/* ── Post header ── */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div onClick={() => onViewProfile(post.User.id)} style={{ cursor: 'pointer', flexShrink: 0 }}>
            <Avatar user={post.User} size={44} ring />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minWidth: 0 }}>
                <button
                  onClick={() => onViewProfile(post.User.id)}
                  style={{
                    fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem',
                    color: 'var(--text1)', background: 'none', border: 'none',
                    cursor: 'pointer', padding: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                >
                  {displayName(post.User)}
                </button>

                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px',
                  borderRadius: 'var(--r-full)', background: 'var(--red-muted)',
                  color: 'var(--red)', textTransform: 'capitalize',
                }}>
                  {post.User.userType}
                </span>

                <span style={{ color: 'var(--text3)', fontSize: '0.82rem' }}>
                  · {timeAgo(post.createdAt)}
                </span>
              </div>

              {/* 3-dot overflow menu */}
              <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }} onBlur={handleMenuBlur}>
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  aria-label="More options"
                  aria-expanded={menuOpen}
                  style={{
                    width: 30, height: 30, borderRadius: '50%', border: 'none',
                    background: menuOpen ? 'var(--bg-hover)' : 'transparent',
                    display: 'grid', placeItems: 'center', color: 'var(--text3)',
                    transition: 'background 0.15s', cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background = 'transparent'; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>

                {menuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 36, zIndex: 50,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-lg)',
                    padding: '4px', minWidth: 180,
                    animation: 'slideDown 0.18s var(--ease)',
                  }}>
                    <MenuBtn icon={<ShareIcon size={14} />} label="Copy link" onClick={handleCopyLink} />
                    <MenuBtn
                      icon={<BookmarkIcon size={14} />}
                      label={saved ? 'Unsave post' : 'Save post'}
                      onClick={() => { setSaved(s => !s); setMenuOpen(false); }}
                    />
                    {isOwner && (
                      <>
                        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                        <MenuBtn
                          icon={<TrashIcon size={14} />}
                          label="Delete post"
                          danger
                          onClick={() => { onDelete(post.id); setMenuOpen(false); }}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tags row */}
            {post.tags && post.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {post.tags.map(t => (
                  <Tag key={t} label={t} small onClick={() => onTagClick(t)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* -- Post body text (double-click to like) -- */}
        <div
          onDoubleClick={handleDoubleClickLike}
          style={{ position: 'relative', cursor: 'default' }}
        >
          <p style={{
            marginTop: 12, paddingLeft: 56,
            lineHeight: 1.65, fontSize: '0.95rem', color: 'var(--text1)',
            wordBreak: 'break-word',
          }}>
            {post.content}
          </p>

          {/* Floating heart animation on double-click */}
          {dblLikeAnim && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              animation: 'heartPop 0.5s var(--spring) forwards',
              pointerEvents: 'none', opacity: 0.85,
            }}>
              <HeartIcon size={48} filled />
            </div>
          )}
        </div>

        {/* -- Image gallery with responsive grid and shimmer loading -- */}
        {showImages && post.images && post.images.length > 0 && (
          <div style={{
            marginTop: 12, marginLeft: 56,
            borderRadius: 'var(--r-md)', overflow: 'hidden',
            border: '1px solid var(--border)',
            display: 'grid',
            gridTemplateColumns: post.images.length === 1 ? '1fr' : '1fr 1fr',
            gap: 2,
          }}>
            {post.images.slice(0, 4).map((src, i) => (
              <div
                key={i}
                className={imgLoaded ? '' : 'img-shimmer'}
                style={{
                  position: 'relative',
                  paddingBottom: post.images.length === 1 ? '52%' : '56%',
                  background: 'var(--bg)',
                }}
              >
                <img
                  src={src}
                  alt={`Post image ${i + 1}`}
                  onLoad={() => setImgLoaded(true)}
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%', objectFit: 'cover',
                    opacity: imgLoaded ? 1 : 0,
                    transition: 'opacity 0.3s var(--ease)',
                  }}
                />
                {i === 3 && post.images.length > 4 && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
                    display: 'grid', placeItems: 'center',
                    color: '#fff', fontSize: '1.2rem', fontWeight: 800,
                    fontFamily: 'var(--font-head)',
                  }}>
                    +{post.images.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* -- Original post embed shown when this is a quote-repost -- */}
        {post.isRepost && post.Post && (
          <div style={{
            marginTop: 12, marginLeft: 56,
            border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
            padding: '12px 14px', background: 'var(--bg)',
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <Avatar user={post.Post.User} size={22} />
              <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                {displayName(post.Post.User)}
              </span>
              <span style={{ color: 'var(--text3)', fontSize: '0.78rem' }}>
                · {timeAgo(post.Post.createdAt)}
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text2)', lineHeight: 1.55 }}>
              {post.Post.content}
            </p>
          </div>
        )}

        {/* -- Action bar: comment, repost, like, bookmark -- */}
        <div style={{
          display: 'flex', alignItems: 'center',
          marginTop: 12, paddingTop: 10,
          borderTop: '1px solid var(--border)',
          paddingLeft: 44, gap: 2,
        }}>
          <ActionButton
            icon={<CommentIcon size={17} />}
            label={post._count.Comment}
            onClick={() => onComment(post)}
            hoverBg="#EFF6FF"
            activeColor="var(--blue)"
            title="Comment"
          />
          <ActionButton
            icon={<RepostIcon size={17} />}
            label={post._count.other_Post}
            onClick={() => onRepost(post)}
            hoverBg="#ECFDF5"
            activeColor="var(--green)"
            title="Repost"
          />
          <ActionButton
            icon={
              <span style={{ animation: likeAnim ? 'heartPop 0.38s var(--spring)' : 'none', display: 'inline-flex' }}>
                <HeartIcon size={17} filled={isLiked} />
              </span>
            }
            label={post._count.Like}
            active={isLiked}
            activeColor="var(--red)"
            hoverBg="var(--red-light)"
            onClick={handleLike}
            title={isLiked ? 'Unlike' : 'Like'}
          />

          <div style={{ marginLeft: 'auto' }}>
            <ActionButton
              icon={<BookmarkIcon size={17} filled={saved} />}
              active={saved}
              activeColor="var(--amber)"
              hoverBg="#FFFBEB"
              onClick={() => setSaved(s => !s)}
              title={saved ? 'Unsave' : 'Save'}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// MenuBtn -- small button used inside the post overflow dropdown menu.
// Supports a danger variant for destructive actions (delete).
// ---------------------------------------------------------------------------

function MenuBtn({ icon, label, onClick, danger = false }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%', padding: '8px 10px', borderRadius: 8,
        background: h ? (danger ? '#FFF5F5' : 'var(--bg-hover)') : 'transparent',
        color: danger ? '#DC2626' : 'var(--text2)',
        fontSize: '0.85rem', fontWeight: 600, textAlign: 'left',
        border: 'none', cursor: 'pointer',
      }}
    >
      {icon}
      {label}
    </button>
  );
}
