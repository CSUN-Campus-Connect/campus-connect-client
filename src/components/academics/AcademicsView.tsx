"use client";

import * as React from "react";
import Link from "next/link";
import {
  Alert, Box, Button, Container, Divider, FormControl, InputLabel,
  MenuItem, Paper, Select, Snackbar, Stack, TextField, Typography, Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

import CourseCard from "./CourseCard/CourseCard";
import CourseInfoModal from "./CourseCard/CourseInfoModal";
import DueDateElement from "./DueDateElement/DueDateElement";
import AcademicsNav from "./AcademicsNav";
import StudyGroupsPanel from "./StudyGroups/StudyGroupsPanel";
import NoteSharePanel from "./NoteShare/NoteSharePanel";

import { useAcademicsData } from "./useAcademicsData";
import { btnGhost, btnPrimary, fieldSx, selectSx } from "./shared/constants";

// ─────────────────────────────────────────────────────────────────────────────
export default function AcademicsView() {
  const data = useAcademicsData();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterMode, setFilterMode] = React.useState<"all" | "online" | "inperson">("all");

  // Search + mode filter
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #8b0000 0%, #A80532 35%, #c0182a 60%, #6b0f2a 100%)",
        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
      }}
    >
      {/* ── Top bar: navbar ── */}
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          pt: 2.5,
          pb: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >

        {/* Navbar */}
        <AcademicsNav tab={data.tab} setTab={data.setTab} />
      </Box>

      {/* ── Main content ── */}
      <Container sx={{ pt: 1, pb: 6 }}>

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
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.25}
                alignItems={{ md: "flex-end" }}
                flexWrap="wrap"
              >
                {/* Semester selector */}
                <FormControl size="small" sx={{ minWidth: 155 }}>
                  <InputLabel sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.82rem" }}>
                    Semester
                  </InputLabel>
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

                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ borderColor: "rgba(255,255,255,0.15)", display: { xs: "none", md: "block" } }}
                />

                {/* Add course inline */}
                <Stack direction="row" flexWrap="wrap" gap={0.75} alignItems="flex-end" sx={{ flex: 1 }}>
                  <TextField size="small" label="Subject" placeholder="COMP" value={data.addSubject}
                    onChange={(e) => data.setAddSubject(e.target.value.toUpperCase())}
                    sx={{ ...fieldSx, width: 82 }}
                    InputLabelProps={{ sx: { color: "rgba(255,255,255,0.65)", fontSize: "0.80rem" } }} />
                  <TextField size="small" label="Number" placeholder="333" value={data.addNumber}
                    onChange={(e) => data.setAddNumber(e.target.value)}
                    sx={{ ...fieldSx, width: 82 }}
                    InputLabelProps={{ sx: { color: "rgba(255,255,255,0.65)", fontSize: "0.80rem" } }} />
                  <TextField size="small" label="Title (optional)" value={data.addTitle}
                    onChange={(e) => data.setAddTitle(e.target.value)}
                    sx={{ ...fieldSx, flex: 1, minWidth: 130 }}
                    InputLabelProps={{ sx: { color: "rgba(255,255,255,0.65)", fontSize: "0.80rem" } }} />
                  <TextField size="small" label="Professor" value={data.addProfessor}
                    onChange={(e) => data.setAddProfessor(e.target.value)}
                    sx={{ ...fieldSx, flex: 1, minWidth: 120 }}
                    InputLabelProps={{ sx: { color: "rgba(255,255,255,0.65)", fontSize: "0.80rem" } }} />
                  <TextField size="small" label="Units" value={data.addUnits}
                    onChange={(e) => data.setAddUnits(e.target.value)} type="number"
                    sx={{ ...fieldSx, width: 66 }}
                    InputLabelProps={{ sx: { color: "rgba(255,255,255,0.65)", fontSize: "0.80rem" } }} />
                  <Button
                    variant="contained"
                    startIcon={<AddIcon sx={{ fontSize: "14px !important" }} />}
                    onClick={data.handleAddCourse}
                    sx={{ ...btnPrimary, py: 0.85, fontSize: "0.80rem" }}
                    size="small"
                  >
                    Add
                  </Button>
                </Stack>

                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ borderColor: "rgba(255,255,255,0.15)", display: { xs: "none", md: "block" } }}
                />

                {/* Add semester */}
                <Stack direction="row" gap={0.75} alignItems="flex-end">
                  <TextField
                    size="small"
                    label="New Semester"
                    placeholder="Fall 2026"
                    value={data.newSemName}
                    onChange={(e) => data.setNewSemName(e.target.value)}
                    sx={{ ...fieldSx, width: 135 }}
                    InputLabelProps={{ sx: { color: "rgba(255,255,255,0.65)", fontSize: "0.80rem" } }}
                  />
                  <Button
                    variant="outlined"
                    onClick={data.handleAddSemester}
                    sx={{ ...btnGhost, fontSize: "0.78rem", py: 0.85 }}
                    size="small"
                  >
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

            {/* Course list — full width, no sidebar */}
            <Stack spacing={1}>
              {displayedCourses.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "16px",
                    bgcolor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    textAlign: "center",
                  }}
                >
                  <Typography sx={{ color: "rgba(255,255,255,0.80)", fontWeight: 800, mb: 0.5 }}>
                    {searchQuery
                      ? "No courses match your search."
                      : `No courses yet for ${data.selectedSemester?.id}.`}
                  </Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.50)", fontSize: "0.85rem" }}>
                    {searchQuery
                      ? "Try a different query."
                      : "Add a course above (Subject + Number required)."}
                  </Typography>
                </Paper>
              ) : (
                displayedCourses.map((c) => (
                  <CourseCard
                    key={c.id}
                    semesterLabel={data.selectedSemester.id}
                    course={c}
                    onOpenInfo={() => data.openCourseModal(c.id, 1)}
                    onColorChange={(color) => data.setCourseColor(c.id, color)}
                  />
                ))
              )}
            </Stack>
          </>
        )}

        {/* ── Tab 1: Due Dates ── */}
        {data.tab === 1 && (
          <DueDateElement
            assignments={data.upcomingAssignments}
            exams={data.upcomingExams}
            onToggleAssignment={data.toggleAssignment}
            courses={data.selectedSemester?.courses ?? []}
            expanded
          />
        )}

        {/* ── Tab 3: Study Groups ── */}
        {data.tab === 3 && <StudyGroupsPanel />}

        {/* ── Tab 4: Note Share ── */}
        {data.tab === 4 && <NoteSharePanel />}

      </Container>

      {/* ── Toast ── */}
      <Snackbar
        open={!!data.toast}
        autoHideDuration={2600}
        onClose={() => data.setToast(null)}
      >
        <Alert
          severity={(data.toast?.type as "info" | "success" | "warning" | "error") ?? "info"}
          sx={{ width: "100%", borderRadius: 3, fontWeight: 700 }}
        >
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
