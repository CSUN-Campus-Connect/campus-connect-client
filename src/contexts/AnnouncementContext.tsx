"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import {
  getActiveAnnouncement,
  dismissAnnouncement,
  type Announcement,
} from "@/lib/announcement.api";

// Socket events — must match the server's SOCKET_EVENTS constant
const EVENT_CREATED = "announcement:created";
const EVENT_TRANSITIONED = "announcement:transitioned";
const EVENT_ENDED = "announcement:ended";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AnnouncementContextValue {
  activeAnnouncement: Announcement | null;
  loading: boolean;
  dismiss: () => Promise<void>;
  dismissed: boolean;
}

const AnnouncementContext = createContext<AnnouncementContextValue | null>(null);

export const useAnnouncement = (): AnnouncementContextValue => {
  const ctx = useContext(AnnouncementContext);
  if (!ctx) throw new Error("useAnnouncement must be used inside AnnouncementProvider");
  return ctx;
};

// Grab the token the same way messaging does
const getToken = (): string | null => {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
};

export function AnnouncementProvider({ children }: { children: React.ReactNode }) {
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  // Fetch the active alert on mount — for EVERYONE, authenticated or not.
  // The /active endpoint is intentionally public so guests on the landing
  // page also see emergency banners.
  useEffect(() => {
    let cancelled = false;

    getActiveAnnouncement()
      .then((res) => {
        if (cancelled) return;
        setActiveAnnouncement(res.active);
        setDismissed(res.active?.dismissedForUser ?? false);
      })
      .catch(() => {
        // Silently ignore — no active alert or network hiccup
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Open a socket connection for real-time updates (only when authenticated,
  // since the socket namespace requires a JWT). Guests get the initial alert
  // via /active but won't see real-time transitions without a page refresh.
 useEffect(() => {
    const token = getToken();

    // Authenticated users: real-time socket (sub-second updates)
    if (token) {
      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
      });
      socketRef.current = socket;

      socket.on("connect_error", (err) => {
        console.warn("Announcement socket connect error:", err.message);
      });

      socket.on(EVENT_CREATED, (announcement: Announcement) => {
        setActiveAnnouncement(announcement);
        setDismissed(false);
      });

      socket.on(EVENT_TRANSITIONED, (announcement: Announcement) => {
        setActiveAnnouncement(announcement);
        setDismissed(false);
      });

      socket.on(EVENT_ENDED, () => {
        setActiveAnnouncement(null);
        setDismissed(false);
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }

    // Guests: poll /active every 30s for near-real-time updates.
    // Trade-off: 30s delay vs. no infrastructure for anonymous sockets.
    const poll = async () => {
      try {
        const res = await getActiveAnnouncement();
        setActiveAnnouncement((prev) => {
          // Only update if the active ID changed (avoid spurious re-renders)
          if (prev?.id === res.active?.id) return prev;
          return res.active;
        });
        setDismissed(res.active?.dismissedForUser ?? false);
      } catch {
        // Network hiccup — try again next tick
      }
    };

    const pollTimer = setInterval(poll, 30_000);
    return () => clearInterval(pollTimer);
  }, []);

  // Auto-clear expired GREEN alerts client-side (server also expires them,
  // but this catches the edge case where the banner outlives its expiresAt)
  useEffect(() => {
    if (!activeAnnouncement?.expiresAt) return;
    const expiresAt = new Date(activeAnnouncement.expiresAt).getTime();
    const msUntilExpiry = expiresAt - Date.now();
    if (msUntilExpiry <= 0) {
      setActiveAnnouncement(null);
      return;
    }
    const timer = setTimeout(() => {
      setActiveAnnouncement(null);
    }, msUntilExpiry);
    return () => clearTimeout(timer);
  }, [activeAnnouncement?.id, activeAnnouncement?.expiresAt]);

  const dismiss = useCallback(async () => {
    if (!activeAnnouncement) return;
    setDismissed(true); // Optimistic — hide right away
    try {
      await dismissAnnouncement(activeAnnouncement.id);
    } catch (err) {
      // Dismissal requires auth — for guests this will fail silently,
      // and the banner will re-appear on next page load (acceptable for MVP).
      // For logged-in users, revert if the call genuinely failed.
      const token = getToken();
      if (token) {
        setDismissed(false);
        console.error("Failed to dismiss announcement:", err);
      }
      // Guests: leave dismissed=true locally, accept that refresh shows it again
    }
  }, [activeAnnouncement]);

  return (
    <AnnouncementContext.Provider value={{ activeAnnouncement, loading, dismiss, dismissed }}>
      {children}
    </AnnouncementContext.Provider>
  );
}