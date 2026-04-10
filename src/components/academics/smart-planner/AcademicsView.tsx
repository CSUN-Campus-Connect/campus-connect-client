"use client";

import * as React from "react";
import Link from "next/link";
import { Alert, Box, Button, Container, Divider, FormControl, InputLabel, MenuItem, Paper, Select, Snackbar, Stack, Tab, Tabs,
 TextField, Typography, Chip,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import GroupsIcon from "@mui/icons-material/Groups";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

import CourseCard from "@/components/academics/CourseCard/CourseCard";
import CourseInfoModal from "@/components/academics/CourseCard/CourseInfoModal";
import DueDateElement from "@/components/academics/DueDateElement/DueDateElement";

import { useAcademicsData } from "@/components/academics/useAcademicsData";
import { BG, btnGhost, btnPrimary, btnOutlineGray, fieldSx, selectSx } from "@/components/academics/shared/constants";

// not yet hooked up to prototype degree planner backend - just a static placeholder for now to demonstrate the UI and visualize the data structures. Will be fully wired up once the backend routes are ready.
function DonutChart({
  completed,
  pending,
  overdue,
  total,
  accent,
}: {
  completed: number;
  pending: number;
  overdue: number;
  total: number;
  accent: string;
}) {
  const size = 56;
  const r = 20;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;

  const pctCompleted = total > 0 ? completed / total : 0;
  const pctPending = total > 0 ? pending / total : 0;
  const pctOverdue = total > 0 ? overdue / total : 0;

  const dashCompleted = circ * pctCompleted;
  const dashPending = circ * pctPending;
  const dashOverdue = circ * pctOverdue;

  // Each arc starts after the previous
  const offsetCompleted = 0;
  const offsetPending = -dashCompleted;
  const offsetOverdue = -(dashCompleted + dashPending);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={6} />
      {/* Overdue (red) */}
      {overdue > 0 && (
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke="#ef4444"
          strokeWidth={6}
          strokeDasharray={`${dashOverdue} ${circ - dashOverdue}`}
          strokeDashoffset={offsetOverdue}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
      )}
      {/* Pending (orange/accent) */}
      {pending > 0 && (
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={accent}
          strokeWidth={6}
          strokeDasharray={`${dashPending} ${circ - dashPending}`}
          strokeDashoffset={offsetPending}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
      )}
      {/* Completed (green) */}
      {completed > 0 && (
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke="#22c55e"
          strokeWidth={6}
          strokeDasharray={`${dashCompleted} ${circ - dashCompleted}`}
          strokeDashoffset={offsetCompleted > 0 ? -offsetCompleted : offsetCompleted}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
      )}
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="800" fill="#1a1a2e">
        {total > 0 ? `${Math.round((completed / total) * 100)}%` : "—"}
      </text>
    </svg>
  );
}

// ── Per-class Due Date pie chart card ──────────────────────────────────────
function CourseAssignmentChart({
  courseName,
  courseCode,
  assignments,
  accent,
}: {
  courseName: string;
  courseCode: string;
  assignments: Array<{ completed: boolean; dueDate: string }>;
  accent: string;
}) {
  const now = Date.now();
  const total = assignments.length;
  const completed = assignments.filter((a) => a.completed).length;
  const overdue = assignments.filter((a) => !a.completed && new Date(a.dueDate).getTime() < now).length;
  const pending = total - completed - overdue;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        p: 1.5,
        bgcolor: "#fff",
        border: "1.5px solid rgba(168,5,50,0.10)",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(168,5,50,0.10)",
          borderColor: accent + "40",
        },
        transition: "all 0.2s ease",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <DonutChart
          completed={completed}
          pending={pending}
          overdue={overdue}
          total={total}
          accent={accent}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.65rem", fontWeight: 900, color: accent, letterSpacing: 1.5, textTransform: "uppercase", lineHeight: 1 }}>
            {courseCode}
          </Typography>
          <Typography fontWeight={800} sx={{ fontSize: "0.78rem", color: "#1a1a2e", lineHeight: 1.2, mt: 0.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110 }}>
            {courseName}
          </Typography>
          <Stack spacing={0.25} sx={{ mt: 0.6 }}>
            {completed > 0 && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#22c55e", flexShrink: 0 }} />
                <Typography sx={{ fontSize: "0.62rem", color: "rgba(0,0,0,0.55)" }}>{completed} done</Typography>
              </Stack>
            )}
            {pending > 0 && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: accent, flexShrink: 0 }} />
                <Typography sx={{ fontSize: "0.62rem", color: "rgba(0,0,0,0.55)" }}>{pending} pending</Typography>
              </Stack>
            )}
            {overdue > 0 && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#ef4444", flexShrink: 0 }} />
                <Typography sx={{ fontSize: "0.62rem", color: "#ef4444", fontWeight: 700 }}>{overdue} overdue</Typography>
              </Stack>
            )}
            {total === 0 && (
              <Typography sx={{ fontSize: "0.62rem", color: "rgba(0,0,0,0.35)", fontStyle: "italic" }}>No tasks</Typography>
            )}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AcademicsView() {
  const data = useAcademicsData();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterMode, setFilterMode] = React.useState<"all" | "online" | "inperson">("all");

  // Enhanced filtering: search + mode filter
  const displayedCourses = React.useMemo(() => {
    let courses = data.filteredCourses ?? [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      courses = courses.filter(
        (c) =>
          c.subject?.toLowerCase().includes(q) ||
          c.number?.toLowerCase().includes(q) ||
          c.title?.toLowerCase().includes(q) ||
          c.professor?.toLowerCase().includes(q)
      );
    }
    if (filterMode === "online") courses = courses.filter((c) => c.isOnline);
    if (filterMode === "inperson") courses = courses.filter((c) => !c.isOnline);
    return courses;
  }, [data.filteredCourses, searchQuery, filterMode]);

  const totalUnits = data.selectedSemester?.courses.reduce((s, c) => s + (c.units ?? 0), 0) ?? 0;
  const dueSoon = data.upcomingAssignments.filter((a) => {
    const d = new Date(a.dueDate).getTime() - Date.now();
    return !a.completed && d < 7 * 86400000 && d > 0;
  }).length;

  // Accent colors cycling for charts
  const accentColors = ["#A80532", "#c0392b", "#e74c3c", "#8e1a3e", "#6b0f2a", "#d63031"];

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #8b0000 0%, #A80532 35%, #c0182a 60%, #6b0f2a 100%)",
      fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
    }}>
      {/* ── Back button ── */}
      <Box sx={{ px: { xs: 2, md: 4 }, pt: 2.5 }}>
        <Button
          component={Link}
          href="/dashboard"
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 15 }} />}
          sx={{
            color: "rgba(255,255,255,0.80)",
            borderColor: "rgba(255,255,255,0.25)",
            fontWeight: 700,
            borderRadius: 999,
            fontSize: "0.78rem",
            px: 1.75,
            py: 0.4,
            backdropFilter: "blur(8px)",
            bgcolor: "rgba(255,255,255,0.08)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.45)" },
          }}
          size="small"
        >
          Dashboard
        </Button>
      </Box>

      {/* ── Hero Header ── */}
      <Box sx={{ position: "relative", overflow: "hidden", pt: 1.5, pb: 0 }}>
        {/* Geometric decorative shapes */}
        <Box sx={{
          position: "absolute",
          top: -40, right: -60,
          width: 320, height: 320,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          pointerEvents: "none",
        }} />
        <Box sx={{
          position: "absolute",
          top: 20, right: 80,
          width: 180, height: 180,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
          pointerEvents: "none",
        }} />

        <Container sx={{ position: "relative", zIndex: 1 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: "20px",
              p: { xs: 2.5, md: 3 },
              mb: 0,
              bgcolor: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ md: "center" }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{
                  letterSpacing: 4,
                  fontWeight: 900,
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "0.60rem",
                  textTransform: "uppercase",
                  mb: 0.5,
                  fontFamily: "'DM Mono', monospace",
                }}>
                  CSUN · ACADEMICS
                </Typography>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Box sx={{
                    width: 38, height: 38, borderRadius: "10px",
                    bgcolor: "rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.20)",
                  }}>
                    <SchoolIcon sx={{ color: "#fff", fontSize: 20 }} />
                  </Box>
                  <Typography fontWeight={900} sx={{
                    fontSize: { xs: "1.5rem", md: "1.9rem" },
                    color: "#fff",
                    lineHeight: 1,
                    letterSpacing: -0.5,
                  }}>
                    Academic Hub
                  </Typography>
                </Stack>
                <Typography sx={{
                  color: "rgba(255,255,255,0.60)",
                  fontSize: "0.85rem",
                  mt: 0.75,
                  maxWidth: 480,
                  lineHeight: 1.5,
                }}>
                  Track courses, manage due dates, plan study sessions, and build your semester schedule.
                </Typography>
              </Box>

              {/* Stat chips */}
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                {[
                  { label: "Courses", value: data.selectedSemester?.courses.length ?? 0, color: "rgba(255,255,255,0.12)" },
                  { label: "Units", value: totalUnits, color: "rgba(255,255,255,0.12)" },
                  { label: "Due Soon", value: dueSoon, color: dueSoon > 0 ? "rgba(251,191,36,0.20)" : "rgba(255,255,255,0.12)" },
                ].map((s) => (
                  <Paper key={s.label} elevation={0} sx={{
                    borderRadius: "12px",
                    p: "10px 18px",
                    textAlign: "center",
                    bgcolor: s.color,
                    border: "1px solid rgba(255,255,255,0.12)",
                    minWidth: 72,
                  }}>
                    <Typography sx={{ fontSize: "1.45rem", fontWeight: 900, color: "#fff", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                      {s.value}
                    </Typography>
                    <Typography sx={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.55)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                      {s.label}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Stack>

            {/* ── Tabs ── */}
            <Box sx={{ mt: 2.25, mx: -0.5 }}>
              <Tabs
                value={data.tab}
                onChange={(_, v) => data.setTab(v)}
                textColor="inherit"
                TabIndicatorProps={{ style: { background: "#fff", height: 2.5, borderRadius: 2, bottom: 2 } }}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  "& .MuiTab-root": {
                    color: "rgba(255,255,255,0.55)",
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: "0.84rem",
                    minWidth: 64,
                    py: 0.75,
                    px: 1.5,
                    transition: "color 0.15s",
                  },
                  "& .Mui-selected": { color: "#fff" },
                  minHeight: 36,
                }}
              >
                <Tab label="My Classes" />
                <Tab
                  label={
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <span>Due Dates</span>
                      {data.upcomingExams.filter((e) => { const d = new Date(e.date).getTime() - Date.now(); return d > 0 && d < 3 * 86400000; }).length > 0 && (
                        <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#fbbf24" }} />
                      )}
                    </Stack>
                  }
                />
                <Tab label={<Stack direction="row" spacing={0.5} alignItems="center"><ShoppingCartIcon sx={{ fontSize: 14 }} /><span>UniCart</span></Stack>} component={Link} href="/academics/uni-cart" />
                <Tab label={<Stack direction="row" spacing={0.5} alignItems="center"><GroupsIcon sx={{ fontSize: 14 }} /><span>Study Groups</span></Stack>} component={Link} href="/academics/study-groups" />
                <Tab label={<Stack direction="row" spacing={0.5} alignItems="center"><LibraryBooksIcon sx={{ fontSize: 14 }} /><span>Note Share</span></Stack>} component={Link} href="/academics/note-share" />
                <Tab label={<Stack direction="row" spacing={0.5} alignItems="center"><AccountTreeIcon sx={{ fontSize: 14 }} /><span>Smart Planner</span></Stack>} component={Link} href="/academics/smart-planner" />
              </Tabs>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* ── Main Content ── */}
      <Container sx={{ pt: 2.5, pb: 6 }}>

        {/* ── Tab 0: My Classes ── */}
        {data.tab === 0 && (
          <>
            {/* Add course controls */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: "16px",
                p: { xs: 1.75, md: 2 },
                mb: 2,
                bgcolor: "rgba(0,0,0,0.22)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(14px)",
              }}
            >
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} alignItems={{ md: "flex-end" }} flexWrap="wrap">
                {/* Semester selector */}
                <FormControl size="small" sx={{ minWidth: 155 }}>
                  <InputLabel sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.82rem" }}>Semester</InputLabel>
                  <Select
                    value={data.selectedSemesterId}
                    onChange={(e) => data.setSelectedSemesterId(e.target.value)}
                    label="Semester"
                    sx={selectSx}
                  >
                    {data.semesters.map((s) => (
                      <MenuItem key={s.id} value={s.id}>{s.id}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.15)", display: { xs: "none", md: "block" } }} />

                {/* Add course inline */}
                <Stack direction="row" flexWrap="wrap" gap={0.75} alignItems="flex-end" sx={{ flex: 1 }}>
                  <TextField size="small" label="Subject" placeholder="COMP" value={data.addSubject}
                    onChange={(e) => data.setAddSubject(e.target.value.toUpperCase())}
                    sx={{ ...fieldSx, width: 82 }} InputLabelProps={{ sx: { color: "rgba(255,255,255,0.65)", fontSize: "0.80rem" } }} />
                  <TextField size="small" label="Number" placeholder="333" value={data.addNumber}
                    onChange={(e) => data.setAddNumber(e.target.value)}
                    sx={{ ...fieldSx, width: 82 }} InputLabelProps={{ sx: { color: "rgba(255,255,255,0.65)", fontSize: "0.80rem" } }} />
                  <TextField size="small" label="Title (optional)" value={data.addTitle}
                    onChange={(e) => data.setAddTitle(e.target.value)}
                    sx={{ ...fieldSx, flex: 1, minWidth: 130 }} InputLabelProps={{ sx: { color: "rgba(255,255,255,0.65)", fontSize: "0.80rem" } }} />
                  <TextField size="small" label="Professor" value={data.addProfessor}
                    onChange={(e) => data.setAddProfessor(e.target.value)}
                    sx={{ ...fieldSx, flex: 1, minWidth: 120 }} InputLabelProps={{ sx: { color: "rgba(255,255,255,0.65)", fontSize: "0.80rem" } }} />
                  <TextField size="small" label="Units" value={data.addUnits}
                    onChange={(e) => data.setAddUnits(e.target.value)} type="number"
                    sx={{ ...fieldSx, width: 66 }} InputLabelProps={{ sx: { color: "rgba(255,255,255,0.65)", fontSize: "0.80rem" } }} />
                  <Button variant="contained" startIcon={<AddIcon sx={{ fontSize: "14px !important" }} />}
                    onClick={data.handleAddCourse} sx={{ ...btnPrimary, py: 0.85, fontSize: "0.80rem" }} size="small">
                    Add
                  </Button>
                </Stack>

                <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.15)", display: { xs: "none", md: "block" } }} />

                {/* Add semester */}
                <Stack direction="row" gap={0.75} alignItems="flex-end">
                  <TextField size="small" label="New Semester" placeholder="Fall 2026" value={data.newSemName}
                    onChange={(e) => data.setNewSemName(e.target.value)}
                    sx={{ ...fieldSx, width: 135 }} InputLabelProps={{ sx: { color: "rgba(255,255,255,0.65)", fontSize: "0.80rem" } }} />
                  <Button variant="outlined" onClick={data.handleAddSemester}
                    sx={{ ...btnGhost, fontSize: "0.78rem", py: 0.85 }} size="small">
                    + Semester
                  </Button>
                </Stack>
              </Stack>
            </Paper>

            {/* Search + filter bar */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <TextField
                size="small"
                placeholder="Search courses, professors…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.45)" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  flex: 1,
                  maxWidth: 340,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(0,0,0,0.20)",
                    borderRadius: 999,
                    color: "#fff",
                    fontSize: "0.82rem",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.30)" },
                    "&.Mui-focused fieldset": { borderColor: "rgba(255,255,255,0.50)" },
                  },
                  "& input::placeholder": { color: "rgba(255,255,255,0.38)", opacity: 1 },
                }}
              />
              <Stack direction="row" spacing={0.5}>
                {(["all", "online", "inperson"] as const).map((f) => (
                  <Chip
                    key={f}
                    label={f === "all" ? "All" : f === "online" ? "Online" : "In-Person"}
                    size="small"
                    onClick={() => setFilterMode(f)}
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      borderRadius: 999,
                      height: 26,
                      cursor: "pointer",
                      bgcolor: filterMode === f ? "#fff" : "rgba(255,255,255,0.12)",
                      color: filterMode === f ? "#A80532" : "rgba(255,255,255,0.70)",
                      border: filterMode === f ? "none" : "1px solid rgba(255,255,255,0.15)",
                      "&:hover": { bgcolor: filterMode === f ? "#fff" : "rgba(255,255,255,0.20)" },
                      transition: "all 0.15s",
                    }}
                  />
                ))}
              </Stack>
              <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem", ml: "auto !important" }}>
                {displayedCourses.length} course{displayedCourses.length !== 1 ? "s" : ""}
              </Typography>
            </Stack>

            {/* Main grid: course list + sidebar */}
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1fr 280px" }, alignItems: "start" }}>
              {/* Course cards */}
              <Stack spacing={1}>
                {displayedCourses.length === 0 ? (
                  <Paper elevation={0} sx={{
                    p: 3, borderRadius: "16px",
                    bgcolor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    textAlign: "center",
                  }}>
                    <Typography sx={{ color: "rgba(255,255,255,0.80)", fontWeight: 800, mb: 0.5 }}>
                      {searchQuery ? "No courses match your search." : `No courses yet for ${data.selectedSemester?.id}.`}
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.50)", fontSize: "0.85rem" }}>
                      {searchQuery ? "Try a different query." : "Add a course above (Subject + Number required)."}
                    </Typography>
                  </Paper>
                ) : (
                  displayedCourses.map((c) => (
                    <CourseCard
                      key={c.id}
                      semesterLabel={data.selectedSemester.id}
                      course={c}
                      onOpenNotes={() => data.openCourseModal(c.id, 0)}
                      onOpenInfo={() => data.openCourseModal(c.id, 1)}
                      onColorChange={(color) => data.setCourseColor(c.id, color)}
                    />
                  ))
                )}
              </Stack>

              {/* Right sidebar */}
              <Stack spacing={1.5}>
                {/* Per-course assignment pie charts */}
                {(data.selectedSemester?.courses ?? []).length > 0 && (
                  <Paper elevation={0} sx={{
                    borderRadius: "16px",
                    p: 1.75,
                    bgcolor: "rgba(0,0,0,0.22)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(14px)",
                  }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
                      <Typography fontWeight={900} sx={{ color: "#fff", fontSize: "0.82rem", letterSpacing: 0.5 }}>
                        Assignment Progress
                      </Typography>
                      <Box sx={{
                        px: 0.75, py: 0.2, borderRadius: 999,
                        bgcolor: "rgba(255,255,255,0.10)",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}>
                        <Typography sx={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.60)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                          per class
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack spacing={1}>
                      {(data.selectedSemester?.courses ?? []).map((course, idx) => (
                        <CourseAssignmentChart
                          key={course.id}
                          courseCode={`${course.subject.toUpperCase()} ${course.number}`}
                          courseName={course.title || "Course"}
                          assignments={course.assignments ?? []}
                          accent={accentColors[idx % accentColors.length]}
                        />
                      ))}
                    </Stack>
                  </Paper>
                )}

                {/* Due date tracker */}
                <DueDateElement
                  assignments={data.upcomingAssignments}
                  exams={data.upcomingExams}
                  onToggleAssignment={data.toggleAssignment}
                  courses={data.selectedSemester?.courses ?? []}
                />
              </Stack>
            </Box>
          </>
        )}

        {/* ── Tab 1: Due Dates (expanded) ── */}
        {data.tab === 1 && (
          <>
            <DueDateElement
              assignments={data.upcomingAssignments}
              exams={data.upcomingExams}
              onToggleAssignment={data.toggleAssignment}
              courses={data.selectedSemester?.courses ?? []}
              expanded
            />
          </>
        )}
      </Container>

      {/* ── Toast ── */}
      <Snackbar open={!!data.toast} autoHideDuration={2600} onClose={() => data.setToast(null)}>
        <Alert severity={(data.toast?.type as "info" | "success" | "warning" | "error") ?? "info"}
          sx={{ width: "100%", borderRadius: 3, fontWeight: 700 }}>
          {data.toast?.text ?? ""}
        </Alert>
      </Snackbar>

      {/* ── Course Info Modal ── */}
      <CourseInfoModal
        open={data.modalOpen}
        onClose={() => data.setModalOpen(false)}
        tab={data.modalTab as 0 | 1}
        setTab={(v) => data.setModalTab(v as 0 | 1)}
        semesterLabel={data.selectedSemester?.id ?? ""}
        course={data.activeCourse}
        noteAuthor={data.noteAuthor}
        noteTopic={data.noteTopic}
        noteBody={data.noteBody}
        setNoteAuthor={data.setNoteAuthor}
        setNoteTopic={data.setNoteTopic}
        setNoteBody={data.setNoteBody}
        onPostNote={data.postNote}
      />
    </Box>
  );
}

