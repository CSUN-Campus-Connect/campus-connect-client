"use client";

import * as React from "react";
import { Stack, TextField, Button, Box, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import type { Milestone } from "./Milestones";

const RED = "#A80532";
const solid = { bgcolor: RED, color: "#fff", "&:hover": { bgcolor: "#810326" } };

/*Weight (Body weight)*/
export function WeightEntry({
  m,
  onLog,
}: {
  m: Milestone;
  onLog: (w: number) => void;
}) {
  const [w, setW] = React.useState("");
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
      <TextField
        label="Check-in weight"
        value={w}
        onChange={(e) => setW(e.target.value)}
        sx={{ minWidth: 180, bgcolor: "#fff", borderRadius: 1 }}
      />
      <Button
        variant="contained"
        sx={solid}
        onClick={() => {
          const n = Number(w);
          if (!Number.isFinite(n)) return; //
          onLog(n);
          setW("");
        }}
      >
        Check-in
      </Button>
    </Stack>
  );
}

/*Strength (chart + entry) */
export function StrengthEntry({
  m,
  onLog,
  onReset,
  onDeleteLast,
}: {
  m: Milestone;
  onLog: (weight: number, reps: number) => void;
  onReset: () => void; // resets all entries backend
  onDeleteLast: () => void;
}) {
  const [weight, setWeight] = React.useState("");
  const [reps, setReps] = React.useState("");

  const targetW = (m.meta?.targetWeight as number) ?? 0;
  const targetR = (m.meta?.targetReps as number) ?? 0;

  const pts = (m.logs as { weight: number; reps: number }[]).map((p) => ({
    x: p.reps,
    y: p.weight,
  }));

  const W = 320;
  const H = 170;
  const pad = 28;
  const maxX = Math.max(targetR || 5, ...pts.map((p) => p.x), 5);
  const maxY = Math.max(targetW || 135, ...pts.map((p) => p.y), 135);
  const toX = (x: number) => pad + (x / maxX) * (W - pad * 2);
  const toY = (y: number) => H - pad - (y / maxY) * (H - pad * 2);

  return (
    <Stack spacing={1.25}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <TextField
          label="Weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          sx={{ minWidth: 160, bgcolor: "#fff", borderRadius: 1 }}
        />
        <TextField
          label="Reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          sx={{ minWidth: 140, bgcolor: "#fff", borderRadius: 1 }}
        />
        <Button
          variant="contained"
          sx={solid}
          onClick={() => {
            const w = Number(weight);
            const r = Number(reps);
            if (!Number.isFinite(w) || !Number.isFinite(r)) return; //Backend: log strength entry
            onLog(w, r);
            setWeight("");
            setReps("");
          }}
        >
          Entry
        </Button>
        <IconButton aria-label="Reset all strength entries" onClick={onReset} sx={{ color: "#fff" }}>
          <RestartAltIcon aria-hidden="true" />
        </IconButton>
        <IconButton
          aria-label="Delete last strength entry"
          onClick={onDeleteLast}
          sx={{ color: "#fff" }}
        >
          <DeleteIcon aria-hidden="true" />
        </IconButton>
      </Stack>

      {/* Chart */}
      <Box
        sx={{
          bgcolor: "rgba(255,255,255,0.10)",
          border: "2px solid rgba(255,255,255,0.6)",
          borderRadius: 2,
          width: "100%",
          maxWidth: W,
          height: H,
          overflow: "hidden",
        }}
      >
        <svg role="img" aria-label={`Strength progress chart: target ${targetW} weight × ${targetR} reps, ${pts.length} log entries`} viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="white" opacity="0.6" />
          <line x1={pad} y1={H - pad} x2={pad} y2={pad} stroke="white" opacity="0.6" />
          <text x={W - pad} y={H - 6} fill="white" fontSize="10">reps →</text>
          <text x={4} y={12} fill="white" fontSize="10">↑ weight</text>
          {targetW > 0 && targetR > 0 && (
            <>
              <line x1={toX(targetR)} y1={pad} x2={toX(targetR)} y2={H - pad} stroke="#FFD54F" strokeDasharray="4 3" />
              <line x1={pad} y1={toY(targetW)} x2={W - pad} y2={toY(targetW)} stroke="#FFD54F" strokeDasharray="4 3" />
            </>
          )}
          {pts.map((p, i) => (
            <circle key={i} cx={toX(p.x)} cy={toY(p.y)} r={3.5} fill="#4CAF50" />
          ))}
        </svg>
      </Box>
    </Stack>
  );
}

/*Distance / Time*/
export function DistanceEntry({
  m,
  onLog,
}: {
  m: Milestone;
  onLog: (distance?: number, time?: number) => void;
}) {
  const [dist, setDist] = React.useState("");
  const [time, setTime] = React.useState("");

  const both = m.mode === "both";
  const isDist = m.mode === "distance" || both;
  const isTime = m.mode === "time" || both;

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
      {isDist && (
        <TextField
          label={`Distance (${m.meta?.unitDistance})`}
          value={dist}
          onChange={(e) => setDist(e.target.value)}
          sx={{ minWidth: 180, bgcolor: "#fff", borderRadius: 1 }}
        />
      )}
      {isTime && (
        <TextField
          label={`Time (${m.meta?.unitTime})`}
          value={time}
          onChange={(e) => setTime(e.target.value)}
          sx={{ minWidth: 160, bgcolor: "#fff", borderRadius: 1 }}
        />
      )}
      <Button
        variant="contained"
        sx={solid}
        onClick={() => { // Backend: log distance/time entry
          const d = dist ? Number(dist) : undefined;
          const t = time ? Number(time) : undefined;
          if ((isDist && !Number.isFinite(d as number)) || (isTime && !Number.isFinite(t as number))) {
            return;
          }
          onLog(d, t);
          setDist("");
          setTime("");
        }}
      >
        Entry
      </Button>
    </Stack>
  );
}

/* ------------- Reps ------------- */
export function RepsEntry({
  m,
  onLog,
}: {
  m: Milestone;
  onLog: (reps: number) => void;
}) {
  const [reps, setReps] = React.useState("");
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
      <TextField
        label={`Reps (${m.meta?.workoutType})`}
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        sx={{ minWidth: 180, bgcolor: "#fff", borderRadius: 1 }}
      />
      <Button
        variant="contained"
        sx={solid}
        onClick={() => {
          const r = Number(reps);
          if (!Number.isFinite(r)) return;
          onLog(r);
          setReps("");
        }}
      >
        Entry
      </Button>
    </Stack>
  );
}
