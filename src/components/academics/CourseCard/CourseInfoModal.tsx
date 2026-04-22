"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import type { CourseItem } from "../shared/constants";
import { rmpSearchUrl, catalogUrl } from "../shared/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  tab: 0 | 1;
  setTab: (v: 0 | 1) => void;
  semesterLabel: string;
  course: CourseItem | null;
  // notes
  noteAuthor: string;
  noteTopic: string;
  noteBody: string;
  setNoteAuthor: (v: string) => void;
  setNoteTopic: (v: string) => void;
  setNoteBody: (v: string) => void;
  onPostNote: () => void;
};

export default function CourseInfoModal({
  open, onClose, tab: _tab, setTab: _setTab, semesterLabel, course,
  noteAuthor: _noteAuthor, noteTopic: _noteTopic, noteBody: _noteBody,
  setNoteAuthor: _setNoteAuthor, setNoteTopic: _setNoteTopic, setNoteBody: _setNoteBody,
  onPostNote: _onPostNote,
}: Props) {
  const code = course ? `${course.subject.toUpperCase()} ${course.number}` : "";
  const title = course?.title ?? "";
  const professor = course?.professor ?? "";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
    >
      {/* Header */}
      <Box sx={{ bgcolor: "#A80532", px: 3, py: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.72rem", fontWeight: 900, letterSpacing: 2, textTransform: "uppercase" }}>
              {semesterLabel}
            </Typography>
            <Typography fontWeight={950} sx={{ color: "#fff", fontSize: "1.15rem", mt: 0.15 }}>
              {code} {title && `— ${title}`}
            </Typography>
            {professor && (
              <Typography sx={{ color: "rgba(255,255,255,0.80)", fontSize: "0.88rem", mt: 0.25 }}>
                {professor}
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} aria-label="Close course info" sx={{ color: "rgba(255,255,255,0.85)", mt: -0.5, mr: -1 }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      <DialogContent sx={{ p: 2.5 }}>
        {/* Notes removed: modal now shows Info only */}
        <>
            {/* Quick stats row */}
            <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mb: 2 }}>
              {[
                { label: "Units", value: course?.units ?? "—" },
                { label: "Section", value: course?.sectionId ?? "—" },
                { label: "Mode", value: course?.isOnline ? "Online" : "In-Person" },
                { label: "Location", value: course?.location ?? "—" },
              ].map((s) => (
                <Paper key={s.label} elevation={0} sx={{ p: "6px 14px", borderRadius: 2, bgcolor: "rgba(168,5,50,0.06)", border: "1px solid rgba(168,5,50,0.12)", textAlign: "center" }}>
                  <Typography sx={{ fontSize: "1.1rem", fontWeight: 950, color: "#A80532", lineHeight: 1 }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: "0.68rem", color: "rgba(0,0,0,0.55)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</Typography>
                </Paper>
              ))}
            </Stack>

            {/* Description */}
            {course?.description ? (
              <Paper elevation={0} sx={{ p: 1.75, borderRadius: 3, bgcolor: "rgba(0,0,0,0.03)", mb: 1.5 }}>
                <Typography fontWeight={950} sx={{ mb: 0.5, fontSize: "0.88rem" }}>Description</Typography>
                <Typography sx={{ color: "rgba(0,0,0,0.72)", fontSize: "0.92rem", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                  {course.description}
                </Typography>
              </Paper>
            ) : (
              <Alert severity="info" sx={{ mb: 1.5, fontSize: "0.85rem" }}>
                No catalog description loaded yet — backend endpoint needed.
              </Alert>
            )}

            {/* Prerequisites */}
            <Paper elevation={0} sx={{ p: 1.75, borderRadius: 3, bgcolor: "rgba(168,5,50,0.05)", border: "1px solid rgba(168,5,50,0.12)", mb: 2 }}>
              <Typography fontWeight={950} sx={{ color: "#A80532", mb: 0.5, fontSize: "0.88rem" }}>Prerequisites</Typography>
              <Typography sx={{ color: "rgba(0,0,0,0.72)", fontSize: "0.92rem" }}>
                {course?.prerequisitesText ?? "No prerequisite text available. Backend endpoint required."}
              </Typography>
            </Paper>

            {/* External links */}
            <Stack spacing={0.75}>
              {professor && (
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<OpenInNewRoundedIcon />}
                  onClick={() => window.open(rmpSearchUrl(professor), "_blank", "noopener,noreferrer")}
                  sx={{ borderRadius: 999, fontWeight: 900, textTransform: "none", borderColor: "rgba(0,0,0,0.20)", color: "rgba(0,0,0,0.70)", justifyContent: "flex-start", px: 2, "&:hover": { borderColor: "rgba(0,0,0,0.40)" } }}
                >
                  Rate My Professor — {professor}
                </Button>
              )}
              {course && (
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<OpenInNewRoundedIcon />}
                  onClick={() => window.open(catalogUrl(course.subject, `${course.subject}-${course.number}`), "_blank", "noopener,noreferrer")}
                  sx={{ borderRadius: 999, fontWeight: 900, textTransform: "none", borderColor: "rgba(0,0,0,0.20)", color: "rgba(0,0,0,0.70)", justifyContent: "flex-start", px: 2, "&:hover": { borderColor: "rgba(0,0,0,0.40)" } }}
                >
                  CSUN Catalog — {code}
                </Button>
              )}
            </Stack>
        </>
      </DialogContent>
    </Dialog>
  );
}
