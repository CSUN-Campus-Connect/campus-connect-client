"use client";

import * as React from "react";
import { Card, CardContent, Typography, Stack, Select, MenuItem, TextField, Button, LinearProgress, Box, IconButton, Divider, Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { WeightEntry, StrengthEntry, DistanceEntry, RepsEntry,
} from "./MilestoneWidgets";

export type Cadence = "weekly" | "biweekly" | "monthly" | "semester" | "yearly";
export type DistanceMode = "distance" | "time" | "both";

export type Milestone = {
  id: string;
  category: "strength" | "reps" | "distance" | "weight";
  target: number;
  current: number;
  label: string;
  unit?: string;
  cadence?: Cadence;
  direction?: "up" | "down";
  mode?: DistanceMode;
  meta?: Record<string, any>;
  logs: any[];
};

const RED = "#A80532";
const solid = { bgcolor: RED, color: "#fff", "&:hover": { bgcolor: "#810326" } };

export default function MilestonesPanel({
  milestones,
  setMilestones,
}: {
  milestones: Milestone[];
  setMilestones: React.Dispatch<React.SetStateAction<Milestone[]>>;
}) {
  const [category, setCategory] = React.useState<Milestone["category"]>("weight");

  const [label, setLabel] = React.useState("");
  const [unit, setUnit] = React.useState("lb");

  const [sTargetWeight, setSTargetWeight] = React.useState<string>("");
  const [sTargetReps, setSTargetReps] = React.useState<string>("");

  const [rWorkoutType, setRWorkoutType] = React.useState("");
  const [rTargetReps, setRTargetReps] = React.useState<string>("");

  const [dMode, setDMode] = React.useState<DistanceMode>("distance");
  const [dUnitDistance, setDUnitDistance] = React.useState("mi");
  const [dUnitTime, setDUnitTime] = React.useState("min");
  const [dTargetDistance, setDTargetDistance] = React.useState<string>("");
  const [dTargetTime, setDTargetTime] = React.useState<string>("");

  const [direction, setDirection] = React.useState<"up" | "down">("down");
  const [cadence, setCadence] = React.useState<Cadence>("weekly");
  const [currentWeight, setCurrentWeight] = React.useState<string>("");
  const [goalWeight, setGoalWeight] = React.useState<string>("");

  const resetCreator = () => {
    setLabel("");
    setUnit("lb");
    setSTargetWeight("");
    setSTargetReps("");
    setRWorkoutType("");
    setRTargetReps("");
    setDMode("distance");
    setDUnitDistance("mi");
    setDUnitTime("min");
    setDTargetDistance("");
    setDTargetTime("");
    setDirection("down");
    setCadence("weekly");
    setCurrentWeight("");
    setGoalWeight("");
  };

  const add = () => {
    // BACKEND: A milestone is being CREATED here.
    // Do receives a Milestone object with:
    //   id, category, label, target, unit, cadence, direction,
    //   meta: { ...category-specific fields },
    //   logs: []

    // Backend should persist this under the user's account (personal information not party-related).
    if (category === "weight") {
      if (!currentWeight || !goalWeight) {
        alert("Please enter current and goal weight.");
        return;
      }
      const cw = Number(currentWeight);
      const gw = Number(goalWeight);
      if (!Number.isFinite(cw) || !Number.isFinite(gw)) {
        alert("Weights must be numbers");
        return;
      }
      const distance = Math.max(1, Math.abs(gw - cw));
      const m: Milestone = {
        id: crypto.randomUUID(),
        category: "weight",
        label: "Body weight",
        unit: "lb",
        cadence,
        direction,
        target: distance,
        current: 0,
        meta: { start: cw, goal: gw },
        logs: [],
      };
      setMilestones((prev) => [m, ...prev]);
      resetCreator();
      return;
    }

    if (category === "strength") {
      const tw = Number(sTargetWeight);
      const tr = Number(sTargetReps);
      if (!label || !sTargetWeight || !sTargetReps) {
        alert("Please fill exercise, target weight and reps.");
        return;
      }
      if (!Number.isFinite(tw) || tw <= 0 || !Number.isFinite(tr) || tr <= 0) {
        alert("Targets must be positive numbers");
        return;
      }
      const m: Milestone = {
        id: crypto.randomUUID(),
        category: "strength",
        label,
        unit,
        target: tw * tr,
        current: 0,
        meta: { targetWeight: tw, targetReps: tr },
        logs: [] as { reps: number; weight: number; date: string }[],
      };
      setMilestones((prev) => [m, ...prev]);
      resetCreator();
      return;
    }

    if (category === "reps") {
      const tr = Number(rTargetReps);
      if (!label || !rWorkoutType || !rTargetReps) {
        alert("Please fill exercise, workout type and target reps.");
        return;
      }
      if (!Number.isFinite(tr) || tr <= 0) {
        alert("Target reps must be a positive number");
        return;
      }
      const m: Milestone = {
        id: crypto.randomUUID(),
        category: "reps",
        label,
        target: tr,
        current: 0,
        meta: { workoutType: rWorkoutType },
        logs: [] as { reps: number; date: string }[],
      };
      setMilestones((prev) => [m, ...prev]);
      resetCreator();
      return;
    }

    const td = dTargetDistance ? Number(dTargetDistance) : undefined;
    const tt = dTargetTime ? Number(dTargetTime) : undefined;
    if (!label) {
      alert("Please enter a cardio method.");
      return;
    }
    if (
      (dMode === "distance" && !(td && td > 0)) ||
      (dMode === "time" && !(tt && tt > 0)) ||
      (dMode === "both" && !((td && td > 0) && (tt && tt > 0)))
    ) {
      alert("Please enter valid targets for the selected mode.");
      return;
    }
    const target =
      dMode === "distance" ? td! : dMode === "time" ? tt! : (td! + tt!) / 2;
    const m: Milestone = {
      id: crypto.randomUUID(),
      category: "distance",
      label,
      target,
      current: 0,
      mode: dMode,
      meta: {
        unitDistance: dUnitDistance,
        unitTime: dUnitTime,
        targetDistance: td,
        targetTime: tt,
      },
      logs: [] as { distance?: number; time?: number; date: string }[],
    };
    setMilestones((prev) => [m, ...prev]);
    resetCreator();
  };

  const updateMilestone = (id: string, updater: (m: Milestone) => Milestone) =>
    setMilestones((prev) => prev.map((m) => (m.id === id ? updater(m) : m)));

  const deleteMilestone = (id: string) => // BACKEND: A milestone is being DELETED here. <--
    setMilestones((prev) => prev.filter((m) => m.id !== id));

  const recompute = (m: Milestone): Milestone => {
    if (m.category === "strength") {
      const best = (m.logs as { reps: number; weight: number }[]).reduce(
        (acc, p) => Math.max(acc, p.reps * p.weight),
        0
      );
      return { ...m, current: best };
    }
    if (m.category === "reps") {
      const last = (m.logs as { reps: number }[]).at(-1)?.reps ?? 0;
      return { ...m, current: last };
    }
    if (m.category === "distance") {
      if (m.mode === "distance") {
        const last = (m.logs as { distance?: number }[]).at(-1)?.distance ?? 0;
        return { ...m, current: last ?? 0 };
      }
      if (m.mode === "time") {
        const last = (m.logs as { time?: number }[]).at(-1)?.time ?? 0;
        return { ...m, current: last ?? 0 };
      }
      const last = (m.logs as { distance?: number; time?: number }[]).at(-1);
      const d = last?.distance ?? 0;
      const t = last?.time ?? 0;
      return { ...m, current: (d + t) / 2 };
    }
    const start = m.meta?.start as number;
    const gw = m.meta?.goal as number;
    const latest = (m.logs as { weight: number }[]).at(-1)?.weight ?? start;
    const progress = Math.min(Math.abs(latest - start), Math.abs(gw - start));
    return { ...m, current: progress };
  };

  const fieldSx = { bgcolor: "#fff", borderRadius: 1, width: "100%" };

  const Creator = (
    <Stack spacing={2}>
      <Grid
        container
        columnSpacing={3}
        rowSpacing={2.25}
        sx={{
          px: { xs: 0.5, sm: 1, md: 2 },
        }}
      >
        {/* Always first: category select */}
        <Grid item xs={12} md={6} lg={4}>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as Milestone["category"])}
            fullWidth
            inputProps={{ "aria-label": "Milestone category" }}
            sx={fieldSx}
          >
            <MenuItem value="strength">Strength / PR</MenuItem>
            <MenuItem value="reps">Reps</MenuItem>
            <MenuItem value="distance">Distance / Time</MenuItem>
            <MenuItem value="weight">Body weight</MenuItem>
          </Select>
        </Grid>

        {category === "strength" && (
          <>
            <Grid item xs={12} md={6} lg={4}>
              <TextField
                label="Exercise"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={4} lg={3}>
              <TextField label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} sx={fieldSx} />
            </Grid>
            <Grid item xs={12} md={4} lg={3}>
              <TextField
                label="Target weight"
                value={sTargetWeight}
                onChange={(e) => setSTargetWeight(e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={4} lg={3}>
              <TextField
                label="Target reps"
                value={sTargetReps}
                onChange={(e) => setSTargetReps(e.target.value)}
                sx={fieldSx}
              />
            </Grid>
          </>
        )}

        {category === "reps" && (
          <>
            <Grid item xs={12} md={6} lg={4}>
              <TextField label="Exercise" value={label} onChange={(e) => setLabel(e.target.value)} sx={fieldSx} />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <TextField
                label="Workout type"
                value={rWorkoutType}
                onChange={(e) => setRWorkoutType(e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={4} lg={3}>
              <TextField
                label="Target reps"
                value={rTargetReps}
                onChange={(e) => setRTargetReps(e.target.value)}
                sx={fieldSx}
              />
            </Grid>
          </>
        )}

        {category === "distance" && (
          <>
            <Grid item xs={12} md={6} lg={4}>
              <TextField
                label="Cardio method (run, swim, stairs...)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Select value={dMode} onChange={(e) => setDMode(e.target.value as any)} fullWidth inputProps={{ "aria-label": "Tracking mode" }} sx={fieldSx}>
                <MenuItem value="distance">Track distance</MenuItem>
                <MenuItem value="time">Track time</MenuItem>
                <MenuItem value="both">Track both</MenuItem>
              </Select>
            </Grid>

            {(dMode === "distance" || dMode === "both") && (
              <>
                <Grid item xs={12} md={4} lg={3}>
                  <TextField
                    label="Target distance"
                    value={dTargetDistance}
                    onChange={(e) => setDTargetDistance(e.target.value)}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12} md={4} lg={3}>
                  <TextField
                    label="Distance unit"
                    value={dUnitDistance}
                    onChange={(e) => setDUnitDistance(e.target.value)}
                    sx={fieldSx}
                  />
                </Grid>
              </>
            )}

            {(dMode === "time" || dMode === "both") && (
              <>
                <Grid item xs={12} md={4} lg={3}>
                  <TextField
                    label="Target time"
                    value={dTargetTime}
                    onChange={(e) => setDTargetTime(e.target.value)}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12} md={4} lg={3}>
                  <TextField
                    label="Time unit"
                    value={dUnitTime}
                    onChange={(e) => setDUnitTime(e.target.value)}
                    sx={fieldSx}
                  />
                </Grid>
              </>
            )}
          </>
        )}

        {category === "weight" && (
          <>
            <Grid item xs={12} md={6} lg={4}>
              <TextField
                label="Current weight"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={4} lg={3}>
              <Select value={direction} onChange={(e) => setDirection(e.target.value as any)} fullWidth inputProps={{ "aria-label": "Weight direction" }} sx={fieldSx}>
                <MenuItem value="down">Cut down</MenuItem>
                <MenuItem value="up">Bulk up</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={4} lg={3}>
              <Select value={cadence} onChange={(e) => setCadence(e.target.value as any)} fullWidth inputProps={{ "aria-label": "Check-in cadence" }} sx={fieldSx}>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="biweekly">Bi-weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="semester">Semester</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <TextField
                label="Target weight"
                value={goalWeight}
                onChange={(e) => setGoalWeight(e.target.value)}
                sx={fieldSx}
              />
            </Grid>
          </>
        )}
      </Grid>

      <Button variant="contained" sx={solid} onClick={add} fullWidth>
        Add
      </Button>
    </Stack>
  );

  return (
    <Card
      sx={{
        mt: 2,
        borderRadius: 4,
        bgcolor: "rgba(255,255,255,0.12)",
        border: "3px solid rgba(255,255,255,0.9)",
        backdropFilter: "blur(8px)",
      }}
    >
      <CardContent sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h6" fontWeight={900} sx={{ color: "#fff", mb: 1 }}>
          Milestone Maker
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.9)", mb: 2 }}>
          Create a personal goal. Log progress. Hit 100% to complete it!
        </Typography>

        {Creator}

        <Divider sx={{ my: 2, opacity: 0.4 }} />

        <Stack spacing={1.5}>
          {milestones.map((m) => {
            const pct = Math.min(100, Math.round((m.current / Math.max(1, m.target)) * 100));
            const done = pct >= 100;

            const EntryUI =
              m.category === "weight" ? (
                <WeightEntry
                  m={m}
                  onLog={(w: number) => {
                    updateMilestone(m.id, (old) =>
                      recompute({
                        ...old,
                        logs: [...old.logs, { date: new Date().toISOString(), weight: w }],
                      })
                    );
                  }}
                />
              ) : m.category === "strength" ? (
                <StrengthEntry
                  m={m}
                  onLog={(weight: number, reps: number) => { // BACKEND: A strength log entry is being ADDED here.
                    updateMilestone(m.id, (old) =>
                      recompute({
                        ...old,
                        logs: [
                          ...old.logs,
                          { date: new Date().toISOString(), weight, reps },
                        ],
                      })
                    );
                  }}
                  onReset={() =>
                    updateMilestone(m.id, (old) => ({ ...old, logs: [], current: 0 }))
                  }
                  onDeleteLast={() =>
                    updateMilestone(m.id, (old) =>
                      recompute({ ...old, logs: old.logs.slice(0, -1) })
                    )
                  }
                />
              ) : m.category === "reps" ? (
                <RepsEntry
                  m={m}
                  onLog={(reps: number) => { // BACKEND: A reps log entry is being ADDED here.
                    updateMilestone(m.id, (old) =>
                      recompute({
                        ...old,
                        logs: [...old.logs, { date: new Date().toISOString(), reps }],
                      })
                    );
                  }}
                />
              ) : (
                <DistanceEntry
                  m={m}
                  onLog={(distance?: number, time?: number) => { // BACKEND: A distance/time log entry is being ADDED here.
                    updateMilestone(m.id, (old) =>
                      recompute({
                        ...old,
                        logs: [
                          ...old.logs,
                          { date: new Date().toISOString(), distance, time },
                        ],
                      })
                    );
                  }}
                />
              );

            return (
              <Card
                key={m.id}
                sx={{
                  borderRadius: 3,
                  border: "3px solid rgba(255,255,255,0.6)",
                  bgcolor: "rgba(255,255,255,0.06)",
                }}
              >
                <CardContent sx={{ pt: 1.25, pb: 1.75, px: { xs: 2, sm: 3 } }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography sx={{ color: "#fff", fontWeight: 700, flex: 1 }}>
                      {m.category === "weight" ? `Body weight (${m.cadence})` : m.label}
                    </Typography>
                    <IconButton
                      aria-label={`Delete milestone: ${m.category === "weight" ? "Body weight" : m.label}`}
                      onClick={() => deleteMilestone(m.id)}
                      size="small"
                      sx={{ color: "#fff" }}
                    >
                      <DeleteIcon fontSize="small" aria-hidden="true" />
                    </IconButton>
                  </Stack>

                  <Box sx={{ position: "relative", mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 14,
                        borderRadius: 999,
                        bgcolor: "rgba(255,255,255,0.3)",
                        "& .MuiLinearProgress-bar": {
                          bgcolor: done ? "#FFD54F" : "#4CAF50",
                        },
                      }}
                    />
                    {done && (
                      <Box
                        sx={{ position: "absolute", right: -6, top: -16, fontSize: 22, animation: "twinkle .9s infinite alternate" }}
                      >
                        ⭐
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ mt: 1.25 }}>{EntryUI}</Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </CardContent>

      <style jsx global>{`
        @keyframes twinkle {
          from { transform: rotate(-6deg) scale(0.95); }
          to { transform: rotate(6deg) scale(1.05); }
        }
      `}</style>
    </Card>
  );
}
