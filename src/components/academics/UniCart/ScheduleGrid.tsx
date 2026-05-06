"use client";

import * as React from "react";
import { Box, Stack, Typography } from "@mui/material";
import type { UniCartClass } from "../shared/constants";
import { HOURS, SCHEDULE_PALETTE } from "./constants";

// Mon–Sat so weekend courses can appear if the data includes them
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toMin = (t: string) => {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const fmtHour = (h: number) =>
  h > 12 ? `${h - 12}pm` : h === 12 ? "12pm" : `${h}am`;

/** Returns only the day columns that have at least one class, or all 5 (Mon-Fri) */
function activeDays(classes: UniCartClass[]): string[] {
  const used = new Set<string>();
  classes.forEach((c) => (c.days ?? []).forEach((d) => used.add(d)));
  const ordered = DAYS.filter((d) => used.has(d));
  // Always show at least Mon–Fri
  if (ordered.length === 0) return ["Mon", "Tue", "Wed", "Thu", "Fri"];
  // Expand to fill Mon-Fri minimum
  const monFri = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const expanded = new Set([...monFri, ...ordered]);
  return DAYS.filter((d) => expanded.has(d));
}

export function ScheduleGrid({ classes }: { classes: UniCartClass[] }) {
  const colorMap: Record<string, string> = {};
  classes.forEach((c, i) => {
    colorMap[c.id] = SCHEDULE_PALETTE[i % SCHEDULE_PALETTE.length];
  });

  const inPersonClasses = classes.filter((c) => !c.isOnline && c.startTime);
  const days = activeDays(inPersonClasses);

  // Trim grid to earliest/latest class ± 1 hour
  let minHour = 8, maxHour = 20;
  if (inPersonClasses.length > 0) {
    const starts = inPersonClasses.map((c) => Math.floor(toMin(c.startTime) / 60));
    const ends   = inPersonClasses.map((c) => Math.ceil(toMin(c.endTime) / 60));
    minHour = Math.max(7,  Math.min(...starts) - 1);
    maxHour = Math.min(22, Math.max(...ends)   + 1);
  }

  const displayHours = HOURS.filter((h) => h >= minHour && h < maxHour);
  const colTemplate  = `52px repeat(${days.length}, 1fr)`;

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Box sx={{ minWidth: Math.max(560, days.length * 100) }}>

        {/* Day headers */}
        <Box sx={{ display: "grid", gridTemplateColumns: colTemplate, mb: 0.5 }}>
          <Box /> {/* time gutter */}
          {days.map((d) => (
            <Box
              key={d}
              sx={{
                textAlign: "center", py: 0.85, mx: 0.25,
                borderRadius: "8px 8px 0 0",
                bgcolor: "rgba(168,5,50,0.06)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.70rem", fontWeight: 900,
                  color: "#A80532", letterSpacing: 1.2,
                  textTransform: "uppercase",
                }}
              >
                {d}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Hour rows */}
        {displayHours.map((hour, rowIdx) => (
          <Box
            key={hour}
            sx={{
              display: "grid",
              gridTemplateColumns: colTemplate,
              minHeight: 56,
              bgcolor: rowIdx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.015)",
              borderTop: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            {/* Time label */}
            <Box
              sx={{
                display: "flex", alignItems: "flex-start",
                justifyContent: "flex-end", pt: 0.5, pr: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.60rem", color: "rgba(0,0,0,0.35)",
                  fontWeight: 600, lineHeight: 1, whiteSpace: "nowrap",
                }}
              >
                {fmtHour(hour)}
              </Typography>
            </Box>

            {/* Day columns */}
            {days.map((day) => {
              const dayClasses = inPersonClasses.filter((c) => {
                const start = toMin(c.startTime);
                const end   = toMin(c.endTime);
                return (
                  c.days?.includes(day) &&
                  start < (hour + 1) * 60 &&
                  end   > hour * 60
                );
              });

              return (
                <Box
                  key={day}
                  sx={{ position: "relative", borderLeft: "1px solid rgba(0,0,0,0.04)", mx: 0.25 }}
                >
                  {dayClasses.map((c) => {
                    const start      = toMin(c.startTime);
                    const end        = toMin(c.endTime);
                    const blockStart = Math.max(start, hour * 60);
                    const blockEnd   = Math.min(end, (hour + 1) * 60);
                    const topPct     = ((blockStart - hour * 60) / 60) * 100;
                    const heightPct  = ((blockEnd - blockStart) / 60) * 100;
                    const isFirst    = blockStart === start;
                    const color      = colorMap[c.id];

                    return (
                      <Box
                        key={c.id}
                        sx={{
                          position: "absolute",
                          top: `${topPct}%`,
                          left: 2, right: 2,
                          height: `${heightPct}%`,
                          background: `linear-gradient(135deg, ${color}28, ${color}15)`,
                          borderLeft: `3px solid ${color}`,
                          borderRadius: "0 6px 6px 0",
                          px: 0.5,
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-start",
                          zIndex: 1,
                          backdropFilter: "blur(2px)",
                        }}
                      >
                        {isFirst && (
                          <>
                            <Typography
                              sx={{
                                fontSize: "0.58rem", fontWeight: 900,
                                color, lineHeight: 1.3, mt: 0.4,
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                              }}
                            >
                              {c.subject} {c.number}
                            </Typography>
                            {blockEnd - blockStart >= 45 && (
                              <Typography
                                sx={{
                                  fontSize: "0.50rem", color: color + "cc",
                                  lineHeight: 1.2,
                                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                }}
                              >
                                {c.location ?? ""}
                              </Typography>
                            )}
                          </>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>

      {/* Legend */}
      {inPersonClasses.length > 0 && (
        <Stack
          direction="row"
          flexWrap="wrap"
          gap={1}
          sx={{ mt: 1.5, pt: 1.25, borderTop: "1px solid rgba(0,0,0,0.06)" }}
        >
          {inPersonClasses.map((c) => (
            <Stack key={c.id} direction="row" spacing={0.5} alignItems="center">
              <Box
                sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: colorMap[c.id] }}
              />
              <Typography
                sx={{ fontSize: "0.65rem", color: "rgba(0,0,0,0.55)", fontWeight: 700 }}
              >
                {c.subject} {c.number}
                {c.days?.length ? ` · ${c.days.join("/")}` : ""}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );
}
