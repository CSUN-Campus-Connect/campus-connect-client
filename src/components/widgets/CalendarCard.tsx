"use client";

import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  Card, CardContent, Box, Stack, Typography, IconButton,
  Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Menu, MenuItem, Popover, RadioGroup, FormControlLabel, Radio
} from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";


dayjs.extend(isoWeek);

type Props = {
  initial?: Dayjs;
  pinned?: string[];
  onTogglePin?(isoDate: string): void;
  onClose?(): void;
  title?: string;
  accentColor?: string;
};

type EventItem = {
  id: string;
  title: string;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD (inclusive)
  time?: string; // HH:mm
  color: string; // hex
};

type EventsByDay = Record<string, EventItem[]>;

const COLOR_CHOICES = [
  { key: "blue",   value: "#3b82f6" },
  { key: "green",  value: "#22c55e" },
  { key: "red",    value: "#ef4444" },
  { key: "yellow", value: "#eab308" },
  { key: "purple", value: "#a855f7" },
  { key: "pink",   value: "#ec4899" },
  { key: "cyan",   value: "#06b6d4" },
];

export default function CalendarCard({
  initial = dayjs(),
  pinned = [],
  onTogglePin,
  onClose,
  title = "Calendar",
  accentColor = "#0ea5e9",
}: Props) {
  const [month, setMonth] = React.useState(initial.startOf("month"));
  const [pins, setPins] = React.useState<string[]>(pinned);

  // UI theming
  const [accent, setAccent] = React.useState(accentColor);
  const [surface, setSurface] = React.useState("#f5f6f8");
  const [textColor, setTextColor] = React.useState("#111");

  // settings
  const [menuEl, setMenuEl] = React.useState<null | HTMLElement>(null);
  const openMenu = (e: React.MouseEvent<HTMLElement>) => setMenuEl(e.currentTarget);
  const closeMenu = () => setMenuEl(null);

  // events
  const [events, setEvents] = React.useState<EventItem[]>([]);

  // day dialog (click to open full edit)
  const [dayDialogOpen, setDayDialogOpen] = React.useState(false);
  const [selectedDayKey, setSelectedDayKey] = React.useState<string>("");

  // add/edit dialog
  const [addOpen, setAddOpen] = React.useState(false);
  const [isMulti, setIsMulti] = React.useState(false);
  const [formTitle, setFormTitle] = React.useState("");
  const [formTime, setFormTime] = React.useState("");
  const [formStart, setFormStart] = React.useState<Dayjs>(initial.startOf("day"));
  const [formEnd, setFormEnd] = React.useState<Dayjs>(initial.startOf("day"));
  const [formColor, setFormColor] = React.useState<string>(COLOR_CHOICES[0].value);

  // --- Hover quick-view popover (simple + reliable) ---
  const [popOpen, setPopOpen] = React.useState(false);
  const [popDayKey, setPopDayKey] = React.useState("");
  const [popAnchorEl, setPopAnchorEl] = React.useState<HTMLElement | null>(null);
  const [popSide, setPopSide] = React.useState<"left" | "right">("right");
  const closeTimer = React.useRef<number | null>(null);
  const [anchorPosition, setAnchorPosition] = React.useState<{ top: number; left: number } | undefined>(undefined);
  
  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  // grid dates
  const start = month.startOf("week");
  const end = month.endOf("month").endOf("week");
  const days: Dayjs[] = React.useMemo(() => {
    const arr: Dayjs[] = [];
    for (let d = start; d.isBefore(end) || d.isSame(end); d = d.add(1, "day")) arr.push(d);
    return arr;
  }, [month.valueOf()]);

  const keyOf = (d: Dayjs) => d.format("YYYY-MM-DD");
  const inMonth = (d: Dayjs) => d.isSame(month, "month");

  // index events by day (and spread multi-day events)
  const eventsByDay: EventsByDay = React.useMemo(() => {
    const map: EventsByDay = {};
    for (const ev of events) {
      const s = dayjs(ev.start), e = dayjs(ev.end);
      for (let d = s; d.isBefore(e) || d.isSame(e, "day"); d = d.add(1, "day")) {
        const k = d.format("YYYY-MM-DD");
        (map[k] ??= []).push(ev);
      }
    }
    return map;
  }, [events]);

  // actions
  const togglePin = React.useCallback((d: Dayjs) => {
    const k = keyOf(d);
    setPins(prev => {
      const next = prev.includes(k) ? prev.filter(p => p !== k) : [...prev, k];
      onTogglePin?.(k);
      return next;
    });
  }, [onTogglePin]);

  const addEvent = React.useCallback((p: {
    start: Dayjs; end?: Dayjs; title: string; time?: string; color: string;
  }) => {
    const item: EventItem = {
      id: uid(),
      title: p.title.trim(),
      start: p.start.format("YYYY-MM-DD"),
      end: (p.end ?? p.start).format("YYYY-MM-DD"),
      time: p.time?.trim() || undefined,
      color: p.color,
    };
    if (!item.title) return;
    setEvents(prev => [...prev, item]);
  }, []);

  const deleteEvent = React.useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  // --- Click -> open day dialog ---
  const onDayClick = React.useCallback((k: string) => {
    setSelectedDayKey(k);
    setDayDialogOpen(true);
  }, []);

  const openAdd = React.useCallback((multi: boolean) => {
    const d = dayjs(selectedDayKey || dayjs().format("YYYY-MM-DD"));
    setIsMulti(multi);
    setFormTitle("");
    setFormTime("");
    setFormStart(d);
    setFormEnd(d);
    setFormColor(COLOR_CHOICES[0].value);
    setAddOpen(true);
  }, [selectedDayKey]);

  const confirmAdd = React.useCallback(() => {
    addEvent({ start: formStart, end: isMulti ? formEnd : formStart, title: formTitle, time: formTime, color: formColor });
    setAddOpen(false);
  }, [addEvent, formStart, formEnd, isMulti, formTitle, formTime, formColor]);

  // ---------- HOVER HANDLERS ----------
  const clearCloseTimer = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openQuick = (k: string, cell: HTMLElement) => {
    clearCloseTimer();
    const rect = cell.getBoundingClientRect();
    const preferRight = rect.right + 320 < window.innerWidth;
    
    // Calculate position based on side of the page the calendar is on
    const top = rect.top + rect.height / 2;
    const left = preferRight ? rect.right + 8 : rect.left - 8;
    
    setPopSide(preferRight ? "right" : "left");
    setPopDayKey(k);
    setAnchorPosition({ top, left });
    setPopAnchorEl(cell);
    setPopOpen(true);
  };
    const scheduleCloseQuick = () => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => setPopOpen(false), 140);
  };
  React.useEffect(() => {
    if (!gridRef.current || !contentRef.current) return;
    const ro = new ResizeObserver(() => {
    });
    ro.observe(gridRef.current);
    ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, []);

  // cell
  type DayCellProps = {
    d: Dayjs; k: string; off: boolean; isToday: boolean; pinned: boolean;
    colors: string[];
  };

  const DayCell = React.memo(function DayCellInner({
    d, k, off, isToday, pinned, colors,
  }: DayCellProps) {
    const showColors = colors.slice(0, 4);
    
    const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
      const target = e.currentTarget;
      requestAnimationFrame(() => {
        openQuick(k, target);
      });
    };
    
    const handleMouseLeave = () => {
      scheduleCloseQuick(); // @ here proper quickview close 
    };
    
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setPopOpen(false);
      onDayClick(k);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setPopOpen(false);
        onDayClick(k);
      }
    };

    return (
      <Box
        role="button"
        tabIndex={0}
        aria-label={`${d.format("MMMM D, YYYY")}${colors.length ? `, ${colors.length} event${colors.length > 1 ? "s" : ""}` : ""}`}
        data-day-cell="1"
        data-day-key={k}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        sx={{
        position: "relative",
        aspectRatio: "1 / 1",
        borderRadius: 2,
        border: "1px solid rgba(0,0,0,.08)",
        bgcolor:
          d.isBefore(dayjs(), "day") && !isToday
            ? "rgba(0,0,0,0.1)"
            : "rgba(17,17,17,0.04)",
        opacity: off ? 0.45 : 1,
        overflow: "hidden",
        cursor: "pointer",
        userSelect: "none",
      }}
      >
        {isToday && (
          <Box
            sx={{
              pointerEvents: "none",
              position: "absolute",
              inset: 0,
              borderRadius: 2,
              bgcolor: accent,
              opacity: 1,    
              boxShadow: `inset 0 0 0 2px ${accent}`, 
              zIndex: 0
            }}
          />
        )}
        {pinned && !isToday && (
          <Box sx={{ pointerEvents: "none", position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "50%", border: `2px solid ${accent}` }} />
          </Box>
        )}

        <Typography
          onDoubleClick={(e) => { e.stopPropagation(); togglePin(d); }}
          sx={{ pointerEvents: "none", position: "absolute", top: 6, left: 8, zIndex: 1, fontWeight: isToday ? 800 : 600, color: isToday ? "#fff" : textColor }}
        >
          {d.date()}
        </Typography>

        <Stack direction="row" spacing={0.5} sx={{ pointerEvents: "none", position: "absolute", left: 6, right: 6, bottom: 6, zIndex: 1 }}>
          {showColors.map((c, i) => (
            <Box key={`${k}-ind-${i}`} sx={{ height: 6, flex: 1, borderRadius: 999, bgcolor: c, opacity: 0.95 }} />
          ))}
        </Stack>
      </Box>
    );
  });

  return (
    <Card sx={{ borderRadius: 3, width: "100%", height: "100%", bgcolor: surface, color: textColor, overflow: "hidden" }}>
      <CardContent ref={contentRef} sx={{p: 2, display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box",}}>
       <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography fontWeight={800}>{title}</Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography fontWeight={700}>{month.format("MMMM YYYY")}</Typography>
            <IconButton size="small" aria-label="Previous month" onClick={() => setMonth(m => m.subtract(1, "month"))}>
              <ChevronLeftIcon fontSize="small" aria-hidden="true" />
            </IconButton>
              <IconButton
                size="small" aria-label="Return to today" onClick={() => setMonth(dayjs().startOf("month"))} title="Return to current month">
                <ReplayIcon fontSize="small" aria-hidden="true" />
              </IconButton>
            <IconButton size="small" aria-label="Next month" onClick={() => setMonth(m => m.add(1, "month"))}>
              <ChevronRightIcon fontSize="small" aria-hidden="true" />
            </IconButton>
            <IconButton size="small" aria-label="Calendar settings" onClick={openMenu}>
              <MoreVertIcon fontSize="small" aria-hidden="true" />
            </IconButton>
            <IconButton size="small" aria-label="Close calendar" onClick={onClose}>
                <CloseIcon fontSize="small" aria-hidden="true" />
            </IconButton>
          </Stack>
        </Stack>

        <Box
          ref={gridRef}
          sx={{
            mt: 1.5,
            flex: 1,
            minHeight: 0,
            width: "100%",
            overflowX: "auto",
            overflowY: "auto",
            pr: 1,
            pb: 1,
            //scrollbarGutter: "stable both-edges",
            //scrollbarWidth: "thin",
            //"&::-webkit-scrollbar": { height: 8, width: 8 },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,0.32)",
              borderRadius: 8
            },
          }}
        >

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, fontSize: 12, opacity: 0.85, minWidth: 460 }}>
            {["S","M","T","W","T","F","S"].map((wd, idx) => (
              <Box key={`wd-${idx}`} sx={{ textAlign: "center", py: 0.5 }}>{wd}</Box>
            ))}
          </Box>
          
          <Box sx={{ mt: 0.5, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, minWidth: 460, pb: 0.5 }}>
            {days.map((d) => {
              const k = keyOf(d);
              const colors = (eventsByDay[k] ?? []).map(ev => ev.color);
              return (
                <DayCell
                  key={k}
                  d={d}
                  k={k}
                  off={!inMonth(d)}
                  isToday={d.isSame(dayjs(), "day")}
                  pinned={pins.includes(k)}
                  colors={colors}
                />
              );
            })}
          </Box>
        </Box>
      </CardContent>

      {/* Hover quick view (read-only) */}
      {popOpen && popAnchorEl && (
        <Popover
          open={popOpen}
          onClose={() => setPopOpen(false)}
          anchorReference="anchorPosition"
          anchorPosition={anchorPosition}
          // Remove: anchorEl, disablePortal, container
          transformOrigin={{
            vertical: "center",
            horizontal: popSide === "right" ? "left" : "right",
          }}
          slotProps={{
            paper: {
              onMouseEnter: clearCloseTimer,
              onMouseLeave: scheduleCloseQuick,
              sx: { 
                borderRadius: 2, 
                minWidth: 260, 
                maxWidth: 340, 
                p: 1,
                pointerEvents: 'auto',
              },
              elevation: 6,
            },
            root: {
              sx: {
                pointerEvents: 'none',
              }
            }
          }}
          >
            <Box sx={{ px: 0.5, py: 0.25 }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>{popDayKey && dayjs(popDayKey).format("MMM D")}</Typography>
            </Box>
            {(eventsByDay[popDayKey]?.length ?? 0) > 0 ? (
              <Box sx={{ px: 0.5, pb: 0.5, maxHeight: 240, overflowY: "auto" }}>
                {(eventsByDay[popDayKey] ?? []).map((ev) => (
                  <Box key={ev.id} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5, px: 0.75, borderRadius: 1,
                    "&:hover": { bgcolor: "rgba(17,17,17,0.05)" }}}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: ev.color, mt: 0.25 }} />
                    <Stack spacing={0} sx={{ flex: 1, minWidth: 0 }}>
                      <Typography noWrap variant="body2" sx={{ lineHeight: 1.2 }}>{ev.title}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {formatRange(ev.start, ev.end)} {ev.time ? `• ${ev.time}` : ""}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="caption" sx={{ opacity: 0.75, px: 1, pb: 0.75 }}>No events</Typography>
            )}
          </Popover>
        )}

      {/* Day dialog (opens by clicking a date square) */}
      <Dialog open={dayDialogOpen} onClose={() => setDayDialogOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>{selectedDayKey ? dayjs(selectedDayKey).format("dddd, MMM D, YYYY") : "Day"}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {(eventsByDay[selectedDayKey]?.length ?? 0) > 0 ? (
            <Box sx={{ maxHeight: 300, overflowY: "auto", pb: 1 }}>
              {(eventsByDay[selectedDayKey] ?? []).map((ev) => (
                <Box key={ev.id} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.75, px: 1, borderRadius: 1,
                  "&:hover": { bgcolor: "rgba(17,17,17,0.05)" } }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: ev.color, mt: 0.25 }} />
                  <Stack spacing={0} sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap variant="body2" sx={{ lineHeight: 1.2 }}>{ev.title}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {formatRange(ev.start, ev.end)} {ev.time ? `• ${ev.time}` : ""}
                    </Typography>
                  </Stack>
                  <IconButton size="small" aria-label={`Delete event: ${ev.title}`} onClick={() => deleteEvent(ev.id)}>
                    <CloseIcon fontSize="small" aria-hidden="true" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ opacity: 0.75, pb: 1 }}>No events yet for this day.</Typography>
          )}

          <Divider sx={{ my: 1 }} />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" onClick={() => openAdd(false)}>+ Day event</Button>
            <Button size="small" onClick={() => openAdd(true)}>+ Multi-day event</Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDayDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add event (with color choice) */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>{isMulti ? "Add multi-day event" : "Add day event"}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={1.25}>
            <TextField autoFocus fullWidth label="Title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            <Stack direction="row" spacing={1}>
              <TextField fullWidth label="Start date" type="date" value={formStart.format("YYYY-MM-DD")}
                onChange={(e) => setFormStart(dayjs(e.target.value))} InputLabelProps={{ shrink: true }} />
              <TextField fullWidth label="End date" type="date" disabled={!isMulti}
                value={(isMulti ? formEnd : formStart).format("YYYY-MM-DD")}
                onChange={(e) => setFormEnd(dayjs(e.target.value))} InputLabelProps={{ shrink: true }} />
            </Stack>
            <TextField fullWidth label="Time" type="time" value={formTime}
              onChange={(e) => setFormTime(e.target.value)} InputLabelProps={{ shrink: true }} />

            {/* color choices */}
            <Box>
              <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>Event color</Typography>
              <RadioGroup row value={formColor} onChange={(e) => setFormColor(e.target.value)}>
                {COLOR_CHOICES.map((c) => (
                  <FormControlLabel
                    key={c.key}
                    value={c.value}
                    control={<Radio sx={{ color: c.value, "&.Mui-checked": { color: c.value } }} />}
                    label={<Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: c.value, border: "1px solid rgba(0,0,0,.25)" }} />}
                  />
                ))}
              </RadioGroup>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={confirmAdd}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Settings */}
      <Menu
        open={!!menuEl} anchorEl={menuEl} onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem disableRipple>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography component="label" htmlFor="cal-color-accent" variant="body2" sx={{ minWidth: 90 }}>Accent</Typography>
            <input id="cal-color-accent" type="color" aria-label="Accent color" value={accent} onChange={(e) => setAccent(e.target.value)}
              style={{ width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer" }} />
          </Stack>
        </MenuItem>
        <MenuItem disableRipple>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography component="label" htmlFor="cal-color-surface" variant="body2" sx={{ minWidth: 90 }}>Surface</Typography>
            <input id="cal-color-surface" type="color" aria-label="Surface color" value={surface} onChange={(e) => setSurface(e.target.value)}
              style={{ width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer" }} />
          </Stack>
        </MenuItem>
        <MenuItem disableRipple>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography component="label" htmlFor="cal-color-text" variant="body2" sx={{ minWidth: 90 }}>Text</Typography>
            <input id="cal-color-text" type="color" aria-label="Text color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
              style={{ width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer" }} />
          </Stack>
        </MenuItem>
      </Menu>
    </Card>
  );
}

/* utils */
function uid() {
  return (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}
function formatRange(s: string, e: string) {
  if (s === e) return dayjs(s).format("MMM D, YYYY");
  const sd = dayjs(s), ed = dayjs(e);
  const sameMonth = sd.month() === ed.month() && sd.year() === ed.year();
  return sameMonth
    ? `${sd.format("MMM D")}–${ed.format("D, YYYY")}`
    : `${sd.format("MMM D, YYYY")} – ${ed.format("MMM D, YYYY")}`;
}
