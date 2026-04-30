"use client";

import * as React from "react";
import {
  Card, CardContent, Chip, Stack, Typography, IconButton, Button,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel, Tooltip, Box, Collapse,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { WidgetHeader } from "./WidgetHeader";

interface ClassEntry {
  id: string;
  kind: "In-Person" | "Online" | "Hybrid";
  course: string;
  time: string;
  location: string;
  zoomLink?: string;
  notes?: string;
}

const STORAGE_KEY = "class-helper-widget-v1";

const loadClasses = (): ClassEntry[] => {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
};
const saveClasses = (classes: ClassEntry[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(classes)); } catch {}
};

const KIND_COLORS: Record<ClassEntry["kind"], "success" | "primary" | "warning"> = {
  "In-Person": "success", Online: "primary", Hybrid: "warning",
};
const KIND_BG: Record<ClassEntry["kind"], string> = {
  "In-Person": "rgba(34,197,94,0.08)", Online: "rgba(99,102,241,0.08)", Hybrid: "rgba(245,158,11,0.08)",
};
const emptyForm = (): Omit<ClassEntry, "id"> => ({ kind: "In-Person", course: "", time: "", location: "", zoomLink: "", notes: "" });

const extractZoomMeetingId = (url: string): string | null => {
  const match = url.match(/zoom\.us\/j\/(\d+)/);
  return match ? match[1] : null;
};

const ZoomEmbed: React.FC<{ url: string }> = ({ url }) => {
  const [expanded, setExpanded] = React.useState(false);
  const meetingId = extractZoomMeetingId(url);

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Button size="small" variant="text" startIcon={<LinkIcon sx={{ fontSize: 13 }} />}
          href={url} target="_blank" rel="noopener noreferrer"
          sx={{ px: 0.5, py: 0, fontSize: 11, textTransform: "none" }}>
          Join Zoom
        </Button>
        {meetingId && (
          <Tooltip title={expanded ? "Hide embed" : "Embed meeting page"}>
            <IconButton size="small" onClick={() => setExpanded(v => !v)} sx={{ p: 0.25 }}>
              <VideoCallIcon sx={{ fontSize: 14 }} />
              {expanded ? <ExpandLessIcon sx={{ fontSize: 11 }} /> : <ExpandMoreIcon sx={{ fontSize: 11 }} />}
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      {meetingId && (
        <Collapse in={expanded}>
          <Box sx={{ mt: 0.5, borderRadius: 1.5, overflow: "hidden", border: "1px solid #e0e0e0", bgcolor: "#fafafa" }}>
            <Box sx={{ p: 1, bgcolor: "#2D8CFF", display: "flex", alignItems: "center", gap: 1 }}>
              <VideoCallIcon sx={{ color: "#fff", fontSize: 16 }} />
              <Typography sx={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>Zoom Meeting</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 10, ml: "auto" }}>ID: {meetingId}</Typography>
            </Box>
            <Box sx={{ p: 1 }}>
              <Typography sx={{ fontSize: 10, color: "#666", mb: 1 }}>
                Zoom meetings require the desktop app. Click the button below to open or join via browser.
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="contained"
                  href={`zoommtg://zoom.us/join?confno=${meetingId}`}
                  sx={{ fontSize: 10, py: 0.5, px: 1.5, bgcolor: "#2D8CFF", "&:hover": { bgcolor: "#1a7ae0" }, textTransform: "none" }}>
                  Open in App
                </Button>
                <Button size="small" variant="outlined"
                  href={url} target="_blank" rel="noopener noreferrer"
                  sx={{ fontSize: 10, py: 0.5, px: 1.5, borderColor: "#2D8CFF", color: "#2D8CFF", textTransform: "none" }}>
                  Browser
                </Button>
              </Stack>
            </Box>
          </Box>
        </Collapse>
      )}
      {!meetingId && expanded === false && null}
    </Box>
  );
};

export const ClassHelperWidget: React.FC<{ onDelete?: () => void }> = ({ onDelete }) => {
  const [classes, setClasses] = React.useState<ClassEntry[]>(loadClasses);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState(emptyForm());

  const persist = (updated: ClassEntry[]) => { setClasses(updated); saveClasses(updated); };

  const openAdd = () => { setEditingId(null); setForm(emptyForm()); setDialogOpen(true); };
  const openEdit = (cls: ClassEntry) => {
    setEditingId(cls.id);
    setForm({ kind: cls.kind, course: cls.course, time: cls.time, location: cls.location, zoomLink: cls.zoomLink ?? "", notes: cls.notes ?? "" });
    setDialogOpen(true);
  };
  const handleSave = () => {
    if (!form.course.trim()) return;
    if (editingId) {
      persist(classes.map(c => c.id === editingId ? { ...form, id: editingId } : c));
    } else {
      persist([...classes, { ...form, id: `cls-${Date.now()}` }]);
    }
    setDialogOpen(false);
  };

  return (
    <>
      <Card className="widget-card" sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <WidgetHeader title="Class Helper" onDelete={onDelete}
          action={
            <Tooltip title="Add class">
              <IconButton size="small" onClick={openAdd} sx={{ mr: 0.5 }}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          }
        />
        <CardContent sx={{ flex: 1, overflow: "auto", p: 1.5, "&:last-child": { pb: 1.5 } }}>
          {classes.length === 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 120, gap: 1, color: "text.secondary" }}>
              <Typography variant="body2" textAlign="center" sx={{ opacity: 0.6 }}>No classes yet. Add your schedule!</Typography>
              <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={openAdd}>Add Class</Button>
            </Box>
          ) : (
            <Stack spacing={1.25}>
              {classes.map(cl => (
                <Stack key={cl.id} spacing={0.5}
                  sx={{ p: 1.25, border: "1px solid #eee", borderRadius: 2, bgcolor: KIND_BG[cl.kind], position: "relative" }}>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ flex: 1 }}>
                      <Chip size="small" label={cl.kind} color={KIND_COLORS[cl.kind]} variant="outlined" />
                      <Typography fontWeight={700} fontSize={14} sx={{ wordBreak: "break-word" }}>{cl.course}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.25} flexShrink={0}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(cl)} sx={{ p: 0.25 }}>
                          <EditIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove">
                        <IconButton size="small" onClick={() => persist(classes.filter(c => c.id !== cl.id))} sx={{ p: 0.25, color: "error.main" }}>
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" fontSize={12}>
                    {cl.time}{cl.location ? ` • ${cl.location}` : ""}
                  </Typography>
                  {cl.kind !== "In-Person" && cl.zoomLink && <ZoomEmbed url={cl.zoomLink} />}
                  {cl.notes && (
                    <Typography variant="body2"
                      sx={{ fontSize: 11, color: "text.secondary", fontStyle: "italic", borderLeft: "2px solid #ddd", pl: 1, mt: 0.25 }}>
                      {cl.notes}
                    </Typography>
                  )}
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editingId ? "Edit Class" : "Add Class"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select value={form.kind} label="Type"
                onChange={e => setForm(f => ({ ...f, kind: e.target.value as ClassEntry["kind"] }))}>
                <MenuItem value="In-Person">In-Person</MenuItem>
                <MenuItem value="Online">Online</MenuItem>
                <MenuItem value="Hybrid">Hybrid</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Course Name" size="small" fullWidth value={form.course}
              onChange={e => setForm(f => ({ ...f, course: e.target.value }))} placeholder="e.g. CS 201 — Data Structures" required />
            <TextField label="Time" size="small" fullWidth value={form.time}
              onChange={e => setForm(f => ({ ...f, time: e.target.value }))} placeholder="e.g. 9:30 – 10:45 AM" />
            <TextField label="Location / Room" size="small" fullWidth value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Eng Bldg 210" />
            {form.kind !== "In-Person" && (
              <TextField label="Zoom Link" size="small" fullWidth value={form.zoomLink}
                onChange={e => setForm(f => ({ ...f, zoomLink: e.target.value }))}
                placeholder="https://zoom.us/j/..." type="url"
                helperText="Paste full Zoom link — embed button will appear on card" />
            )}
            <TextField label="Notes" size="small" fullWidth multiline minRows={2} value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="e.g. Guest speaker next week, midterm review" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.course.trim()}>
            {editingId ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
