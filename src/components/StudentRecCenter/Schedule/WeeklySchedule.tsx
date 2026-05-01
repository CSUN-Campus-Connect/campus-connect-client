"use client";

import * as React from "react";
import useSWR from "swr";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  Box, Typography, Chip, IconButton, Tooltip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, Skeleton,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

dayjs.extend(isoWeek);

export type WeeklyClass = {
  id: string;
  name: string;
  instructor: string;
  location: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  category: "cardio" | "strength" | "mind-body" | "aquatics" | "dance" | "hiit";
  spots?: number;
  spotsLeft?: number;
  imageUrl?: string | null;
  description?: string;
  registrationUrl?: string;
  isAllDay?: boolean;
  startDate?: string | null;
  endDate?: string | null;
};

type PositionedWeeklyClass = WeeklyClass & {
  column: number;
  columns: number;
};

const RED = "#A80532";

const CATEGORY_COLORS: Record<WeeklyClass["category"], { bg: string; text: string; border: string }> = {
  cardio: { bg: "rgba(95, 202, 113, 0.85)", text: "#ffffff", border: "rgb(205, 245, 205)" },
  strength: { bg: "rgba(219, 177, 38, 0.9)", text: "#ffffff", border: "rgb(245, 218, 139)" },
  "mind-body": { bg: "rgba(162, 98, 218, 0.85)", text: "#ffffff", border: "rgb(203, 161, 241)" },
  aquatics: { bg: "rgba(21, 142, 212, 0.85)", text: "#ffffff", border: "rgb(170, 225, 235)" },
  dance: { bg: "rgba(231, 88, 172, 0.85)", text: "#ffffff", border: "rgb(238, 160, 199)" },
  hiit: { bg: "rgba(253, 110, 44, 0.85)", text: "#ffffff", border: "rgb(235, 197, 169)" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const START_HOUR = 6;
const END_HOUR = 22;
const CELL_PX = 64;

const fetcher = async (url: string): Promise<WeeklyClass[]> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.json();
};

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function fmt12(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")}${ampm}`;
}

function getThisSunday(): Dayjs {
  const today = dayjs();
  return today.subtract(today.day(), "day").startOf("day");
}

function getPositionedClasses(classes: WeeklyClass[]): PositionedWeeklyClass[] {
  const sorted = [...classes].sort((a, b) => {
    const diff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    return diff !== 0 ? diff : timeToMinutes(a.endTime) - timeToMinutes(b.endTime);
  });

  const result: PositionedWeeklyClass[] = [];
  let cluster: WeeklyClass[] = [];
  let clusterEnd = -1;

  const flushCluster = () => {
    if (cluster.length === 0) return;

    const positioned: PositionedWeeklyClass[] = [];
    const columnEnds: number[] = [];

    for (const cls of cluster) {
      const start = timeToMinutes(cls.startTime);
      const end = timeToMinutes(cls.endTime);

      let column = columnEnds.findIndex((colEnd) => colEnd <= start);
      if (column === -1) {
        column = columnEnds.length;
        columnEnds.push(end);
      } else {
        columnEnds[column] = end;
      }

      positioned.push({ ...cls, column, columns: 1 });
    }

    const totalColumns = Math.max(columnEnds.length, 1);
    positioned.forEach((item) => {
      item.columns = totalColumns;
      result.push(item);
    });

    cluster = [];
    clusterEnd = -1;
  };

  for (const cls of sorted) {
    const start = timeToMinutes(cls.startTime);
    const end = timeToMinutes(cls.endTime);

    if (cluster.length === 0 || start < clusterEnd) {
      cluster.push(cls);
      clusterEnd = Math.max(clusterEnd, end);
    } else {
      flushCluster();
      cluster.push(cls);
      clusterEnd = end;
    }
  }

  flushCluster();
  return result;
}

export default function WeeklySchedule() {
  const today = dayjs();
  const [weekStart, setWeekStart] = React.useState<Dayjs>(getThisSunday);
  const [selected, setSelected] = React.useState<WeeklyClass | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);
  const [added, setAdded] = React.useState<Set<string>>(new Set());

  const weekKey = weekStart.format("YYYY-MM-DD");
  const isCurrentWeek = weekStart.isSame(getThisSunday(), "day");

  const { data: classes = [], isLoading, error } = useSWR<WeeklyClass[]>(
    `/api/src-schedule?week=${weekKey}`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
      refreshInterval: 60 * 60 * 1000,
      dedupingInterval: 30_000,
      keepPreviousData: true,
    }
  );

  useSWR(`/api/src-schedule?week=${weekStart.subtract(1, "week").format("YYYY-MM-DD")}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });
  useSWR(`/api/src-schedule?week=${weekStart.add(1, "week").format("YYYY-MM-DD")}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day"));

  const timedClasses = React.useMemo(() => (classes ?? []).filter((c) => !c.isAllDay), [classes]);

  const allDayByDay = React.useMemo(() => {
    const map: Record<number, WeeklyClass[]> = {};
    for (let i = 0; i < 7; i += 1) map[i] = [];

    (classes ?? []).filter((c) => c.isAllDay).forEach((c) => {
      const start = c.startDate ? dayjs(c.startDate) : weekStart.add(c.dayOfWeek, "day");
      const end = c.endDate ? dayjs(c.endDate) : start;

      weekDays.forEach((day, idx) => {
        if ((day.isAfter(start.subtract(1, "day"), "day")) && (day.isBefore(end.add(1, "day"), "day"))) {
          map[idx].push(c);
        }
      });
    });

    return map;
  }, [classes, weekDays, weekStart]);

  const byDay = React.useMemo(() => {
    const map: Record<number, PositionedWeeklyClass[]> = {};
    timedClasses.forEach((c) => {
      if (!map[c.dayOfWeek]) map[c.dayOfWeek] = [];
      map[c.dayOfWeek].push(c as PositionedWeeklyClass);
    });

    const positioned: Record<number, PositionedWeeklyClass[]> = {};
    Object.entries(map).forEach(([day, dayClasses]) => {
      positioned[Number(day)] = getPositionedClasses(dayClasses);
    });
    return positioned;
  }, [timedClasses]);

  async function handleAddToEvents(cls: WeeklyClass) {
    setAdded((prev) => new Set(prev).add(cls.id));
    setToast(`"${cls.name}" added to your schedule!`);
    setSelected(null);

    try {
      const res = await fetch("/api/user-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: cls.id,
          className: cls.name,
          dayOfWeek: cls.dayOfWeek,
          startTime: cls.startTime,
          endTime: cls.endTime,
          location: cls.location,
          instructor: cls.instructor,
          category: cls.category,
          weekStart: weekKey,
        }),
      });
      if (res.status === 409) {
        setToast("Already on your schedule!");
        return;
      }
      if (!res.ok) {
        setAdded((prev) => {
          const s = new Set(prev);
          s.delete(cls.id);
          return s;
        });
        setToast("Something went wrong. Try again.");
      }
    } catch {
      setAdded((prev) => {
        const s = new Set(prev);
        s.delete(cls.id);
        return s;
      });
      setToast("Something went wrong. Try again.");
    }
  }

  const gridHeight = (END_HOUR - START_HOUR) * CELL_PX;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            size="small"
            aria-label="Previous week"
            onClick={() => setWeekStart((w) => w.subtract(1, "week"))}
            sx={{ color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)", "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", minWidth: 180, textAlign: "center" }}>
            {weekStart.format("MMM D")} – {weekStart.add(6, "day").format("MMM D, YYYY")}
          </Typography>
          <IconButton
            size="small"
            aria-label="Next week"
            onClick={() => setWeekStart((w) => w.add(1, "week"))}
            sx={{ color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)", "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
        {!isCurrentWeek && (
          <Button
            size="small"
            startIcon={<TodayIcon sx={{ fontSize: "14px !important" }} />}
            onClick={() => setWeekStart(getThisSunday())}
            sx={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 11,
              fontWeight: 600,
              textTransform: "none",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 999,
              px: 1.5,
              "&:hover": { bgcolor: "rgba(255,255,255,0.08)", color: "#fff" },
            }}
          >
            Today
          </Button>
        )}
      </Box>

      {error && (
        <Box sx={{ textAlign: "center", py: 6, color: "rgba(255,255,255,0.4)" }}>
          <Typography sx={{ fontSize: "0.85rem" }}>
            Unable to load schedule. Please try again later.
          </Typography>
        </Box>
      )}

      {!error && (
        <Box sx={{ overflowX: "auto" }}>
          <Box sx={{ display: "flex", minWidth: 700 }}>
            <Box sx={{ width: 44, flexShrink: 0, position: "relative", height: gridHeight, mt: "36px" }}>
              {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
                <Box key={i} sx={{ position: "absolute", top: i * CELL_PX - 8, right: 6 }}>
                  <Typography sx={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>
                    {fmt12(`${START_HOUR + i}:00`)}
                  </Typography>
                </Box>
              ))}
            </Box>

            {weekDays.map((day, colIdx) => {
              const isToday = day.isSame(today, "day");
              const dayClasses = byDay[colIdx] ?? [];

              return (
                <Box key={colIdx} sx={{ flex: 1, minWidth: 80 }}>
                  <Box sx={{ height: 36, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <Typography sx={{ fontSize: 9, fontWeight: 700, color: isToday ? RED : "rgba(255,255,255,0.35)", letterSpacing: 1, textTransform: "uppercase" }}>
                      {DAYS[colIdx]}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: isToday ? "#fff" : "rgba(255,255,255,0.45)",
                        lineHeight: 1,
                        ...(isToday && {
                          bgcolor: RED,
                          borderRadius: "50%",
                          width: 22,
                          height: 22,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }),
                      }}
                    >
                      {day.date()}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      minHeight: 58,
                      px: 0.5,
                      py: 0.5,
                      borderLeft: "1px solid rgba(255,255,255,0.06)",
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                      bgcolor: isToday ? "rgba(168,5,50,0.05)" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    {allDayByDay[colIdx]?.length ? allDayByDay[colIdx].map((cls) => {
                      const cc = CATEGORY_COLORS[cls.category] ?? CATEGORY_COLORS.cardio;
                      return (
                        <Chip
                          key={cls.id}
                          label={cls.name}
                          onClick={() => setSelected(cls)}
                          size="small"
                          sx={{
                            maxWidth: "100%",
                            mb: 0.5,
                            height: 22,
                            justifyContent: "flex-start",
                            bgcolor: cc.bg,
                            color: cc.text,
                            border: `1px solid ${cc.border}`,
                            "& .MuiChip-label": {
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                              px: 0.75,
                              fontWeight: 700,
                              fontSize: 10,
                            },
                          }}
                        />
                      );
                    }) : (
                      <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.28)", px: 0.5, pt: 0.25 }}>
                        All day
                      </Typography>
                    )}
                  </Box>

                  <Box
                    sx={{
                      position: "relative",
                      height: gridHeight,
                      borderLeft: "1px solid rgba(255,255,255,0.06)",
                      bgcolor: isToday ? "rgba(168,5,50,0.04)" : "transparent",
                    }}
                  >
                    {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
                      <Box
                        key={i}
                        sx={{
                          position: "absolute",
                          top: i * CELL_PX,
                          left: 0,
                          right: 0,
                          borderTop: "1px solid rgba(255,255,255,0.05)",
                          height: CELL_PX,
                        }}
                      />
                    ))}

                    {isLoading && [0, 1].map((i) => (
                      <Skeleton
                        key={i}
                        variant="rectangular"
                        sx={{
                          position: "absolute",
                          top: (i + 2) * CELL_PX * 1.2,
                          left: 2,
                          right: 2,
                          height: CELL_PX - 4,
                          borderRadius: 1.5,
                          bgcolor: "rgba(255,255,255,0.06)",
                        }}
                      />
                    ))}

                    {!isLoading && dayClasses.map((cls) => {
                      const startMins = timeToMinutes(cls.startTime) - START_HOUR * 60;
                      const endMins = timeToMinutes(cls.endTime) - START_HOUR * 60;
                      const top = Math.max((startMins / 60) * CELL_PX, 0);
                      const height = Math.max(((endMins - startMins) / 60) * CELL_PX - 2, 28);
                      const cc = CATEGORY_COLORS[cls.category] ?? CATEGORY_COLORS.cardio;
                      const isFull = (cls.spotsLeft ?? 1) === 0;
                      const isAdded = added.has(cls.id);
                      const widthPct = 100 / Math.max(cls.columns, 1);

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
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelected(cls);
                              }
                            }}
                            sx={{
                              position: "absolute",
                              top,
                              left: `calc(${cls.column * widthPct}% + 2px)`,
                              width: `calc(${widthPct}% - 4px)`,
                              height,
                              borderRadius: 1.5,
                              bgcolor: isAdded ? "rgba(34,197,94,0.2)" : cc.bg,
                              border: `1px solid ${isAdded ? "rgba(34,197,94,0.5)" : cc.border}`,
                              opacity: isFull ? 0.72 : 1,
                              px: 0.75,
                              pt: 0.4,
                              cursor: "pointer",
                              overflow: "hidden",
                              transition: "all 0.2s ease",
                              "&:hover": { transform: "scale(1.02)", zIndex: 5, boxShadow: "0 4px 12px rgba(0,0,0,0.3)" },
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
                </Box>
              );
            })}
          </Box>

          {!isLoading && timedClasses.length === 0 && Object.values(allDayByDay).every((items) => items.length === 0) && (
            <Box sx={{ textAlign: "center", py: 4, color: "rgba(255,255,255,0.35)" }}>
              <EventBusyIcon sx={{ fontSize: 32, mb: 1, opacity: 0.5 }} />
              <Typography sx={{ fontSize: "0.82rem" }}>
                No classes scheduled for this week.
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", mt: 0.5, opacity: 0.7 }}>
                Try another week or check back later.
              </Typography>
            </Box>
          )}
        </Box>
      )}

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
        {selected && (() => {
          const cc = CATEGORY_COLORS[selected.category] ?? CATEGORY_COLORS.cardio;
          return (
            <>
              {selected.imageUrl && (
                <Box
                  component="img"
                  src={selected.imageUrl}
                  alt={selected.name}
                  sx={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
                />
              )}
              <DialogTitle sx={{ pb: 0.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      bgcolor: cc.bg,
                      border: `1.5px solid ${cc.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FitnessCenterIcon sx={{ fontSize: 20, color: cc.text }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "1.05rem" }}>{selected.name}</Typography>
                    <Chip
                      label={selected.category.replace("-", " ")}
                      size="small"
                      sx={{
                        fontSize: 10,
                        height: 20,
                        fontWeight: 700,
                        textTransform: "capitalize",
                        bgcolor: cc.bg,
                        color: cc.text,
                        border: `1px solid ${cc.border}`,
                        "& .MuiChip-label": { px: 0.75 },
                      }}
                    />
                  </Box>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ pt: 2 }}>
                {[
                  { icon: <AccessTimeIcon sx={{ fontSize: 16 }} />, label: selected.isAllDay ? `All day · ${selected.startDate}${selected.endDate && selected.endDate !== selected.startDate ? ` to ${selected.endDate}` : ""}` : `${FULL_DAYS[selected.dayOfWeek]} · ${fmt12(selected.startTime)} – ${fmt12(selected.endTime)}` },
                  { icon: <PersonIcon sx={{ fontSize: 16 }} />, label: selected.instructor || "—" },
                  { icon: <LocationOnIcon sx={{ fontSize: 16 }} />, label: selected.location || "—" },
                ].map((row, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25, color: "rgba(255,255,255,0.75)" }}>
                    <Box sx={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>{row.icon}</Box>
                    <Typography sx={{ fontSize: "0.85rem" }}>{row.label}</Typography>
                  </Box>
                ))}
                {selected.description && (
                  <Typography sx={{ mt: 2, fontSize: "0.86rem", lineHeight: 1.6, color: "rgba(255,255,255,0.72)" }}>
                    {selected.description}
                  </Typography>
                )}
                {selected.spots !== undefined && (
                  <Box
                    sx={{
                      mt: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>Availability</Typography>
                    <Typography
                      sx={{
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: selected.spotsLeft === 0 ? "#fca5a5" : selected.spotsLeft! <= 3 ? "#fde047" : "#86efac",
                      }}
                    >
                      {selected.spotsLeft === 0 ? "Class Full" : `${selected.spotsLeft} of ${selected.spots} spots left`}
                    </Typography>
                  </Box>
                )}
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: "wrap" }}>
                {selected.registrationUrl && (
                  <Button
                    component="a"
                    href={selected.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    variant="outlined"
                    endIcon={<OpenInNewIcon sx={{ fontSize: "15px !important" }} />}
                    sx={{
                      color: "rgba(255,255,255,0.85)",
                      borderColor: "rgba(255,255,255,0.22)",
                      textTransform: "none",
                      borderRadius: 999,
                    }}
                  >
                    Event Details
                  </Button>
                )}
                <Box sx={{ flex: 1 }} />
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
                    borderRadius: 999,
                    px: 2.5,
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "0 4px 14px rgba(168,5,50,0.4)",
                    "&:hover": { bgcolor: "#8f0229" },
                    "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.35)" },
                  }}
                >
                  {added.has(selected.id) ? "Added ✓" : selected.spotsLeft === 0 ? "Class Full" : "Add to Schedule"}
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)}>
        <Alert severity="success" sx={{ width: "100%" }}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
}
