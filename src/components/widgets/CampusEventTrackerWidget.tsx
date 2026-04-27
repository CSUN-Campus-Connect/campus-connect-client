"use client";

import * as React from "react";
import dayjs from "dayjs";
import { Card, CardContent, LinearProgress, Tooltip } from "@mui/material";
import {
  FitnessCenterRounded,
  SpaRounded,
  FavoriteRounded,
  PsychologyRounded,
  GroupsRounded,
  SportsEsportsRounded,
  PaletteRounded,
  PushPinRounded,
  AccessTimeRounded,
  LocationOnRounded,
  CalendarMonthRounded,
  RefreshRounded,
  OpenInNewRounded,
  ExpandMoreRounded,
  ExpandLessRounded,
  WarningAmberRounded,
} from "@mui/icons-material";
import { WidgetHeader } from "./WidgetHeader";

const ICS_URL = "/api/csun-usu-events";

type Ev = {
  id: string;
  title: string;
  start: string;
  end?: string;
  location?: string;
  description?: string;
  url?: string;
  eventType: EventTag;
};

type EventTag =
  | "Recreation"
  | "Wellness"
  | "Pride Center"
  | "Counseling"
  | "Community"
  | "Gaming"
  | "Arts"
  | "General";

type Props = { onDelete?: () => void };

// ─── Event Type Inference ─────────────────────────────────────────────────────

const blob = (e: { title: string; description?: string; location?: string }) =>
  `${e.title} ${e.description ?? ""} ${e.location ?? ""}`.toLowerCase();

const inferEventType = (e: {
  title: string;
  description?: string;
  location?: string;
}): EventTag => {
  const t = blob(e);
  if (t.includes("recreation") || t.includes("swim") || t.includes("intramural") || t.includes("fitness") || t.includes("src")) return "Recreation";
  if (t.includes("oasis") || t.includes("wellness") || t.includes("skin") || t.includes("lymphatic") || t.includes("yoga") || t.includes("meditation")) return "Wellness";
  if (t.includes("pride") || t.includes("lgbtq") || t.includes("uplift") || t.includes("transcend")) return "Pride Center";
  if (t.includes("counseling") || t.includes("let's talk") || t.includes("mental health") || t.includes("therapy")) return "Counseling";
  if (t.includes("community") || t.includes("cultural") || t.includes("healing") || t.includes("racial") || t.includes("immigration")) return "Community";
  if (t.includes("game") || t.includes("gaming") || t.includes("esport") || t.includes("guilty gear") || t.includes("tournament")) return "Gaming";
  if (t.includes("movie") || t.includes("film") || t.includes("art") || t.includes("music") || t.includes("concert")) return "Arts";
  return "General";
};

// ─── Tag Config ───────────────────────────────────────────────────────────────

type TagConfig = { color: string; bg: string; accent: string; Icon: React.ElementType };

const TAG_CONFIG: Record<EventTag, TagConfig> = {
  Recreation:     { color: "#fff",    bg: "#16a34a", accent: "#dcfce7", Icon: FitnessCenterRounded },
  Wellness:       { color: "#fff",    bg: "#7c3aed", accent: "#ede9fe", Icon: SpaRounded },
  "Pride Center": { color: "#fff",    bg: "#db2777", accent: "#fce7f3", Icon: FavoriteRounded },
  Counseling:     { color: "#fff",    bg: "#0891b2", accent: "#cffafe", Icon: PsychologyRounded },
  Community:      { color: "#fff",    bg: "#d97706", accent: "#fef3c7", Icon: GroupsRounded },
  Gaming:         { color: "#fff",    bg: "#4f46e5", accent: "#e0e7ff", Icon: SportsEsportsRounded },
  Arts:           { color: "#fff",    bg: "#be123c", accent: "#ffe4e6", Icon: PaletteRounded },
  General:        { color: "#374151", bg: "#6b7280", accent: "#f3f4f6", Icon: PushPinRounded },
};

const ALL_TAGS: EventTag[] = [
  "Recreation", "Wellness", "Pride Center", "Counseling",
  "Community", "Gaming", "Arts", "General",
];

// ─── ICS Parser ───────────────────────────────────────────────────────────────

const parseIcsDate = (value: string | undefined | null): string | undefined => {
  if (!value) return undefined;
  const m = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?Z?$/);
  if (!m) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  }
  const [, y, mo, d, h, mi, sRaw] = m;
  const s = sRaw ?? "00";
  const isUtc = value.endsWith("Z");
  const date = isUtc
    ? new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s))
    : new Date(+y, +mo - 1, +d, +h, +mi, +s);
  return date.toISOString();
};

const parseIcs = (ics: string): Ev[] => {
  const lines = ics.split(/\r?\n/).reduce<string[]>((acc, line) => {
    if (!line) return acc;
    if (line[0] === " " && acc.length) { acc[acc.length - 1] += line.slice(1); }
    else acc.push(line);
    return acc;
  }, []);

  const events: Ev[] = [];
  let cur: any = null;

  for (const line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) { cur = { _descLines: [] }; continue; }
    if (line.startsWith("END:VEVENT")) {
      if (cur) {
        const startIso = parseIcsDate(cur._rawStart);
        const endIso = parseIcsDate(cur._rawEnd);
        const description = (cur._descLines ?? []).join("\n").trim();
        if (cur.title && startIso) {
          const partial = {
            id: cur.id || `${cur.title}-${startIso}`,
            title: cur.title, start: startIso, end: endIso,
            location: cur.location, description: description || undefined,
            url: cur.url || undefined,
          };
          events.push({ ...partial, eventType: inferEventType(partial) });
        }
      }
      cur = null; continue;
    }
    if (!cur) continue;
    const [rawKey, ...rest] = line.split(":");
    const value = rest.join(":");
    if (!rawKey) continue;
    const key = rawKey.split(";")[0];
    switch (key) {
      case "UID": cur.id = value; break;
      case "SUMMARY": cur.title = value; break;
      case "DTSTART": cur._rawStart = value; break;
      case "DTEND": cur._rawEnd = value; break;
      case "LOCATION": cur.location = value; break;
      case "DESCRIPTION": cur._descLines.push(value); break;
      case "URL": cur.url = value; break;
    }
  }
  return events.sort((a, b) => a.start.localeCompare(b.start));
};

const compressRecurring = (events: Ev[]): Ev[] => {
  const byKey = new Map<string, Ev[]>();
  for (const ev of events) {
    const key = `${ev.title.trim()}___${(ev.location ?? "").trim()}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(ev);
  }
  const compressed: Ev[] = [];
  for (const [, group] of byKey) {
    group.sort((a, b) => a.start.localeCompare(b.start));
    let cur = { ...group[0] };
    for (let i = 1; i < group.length; i++) {
      const ev = group[i];
      const diff = dayjs(ev.start).startOf("day").diff(dayjs(cur.end ?? cur.start).startOf("day"), "day");
      if (diff >= 0 && diff <= 1) {
        const evEnd = ev.end ?? ev.start;
        if (!cur.end || dayjs(evEnd).isAfter(cur.end)) cur.end = evEnd;
      } else {
        compressed.push(cur);
        cur = { ...ev };
      }
    }
    compressed.push(cur);
  }
  return compressed.sort((a, b) => a.start.localeCompare(b.start));
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatRange = (ev: Ev): string => {
  const start = dayjs(ev.start);
  const isAllDay = start.hour() === 0 && start.minute() === 0;
  if (!ev.end) return isAllDay ? start.format("ddd, MMM D") : start.format("ddd, MMM D · h:mm A");
  const end = dayjs(ev.end);
  if (start.isSame(end, "day")) {
    if (isAllDay) return start.format("ddd, MMM D");
    return `${start.format("ddd, MMM D · h:mm A")} – ${end.format("h:mm A")}`;
  }
  return `${start.format("MMM D")} – ${end.format("MMM D")}`;
};

const trimDesc = (desc?: string): string => {
  if (!desc) return "";
  const clean = desc.replace(/\\n/g, " ").replace(/\s+/g, " ").trim();
  return clean.length <= 160 ? clean : clean.slice(0, 157) + "…";
};

const getFirstLocation = (location?: string): string =>
  location?.split(/[,\\]/)[0].trim() ?? "";

function dayLabel(dateStr: string): string {
  const d = dayjs(dateStr, "ddd, MMM D");
  const diff = d.startOf("day").diff(dayjs().startOf("day"), "day");
  if (diff === 0) return `Today · ${dateStr}`;
  if (diff === 1) return `Tomorrow · ${dateStr}`;
  return dateStr;
}

const pillBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: 11,
  fontWeight: 600,
  padding: "3px 10px",
  borderRadius: 20,
  cursor: "pointer",
  transition: "all 0.14s ease",
  border: "1.5px solid transparent",
  lineHeight: 1,
  whiteSpace: "nowrap",
};

// ─── Component ────────────────────────────────────────────────────────────────

export const CampusEventTrackerWidget: React.FC<Props> = ({ onDelete }) => {
  const [events, setEvents] = React.useState<Ev[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [range, setRange] = React.useState<"week" | "2weeks" | "month" | "all">("week");
  const [activeTag, setActiveTag] = React.useState<EventTag | "All">("All");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const fetchEvents = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(ICS_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parsed = parseIcs(text);
      const now = dayjs();
      const upcoming = parsed.filter((e) => dayjs(e.start).isAfter(now.subtract(1, "day")));
      setEvents(compressRecurring(upcoming));
    } catch (err: any) {
      setError(err?.message || "Unable to load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchEvents();
    const id = setInterval(fetchEvents, 3 * 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchEvents]);

  const filtered = React.useMemo(() => {
    const now = dayjs();
    const cutoff =
      range === "week"   ? now.add(7, "day") :
      range === "2weeks" ? now.add(14, "day") :
      range === "month"  ? now.add(30, "day") : null;
    return events.filter((e) => {
      if (cutoff && dayjs(e.start).isAfter(cutoff)) return false;
      if (activeTag !== "All" && e.eventType !== activeTag) return false;
      return true;
    });
  }, [events, range, activeTag]);

  const tagCounts = React.useMemo(() => {
    const counts: Record<string, number> = { All: events.length };
    for (const ev of events) counts[ev.eventType] = (counts[ev.eventType] ?? 0) + 1;
    return counts;
  }, [events]);

  const grouped = React.useMemo(() => {
    const map: Record<string, Ev[]> = {};
    for (const ev of filtered) {
      const key = dayjs(ev.start).format("ddd, MMM D");
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    }
    return map;
  }, [filtered]);

  const RANGE_LABELS: Record<string, string> = {
    week: "7 days", "2weeks": "14 days", month: "30 days", all: "All",
  };

  return (
    <Card
      className="widget-card"
      sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 3 }}
    >
      <WidgetHeader title="Campus Events (USU)" onDelete={onDelete} />

      <CardContent sx={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", p: 0, "&:last-child": { pb: 0 } }}>

        {/* ── Controls ── */}
        <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid #f0f0f0", background: "#fafafa", display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Range + count */}
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {(["week", "2weeks", "month", "all"] as const).map((r) => {
              const active = range === r;
              return (
                <button key={r} onClick={() => setRange(r)} style={{ ...pillBase, background: active ? "#1d4ed8" : "#fff", color: active ? "#fff" : "#6b7280", borderColor: active ? "#1d4ed8" : "#e5e7eb" }}>
                  {RANGE_LABELS[r]}
                </button>
              );
            })}
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>
              {filtered.length} event{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Tag chips */}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {/* All */}
            {(() => {
              const active = activeTag === "All";
              return (
                <button onClick={() => setActiveTag("All")} style={{ ...pillBase, background: active ? "#111827" : "#fff", color: active ? "#fff" : "#6b7280", borderColor: active ? "#111827" : "#e5e7eb" }}>
                  All
                  <span style={{ background: active ? "rgba(255,255,255,0.2)" : "#f3f4f6", color: active ? "#fff" : "#9ca3af", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "0 5px" }}>
                    {tagCounts["All"] ?? 0}
                  </span>
                </button>
              );
            })()}

            {ALL_TAGS.map((tag) => {
              const count = tagCounts[tag] ?? 0;
              if (!count) return null;
              const cfg = TAG_CONFIG[tag];
              const active = activeTag === tag;
              const { Icon } = cfg;
              return (
                <button key={tag} onClick={() => setActiveTag(tag)} style={{ ...pillBase, background: active ? cfg.bg : "#fff", color: active ? cfg.color : "#6b7280", borderColor: active ? cfg.bg : "#e5e7eb" }}>
                  <Icon style={{ fontSize: 12 }} />
                  {tag}
                  <span style={{ background: active ? "rgba(255,255,255,0.22)" : "#f3f4f6", color: active ? "#fff" : "#9ca3af", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "0 5px" }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ padding: "14px 14px 0" }}>
            <LinearProgress sx={{ borderRadius: 1 }} />
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>Loading CSUN USU events…</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div style={{ padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#dc2626" }}>
              <WarningAmberRounded style={{ fontSize: 16 }} />
              {error}
            </div>
          </div>
        )}

        {/* ── Events list ── */}
        {!loading && !error && (
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 14px 14px" }}>
            {Object.keys(grouped).length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 16px", color: "#9ca3af", fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <CalendarMonthRounded style={{ fontSize: 36, color: "#d1d5db" }} />
                No events found for this filter.
              </div>
            ) : (
              Object.entries(grouped).map(([dateKey, dayEvents]) => (
                <div key={dateKey} style={{ marginBottom: 14 }}>
                  {/* Date header */}
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#6b7280", padding: "6px 0 4px", borderBottom: "1px solid #f0f0f0", marginBottom: 7, position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
                    {dayLabel(dateKey)}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {dayEvents.map((ev) => {
                      const cfg = TAG_CONFIG[ev.eventType];
                      const { Icon } = cfg;
                      const expanded = expandedId === ev.id;
                      const loc = getFirstLocation(ev.location);

                      return (
                        <div
                          key={ev.id}
                          onClick={() => setExpandedId(expanded ? null : ev.id)}
                          style={{ borderRadius: 10, border: "1px solid #f0f0f0", overflow: "hidden", cursor: "pointer", transition: "box-shadow 0.15s", boxShadow: expanded ? "0 3px 14px rgba(0,0,0,0.07)" : "none" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = expanded ? "0 3px 14px rgba(0,0,0,0.07)" : "none"; }}
                        >
                          <div style={{ height: 3, background: cfg.bg }} />

                          <div style={{ padding: "9px 12px", background: "#fff" }}>
                            {/* Title + tag chip */}
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, justifyContent: "space-between" }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", lineHeight: 1.35, flex: 1 }}>
                                {ev.title}
                              </span>
                              <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: cfg.accent, color: cfg.bg, border: `1px solid ${cfg.bg}30`, whiteSpace: "nowrap" }}>
                                <Icon style={{ fontSize: 11 }} />
                                {ev.eventType}
                              </span>
                            </div>

                            {/* Time + location */}
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 5, fontSize: 11, color: "#6b7280", flexWrap: "wrap" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                <AccessTimeRounded style={{ fontSize: 13, color: "#9ca3af" }} />
                                {formatRange(ev)}
                              </span>
                              {loc && (
                                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                  <LocationOnRounded style={{ fontSize: 13, color: "#9ca3af" }} />
                                  {loc}
                                </span>
                              )}
                            </div>

                            {/* Expanded description */}
                            {expanded && ev.description && (
                              <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${cfg.accent}`, fontSize: 12, color: "#374151", lineHeight: 1.55 }}>
                                {trimDesc(ev.description)}
                              </div>
                            )}

                            {/* Expand toggle + More Info */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                              {ev.description ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 10, color: cfg.bg, fontWeight: 700, userSelect: "none" }}>
                                  {expanded
                                    ? <><ExpandLessRounded style={{ fontSize: 14 }} /> Less</>
                                    : <><ExpandMoreRounded style={{ fontSize: 14 }} /> Details</>
                                  }
                                </div>
                              ) : <span />}
                              {ev.url && (
                                <a
                                  href={ev.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, color: cfg.bg, textDecoration: "none", padding: "2px 7px", borderRadius: 6, border: `1px solid ${cfg.bg}30`, background: cfg.accent, transition: "opacity 0.12s" }}
                                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.75"; }}
                                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
                                >
                                  More info <OpenInNewRounded style={{ fontSize: 10 }} />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Footer ── */}
        {!loading && !error && (
          <div style={{ padding: "7px 14px", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <a href="https://news.csun.edu/events/category/usu/" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#1d4ed8", textDecoration: "none", fontWeight: 600 }}>
              View all USU events <OpenInNewRounded style={{ fontSize: 12 }} />
            </a>
            <Tooltip title="Refresh events">
              <button onClick={fetchEvents} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6b7280", background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontWeight: 500 }}>
                <RefreshRounded style={{ fontSize: 13 }} />
                Refresh
              </button>
            </Tooltip>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
