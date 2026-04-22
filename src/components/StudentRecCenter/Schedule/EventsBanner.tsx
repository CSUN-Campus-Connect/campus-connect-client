"use client";

// ══════════════════════════════════
// BACKEND INTEGRATION — EventsBanner
// ══════════════════════════════════
//
// DATA SOURCE:
//   Currently imports SRC_EVENTS from the static mock in icsData.ts.
//   Replace with a live SWR hook once /api/src-events is implemented:
//
//   import useSWR from "swr";
//   const fetcher = (url: string) => fetch(url).then((r) => r.json());
//
//   // Inside the component:
//   const { data: allEvents = [], isLoading } = useSWR<CalEvent[]>(
//     "/api/src-events",
//     fetcher,
//     { refreshInterval: 60 * 60 * 1000 }   // re-poll every hour (matches ICS TTL)
//   );
//   // Then replace SRC_EVENTS with allEvents everywhere below.
//
// "ADD TO EVENTS" — handleAdd():
//   POST /api/user-events
//   Auth: require active session (student must be signed in)
//   Body: {
//     eventUid:    string,    // CalEvent.uid — stable ICS identifier
//     summary:     string,
//     dtstart:     string,    // ISO-8601
//     dtend:       string,
//     location:    string,
//     url:         string,
//   }
//   On success → 201 { userEventId }
//   On duplicate (same user + eventUid) → 409 — show "Already saved" state
//
//   Supabase table suggestion:
//     user_saved_events (
//       id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//       user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
//       event_uid    TEXT,
//       summary      TEXT,
//       dtstart      TIMESTAMPTZ,
//       dtend        TIMESTAMPTZ,
//       saved_at     TIMESTAMPTZ DEFAULT NOW(),
//       UNIQUE (user_id, event_uid)
//     )
// ═══════════════════════════════════════════════════════════════════════

import * as React from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { Box, Typography, Chip, Button, Snackbar, Alert, Tooltip } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { SRC_EVENTS, CalEvent } from "./icsData";

dayjs.extend(isBetween);

const RED = "#A80532";

function isActive(event: CalEvent): boolean {
  const now = dayjs();
  const start = dayjs(event.dtstart);
  const end = dayjs(event.dtend);
  return now.isBetween(start, end, "day", "[]");
}

export default function EventsBanner() {
  const [added, setAdded] = React.useState<Set<string>>(new Set());
  const [toast, setToast] = React.useState<string | null>(null);

  const activeEvents = SRC_EVENTS.filter(isActive);
  const upcomingEvents = SRC_EVENTS.filter((e) => dayjs(e.dtstart).isAfter(dayjs()));
  const displayEvents = [
    ...activeEvents,
    ...upcomingEvents.filter((e) => !activeEvents.includes(e)),
  ];

  async function handleAdd(event: CalEvent) {
    // BACKEND: Replace optimistic update below with real API call:
    //   const res = await fetch("/api/user-events", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       eventUid: event.uid,
    //       summary:  event.summary,
    //       dtstart:  event.dtstart,
    //       dtend:    event.dtend,
    //       location: event.location,
    //       url:      event.url,
    //     }),
    //   });
    //   if (res.status === 409) { setToast("Already saved!"); return; }
    //   if (!res.ok) { setToast("Something went wrong — try again."); return; }
    setAdded((prev) => new Set(prev).add(event.uid));
    setToast(`"${event.summary}" added to your events!`);
  }

  if (displayEvents.length === 0) return null;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <CalendarMonthIcon aria-hidden="true" sx={{ fontSize: 18, color: "rgba(255,255,255,0.7)" }} />
        <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "1rem" }}>
          Upcoming SRC Events
        </Typography>
        <Chip
          label={`${displayEvents.length} events`}
          size="small"
          sx={{
            fontSize: 10, height: 20, fontWeight: 700,
            bgcolor: "rgba(255,255,255,0.15)", color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)",
            "& .MuiChip-label": { px: 1 },
          }}
        />
      </Box>

      {/* Scrollable row */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          overflowX: "auto",
          pb: 1.5,
          // Thicker solid white scrollbar
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-track": {
            bgcolor: "rgba(255,255,255,0.15)",
            borderRadius: 99,
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#fff",
            borderRadius: 99,
          },
          scrollbarWidth: "thin",
          scrollbarColor: "#fff rgba(255,255,255,0.15)",
        }}
      >
        {displayEvents.map((event) => {
          const active = isActive(event);
          const wasAdded = added.has(event.uid);
          const start = dayjs(event.dtstart);
          const end = dayjs(event.dtend);
          const dateLabel = event.allDay
            ? start.format("MMM D") +
              (end.diff(start, "day") > 1
                ? ` – ${end.subtract(1, "day").format("MMM D")}`
                : "")
            : start.format("MMM D · h:mma");

          return (
            <Box
              key={event.uid}
              sx={{
                flexShrink: 0,
                width: 260,
                borderRadius: 3,
                bgcolor: active ? "#7a01217e" : "#a00e37b7",
                border: active
                  ? "1.5px solid rgba(255,255,255,0.35)"
                  : "1.5px solid rgba(255,255,255,0.15)",
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: active ? "#8f0129" : "#6e0020",
                  border: "1.5px solid rgba(255,255,255,0.5)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                },
              }}
            >
              {/* Date + active badge */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography
                  sx={{
                    fontSize: 11, fontWeight: 700,
                    color: "rgba(255,255,255,0.75)",
                    letterSpacing: 0.3,
                  }}
                >
                  {dateLabel}
                </Typography>
                {active && (
                  <Chip
                    label="● Active"
                    size="small"
                    sx={{
                      fontSize: 9, height: 18, fontWeight: 800, letterSpacing: 0.5,
                      bgcolor: "rgba(34,197,94,0.25)", color: "#86efac",
                      border: "1px solid rgba(34,197,94,0.5)",
                      "& .MuiChip-label": { px: 0.75 },
                      animation: "pulse 2s infinite",
                      "@keyframes pulse": {
                        "0%,100%": { opacity: 1 },
                        "50%": { opacity: 0.6 },
                      },
                    }}
                  />
                )}
              </Box>

              {/* Title */}
              <Typography
                sx={{
                  fontWeight: 800, color: "#fff",
                  fontSize: "0.88rem", lineHeight: 1.3,
                }}
              >
                {event.summary}
              </Typography>

              {/* Description */}
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.75)",
                  lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {event.description}
              </Typography>

              {/* Actions */}
              <Box sx={{ display: "flex", gap: 0.75, mt: "auto", pt: 0.5 }}>
                <Button
                  size="small"
                  variant="contained"
                  disabled={wasAdded}
                  startIcon={<AddCircleOutlineIcon aria-hidden="true" sx={{ fontSize: "12px !important" }} />}
                  onClick={() => handleAdd(event)}
                  sx={{
                    bgcolor: wasAdded ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.2)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 999,
                    px: 1.25,
                    py: 0.4,
                    textTransform: "none",
                    flexShrink: 0,
                    border: "1px solid rgba(255,255,255,0.3)",
                    backdropFilter: "blur(4px)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.32)" },
                    "&.Mui-disabled": {
                      bgcolor: "rgba(34,197,94,0.2)",
                      color: "#86efac",
                      border: "1px solid rgba(34,197,94,0.35)",
                    },
                  }}
                >
                  {wasAdded ? "Added ✓" : "Add to Events"}
                </Button>
                <Tooltip title="View on CSUN News" placement="top">
                  <Button
                    size="small"
                    component="a"
                    href={event.url}
                    target="_blank"
                    rel="noopener"
                    aria-label={`View ${event.summary} on CSUN News (opens in new tab)`}
                    sx={{
                      minWidth: 0, px: 1,
                      color: "rgba(255,255,255,0.7)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      borderRadius: 999,
                      "&:hover": {
                        color: "#fff",
                        bgcolor: "rgba(255,255,255,0.15)",
                        border: "1px solid rgba(255,255,255,0.5)",
                      },
                    }}
                  >
                    <OpenInNewIcon aria-hidden="true" sx={{ fontSize: 13 }} />
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)}>
        <Alert severity="success" sx={{ width: "100%" }}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
}
