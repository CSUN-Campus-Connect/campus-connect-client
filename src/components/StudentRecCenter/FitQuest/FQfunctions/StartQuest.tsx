// FQfunctions/StartQuest.tsx
"use client";

import * as React from "react";
import { Card, CardContent, Typography, Stack, Select, MenuItem, Button } from "@mui/material";
import type { Party } from "./CreateParty";
export type { Party } from "./CreateParty";

export type GoalType = "pr" | "max_reps" | "reps" | "duration" | "distance";

export const GOAL_LABEL: Record<GoalType, string> = {
  pr: "PR",
  max_reps: "Max reps",
  reps: "Reps",
  duration: "Duration",
  distance: "Distance",
};

export type QuestEntry = {
  name: string;
  weight?: number;
  reps?: number;
  repsOnly?: number;
  durationMins?: number;
  distance?: number;
  at: number;
  score: number;
};

export type Quest = {
  partyIndex: number;
  exercise: string;
  goal: GoalType;
  entries: QuestEntry[];
  startedAt: number;
  imageSrc?: string;
};

const RED = "#A80532";
const solid = { bgcolor: RED, color: "#fff", "&:hover": { bgcolor: "#810326" } };

const WEIGHT = [
  "Squats","Bench","Deadlifts","Bicep Curl","Tricep Extensions","Shoulder Press",
  "Lat Pulldown","Pec Flys","Lateral Raise","Leg Extensions","Calve Raises"
];
const BODYWEIGHT = ["Pull Ups","Pushups","Situps","Plank"];
const CARDIO = ["Treadmill","Stair Master","Running","Walking","Lap Records"];
const LIFTS = [...WEIGHT, ...BODYWEIGHT, ...CARDIO];

function kindOf(ex: string): "weight" | "body" | "cardio" {
  if (WEIGHT.includes(ex)) return "weight";
  if (BODYWEIGHT.includes(ex)) return "body";
  return "cardio";
}

export function scoreOf(q: Quest, e: QuestEntry) {
  switch (q.goal) {
    case "pr": return (e.weight || 0) * (e.reps || 0);
    case "max_reps": return e.reps || 0;
    case "reps": return e.repsOnly || 0;
    case "duration": return e.durationMins || 0;
    case "distance": return e.distance || 0;
    default: return 0;
  }
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function StartQuest({
  parties,
  quests,
  setQuests,
}: {
  parties: Party[];
  quests: Quest[];
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
}) {
  const [partyIdx, setPartyIdx] = React.useState(0);
  const [exercise, setExercise] = React.useState(LIFTS[0]);

  const type = kindOf(exercise);
  const goalChoices =
    type === "weight"
      ? (["pr","max_reps"] as GoalType[])
      : type === "body"
      ? (["reps"] as GoalType[])
      : (["duration","distance"] as GoalType[]);
  const [goal, setGoal] = React.useState<GoalType>(goalChoices[0]);

  React.useEffect(() => {
    if (!goalChoices.includes(goal)) setGoal(goalChoices[0]);
  }, [exercise]);

  const start = () => {
    if (!parties.length) return;
    const imageSrc = `/images/${slug(exercise)}.jpg`;
    setQuests(prev => [
      { partyIndex: partyIdx, exercise, goal, entries: [], startedAt: Date.now(), imageSrc },
      ...prev,
    ]);
  };

  return (
    <Card
      sx={{
        borderRadius: 4,
        bgcolor: "rgba(255,255,255,0.12)",
        border: "3px solid rgba(255,255,255,0.9)",
        backdropFilter: "blur(8px)",
        minHeight: 170,
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={900} sx={{ color: "#fff", mb: 1 }}>
          Start a Fit Quest
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.9)", mb: 2 }}>
          Assign a quest to a party. Results and rankings show from the party card.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: "stretch" }}>
          <Select value={partyIdx} onChange={e => setPartyIdx(Number(e.target.value))} inputProps={{ "aria-label": "Select party" }} sx={{ flex: 1 }}>
            {parties.map((p, i) => <MenuItem key={i} value={i}>{p.name}</MenuItem>)}
          </Select>

          <Select value={exercise} onChange={e => setExercise(String(e.target.value))} inputProps={{ "aria-label": "Select exercise" }} sx={{ flex: 2 }}>
            {LIFTS.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
          </Select>

          <Select value={goal} onChange={e => setGoal(e.target.value as GoalType)} inputProps={{ "aria-label": "Select goal type" }} sx={{ flex: 1.5 }}>
            {goalChoices.map(g => <MenuItem key={g} value={g}>{GOAL_LABEL[g]}</MenuItem>)}
          </Select>

          <Button variant="contained" sx={solid} onClick={start}>Start</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
