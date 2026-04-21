// API client for the announcement endpoints.
// Mirrors the routes in campus-connect-server/src/modules/announcement/announcement.routes.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type AnnouncementSeverity = "CRITICAL_RED" | "CRITICAL_BLUE" | "ALL_CLEAR_GREEN";
export type AnnouncementChannel = "BANNER" | "PUSH" | "EMAIL" | "SMS";
export type AnnouncementDeliveryStatus =
  | "PENDING"
  | "SENT"
  | "DELIVERED"
  | "FAILED"
  | "PERMANENT_FAIL"
  | "SKIPPED";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  type: string;
  severity: AnnouncementSeverity | null;
  channels: AnnouncementChannel[];
  location: string | null;
  testMode: boolean;
  isActive: boolean;
  audience: string;
  parentAnnouncementId: string | null;
  bannerBroadcastAt: string | null;
  expiresAt: string | null;
  endedAt: string | null;
  endedById: string | null;
  endReason: string | null;
  startsAt: string;
  endsAt: string | null;
  authorId: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  endedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  parentAnnouncement?: {
    id: string;
    severity: AnnouncementSeverity | null;
    createdAt: string;
  } | null;
  childAnnouncements?: Array<{
    id: string;
    severity: AnnouncementSeverity | null;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  dismissedForUser?: boolean;
}

export interface DeliveryStats {
  [channel: string]: {
    [status: string]: number;
  };
}

export interface TimelineNode {
  id: string;
  severity: AnnouncementSeverity | null;
  title: string;
  createdAt: string;
  parentAnnouncementId: string | null;
  endedAt: string | null;
}

export interface ListResponse {
  announcements: Announcement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Get JWT from localStorage — adjust the key if your auth stores it elsewhere
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const authHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Throw if response isn't 2xx — caller catches
const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    let errorBody: { error?: string; message?: string } = {};
    try {
      errorBody = await res.json();
    } catch {
      // not JSON, move on
    }
    const err = new Error(errorBody.message || `Request failed (${res.status})`);
    (err as any).status = res.status;
    (err as any).errorCode = errorBody.error;
    throw err;
  }
  return res.json();
};

// Read endpoints

export const getActiveAnnouncement = async (): Promise<{ active: Announcement | null }> => {
  const res = await fetch(`${API_BASE}/api/v1/announcements/active`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const listAnnouncements = async (
  filter: "active" | "history" | "all" = "all",
  page: number = 1,
  limit: number = 20,
): Promise<ListResponse> => {
  const params = new URLSearchParams({ filter, page: String(page), limit: String(limit) });
  const res = await fetch(`${API_BASE}/api/v1/announcements?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const getAnnouncementDetail = async (id: string): Promise<Announcement> => {
  const res = await fetch(`${API_BASE}/api/v1/announcements/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const getAnnouncementTimeline = async (id: string): Promise<{ timeline: TimelineNode[] }> => {
  const res = await fetch(`${API_BASE}/api/v1/announcements/${id}/timeline`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const getDeliveryStats = async (id: string): Promise<{ stats: DeliveryStats }> => {
  const res = await fetch(`${API_BASE}/api/v1/announcements/${id}/stats`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

// Write endpoints

export interface CreateCriticalPayload {
  title: string;
  body: string;
  location?: string | null;
  channels: AnnouncementChannel[];
  testMode: boolean;
  confirmation: string;
}

export const createCriticalAnnouncement = async (
  payload: CreateCriticalPayload,
): Promise<Announcement> => {
  const res = await fetch(`${API_BASE}/api/v1/announcements/critical`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export interface TransitionPayload {
  targetSeverity: AnnouncementSeverity;
  title: string;
  body: string;
  channels: AnnouncementChannel[];
  expiresInMinutes?: number | null;
}

export const transitionAnnouncement = async (
  id: string,
  payload: TransitionPayload,
): Promise<Announcement> => {
  const res = await fetch(`${API_BASE}/api/v1/announcements/${id}/transition`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const endAnnouncement = async (id: string, reason?: string): Promise<Announcement> => {
  const res = await fetch(`${API_BASE}/api/v1/announcements/${id}/end`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ reason }),
  });
  return handleResponse(res);
};

export const dismissAnnouncement = async (id: string): Promise<{ success: true }> => {
  const res = await fetch(`${API_BASE}/api/v1/announcements/${id}/dismiss`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse(res);
};

// Hardcoded whitelist — kept in sync with server.
// TODO: move to a permission check once we land the RBAC hierarchy
export const CRITICAL_SEND_WHITELIST = [
  "ivan.juarez.531@my.csun.edu",
  "test@my.csun.edu",
];

export const canSendCritical = (email: string | undefined | null): boolean => {
  if (!email) return false;
  return CRITICAL_SEND_WHITELIST.includes(email.toLowerCase());
};