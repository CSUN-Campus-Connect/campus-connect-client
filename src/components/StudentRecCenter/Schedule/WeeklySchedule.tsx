"use client";

// ═══════════════════════════════════════════════════════════════════════
// BACKEND INTEGRATION — WeeklySchedule
// ═══════════════════════════════════════════════════════════════════════
//
// DATA SOURCE:
//   Currently imports WEEKLY_CLASSES from the static mock in icsData.ts.
//   Replace with a live SWR hook keyed to the selected week so the grid
//   re-fetches automatically when the user navigates forward/back:
//
//   import useSWR from "swr";
//   const fetcher = (url: string) => fetch(url).then((r) => r.json());
//
//   // Inside the component (weekStart is already in state):
//   const { data: classes = [], isLoading } = useSWR<WeeklyClass[]>(
//     `/api/src-schedule?week=${weekStart.format("YYYY-MM-DD")}`,
//     fetcher,
//     { revalidateOnFocus: false }
//   );
//   // Replace every WEEKLY_CLASSES reference below with `classes`.
//   // Show a skeleton loader while isLoading === true.
//
// WEEK NAVIGATION:
//   Each time the user clicks ← / → the weekStart state changes,
//   the SWR key changes, and the fetch fires automatically.
//   Pre-fetch adjacent weeks for instant transitions:
//     useSWR(`/api/src-schedule?week=${weekStart.subtract(1,"week").format(...)}`)
//     useSWR(`/api/src-schedule?week=${weekStart.add(1,"week").format(...)}`)
//
// SPOTS AVAILABILITY:
//   spotsLeft is a frequently-changing field. Two options:
//   A) Poll:  add refreshInterval: 5 * 60 * 1000 to the useSWR config (every 5 min).
//   B) Push:  subscribe to a WebSocket / SSE channel for the class IDs on screen:
//       const evtSource = new EventSource(`/api/src-schedule/live?ids=${classIds}`);
//       evtSource.onmessage = ({ data }) => mutate(key); // trigger SWR revalidate
//
// ADD TO MY SCHEDULE — handleAddToEvents():
//   POST /api/user-schedule
//   Auth: require active session
//   Body: {
//     classId:     string,
//     className:   string,
//     dayOfWeek:   number,    // 0=Sun … 6=Sat
//     startTime:   string,    // "HH:mm"
//     endTime:     string,
//     location:    string,
//     instructor:  string,
//     category:    string,
//   }
//   On success → 201 { userScheduleId }
//   On duplicate (same user + classId + week) → 409
//
//   Supabase table suggestion:
//     user_saved_classes (
//       id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//       user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
//       class_id    TEXT,
//       week_start  DATE,       -- ISO date of week's Sunday
//       saved_at    TIMESTAMPTZ DEFAULT NOW(),
//       UNIQUE (user_id, class_id, week_start)
//     )
// ═══════════════════════════════════════════════════════════════════════

import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  Box, Typography, Chip, IconButton, Tooltip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, Badge,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { WEEKLY_CLASSES, WeeklyClass } from "./icsData";

dayjs.extend(isoWeek);

const RED = "#A80532";

const CATEGORY_COLORS: Record<WeeklyClass["category"], { bg: string; text: string; border: string }> = {
  cardio:     { bg: "rgba(95, 202, 113, 0.85)",   text: "#ffffff", border: "rgb(205, 245, 205)" },
  strength:   { bg: "rgba(219, 177, 38, 0.9)",    text: "#ffffff", border: "rgb(245, 218, 139)" },
  "mind-body":{ bg: "rgba(162, 98, 218, 0.85)",  text: "#ffffff", border: "rgb(203, 161, 241)" },
  aquatics:   { bg: "rgba(21, 142, 212, 0.85)",   text: "#ffffff", border: "rgb(170, 225, 235)" },
  dance:      { bg: "rgba(231, 88, 172, 0.85)",  text: "#ffffff", border: "rgb(238, 160, 199)" },
  hiit:       { bg: "rgba(253, 110, 44, 0.85)",   text: "#ffffff", border: "rgb(235, 197, 169)" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function fmt12(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")}${ampm}`;
}

// Hours range to show in grid
const START_HOUR = 6;
const END_HOUR = 21;
const TOTAL_MINS = (END_HOUR - START_HOUR) * 60;
const CELL_PX = 64; // px per hour

export default function WeeklySchedule() {
  const today = dayjs();
  const [weekStart, setWeekStart] = React.useState<Dayjs>(today.startOf("week"));
  const [selected, setSelected] = React.useState<WeeklyClass | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);
  const [added, setAdded] = React.useState<Set<string>>(new Set());

  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day"));
  const isCurrentWeek = weekStart.isSame(today.startOf("week"), "day");

  // Group classes by day-of-week
  const byDay = React.useMemo(() => {
    const map: Record<number, WeeklyClass[]> = {};
    WEEKLY_CLASSES.forEach((c) => {
      if (!map[c.dayOfWeek]) map[c.dayOfWeek] = [];
      map[c.dayOfWeek].push(c);
    });
    return map;
  }, []);

  async function handleAddToEvents(cls: WeeklyClass) {
    // BACKEND: Replace optimistic update below with the real API call:
    //   const res = await fetch("/api/user-schedule", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       classId:    cls.id,
    //       className:  cls.name,
    //       dayOfWeek:  cls.dayOfWeek,
    //       startTime:  cls.startTime,
    //       endTime:    cls.endTime,
    //       location:   cls.location,
    //       instructor: cls.instructor,
    //       category:   cls.category,
    //       // Pass the current weekStart so the server can record which
    //       // specific week instance the student saved (for recurring classes):
    //       weekStart:  weekStart.format("YYYY-MM-DD"),
    //     }),
    //   });
    //   if (res.status === 409) { setToast("Already on your schedule!"); return; }
    //   if (!res.ok) { setToast("Something went wrong — try again."); return; }
    //   // Optionally invalidate useSWR cache: mutate("/api/user-schedule");
    //
    // See top-of-file comments for full schema + spots real-time options.

    // Optimistic UI update (no real network call yet)
    setAdded((prev) => new Set(prev).add(cls.id));
    setToast(`"${cls.name}" added to your schedule!`);
    setSelected(null);
  }

  const gridHeight = ((END_HOUR - START_HOUR) * CELL_PX);

  return (
    <Box>
      {/* ── Week Nav ── */}
      <Box
        sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          mb: 2, flexWrap: "wrap", gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={() => setWeekStart((w) => w.subtract(1, "week"))}
            size="small"
            aria-label="Previous week"
            sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.25)", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
          >
            <ChevronLeftIcon fontSize="small" aria-hidden="true" />
          </IconButton>
          <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "1rem", minWidth: 200, textAlign: "center" }}>
            {weekStart.format("MMM D")} – {weekStart.add(6, "day").format("MMM D, YYYY")}
          </Typography>
          <IconButton
            onClick={() => setWeekStart((w) => w.add(1, "week"))}
            size="small"
            aria-label="Next week"
            sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.25)", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
          >
            <ChevronRightIcon fontSize="small" aria-hidden="true" />
          </IconButton>
        </Box>
        {!isCurrentWeek && (
          <Button
            size="small"
            startIcon={<TodayIcon sx={{ fontSize: "14px !important" }} />}
            onClick={() => setWeekStart(today.startOf("week"))}
            sx={{
              color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 700,
              border: "1px solid rgba(255,255,255,0.3)", borderRadius: 999, px: 1.5,
              textTransform: "none",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            Today
          </Button>
        )}

        {/* Category legend */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {(Object.keys(CATEGORY_COLORS) as WeeklyClass["category"][]).map((cat) => {
            const c = CATEGORY_COLORS[cat];
            return (
              <Chip
                key={cat}
                label={cat.replace("-", " ")}
                size="small"
                sx={{ fontSize: 10, fontWeight: 700, textTransform: "capitalize", height: 22,
                  bgcolor: c.bg, color: c.text, border: `1px solid ${c.border}`,
                  "& .MuiChip-label": { px: 1 } }}
              />
            );
          })}
        </Box>
      </Box>

      {/* ── Grid ── */}
      <Box
        sx={{
          borderRadius: 3, overflow: "hidden",
          border: "1.5px solid rgba(255,255,255,0.15)",
          bgcolor: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Day headers */}
        <Box sx={{ display: "grid", gridTemplateColumns: "56px repeat(7, 1fr)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <Box sx={{ p: 1 }} />
          {weekDays.map((d, i) => {
            const isToday = d.isSame(today, "day");
            return (
              <Box
                key={i}
                sx={{
                  p: 1, textAlign: "center",
                  borderLeft: "1px solid rgba(255,255,255,0.08)",
                  bgcolor: isToday ? "rgba(168,5,50,0.25)" : "transparent",
                }}
              >
                <Typography sx={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: isToday ? "#fff" : "rgba(255,255,255,0.45)" }}>
                  {DAYS[i]}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 18, fontWeight: 800,
                    color: isToday ? "#fff" : "rgba(255,255,255,0.7)",
                    lineHeight: 1.2,
                  }}
                >
                  {d.date()}
                </Typography>
                {isToday && (
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: RED, mx: "auto", mt: 0.25 }} />
                )}
              </Box>
            );
          })}
        </Box>

        {/* Scrollable time grid */}
        <Box sx={{ overflowY: "auto", maxHeight: 520 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "56px repeat(7, 1fr)", position: "relative", height: gridHeight }}>
            {/* Hour labels */}
            <Box sx={{ position: "relative" }}>
              {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
                <Box
                  key={i}
                  sx={{
                    position: "absolute", top: i * CELL_PX - 9, left: 0, right: 0,
                    px: 0.75, textAlign: "right",
                  }}
                >
                  <Typography sx={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>
                    {((START_HOUR + i) % 12 || 12)}{START_HOUR + i >= 12 ? "p" : "a"}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Day columns */}
            {weekDays.map((d, colIdx) => {
              const dow = d.day(); // 0-6
              const classes = byDay[dow] ?? [];
              const isToday = d.isSame(today, "day");

              return (
                <Box
                  key={colIdx}
                  sx={{
                    position: "relative",
                    borderLeft: "1px solid rgba(255,255,255,0.07)",
                    bgcolor: isToday ? "rgba(168,5,50,0.06)" : "transparent",
                  }}
                >
                  {/* Hour lines */}
                  {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
                    <Box
                      key={i}
                      sx={{
                        position: "absolute", top: i * CELL_PX, left: 0, right: 0,
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        height: CELL_PX,
                      }}
                    />
                  ))}

                  {/* Classes */}
                  {classes.map((cls) => {
                    const startMins = timeToMinutes(cls.startTime) - START_HOUR * 60;
                    const endMins = timeToMinutes(cls.endTime) - START_HOUR * 60;
                    const top = (startMins / 60) * CELL_PX;
                    const height = Math.max(((endMins - startMins) / 60) * CELL_PX - 2, 28);
                    const cc = CATEGORY_COLORS[cls.category];
                    const isFull = (cls.spotsLeft ?? 1) === 0;
                    const isAdded = added.has(cls.id);

                    return (
                      <Tooltip
                        key={cls.id}
                        title={`${cls.name} · ${fmt12(cls.startTime)}–${fmt12(cls.endTime)} · ${cls.location}`}
                        placement="top"
                        arrow
                      >
                        <Box
                          role="button"
                          tabIndex={0}
                          aria-label={`${cls.name}, ${FULL_DAYS[cls.dayOfWeek]}, ${fmt12(cls.startTime)} to ${fmt12(cls.endTime)}, ${cls.location}${isFull ? ", class full" : ""}`}
                          onClick={() => setSelected(cls)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(cls); } }}
                          sx={{
                            position: "absolute",
                            top, left: 2, right: 2,
                            height,
                            borderRadius: 1.5,
                            bgcolor: isAdded ? "rgba(34,197,94,0.2)" : cc.bg,
                            border: `1px solid ${isAdded ? "rgba(34,197,94,0.5)" : cc.border}`,
                            px: 0.75, pt: 0.4,
                            cursor: "pointer",
                            overflow: "hidden",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "scale(1.02)",
                              zIndex: 5,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                            },
                          }}
                        >
                          <Typography sx={{ fontSize: 9, fontWeight: 800, color: isAdded ? "#86efac" : cc.text, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {cls.name}
                          </Typography>
                          {height > 36 && (
                            <Typography sx={{ fontSize: 8, color: isAdded ? "rgba(134,239,172,0.75)" : "rgba(255,255,255,0.8)", lineHeight: 1.1 }}>
                              {fmt12(cls.startTime)}
                            </Typography>
                          )}
                          {isFull && height > 32 && (
                            <Typography sx={{ fontSize: 7, fontWeight: 800, color: "#fca5a5", letterSpacing: 0.5 }}>FULL</Typography>
                          )}
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* ── Class Detail Dialog ── */}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: "rgba(30,10,18,0.95)",
            backdropFilter: "blur(20px)",
            border: "1.5px solid rgba(255,255,255,0.15)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          },
        }}
      >
        {selected && (
          <>
            <DialogTitle sx={{ pb: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 42, height: 42, borderRadius: 2,
                    bgcolor: CATEGORY_COLORS[selected.category].bg,
                    border: `1.5px solid ${CATEGORY_COLORS[selected.category].border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <FitnessCenterIcon sx={{ fontSize: 20, color: CATEGORY_COLORS[selected.category].text }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "1.05rem" }}>{selected.name}</Typography>
                  <Chip
                    label={selected.category.replace("-", " ")}
                    size="small"
                    sx={{
                      fontSize: 10, height: 20, fontWeight: 700, textTransform: "capitalize",
                      bgcolor: CATEGORY_COLORS[selected.category].bg,
                      color: CATEGORY_COLORS[selected.category].text,
                      border: `1px solid ${CATEGORY_COLORS[selected.category].border}`,
                      "& .MuiChip-label": { px: 0.75 },
                    }}
                  />
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              {[
                { icon: <AccessTimeIcon sx={{ fontSize: 16 }} />, label: `${FULL_DAYS[selected.dayOfWeek]}s · ${fmt12(selected.startTime)} – ${fmt12(selected.endTime)}` },
                { icon: <PersonIcon sx={{ fontSize: 16 }} />, label: selected.instructor },
                { icon: <LocationOnIcon sx={{ fontSize: 16 }} />, label: selected.location },
              ].map((row, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25, color: "rgba(255,255,255,0.75)" }}>
                  <Box sx={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>{row.icon}</Box>
                  <Typography sx={{ fontSize: "0.85rem" }}>{row.label}</Typography>
                </Box>
              ))}
              {selected.spots !== undefined && (
                <Box
                  sx={{
                    mt: 1.5, p: 1.5, borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}
                >
                  <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>Availability</Typography>
                  <Typography
                    sx={{
                      fontSize: "0.82rem", fontWeight: 700,
                      color: selected.spotsLeft === 0 ? "#fca5a5" : selected.spotsLeft! <= 3 ? "#fde047" : "#86efac",
                    }}
                  >
                    {selected.spotsLeft === 0 ? "Class Full" : `${selected.spotsLeft} of ${selected.spots} spots left`}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
              <Button
                onClick={() => setSelected(null)}
                sx={{ color: "rgba(255,255,255,0.5)", textTransform: "none", fontSize: 13 }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                disabled={added.has(selected.id) || selected.spotsLeft === 0}
                startIcon={<AddCircleOutlineIcon sx={{ fontSize: "15px !important" }} />}
                onClick={() => handleAddToEvents(selected)}
                sx={{
                  bgcolor: added.has(selected.id) ? "rgba(34,197,94,0.3)" : RED,
                  color: "#fff",
                  borderRadius: 999, px: 2.5, fontWeight: 700, textTransform: "none",
                  boxShadow: "0 4px 14px rgba(168,5,50,0.4)",
                  "&:hover": { bgcolor: "#8f0229" },
                  "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.35)" },
                }}
              >
                {added.has(selected.id) ? "Added ✓" : selected.spotsLeft === 0 ? "Class Full" : "Add to Schedule"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)}>
        <Alert severity="success" sx={{ width: "100%" }}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
}
