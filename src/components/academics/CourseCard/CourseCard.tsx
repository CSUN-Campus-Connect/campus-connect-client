"use client";

import * as React from "react";
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ComputerIcon from "@mui/icons-material/Computer";
import PaletteIcon from "@mui/icons-material/Palette";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import type { CourseItem } from "../shared/constants";
import { CARD_COLORS } from "../shared/constants";

type CardColorValue = typeof CARD_COLORS[number]["value"];
import { fmt12 } from "../shared/utils";

// Extend palette locally without touching shared styling.
// These are intentionally light backgrounds so the entire card reads as a tinted theme.
const EXTRA_CARD_COLORS = [
  {
    value: "sky",
    label: "Sky",
    accent: "#2563eb",
    border: "rgba(37,99,235,0.28)",
    bg: "rgba(37,99,235,0.06)",
  },
  {
    value: "violet",
    label: "Violet",
    accent: "#7c3aed",
    border: "rgba(124,58,237,0.26)",
    bg: "rgba(124,58,237,0.06)",
  },
  {
    value: "teal",
    label: "Teal",
    accent: "#0f766e",
    border: "rgba(15,118,110,0.26)",
    bg: "rgba(15,118,110,0.06)",
  },
  {
    value: "amber",
    label: "Amber",
    accent: "#b45309",
    border: "rgba(180,83,9,0.26)",
    bg: "rgba(180,83,9,0.06)",
  },
] as const;

const ALL_CARD_COLORS = [...CARD_COLORS, ...EXTRA_CARD_COLORS].filter(
  (c, i, arr) => arr.findIndex((x) => x.value === c.value) === i
) as (typeof CARD_COLORS[number] | typeof EXTRA_CARD_COLORS[number])[];

type Props = {
  semesterLabel: string;
  course: CourseItem;
  onOpenInfo: () => void;
  onColorChange: (color: CardColorValue) => void;
};

export default function CourseCard({
  course,
  onOpenInfo,
  onColorChange,
}: Props) {
  const [colorAnchor, setColorAnchor] = React.useState<HTMLButtonElement | null>(null);

  const code = `${course.subject.toUpperCase()} ${course.number}`;
  const title = course.title || "Course title";
  const professor = course.professor || "TBA";

  const totalAssignments = course.assignments?.length ?? 0;
  const completedAssignments = course.assignments?.filter((a) => a.completed).length ?? 0;
  const pendingAssignments = totalAssignments - completedAssignments;
  const progress = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

  const scheduleStr =
    course.isOnline
      ? "Online"
      : course.days?.length
      ? `${course.days.join("/")} · ${fmt12(course.startTime ?? "")}–${fmt12(course.endTime ?? "")}`
      : null;

  const colorDef = ALL_CARD_COLORS.find((c) => c.value === (course.cardColor ?? "default")) ?? ALL_CARD_COLORS[0];

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "14px",
        px: 2,
        py: 1.25,
        bgcolor: colorDef.bg,
        border: `1.5px solid ${colorDef.border}`,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 0,
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 6px 24px rgba(168,5,50,0.12)",
          borderColor: colorDef.accent + "80",
          transform: "translateY(-1px)",
        },
        width: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Left accent bar */}
      <Box sx={{
        width: 3,
        borderRadius: 999,
        bgcolor: colorDef.accent,
        alignSelf: "stretch",
        flexShrink: 0,
        minHeight: 44,
        mr: 1.75,
      }} />

      {/* Course identity */}
      <Box sx={{ minWidth: 0, flex: "0 0 200px" }}>
        <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mb: 0.1 }}>
          <Typography sx={{
            letterSpacing: 1.5,
            fontWeight: 900,
            color: colorDef.accent,
            fontSize: "0.68rem",
            lineHeight: 1,
            fontFamily: "'DM Mono', monospace",
          }}>
            {code}
          </Typography>
          {course.units && (
            <Chip
              label={`${course.units}u`}
              size="small"
              sx={{
                height: 14,
                fontSize: "0.60rem",
                bgcolor: colorDef.accent + "15",
                color: colorDef.accent,
                fontWeight: 900,
                px: 0.2,
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          )}
        </Stack>
        <Typography fontWeight={800} sx={{
          fontSize: "0.88rem",
          lineHeight: 1.2,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: "#1a1a2e",
        }} title={title}>
          {title}
        </Typography>
        <Typography sx={{ color: "rgba(0,0,0,0.50)", fontSize: "0.76rem", mt: 0.1 }}>
          {professor}
        </Typography>
      </Box>

      {/* Schedule */}
      <Box sx={{ flex: "1 1 160px", minWidth: 0, px: 1.5 }}>
        {scheduleStr && (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.2 }}>
            {course.isOnline ? (
              <ComputerIcon sx={{ fontSize: 11, color: "rgba(0,0,0,0.40)" }} />
            ) : (
              <AccessTimeIcon sx={{ fontSize: 11, color: "rgba(0,0,0,0.40)" }} />
            )}
            <Typography sx={{ fontSize: "0.75rem", color: "rgba(0,0,0,0.55)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {scheduleStr}
            </Typography>
          </Stack>
        )}
        {course.location && !course.isOnline && (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <LocationOnIcon sx={{ fontSize: 11, color: "rgba(0,0,0,0.35)" }} />
            <Typography sx={{ fontSize: "0.72rem", color: "rgba(0,0,0,0.45)" }}>{course.location}</Typography>
          </Stack>
        )}
        {course.sectionId && (
          <Typography sx={{ fontSize: "0.66rem", color: "rgba(0,0,0,0.30)", mt: 0.1 }}>§{course.sectionId}</Typography>
        )}
      </Box>

      {/* Assignment progress */}
      <Box sx={{ flex: "0 0 120px", minWidth: 0, px: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.4 }}>
          <Typography sx={{ fontSize: "0.66rem", color: "rgba(0,0,0,0.50)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Tasks
          </Typography>
          <Stack direction="row" spacing={0.4} alignItems="center">
            {progress === 100 && <CheckCircleOutlineIcon sx={{ fontSize: 11, color: "#16a34a" }} />}
            <Typography sx={{ fontSize: "0.70rem", fontWeight: 900, color: progress === 100 ? "#16a34a" : colorDef.accent }}>
              {completedAssignments}/{totalAssignments}
            </Typography>
          </Stack>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            borderRadius: 999,
            height: 4,
            bgcolor: colorDef.accent + "18",
            "& .MuiLinearProgress-bar": {
              bgcolor: progress === 100 ? "#16a34a" : colorDef.accent,
              borderRadius: 999,
            },
          }}
        />
        {pendingAssignments > 0 && (
          <Typography sx={{ fontSize: "0.64rem", color: "rgba(0,0,0,0.38)", mt: 0.3 }}>
            {pendingAssignments} pending
          </Typography>
        )}
      </Box>

      {/* Actions */}
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0, pl: 0.5 }}>
        <Tooltip title="Course info">
          <Button
            variant="contained"
            onClick={onOpenInfo}
            startIcon={<InfoOutlinedIcon sx={{ fontSize: "12px !important" }} />}
            size="small"
            sx={{
              bgcolor: colorDef.accent,
              "&:hover": { bgcolor: colorDef.accent + "e0" },
              fontWeight: 800,
              borderRadius: 999,
              fontSize: "0.72rem",
              px: 1.25,
              py: 0.4,
              minHeight: 28,
              boxShadow: `0 2px 8px ${colorDef.accent}40`,
            }}
          >
            Info
          </Button>
        </Tooltip>

        <Tooltip title="Set card color">
          <Button
            size="small"
            variant="text"
            onClick={(e) => setColorAnchor(e.currentTarget)}
            sx={{
              minWidth: 28,
              width: 28,
              height: 28,
              p: 0,
              borderRadius: 999,
              color: "rgba(0,0,0,0.30)",
              "&:hover": { bgcolor: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.55)" },
            }}
          >
            <PaletteIcon sx={{ fontSize: 14 }} />
          </Button>
        </Tooltip>
      </Stack>

      {/* Color picker popover */}
      <Popover
        open={Boolean(colorAnchor)}
        anchorEl={colorAnchor}
        onClose={() => setColorAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { borderRadius: 3, p: 1.5, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" } }}
      >
        <Typography sx={{ fontSize: "0.70rem", fontWeight: 900, color: "rgba(0,0,0,0.50)", mb: 0.75, px: 0.25, textTransform: "uppercase", letterSpacing: 1 }}>
          Card Color
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0.6 }}>
          {ALL_CARD_COLORS.map((c) => (
            <Tooltip key={c.value} title={c.label} placement="top">
              <Box
                onClick={() => { onColorChange(c.value as CardColorValue); setColorAnchor(null); }}
                sx={{
                  width: 24, height: 24, borderRadius: 1.5, cursor: "pointer",
                  bgcolor: c.bg, border: `2px solid ${c.accent}`,
                  outline: course.cardColor === c.value ? `2px solid ${c.accent}` : "2px solid transparent",
                  outlineOffset: 2,
                  transition: "all 0.12s",
                  "&:hover": { transform: "scale(1.15)" },
                }}
              />
            </Tooltip>
          ))}
        </Box>
      </Popover>
    </Paper>
  );
}
