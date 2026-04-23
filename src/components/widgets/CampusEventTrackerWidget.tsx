"use client";

import * as React from "react";
import dayjs from "dayjs";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
} from "@mui/material";
import { WidgetHeader } from "./WidgetHeader";

const ICS_URL = "/api/csun-usu-events";

type Ev = {
  id: string;
  title: string;
  start: string; // ISO
  end?: string; // ISO
  location?: string;
  description?: string;
};

type Props = {
  onDelete?: () => void;
};

const parseIcsDate = (value: string | undefined | null): string | undefined => {
  if (!value) return undefined;
  const m = value.match(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?Z?$/
  );
  if (!m) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  }
  const [, y, mo, d, h, mi, sRaw] = m;
  const s = sRaw ?? "00";
  const isUtc = value.endsWith("Z");
  const year = Number(y);
  const month = Number(mo) - 1;
  const day = Number(d);
  const hour = Number(h);
  const minute = Number(mi);
  const second = Number(s);

  const date = isUtc
    ? new Date(Date.UTC(year, month, day, hour, minute, second))
    : new Date(year, month, day, hour, minute, second);

  return date.toISOString();
};

const parseIcs = (ics: string): Ev[] => {
  const lines = ics
    .split(/\r?\n/)
    .reduce<string[]>((acc, line) => {
      if (!line) return acc;
      if (line[0] === " " && acc.length) {
        acc[acc.length - 1] += line.slice(1);
      } else {
        acc.push(line);
      }
      return acc;
    }, []);

  const events: Ev[] = [];
  let current:
    | (Partial<Ev> & {
        _rawStart?: string;
        _rawEnd?: string;
        _descriptionLines?: string[];
      })
    | null = null;

  for (const line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) {
      current = { _descriptionLines: [] };
      continue;
    }
    if (line.startsWith("END:VEVENT")) {
      if (current) {
        const startIso = parseIcsDate(current._rawStart);
        const endIso = parseIcsDate(current._rawEnd);
        const description = (current._descriptionLines ?? []).join("\n").trim();

        if (current.title && startIso) {
          events.push({
            id: current.id || `${current.title}-${startIso}`,
            title: current.title,
            start: startIso,
            end: endIso,
            location: current.location,
            description: description || undefined,
          });
        }
      }
      current = null;
      continue;
    }
    if (!current) continue;

    const [rawKey, ...rest] = line.split(":");
    const value = rest.join(":");
    if (!rawKey) continue;

    const key = rawKey.split(";")[0];

    switch (key) {
      case "UID":
        current.id = value;
        break;
      case "SUMMARY":
        current.title = value;
        break;
      case "DTSTART":
        current._rawStart = value;
        break;
      case "DTEND":
        current._rawEnd = value;
        break;
      case "LOCATION":
        current.location = value;
        break;
      case "DESCRIPTION":
        current._descriptionLines = current._descriptionLines || [];
        current._descriptionLines.push(value);
        break;
      default:
        break;
    }
  }

  return events.sort((a, b) => a.start.localeCompare(b.start));
};

/**
 * Compress recurring events:
 * - group by (title + location)
 * - within each group, merge events that occur on consecutive days
 *   into a single multi-day event with:
 *   start = first occurrence start
 *   end   = last occurrence end (or start if missing)
 */
const compressRecurringEvents = (events: Ev[]): Ev[] => {
  const byKey = new Map<string, Ev[]>();

  for (const ev of events) {
    const key = `${ev.title.trim()}___${(ev.location ?? "").trim()}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(ev);
  }

  const compressed: Ev[] = [];

  for (const [, group] of byKey) {
    group.sort((a, b) => a.start.localeCompare(b.start));

    let current = { ...group[0] };

    for (let i = 1; i < group.length; i++) {
      const ev = group[i];

      const currentEndBase = dayjs(current.end ?? current.start).startOf("day");
      const evStartDay = dayjs(ev.start).startOf("day");
      const dayDiff = evStartDay.diff(currentEndBase, "day");

      // If this occurrence is on the same day or the very next day,
      // treat it as a continuation and extend the multi-day span.
      if (dayDiff <= 1 && dayDiff >= 0) {
        const evEndIso = ev.end ?? ev.start;
        if (!current.end || dayjs(evEndIso).isAfter(current.end)) {
          current.end = evEndIso;
        }
      } else {
        compressed.push(current);
        current = { ...ev };
      }
    }

    compressed.push(current);
  }

  return compressed.sort((a, b) => a.start.localeCompare(b.start));
};

export const CampusEventTrackerWidget: React.FC<Props> = ({ onDelete }) => {
  const [events, setEvents] = React.useState<Ev[]>([]);
  const [onlyWeek, setOnlyWeek] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchEvents = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(ICS_URL);
      if (!res.ok) {
        throw new Error("Failed to fetch");
      }
      const text = await res.text();
      const parsed = parseIcs(text);

      const now = dayjs();
      const upcoming = parsed.filter((e) =>
        dayjs(e.start).isAfter(now.subtract(1, "day"))
      );

      const compressed = compressRecurringEvents(upcoming);
      setEvents(compressed);
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to load CSUN USU events. (Check API route / CORS.)"
      );
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
    const base = events;
    if (!onlyWeek) return base;
    const end = dayjs().add(7, "day");
    return base.filter((e) => dayjs(e.start).isBefore(end));
  }, [events, onlyWeek]);

  const formatRange = (ev: Ev) => {
    const start = dayjs(ev.start);
    if (!ev.end) {
      return start.format("ddd, MMM D • h:mm A");
    }
    const end = dayjs(ev.end);
    if (start.isSame(end, "day")) {
      return `${start.format("ddd, MMM D • h:mm A")} – ${end.format("h:mm A")}`;
    }
    return `${start.format("ddd, MMM D • h:mm A")} – ${end.format(
      "ddd, MMM D • h:mm A"
    )}`;
  };

  const trimDescription = (desc?: string) => {
    if (!desc) return "";
    const clean = desc.replace(/\\n/g, " ").replace(/\s+/g, " ").trim();
    if (clean.length <= 160) return clean;
    return clean.slice(0, 157) + "...";
  };

  return (
    <Card
      className="widget-card"
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <WidgetHeader title="Campus Events (USU)" onDelete={onDelete} />
      <CardContent
        sx={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Stack direction="row" spacing={2} mb={1} alignItems="center">
          <FormControl size="small">
            <Select
              value={onlyWeek ? "week" : "all"}
              onChange={(e) =>
                setOnlyWeek((e.target as any).value === "week")
              }
              inputProps={{ "aria-label": "Event time range filter" }}
            >
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="all">All Upcoming</MenuItem>
            </Select>
          </FormControl>
          <Chip size="small" label="Source: CSUN USU Events" variant="outlined" />
        </Stack>

        {loading && (
          <Stack spacing={1}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary">
              Loading live events from CSUN USU calendar…
            </Typography>
          </Stack>
        )}

        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}

        {!loading && !error && (
          <Stack spacing={1}>
            {filtered.map((ev) => (
              <Stack
                key={ev.id}
                sx={{
                  p: 1.25,
                  border: "1px solid #eee",
                  borderRadius: 2,
                  gap: 0.25,
                }}
              >
                <Typography fontWeight={700}>{ev.title}</Typography>

                <Typography variant="body2" color="text.secondary">
                  {formatRange(ev)} {ev.location ? `• ${ev.location}` : ""}
                </Typography>

                {ev.description && (
                  <Typography variant="body2">
                    {trimDescription(ev.description)}
                  </Typography>
                )}
              </Stack>
            ))}

            {filtered.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No upcoming USU events found in this range.
              </Typography>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};
