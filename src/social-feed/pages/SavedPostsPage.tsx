// =============================================================================
// pages/SavedPostsPage.tsx
// Shows all posts the current user has bookmarked.
// =============================================================================

import type { Post } from "../types/feed.types";
import { PostCard } from "../components/PostCard";

interface SavedPostsPageProps {
  posts: Post[];
  savedPostIds: Set<string>;
  currentUserId: string;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onDelete: (id: string) => void;
  onRepost: (id: string, comment?: string) => void;
  onViewProfile?: (userId: string) => void;
}

export default function SavedPostsPage({
  posts, savedPostIds, currentUserId, onLike, onSave, onDelete, onRepost, onViewProfile,
}: SavedPostsPageProps) {
  const saved = posts.filter(p => savedPostIds.has(p.id));

  if (!saved.length) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", textAlign:"center", padding:"40px 20px", animation:"fadeUp 240ms ease both" }}>
        <svg aria-hidden="true" width="52" height="52" fill="none" stroke="var(--text-muted)" strokeWidth="1.3" viewBox="0 0 24 24" style={{ marginBottom:16, opacity:0.5 }}>
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        <div style={{ fontFamily:"var(--font-display)", fontSize:17, fontWeight:700, color:"var(--text-primary)", marginBottom:6 }}>Nothing saved yet</div>
        <div style={{ fontSize:13, color:"var(--text-muted)", maxWidth:260, lineHeight:1.6 }}>
          Tap the bookmark icon on any post to save it here for later.
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeUp 240ms ease both" }}>
      <div style={{ padding:"10px 20px 4px", fontSize:12, color:"var(--text-muted)", borderBottom:"1px solid var(--border-subtle)" }}>
        {saved.length} saved {saved.length === 1 ? "post" : "posts"}
      </div>
      {saved.map((post, i) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          isSaved={true}
          onLike={onLike}
          onSave={onSave}
          onDelete={onDelete}
          onRepost={onRepost}
          onViewProfile={onViewProfile}
          style={{ animationDelay: `${i * 40}ms` }}
        />
      ))}
    </div>
  );
}

