"use client";

/**
 * DevTestMode.tsx
 *
 * Drop-in dev panel that replaces the live API with mock data.
 * Activated via the floating "DEV" button that appears in any environment
 * when ?devtest=1 is in the URL, OR when NEXT_PUBLIC_DEV_TEST_MODE=true.
 *
 * This component:
 *  1. Exports <DevTestBanner> — rendered inside UniCartClient when active
 *  2. Exports useDevTestMode() — hook that returns mock sections instead of fetching
 *  3. Exports <DevTestToggle> — floating button to toggle dev mode on/off
 *
 * Usage in UniCartClient:
 *   import { useDevTestMode, DevTestBanner, DevTestToggle } from "./DevTestMode";
 *   const devTest = useDevTestMode();
 *   // pass devTest.active into UniCartClient so it skips apiFetch when true
 */

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import BugReportIcon from "@mui/icons-material/BugReport";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DataObjectIcon from "@mui/icons-material/DataObject";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import type { UniCartClass } from "../shared/constants";
import { MOCK_SECTIONS, MOCK_SEMESTER, filterMockSections } from "./mockData";

function checkDevModeEnabled(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NEXT_PUBLIC_DEV_TEST_MODE === "true") return true;
  return new URLSearchParams(window.location.search).get("devtest") === "1";
}

export interface DevTestModeState {
  active: boolean;
  toggle: () => void;
  getMockSections: (opts: {
    subject?: string;
    search?: string;
    activeTag?: string;
    semester?: string;
  }) => UniCartClass[];
  mockSemester: string;
  totalMockCount: number;
}

export function useDevTestMode(): DevTestModeState {
  const [active, setActive] = React.useState<boolean>(false);
  const didMountRef = React.useRef(false);

  React.useEffect(() => {
    setActive(checkDevModeEnabled());
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const url = new URL(window.location.href);
    if (active) {
      url.searchParams.set("devtest", "1");
    } else {
      url.searchParams.delete("devtest");
    }

    window.history.replaceState(null, "", url.toString());
  }, [active]);

  const toggle = React.useCallback(() => {
    setActive((prev) => !prev);
  }, []);

  const getMockSections = React.useCallback(
    (opts: { subject?: string; search?: string; activeTag?: string; semester?: string }) =>
      filterMockSections(opts),
    []
  );

  return {
    active,
    toggle,
    getMockSections,
    mockSemester: MOCK_SEMESTER,
    totalMockCount: MOCK_SECTIONS.length,
  };
}

interface DevTestBannerProps {
  onExit: () => void;
  sectionCount: number;
}

export function DevTestBanner({ onExit, sectionCount }: DevTestBannerProps) {
  const [expanded, setExpanded] = React.useState(false);

  const statsByDept = React.useMemo(() => {
    const map: Record<string, number> = {};
    MOCK_SECTIONS.forEach((s) => {
      map[s.subject] = (map[s.subject] ?? 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, []);

  const online = MOCK_SECTIONS.filter((s) => s.isOnline).length;
  const full = MOCK_SECTIONS.filter((s) => s.seatsAvailable === 0).length;
  const withLab = MOCK_SECTIONS.filter((s) => s.linkedLab).length;
  const withConf = 2;

  return (
    <Box sx={{ mb: 2 }}>
      <Alert
        severity="warning"
        icon={<BugReportIcon fontSize="inherit" />}
        action={
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Tooltip title={expanded ? "Collapse details" : "Expand mock data info"}>
              <IconButton size="small" onClick={() => setExpanded((p) => !p)} sx={{ color: "#92400e" }}>
                {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Exit dev test mode">
              <IconButton size="small" onClick={onExit} sx={{ color: "#92400e" }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        }
        sx={{
          borderRadius: "12px",
          border: "1.5px solid #fde68a",
          bgcolor: "#fffbeb",
          "& .MuiAlert-message": { width: "100%" },
          fontWeight: 700,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={0.5}>
          <Typography sx={{ fontWeight: 900, fontSize: "0.82rem", color: "#92400e" }}>
            DEV TEST MODE ACTIVE
          </Typography>
          <Chip
            label={`${sectionCount} sections visible`}
            size="small"
            sx={{ height: 18, fontSize: "0.62rem", fontWeight: 900, bgcolor: "#fef3c7", color: "#92400e" }}
          />
          <Chip
            label="No API calls"
            size="small"
            icon={<DataObjectIcon sx={{ fontSize: "10px !important" }} />}
            sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700, bgcolor: "#fef3c7", color: "#92400e" }}
          />
          <Typography sx={{ fontSize: "0.72rem", color: "#a16207" }}>
            All data is synthetic. Add <code>?devtest=1</code> to URL to persist.
          </Typography>
        </Stack>
      </Alert>

      <Collapse in={expanded}>
        <Paper
          elevation={0}
          sx={{
            mt: 1,
            borderRadius: "12px",
            p: 2,
            border: "1.5px solid #fde68a",
            bgcolor: "#fffdf5",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.70rem",
              fontWeight: 900,
              color: "#92400e",
              textTransform: "uppercase",
              letterSpacing: 1,
              mb: 1.25,
            }}
          >
            Mock Dataset Summary
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: 1,
              mb: 1.75,
            }}
          >
            {[
              { label: "Total sections", value: MOCK_SECTIONS.length, color: "#A80532" },
              { label: "Online", value: online, color: "#2563eb" },
              { label: "Fully booked", value: full, color: "#dc2626" },
              { label: "Has lab", value: withLab, color: "#7c3aed" },
              { label: "Conflict pairs", value: withConf, color: "#d97706" },
            ].map((s) => (
              <Box
                key={s.label}
                sx={{
                  textAlign: "center",
                  p: 1,
                  borderRadius: "8px",
                  bgcolor: s.color + "10",
                  border: `1px solid ${s.color}20`,
                }}
              >
                <Typography sx={{ fontSize: "1.2rem", fontWeight: 900, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.58rem",
                    color: s.color + "bb",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 1 }} />

          <Typography
            sx={{
              fontSize: "0.64rem",
              fontWeight: 900,
              color: "rgba(0,0,0,0.42)",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              mb: 0.75,
            }}
          >
            By department
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {statsByDept.map(([dept, count]) => (
              <Chip
                key={dept}
                label={`${dept} · ${count}`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  bgcolor: "rgba(168,5,50,0.07)",
                  color: "#A80532",
                }}
              />
            ))}
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Typography
            sx={{
              fontSize: "0.64rem",
              fontWeight: 900,
              color: "rgba(0,0,0,0.42)",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              mb: 0.75,
            }}
          >
            Things to test
          </Typography>
          <Stack spacing={0.4}>
            {[
              "Search 'COMP' or 'MATH' to see department filter",
              "Add COMP 322 then try adding COMP 282 because they conflict",
              "Add COMP 440 to see a full section with 0 seats",
              "Add PHYS 220A to verify linked lab handling",
              "Switch to Online filter to inspect async sections",
              "Add 5+ courses to see the schedule grid fill up",
              "Clear all then rebuild to verify cart state resets",
            ].map((tip, i) => (
              <Stack key={i} direction="row" spacing={0.75} alignItems="flex-start">
                <CheckCircleOutlineIcon sx={{ fontSize: 12, color: "#16a34a", mt: 0.1, flexShrink: 0 }} />
                <Typography sx={{ fontSize: "0.68rem", color: "rgba(0,0,0,0.55)" }}>{tip}</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Collapse>
    </Box>
  );
}

interface DevTestToggleProps {
  active: boolean;
  onToggle: () => void;
}

export function DevTestToggle({ active, onToggle }: DevTestToggleProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <Tooltip title={active ? "Exit dev test mode" : "Enter dev test mode (mock data)"} placement="left">
      <Button
        variant="contained"
        size="small"
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        startIcon={<BugReportIcon sx={{ fontSize: "13px !important" }} />}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          fontWeight: 900,
          fontSize: "0.72rem",
          borderRadius: "999px",
          px: 1.75,
          py: 0.75,
          textTransform: "none",
          boxShadow: active
            ? "0 4px 20px rgba(234,179,8,0.45)"
            : "0 4px 20px rgba(0,0,0,0.25)",
          bgcolor: active ? "#ca8a04" : "rgba(30,30,30,0.88)",
          backdropFilter: "blur(10px)",
          color: "#fff",
          border: active ? "1.5px solid #fde68a" : "1.5px solid rgba(255,255,255,0.12)",
          transition: "all 0.18s ease",
          "&:hover": {
            bgcolor: active ? "#a16207" : "rgba(50,50,50,0.95)",
            boxShadow: active
              ? "0 6px 24px rgba(234,179,8,0.55)"
              : "0 6px 24px rgba(0,0,0,0.35)",
            transform: "translateY(-1px)",
          },
        }}
      >
        {active ? "Exit Dev Mode" : "DEV TEST"}
      </Button>
    </Tooltip>
  );
}
