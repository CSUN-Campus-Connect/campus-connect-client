"use client";

import * as React from "react";
import useSWR from "swr";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import {
  Box, Typography, Chip, Button, Snackbar, Alert, Tooltip,
  Skeleton,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PoolIcon from "@mui/icons-material/Pool";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import SportsMartialArtsIcon from "@mui/icons-material/SportsMartialArts";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import CelebrationIcon from "@mui/icons-material/Celebration";

dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export type CalEvent = {
  uid: string;
  summary: string;
  description: string;
  location: string;
  dtstart: string | null;
  dtend: string | null;
  url: string;
  imageUrl?: string | null;
  allDay: boolean;
  categories: string[];
};

type CatKey = "aquatics" | "cardio" | "hiit" | "intramural" | "outdoor" | "special" | "other";

const CAT_STYLE: Record<CatKey, { bg: string; border: string; icon: React.ReactNode }> = {
  aquatics: { bg: "rgba(21,142,212,0.75)", border: "rgba(170,225,235,0.5)", icon: <PoolIcon sx={{ fontSize: 14 }} /> },
  cardio: { bg: "rgba(95,202,113,0.75)", border: "rgba(205,245,205,0.5)", icon: <FitnessCenterIcon sx={{ fontSize: 14 }} /> },
  hiit: { bg: "rgba(253,110,44,0.75)", border: "rgba(235,197,169,0.5)", icon: <SportsMartialArtsIcon sx={{ fontSize: 14 }} /> },
  intramural: { bg: "rgba(219,177,38,0.80)", border: "rgba(245,218,139,0.5)", icon: <SportsSoccerIcon sx={{ fontSize: 14 }} /> },
  outdoor: { bg: "rgba(46,160,67,0.78)", border: "rgba(160,220,160,0.5)", icon: <SelfImprovementIcon sx={{ fontSize: 14 }} /> },
  special: { bg: "rgba(162,98,218,0.78)", border: "rgba(203,161,241,0.5)", icon: <CelebrationIcon sx={{ fontSize: 14 }} /> },
  other: { bg: "rgba(160,14,55,0.75)", border: "rgba(255,255,255,0.2)", icon: <CalendarMonthIcon sx={{ fontSize: 14 }} /> },
};

function inferCatKey(event: CalEvent): CatKey {
  const h = `${event.summary} ${event.categories.join(" ")}`.toLowerCase();
  if (/swim|pool|aquatic|water/.test(h)) return "aquatics";
  if (/intramural|basketball|volleyball|soccer|frisbee|softball|flag football|night hits/.test(h)) return "intramural";
  if (/boxing|hiit|kickbox|bag work/.test(h)) return "hiit";
  if (/outdoor|rock wall|climb|hike|kayak|surf/.test(h)) return "outdoor";
  if (/cpr|first.?aid|aed|certification|membership|locker|special|orientation|expo|open house/.test(h)) return "special";
  if (/yoga|zumba|cardio|pilates|barre|fitness|cycle|spin|aerobic/.test(h)) return "cardio";
  return "other";
}

const fetcher = async (url: string): Promise<CalEvent[]> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.json();
};

function getEventBounds(event: CalEvent) {
  if (!event.dtstart) return null;

  const start = dayjs(event.dtstart);
  if (!event.dtend) {
    return {
      start,
      end: event.allDay ? start.endOf("day") : start.add(1, "hour"),
    };
  }

  const rawEnd = dayjs(event.dtend);
  return {
    start,
    end: event.allDay ? rawEnd.subtract(1, "millisecond") : rawEnd,
  };
}

function isOngoing(event: CalEvent): boolean {
  const bounds = getEventBounds(event);
  if (!bounds) return false;
  const now = dayjs();
  return now.isSameOrAfter(bounds.start) && now.isSameOrBefore(bounds.end);
}

function dateLabel(event: CalEvent): string {
  if (!event.dtstart) return "Ongoing";

  const start = dayjs(event.dtstart);

  if (event.allDay) {
    if (!event.dtend) return start.format("MMM D");
    const end = dayjs(event.dtend).subtract(1, "day");
    if (end.isSame(start, "day")) return start.format("MMM D");
    if (end.isSame(start, "month")) return `${start.format("MMM D")}–${end.format("D")}`;
    return `${start.format("MMM D")} – ${end.format("MMM D")}`;
  }

  return start.format("MMM D · h:mma");
}

export default function EventsBanner() {
  const [added, setAdded] = React.useState<Set<string>>(new Set());
  const [toast, setToast] = React.useState<string | null>(null);

  const { data: allEvents = [], isLoading, error } = useSWR<CalEvent[]>(
    "/api/src-events",
    fetcher,
    {
      refreshInterval: 60 * 60 * 1000,
      revalidateOnFocus: true,
      revalidateIfStale: true,
      keepPreviousData: true,
    }
  );

  const displayEvents = React.useMemo(() => {
    const sorted = [...allEvents].sort((a, b) => {
      const aOngoing = isOngoing(a) ? 1 : 0;
      const bOngoing = isOngoing(b) ? 1 : 0;
      if (aOngoing !== bOngoing) return bOngoing - aOngoing;

      const at = a.dtstart ? dayjs(a.dtstart).valueOf() : 0;
      const bt = b.dtstart ? dayjs(b.dtstart).valueOf() : 0;
      return at - bt;
    });

    return sorted;
  }, [allEvents]);

  async function handleAdd(event: CalEvent) {
    setAdded((prev) => new Set(prev).add(event.uid));
    setToast(`"${event.summary}" added to your events!`);

    try {
      const res = await fetch("/api/user-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventUid: event.uid,
          summary: event.summary,
          dtstart: event.dtstart,
          dtend: event.dtend,
          location: event.location,
          url: event.url,
        }),
      });
      if (res.status === 409) {
        setToast("Already saved!");
        return;
      }
      if (!res.ok) {
        setAdded((prev) => {
          const s = new Set(prev);
          s.delete(event.uid);
          return s;
        });
        setToast("Something went wrong. Try again.");
      }
    } catch {
      setAdded((prev) => {
        const s = new Set(prev);
        s.delete(event.uid);
        return s;
      });
      setToast("Something went wrong. Try again.");
    }
  }

  if (isLoading && displayEvents.length === 0) {
    return (
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <CalendarMonthIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.7)" }} />
          <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "1rem" }}>
            SRC Events
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width={260}
              height={160}
              sx={{ borderRadius: 3, flexShrink: 0, bgcolor: "rgba(255,255,255,0.08)" }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  if (error || displayEvents.length === 0) return null;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
        <CalendarMonthIcon aria-hidden="true" sx={{ fontSize: 18, color: "rgba(255,255,255,0.7)" }} />
        <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "1rem" }}>
          SRC Events
        </Typography>
        <Chip
          label={`${displayEvents.length} events`}
          size="small"
          sx={{
            fontSize: 10,
            height: 20,
            fontWeight: 700,
            bgcolor: "rgba(255,255,255,0.15)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)",
            "& .MuiChip-label": { px: 1 },
          }}
        />
        <Chip
          label={`${displayEvents.filter(isOngoing).length} ongoing`}
          size="small"
          sx={{
            fontSize: 10,
            height: 20,
            fontWeight: 700,
            bgcolor: "rgba(34,197,94,0.18)",
            color: "#86efac",
            border: "1px solid rgba(134,239,172,0.35)",
            "& .MuiChip-label": { px: 1 },
          }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          overflowX: "auto",
          pb: 1.5,
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-track": { bgcolor: "rgba(255,255,255,0.15)", borderRadius: 99 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "#fff", borderRadius: 99 },
          scrollbarWidth: "thin",
          scrollbarColor: "#fff rgba(255,255,255,0.15)",
        }}
      >
        {displayEvents.map((event) => {
          const active = isOngoing(event);
          const wasAdded = added.has(event.uid);
          const label = dateLabel(event);
          const catKey = inferCatKey(event);
          const catStyle = CAT_STYLE[catKey];

          return (
            <Box
              key={event.uid}
              sx={{
                flexShrink: 0,
                width: 260,
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: active ? "rgba(122,1,33,0.55)" : "rgba(40,10,22,0.75)",
                border: active ? `1.5px solid ${catStyle.border}` : "1.5px solid rgba(255,255,255,0.12)",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                  border: `1.5px solid ${catStyle.border}`,
                },
              }}
            >
              {event.imageUrl && (
                <Box
                  component="img"
                  src={event.imageUrl}
                  alt={event.summary}
                  sx={{
                    width: "100%",
                    height: 100,
                    objectFit: "cover",
                    display: "block",
                    bgcolor: "rgba(255,255,255,0.04)",
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              )}

              <Box sx={{ p: 1.25, display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                  <Chip
                    icon={catStyle.icon as React.ReactElement}
                    label={catKey === "other" ? "Event" : catKey.replace("intramural", "sports")}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: 10,
                      fontWeight: 700,
                      bgcolor: catStyle.bg,
                      color: "#fff",
                      border: `1px solid ${catStyle.border}`,
                    }}
                  />
                  {active && (
                    <Chip
                      label="Ongoing"
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: 10,
                        fontWeight: 800,
                        bgcolor: "rgba(34,197,94,0.18)",
                        color: "#86efac",
                        border: "1px solid rgba(134,239,172,0.35)",
                      }}
                    />
                  )}
                </Box>

                <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.25 }}>
                  {event.summary}
                </Typography>

                <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.78rem", fontWeight: 700 }}>
                  {label}
                </Typography>

                {event.location && (
                  <Typography sx={{ color: "rgba(255,255,255,0.62)", fontSize: "0.76rem", lineHeight: 1.35 }}>
                    {event.location}
                  </Typography>
                )}

                {event.description && (
                  <Tooltip title={event.description} placement="top" arrow>
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.58)",
                        fontSize: "0.74rem",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {event.description}
                    </Typography>
                  </Tooltip>
                )}

                <Box sx={{ display: "flex", gap: 1, mt: "auto", pt: 0.5 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon sx={{ fontSize: "15px !important" }} />}
                    onClick={() => handleAdd(event)}
                    disabled={wasAdded}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: 999,
                      bgcolor: wasAdded ? "rgba(34,197,94,0.3)" : "#A80532",
                      color: "#fff",
                      boxShadow: "none",
                      "&:hover": { bgcolor: wasAdded ? "rgba(34,197,94,0.3)" : "#8f0229" },
                    }}
                  >
                    {wasAdded ? "Added" : "Add"}
                  </Button>
                  {event.url && (
                    <Button
                      size="small"
                      variant="outlined"
                      endIcon={<OpenInNewIcon sx={{ fontSize: "14px !important" }} />}
                      component="a"
                      href={event.url}
                      target="_blank"
                      rel="noreferrer"
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: 999,
                        color: "rgba(255,255,255,0.85)",
                        borderColor: "rgba(255,255,255,0.22)",
                      }}
                    >
                      Details
                    </Button>
                  )}
                </Box>
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
