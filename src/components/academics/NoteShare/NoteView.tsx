"use client";

// ============================================================
// NoteView.tsx — Revamped: paper-slide animation, opened-folder UI
// ============================================================

import * as React from "react";
import {
  Box, Button, Chip, Dialog, DialogContent, Divider, FormControl,
  IconButton, InputAdornment, MenuItem, Paper, Select, Stack,
  TextField, Tooltip, Typography, useMediaQuery, useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import ImageIcon from "@mui/icons-material/Image";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import LinkIcon from "@mui/icons-material/Link";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import type {
  NoteComment, NoteFolder, NoteFolderItem,
  NoteFolderItemType, NoteFolderVisibility,
} from "@/components/academics/shared/constants";

import NoteViewCommentsPanel from "@/components/academics/NoteShare/NoteViewCommentsPanel";
import { Stars } from "@/components/academics/NoteShare/NoteView.ui";

function makeId() {
  return `${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}
function formatRelative(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}
function isCsunEmail(email: string) {
  return email.trim().toLowerCase().endsWith("@my.csun.edu");
}

const TYPE_META: Record<NoteFolderItemType, { label: string; icon: React.ReactNode; color: string }> = {
  pdf:   { label: "PDF",   icon: <PictureAsPdfIcon sx={{ fontSize: 16 }} />,  color: "#e8522b" },
  doc:   { label: "Doc",   icon: <DescriptionIcon  sx={{ fontSize: 16 }} />,  color: "#2563eb" },
  video: { label: "Video", icon: <VideoLibraryIcon sx={{ fontSize: 16 }} />,  color: "#7c3aed" },
  image: { label: "Image", icon: <ImageIcon        sx={{ fontSize: 16 }} />,  color: "#059669" },
  zip:   { label: "ZIP",   icon: <FolderZipIcon    sx={{ fontSize: 16 }} />,  color: "#d97706" },
  link:  { label: "Link",  icon: <LinkIcon         sx={{ fontSize: 16 }} />,  color: "#0891b2" },
};

function calcAvgRating(comments: NoteComment[], itemId?: string) {
  const list = comments.filter((c) => (itemId ? c.itemId === itemId : true));
  if (list.length === 0) return 0;
  return list.reduce((a, c) => a + c.rating, 0) / list.length;
}

export default function NoteView({
  open, folder, items, comments, onClose, onUploadItem, onAddComment,
}: {
  open: boolean;
  folder: NoteFolder;
  items: NoteFolderItem[];
  comments: NoteComment[];
  onClose: () => void;
  onUploadItem: (item: NoteFolderItem) => void;
  onAddComment: (comment: NoteComment) => void;
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [mode, setMode] = React.useState<"view" | "upload">("view");
  const [prevMode, setPrevMode] = React.useState<"view" | "upload">("view");
  const [animating, setAnimating] = React.useState(false);

  const [ratingFilter, setRatingFilter] = React.useState<"all" | "4plus" | "3plus" | "2plus">("all");
  const [typeFilter, setTypeFilter] = React.useState<"all" | NoteFolderItemType>("all");
  const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);

  // Upload form
  const [uploadTitle, setUploadTitle] = React.useState("");
  const [uploadDesc, setUploadDesc] = React.useState("");
  const [uploadUrl, setUploadUrl] = React.useState("");
  const [uploadFile, setUploadFile] = React.useState<File | null>(null);
  const [uploadFileName, setUploadFileName] = React.useState("");
  const [uploadType, setUploadType] = React.useState<NoteFolderItemType>("pdf");
  const [uploadVisibility, setUploadVisibility] = React.useState<NoteFolderVisibility>("public");
  const [uploadInvitedEmail, setUploadInvitedEmail] = React.useState("");
  const [uploadInvited, setUploadInvited] = React.useState<string[]>([]);
  const [uploaderEmail, setUploaderEmail] = React.useState("");
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    setMode("view");
    setPrevMode("view");
    setHoveredItemId(null);
    setSelectedItemId(null);
    setRatingFilter("all");
    setTypeFilter("all");
  }, [open]);

  // Paper-slide mode switch
  const switchMode = (next: "view" | "upload") => {
    if (next === mode || animating) return;
    setPrevMode(mode);
    setAnimating(true);
    setMode(next);
    setTimeout(() => setAnimating(false), 400);
  };

  const folderItems = items
    .filter((i) => i.folderId === folder.id)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  const filteredItems = folderItems.filter((i) => {
    if (typeFilter !== "all" && i.type !== typeFilter) return false;
    const avg = calcAvgRating(comments.filter((c) => c.itemId === i.id));
    if (ratingFilter === "4plus") return avg >= 4;
    if (ratingFilter === "3plus") return avg >= 3;
    if (ratingFilter === "2plus") return avg >= 2;
    return true;
  });

  const selectedItem = selectedItemId ? folderItems.find((x) => x.id === selectedItemId) ?? null : null;
  const selectedItemComments = comments
    .filter((c) => c.folderId === folder.id)
    .filter((c) => (selectedItem ? c.itemId === selectedItem.id : true))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const avgForSelected = selectedItem
    ? calcAvgRating(selectedItemComments, selectedItem.id)
    : calcAvgRating(selectedItemComments);

  const addUploadInvite = () => {
    const e = uploadInvitedEmail.trim().toLowerCase();
    if (!e || !isCsunEmail(e) || uploadInvited.includes(e)) return;
    setUploadInvited((prev) => [...prev, e]);
    setUploadInvitedEmail("");
  };

  const inferTypeFromName = (name: string): NoteFolderItemType => {
    const n = name.toLowerCase();
    if (n.endsWith(".pdf")) return "pdf";
    if (n.match(/\.(doc|docx)$/)) return "doc";
    if (n.match(/\.(png|jpg|jpeg|webp|gif)$/)) return "image";
    if (n.match(/\.(mp4|mov|avi|mkv)$/)) return "video";
    if (n.match(/\.(zip|rar|7z)$/)) return "zip";
    return "link";
  };

  const handlePickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    setUploadFile(f);
    setUploadFileName(f.name);
    setUploadType(inferTypeFromName(f.name));
    setUploadUrl("");
  };

  const canUpload = React.useMemo(() => {
    if (!uploadTitle.trim()) return false;
    if (!uploaderEmail.trim() || !isCsunEmail(uploaderEmail)) return false;
    if (uploadType === "link") { if (!uploadUrl.trim()) return false; }
    else { if (!uploadFileName.trim() && !uploadUrl.trim()) return false; }
    if (uploadVisibility === "private" && uploadInvited.length === 0) return false;
    return true;
  }, [uploadTitle, uploaderEmail, uploadType, uploadUrl, uploadFileName, uploadVisibility, uploadInvited.length]);

  const submitUpload = () => {
    if (!canUpload) return;
    const generatedUrl = uploadUrl.trim() || (uploadFile ? URL.createObjectURL(uploadFile) : undefined);
    const item: NoteFolderItem = {
      id: makeId(),
      folderId: folder.id,
      title: uploadTitle.trim(),
      description: uploadDesc.trim() || undefined,
      uploadedBy: uploaderEmail.trim().toLowerCase().split("@")[0],
      uploadedByEmail: uploaderEmail.trim().toLowerCase(),
      uploadedAt: new Date().toISOString(),
      type: uploadType,
      url: generatedUrl,
      fileName: uploadFileName || undefined,
      visibility: uploadVisibility,
    };
    onUploadItem(item);
    setUploadTitle(""); setUploadDesc(""); setUploadUrl("");
    setUploadFile(null); setUploadFileName(""); setUploadType("pdf");
    setUploadVisibility("public"); setUploadInvitedEmail("");
    setUploadInvited([]); setUploaderEmail("");
    switchMode("view");
  };

  const isPrivateFolder = folder.visibility === "private";

  // Folder accent color — always CSUN red for consistent branding
  const accentColor = "#A80532";

  const inputSx = { "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff", "& fieldset": { borderColor: "#e8eaed" } } };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : "16px",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
          // The dialog itself looks like an opened folder holder
          border: `3px solid ${accentColor}`,
        },
      }}
      TransitionProps={{ timeout: 280 }}
    >
      {/* ── Opened folder header ── */}
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        {/* Folder tab row above header */}
        <Box sx={{
          display: "flex", alignItems: "flex-end", height: 22,
          bgcolor: "#f2eeec", borderBottom: `2px solid ${accentColor}`,
        }}>
          <Box sx={{
            ml: 3, px: 2, py: 0.25,
            bgcolor: accentColor, borderRadius: "6px 6px 0 0",
            display: "flex", alignItems: "center", gap: 0.75,
          }}>
            <Typography sx={{ color: "#fff", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.06em" }}>
              {folder.subject}{folder.courseNumber ? ` ${folder.courseNumber}` : ""}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          {/* Decorative folder holes */}
          {[0, 1, 2].map((i) => (
            <Box key={i} sx={{
              width: 10, height: 10, borderRadius: "50%",
              bgcolor: "#e0e3e8", border: "1.5px solid #d0d4da",
              mr: i === 2 ? 2 : 0.8, mb: 0.5,
            }} />
          ))}
        </Box>

        {/* Main header */}
        <Box sx={{
          bgcolor: accentColor, px: 3, py: 2,
          background: `linear-gradient(135deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 85%, black) 100%)`,
          position: "relative",
        }}>
          {/* Folder paper texture lines */}
          {[0, 1, 2, 3].map((i) => (
            <Box key={i} sx={{
              position: "absolute", left: 0, right: 0,
              top: 8 + i * 10, height: 1,
              bgcolor: "rgba(255,255,255,0.06)",
              pointerEvents: "none",
            }} />
          ))}

          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ position: "relative", zIndex: 1 }}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography fontWeight={900} sx={{ color: "#fff", fontSize: "1.1rem", letterSpacing: "-0.01em" }}>
                  {folder.topic}
                </Typography>
                <Chip
                  size="small"
                  icon={isPrivateFolder ? <LockRoundedIcon sx={{ fontSize: 12 }} /> : <PublicRoundedIcon sx={{ fontSize: 12 }} />}
                  label={isPrivateFolder ? "Private" : "Public"}
                  sx={{ height: 18, fontSize: "0.64rem", fontWeight: 800, bgcolor: "rgba(255,255,255,0.18)", color: "#fff", "& .MuiChip-icon": { color: "#fff" } }}
                />
              </Stack>
              <Typography sx={{ color: "rgba(255,255,255,0.70)", fontSize: "0.80rem", mt: 0.25 }}>
                {folder.subject}{folder.courseNumber ? ` ${folder.courseNumber}` : ""} · {folderItems.length} item{folderItems.length === 1 ? "" : "s"}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant={mode === "upload" ? "contained" : "outlined"}
                onClick={() => switchMode(mode === "upload" ? "view" : "upload")}
                startIcon={mode === "upload" ? <ArrowBackRoundedIcon sx={{ fontSize: 15 }} /> : <CloudUploadIcon sx={{ fontSize: 15 }} />}
                sx={{
                  bgcolor: mode === "upload" ? "#fff" : "transparent",
                  color: mode === "upload" ? accentColor : "rgba(255,255,255,0.90)",
                  borderColor: "rgba(255,255,255,0.45)",
                  fontWeight: 800, borderRadius: 999, px: 2.25, fontSize: "0.82rem",
                  "&:hover": {
                    bgcolor: mode === "upload" ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.08)",
                    borderColor: "rgba(255,255,255,0.75)",
                  },
                }}
              >
                {mode === "upload" ? "Back to Files" : "Upload"}
              </Button>
              <IconButton onClick={onClose} sx={{ color: "rgba(255,255,255,0.85)", "&:hover": { bgcolor: "rgba(255,255,255,0.10)" } }}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0, bgcolor: "#f2eeec" }}>
        <Box sx={{
          display: "grid",
          gridTemplateColumns: fullScreen ? "1fr" : "1.55fr 1fr",
          minHeight: fullScreen ? "auto" : 560,
        }}>
          {/* ── Main column: paper-slide container ── */}
          <Box sx={{ p: 2.5, position: "relative" }}>

            {/* Paper stack effect: the "behind" page slightly visible */}
            <Box sx={{
              position: "absolute",
              inset: "12px 8px",
              bgcolor: "#fff",
              borderRadius: "16px",
              border: "1.5px solid #e8eaed",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              zIndex: 0,
              transform: "rotate(-1.2deg) translateY(4px)",
            }} />
            <Box sx={{
              position: "absolute",
              inset: "12px 8px",
              bgcolor: "#fff",
              borderRadius: "16px",
              border: "1.5px solid #e8eaed",
              zIndex: 0,
              transform: "rotate(0.8deg) translateY(2px)",
            }} />

            {/* ── View sheet ── */}
            <Box
              sx={{
                position: "relative",
                zIndex: 2,
                borderRadius: "16px",
                bgcolor: "#fff",
                border: "1.5px solid #e8eaed",
                boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                height: fullScreen ? "auto" : 520,
                minHeight: 520,
                overflow: "hidden",
                // Paper-slide animation: slides up-and-out when switching to upload
                transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease",
                transform: mode === "upload" ? "translateY(-8px) scale(0.98)" : "translateY(0) scale(1)",
                opacity: mode === "upload" ? 0 : 1,
                pointerEvents: mode === "upload" ? "none" : "auto",
              }}
            >
              <Box sx={{
                p: 2.25, height: "100%", display: "flex", flexDirection: "column",
                // Folder ruled-line paper texture
                backgroundImage: `repeating-linear-gradient(transparent, transparent 27px, #f0f4ff 28px)`,
                backgroundSize: "100% 28px",
              }}>
                {/* Corner fold decoration */}
                <Box sx={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderStyle: "solid", borderWidth: "0 44px 44px 0", borderColor: `transparent ${`${accentColor}18`} transparent transparent` }} />
                <Box sx={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderStyle: "solid", borderWidth: "0 30px 30px 0", borderColor: "transparent #f8f9fb transparent transparent" }} />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ sm: "center" }} justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.90rem", color: "#222" }}>
                    Files in this folder
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FormControl size="small">
                      <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}
                        sx={{ minWidth: 100, borderRadius: 2, bgcolor: "#fff", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}>
                        <MenuItem value="all">All Types</MenuItem>
                        <MenuItem value="pdf">PDF</MenuItem>
                        <MenuItem value="doc">Doc</MenuItem>
                        <MenuItem value="video">Video</MenuItem>
                        <MenuItem value="image">Image</MenuItem>
                        <MenuItem value="zip">ZIP</MenuItem>
                        <MenuItem value="link">Link</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small">
                      <Select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value as any)}
                        sx={{ minWidth: 110, borderRadius: 2, bgcolor: "#fff", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}>
                        <MenuItem value="all">All Ratings</MenuItem>
                        <MenuItem value="4plus">4+ Stars</MenuItem>
                        <MenuItem value="3plus">3+ Stars</MenuItem>
                        <MenuItem value="2plus">2+ Stars</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                </Stack>

                <Divider sx={{ mb: 1.4, borderColor: "#f0f0f3" }} />

                <Stack spacing={1.1} sx={{ overflow: "auto", flex: 1, pr: 0.5 }}>
                  {filteredItems.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: "center" }}>
                      <Typography sx={{ fontWeight: 800, color: "#aaa" }}>No files match your filters</Typography>
                      <Typography sx={{ fontSize: "0.84rem", color: "#bbb", mt: 0.5 }}>Switch to All, or upload a new file.</Typography>
                    </Box>
                  ) : (
                    filteredItems.map((it) => {
                      const avg = calcAvgRating(comments.filter((c) => c.itemId === it.id));
                      const meta = TYPE_META[it.type];
                      const isSelected = selectedItemId === it.id;
                      return (
                        <Tooltip key={it.id} title={it.description ?? ""} arrow placement="top" disableHoverListener={!it.description}>
                          <Paper
                            elevation={0}
                            onMouseEnter={() => setHoveredItemId(it.id)}
                            onMouseLeave={() => setHoveredItemId((prev) => (prev === it.id ? null : prev))}
                            onClick={() => setSelectedItemId(it.id)}
                            sx={{
                              borderRadius: 3, p: 1.5, cursor: "pointer",
                              bgcolor: isSelected ? `${accentColor}08` : hoveredItemId === it.id ? `${accentColor}05` : "#fff",
                              border: `1.5px solid`,
                              borderColor: isSelected ? `${accentColor}40` : hoveredItemId === it.id ? `${accentColor}25` : "#f0f0f3",
                              transition: "all 0.18s",
                              "&:hover": { transform: "translateY(-1px)", boxShadow: "0 6px 20px rgba(0,0,0,0.06)" },
                            }}
                          >
                            <Stack direction="row" spacing={1.2} alignItems="flex-start">
                              <Box sx={{ mt: 0.2, color: meta.color }}>{meta.icon}</Box>
                              <Stack spacing={0.4} flex={1}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                                  <Typography sx={{ fontWeight: 800, fontSize: "0.90rem", color: "#111" }}>{it.title}</Typography>
                                  <Chip size="small" label={meta.label}
                                    sx={{ height: 17, fontSize: "0.60rem", fontWeight: 800, bgcolor: `${meta.color}15`, color: meta.color }} />
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flexWrap: "wrap" }}>
                                  <Typography sx={{ fontSize: "0.72rem", color: "#999" }}>
                                    {it.uploadedBy} · {formatRelative(it.uploadedAt)}
                                  </Typography>
                                  <Stack direction="row" spacing={0.6} alignItems="center">
                                    <Chip size="small"
                                      icon={it.visibility === "private" ? <LockRoundedIcon sx={{ fontSize: 11 }} /> : <PublicRoundedIcon sx={{ fontSize: 11 }} />}
                                      label={it.visibility === "private" ? "Private" : "Public"}
                                      sx={{
                                        height: 17, fontSize: "0.60rem", fontWeight: 800,
                                        bgcolor: it.visibility === "private" ? "rgba(124,58,237,0.08)" : "rgba(22,163,74,0.08)",
                                        color: it.visibility === "private" ? "#7c3aed" : "#16a34a",
                                        "& .MuiChip-icon": { color: "inherit" },
                                      }} />
                                    <Box sx={{ minWidth: 70, display: "flex", justifyContent: "flex-end" }}>
                                      {avg > 0 ? <Stars value={avg} size={13} /> : (
                                        <Typography sx={{ fontSize: "0.68rem", color: "#ccc", fontWeight: 700 }}>No ratings</Typography>
                                      )}
                                    </Box>
                                  </Stack>
                                </Stack>
                                <Stack direction="row" spacing={0.6} justifyContent="flex-end" sx={{ mt: 0.5 }}>
                                  {it.url && (
                                    <Button size="small" variant="outlined"
                                      startIcon={<VisibilityIcon sx={{ fontSize: 12 }} />}
                                      onClick={(e) => { e.stopPropagation(); window.open(it.url, "_blank", "noopener,noreferrer"); }}
                                      sx={{
                                        borderRadius: 999, fontWeight: 800, fontSize: "0.70rem",
                                        borderColor: "#e8eaed", color: "#555",
                                        "&:hover": { borderColor: "#A80532", color: "#A80532" },
                                      }}>
                                      Open
                                    </Button>
                                  )}
                                  <Button size="small" variant="contained"
                                    onClick={(e) => { e.stopPropagation(); setSelectedItemId(it.id); }}
                                    sx={{
                                      bgcolor: accentColor, "&:hover": { bgcolor: `color-mix(in srgb, ${accentColor} 85%, black)` },
                                      borderRadius: 999, fontWeight: 800, fontSize: "0.70rem",
                                    }}>
                                    Details
                                  </Button>
                                </Stack>
                              </Stack>
                            </Stack>
                          </Paper>
                        </Tooltip>
                      );
                    })
                  )}
                </Stack>
              </Box>
            </Box>

            {/* ── Upload sheet (slides in from behind like a new paper sheet) ── */}
            <Box
              sx={{
                position: "absolute",
                inset: "20px 20px 20px 20px",
                zIndex: mode === "upload" ? 3 : 1,
                borderRadius: "16px",
                bgcolor: "#fff",
                border: "1.5px solid #e8eaed",
                boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                overflow: "hidden",
                // Paper-slide: starts below and slides up, or slides down when going back
                transition: "transform 0.38s cubic-bezier(0.34,1.2,0.64,1), opacity 0.30s ease",
                transform: mode === "upload" ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)",
                opacity: mode === "upload" ? 1 : 0,
                pointerEvents: mode === "upload" ? "auto" : "none",
              }}
            >
              {/* Top edge accent — like a colored paper sheet */}
              <Box sx={{ height: 4, bgcolor: accentColor, background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}88 70%, transparent 100%)` }} />

              <Box sx={{
                p: 2.25, height: "100%", overflowY: "auto",
                // Light ruled-paper background
                backgroundImage: `repeating-linear-gradient(transparent, transparent 27px, #fff8f0 28px)`,
                backgroundSize: "100% 28px",
              }}>
                {/* Fold corner */}
                <Box sx={{ position: "absolute", top: 4, right: 0, width: 0, height: 0, borderStyle: "solid", borderWidth: "0 44px 44px 0", borderColor: `transparent ${`${accentColor}14`} transparent transparent` }} />

                <Typography sx={{ fontWeight: 900, fontSize: "0.92rem", color: "#222", mb: 0.3 }}>Upload a file</Typography>
                <Typography sx={{ fontSize: "0.76rem", color: "#999", mb: 2 }}>Add notes, visuals, links, or resources for this folder.</Typography>

                <Stack spacing={1.2}>
                  <TextField label="Title" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} fullWidth size="small" sx={inputSx} />
                  <TextField label="Description (optional)" value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} fullWidth size="small" sx={inputSx} />

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                    <FormControl fullWidth size="small">
                      <Select value={uploadType} onChange={(e) => setUploadType(e.target.value as any)}
                        sx={{ borderRadius: 2, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}>
                        <MenuItem value="pdf">PDF</MenuItem>
                        <MenuItem value="doc">Doc</MenuItem>
                        <MenuItem value="video">Video</MenuItem>
                        <MenuItem value="image">Image</MenuItem>
                        <MenuItem value="zip">ZIP</MenuItem>
                        <MenuItem value="link">Link</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <Select value={uploadVisibility} onChange={(e) => setUploadVisibility(e.target.value as any)}
                        sx={{ borderRadius: 2, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e8eaed" } }}>
                        <MenuItem value="public">Public</MenuItem>
                        <MenuItem value="private">Private</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>

                  <TextField label="Your CSUN Email" value={uploaderEmail} onChange={(e) => setUploaderEmail(e.target.value)} fullWidth size="small" sx={inputSx} />

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ sm: "center" }}>
                    <Button variant="outlined" onClick={() => fileRef.current?.click()}
                      startIcon={<CloudUploadIcon />}
                      sx={{ borderRadius: 999, fontWeight: 800, borderColor: "#e8eaed", color: "#555", "&:hover": { borderColor: accentColor, color: accentColor } }}>
                      Choose file
                    </Button>
                    <Typography sx={{ fontSize: "0.76rem", color: "#999", fontWeight: 700 }}>
                      {uploadFileName || "No file selected"}
                    </Typography>
                    <input ref={fileRef} type="file" hidden onChange={handlePickFile} />
                  </Stack>

                  <TextField label="Or paste a URL (optional)" value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} fullWidth size="small"
                    InputProps={{ startAdornment: <InputAdornment position="start"><LinkIcon sx={{ fontSize: 16, color: "#bbb" }} /></InputAdornment> }}
                    sx={inputSx} />

                  {uploadVisibility === "private" && (
                    <Box>
                      <Typography sx={{ fontSize: "0.74rem", color: "#888", fontWeight: 800, mb: 0.7 }}>Invite CSUN Emails</Typography>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        <TextField value={uploadInvitedEmail} onChange={(e) => setUploadInvitedEmail(e.target.value)} fullWidth size="small" placeholder="someone@my.csun.edu" sx={inputSx} />
                        <Button variant="contained" onClick={addUploadInvite}
                          sx={{ borderRadius: 999, fontWeight: 800, bgcolor: accentColor, "&:hover": { bgcolor: `color-mix(in srgb, ${accentColor} 85%, black)` } }}>
                          Add
                        </Button>
                      </Stack>
                      <Stack direction="row" spacing={0.7} sx={{ mt: 1, flexWrap: "wrap" }}>
                        {uploadInvited.map((e) => (
                          <Chip key={e} label={e} onDelete={() => setUploadInvited((prev) => prev.filter((x) => x !== e))}
                            sx={{ bgcolor: "rgba(168,5,50,0.08)", color: "#A80532", fontWeight: 800 }} />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 0.5 }}>
                    <Button variant="contained" disabled={!canUpload} onClick={submitUpload}
                      sx={{
                        borderRadius: 999, fontWeight: 900, px: 2.6,
                        bgcolor: accentColor, "&:hover": { bgcolor: `color-mix(in srgb, ${accentColor} 85%, black)` },
                        boxShadow: `0 2px 10px ${accentColor}44`,
                        "&.Mui-disabled": { bgcolor: "#e8eaed", color: "#aaa", boxShadow: "none" },
                      }}>
                      Upload
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Box>

          {/* ── Comments column ── */}
          <Box sx={{ p: 2.5, borderLeft: fullScreen ? "none" : "1.5px solid #e8e0dc", bgcolor: "#f2eeec" }}>
            <NoteViewCommentsPanel
              folder={folder}
              selectedItem={selectedItem}
              selectedItemComments={selectedItemComments}
              avgForSelected={avgForSelected}
              formatRelative={formatRelative}
              onAddComment={onAddComment}
            />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
