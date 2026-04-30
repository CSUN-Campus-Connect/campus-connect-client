"use client";

import * as React from "react";
import {
  Avatar, Box, Button, Chip, Dialog, DialogContent, Divider,
  FormControlLabel, IconButton, Paper, Stack, Switch, TextField,
  Tooltip, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import CloseIcon from "@mui/icons-material/Close";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";

import type { NoteFolder } from "@/components/academics/shared/constants";
import { formatRelative, isCsunEmail, makeId } from "@/components/academics/NoteShare/NoteSharePanel.utils";

// ─── FolderCard ──────────────────────────────────────────────────────────────
// Resembles a real physical office file folder holder with open animation
export function FolderCard({
  folder, itemCount, isSaved, onSave, onUnsave, onOpen,
}: {
  folder: NoteFolder;
  itemCount: number;
  isSaved: boolean;
  onSave: () => void;
  onUnsave: () => void;
  onOpen: () => void;
}) {
  const [hovered, setHovered] = React.useState(false);
  const isPrivate = folder.visibility === "private";

  // Folder color — always use CSUN red for consistent theming
  const folderColor = "#A80532";

  const folderLight = `${folderColor}18`;
  const folderMid = `${folderColor}30`;

  return (
    <Box
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: "relative",
        cursor: "pointer",
        // Perspective for 3D fold effect
        perspective: "800px",
        userSelect: "none",
      }}
    >
      {/* ── Folder tab (top flap) ── */}
      <Box
        sx={{
          position: "relative",
          height: 28,
          display: "flex",
          alignItems: "flex-end",
          zIndex: 1,
          // Lift the tab on hover
          transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1)",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
          transformOrigin: "bottom center",
        }}
      >
        {/* Left tab nub */}
        <Box
          sx={{
            position: "absolute",
            left: 16,
            bottom: 0,
            width: 96,
            height: "100%",
            bgcolor: hovered ? folderColor : `color-mix(in srgb, ${folderColor} 80%, white)`,
            borderRadius: "6px 6px 0 0",
            transition: "background-color 0.18s",
            display: "flex",
            alignItems: "center",
            px: 1.25,
            gap: 0.5,
            overflow: "hidden",
          }}
        >
          <Chip
            label={folder.courseNumber ? `${folder.subject} ${folder.courseNumber}` : folder.subject}
            size="small"
            sx={{
              height: 16, fontSize: "0.62rem", fontWeight: 800,
              bgcolor: "rgba(255,255,255,0.28)", color: "#fff",
              letterSpacing: "0.03em",
            }}
          />
        </Box>
        {/* Remainder of tab row — folder top edge */}
        <Box sx={{ flex: 1, height: 10, bgcolor: "#f5f5f5", borderTop: "1.5px solid #e8eaed" }} />
      </Box>

      {/* ── Folder body ── */}
      <Box
        sx={{
          position: "relative",
          bgcolor: "#fff",
          borderRadius: "0 8px 8px 8px",
          border: `1.5px solid`,
          borderColor: hovered ? folderColor : "#e8eaed",
          borderTop: `3px solid ${hovered ? folderColor : "#e0e3e8"}`,
          overflow: "hidden",
          transition: "border-color 0.18s, box-shadow 0.22s, transform 0.22s",
          boxShadow: hovered
            ? `0 12px 36px rgba(0,0,0,0.12), 0 0 0 1px ${folderMid}`
            : "0 2px 10px rgba(0,0,0,0.06)",
          transform: hovered ? "translateY(-3px)" : "translateY(0)",
          // Subtle open effect: slight skew on hover mimics folder opening
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, ${folderLight} 0%, transparent 55%)`,
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.22s",
            pointerEvents: "none",
            zIndex: 0,
          },
        }}
      >
        {/* Folder line decorations (like real folder lines) */}
        <Box sx={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${folderColor} 0%, ${folderColor}88 60%, transparent 100%)`,
          zIndex: 1,
        }} />

        {/* "Papers" peeking out the top - animated on hover */}
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              top: -6 - i * 3,
              left: 20 + i * 14,
              width: 48,
              height: 10,
              bgcolor: i === 0 ? "#fffde7" : i === 1 ? "#e8f5e9" : "#fce4ec",
              border: "1px solid rgba(0,0,0,0.08)",
              borderBottom: "none",
              borderRadius: "3px 3px 0 0",
              transition: `transform 0.28s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.04}s`,
              transform: hovered ? `translateY(-${4 + i * 2}px) rotate(${(i - 1) * 2}deg)` : "translateY(0) rotate(0)",
              zIndex: -1,
            }}
          />
        ))}

        <Box sx={{ position: "relative", zIndex: 2, p: 2 }}>
          {/* Header row */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 1 }}>
            <Stack direction="row" spacing={0.6} alignItems="center" flexWrap="wrap">
              <Chip
                size="small"
                icon={isPrivate ? <LockRoundedIcon sx={{ fontSize: 12 }} /> : <PublicRoundedIcon sx={{ fontSize: 12 }} />}
                label={isPrivate ? "Private" : "Public"}
                sx={{
                  height: 18, fontSize: "0.62rem", fontWeight: 800,
                  bgcolor: isPrivate ? "rgba(124,58,237,0.08)" : "rgba(22,163,74,0.08)",
                  color: isPrivate ? "#7c3aed" : "#16a34a",
                  "& .MuiChip-icon": { color: "inherit" },
                }}
              />
              {isSaved && (
                <Chip
                  icon={<BookmarkRoundedIcon sx={{ fontSize: "10px !important" }} />}
                  label="Saved" size="small"
                  sx={{ height: 18, fontSize: "0.60rem", fontWeight: 800, bgcolor: "#f0fdf4", color: "#16a34a", "& .MuiChip-icon": { color: "#16a34a" } }}
                />
              )}
            </Stack>
            <Chip
              size="small" label={`${itemCount} item${itemCount === 1 ? "" : "s"}`}
              sx={{ height: 18, fontSize: "0.60rem", fontWeight: 800, bgcolor: folderLight, color: folderColor }}
            />
          </Stack>

          {/* Title */}
          <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 0.6 }}>
            {/* SVG folder icon */}
            <Box sx={{ mt: 0.2, flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 5C2 4.448 2.448 4 3 4H7.586A1 1 0 018.293 4.293L9.707 5.707A1 1 0 0010.414 6H17a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V5z" fill={folderColor} opacity="0.9"/>
                <path d="M2 8h16v6a1 1 0 01-1 1H3a1 1 0 01-1-1V8z" fill={`color-mix(in srgb, ${folderColor} 70%, white)`}/>
              </svg>
            </Box>
            <Typography fontWeight={800} sx={{ fontSize: "0.93rem", lineHeight: 1.25, color: "#111" }}>
              {folder.topic}
            </Typography>
          </Stack>

          {folder.description && (
            <Typography sx={{
              fontSize: "0.77rem", color: "#666", lineHeight: 1.5, mb: 0.75,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {folder.description}
            </Typography>
          )}

          {(folder.tags ?? []).length > 0 && (
            <Stack direction="row" flexWrap="wrap" gap={0.4} sx={{ mb: 1 }}>
              {folder.tags!.slice(0, 3).map((t) => (
                <Chip key={t} label={t} size="small"
                  sx={{ height: 16, fontSize: "0.60rem", fontWeight: 700, bgcolor: folderLight, color: folderColor }} />
              ))}
            </Stack>
          )}

          <Divider sx={{ my: 1, borderColor: "#f0f0f3" }} />

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Avatar sx={{ width: 20, height: 20, fontSize: "0.58rem", bgcolor: folderColor, fontWeight: 900 }}>
                {folder.createdByEmail?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#555", lineHeight: 1 }}>
                  {folder.createdByEmail}
                </Typography>
                <Typography sx={{ fontSize: "0.60rem", color: "#aaa" }}>{formatRelative(folder.createdAt)}</Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={0.4} alignItems="center">
              {isSaved ? (
                <Tooltip title="Remove from saved">
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); onUnsave(); }}
                    sx={{ p: 0.5, color: "#A80532", "&:hover": { bgcolor: "rgba(168,5,50,0.08)" } }}>
                    <BookmarkRoundedIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Save folder">
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); onSave(); }}
                    sx={{ p: 0.5, color: "#ccc", "&:hover": { color: "#A80532", bgcolor: "rgba(168,5,50,0.06)" } }}>
                    <BookmarkBorderRoundedIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              )}
              <Typography sx={{ fontSize: "0.64rem", color: "#999", fontWeight: 700 }}>Open</Typography>
            </Stack>
          </Stack>
        </Box>

        {/* Private overlay tint */}
        {isPrivate && (
          <Box sx={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3,
            background: "linear-gradient(135deg, rgba(124,58,237,0.05) 0%, rgba(255,255,255,0) 55%)",
          }} />
        )}
      </Box>
    </Box>
  );
}

// ─── SubTabBar ────────────────────────────────────────────────────────────────
export function SubTabBar({ active, counts, onChange, onCreateFolder }: {
  active: number;
  counts: number[];
  onChange: (i: number) => void;
  onCreateFolder: () => void;
}) {
  const tabs = [{ label: "Public Library" }, { label: "Saved Notes" }];
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5, flexWrap: "wrap", gap: 1 }}>
      <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
        {tabs.map((t, i) => (
          <Box
            key={t.label}
            onClick={() => onChange(i)}
            sx={{
              display: "flex", alignItems: "center", gap: 0.5,
              px: 1.5, py: 0.6, borderRadius: 999, cursor: "pointer",
              userSelect: "none", transition: "all 0.15s",
              bgcolor: active === i ? "#A80532" : "#fff",
              color: active === i ? "#fff" : "#555",
              border: active === i ? "none" : "1.5px solid #e8eaed",
              fontWeight: 700, fontSize: "0.80rem",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: active === i ? "0 2px 10px rgba(168,5,50,0.28)" : "none",
              "&:hover": { bgcolor: active === i ? "#8e0229" : "#f5f5f7" },
            }}
          >
            <span style={{ fontSize: "0.75rem" }}></span>
            {t.label}
            {counts[i] > 0 && (
              <Box sx={{
                ml: 0.25,
                bgcolor: active === i ? "rgba(255,255,255,0.28)" : "rgba(168,5,50,0.10)",
                color: active === i ? "#fff" : "#A80532",
                borderRadius: 999, px: 0.75, py: 0.1,
                fontSize: "0.68rem", fontWeight: 900, lineHeight: 1.6,
              }}>
                {counts[i]}
              </Box>
            )}
          </Box>
        ))}
      </Stack>
      <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateFolder}
        sx={{
          bgcolor: "#A80532", "&:hover": { bgcolor: "#8e0229" },
          fontWeight: 800, borderRadius: 999, fontSize: "0.80rem",
          boxShadow: "0 2px 10px rgba(168,5,50,0.28)",
        }}>
        Upload Folder
      </Button>
    </Stack>
  );
}

// ─── FolderCreateModal ────────────────────────────────────────────────────────
export function FolderCreateModal({ open, onClose, onCreate }: {
  open: boolean;
  onClose: () => void;
  onCreate: (folder: NoteFolder) => void;
}) {
  const [topic, setTopic] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [courseNumber, setCourseNumber] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [isPublic, setIsPublic] = React.useState(true);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [invited, setInvited] = React.useState<string[]>([]);
  const [createdByEmail, setCreatedByEmail] = React.useState("");

  const canSubmit = React.useMemo(() => {
    if (!topic.trim() || !subject.trim()) return false;
    if (!createdByEmail.trim() || !isCsunEmail(createdByEmail)) return false;
    if (!isPublic && invited.length === 0) return false;
    return true;
  }, [topic, subject, createdByEmail, isPublic, invited.length]);

  const addInvite = () => {
    const e = inviteEmail.trim().toLowerCase();
    if (!e || !isCsunEmail(e) || invited.includes(e)) return;
    setInvited((prev) => [...prev, e]);
    setInviteEmail("");
  };

  const submit = () => {
    if (!canSubmit) return;
    const folder: NoteFolder = {
      id: makeId(),
      topic: topic.trim(),
      description: description.trim() || undefined,
      subject: subject.trim().toUpperCase(),
      courseNumber: courseNumber.trim() || undefined,
      createdAt: new Date().toISOString(),
      createdByEmail: createdByEmail.trim().toLowerCase(),
      visibility: isPublic ? "public" : "private",
      invitedEmails: isPublic ? undefined : invited,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      savedByMe: true,
    };
    onCreate(folder);
    setTopic(""); setSubject(""); setCourseNumber(""); setDescription(""); setTags("");
    setIsPublic(true); setInviteEmail(""); setInvited([]); setCreatedByEmail("");
    onClose();
  };

  const inputSx = { "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "#e8eaed" }, "&:hover fieldset": { borderColor: "#A80532" } } };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.14)" } }}>
      {/* Header — styled like an open folder top */}
      <Box sx={{ bgcolor: "#A80532", px: 3, py: 2.25, position: "relative", overflow: "hidden" }}>
        <Box sx={{
          position: "absolute", top: -20, right: -20, width: 80, height: 80,
          borderRadius: "50%", bgcolor: "rgba(255,255,255,0.07)",
        }} />
        <Box sx={{
          position: "absolute", bottom: -30, left: "40%", width: 120, height: 60,
          bgcolor: "rgba(255,255,255,0.05)", borderRadius: "50%",
        }} />
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ position: "relative", zIndex: 1 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 7a2 2 0 012-2h4.586a1 1 0 01.707.293l1.414 1.414A1 1 0 0012.414 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" fill="rgba(255,255,255,0.9)"/>
            </svg>
            <Typography fontWeight={900} sx={{ color: "#fff", fontSize: "1.1rem" }}>Create Folder</Typography>
          </Stack>
          <IconButton onClick={onClose} sx={{ color: "rgba(255,255,255,0.80)" }}><CloseIcon /></IconButton>
        </Stack>
        <Typography sx={{ color: "rgba(255,255,255,0.70)", fontSize: "0.80rem", mt: 0.4, position: "relative", zIndex: 1 }}>
          Create a subject folder, then upload files inside it.
        </Typography>
      </Box>

      <DialogContent sx={{ p: 2.5 }}>
        <Stack spacing={1.6}>
          <TextField size="small" label="Topic *" value={topic} onChange={(e) => setTopic(e.target.value)}
            placeholder='"Midterm Review Pack"' sx={inputSx} />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <TextField size="small" label="Subject *" value={subject}
              onChange={(e) => setSubject(e.target.value)} placeholder="COMP" sx={{ flex: 1, ...inputSx }} />
            <TextField size="small" label="Course Number" value={courseNumber}
              onChange={(e) => setCourseNumber(e.target.value)} placeholder="333" sx={{ flex: 1, ...inputSx }} />
          </Stack>

          <TextField size="small" label="Short Description" value={description}
            onChange={(e) => setDescription(e.target.value)} multiline minRows={2} sx={inputSx} />

          <TextField size="small" label="Tags (comma-separated)" value={tags}
            onChange={(e) => setTags(e.target.value)} placeholder="STEM, Midterm, Practice" sx={inputSx} />

          <Paper elevation={0} sx={{
            p: 1.5, borderRadius: 2.5,
            bgcolor: isPublic ? "#f0fdf4" : "#f5f3ff",
            border: `1.5px solid ${isPublic ? "#bbf7d0" : "#ddd6fe"}`,
          }}>
            <FormControlLabel
              control={
                <Switch checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#16a34a" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#16a34a" },
                  }} />
              }
              label={
                <Box>
                  <Typography sx={{ fontSize: "0.88rem", fontWeight: 800, color: isPublic ? "#16a34a" : "#7c3aed" }}>
                    {isPublic ? "🌐 Public" : "🔒 Private"}
                  </Typography>
                  <Typography sx={{ fontSize: "0.74rem", color: "rgba(0,0,0,0.55)", mt: 0.2 }}>
                    {isPublic ? "Visible to all CSUN students" : "Only invited CSUN emails can view"}
                  </Typography>
                </Box>
              }
            />
          </Paper>

          {!isPublic && (
            <Box>
              <Typography sx={{ fontSize: "0.74rem", fontWeight: 800, color: "#888", mb: 0.75, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Invited Emails
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField size="small" fullWidth value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInvite(); } }}
                  placeholder="example@my.csun.edu" sx={inputSx} />
                <Button onClick={addInvite} variant="outlined"
                  sx={{ borderColor: "#e8eaed", color: "#555", fontWeight: 800, borderRadius: 2, px: 2.25, "&:hover": { borderColor: "#A80532", color: "#A80532" } }}>
                  Add
                </Button>
              </Stack>
              {invited.length > 0 && (
                <Stack direction="row" flexWrap="wrap" gap={0.6} sx={{ mt: 1 }}>
                  {invited.map((e) => (
                    <Chip key={e} label={e} size="small"
                      onDelete={() => setInvited((prev) => prev.filter((x) => x !== e))}
                      sx={{ fontWeight: 700, bgcolor: "rgba(124,58,237,0.08)", color: "#7c3aed" }} />
                  ))}
                </Stack>
              )}
            </Box>
          )}

          <TextField size="small" label="Your CSUN Email *" value={createdByEmail}
            onChange={(e) => setCreatedByEmail(e.target.value)} placeholder="you@my.csun.edu"
            error={!!createdByEmail && !isCsunEmail(createdByEmail)}
            helperText={!!createdByEmail && !isCsunEmail(createdByEmail) ? "Must end with @my.csun.edu" : ""}
            sx={inputSx} />

          <Button variant="contained" onClick={submit} disabled={!canSubmit}
            sx={{
              bgcolor: "#A80532", "&:hover": { bgcolor: "#8e0229" },
              fontWeight: 900, borderRadius: 999, py: 1.25,
              boxShadow: "0 2px 10px rgba(168,5,50,0.30)",
              "&.Mui-disabled": { bgcolor: "#e8eaed", color: "#aaa", boxShadow: "none" },
            }}>
            Create Folder
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
