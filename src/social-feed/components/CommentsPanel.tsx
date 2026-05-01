// =============================================================================
// components/CommentsPanel.tsx
// Lazy-loaded comment thread that appears below a PostCard when expanded.
// =============================================================================

import { useEffect, useRef, KeyboardEvent } from "react";
import { useComments } from "../hooks/useComments";
import type { Comment } from "../types/feed.types";

interface CommentsPanelProps {
  postId: string;
  currentUserId: string;
}

export function CommentsPanel({ postId, currentUserId }: CommentsPanelProps) {
  const { comments, isLoading, hasMore, isSubmitting, load, loadMore, addComment, removeComment } = useComments(postId);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit() {
    const val = inputRef.current?.value.trim();
    if (!val) return;
    if (inputRef.current) inputRef.current.value = "";
    await addComment(val);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit();
  }

  return (
    <div style={{ paddingTop: 12, borderTop: "1px solid var(--border-subtle)", marginTop: 10 }}>

      {/* Compose row */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
        <div className="avatar" style={{ width:30, height:30, fontSize:11, flexShrink:0 }}>
          <span className="avatar-initials">SM</span>
        </div>
        <div
          style={{ flex:1, display:"flex", alignItems:"center", background:"var(--bg-elevated)", border:"1px solid var(--border-subtle)", borderRadius:99, overflow:"hidden", transition:"border-color 150ms, box-shadow 150ms" }}
          onFocus={e => { e.currentTarget.style.borderColor = "var(--csun-red)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--csun-red-glow)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Write a reply… (Cmd+Enter to send)"
            aria-label="Write a reply"
            onKeyDown={handleKeyDown}
            maxLength={300}
            disabled={isSubmitting}
            style={{ flex:1, padding:"8px 14px", background:"transparent", border:"none", outline:"none", color:"var(--text-primary)", fontSize:13 }}
          />
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ padding:"7px 16px", background:"var(--csun-red)", border:"none", color:"#fff", fontSize:12, fontWeight:600, flexShrink:0, cursor:"pointer", opacity: isSubmitting ? .6 : 1, transition:"opacity 150ms" }}
          >
            {isSubmitting ? "…" : "Reply"}
          </button>
        </div>
      </div>

      {/* Comment list */}
      {isLoading && !comments.length ? (
        <CommentSkeleton />
      ) : (
        comments.map((c, i) => (
          <CommentItem
            key={c.id}
            comment={c}
            delay={i * 50}
            isOwn={c.User.id === currentUserId}
            onDelete={() => removeComment(c.id)}
          />
        ))
      )}

      {/* Load more */}
      {hasMore && (
        <button
          onClick={loadMore}
          disabled={isLoading}
          style={{ marginTop:4, padding:"6px 14px", borderRadius:99, border:"1px solid var(--border-medium)", background:"transparent", color:"var(--text-muted)", fontSize:12, cursor:"pointer", transition:"background 150ms" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          {isLoading ? "Loading…" : "Load more replies"}
        </button>
      )}
    </div>
  );
}

function CommentItem({
  comment, delay, isOwn, onDelete,
}: {
  comment: Comment;
  delay: number;
  isOwn: boolean;
  onDelete: () => void;
}) {
  const inits = `${comment.User.firstName[0]}${comment.User.lastName[0]}`.toUpperCase();
  const ts    = formatRelativeTime(comment.createdAt);

  return (
    <div style={{ display:"flex", gap:9, alignItems:"flex-start", marginBottom:10, animation:"fadeUp 200ms ease both", animationDelay:`${delay}ms` }}>
      <div className="avatar" style={{ width:30, height:30, fontSize:11, flexShrink:0 }}>
        {comment.User.profilePicture
          ? <img src={comment.User.profilePicture} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          : <span className="avatar-initials">{inits}</span>
        }
      </div>
      <div style={{ background:"var(--bg-elevated)", borderRadius:"0 var(--radius-md) var(--radius-md) var(--radius-md)", padding:"10px 13px", flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
          <span style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)" }}>
            {comment.User.firstName} {comment.User.lastName}
          </span>
          <span style={{ fontSize:11, color:"var(--text-muted)" }}>{ts}</span>
          {isOwn && (
            <button
              onClick={onDelete}
              style={{ marginLeft:"auto", fontSize:11, color:"var(--danger)", border:"none", background:"transparent", cursor:"pointer", opacity:.7 }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => (e.currentTarget.style.opacity = ".7")}
              aria-label="Delete comment"
            >
              Delete
            </button>
          )}
        </div>
        <p style={{ fontSize:13, lineHeight:1.5, color:"var(--text-secondary)", margin:0 }}>{comment.content}</p>
      </div>
    </div>
  );
}

function CommentSkeleton() {
  return (
    <>{[0,1].map(i => (
      <div key={i} style={{ display:"flex", gap:9, marginBottom:10 }}>
        <div className="skeleton" style={{ width:30, height:30, borderRadius:"50%", flexShrink:0 }} />
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:7 }}>
          <div className="skeleton" style={{ width:"35%", height:10, borderRadius:5 }} />
          <div className="skeleton" style={{ width:"80%", height:10, borderRadius:5 }} />
        </div>
      </div>
    ))}</>
  );
}

function formatRelativeTime(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60)    return `${s}s`;
  if (s < 3600)  return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}
