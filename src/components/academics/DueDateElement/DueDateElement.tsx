"use client";

import * as React from "react";
import dayjs from "dayjs";
import {
  Box, Chip, Dialog, DialogContent, DialogActions,
  IconButton, Paper, Stack, Tooltip, Typography, TextField,
  MenuItem, Select, FormControl, InputLabel, Button, LinearProgress,
  Divider, Collapse, Alert,
} from "@mui/material";
import {
  Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale,
  Tooltip as ChartTooltip, Legend, LineElement, PointElement, Filler,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

import AddIcon                  from "@mui/icons-material/Add";
import CheckCircleIcon          from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import StarIcon                 from "@mui/icons-material/Star";
import StarBorderIcon           from "@mui/icons-material/StarBorder";
import DeleteOutlineIcon        from "@mui/icons-material/DeleteOutline";
import EditIcon                 from "@mui/icons-material/Edit";
import ExpandMoreIcon           from "@mui/icons-material/ExpandMore";
import ExpandLessIcon           from "@mui/icons-material/ExpandLess";
import AssignmentIcon           from "@mui/icons-material/Assignment";
import MenuBookIcon             from "@mui/icons-material/MenuBook";
import CalendarTodayIcon        from "@mui/icons-material/CalendarToday";
import TrendingUpIcon           from "@mui/icons-material/TrendingUp";
import AccessTimeIcon           from "@mui/icons-material/AccessTime";
import LinkIcon                 from "@mui/icons-material/Link";
import AttachFileIcon           from "@mui/icons-material/AttachFile";
import ImageIcon                from "@mui/icons-material/Image";
import CloseIcon                from "@mui/icons-material/Close";
import SportsEsportsIcon        from "@mui/icons-material/SportsEsports";
import WorkIcon                 from "@mui/icons-material/Work";
import SchoolIcon               from "@mui/icons-material/School";
import CoffeeIcon               from "@mui/icons-material/Coffee";
import BoltIcon                 from "@mui/icons-material/Bolt";
import ListAltIcon              from "@mui/icons-material/ListAlt";
import PsychologyIcon           from "@mui/icons-material/Psychology";
import WhatshotIcon             from "@mui/icons-material/Whatshot";
import WarningAmberIcon         from "@mui/icons-material/WarningAmber";
import CheckBoxIcon             from "@mui/icons-material/CheckBox";
import RocketLaunchIcon         from "@mui/icons-material/RocketLaunch";
import ScienceIcon              from "@mui/icons-material/Science";
import ForumIcon                from "@mui/icons-material/Forum";
import QuizIcon                 from "@mui/icons-material/Quiz";
import LocationOnIcon           from "@mui/icons-material/LocationOn";
import EventIcon                from "@mui/icons-material/Event";
import TimerIcon                from "@mui/icons-material/Timer";
import BarChartIcon             from "@mui/icons-material/BarChart";

import {
  MOCK_ASSIGNMENTS, MOCK_EXAMS, MOCK_PLANNER_BLOCKS, MOCK_PROGRESS,
} from "./mockStatData/index";
import type {
  TrackerAssignment, TrackerExam, DayPlannerBlock, SubTask,
  ExamConcept, ConceptResource, AssignmentWeight, AssignmentPriority,
  ExamType, PlannerBlockType, FilterOption, SortOption, CourseRef,
} from "./mockStatData/types";
import type { CourseItem } from "../shared/constants";

ChartJS.register(
  ArcElement, BarElement, CategoryScale, LinearScale,
  LineElement, PointElement, Filler, ChartTooltip, Legend
);

// Maps card color names to hex accents
const CARD_COLOR_ACCENT: Record<string, string> = {
  default: "#A80532", red: "#A80532", sky: "#2563eb", violet: "#7c3aed",
  teal: "#0d9488", amber: "#d97706", green: "#15803d", rose: "#e11d48",
  indigo: "#4338ca", orange: "#c2410c", cyan: "#0891b2", pink: "#db2777",
};

/** Build CourseRef[] from live CourseItem[] */
function buildCourseRefs(courses: CourseItem[]): CourseRef[] {
  return courses.map((c) => ({
    id: c.id, subject: c.subject, number: c.number, title: c.title,
    cardColor: c.cardColor ?? "default",
    colorAccent: CARD_COLOR_ACCENT[c.cardColor ?? "default"] ?? "#A80532",
  }));
}

// ─── Color palettes ───────────────────────────────────────────────────────────
const PRIORITY_COLORS: Record<AssignmentPriority, string> = {
  low: "#6b7280", medium: "#f59e0b", high: "#ef4444", critical: "#dc2626",
};

const WEIGHT_ICONS: Record<string, React.ReactNode> = {
  homework:   <ListAltIcon sx={{ fontSize: 11 }} />,
  quiz:       <QuizIcon sx={{ fontSize: 11 }} />,
  project:    <RocketLaunchIcon sx={{ fontSize: 11 }} />,
  exam:       <AssignmentIcon sx={{ fontSize: 11 }} />,
  lab:        <ScienceIcon sx={{ fontSize: 11 }} />,
  discussion: <ForumIcon sx={{ fontSize: 11 }} />,
};

const PLANNER_TYPE_CONFIG: Record<PlannerBlockType, { color: string; icon: React.ReactNode; label: string }> = {
  class:      { color: "#2563eb", icon: <SchoolIcon sx={{ fontSize: 13 }} />,        label: "Class"      },
  study:      { color: "#7c3aed", icon: <MenuBookIcon sx={{ fontSize: 13 }} />,       label: "Study"      },
  work:       { color: "#d97706", icon: <WorkIcon sx={{ fontSize: 13 }} />,           label: "Work"       },
  assignment: { color: "#0d9488", icon: <AssignmentIcon sx={{ fontSize: 13 }} />,    label: "Assignment" },
  leisure:    { color: "#e11d48", icon: <SportsEsportsIcon sx={{ fontSize: 13 }} />, label: "Leisure"    },
  break:      { color: "#6b7280", icon: <CoffeeIcon sx={{ fontSize: 13 }} />,         label: "Break"      },
  other:      { color: "#374151", icon: <BoltIcon sx={{ fontSize: 13 }} />,           label: "Other"      },
};

const MASTERY_CONFIG = [
  { label: "Not Started", color: "#e5e7eb", textColor: "#6b7280" },
  { label: "Reviewing",   color: "#fef3c7", textColor: "#b45309" },
  { label: "Familiar",    color: "#dbeafe", textColor: "#2563eb" },
  { label: "Mastered",    color: "#dcfce7", textColor: "#16a34a" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const daysUntil = (iso: string) =>
  dayjs(iso).startOf("day").diff(dayjs().startOf("day"), "day");
const fmtDate = (iso: string) => dayjs(iso).format("MMM D");
const fmtDateTime = (iso: string) => dayjs(iso).format("MMM D, h:mm A");
const uid = () => Math.random().toString(36).slice(2, 10);
const nowIso = () => new Date().toISOString();

function urgencyLabel(d: number, completed?: boolean) {
  if (completed) return { text: "Done",    color: "#16a34a", bg: "#dcfce7" };
  if (d < 0)    return { text: "Overdue", color: "#9ca3af", bg: "#f3f4f6" };
  if (d === 0)  return { text: "Today",   color: "#dc2626", bg: "#fee2e2" };
  if (d <= 2)   return { text: `${d}d`,   color: "#ef4444", bg: "#fee2e2" };
  if (d <= 5)   return { text: `${d}d`,   color: "#f59e0b", bg: "#fef3c7" };
  return          { text: `${d}d`,         color: "#6b7280", bg: "#f3f4f6" };
}

// ─── Reusable UI atoms ────────────────────────────────────────────────────────

function CourseChip({ courseCode, color }: { courseCode: string; color: string }) {
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.4,
      px: 0.9, py: 0.1, borderRadius: 999,
      bgcolor: color + "18", border: `1.5px solid ${color}40`,
      fontSize: "0.63rem", fontWeight: 900, color, letterSpacing: 0.8,
      fontFamily: "'DM Mono', monospace", flexShrink: 0,
    }}>
      <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: color }} />
      {courseCode}
    </Box>
  );
}

function UrgencyBadge({ date, completed }: { date: string; completed?: boolean }) {
  const d = daysUntil(date);
  const { text, color, bg } = urgencyLabel(d, completed);
  return (
    <Box sx={{ px: 0.9, py: 0.2, borderRadius: 999, fontSize: "0.62rem", fontWeight: 900, color, bgcolor: bg, flexShrink: 0 }}>
      {text}
    </Box>
  );
}

function SectionHeader({ icon, title, count, action }: {
  icon: React.ReactNode; title: string; count?: number; action?: React.ReactNode;
}) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "rgba(168,5,50,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </Box>
        <Typography sx={{ fontWeight: 900, fontSize: "0.92rem", letterSpacing: "-0.01em" }}>{title}</Typography>
        {count !== undefined && (
          <Box sx={{ px: 0.9, py: 0.1, borderRadius: 999, bgcolor: "#A80532", fontSize: "0.65rem", fontWeight: 900, color: "#fff" }}>
            {count}
          </Box>
        )}
      </Stack>
      {action}
    </Stack>
  );
}

// ─── SubtaskPanel ─────────────────────────────────────────────────────────────
function SubtaskPanel({ assignment, subtasks, onToggle, onAdd, onDelete }: {
  assignment: TrackerAssignment;
  subtasks: SubTask[];
  onToggle: (id: string) => void;
  onAdd: (title: string, dueDay?: string, estimatedMinutes?: number) => void;
  onDelete: (id: string) => void;
}) {
  const [newTitle, setNewTitle] = React.useState("");
  const [newDay, setNewDay] = React.useState("");
  const [newMins, setNewMins] = React.useState("");
  const done = subtasks.filter((s) => s.completed).length;
  const pct = subtasks.length > 0 ? (done / subtasks.length) * 100 : 0;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <LinearProgress variant="determinate" value={pct} sx={{
          flex: 1, height: 6, borderRadius: 999,
          bgcolor: assignment.courseColor + "20",
          "& .MuiLinearProgress-bar": { bgcolor: pct === 100 ? "#16a34a" : assignment.courseColor, borderRadius: 999 },
        }} />
        <Typography sx={{ fontSize: "0.70rem", fontWeight: 900, color: pct === 100 ? "#16a34a" : assignment.courseColor, minWidth: 40 }}>
          {done}/{subtasks.length}
        </Typography>
      </Stack>

      <Stack spacing={0.5} sx={{ mb: 1.25 }}>
        {subtasks.map((s) => (
          <Stack key={s.id} direction="row" alignItems="center" spacing={0.75} sx={{
            px: 1, py: 0.5, borderRadius: 2,
            bgcolor: s.completed ? "rgba(22,163,74,0.05)" : "rgba(0,0,0,0.03)",
            border: `1px solid ${s.completed ? "rgba(22,163,74,0.15)" : "rgba(0,0,0,0.06)"}`,
          }}>
            <IconButton size="small" sx={{ p: 0.25 }} onClick={() => onToggle(s.id)}>
              {s.completed
                ? <CheckCircleIcon sx={{ fontSize: 16, color: "#16a34a" }} />
                : <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: "rgba(0,0,0,0.30)" }} />}
            </IconButton>
            <Typography sx={{
              fontSize: "0.78rem", flex: 1, fontWeight: 600,
              textDecoration: s.completed ? "line-through" : "none",
              color: s.completed ? "rgba(0,0,0,0.40)" : "#1a1a2e",
            }}>
              {s.title}
            </Typography>
            {s.dueDay && (
              <Typography sx={{ fontSize: "0.62rem", color: "rgba(0,0,0,0.40)" }}>{fmtDate(s.dueDay)}</Typography>
            )}
            {s.estimatedMinutes && (
              <Stack direction="row" alignItems="center" spacing={0.25}>
                <AccessTimeIcon sx={{ fontSize: 10, color: "rgba(0,0,0,0.35)" }} />
                <Typography sx={{ fontSize: "0.60rem", color: "rgba(0,0,0,0.40)" }}>{s.estimatedMinutes}m</Typography>
              </Stack>
            )}
            <IconButton size="small" sx={{ p: 0.2, opacity: 0.4, "&:hover": { opacity: 1, color: "#ef4444" } }}
              onClick={() => onDelete(s.id)}>
              <CloseIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Stack>
        ))}
      </Stack>

      <Stack direction="row" spacing={0.75} alignItems="center">
        <TextField size="small" placeholder="Add a step…" value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newTitle.trim()) {
              onAdd(newTitle.trim(), newDay || undefined, newMins ? Number(newMins) : undefined);
              setNewTitle(""); setNewDay(""); setNewMins("");
            }
          }}
          sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.78rem", "& fieldset": { borderColor: "#e8eaed" } } }}
        />
        <TextField size="small" type="date" value={newDay} onChange={(e) => setNewDay(e.target.value)}
          sx={{ width: 130, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.75rem", "& fieldset": { borderColor: "#e8eaed" } } }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField size="small" placeholder="min" value={newMins} onChange={(e) => setNewMins(e.target.value)} type="number"
          sx={{ width: 66, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.75rem", "& fieldset": { borderColor: "#e8eaed" } } }}
        />
        <IconButton size="small" onClick={() => {
          if (newTitle.trim()) {
            onAdd(newTitle.trim(), newDay || undefined, newMins ? Number(newMins) : undefined);
            setNewTitle(""); setNewDay(""); setNewMins("");
          }
        }} sx={{ bgcolor: assignment.courseColor, color: "#fff", borderRadius: 2, p: 0.75, "&:hover": { bgcolor: assignment.courseColor + "dd" } }}>
          <AddIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Stack>
    </Box>
  );
}

// ─── AssignmentCard ───────────────────────────────────────────────────────────
function AssignmentCard({ assignment, onToggle, onToggleStar, onDelete, onSubtaskToggle, onSubtaskAdd, onSubtaskDelete }: {
  assignment: TrackerAssignment;
  onToggle: (id: string) => void;
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => void;
  onSubtaskToggle: (assignmentId: string, subtaskId: string) => void;
  onSubtaskAdd: (assignmentId: string, title: string, dueDay?: string, estimatedMinutes?: number) => void;
  onSubtaskDelete: (assignmentId: string, subtaskId: string) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const color = assignment.courseColor;
  const done = assignment.subtasks.filter((s) => s.completed).length;
  const pct = assignment.subtasks.length > 0 ? (done / assignment.subtasks.length) * 100 : 0;

  return (
    <Paper elevation={0} sx={{
      borderRadius: "12px", overflow: "hidden",
      border: `1.5px solid ${assignment.completed ? "rgba(22,163,74,0.20)" : color + "30"}`,
      bgcolor: assignment.completed ? "rgba(22,163,74,0.03)" : color + "08",
      transition: "all 0.2s ease",
      "&:hover": { boxShadow: `0 4px 20px ${color}20`, borderColor: color + "60" },
      opacity: assignment.completed ? 0.75 : 1,
    }}>
      <Box sx={{ display: "flex" }}>
        <Box sx={{ width: 3, bgcolor: assignment.completed ? "#16a34a" : color, flexShrink: 0 }} />
        <Box sx={{ flex: 1, p: 1.5 }}>
          <Stack direction="row" alignItems="flex-start" spacing={1}>
            <IconButton size="small" sx={{ p: 0.25, mt: -0.25 }} onClick={() => onToggle(assignment.id)}>
              {assignment.completed
                ? <CheckCircleIcon sx={{ fontSize: 20, color: "#16a34a" }} />
                : <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: "rgba(0,0,0,0.25)" }} />}
            </IconButton>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap" sx={{ mb: 0.3 }}>
                <CourseChip courseCode={assignment.courseCode} color={color} />
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, px: 0.75, py: 0.1, borderRadius: 999, bgcolor: "rgba(0,0,0,0.05)", fontSize: "0.60rem", fontWeight: 700, color: "rgba(0,0,0,0.50)" }}>
                  {WEIGHT_ICONS[assignment.weight]}
                  <span>{assignment.weight}</span>
                </Box>
                <Box sx={{ px: 0.75, py: 0.1, borderRadius: 999, bgcolor: PRIORITY_COLORS[assignment.priority] + "18", fontSize: "0.60rem", fontWeight: 900, color: PRIORITY_COLORS[assignment.priority] }}>
                  {assignment.priority}
                </Box>
                <Typography sx={{ fontSize: "0.60rem", fontWeight: 700, color }}>{assignment.points}pts</Typography>
              </Stack>

              <Typography sx={{ fontWeight: 800, fontSize: "0.88rem", color: "#1a1a2e", textDecoration: assignment.completed ? "line-through" : "none", lineHeight: 1.25 }}>
                {assignment.title}
              </Typography>

              {assignment.description && (
                <Typography sx={{ fontSize: "0.72rem", color: "rgba(0,0,0,0.50)", mt: 0.2, lineHeight: 1.4 }}>
                  {assignment.description}
                </Typography>
              )}

              {assignment.subtasks.length > 0 && !expanded && (
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.75 }}>
                  <LinearProgress variant="determinate" value={pct} sx={{
                    width: 80, height: 4, borderRadius: 999, bgcolor: color + "20",
                    "& .MuiLinearProgress-bar": { bgcolor: pct === 100 ? "#16a34a" : color, borderRadius: 999 },
                  }} />
                  <Typography sx={{ fontSize: "0.62rem", color: "rgba(0,0,0,0.45)", fontWeight: 700 }}>
                    {done}/{assignment.subtasks.length} steps
                  </Typography>
                </Stack>
              )}
            </Box>

            <Stack direction="row" alignItems="center" spacing={0.25}>
              <UrgencyBadge date={assignment.dueDate} completed={assignment.completed} />
              <Typography sx={{ fontSize: "0.65rem", color: "rgba(0,0,0,0.40)" }}>{fmtDate(assignment.dueDate)}</Typography>
              <IconButton size="small" sx={{ p: 0.3, color: assignment.starred ? "#f59e0b" : "rgba(0,0,0,0.25)" }}
                onClick={() => onToggleStar(assignment.id)}>
                {assignment.starred ? <StarIcon sx={{ fontSize: 15 }} /> : <StarBorderIcon sx={{ fontSize: 15 }} />}
              </IconButton>
              <IconButton size="small" sx={{ p: 0.3 }} onClick={() => setExpanded(!expanded)}>
                {expanded ? <ExpandLessIcon sx={{ fontSize: 15, color }} /> : <ExpandMoreIcon sx={{ fontSize: 15, color: "rgba(0,0,0,0.35)" }} />}
              </IconButton>
              <IconButton size="small" sx={{ p: 0.3, opacity: 0.35, "&:hover": { opacity: 1, color: "#ef4444" } }}
                onClick={() => onDelete(assignment.id)}>
                <DeleteOutlineIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Stack>
          </Stack>

          <Collapse in={expanded}>
            <Box sx={{ mt: 1.25, pt: 1.25, borderTop: `1px dashed ${color}30` }}>
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
                <ListAltIcon sx={{ fontSize: 13, color: "rgba(0,0,0,0.45)" }} />
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 900, color: "rgba(0,0,0,0.45)", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Step Breakdown
                </Typography>
              </Stack>
              <SubtaskPanel
                assignment={assignment} subtasks={assignment.subtasks}
                onToggle={(subtaskId) => onSubtaskToggle(assignment.id, subtaskId)}
                onAdd={(title, dueDay, mins) => onSubtaskAdd(assignment.id, title, dueDay, mins)}
                onDelete={(subtaskId) => onSubtaskDelete(assignment.id, subtaskId)}
              />
            </Box>
          </Collapse>
        </Box>
      </Box>
    </Paper>
  );
}

// ─── ResourceItem ─────────────────────────────────────────────────────────────
function ResourceItem({ resource, onDelete }: { resource: ConceptResource; onDelete: () => void }) {
  const icons: Record<string, React.ReactNode> = {
    link: <LinkIcon sx={{ fontSize: 12 }} />, pdf: <AttachFileIcon sx={{ fontSize: 12 }} />,
    image: <ImageIcon sx={{ fontSize: 12 }} />, note: <EditIcon sx={{ fontSize: 12 }} />,
  };
  const colors: Record<string, string> = { link: "#2563eb", pdf: "#dc2626", image: "#7c3aed", note: "#0d9488" };

  return (
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{
      px: 1, py: 0.5, borderRadius: 2,
      bgcolor: colors[resource.type] + "10", border: `1px solid ${colors[resource.type]}25`,
    }}>
      <Box sx={{ color: colors[resource.type] }}>{icons[resource.type]}</Box>
      {resource.url
        ? <Box component="a" href={resource.url} target="_blank" rel="noopener noreferrer"
            sx={{ fontSize: "0.72rem", fontWeight: 700, color: colors[resource.type], textDecoration: "none", "&:hover": { textDecoration: "underline" }, flex: 1 }}>
            {resource.label}
          </Box>
        : <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, flex: 1, color: "#333" }}>{resource.label}</Typography>
      }
      <IconButton size="small" sx={{ p: 0.2, opacity: 0.4, "&:hover": { opacity: 1, color: "#ef4444" } }} onClick={onDelete}>
        <CloseIcon sx={{ fontSize: 11 }} />
      </IconButton>
    </Stack>
  );
}

// ─── ExamConceptCard ──────────────────────────────────────────────────────────
function ExamConceptCard({ concept, color, onMastery, onToggle, onDelete, onAddResource, onDeleteResource }: {
  concept: ExamConcept; color: string;
  onMastery: (id: string, level: 0 | 1 | 2 | 3) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddResource: (conceptId: string, type: "link" | "note", label: string, url?: string) => void;
  onDeleteResource: (conceptId: string, resourceId: string) => void;
}) {
  const [showAdd, setShowAdd] = React.useState(false);
  const [resLabel, setResLabel] = React.useState("");
  const [resUrl, setResUrl] = React.useState("");
  const [resType, setResType] = React.useState<"link" | "note">("link");

  return (
    <Paper elevation={0} sx={{
      p: 1.25, borderRadius: 3,
      border: `1.5px solid ${concept.completed ? "rgba(22,163,74,0.25)" : "rgba(0,0,0,0.07)"}`,
      bgcolor: concept.completed ? "rgba(22,163,74,0.03)" : "#fff",
    }}>
      <Stack direction="row" alignItems="flex-start" spacing={1}>
        <IconButton size="small" sx={{ p: 0.25, mt: -0.25 }} onClick={() => onToggle(concept.id)}>
          {concept.completed
            ? <CheckCircleIcon sx={{ fontSize: 18, color: "#16a34a" }} />
            : <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: "rgba(0,0,0,0.25)" }} />}
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.25 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.84rem", color: "#1a1a2e", textDecoration: concept.completed ? "line-through" : "none" }}>
              {concept.title}
            </Typography>
            {concept.category && (
              <Box sx={{ px: 0.75, py: 0.1, borderRadius: 999, bgcolor: color + "15", fontSize: "0.60rem", fontWeight: 700, color }}>
                {concept.category}
              </Box>
            )}
          </Stack>

          <Stack direction="row" spacing={0.4} sx={{ mb: 0.75 }}>
            {MASTERY_CONFIG.map((m, i) => (
              <Box key={i} onClick={() => onMastery(concept.id, i as 0|1|2|3)} sx={{
                px: 0.75, py: 0.15, borderRadius: 999, cursor: "pointer",
                bgcolor: concept.masteryLevel === i ? m.color : "rgba(0,0,0,0.04)",
                border: `1.5px solid ${concept.masteryLevel === i ? m.textColor + "40" : "transparent"}`,
                fontSize: "0.58rem", fontWeight: 900,
                color: concept.masteryLevel === i ? m.textColor : "rgba(0,0,0,0.35)",
                transition: "all 0.15s",
                "&:hover": { bgcolor: m.color, color: m.textColor },
              }}>
                {m.label}
              </Box>
            ))}
          </Stack>

          {concept.notes && (
            <Typography sx={{ fontSize: "0.70rem", color: "rgba(0,0,0,0.50)", mb: 0.75, fontStyle: "italic" }}>
              {concept.notes}
            </Typography>
          )}

          {concept.resources.length > 0 && (
            <Stack spacing={0.4} sx={{ mb: 0.75 }}>
              {concept.resources.map((r) => (
                <ResourceItem key={r.id} resource={r} onDelete={() => onDeleteResource(concept.id, r.id)} />
              ))}
            </Stack>
          )}

          <Collapse in={showAdd}>
            <Stack direction="row" spacing={0.5} sx={{ mb: 0.75 }}>
              <Select size="small" value={resType} onChange={(e) => setResType(e.target.value as any)}
                sx={{ width: 80, fontSize: "0.75rem", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}>
                <MenuItem value="link">Link</MenuItem>
                <MenuItem value="note">Note</MenuItem>
              </Select>
              <TextField size="small" placeholder="Label" value={resLabel} onChange={(e) => setResLabel(e.target.value)}
                sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.75rem", "& fieldset": { borderColor: "#e8eaed" } } }} />
              {resType === "link" && (
                <TextField size="small" placeholder="URL" value={resUrl} onChange={(e) => setResUrl(e.target.value)}
                  sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.75rem", "& fieldset": { borderColor: "#e8eaed" } } }} />
              )}
              <IconButton size="small" sx={{ bgcolor: color, color: "#fff", borderRadius: 2, p: 0.75, "&:hover": { bgcolor: color + "dd" } }}
                onClick={() => {
                  if (resLabel.trim()) {
                    onAddResource(concept.id, resType, resLabel.trim(), resUrl || undefined);
                    setResLabel(""); setResUrl(""); setShowAdd(false);
                  }
                }}>
                <AddIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Stack>
          </Collapse>

          <Button size="small" onClick={() => setShowAdd(!showAdd)} startIcon={<AddIcon sx={{ fontSize: 11 }} />}
            sx={{ fontSize: "0.65rem", fontWeight: 700, color: "rgba(0,0,0,0.40)", py: 0, px: 0.75, "&:hover": { color, bgcolor: color + "10" } }}>
            Add resource
          </Button>
        </Box>
        <IconButton size="small" sx={{ p: 0.3, opacity: 0.35, "&:hover": { opacity: 1, color: "#ef4444" } }}
          onClick={() => onDelete(concept.id)}>
          <DeleteOutlineIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Stack>
    </Paper>
  );
}

// ─── ExamCard ─────────────────────────────────────────────────────────────────
function ExamCard({ exam, onDelete, onConceptMastery, onConceptToggle, onConceptDelete, onConceptAdd, onAddResource, onDeleteResource }: {
  exam: TrackerExam;
  onDelete: (id: string) => void;
  onConceptMastery: (examId: string, conceptId: string, level: 0|1|2|3) => void;
  onConceptToggle: (examId: string, conceptId: string) => void;
  onConceptDelete: (examId: string, conceptId: string) => void;
  onConceptAdd: (examId: string, title: string, category?: string) => void;
  onAddResource: (examId: string, conceptId: string, type: "link"|"note", label: string, url?: string) => void;
  onDeleteResource: (examId: string, conceptId: string, resourceId: string) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const [newConcept, setNewConcept] = React.useState("");
  const [newCategory, setNewCategory] = React.useState("");
  const color = exam.courseColor;
  const mastered = exam.concepts.filter((c) => c.masteryLevel === 3).length;
  const pct = exam.concepts.length > 0 ? (mastered / exam.concepts.length) * 100 : 0;
  const masteryDistrib = [0,1,2,3].map((level) => exam.concepts.filter((c) => c.masteryLevel === level).length);

  return (
    <Paper elevation={0} sx={{
      borderRadius: "12px", overflow: "hidden",
      border: `1.5px solid ${color}35`, bgcolor: color + "06",
      "&:hover": { boxShadow: `0 4px 20px ${color}20` }, transition: "all 0.2s ease",
    }}>
      <Box sx={{ display: "flex" }}>
        <Box sx={{ width: 3, bgcolor: color, flexShrink: 0 }} />
        <Box sx={{ flex: 1, p: 1.5 }}>
          <Stack direction="row" alignItems="flex-start" spacing={1}>
            <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: color + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <MenuBookIcon sx={{ fontSize: 18, color }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap" sx={{ mb: 0.2 }}>
                <CourseChip courseCode={exam.courseCode} color={color} />
                <Box sx={{ px: 0.75, py: 0.1, borderRadius: 999, bgcolor: color + "18", fontSize: "0.60rem", fontWeight: 900, color }}>{exam.type}</Box>
              </Stack>
              <Typography sx={{ fontWeight: 900, fontSize: "0.92rem", color: "#1a1a2e", lineHeight: 1.2 }}>{exam.title}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.3 }} flexWrap="wrap">
                <Stack direction="row" alignItems="center" spacing={0.3}>
                  <EventIcon sx={{ fontSize: 11, color: "rgba(0,0,0,0.40)" }} />
                  <Typography sx={{ fontSize: "0.70rem", color: "rgba(0,0,0,0.50)" }}>{fmtDateTime(exam.date)}</Typography>
                </Stack>
                {exam.location && (
                  <Stack direction="row" alignItems="center" spacing={0.3}>
                    <LocationOnIcon sx={{ fontSize: 11, color: "rgba(0,0,0,0.35)" }} />
                    <Typography sx={{ fontSize: "0.70rem", color: "rgba(0,0,0,0.45)" }}>{exam.location}</Typography>
                  </Stack>
                )}
                {exam.duration && (
                  <Stack direction="row" alignItems="center" spacing={0.3}>
                    <TimerIcon sx={{ fontSize: 11, color: "rgba(0,0,0,0.35)" }} />
                    <Typography sx={{ fontSize: "0.70rem", color: "rgba(0,0,0,0.45)" }}>{exam.duration}min</Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
            <Stack alignItems="flex-end" spacing={0.5}>
              <UrgencyBadge date={exam.date} />
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <IconButton size="small" sx={{ p: 0.3 }} onClick={() => setExpanded(!expanded)}>
                  {expanded ? <ExpandLessIcon sx={{ fontSize: 15, color }} /> : <ExpandMoreIcon sx={{ fontSize: 15, color: "rgba(0,0,0,0.35)" }} />}
                </IconButton>
                <IconButton size="small" sx={{ p: 0.3, opacity: 0.35, "&:hover": { opacity: 1, color: "#ef4444" } }} onClick={() => onDelete(exam.id)}>
                  <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Stack>
            </Stack>
          </Stack>

          <Box sx={{ mt: 1.25 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 900, color: "rgba(0,0,0,0.45)", textTransform: "uppercase", letterSpacing: 0.8 }}>
                Concept Mastery
              </Typography>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 900, color: pct === 100 ? "#16a34a" : color }}>
                {mastered}/{exam.concepts.length} mastered
              </Typography>
            </Stack>
            <Box sx={{ height: 8, borderRadius: 999, overflow: "hidden", display: "flex", bgcolor: "rgba(0,0,0,0.06)" }}>
              {masteryDistrib.map((count, i) => (
                <Box key={i} sx={{ flex: count, bgcolor: MASTERY_CONFIG[i].textColor + (i === 0 ? "00" : "cc"), transition: "flex 0.4s ease" }} />
              ))}
            </Box>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              {MASTERY_CONFIG.map((m, i) => masteryDistrib[i] > 0 && (
                <Stack key={i} direction="row" alignItems="center" spacing={0.3}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: m.textColor }} />
                  <Typography sx={{ fontSize: "0.58rem", color: m.textColor, fontWeight: 700 }}>{masteryDistrib[i]} {m.label}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Collapse in={expanded}>
            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px dashed ${color}30` }}>
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
                <PsychologyIcon sx={{ fontSize: 14, color: "rgba(0,0,0,0.45)" }} />
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 900, color: "rgba(0,0,0,0.45)", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Concepts to Cover
                </Typography>
              </Stack>
              <Stack spacing={0.75} sx={{ mb: 1.25 }}>
                {exam.concepts.map((c) => (
                  <ExamConceptCard key={c.id} concept={c} color={color}
                    onMastery={(cId, level) => onConceptMastery(exam.id, cId, level)}
                    onToggle={(cId) => onConceptToggle(exam.id, cId)}
                    onDelete={(cId) => onConceptDelete(exam.id, cId)}
                    onAddResource={(cId, type, label, url) => onAddResource(exam.id, cId, type, label, url)}
                    onDeleteResource={(cId, rId) => onDeleteResource(exam.id, cId, rId)}
                  />
                ))}
              </Stack>
              <Stack direction="row" spacing={0.75}>
                <TextField size="small" placeholder="Add concept to study…" value={newConcept}
                  onChange={(e) => setNewConcept(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && newConcept.trim()) { onConceptAdd(exam.id, newConcept.trim(), newCategory || undefined); setNewConcept(""); setNewCategory(""); } }}
                  sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.78rem", "& fieldset": { borderColor: "#e8eaed" } } }} />
                <TextField size="small" placeholder="Category (opt.)" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                  sx={{ width: 130, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.75rem", "& fieldset": { borderColor: "#e8eaed" } } }} />
                <IconButton size="small" onClick={() => { if (newConcept.trim()) { onConceptAdd(exam.id, newConcept.trim(), newCategory || undefined); setNewConcept(""); setNewCategory(""); } }}
                  sx={{ bgcolor: color, color: "#fff", borderRadius: 2, p: 0.75, "&:hover": { bgcolor: color + "dd" } }}>
                  <AddIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Stack>
            </Box>
          </Collapse>
        </Box>
      </Box>
    </Paper>
  );
}

// ─── DayPlanner ───────────────────────────────────────────────────────────────
function DayPlanner({ blocks, courses, onAdd, onDelete }: {
  blocks: DayPlannerBlock[];
  courses: CourseRef[];
  onAdd: (block: Omit<DayPlannerBlock, "id" | "createdAt">) => void;
  onDelete: (id: string) => void;
}) {
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [newTitle, setNewTitle] = React.useState("");
  const [newStart, setNewStart] = React.useState("09:00");
  const [newEnd, setNewEnd] = React.useState("10:00");
  const [newType, setNewType] = React.useState<PlannerBlockType>("study");
  const [newCourse, setNewCourse] = React.useState("");

  const dayBlocks = blocks.filter((b) => b.date === selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const hours = Array.from({ length: 17 }, (_, i) => i + 7);
  const toMinutes = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const totalMinutes = 17 * 60;
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const nowPct = ((nowMinutes - 7 * 60) / totalMinutes) * 100;
  const isToday = selectedDate === new Date().toISOString().split("T")[0];
  const blockColor = PLANNER_TYPE_CONFIG[newType].color;

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 300px" }, gap: 2 }}>
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid rgba(0,0,0,0.07)", overflow: "hidden" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 900, fontSize: "0.82rem", color: "rgba(0,0,0,0.50)", textTransform: "uppercase", letterSpacing: 0.8 }}>
            {dayjs(selectedDate).format("dddd, MMMM D")}
          </Typography>
          <TextField size="small" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "#e8eaed" }, fontSize: "0.78rem" } }}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>

        <Box sx={{ position: "relative" }}>
          {hours.map((h) => (
            <Box key={h} sx={{ display: "flex", alignItems: "flex-start", mb: 0, minHeight: 52, position: "relative" }}>
              <Typography sx={{ fontSize: "0.60rem", color: "rgba(0,0,0,0.30)", fontWeight: 700, minWidth: 36, pt: 0.25, fontFamily: "'DM Mono', monospace" }}>
                {h === 12 ? "12pm" : h > 12 ? `${h-12}pm` : `${h}am`}
              </Typography>
              <Box sx={{ flex: 1, borderTop: "1px solid rgba(0,0,0,0.06)", ml: 0.5, minHeight: 52, position: "relative" }} />
            </Box>
          ))}

          {isToday && nowPct > 0 && nowPct < 100 && (
            <Box sx={{
              position: "absolute", left: 36, right: 0, top: `${nowPct}%`, height: 2, bgcolor: "#ef4444", zIndex: 10,
              "&::before": { content: '""', position: "absolute", left: -4, top: -3, width: 8, height: 8, borderRadius: "50%", bgcolor: "#ef4444" },
            }} />
          )}

          {dayBlocks.map((block) => {
            const startM = toMinutes(block.startTime) - 7 * 60;
            const endM = toMinutes(block.endTime) - 7 * 60;
            const top = (startM / totalMinutes) * 100;
            const height = Math.max(((endM - startM) / totalMinutes) * 100, 2);
            const cfg = PLANNER_TYPE_CONFIG[block.type];
            const blockC = block.courseColor ?? cfg.color;
            return (
              <Box key={block.id} sx={{
                position: "absolute", left: 40, right: 0, top: `${top}%`, height: `${height}%`,
                minHeight: 28, bgcolor: blockC + "18", borderLeft: `3px solid ${blockC}`,
                borderRadius: "0 8px 8px 0", px: 1, py: 0.5,
                display: "flex", alignItems: "center", justifyContent: "space-between", overflow: "hidden",
              }}>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0, overflow: "hidden" }}>
                  <Box sx={{ color: blockC, flexShrink: 0 }}>{cfg.icon}</Box>
                  <Typography sx={{ fontSize: "0.70rem", fontWeight: 800, color: blockC, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {block.title}
                  </Typography>
                  <Typography sx={{ fontSize: "0.58rem", color: "rgba(0,0,0,0.40)", flexShrink: 0 }}>{block.startTime}–{block.endTime}</Typography>
                </Stack>
                <IconButton size="small" sx={{ p: 0.2, opacity: 0.4, "&:hover": { opacity: 1, color: "#ef4444" }, flexShrink: 0 }} onClick={() => onDelete(block.id)}>
                  <CloseIcon sx={{ fontSize: 11 }} />
                </IconButton>
              </Box>
            );
          })}
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid rgba(0,0,0,0.07)", alignSelf: "start" }}>
        <Typography sx={{ fontWeight: 900, fontSize: "0.80rem", color: "rgba(0,0,0,0.50)", mb: 1.5, textTransform: "uppercase", letterSpacing: 0.8 }}>
          Add Block
        </Typography>
        <Stack spacing={1.25}>
          <TextField size="small" label="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "#e8eaed" } } }} />

          <FormControl size="small" fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={newType} label="Type" onChange={(e) => setNewType(e.target.value as PlannerBlockType)}
              sx={{ borderRadius: 2, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}>
              {Object.entries(PLANNER_TYPE_CONFIG).map(([k, v]) => (
                <MenuItem key={k} value={k}>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Box sx={{ color: v.color }}>{v.icon}</Box>
                    {v.label}
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {courses.length > 0 && (
            <FormControl size="small" fullWidth>
              <InputLabel>Course (optional)</InputLabel>
              <Select value={newCourse} label="Course (optional)" onChange={(e) => setNewCourse(e.target.value)}
                sx={{ borderRadius: 2, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}>
                <MenuItem value=""><em>None</em></MenuItem>
                {courses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: c.colorAccent }} />
                      {c.subject} {c.number}
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Stack direction="row" spacing={0.75}>
            <TextField size="small" label="Start" type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "#e8eaed" } } }} />
            <TextField size="small" label="End" type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "#e8eaed" } } }} />
          </Stack>

          <Box sx={{ p: 1, borderRadius: 2, bgcolor: blockColor + "15", border: `1.5px solid ${blockColor}30`, borderLeft: `3px solid ${blockColor}` }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Box sx={{ color: blockColor }}>{PLANNER_TYPE_CONFIG[newType].icon}</Box>
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: blockColor }}>{newTitle || "Block title"}</Typography>
            </Stack>
            <Typography sx={{ fontSize: "0.60rem", color: "rgba(0,0,0,0.45)", mt: 0.2 }}>{newStart}–{newEnd}</Typography>
          </Box>

          <Button variant="contained" fullWidth onClick={() => {
            if (!newTitle.trim()) return;
            const course = courses.find((c) => c.id === newCourse);
            onAdd({ date: selectedDate, startTime: newStart, endTime: newEnd, type: newType, title: newTitle.trim(), courseId: newCourse || undefined, courseColor: course?.colorAccent });
            setNewTitle(""); setNewType("study"); setNewCourse("");
          }} sx={{ bgcolor: "#A80532", "&:hover": { bgcolor: "#8e0229" }, fontWeight: 800, borderRadius: 2, fontSize: "0.80rem", boxShadow: "0 2px 10px rgba(168,5,50,0.25)" }}>
            Add to Schedule
          </Button>
        </Stack>

        <Divider sx={{ my: 1.5 }} />
        <Typography sx={{ fontSize: "0.62rem", fontWeight: 900, color: "rgba(0,0,0,0.40)", mb: 0.75, textTransform: "uppercase", letterSpacing: 0.8 }}>
          Block Types
        </Typography>
        <Stack spacing={0.4}>
          {Object.entries(PLANNER_TYPE_CONFIG).map(([k, v]) => (
            <Stack key={k} direction="row" alignItems="center" spacing={0.75}>
              <Box sx={{ width: 3, height: 14, borderRadius: 999, bgcolor: v.color }} />
              <Box sx={{ color: v.color }}>{v.icon}</Box>
              <Typography sx={{ fontSize: "0.65rem", color: "rgba(0,0,0,0.55)" }}>{v.label}</Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}

// ─── StatsHub ─────────────────────────────────────────────────────────────────
function StatsHub({ assignments, exams, progress, courseRefs }: {
  assignments: TrackerAssignment[];
  exams: TrackerExam[];
  progress: { date: string; completed: number; total: number }[];
  courseRefs: CourseRef[];
}) {
  const total = assignments.length;
  const done = assignments.filter((a) => a.completed).length;
  const overdue = assignments.filter((a) => !a.completed && daysUntil(a.dueDate) < 0).length;
  const dueToday = assignments.filter((a) => !a.completed && daysUntil(a.dueDate) === 0).length;
  const dueSoon = assignments.filter((a) => !a.completed && daysUntil(a.dueDate) > 0 && daysUntil(a.dueDate) <= 3).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Build course color map from live courseRefs
  const courseCodeColorMap: Record<string, string> = {};
  courseRefs.forEach((c) => { courseCodeColorMap[`${c.subject} ${c.number}`] = c.colorAccent ?? "#6b7280"; });

  const courses = [...new Set(assignments.map((a) => a.courseCode))];

  // Doughnut: each segment uses its course color
  const doughnutColors = courses.map((c) => {
    const color = courseCodeColorMap[c] ?? assignments.find((a) => a.courseCode === c)?.courseColor ?? "#6b7280";
    return color;
  });

  const doughnutData = {
    labels: courses,
    datasets: [{
      data: courses.map((c) => assignments.filter((a) => a.courseCode === c && !a.completed).length),
      backgroundColor: doughnutColors,
      borderWidth: 3,
      borderColor: "#fff",
      hoverBorderWidth: 2,
    }],
  };

  const weekStart = dayjs().startOf("week");
  const weekLabels = Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day").format("ddd"));
  const weekDue  = Array.from({ length: 7 }, (_, i) => assignments.filter((a) => dayjs(a.dueDate).isSame(weekStart.add(i, "day"), "day")).length);
  const weekDone = Array.from({ length: 7 }, (_, i) => assignments.filter((a) => a.completed && dayjs(a.dueDate).isSame(weekStart.add(i, "day"), "day")).length);

  const lineData = {
    labels: progress.slice(-7).map((p) => dayjs(p.date).format("M/D")),
    datasets: [
      {
        label: "Completed",
        data: progress.slice(-7).map((p) => p.completed),
        borderColor: "#A80532", backgroundColor: "rgba(168,5,50,0.10)",
        fill: true, tension: 0.4, pointBackgroundColor: "#A80532", pointRadius: 4,
      },
      {
        label: "Total",
        data: progress.slice(-7).map((p) => p.total),
        borderColor: "rgba(0,0,0,0.15)", backgroundColor: "transparent",
        borderDash: [4, 2], tension: 0.4, pointRadius: 2,
      },
    ],
  };

  const upcomingExams = exams.filter((e) => daysUntil(e.date) >= 0).sort((a, b) => daysUntil(a.date) - daysUntil(b.date));

  const statCards = [
    { label: "Total Tasks", value: total,    color: "#6b7280", icon: <ListAltIcon sx={{ fontSize: 22 }} /> },
    { label: "Completed",   value: done,     color: "#16a34a", icon: <CheckBoxIcon sx={{ fontSize: 22 }} /> },
    { label: "Due Today",   value: dueToday, color: "#dc2626", icon: <WhatshotIcon sx={{ fontSize: 22 }} /> },
    { label: "Due Soon",    value: dueSoon,  color: "#f59e0b", icon: <BoltIcon sx={{ fontSize: 22 }} /> },
    { label: "Overdue",     value: overdue,  color: "#ef4444", icon: <WarningAmberIcon sx={{ fontSize: 22 }} /> },
    { label: "Progress",    value: `${pct}%`,color: "#A80532", icon: <BarChartIcon sx={{ fontSize: 22 }} /> },
  ];

  return (
    <Box>
      {/* Stat cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 1.25, mb: 2.5 }}>
        {statCards.map((s) => (
          <Paper key={s.label} elevation={0} sx={{
            p: 1.5, borderRadius: 3,
            bgcolor: s.color + "08", border: `1.5px solid ${s.color}20`,
            textAlign: "center",
          }}>
            <Box sx={{ color: s.color, display: "flex", justifyContent: "center", mb: 0.25 }}>{s.icon}</Box>
            <Typography sx={{ fontWeight: 950, fontSize: "1.4rem", color: s.color, lineHeight: 1.2 }}>{s.value}</Typography>
            <Typography sx={{ fontSize: "0.62rem", color: "rgba(0,0,0,0.50)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {s.label}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Charts */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 2.5 }}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid rgba(0,0,0,0.07)" }}>
          <Typography sx={{ fontWeight: 900, fontSize: "0.80rem", color: "rgba(0,0,0,0.50)", mb: 1.5, textTransform: "uppercase", letterSpacing: 0.8 }}>
            Pending by Course
          </Typography>
          <Box sx={{ height: 160, display: "flex", justifyContent: "center" }}>
            <Doughnut data={doughnutData} options={{
              responsive: true, maintainAspectRatio: false, cutout: "65%",
              plugins: {
                legend: {
                  position: "right",
                  labels: {
                    font: { size: 10 }, boxWidth: 10, padding: 6,
                    // Color each legend label text to match the course
                    generateLabels: (chart) => {
                      const ds = chart.data.datasets[0];
                      return (chart.data.labels as string[]).map((label, i) => ({
                        text: label,
                        fillStyle: (ds.backgroundColor as string[])[i],
                        strokeStyle: "#fff",
                        lineWidth: 2,
                        hidden: false,
                        index: i,
                        fontColor: (ds.backgroundColor as string[])[i],
                      }));
                    },
                  },
                },
              },
            }} />
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid rgba(0,0,0,0.07)" }}>
          <Typography sx={{ fontWeight: 900, fontSize: "0.80rem", color: "rgba(0,0,0,0.50)", mb: 1.5, textTransform: "uppercase", letterSpacing: 0.8 }}>
            This Week — Tasks Due
          </Typography>
          <Box sx={{ height: 160 }}>
            <Bar data={{
              labels: weekLabels,
              datasets: [
                { label: "Due",  data: weekDue,  backgroundColor: "#A8053235", borderColor: "#A80532", borderWidth: 1.5, borderRadius: 4 },
                { label: "Done", data: weekDone, backgroundColor: "#16a34a55", borderColor: "#16a34a", borderWidth: 1.5, borderRadius: 4 },
              ],
            }} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { labels: { font: { size: 10 }, boxWidth: 10 } } },
              scales: { x: { grid: { display: false }, ticks: { font: { size: 10 } } }, y: { ticks: { font: { size: 10 }, stepSize: 1 } } },
            }} />
          </Box>
        </Paper>
      </Box>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid rgba(0,0,0,0.07)", mb: 2.5 }}>
        <Typography sx={{ fontWeight: 900, fontSize: "0.80rem", color: "rgba(0,0,0,0.50)", mb: 1.5, textTransform: "uppercase", letterSpacing: 0.8 }}>
          7-Day Completion Trend
        </Typography>
        <Box sx={{ height: 140 }}>
          <Line data={lineData} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { font: { size: 10 }, boxWidth: 10 } } },
            scales: { x: { grid: { display: false }, ticks: { font: { size: 10 } } }, y: { ticks: { font: { size: 10 }, stepSize: 1 } } },
          }} />
        </Box>
      </Paper>

      {upcomingExams.length > 0 && (
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: "0.78rem", color: "rgba(0,0,0,0.50)", mb: 1, textTransform: "uppercase", letterSpacing: 0.8 }}>
            Upcoming Exams
          </Typography>
          <Stack spacing={0.75}>
            {upcomingExams.slice(0, 4).map((e) => {
              const d = daysUntil(e.date);
              const color = e.courseColor;
              const mastered = e.concepts.filter((c) => c.masteryLevel === 3).length;
              const pct = e.concepts.length > 0 ? (mastered / e.concepts.length) * 100 : 0;
              return (
                <Paper key={e.id} elevation={0} sx={{
                  p: 1.25, borderRadius: 3,
                  border: `1.5px solid ${color}25`, bgcolor: color + "06",
                  display: "flex", alignItems: "center", gap: 1.5,
                }}>
                  <Box sx={{
                    width: 44, height: 44, borderRadius: "10px", bgcolor: color + "20",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Typography sx={{ fontSize: "1.1rem", fontWeight: 950, color, lineHeight: 1 }}>{d}</Typography>
                    <Typography sx={{ fontSize: "0.55rem", fontWeight: 800, color: color + "aa", textTransform: "uppercase" }}>days</Typography>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.2 }}>
                      <CourseChip courseCode={e.courseCode} color={color} />
                      <Typography sx={{ fontSize: "0.62rem", color: "rgba(0,0,0,0.40)" }}>{e.type}</Typography>
                    </Stack>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.84rem", color: "#1a1a2e" }}>{e.title}</Typography>
                    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.4 }}>
                      <LinearProgress variant="determinate" value={pct} sx={{
                        width: 80, height: 4, borderRadius: 999, bgcolor: color + "20",
                        "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 999 },
                      }} />
                      <Typography sx={{ fontSize: "0.62rem", color: "rgba(0,0,0,0.45)" }}>
                        {mastered}/{e.concepts.length} concepts
                      </Typography>
                    </Stack>
                  </Box>
                  <Typography sx={{ fontSize: "0.68rem", color: "rgba(0,0,0,0.40)", flexShrink: 0 }}>{fmtDate(e.date)}</Typography>
                </Paper>
              );
            })}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

// ─── AddAssignmentDialog ──────────────────────────────────────────────────────
function AddAssignmentDialog({ open, onClose, courses, onAdd }: {
  open: boolean; onClose: () => void;
  courses: CourseRef[];
  onAdd: (a: TrackerAssignment) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [courseId, setCourseId] = React.useState(courses[0]?.id ?? "");
  const [weight, setWeight] = React.useState<AssignmentWeight>("homework");
  const [priority, setPriority] = React.useState<AssignmentPriority>("medium");
  const [dueDate, setDueDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [points, setPoints] = React.useState("10");
  const [description, setDescription] = React.useState("");

  React.useEffect(() => { if (!courseId && courses[0]) setCourseId(courses[0].id); }, [courses]);

  const course = courses.find((c) => c.id === courseId);

  const handleAdd = () => {
    if (!title.trim() || !courseId || !course) return;
    onAdd({
      id: uid(), courseId, courseCode: `${course.subject} ${course.number}`,
      courseColor: course.colorAccent ?? "#6b7280",
      title: title.trim(), description: description.trim() || undefined,
      dueDate: new Date(dueDate + "T23:59:00").toISOString(),
      weight, priority, points: Number(points), completed: false, starred: false,
      subtasks: [], createdAt: nowIso(), updatedAt: nowIso(),
    });
    setTitle(""); setDescription(""); setPriority("medium"); setPoints("10");
    onClose();
  };

  if (courses.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <Box sx={{ bgcolor: "#A80532", px: 3, py: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ color: "#fff", fontWeight: 950, fontSize: "1rem" }}>New Assignment</Typography>
            <IconButton onClick={onClose} sx={{ color: "rgba(255,255,255,0.80)" }}><CloseIcon /></IconButton>
          </Stack>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ borderRadius: 2 }}>
            You must add at least one course in <strong>My Classes</strong> before creating an assignment.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2.5 }}>
          <Button onClick={onClose} sx={{ fontWeight: 700 }}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}>
      <Box sx={{ bgcolor: "#A80532", px: 3, py: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ color: "#fff", fontWeight: 950, fontSize: "1rem" }}>New Assignment / Quiz</Typography>
          <IconButton onClick={onClose} sx={{ color: "rgba(255,255,255,0.80)" }}><CloseIcon /></IconButton>
        </Stack>
      </Box>
      <DialogContent sx={{ p: 2.5 }}>
        <Stack spacing={1.75}>
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "#e8eaed" } } }} />
          <TextField label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)}
            fullWidth multiline rows={2}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "#e8eaed" } } }} />
          <Stack direction="row" spacing={1.25}>
            <FormControl fullWidth size="small" required>
              <InputLabel>Course *</InputLabel>
              <Select value={courseId} label="Course *" onChange={(e) => setCourseId(e.target.value)} sx={{ borderRadius: 2 }}>
                {courses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: c.colorAccent, flexShrink: 0 }} />
                      <span>{c.subject} {c.number}</span>
                      {c.title && <Typography sx={{ fontSize: "0.75rem", color: "rgba(0,0,0,0.45)" }}>— {c.title}</Typography>}
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select value={weight} label="Type" onChange={(e) => setWeight(e.target.value as AssignmentWeight)} sx={{ borderRadius: 2 }}>
                {(["homework","quiz","project","exam","lab","discussion"] as AssignmentWeight[]).map((w) => (
                  <MenuItem key={w} value={w}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Box sx={{ color: "#555" }}>{WEIGHT_ICONS[w]}</Box>
                      <span style={{ textTransform: "capitalize" }}>{w}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={1.25}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select value={priority} label="Priority" onChange={(e) => setPriority(e.target.value as AssignmentPriority)} sx={{ borderRadius: 2 }}>
                {(["low","medium","high","critical"] as AssignmentPriority[]).map((p) => (
                  <MenuItem key={p} value={p}>
                    <Box component="span" sx={{ color: PRIORITY_COLORS[p], fontWeight: 700, textTransform: "capitalize" }}>{p}</Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField size="small" label="Points" type="number" value={points} onChange={(e) => setPoints(e.target.value)}
              sx={{ width: 90, "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "#e8eaed" } } }} />
            <TextField size="small" label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              fullWidth InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "#e8eaed" } } }} />
          </Stack>
          {course && (
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: course.colorAccent + "10", border: `1px solid ${course.colorAccent}25` }}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <CourseChip courseCode={`${course.subject} ${course.number}`} color={course.colorAccent ?? "#6b7280"} />
                <Typography sx={{ fontSize: "0.72rem", color: "rgba(0,0,0,0.50)" }}>
                  This assignment will appear under <strong>{course.subject} {course.number}</strong>
                </Typography>
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: "rgba(0,0,0,0.50)", fontWeight: 700 }}>Cancel</Button>
        <Button variant="contained" onClick={handleAdd} disabled={!title.trim() || !courseId}
          sx={{ bgcolor: "#A80532", "&:hover": { bgcolor: "#8e0229" }, fontWeight: 800, borderRadius: 2 }}>
          Add Assignment
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── AddExamDialog ────────────────────────────────────────────────────────────
function AddExamDialog({ open, onClose, courses, onAdd }: {
  open: boolean; onClose: () => void;
  courses: CourseRef[];
  onAdd: (e: TrackerExam) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [courseId, setCourseId] = React.useState(courses[0]?.id ?? "");
  const [type, setType] = React.useState<ExamType>("midterm");
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = React.useState("90");
  const [location, setLocation] = React.useState("");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => { if (!courseId && courses[0]) setCourseId(courses[0].id); }, [courses]);

  const course = courses.find((c) => c.id === courseId);

  const handleAdd = () => {
    if (!title.trim() || !courseId || !course) return;
    onAdd({
      id: uid(), courseId, courseCode: `${course.subject} ${course.number}`,
      courseColor: course.colorAccent ?? "#6b7280",
      title: title.trim(), date: new Date(date + "T09:00:00").toISOString(),
      type, location: location.trim() || undefined, duration: Number(duration) || undefined,
      notes: notes.trim() || undefined, concepts: [], createdAt: nowIso(), updatedAt: nowIso(),
    });
    setTitle(""); setNotes(""); setLocation(""); setDuration("90");
    onClose();
  };

  if (courses.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <Box sx={{ bgcolor: "#A80532", px: 3, py: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ color: "#fff", fontWeight: 950, fontSize: "1rem" }}>New Exam</Typography>
            <IconButton onClick={onClose} sx={{ color: "rgba(255,255,255,0.80)" }}><CloseIcon /></IconButton>
          </Stack>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ borderRadius: 2 }}>
            You must add at least one course in <strong>My Classes</strong> before creating an exam.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2.5 }}>
          <Button onClick={onClose} sx={{ fontWeight: 700 }}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}>
      <Box sx={{ bgcolor: "#A80532", px: 3, py: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ color: "#fff", fontWeight: 950, fontSize: "1rem" }}>New Exam</Typography>
          <IconButton onClick={onClose} sx={{ color: "rgba(255,255,255,0.80)" }}><CloseIcon /></IconButton>
        </Stack>
      </Box>
      <DialogContent sx={{ p: 2.5 }}>
        <Stack spacing={1.75}>
          <TextField label="Exam Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "#e8eaed" } } }} />
          <Stack direction="row" spacing={1.25}>
            <FormControl fullWidth size="small" required>
              <InputLabel>Course *</InputLabel>
              <Select value={courseId} label="Course *" onChange={(e) => setCourseId(e.target.value)} sx={{ borderRadius: 2 }}>
                {courses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: c.colorAccent, flexShrink: 0 }} />
                      <span>{c.subject} {c.number}</span>
                      {c.title && <Typography sx={{ fontSize: "0.75rem", color: "rgba(0,0,0,0.45)" }}>— {c.title}</Typography>}
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select value={type} label="Type" onChange={(e) => setType(e.target.value as ExamType)} sx={{ borderRadius: 2 }}>
                {(["midterm","final","quiz","practical","presentation"] as ExamType[]).map((t) => (
                  <MenuItem key={t} value={t} sx={{ textTransform: "capitalize" }}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={1.25}>
            <TextField size="small" label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)}
              fullWidth InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "#e8eaed" } } }} />
            <TextField size="small" label="Duration (min)" type="number" value={duration} onChange={(e) => setDuration(e.target.value)}
              sx={{ width: 120, "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "#e8eaed" } } }} />
            <TextField size="small" label="Location" value={location} onChange={(e) => setLocation(e.target.value)} fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "#e8eaed" } } }} />
          </Stack>
          <TextField label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)}
            fullWidth multiline rows={2}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "#e8eaed" } } }} />
          {course && (
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: course.colorAccent + "10", border: `1px solid ${course.colorAccent}25` }}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <CourseChip courseCode={`${course.subject} ${course.number}`} color={course.colorAccent ?? "#6b7280"} />
                <Typography sx={{ fontSize: "0.72rem", color: "rgba(0,0,0,0.50)" }}>
                  This exam will appear under <strong>{course.subject} {course.number}</strong>
                </Typography>
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: "rgba(0,0,0,0.50)", fontWeight: 700 }}>Cancel</Button>
        <Button variant="contained" onClick={handleAdd} disabled={!title.trim() || !courseId}
          sx={{ bgcolor: "#A80532", "&:hover": { bgcolor: "#8e0229" }, fontWeight: 800, borderRadius: 2 }}>
          Add Exam
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

interface DueDateElementProps {
  /** Live courses from the My Classes tab — drives course picker + color coordination */
  courses?: CourseItem[];
  assignments?: any[];
  exams?: any[];
  onToggleAssignment?: (courseId: string, assignmentId: string) => void;
  expanded?: boolean;
}

export default function DueDateElement({ courses: rawCourses = [] }: DueDateElementProps) {
  const [tab, setTab] = React.useState(0);
  const [assignments, setAssignments] = React.useState<TrackerAssignment[]>(MOCK_ASSIGNMENTS);
  const [exams, setExams] = React.useState<TrackerExam[]>(MOCK_EXAMS);
  const [plannerBlocks, setPlannerBlocks] = React.useState<DayPlannerBlock[]>(MOCK_PLANNER_BLOCKS);

  const courseRefs = React.useMemo(() => buildCourseRefs(rawCourses), [rawCourses]);

  const [filter, setFilter] = React.useState<FilterOption>("all");
  const [sort, setSort] = React.useState<SortOption>("due-date");
  const [showAddAssignment, setShowAddAssignment] = React.useState(false);
  const [showAddExam, setShowAddExam] = React.useState(false);

  const filteredAssignments = React.useMemo(() => {
    let list = [...assignments];
    if (filter === "due-today") list = list.filter((a) => !a.completed && daysUntil(a.dueDate) === 0);
    if (filter === "due-soon")  list = list.filter((a) => !a.completed && daysUntil(a.dueDate) > 0 && daysUntil(a.dueDate) <= 3);
    if (filter === "upcoming")  list = list.filter((a) => !a.completed && daysUntil(a.dueDate) > 3);
    if (filter === "overdue")   list = list.filter((a) => !a.completed && daysUntil(a.dueDate) < 0);
    if (filter === "completed") list = list.filter((a) => a.completed);
    if (filter === "starred")   list = list.filter((a) => a.starred);

    if (sort === "due-date")    list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    if (sort === "priority")    list.sort((a, b) => ["critical","high","medium","low"].indexOf(a.priority) - ["critical","high","medium","low"].indexOf(b.priority));
    if (sort === "most-points") list.sort((a, b) => b.points - a.points);
    if (sort === "course")      list.sort((a, b) => a.courseCode.localeCompare(b.courseCode));

    return list;
  }, [assignments, filter, sort]);

  const toggleAssignment  = (id: string) => setAssignments((p) => p.map((a) => a.id === id ? { ...a, completed: !a.completed } : a));
  const toggleStar        = (id: string) => setAssignments((p) => p.map((a) => a.id === id ? { ...a, starred: !a.starred } : a));
  const deleteAssignment  = (id: string) => setAssignments((p) => p.filter((a) => a.id !== id));
  const addAssignment     = (a: TrackerAssignment) => setAssignments((p) => [a, ...p]);

  const toggleSubtask = (assignmentId: string, subtaskId: string) =>
    setAssignments((p) => p.map((a) => a.id !== assignmentId ? a : {
      ...a, subtasks: a.subtasks.map((s) => s.id === subtaskId ? { ...s, completed: !s.completed } : s),
    }));
  const addSubtask = (assignmentId: string, title: string, dueDay?: string, estimatedMinutes?: number) =>
    setAssignments((p) => p.map((a) => a.id !== assignmentId ? a : {
      ...a, subtasks: [...a.subtasks, { id: uid(), assignmentId, title, dueDay, estimatedMinutes, completed: false, createdAt: nowIso() }],
    }));
  const deleteSubtask = (assignmentId: string, subtaskId: string) =>
    setAssignments((p) => p.map((a) => a.id !== assignmentId ? a : {
      ...a, subtasks: a.subtasks.filter((s) => s.id !== subtaskId),
    }));

  const addExam    = (e: TrackerExam) => setExams((p) => [e, ...p]);
  const deleteExam = (id: string) => setExams((p) => p.filter((e) => e.id !== id));

  const updateConcept = (examId: string, conceptId: string, patch: Partial<ExamConcept>) =>
    setExams((p) => p.map((e) => e.id !== examId ? e : {
      ...e, concepts: e.concepts.map((c) => c.id !== conceptId ? c : { ...c, ...patch }),
    }));
  const addConcept = (examId: string, title: string, category?: string) =>
    setExams((p) => p.map((e) => e.id !== examId ? e : {
      ...e, concepts: [...e.concepts, { id: uid(), examId, title, category, masteryLevel: 0, completed: false, resources: [], createdAt: nowIso() }],
    }));
  const deleteConcept = (examId: string, conceptId: string) =>
    setExams((p) => p.map((e) => e.id !== examId ? e : {
      ...e, concepts: e.concepts.filter((c) => c.id !== conceptId),
    }));
  const addConceptResource = (examId: string, conceptId: string, type: "link"|"note", label: string, url?: string) =>
    setExams((p) => p.map((e) => e.id !== examId ? e : {
      ...e, concepts: e.concepts.map((c) => c.id !== conceptId ? c : {
        ...c, resources: [...c.resources, { id: uid(), conceptId, type, label, url, createdAt: nowIso() }],
      }),
    }));
  const deleteConceptResource = (examId: string, conceptId: string, resourceId: string) =>
    setExams((p) => p.map((e) => e.id !== examId ? e : {
      ...e, concepts: e.concepts.map((c) => c.id !== conceptId ? c : {
        ...c, resources: c.resources.filter((r) => r.id !== resourceId),
      }),
    }));

  const addBlock    = (block: Omit<DayPlannerBlock, "id"|"createdAt">) => setPlannerBlocks((p) => [...p, { ...block, id: uid(), createdAt: nowIso() }]);
  const deleteBlock = (id: string) => setPlannerBlocks((p) => p.filter((b) => b.id !== id));

  const TABS = [
    { label: "Dashboard",   icon: <TrendingUpIcon sx={{ fontSize: 16 }} /> },
    { label: "Assignments", icon: <AssignmentIcon sx={{ fontSize: 16 }} /> },
    { label: "Exams",       icon: <MenuBookIcon sx={{ fontSize: 16 }} /> },
    { label: "Day Planner", icon: <CalendarTodayIcon sx={{ fontSize: 16 }} /> },
  ];

  const pendingCount = assignments.filter((a) => !a.completed && daysUntil(a.dueDate) <= 3 && daysUntil(a.dueDate) >= 0).length;

  return (
    <Box sx={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
      {/* Tab nav */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={0.5} sx={{ bgcolor: "#fff", borderRadius: 999, p: 0.5, border: "1.5px solid #f0f0f3", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          {TABS.map((t, i) => (
            <Box key={i} onClick={() => setTab(i)} sx={{
              display: "flex", alignItems: "center", gap: 0.6,
              px: 1.5, py: 0.65, borderRadius: 999, cursor: "pointer",
              bgcolor: tab === i ? "#A80532" : "transparent",
              color: tab === i ? "#fff" : "rgba(0,0,0,0.55)",
              fontWeight: tab === i ? 800 : 600, fontSize: "0.78rem",
              transition: "all 0.18s ease",
              "&:hover": tab !== i ? { bgcolor: "rgba(168,5,50,0.06)", color: "#A80532" } : {},
            }}>
              {t.icon}
              {t.label}
              {i === 1 && pendingCount > 0 && (
                <Box sx={{ px: 0.7, py: 0.1, borderRadius: 999, bgcolor: tab === 1 ? "rgba(255,255,255,0.25)" : "#A80532", fontSize: "0.60rem", fontWeight: 900, color: "#fff" }}>
                  {pendingCount}
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      </Stack>

      {tab === 0 && <StatsHub assignments={assignments} exams={exams} progress={MOCK_PROGRESS} courseRefs={courseRefs} />}

      {tab === 1 && (
        <Box>
          <SectionHeader
            icon={<AssignmentIcon sx={{ fontSize: 15, color: "#A80532" }} />}
            title="Assignments & Quizzes" count={filteredAssignments.length}
            action={
              <Button variant="contained" size="small" startIcon={<AddIcon sx={{ fontSize: 13 }} />}
                onClick={() => setShowAddAssignment(true)}
                sx={{ bgcolor: "#A80532", "&:hover": { bgcolor: "#8e0229" }, fontWeight: 800, borderRadius: 2, fontSize: "0.75rem", boxShadow: "0 2px 10px rgba(168,5,50,0.25)" }}>
                New
              </Button>
            }
          />

          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 2, flexWrap: "wrap", gap: 0.75 }}>
            {(["all","due-today","due-soon","upcoming","overdue","completed","starred"] as FilterOption[]).map((f) => (
              <Box key={f} onClick={() => setFilter(f)} sx={{
                display: "inline-flex", alignItems: "center", gap: 0.5,
                px: 1.1, py: 0.3, borderRadius: 999, cursor: "pointer",
                fontSize: "0.68rem", fontWeight: 700,
                bgcolor: filter === f ? "#A80532" : "rgba(0,0,0,0.05)",
                color: filter === f ? "#fff" : "rgba(0,0,0,0.55)",
                border: filter === f ? "none" : "1.5px solid rgba(0,0,0,0.08)",
                transition: "all 0.15s",
              }}>
                {f === "due-today" && <WhatshotIcon sx={{ fontSize: 11 }} />}
                {f === "due-soon"  && <BoltIcon sx={{ fontSize: 11 }} />}
                {f === "overdue"   && <WarningAmberIcon sx={{ fontSize: 11 }} />}
                {f === "starred"   && <StarIcon sx={{ fontSize: 11 }} />}
                {f === "completed" && <CheckCircleIcon sx={{ fontSize: 11 }} />}
                {f === "due-soon" ? "Due Soon (3d)" : f === "due-today" ? "Due Today" : f.charAt(0).toUpperCase() + f.slice(1)}
              </Box>
            ))}
            <Box sx={{ ml: "auto !important" }}>
              <Select size="small" value={sort} onChange={(e) => setSort(e.target.value as SortOption)}
                sx={{ fontSize: "0.72rem", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" }, borderRadius: 2 }}>
                <MenuItem value="due-date">Sort: Due Date</MenuItem>
                <MenuItem value="priority">Sort: Priority</MenuItem>
                <MenuItem value="most-points">Sort: Points</MenuItem>
                <MenuItem value="course">Sort: Course</MenuItem>
              </Select>
            </Box>
          </Stack>

          <Stack spacing={1.25}>
            {filteredAssignments.length === 0 ? (
              <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1.5px dashed rgba(0,0,0,0.12)", textAlign: "center" }}>
                <Typography sx={{ fontWeight: 800, color: "rgba(0,0,0,0.40)", fontSize: "0.88rem" }}>
                  No assignments match this filter.
                </Typography>
              </Paper>
            ) : (
              filteredAssignments.map((a) => (
                <AssignmentCard key={a.id} assignment={a}
                  onToggle={toggleAssignment} onToggleStar={toggleStar} onDelete={deleteAssignment}
                  onSubtaskToggle={toggleSubtask} onSubtaskAdd={addSubtask} onSubtaskDelete={deleteSubtask}
                />
              ))
            )}
          </Stack>
        </Box>
      )}

      {tab === 2 && (
        <Box>
          <SectionHeader
            icon={<MenuBookIcon sx={{ fontSize: 15, color: "#A80532" }} />}
            title="Exam Prep" count={exams.length}
            action={
              <Button variant="contained" size="small" startIcon={<AddIcon sx={{ fontSize: 13 }} />}
                onClick={() => setShowAddExam(true)}
                sx={{ bgcolor: "#A80532", "&:hover": { bgcolor: "#8e0229" }, fontWeight: 800, borderRadius: 2, fontSize: "0.75rem", boxShadow: "0 2px 10px rgba(168,5,50,0.25)" }}>
                New Exam
              </Button>
            }
          />
          <Stack spacing={1.5}>
            {exams.length === 0 ? (
              <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1.5px dashed rgba(0,0,0,0.12)", textAlign: "center" }}>
                <Typography sx={{ fontWeight: 800, color: "rgba(0,0,0,0.40)" }}>No exams yet. Add one above.</Typography>
              </Paper>
            ) : (
              exams.map((e) => (
                <ExamCard key={e.id} exam={e}
                  onDelete={deleteExam}
                  onConceptMastery={(examId, cId, level) => updateConcept(examId, cId, { masteryLevel: level })}
                  onConceptToggle={(examId, cId) => updateConcept(examId, cId, { completed: !exams.find((ex) => ex.id === examId)?.concepts.find((c) => c.id === cId)?.completed })}
                  onConceptDelete={deleteConcept}
                  onConceptAdd={addConcept}
                  onAddResource={addConceptResource}
                  onDeleteResource={deleteConceptResource}
                />
              ))
            )}
          </Stack>
        </Box>
      )}

      {tab === 3 && (
        <Box>
          <SectionHeader icon={<CalendarTodayIcon sx={{ fontSize: 15, color: "#A80532" }} />} title="Day Planner" />
          <DayPlanner blocks={plannerBlocks} courses={courseRefs} onAdd={addBlock} onDelete={deleteBlock} />
        </Box>
      )}

      <AddAssignmentDialog open={showAddAssignment} onClose={() => setShowAddAssignment(false)} courses={courseRefs} onAdd={addAssignment} />
      <AddExamDialog open={showAddExam} onClose={() => setShowAddExam(false)} courses={courseRefs} onAdd={addExam} />
    </Box>
  );
}
