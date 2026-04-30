// =============================================================================
// utils/feed.api.ts
// Typed API client for the social feed.
// Wraps /api/v1/posts routes — no fetch() calls inside components.
// No schema/backend changes — purely adapts existing routes.
// =============================================================================

import type {
  FeedResponse,
  CommentsResponse,
  Post,
  Comment,
} from "../types/feed.types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const API  = `${BASE}/api/v1/posts`;

/** Shared fetch wrapper — attaches JWT from localStorage, throws on non-2xx */
async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("mc_token") : null;
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string })?.error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Feed ─────────────────────────────────────────────────────────────────────

export function getFeed(cursor?: string | null, limit = 20): Promise<FeedResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  return req<FeedResponse>(`/?${params}`);
}

// ── Posts CRUD ────────────────────────────────────────────────────────────────

export function createPost(content: string, images: string[] = []): Promise<{ success: boolean; post: Post }> {
  return req("", { method: "POST", body: JSON.stringify({ content, images }) });
}

export function deletePost(id: string): Promise<{ success: boolean }> {
  return req(`/${id}`, { method: "DELETE" });
}

// ── Likes ─────────────────────────────────────────────────────────────────────

export function likePost(id: string): Promise<{ liked: true; likeCount: number }> {
  return req(`/${id}/like`, { method: "POST" });
}

export function unlikePost(id: string): Promise<{ liked: false; likeCount: number }> {
  return req(`/${id}/like`, { method: "DELETE" });
}

// ── Comments ─────────────────────────────────────────────────────────────────

export function getComments(postId: string, cursor?: string | null, limit = 20): Promise<CommentsResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  return req<CommentsResponse>(`/${postId}/comments?${params}`);
}

export function createComment(postId: string, content: string): Promise<{ success: boolean; comment: Comment }> {
  return req(`/${postId}/comments`, { method: "POST", body: JSON.stringify({ content }) });
}

export function deleteComment(commentId: string): Promise<{ success: boolean }> {
  return req(`/comments/${commentId}`, { method: "DELETE" });
}

// ── Reposts ───────────────────────────────────────────────────────────────────

export function repost(postId: string, repostComment?: string): Promise<{ success: boolean; post: Post }> {
  return req(`/${postId}/repost`, { method: "POST", body: JSON.stringify({ repostComment }) });
}

export function deleteRepost(postId: string): Promise<{ success: boolean }> {
  return req(`/${postId}/repost`, { method: "DELETE" });
}

// ── User posts ────────────────────────────────────────────────────────────────

export function getUserPosts(userId: string, cursor?: string | null, limit = 20): Promise<FeedResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  return req<FeedResponse>(`/user/${userId}?${params}`);
}

// ── Image upload ──────────────────────────────────────────────────────────────

export async function uploadImage(file: File): Promise<string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("mc_token") : null;
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json() as { url: string };
  return data.url;
}
