// src/hooks/useSrcHours.ts
// ─────────────────────────────────────────────────────────────────────────────
// Real CSUN SRC building hours for Spring 2026 (Jan 20 – May 10).
// Source: https://www.csun.edu/src/hours
//
// BACKEND: Replace the static HOLIDAY_CLOSURES array and season dates when
// a new semester starts. Ideally fetch from /api/src/hours which scrapes or
// caches the official CSUN hours page, so no code changes are needed per
// semester.
// ─────────────────────────────────────────────────────────────────────────────

export type SrcStatus = {
  isOpen: boolean;
  label: string;          // e.g. "Open until 10 PM"  |  "Closed · Opens Mon 6 AM"
  nextEvent: string;      // short text for badge
  color: "green" | "red" | "yellow";
};

// ── Spring 2026 building hours (Mon-Fri 6–22, Sat-Sun 9–17) ──────────────────
const WEEKDAY_OPEN  = 6;   // 6:00 AM
const WEEKDAY_CLOSE = 22;  // 10:00 PM
const WEEKEND_OPEN  = 9;   // 9:00 AM
const WEEKEND_CLOSE = 17;  // 5:00 PM

// ── Holiday / special closures (stored as YYYY-MM-DD strings) ────────────────
// BACKEND: keep this in sync with https://www.csun.edu/src/hours
const HOLIDAY_CLOSURES: string[] = [
  // Spring 2026 closures
  "2026-03-31", // Cesar Chavez Day
  // Add more as announced
];

// Full closure ranges
const CLOSURE_RANGES: Array<{ start: string; end: string; label: string }> = [
  { start: "2025-12-22", end: "2026-01-03", label: "Winter Closure" },
  { start: "2026-01-12", end: "2026-01-19", label: "Maintenance Closure" },
];

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function fmtHour(h: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display} ${period}`;
}

function dayName(dow: number): string {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dow];
}

function isClosureDay(d: Date): string | null {
  const ds = toDateStr(d);
  if (HOLIDAY_CLOSURES.includes(ds)) return "Holiday";
  for (const r of CLOSURE_RANGES) {
    if (ds >= r.start && ds <= r.end) return r.label;
  }
  return null;
}

function getHoursForDay(d: Date): { open: number; close: number } | null {
  if (isClosureDay(d)) return null;
  const dow = d.getDay(); // 0=Sun, 6=Sat
  if (dow === 0 || dow === 6) return { open: WEEKEND_OPEN, close: WEEKEND_CLOSE };
  return { open: WEEKDAY_OPEN, close: WEEKDAY_CLOSE };
}

export function getSrcStatus(now: Date = new Date()): SrcStatus {
  const hours = getHoursForDay(now);
  const currentHour = now.getHours() + now.getMinutes() / 60;

  if (hours && currentHour >= hours.open && currentHour < hours.close) {
    const closingSoon = currentHour >= hours.close - 1;
    return {
      isOpen: true,
      label: `Open until ${fmtHour(hours.close)}`,
      nextEvent: `Closes at ${fmtHour(hours.close)}`,
      color: closingSoon ? "yellow" : "green",
    };
  }

  // Find next open day (look ahead up to 7 days)
  for (let i = 1; i <= 7; i++) {
    const next = new Date(now);
    next.setDate(now.getDate() + i);
    next.setHours(0, 0, 0, 0);
    const nextHours = getHoursForDay(next);
    if (nextHours) {
      const label =
        i === 1
          ? `Opens tomorrow at ${fmtHour(nextHours.open)}`
          : `Opens ${dayName(next.getDay())} at ${fmtHour(nextHours.open)}`;
      return {
        isOpen: false,
        label,
        nextEvent: label,
        color: "red",
      };
    }
  }

  return {
    isOpen: false,
    label: "Closed for extended break",
    nextEvent: "Check csun.edu/src/hours",
    color: "red",
  };
}

// React hook — re-evaluates every minute
import * as React from "react";

export function useSrcStatus(): SrcStatus {
  const [status, setStatus] = React.useState<SrcStatus>(() => getSrcStatus());

  React.useEffect(() => {
    const update = () => setStatus(getSrcStatus());
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return status;
}
