// =============================================================================
// api/posts.ts
//
// Typed API client for /api/v1/posts — mirrors posts.routes.ts exactly.
// All fetch calls go through here. No fetch() calls inside components.
//
// Base URL reads from NEXT_PUBLIC_API_URL env var (set in .env.local):
//   NEXT_PUBLIC_API_URL=http://localhost:3001
// =============================================================================

import type {
  FeedResponse,
  CommentsResponse,
  Post,
  Comment,
} from '../types';

// Next.js uses NEXT_PUBLIC_ prefix for client-side env vars (not VITE_API_URL)
const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const API  = `${BASE}/api/v1/posts`;

/** Shared fetch wrapper — attaches JWT from localStorage, throws on non-2xx */
async function req<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('mc_token');

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Feed ─────────────────────────────────────────────────────────────────────

/** GET /api/v1/posts — paginated feed */
export function getFeed(cursor?: string, limit = 20): Promise<FeedResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  return req<FeedResponse>(`/?${params}`);
}

// ─── Post CRUD ────────────────────────────────────────────────────────────────

/** POST /api/v1/posts — create post (images are upload URLs, not File objects) */
export function createPost(content: string, images: string[] = []): Promise<{ success: boolean; post: Post }> {
  return req('/', {
    method: 'POST',
    body: JSON.stringify({ content, images }),
  });
}

/** DELETE /api/v1/posts/:id */
export function deletePost(id: string): Promise<{ success: boolean }> {
  return req(`/${id}`, { method: 'DELETE' });
}

// ─── Likes ────────────────────────────────────────────────────────────────────

/** POST /api/v1/posts/:id/like */
export function likePost(id: string): Promise<{ liked: true; likeCount: number }> {
  return req(`/${id}/like`, { method: 'POST' });
}

/** DELETE /api/v1/posts/:id/like */
export function unlikePost(id: string): Promise<{ liked: false; likeCount: number }> {
  return req(`/${id}/like`, { method: 'DELETE' });
}

// ─── Comments ─────────────────────────────────────────────────────────────────

/** GET /api/v1/posts/:id/comments */
export function getComments(postId: string, cursor?: string, limit = 20): Promise<CommentsResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  return req<CommentsResponse>(`/${postId}/comments?${params}`);
}

/** POST /api/v1/posts/:id/comments */
export function createComment(postId: string, content: string): Promise<{ success: boolean; comment: Comment }> {
  return req(`/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

/** DELETE /api/v1/posts/comments/:commentId */
export function deleteComment(commentId: string): Promise<{ success: boolean }> {
  return req(`/comments/${commentId}`, { method: 'DELETE' });
}

// ─── Reposts ──────────────────────────────────────────────────────────────────

/** POST /api/v1/posts/:id/repost */
export function repost(postId: string, repostComment?: string): Promise<{ success: boolean; post: Post }> {
  return req(`/${postId}/repost`, {
    method: 'POST',
    body: JSON.stringify({ repostComment }),
  });
}

/** DELETE /api/v1/posts/:id/repost */
export function deleteRepost(postId: string): Promise<{ success: boolean }> {
  return req(`/${postId}/repost`, { method: 'DELETE' });
}

// ─── User posts (profile page) ────────────────────────────────────────────────

/** GET /api/v1/posts/user/:userId */
export function getUserPosts(userId: string, cursor?: string, limit = 20): Promise<FeedResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  return req<FeedResponse>(`/user/${userId}?${params}`);
}

// ─── Image upload (multipart — goes to your file storage endpoint) ────────────

/**
 * Uploads an image file and returns the stored URL string.
 * Expects your backend to have POST /api/v1/upload returning { url: string }.
 * Adjust the path if your upload route differs.
 */
export async function uploadImage(file: File): Promise<string> {
  const token = localStorage.getItem('mc_token');
  const form = new FormData();
  form.append('image', file);

  const res = await fetch(`${BASE}/api/v1/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  if (!res.ok) throw new Error('Image upload failed');
  const data = await res.json();
  return data.url as string;
}
