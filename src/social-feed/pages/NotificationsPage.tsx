// =============================================================================
// pages/NotificationsPage.tsx
// Notification list with filter tabs (All / Unread / Likes / Comments / etc.)
// =============================================================================

import { useNotifications } from "../hooks/useNotifications";
import type { AppNotification, NotifFilter } from "../types/feed.types";

const FILTERS: { id: NotifFilter; label: string }[] = [
  { id: "all",      label: "All"      },
  { id: "unread",   label: "Unread"   },
  { id: "likes",    label: "Likes"    },
  { id: "comments", label: "Comments" },
  { id: "follows",  label: "Follows"  },
  { id: "reposts",  label: "Reposts"  },
];

export default function NotificationsPage() {
  const { notifications, filter, setFilter, markAllRead, markRead } = useNotifications();

  const filtered = notifications.filter(n => {
    if (filter === "all")      return true;
    if (filter === "unread")   return !n.read;
    if (filter === "likes")    return n.type === "like";
    if (filter === "comments") return n.type === "comment";
    if (filter === "follows")  return n.type === "follow";
    if (filter === "reposts")  return n.type === "repost";
    return true;
  });

  return (
    <div style={{ animation: "fadeUp 240ms ease both" }}>
      {/* Filter strip */}
      <div style={{ display: "flex", gap: 6, padding: "12px 20px", borderBottom: "1px solid var(--border-subtle)", overflowX: "auto" }}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: "5px 14px", borderRadius: 99, border: "1px solid",
              borderColor: filter === f.id ? "var(--csun-red)" : "var(--border-subtle)",
              background: filter === f.id ? "var(--csun-red-dim)" : "transparent",
              color: filter === f.id ? "var(--csun-red)" : "var(--text-muted)",
              fontSize: 12, fontWeight: 500, cursor: "pointer",
              transition: "all 150ms", whiteSpace: "nowrap",
            }}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={markAllRead}
          style={{ marginLeft: "auto", padding: "5px 14px", borderRadius: 99, border: "none", background: "transparent", color: "var(--csun-red)", fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          Mark all read
        </button>
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg aria-hidden="true" className="empty-icon" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <div className="empty-title">All caught up</div>
          <div className="empty-sub">No notifications in this category.</div>
        </div>
      ) : (
        filtered.map((n, i) => (
          <NotifItem key={n.id} notif={n} delay={i * 40} onRead={() => markRead(n.id)} />
        ))
      )}
    </div>
  );
}

function NotifItem({ notif, delay, onRead }: { notif: AppNotification; delay: number; onRead: () => void }) {
  const { fromUser, type, postPreview, timeAgo, read } = notif;
  const initials = `${fromUser.firstName[0]}${fromUser.lastName[0]}`.toUpperCase();

  const label = {
    like:    "liked your post",
    comment: "commented on your post",
    follow:  "started following you",
    mention: "mentioned you",
    repost:  "reposted your post",
  }[type];

  const notifLabel = `${fromUser.firstName} ${fromUser.lastName} ${label}${postPreview ? `: "${postPreview}"` : ""}. ${timeAgo} ago.${!read ? " Unread." : ""}`;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={notifLabel}
      onClick={onRead}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onRead(); } }}
      style={{
        display: "flex", gap: 12, padding: "14px 20px",
        borderBottom: "1px solid var(--border-subtle)",
        background: read ? "transparent" : "var(--csun-red-dim)",
        cursor: "pointer", transition: "background 150ms",
        animation: `fadeUp 200ms ease both`, animationDelay: `${delay}ms`,
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={e => (e.currentTarget.style.background = read ? "transparent" : "var(--csun-red-dim)")}
    >
      {/* Avatar */}
      <div className="avatar" style={{ width: 40, height: 40, fontSize: 14, flexShrink: 0 }}>
        {fromUser.profilePicture
          ? <img src={fromUser.profilePicture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span className="avatar-initials">{initials}</span>
        }
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5 }}>
          <span style={{ fontWeight: 600 }}>{fromUser.firstName} {fromUser.lastName}</span>{" "}
          <span style={{ color: "var(--text-secondary)" }}>{label}</span>
        </div>
        {postPreview && (
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            "{postPreview}"
          </div>
        )}
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{timeAgo} ago</div>
      </div>

      {/* Unread dot */}
      {!read && (
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--csun-red)", flexShrink: 0, marginTop: 6 }} />
      )}
    </div>
  );
}
