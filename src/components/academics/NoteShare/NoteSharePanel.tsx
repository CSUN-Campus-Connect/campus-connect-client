"use client";

import * as React from "react";
import { Alert, Box, Button, Chip, InputAdornment, Paper, Snackbar, Stack, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";

import type { NoteComment, NoteFolder, NoteFolderItem } from "@/components/academics/shared/constants";
import { mockNoteComments, mockNoteFolderItems, mockNoteFolders } from "@/components/academics/shared/mockData";

import NoteView from "@/components/academics/NoteShare/NoteView";
import { FolderCard, FolderCreateModal, SubTabBar } from "@/components/academics/NoteShare/NoteSharePanel.components";
import { SUBJECT_CHIPS, TOPIC_TAGS } from "@/components/academics/NoteShare/NoteSharePanel.utils";

export default function NoteSharePanel() {
  const [folders, setFolders] = React.useState<NoteFolder[]>(mockNoteFolders);
  const [items, setItems] = React.useState<NoteFolderItem[]>(mockNoteFolderItems);
  const [comments, setComments] = React.useState<NoteComment[]>(mockNoteComments);

  const [subTab, setSubTab] = React.useState(0);
  const [createFolderOpen, setCreateFolderOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeSubject, setActiveSubject] = React.useState("All");
  const [activeTag, setActiveTag] = React.useState<string>("All");
  const [toast, setToast] = React.useState<string | null>(null);
  const [openFolderId, setOpenFolderId] = React.useState<string | null>(null);

  const publicFolders = folders.filter((f) => f.visibility === "public");
  const savedFolders = folders.filter((f) => !!f.savedByMe);

  const displayedFolders = React.useMemo(() => {
    const base = subTab === 0 ? publicFolders : savedFolders;
    let list = [...base];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((f) => {
        const hay = `${f.topic} ${f.description ?? ""} ${f.subject} ${f.courseNumber ?? ""} ${(f.tags ?? []).join(" ")}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (activeSubject !== "All") list = list.filter((f) => f.subject === activeSubject);
    if (activeTag !== "All") {
      if (activeTag === "Private") list = list.filter((f) => f.visibility === "private");
      else if (activeTag === "Public") list = list.filter((f) => f.visibility === "public");
      else list = list.filter((f) => (f.tags ?? []).includes(activeTag));
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [subTab, publicFolders, savedFolders, searchQuery, activeSubject, activeTag]);

  const openFolder = folders.find((f) => f.id === openFolderId) ?? null;
  const subTabCounts = [publicFolders.length, savedFolders.length];

  const handleCreateFolder = (folder: NoteFolder) => {
    setFolders((prev) => [folder, ...prev]);
    setToast("Folder created!");
  };

  const handleSaveFolder = (folderId: string) => {
    setFolders((prev) => prev.map((f) => (f.id === folderId ? { ...f, savedByMe: true } : f)));
    setToast("Folder saved!");
  };

  const handleUnsaveFolder = (folderId: string) => {
    setFolders((prev) => prev.map((f) => (f.id === folderId ? { ...f, savedByMe: false } : f)));
    setToast("Removed from saved folders.");
  };

  const folderItemCount = React.useCallback(
    (folderId: string) => items.filter((i) => i.folderId === folderId).length,
    [items]
  );

  const chipSx = (active: boolean) => ({
    fontWeight: 700, fontSize: "0.68rem", borderRadius: 999, height: 24, cursor: "pointer",
    bgcolor: active ? "#A80532" : "#fff",
    color: active ? "#fff" : "#666",
    border: active ? "none" : "1.5px solid #e8eaed",
    "&:hover": { bgcolor: active ? "#8e0229" : "#f5f5f7" },
    transition: "all 0.14s",
    boxShadow: active ? "0 2px 8px rgba(168,5,50,0.22)" : "none",
  });

  return (
    <Box>
      {/* Header */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5} sx={{ mb: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: "#111", letterSpacing: "-0.01em" }}>
            Note Share
          </Typography>
          <Typography sx={{ color: "#999", fontSize: "0.80rem", mt: 0.2 }}>
            {publicFolders.length} public folders · {savedFolders.length} saved
          </Typography>
        </Box>
      </Stack>

      <SubTabBar active={subTab} counts={subTabCounts} onChange={setSubTab} onCreateFolder={() => setCreateFolderOpen(true)} />

      {/* Search + filter bar */}
      <Paper elevation={0} sx={{ borderRadius: 3, p: 1.75, mb: 2.5, bgcolor: "#fff", border: "1.5px solid #f0f0f3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <TextField
          fullWidth size="small"
          placeholder="Search notes, courses, topics, authors…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 15, color: "#b0b8c4" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "#f8f9fb", borderRadius: 2,
              "& fieldset": { borderColor: "#e8eaed" },
              "&:hover fieldset": { borderColor: "#A80532" },
              "&.Mui-focused fieldset": { borderColor: "#A80532" },
            },
          }}
        />

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.65, mt: 1.25 }}>
          {SUBJECT_CHIPS.map((s) => (
            <Chip key={s} label={s} size="small" clickable onClick={() => setActiveSubject(s)} sx={chipSx(activeSubject === s)} />
          ))}
          {subTab === 1 && (
            <Chip label="Private" size="small" clickable onClick={() => setActiveTag(activeTag === "Private" ? "All" : "Private")} sx={chipSx(activeTag === "Private")} />
          )}
          {TOPIC_TAGS.map((t) => (
            <Chip key={t} label={t} size="small" clickable onClick={() => setActiveTag(activeTag === t ? "All" : t)} sx={chipSx(activeTag === t)} />
          ))}
        </Box>
      </Paper>

      {displayedFolders.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: "#fff", border: "1.5px solid #f0f0f3", textAlign: "center" }}>
          <FolderRoundedIcon sx={{ fontSize: 40, color: "#e0e0e0", mb: 1.5 }} />
          <Typography sx={{ color: "#333", fontWeight: 800, fontSize: "1rem" }}>No folders found.</Typography>
          <Typography sx={{ color: "#999", mt: 0.5, fontSize: "0.88rem" }}>Try a different search or create a folder.</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateFolderOpen(true)}
            sx={{ mt: 2, bgcolor: "#A80532", "&:hover": { bgcolor: "#8e0229" }, fontWeight: 800, borderRadius: 999, boxShadow: "0 2px 10px rgba(168,5,50,0.28)" }}>
            Upload Folder
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {displayedFolders.map((f) => (
            <FolderCard
              key={f.id}
              folder={f}
              itemCount={folderItemCount(f.id)}
              isSaved={!!f.savedByMe}
              onSave={() => handleSaveFolder(f.id)}
              onUnsave={() => handleUnsaveFolder(f.id)}
              onOpen={() => setOpenFolderId(f.id)}
            />
          ))}
        </Box>
      )}

      <FolderCreateModal open={createFolderOpen} onClose={() => setCreateFolderOpen(false)} onCreate={handleCreateFolder} />

      {openFolder && (
        <NoteView
          open
          folder={openFolder}
          items={items}
          comments={comments}
          onClose={() => setOpenFolderId(null)}
          onUploadItem={(newItem) => { setItems((prev) => [newItem, ...prev]); setToast("Upload added!"); }}
          onAddComment={(newComment) => { setComments((prev) => [newComment, ...prev]); setToast("Comment posted!"); }}
        />
      )}

      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" sx={{ borderRadius: 3, fontWeight: 700 }}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
}
