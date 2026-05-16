"use client";

import * as React from "react";
import {
  Alert, Box, Button, Container, Divider, FormControl, InputLabel,
  MenuItem, Paper, Select, Snackbar, Stack, TextField, Typography, Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
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

export default function AcademicsView() {
  const data = useAcademicsData();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterMode, setFilterMode] = React.useState<"all" | "online" | "inperson">("all");

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
        bgcolor: "#f8f9fb",
        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
      }}
    >
      {/* ── Top bar ── */}
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          pt: 2,
          pb: 2,
          bgcolor: "#fff",
          borderBottom: "1.5px solid #f0f0f3",
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <AcademicsNav tab={data.tab} setTab={data.setTab} />
      </Box>

      {/* ── Main content ── */}
      <Container maxWidth="xl" sx={{ pt: 3, pb: 6 }}>

        {/* ── Tab 0: My Classes ── */}
        {data.tab === 0 && (
          <>
            {/* Add course card */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: "16px",
                p: { xs: 1.75, md: 2.25 },
                mb: 2.5,
                bgcolor: "#fff",
                border: "1.5px solid #f0f0f3",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <Typography sx={{
                fontSize: "0.68rem", fontWeight: 800, color: "#A80532",
                textTransform: "uppercase", letterSpacing: "0.10em", mb: 1.5,
              }}>
                Add Course
              </Typography>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.25}
                alignItems={{ md: "flex-end" }}
                flexWrap="wrap"
              >
                <FormControl size="small" sx={{ minWidth: 155 }}>
                  <InputLabel sx={{ fontSize: "0.82rem" }}>Semester</InputLabel>
                  <Select
                    value={data.selectedSemesterId}
                    onChange={(e) => data.setSelectedSemesterId(e.target.value)}
                    label="Semester"
                    sx={{ borderRadius: 2, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}
                  >
                    {data.semesters.map((s) => (
                      <MenuItem key={s.id} value={s.id}>{s.id}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Divider orientation="vertical" flexItem sx={{ borderColor: "#f0f0f3", display: { xs: "none", md: "block" } }} />

                <Stack direction="row" flexWrap="wrap" gap={0.75} alignItems="flex-end" sx={{ flex: 1 }}>
                  {[
                    { label: "Subject", ph: "COMP", val: data.addSubject, set: (v: string) => data.setAddSubject(v.toUpperCase()), w: 82 },
                    { label: "Number", ph: "333", val: data.addNumber, set: data.setAddNumber, w: 82 },
                  ].map(({ label, ph, val, set, w }) => (
                    <TextField key={label} size="small" label={label} placeholder={ph} value={val}
                      onChange={(e) => set(e.target.value)}
                      sx={{ width: w, "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "#e8eaed" } } }} />
                  ))}
                  <TextField size="small" label="Title (optional)" value={data.addTitle}
                    onChange={(e) => data.setAddTitle(e.target.value)}
                    sx={{ flex: 1, minWidth: 130, "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "#e8eaed" } } }} />
                  <TextField size="small" label="Professor" value={data.addProfessor}
                    onChange={(e) => data.setAddProfessor(e.target.value)}
                    sx={{ flex: 1, minWidth: 120, "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "#e8eaed" } } }} />
                  <TextField size="small" label="Units" value={data.addUnits} type="number"
                    onChange={(e) => data.setAddUnits(e.target.value)}
                    sx={{ width: 66, "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "#e8eaed" } } }} />
                  <Button
                    variant="contained" size="small"
                    startIcon={<AddIcon sx={{ fontSize: "14px !important" }} />}
                    onClick={data.handleAddCourse}
                    sx={{
                      py: 0.9, fontSize: "0.80rem", borderRadius: 2, fontWeight: 700,
                      bgcolor: "#A80532", "&:hover": { bgcolor: "#8e0229" },
                      boxShadow: "0 2px 10px rgba(168,5,50,0.30)",
                    }}
                  >
                    Add
                  </Button>
                </Stack>

                <Divider orientation="vertical" flexItem sx={{ borderColor: "#f0f0f3", display: { xs: "none", md: "block" } }} />

                <Stack direction="row" gap={0.75} alignItems="flex-end">
                  <TextField size="small" label="New Semester" placeholder="Fall 2026"
                    value={data.newSemName} onChange={(e) => data.setNewSemName(e.target.value)}
                    sx={{ width: 135, "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "#e8eaed" } } }} />
                  <Button variant="outlined" onClick={data.handleAddSemester} size="small"
                    sx={{
                      fontSize: "0.78rem", py: 0.9, borderRadius: 2, fontWeight: 700,
                      borderColor: "#e8eaed", color: "#555",
                      "&:hover": { borderColor: "#A80532", color: "#A80532", bgcolor: "rgba(168,5,50,0.03)" },
                    }}>
                    + Semester
                  </Button>
                </Stack>
              </Stack>
            </Paper>

            {/* Search + filter */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <TextField
                size="small"
                placeholder="Search courses, professors…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 16, color: "#b0b8c4" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  flex: 1, maxWidth: 360,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#fff", borderRadius: 999, fontSize: "0.82rem",
                    "& fieldset": { borderColor: "#e8eaed" },
                    "&:hover fieldset": { borderColor: "#A80532" },
                    "&.Mui-focused fieldset": { borderColor: "#A80532" },
                  },
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
                      fontWeight: 700, fontSize: "0.72rem", borderRadius: 999, height: 28, cursor: "pointer",
                      bgcolor: filterMode === f ? "#A80532" : "#fff",
                      color: filterMode === f ? "#fff" : "#666",
                      border: filterMode === f ? "none" : "1.5px solid #e8eaed",
                      "&:hover": { bgcolor: filterMode === f ? "#8e0229" : "#f5f5f7" },
                      transition: "all 0.15s",
                      boxShadow: filterMode === f ? "0 2px 8px rgba(168,5,50,0.22)" : "none",
                    }}
                  />
                ))}
              </Stack>
              <Typography sx={{ color: "#b0b8c4", fontSize: "0.74rem", ml: "auto !important", fontWeight: 600 }}>
                {displayedCourses.length} course{displayedCourses.length !== 1 ? "s" : ""}
              </Typography>
            </Stack>

            {/* Course list */}
            <Stack spacing={1.5}>
              {displayedCourses.length === 0 ? (
                <Paper elevation={0} sx={{ p: 4, borderRadius: "16px", bgcolor: "#fff", border: "1.5px solid #f0f0f3", textAlign: "center" }}>
                  <Typography sx={{ color: "#333", fontWeight: 800, mb: 0.5 }}>
                    {searchQuery ? "No courses match your search." : `No courses yet for ${data.selectedSemester?.id}.`}
                  </Typography>
                  <Typography sx={{ color: "#888", fontSize: "0.85rem" }}>
                    {searchQuery ? "Try a different query." : "Add a course above (Subject + Number required)."}
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

        {data.tab === 1 && (
          <DueDateElement
            courses={data.selectedSemester?.courses ?? []}
          />
        )}

        {data.tab === 3 && <StudyGroupsPanel />}
        {data.tab === 4 && <NoteSharePanel />}
      </Container>

      <Snackbar open={!!data.toast} autoHideDuration={2600} onClose={() => data.setToast(null)}>
        <Alert severity={(data.toast?.type as "info" | "success" | "warning" | "error") ?? "info"}
          sx={{ width: "100%", borderRadius: 3, fontWeight: 700 }}>
          {data.toast?.text ?? ""}
        </Alert>
      </Snackbar>

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
