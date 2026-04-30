"use client";

import * as React from "react";
import {
  Card, CardContent, Box, Stack, Typography, LinearProgress,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from "@mui/material";
import { WidgetHeader } from "./WidgetHeader";

const STORAGE_KEY = "torodachi-v1";

interface TorodachiState {
  hunger: number;
  energy: number;
  happiness: number;
  study: number;
  age: number;
  lastSaved: number;
  mood: "happy" | "sleepy" | "hungry" | "bored" | "charging" | "studying";
  xp: number;
}

const defaultState = (): TorodachiState => ({
  hunger: 80, energy: 80, happiness: 80, study: 0,
  age: 0, lastSaved: Date.now(), mood: "happy", xp: 0,
});

const load = (): TorodachiState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const s = JSON.parse(raw) as TorodachiState;
    const elapsed = (Date.now() - s.lastSaved) / 1000 / 60;
    s.hunger = Math.max(0, s.hunger - elapsed * 0.8);
    s.energy = Math.max(0, s.energy - elapsed * 0.5);
    s.happiness = Math.max(0, s.happiness - elapsed * 0.4);
    s.lastSaved = Date.now();
    return s;
  } catch { return defaultState(); }
};

const save = (s: TorodachiState) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, lastSaved: Date.now() })); } catch {}
};

const clamp = (v: number) => Math.min(100, Math.max(0, v));

const StatBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <Box>
    <Stack direction="row" justifyContent="space-between">
      <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#444" }}>{label}</Typography>
      <Typography sx={{ fontSize: 10, color: "#888" }}>{Math.round(value)}%</Typography>
    </Stack>
    <LinearProgress variant="determinate" value={value}
      sx={{ height: 6, borderRadius: 3, bgcolor: "#eee", "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 3 } }} />
  </Box>
);

const BullSVG: React.FC<{ mood: TorodachiState["mood"]; charging: boolean }> = ({ mood, charging }) => {
  const eyeExpr = mood === "sleepy" ? "~" : mood === "happy" ? "^" : mood === "hungry" ? "o" : mood === "studying" ? "-" : "•";
  const mouthExpr = mood === "happy" ? "smile" : mood === "hungry" ? "open" : mood === "charging" ? "rage" : "flat";

  return (
    <svg viewBox="0 0 120 110" width="100%" height="100%" style={{ overflow: "visible" }}>
      {charging && (
        <>
          <motion_line x1="10" y1="55" x2="30" y2="55" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          <motion_line x1="5" y1="48" x2="25" y2="48" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {/* body */}
      <ellipse cx="60" cy="70" rx="30" ry="25" fill="#7c3aed" />
      {/* legs */}
      <rect x="38" y="88" width="10" height="14" rx="4" fill="#5b21b6" />
      <rect x="52" y="90" width="10" height="12" rx="4" fill="#5b21b6" />
      <rect x="66" y="90" width="10" height="12" rx="4" fill="#5b21b6" />
      <rect x="78" y="88" width="10" height="14" rx="4" fill="#5b21b6" />
      {/* tail */}
      <path d="M90 65 Q105 55 100 45" stroke="#5b21b6" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* head */}
      <ellipse cx="60" cy="46" rx="24" ry="20" fill="#7c3aed" />
      {/* horns */}
      <path d="M40 34 Q30 18 36 14" stroke="#4c1d95" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M80 34 Q90 18 84 14" stroke="#4c1d95" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* snout */}
      <ellipse cx="60" cy="57" rx="13" ry="9" fill="#a78bfa" />
      <ellipse cx="55" cy="56" rx="3" ry="2.5" fill="#4c1d95" />
      <ellipse cx="65" cy="56" rx="3" ry="2.5" fill="#4c1d95" />
      {/* eyes */}
      {eyeExpr === "^" && (
        <>
          <path d="M46 40 Q49 37 52 40" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M68 40 Q71 37 74 40" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {eyeExpr === "~" && (
        <>
          <path d="M46 40 Q49 43 52 40" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M68 40 Q71 43 74 40" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {(eyeExpr === "o" || eyeExpr === "•") && (
        <>
          <circle cx="49" cy="40" r={eyeExpr === "o" ? 4 : 3} fill="#fff" />
          <circle cx="71" cy="40" r={eyeExpr === "o" ? 4 : 3} fill="#fff" />
          <circle cx="50" cy="40" r={eyeExpr === "o" ? 2 : 1.5} fill="#1e1b4b" />
          <circle cx="72" cy="40" r={eyeExpr === "o" ? 2 : 1.5} fill="#1e1b4b" />
        </>
      )}
      {eyeExpr === "-" && (
        <>
          <rect x="44" y="38.5" width="10" height="3" rx="1.5" fill="#fff" />
          <rect x="66" y="38.5" width="10" height="3" rx="1.5" fill="#fff" />
        </>
      )}
      {/* mouth */}
      {mouthExpr === "smile" && <path d="M52 64 Q60 70 68 64" stroke="#4c1d95" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {mouthExpr === "flat" && <path d="M53 65 L67 65" stroke="#4c1d95" strokeWidth="2" strokeLinecap="round" />}
      {mouthExpr === "open" && <ellipse cx="60" cy="65" rx="7" ry="4" fill="#4c1d95" />}
      {mouthExpr === "rage" && <path d="M52 68 Q60 62 68 68" stroke="#ef4444" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
      {/* red cape for charging */}
      {charging && (
        <g>
          <path d="M90 50 Q110 60 105 80 Q95 90 88 80 Q92 65 90 50 Z" fill="#ef4444" opacity="0.9" />
          <path d="M90 50 Q112 58 108 82" stroke="#b91c1c" strokeWidth="1.5" fill="none" />
        </g>
      )}
      {/* studying hat */}
      {mood === "studying" && (
        <>
          <rect x="42" y="24" width="36" height="5" rx="2" fill="#1e3a5f" />
          <polygon points="60,10 44,24 76,24" fill="#1e3a5f" />
          <line x1="76" y1="24" x2="82" y2="32" stroke="#fbbf24" strokeWidth="2" />
          <circle cx="83" cy="33" r="3" fill="#fbbf24" />
        </>
      )}
      {/* sleep zzz */}
      {mood === "sleepy" && (
        <>
          <text x="82" y="30" fontSize="10" fill="#a5b4fc" fontWeight="900">z</text>
          <text x="90" y="22" fontSize="13" fill="#a5b4fc" fontWeight="900">z</text>
          <text x="100" y="13" fontSize="16" fill="#a5b4fc" fontWeight="900">Z</text>
        </>
      )}
    </svg>
  );
};

const motion_line: React.FC<React.SVGProps<SVGLineElement>> = (props) => <line {...props} />;

export const TorodachiWidget: React.FC<{ onDelete?: () => void }> = ({ onDelete }) => {
  const [state, setState] = React.useState<TorodachiState>(load);
  const [charging, setCharging] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [msg, setMsg] = React.useState("");

  const update = (updater: (s: TorodachiState) => Partial<TorodachiState>) => {
    setState(prev => {
      const patch = updater(prev);
      const next = { ...prev, ...patch, lastSaved: Date.now() };
      save(next);
      return next;
    });
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const next = {
          ...prev,
          hunger: clamp(prev.hunger - 0.2),
          energy: clamp(prev.energy - 0.15),
          happiness: clamp(prev.happiness - 0.1),
          age: prev.age + 1,
          lastSaved: Date.now(),
        };
        let mood: TorodachiState["mood"] = "happy";
        if (next.energy < 25) mood = "sleepy";
        else if (next.hunger < 25) mood = "hungry";
        else if (next.happiness < 25) mood = "bored";
        next.mood = mood;
        save(next);
        return next;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const feed = () => {
    update(s => ({ hunger: clamp(s.hunger + 25), happiness: clamp(s.happiness + 5), xp: s.xp + 2, mood: "happy" }));
    flash("Torodachi fed! Muy bien!");
  };

  const sleep = () => {
    update(s => ({ energy: clamp(s.energy + 30), mood: "sleepy", xp: s.xp + 2 }));
    flash("Torodachi sleeps...");
  };

  const play = () => {
    setCharging(true);
    update(s => ({ happiness: clamp(s.happiness + 20), energy: clamp(s.energy - 8), mood: "charging", xp: s.xp + 5 }));
    flash("OLE! Torodachi charges the cape!");
    setTimeout(() => {
      setCharging(false);
      update(s => ({ mood: "happy" }));
    }, 2000);
  };

  const study = () => {
    update(s => ({ study: clamp(s.study + 20), happiness: clamp(s.happiness - 5), energy: clamp(s.energy - 10), mood: "studying", xp: s.xp + 10 }));
    flash("Torodachi studies hard! +XP");
    setTimeout(() => update(s => ({ mood: "happy" })), 3000);
  };

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 2500); };

  const overallMood = state.hunger < 20 || state.energy < 20 || state.happiness < 20 ? "!!" :
    state.hunger > 70 && state.energy > 70 && state.happiness > 70 ? ":D" : ":)";

  const level = Math.floor(state.xp / 50) + 1;

  return (
    <>
      <Card className="widget-card" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <WidgetHeader title="Torodachi" onDelete={onDelete} />
        <CardContent sx={{ flex: 1, overflow: "auto", p: 1.5, "&:last-child": { pb: 1.5 } }}>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontSize: 11, color: "#888" }}>Lv.{level} · Age {state.age}s · {state.xp} XP</Typography>
              <Typography sx={{ fontSize: 18 }}>{overallMood}</Typography>
            </Stack>

            <Box sx={{ height: 130, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Box sx={{ width: 130, height: 130 }}>
                <BullSVG mood={state.mood} charging={charging} />
              </Box>
            </Box>

            {msg && (
              <Typography sx={{ fontSize: 11, textAlign: "center", color: "#7c3aed", fontWeight: 700, minHeight: 16 }}>
                {msg}
              </Typography>
            )}

            <Stack spacing={0.75}>
              <StatBar label="Hunger" value={state.hunger} color="#f59e0b" />
              <StatBar label="Energy" value={state.energy} color="#3b82f6" />
              <StatBar label="Happiness" value={state.happiness} color="#ec4899" />
              <StatBar label="Study" value={state.study} color="#10b981" />
            </Stack>

            <Stack direction="row" spacing={1} justifyContent="center">
              <Tooltip title="Feed">
                <IconButton size="small" onClick={feed} sx={{ bgcolor: "#fef3c7", "&:hover": { bgcolor: "#fde68a" }, fontSize: 18 }}>F</IconButton>
              </Tooltip>
              <Tooltip title="Sleep">
                <IconButton size="small" onClick={sleep} sx={{ bgcolor: "#ede9fe", "&:hover": { bgcolor: "#ddd6fe" }, fontSize: 18 }}>S</IconButton>
              </Tooltip>
              <Tooltip title="Play (ole! charge the cape)">
                <IconButton size="small" onClick={play} sx={{ bgcolor: "#fee2e2", "&:hover": { bgcolor: "#fecaca" }, fontSize: 18 }}>P</IconButton>
              </Tooltip>
              <Tooltip title="Study">
                <IconButton size="small" onClick={study} sx={{ bgcolor: "#d1fae5", "&:hover": { bgcolor: "#a7f3d0" }, fontSize: 18 }}>ST</IconButton>
              </Tooltip>
            </Stack>

            <Button size="small" variant="text" sx={{ fontSize: 10, color: "#ccc" }} onClick={() => setDialogOpen(true)}>
              reset
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs">
        <DialogTitle>Reset Torodachi?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Start fresh? All stats and XP will be lost.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => {
            const fresh = defaultState();
            save(fresh);
            setState(fresh);
            setDialogOpen(false);
            flash("New Torodachi born!");
          }}>Reset</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
