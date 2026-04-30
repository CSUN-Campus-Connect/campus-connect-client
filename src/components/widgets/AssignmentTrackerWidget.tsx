"use client";

import * as React from "react";
import {
  Card, CardContent, Box, Stack, Typography, IconButton, Button,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  ToggleButton, ToggleButtonGroup, Tooltip, LinearProgress, Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import BarChartIcon from "@mui/icons-material/BarChart";
import { WidgetHeader } from "./WidgetHeader";

interface CourseEntry {
  id: string;
  name: string;
  done: number;
  left: number;
  color: string;
}

type ChartType = "doughnut" | "bar" | "progress";

const STORAGE_KEY = "canvas-assignments-widget-v1";
const CHART_STORAGE_KEY = "canvas-assignments-chart-type-v1";

const PRESET_COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
];

const load = (): CourseEntry[] => {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
};
const persist = (courses: CourseEntry[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(courses)); } catch {}
};
const loadChart = (): ChartType => {
  try { return (localStorage.getItem(CHART_STORAGE_KEY) as ChartType) ?? "progress"; } catch { return "progress"; }
};

const MiniDonut: React.FC<{ done: number; left: number; color: string; size?: number }> = ({ done, left, color, size = 60 }) => {
  const total = done + left || 1;
  const pct = done / total;
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4}
        strokeLinecap="round" style={{ transition: "stroke-dasharray 0.4s ease" }} />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
};

const DoughnutView: React.FC<{ courses: CourseEntry[] }> = ({ courses }) => (
  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
    {courses.map(c => {
      const total = c.done + c.left;
      return (
        <Box key={c.id} sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 80 }}>
          <MiniDonut done={c.done} left={c.left} color={c.color} size={72} />
          <Typography fontWeight={700} fontSize={12} mt={0.5} textAlign="center">{c.name}</Typography>
          <Typography variant="body2" color="text.secondary" fontSize={11}>{c.done}/{total}</Typography>
        </Box>
      );
    })}
  </Box>
);

const BarView: React.FC<{ courses: CourseEntry[] }> = ({ courses }) => {
  const max = Math.max(...courses.map(c => c.done + c.left), 1);
  return (
    <Stack spacing={1}>
      {courses.map(c => {
        const total = c.done + c.left || 1;
        return (
          <Box key={c.id}>
            <Typography fontSize={11} fontWeight={600} mb={0.25}>{c.name}</Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ flex: 1, height: 20, bgcolor: "#e5e7eb", borderRadius: 1, overflow: "hidden", position: "relative" }}>
                <Box sx={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: `${(c.done / max) * 100}%`, bgcolor: c.color, borderRadius: 1,
                  transition: "width 0.4s ease",
                }} />
                <Box sx={{
                  position: "absolute", left: `${(c.done / max) * 100}%`, top: 0, bottom: 0,
                  width: `${(c.left / max) * 100}%`, bgcolor: "#d1d5db", borderRadius: "0 4px 4px 0",
                  transition: "left 0.4s ease, width 0.4s ease",
                }} />
              </Box>
              <Typography fontSize={10} color="text.secondary" sx={{ minWidth: 36, textAlign: "right" }}>
                {c.done}/{total}
              </Typography>
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
};

const ProgressView: React.FC<{ courses: CourseEntry[] }> = ({ courses }) => (
  <Stack spacing={1.5}>
    {courses.map(c => {
      const total = c.done + c.left;
      const pct = total > 0 ? Math.round((c.done / total) * 100) : 0;
      return (
        <Box key={c.id}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography fontSize={13} fontWeight={600}>{c.name}</Typography>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Typography fontSize={11} color="text.secondary">{c.done}/{total}</Typography>
              <Chip size="small" label={`${pct}%`}
                sx={{ bgcolor: c.color, color: "#fff", fontSize: 10, height: 20, fontWeight: 700 }} />
            </Stack>
          </Stack>
          <LinearProgress variant="determinate" value={pct}
            sx={{ height: 8, borderRadius: 4, bgcolor: "#e5e7eb", "& .MuiLinearProgress-bar": { bgcolor: c.color, borderRadius: 4 } }} />
        </Box>
      );
    })}
  </Stack>
);

const emptyForm = () => ({ name: "", done: 0, left: 0, color: PRESET_COLORS[0] });

export const AssignmentTrackerWidget: React.FC<{ onDelete?: () => void }> = ({ onDelete }) => {
  const [courses, setCourses] = React.useState<CourseEntry[]>(load);
  const [chartType, setChartType] = React.useState<ChartType>(loadChart);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState(emptyForm());

  const persistCourses = (updated: CourseEntry[]) => { setCourses(updated); persist(updated); };

  const handleChartChange = (_: any, val: ChartType) => {
    if (!val) return;
    setChartType(val);
    try { localStorage.setItem(CHART_STORAGE_KEY, val); } catch {}
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm(), color: PRESET_COLORS[courses.length % PRESET_COLORS.length] });
    setDialogOpen(true);
  };

  const openEdit = (c: CourseEntry) => {
    setEditingId(c.id);
    setForm({ name: c.name, done: c.done, left: c.left, color: c.color });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      persistCourses(courses.map(c => c.id === editingId ? { ...form, id: editingId } : c));
    } else {
      persistCourses([...courses, { ...form, id: `course-${Date.now()}` }]);
    }
    setDialogOpen(false);
  };

  const hasData = courses.length > 0;

  return (
    <>
      <Card className="widget-card" sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <WidgetHeader title="Assignment Tracker" onDelete={onDelete}
          action={
            <Tooltip title="Add course">
              <IconButton size="small" onClick={openAdd} sx={{ mr: 0.5 }}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          }
        />
        <CardContent sx={{ flex: 1, overflow: "auto", p: 1.5, "&:last-child": { pb: 1.5 }, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {hasData && (
            <Stack direction="row" justifyContent="center">
              <ToggleButtonGroup value={chartType} exclusive onChange={handleChartChange} size="small"
                sx={{ "& .MuiToggleButton-root": { px: 1.5, py: 0.5 } }}>
                <ToggleButton value="progress" aria-label="Progress">
                  <Tooltip title="Progress bars"><Box sx={{ fontSize: 11, fontWeight: 700, px: 0.25 }}>%</Box></Tooltip>
                </ToggleButton>
                <ToggleButton value="doughnut" aria-label="Donut">
                  <Tooltip title="Donut"><DonutLargeIcon sx={{ fontSize: 16 }} /></Tooltip>
                </ToggleButton>
                <ToggleButton value="bar" aria-label="Bar">
                  <Tooltip title="Bar chart"><BarChartIcon sx={{ fontSize: 16 }} /></Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          )}

          {hasData ? (
            <>
              {chartType === "progress" && <ProgressView courses={courses} />}
              {chartType === "doughnut" && <DoughnutView courses={courses} />}
              {chartType === "bar" && <BarView courses={courses} />}

              <Box sx={{ borderTop: "1px solid #eee", pt: 1 }}>
                <Stack spacing={0.75}>
                  {courses.map(c => (
                    <Stack key={c.id} direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: c.color, flexShrink: 0 }} />
                        <Typography fontSize={12} fontWeight={600}>{c.name}</Typography>
                        <Typography fontSize={11} color="text.secondary">{c.done}/{c.done + c.left}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.25}>
                        <IconButton size="small" onClick={() => openEdit(c)} sx={{ p: 0.25 }}>
                          <EditIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => persistCourses(courses.filter(x => x.id !== c.id))} sx={{ p: 0.25, color: "error.main" }}>
                          <DeleteIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </>
          ) : (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, color: "text.secondary", minHeight: 120 }}>
              <Typography variant="body2" textAlign="center" sx={{ opacity: 0.6 }}>No courses yet. Add your classes!</Typography>
              <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={openAdd}>Add Course</Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editingId ? "Edit Course" : "Add Course"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Course Name" size="small" fullWidth value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. CS 201" required />
            <Stack direction="row" spacing={2}>
              <TextField label="Completed" size="small" type="number" fullWidth inputProps={{ min: 0 }}
                value={form.done} onChange={e => setForm(f => ({ ...f, done: Math.max(0, parseInt(e.target.value) || 0) }))} />
              <TextField label="Remaining" size="small" type="number" fullWidth inputProps={{ min: 0 }}
                value={form.left} onChange={e => setForm(f => ({ ...f, left: Math.max(0, parseInt(e.target.value) || 0) }))} />
            </Stack>
            <Box>
              <Typography variant="caption" color="text.secondary" mb={0.5} display="block">Color</Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" gap={0.75}>
                {PRESET_COLORS.map(col => (
                  <Box key={col} onClick={() => setForm(f => ({ ...f, color: col }))}
                    sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: col, cursor: "pointer",
                      border: form.color === col ? "2px solid #111" : "2px solid transparent",
                      outline: form.color === col ? "2px solid #fff" : "none", outlineOffset: "-3px", transition: "border 0.1s" }} />
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name.trim()}>
            {editingId ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export { AssignmentTrackerWidget as CanvasAssignmentsWidget };
