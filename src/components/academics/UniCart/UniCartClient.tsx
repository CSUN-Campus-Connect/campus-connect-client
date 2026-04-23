"use client";

import * as React from "react";
import Link from "next/link";
import { Alert, Box, Button, CircularProgress, Container, InputAdornment, Paper, Snackbar,
  Stack, TextField, Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SchoolIcon from "@mui/icons-material/School";
import ClassIcon from "@mui/icons-material/Class";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

import type { UniCartClass } from "../shared/constants";
import { timesConflict } from "../shared/utils";
import { ClassSearchCard } from "./ClassSearchCard";
import { CartItem } from "./CartItem";
import { ScheduleGrid } from "./ScheduleGrid";
import { SearchTagPanel } from "./SearchTagPanel";
import { SEMESTERS } from "./constants";
import { useDevTestMode, DevTestBanner, DevTestToggle } from "./DevTestMode";

// ── API base (same origin by default; override via env var at build time) ─────
const API_BASE =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE
    ? process.env.NEXT_PUBLIC_API_BASE
    : "";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? "Unknown API error");
  return json.data as T;
}


async function loadJsPDF(): Promise<any> {
  if ((window as any).jspdf?.jsPDF) return (window as any).jspdf.jsPDF;
  await new Promise<void>((res, rej) => {
    if (document.querySelector('script[data-jspdf]')) { res(); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.setAttribute("data-jspdf", "1");
    s.onload = () => res();
    s.onerror = () => rej(new Error("Failed to load jsPDF"));
    document.head.appendChild(s);
  });
  return (window as any).jspdf.jsPDF;
}

async function downloadPdf(filename: string, buildFn: (doc: any) => void) {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
  buildFn(doc);
  doc.save(filename);
}




function formatMeetingDays(days?: string[] | null): string {
  return Array.isArray(days) && days.length > 0 ? days.join(" ") : "TBA";
}

function formatMeetingTime(cls: UniCartClass): string {
  if (cls.isOnline) return "Online";
  if (!cls.startTime || !cls.endTime) return "TBA";
  return `${cls.startTime} - ${cls.endTime}`;
}


// ─────────────────────────────────────────────────────────────────────────────
export default function UniCartClient() {
  const [cartClasses, setCartClasses]     = React.useState<UniCartClass[]>([]);
  const [semester, setSemester]           = React.useState("Spring 2026");
  const [searchQuery, setSearchQuery]     = React.useState("");
  const [activeTag, setActiveTag]         = React.useState("All");
  const [conflictError, setConflictError] = React.useState<string | null>(null);
  const [subject, setSubject]             = React.useState("COMP");

  // ── Dev test mode ───────────────────────────────────────────────────────────
  const devTest = useDevTestMode();

  // ── API state ───────────────────────────────────────────────────────────────
  const [sections, setSections]           = React.useState<UniCartClass[]>([]);
  const [loading, setLoading]             = React.useState(false);
  const [apiError, setApiError]           = React.useState<string | null>(null);

  // ── Load sections — either mock or live ─────────────────────────────────────
  const loadSections = React.useCallback(async () => {
    // ── DEV TEST: use mock data, skip fetch ──────────────────────────────────
    if (devTest.active) {
      setLoading(false);
      setApiError(null);
      const mock = devTest.getMockSections({ subject, search: searchQuery, activeTag, semester });
      setSections(mock);
      return;
    }

    // ── PRODUCTION: fetch from backend ───────────────────────────────────────
    setLoading(true);
    setApiError(null);
    try {
      const params = new URLSearchParams({
        subject,
        semester,
        ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
        ...(activeTag === "Online"    ? { isOnline: "true"  } : {}),
        ...(activeTag === "In-Person" ? { isOnline: "false" } : {}),
        limit: "40",
      });

      const raw = await apiFetch<any[]>(`/api/academics/sections?${params}`);

      const mapped: UniCartClass[] = raw.map((s: any) => ({
        id:             String(s.sectionId),
        subject:        s.subject,
        number:         s.number,
        title:          s.title,
        units:          Number(s.units) || 3,
        semester:       s.semester ?? semester,
        professor:      s.professor ?? "TBA",
        section:        String(s.section ?? s.sectionId ?? ""),
        sectionId:      String(s.sectionId ?? s.section ?? ""),
        days:           Array.isArray(s.days) ? s.days : [],
        startTime:      s.startTime ?? null,
        endTime:        s.endTime   ?? null,
        location:       s.location  ?? null,
        isOnline:       Boolean(s.isOnline),
        seats:          Number(s.seats)           || 0,
        seatsAvailable: Number(s.seatsAvailable)  || 0,
        enrolled:       Number(s.enrolled)        || 0,
        waitlistCount:  Number(s.waitlistCount)   || 0,
        prerequisites:  Array.isArray(s.prerequisites) ? s.prerequisites : [],
        tags:           Array.isArray(s.tags) ? s.tags : [],
        courseType:     s.courseType ?? null,
        linkedLab:      s.linkedLab  ?? null,
        description:    s.description ?? null,
      }));

      setSections(mapped);
    } catch (err: any) {
      setApiError(err.message ?? "Failed to load sections");
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, [devTest.active, devTest.getMockSections, subject, semester, searchQuery, activeTag]);

  // Re-run immediately when dev mode, subject, or semester changes
  React.useEffect(() => {
    loadSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devTest.active, subject, semester]);

  // Debounce search / tag changes (instant in dev mode)
  React.useEffect(() => {
    if (devTest.active) { loadSections(); return; }
    const t = setTimeout(loadSections, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeTag]);

  // ── Client-side conflict detection ─────────────────────────────────────────
  const getConflicts = React.useCallback(
    (cls: UniCartClass): string[] => {
      if (cls.isOnline || !cls.startTime) return [];
      return cartClasses
        .filter((c) => c.id !== cls.id && !c.isOnline && c.startTime)
        .filter((c) =>
          timesConflict(
            cls.days ?? [], cls.startTime, cls.endTime,
            c.days   ?? [], c.startTime,   c.endTime
          )
        )
        .map((c) => `${c.subject} ${c.number}`);
    },
    [cartClasses]
  );

  const handleAddToCart = (cls: UniCartClass) => {
    const conflicts = getConflicts(cls);
    if (conflicts.length > 0) {
      setConflictError(
        `Cannot add ${cls.subject} ${cls.number}: time conflict with ${conflicts.join(", ")}`
      );
      return;
    }
    if (cartClasses.some((c) => c.id === cls.id)) return;
    setCartClasses((prev) => [...prev, cls]);
  };

  const handleClearCourses = React.useCallback(() => {
    setCartClasses([]);
    setConflictError(null);
  }, []);

  const totalUnits        = cartClasses.reduce((s, c) => s + c.units, 0);
  const onlineCount       = cartClasses.filter((c) => c.isOnline).length;
  const inPersonCount     = cartClasses.filter((c) => !c.isOnline && c.startTime).length;

  const handleDownloadCartPdf = React.useCallback(async () => {
    if (cartClasses.length === 0) return;
    try {
      await downloadPdf(`unicart-${semester.replace(/\s+/g, "-").toLowerCase()}.pdf`, (doc) => {
        const PW = doc.internal.pageSize.getWidth();
        let y = 40;
        const M = 36;

        doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
        doc.text("UniCart — Course List", M, y); y += 20;

        doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 100);
        doc.text(`Semester: ${semester}   ·   ${cartClasses.length} course(s)   ·   ${totalUnits} units`, M, y); y += 22;

        // Table header
        const cols = ["Course", "Title", "Section", "Units", "Days", "Time", "Location", "Professor"];
        const colW = [60, 160, 46, 36, 46, 80, 90, 100];
        doc.setFillColor(243, 244, 246); doc.setDrawColor(209, 213, 219);
        doc.rect(M, y, PW - M * 2, 18, "FD");
        doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(55, 65, 81);
        let cx = M + 4;
        cols.forEach((c, i) => { doc.text(c, cx, y + 12); cx += colW[i]; });
        y += 18;

        // Rows
        doc.setFont("helvetica", "normal"); doc.setTextColor(30, 30, 30);
        cartClasses.forEach((cls, ri) => {
          if (ri % 2 === 0) { doc.setFillColor(249, 250, 251); doc.rect(M, y, PW - M * 2, 16, "F"); }
          doc.setDrawColor(229, 231, 235); doc.rect(M, y, PW - M * 2, 16, "D");
          const vals = [
            `${cls.subject} ${cls.number}`,
            cls.title ?? "Untitled",
            cls.section || cls.sectionId || "TBA",
            String(cls.units ?? 0),
            formatMeetingDays(cls.days),
            formatMeetingTime(cls),
            cls.location ?? (cls.isOnline ? "Online" : "TBA"),
            cls.professor ?? "TBA",
          ];
          cx = M + 4;
          doc.setFontSize(8);
          vals.forEach((v, i) => {
            const maxW = colW[i] - 6;
            const truncated = doc.getTextWidth(v) > maxW ? v.slice(0, Math.floor(v.length * maxW / doc.getTextWidth(v)) - 1) + "…" : v;
            doc.text(truncated, cx, y + 11);
            cx += colW[i];
          });
          y += 16;
        });
      });
    } catch (err: any) {
      alert("PDF export failed: " + (err?.message ?? "unknown"));
    }
  }, [cartClasses, semester, totalUnits]);

  const handleDownloadSchedulePdf = React.useCallback(async () => {
    if (cartClasses.length === 0) return;
    try {
      await downloadPdf(`unicart-schedule-${semester.replace(/\s+/g, "-").toLowerCase()}.pdf`, (doc) => {
        const PW = doc.internal.pageSize.getWidth();
        const PH = doc.internal.pageSize.getHeight();
        let y = 40;
        const M = 36;

        doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
        doc.text("UniCart — Weekly Schedule", M, y); y += 20;

        doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 100);
        doc.text(`Semester: ${semester}   ·   ${inPersonCount} in-person   ·   ${totalUnits} units`, M, y); y += 24;

        const dayKeys = ["M", "T", "W", "R", "F"];
        const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        const colW = (PW - M * 2) / 5;
        const headerH = 20;

        // Draw day headers
        dayLabels.forEach((label, i) => {
          doc.setFillColor(168, 5, 50); doc.setDrawColor(168, 5, 50);
          doc.rect(M + i * colW, y, colW, headerH, "F");
          doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
          doc.text(label, M + i * colW + colW / 2, y + 13, { align: "center" });
        });
        y += headerH;

        // Draw cells
        const cellPad = 6;
        dayKeys.forEach((dk, i) => {
          const classes = cartClasses
            .filter((c) => !c.isOnline && Array.isArray(c.days) && c.days.includes(dk))
            .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));

          let cy = y + cellPad;
          const x = M + i * colW + cellPad;
          const w = colW - cellPad * 2;

          if (classes.length === 0) {
            doc.setFontSize(8); doc.setFont("helvetica", "italic"); doc.setTextColor(156, 163, 175);
            doc.text("No classes", x, cy + 10);
          } else {
            classes.forEach((cls) => {
              doc.setFillColor(240, 235, 252); doc.setDrawColor(124, 58, 237);
              doc.roundedRect(x, cy, w, 46, 3, 3, "FD");
              doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
              doc.text(`${cls.subject} ${cls.number}`, x + 4, cy + 11);
              doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(75, 85, 99);
              const titleMaxW = w - 8;
              const title = cls.title ?? "Untitled";
              const titleTrunc = doc.getTextWidth(title) > titleMaxW ? title.slice(0, Math.floor(title.length * titleMaxW / doc.getTextWidth(title)) - 1) + "…" : title;
              doc.text(titleTrunc, x + 4, cy + 21);
              doc.text(formatMeetingTime(cls), x + 4, cy + 31);
              doc.text(cls.location ?? "TBA", x + 4, cy + 40);
              cy += 52;
            });
          }

          // Column border
          doc.setDrawColor(209, 213, 219); doc.setFillColor(0, 0, 0, 0);
          doc.rect(M + i * colW, y, colW, PH - y - M, "D");
        });
      });
    } catch (err: any) {
      alert("PDF export failed: " + (err?.message ?? "unknown"));
    }
  }, [cartClasses, inPersonCount, semester, totalUnits]);

  // When exiting dev mode, clear cart to avoid mixing mock + live ids
  const handleExitDevMode = () => {
    devTest.toggle();
    setCartClasses([]);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(160deg, #8b0000 0%, #A80532 35%, #c0182a 60%, #6b0f2a 100%)",
      }}
    >
      {/* ── Back button ── */}
      <Box sx={{ px: { xs: 2, md: 4 }, pt: 2.5 }}>
        <Button
          component={Link}
          href="/academics"
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 14 }} />}
          sx={{
            color: "rgba(255,255,255,0.80)",
            borderColor: "rgba(255,255,255,0.25)",
            fontWeight: 700,
            borderRadius: 999,
            fontSize: "0.78rem",
            px: 1.75, py: 0.4,
            bgcolor: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.15)",
              borderColor: "rgba(255,255,255,0.45)",
            },
          }}
          size="small"
        >
          Academics
        </Button>
      </Box>

      {/* ── Hero Header ── */}
      <Box sx={{ position: "relative", overflow: "hidden", pt: 1.5, pb: 0 }}>
        {[
          { size: 320, top: -60, right: -80, opacity: 0.04 },
          { size: 180, top: 10,  right: 100, opacity: 0.03 },
        ].map((s, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              top: s.top, right: s.right,
              width: s.size, height: s.size,
              borderRadius: "50%",
              background: "rgba(255,255,255,1)",
              opacity: s.opacity,
              pointerEvents: "none",
            }}
          />
        ))}

        <Container sx={{ position: "relative", zIndex: 1 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: "20px",
              p: { xs: 2.5, md: 3 },
              mb: 0,
              bgcolor: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(24px)",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ md: "center" }}
            >
              <Box>
                <Typography
                  sx={{
                    letterSpacing: 4, fontWeight: 900,
                    color: "rgba(255,255,255,0.50)", fontSize: "0.58rem",
                    textTransform: "uppercase", mb: 0.5,
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  CSUN · COURSE ENROLLMENT
                </Typography>
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 0.75 }}>
                  <Box
                    sx={{
                      width: 38, height: 38, borderRadius: "10px",
                      bgcolor: "rgba(255,255,255,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "1px solid rgba(255,255,255,0.20)",
                    }}
                  >
                    <ShoppingCartIcon sx={{ color: "#fff", fontSize: 20 }} />
                  </Box>
                  <Typography
                    fontWeight={900}
                    sx={{
                      fontSize: { xs: "1.5rem", md: "1.9rem" },
                      color: "#fff", letterSpacing: -0.5, lineHeight: 1,
                    }}
                  >
                    UniCart
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.60)",
                    fontSize: "0.84rem", lineHeight: 1.5, maxWidth: 500,
                  }}
                >
                  Plan your semester schedule. Search classes, detect conflicts, and queue your
                  enrollment.
                </Typography>
              </Box>

              {/* Semester selector */}
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {SEMESTERS.map((s) => (
                  <Button
                    key={s}
                    variant={semester === s ? "contained" : "outlined"}
                    size="small"
                    onClick={() => setSemester(s)}
                    sx={{
                      fontWeight: 800, fontSize: "0.72rem", borderRadius: 999,
                      px: 1.5, py: 0.4, textTransform: "none",
                      ...(semester === s
                        ? {
                            bgcolor: "#fff", color: "#A80532",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.90)" },
                          }
                        : {
                            color: "rgba(255,255,255,0.75)",
                            borderColor: "rgba(255,255,255,0.30)",
                            bgcolor: "rgba(255,255,255,0.08)",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.14)" },
                          }),
                    }}
                  >
                    {s}
                  </Button>
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* ── Main Content ── */}
      <Container sx={{ pt: 2.5, pb: 6 }}>

        {/* Dev test banner */}
        {devTest.active && (
          <DevTestBanner
            onExit={handleExitDevMode}
            sectionCount={sections.length}
          />
        )}

        {/* ══ WEEKLY SCHEDULE — full width, at top ══ */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "18px",
            overflow: "hidden",
            bgcolor: "rgba(255,255,255,0.97)",
            border: "1px solid rgba(255,255,255,0.60)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            mb: 2.5,
          }}
        >
          <Box
            sx={{
              px: 2.25, py: 1.75,
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              background:
                "linear-gradient(135deg, rgba(168,5,50,0.05), rgba(168,5,50,0.02))",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarTodayIcon sx={{ fontSize: 16, color: "#A80532" }} />
                <Typography fontWeight={900} sx={{ fontSize: "0.95rem", color: "#1a1a2e" }}>
                  Weekly Schedule
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  sx={{ fontSize: "0.68rem", color: "rgba(0,0,0,0.38)", fontWeight: 600 }}
                >
                  {inPersonCount} in-person class{inPersonCount !== 1 ? "es" : ""} · {semester}
                </Typography>
                {cartClasses.length > 0 && (
                  <>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadRoundedIcon sx={{ fontSize: 16 }} />}
                      onClick={handleDownloadSchedulePdf}
                      sx={{
                        borderRadius: 999,
                        textTransform: "none",
                        fontWeight: 800,
                        fontSize: "0.72rem",
                        color: "#A80532",
                        borderColor: "rgba(168,5,50,0.22)",
                        bgcolor: "rgba(255,255,255,0.72)",
                        px: 1.25,
                        py: 0.35,
                        "&:hover": {
                          borderColor: "#A80532",
                          bgcolor: "rgba(168,5,50,0.05)",
                        },
                      }}
                    >
                      Download PDF
                    </Button>
                    <Button
                    variant="outlined"
                    size="small"
                    onClick={handleClearCourses}
                    sx={{
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 800,
                      fontSize: "0.72rem",
                      color: "#dc2626",
                      borderColor: "rgba(220,38,38,0.28)",
                      bgcolor: "rgba(255,255,255,0.72)",
                      px: 1.25,
                      py: 0.35,
                      "&:hover": {
                        borderColor: "#dc2626",
                        bgcolor: "rgba(220,38,38,0.05)",
                      },
                    }}
                  >
                    Clear Courses
                  </Button>
                  </>
                )}
              </Stack>
            </Stack>
          </Box>

          <Box sx={{ p: 2 }}>
            {inPersonCount === 0 ? (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <CalendarTodayIcon
                  sx={{ fontSize: 28, color: "rgba(0,0,0,0.10)", mb: 1 }}
                />
                <Typography
                  sx={{
                    color: "rgba(0,0,0,0.38)", fontSize: "0.82rem", fontStyle: "italic",
                  }}
                >
                  No in-person classes added yet. Add classes from the search panel below.
                </Typography>
              </Box>
            ) : (
              <ScheduleGrid classes={cartClasses} />
            )}
          </Box>
        </Paper>

        {/* ══ TWO-COLUMN: Search | Cart ══ */}
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", lg: "1fr 360px" },
            alignItems: "start",
          }}
        >
          {/* ── LEFT: Class Search Library ── */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: "18px",
              overflow: "hidden",
              bgcolor: "rgba(255,255,255,0.97)",
              border: "1px solid rgba(255,255,255,0.60)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            }}
          >
            <Box
              sx={{
                px: 2.25, py: 1.75,
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                background:
                  "linear-gradient(135deg, rgba(168,5,50,0.04), rgba(168,5,50,0.02))",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <ClassIcon sx={{ fontSize: 18, color: "#A80532" }} />
                  <Typography fontWeight={900} sx={{ fontSize: "1rem", color: "#1a1a2e" }}>
                    Class Search Library
                  </Typography>
                  {devTest.active && (
                    <Typography
                      sx={{
                        fontSize: "0.60rem", fontWeight: 900, color: "#ca8a04",
                        bgcolor: "#fef3c7", px: 0.75, py: 0.1,
                        borderRadius: "4px", border: "1px solid #fde68a",
                      }}
                    >
                      MOCK DATA
                    </Typography>
                  )}
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  {loading && <CircularProgress size={14} sx={{ color: "#A80532" }} />}
                  <Typography
                    sx={{ fontSize: "0.72rem", color: "rgba(0,0,0,0.40)", fontWeight: 600 }}
                  >
                    {sections.length} section{sections.length !== 1 ? "s" : ""} · {semester}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Box sx={{ p: 2.25 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 1.25 }}>
                <TextField
                  size="small"
                  label="Department"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && loadSections()}
                  placeholder="e.g. COMP"
                  sx={{
                    width: 110,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px", fontSize: "0.84rem",
                      "& fieldset": { borderColor: "rgba(0,0,0,0.12)" },
                      "&:hover fieldset": { borderColor: "rgba(168,5,50,0.30)" },
                      "&.Mui-focused fieldset": { borderColor: "#A80532" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#A80532" },
                  }}
                />
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by course, title, or professor…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 16, color: "rgba(0,0,0,0.35)" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px", fontSize: "0.84rem",
                      "& fieldset": { borderColor: "rgba(0,0,0,0.12)" },
                      "&:hover fieldset": { borderColor: "rgba(168,5,50,0.30)" },
                      "&.Mui-focused fieldset": { borderColor: "#A80532" },
                    },
                  }}
                />
              </Stack>

              <Box sx={{ mb: 1.75 }}>
                <SearchTagPanel activeTag={activeTag} onTagChange={setActiveTag} />
              </Box>

              {apiError && !devTest.active && (
                <Alert
                  severity="warning"
                  sx={{ mb: 1.5, borderRadius: "10px", fontSize: "0.80rem" }}
                  onClose={() => setApiError(null)}
                >
                  {apiError}
                </Alert>
              )}

              {loading ? (
                <Box sx={{ textAlign: "center", py: 5 }}>
                  <CircularProgress size={28} sx={{ color: "#A80532" }} />
                  <Typography
                    sx={{ color: "rgba(0,0,0,0.42)", fontSize: "0.82rem", mt: 1.5 }}
                  >
                    Loading sections…
                  </Typography>
                </Box>
              ) : sections.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4, px: 2 }}>
                  <SearchIcon sx={{ fontSize: 36, color: "rgba(0,0,0,0.15)", mb: 1 }} />
                  <Typography
                    sx={{
                      color: "rgba(0,0,0,0.45)", fontSize: "0.90rem", fontWeight: 700,
                    }}
                  >
                    No sections match your search.
                  </Typography>
                  <Typography
                    sx={{ color: "rgba(0,0,0,0.30)", fontSize: "0.80rem", mt: 0.4 }}
                  >
                    Try adjusting the department, filters, or search terms.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.25}>
                  {sections.map((cls) => (
                    <ClassSearchCard
                      key={cls.id}
                      cls={cls}
                      onAdd={() => handleAddToCart(cls)}
                      inCart={cartClasses.some((c) => c.id === cls.id)}
                      conflictsWith={getConflicts(cls)}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Paper>

          {/* ── RIGHT: Cart ── */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: "18px",
              overflow: "hidden",
              bgcolor: "rgba(255,255,255,0.97)",
              border: "1px solid rgba(255,255,255,0.60)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            }}
          >
            <Box
              sx={{
                px: 2.25, py: 1.75,
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                background:
                  "linear-gradient(135deg, rgba(168,5,50,0.05), rgba(168,5,50,0.02))",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <ShoppingCartIcon sx={{ fontSize: 16, color: "#A80532" }} />
                  <Typography fontWeight={900} sx={{ fontSize: "0.95rem", color: "#1a1a2e" }}>
                    My Cart — {semester}
                  </Typography>
                </Stack>
                {cartClasses.length > 0 && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<DownloadRoundedIcon sx={{ fontSize: 16 }} />}
                      onClick={handleDownloadCartPdf}
                      sx={{
                        color: "#A80532", fontWeight: 800,
                        fontSize: "0.72rem", textTransform: "none",
                        "&:hover": { bgcolor: "rgba(168,5,50,0.05)" },
                      }}
                    >
                      Download PDF
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      onClick={handleClearCourses}
                      sx={{
                        color: "rgba(0,0,0,0.35)", fontWeight: 800,
                        fontSize: "0.72rem", textTransform: "none",
                        "&:hover": { color: "#dc2626" },
                      }}
                    >
                      Clear all
                    </Button>
                  </Stack>
                )}
              </Stack>
            </Box>

            <Box sx={{ p: 2 }}>
              {cartClasses.length > 0 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 1, mb: 1.75,
                    p: 1.25, borderRadius: "12px",
                    bgcolor: "rgba(168,5,50,0.04)",
                    border: "1.5px solid rgba(168,5,50,0.10)",
                  }}
                >
                  {[
                    {
                      icon: <ClassIcon sx={{ fontSize: 14, color: "#A80532" }} />,
                      value: cartClasses.length, label: "Courses",
                    },
                    {
                      icon: <SchoolIcon sx={{ fontSize: 14, color: "#A80532" }} />,
                      value: totalUnits, label: "Units",
                    },
                    {
                      icon: <CalendarTodayIcon sx={{ fontSize: 14, color: "#2563eb" }} />,
                      value: onlineCount, label: "Online",
                    },
                  ].map((s) => (
                    <Box key={s.label} sx={{ textAlign: "center" }}>
                      <Box sx={{ display: "flex", justifyContent: "center", mb: 0.25 }}>
                        {s.icon}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: "1.1rem", fontWeight: 900,
                          color: "#1a1a2e", lineHeight: 1,
                        }}
                      >
                        {s.value}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.58rem", fontWeight: 700,
                          color: "rgba(0,0,0,0.42)",
                          textTransform: "uppercase", letterSpacing: 0.5,
                        }}
                      >
                        {s.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {cartClasses.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <ShoppingCartIcon
                    sx={{ fontSize: 32, color: "rgba(0,0,0,0.12)", mb: 1 }}
                  />
                  <Typography
                    sx={{
                      color: "rgba(0,0,0,0.40)", fontSize: "0.85rem", fontStyle: "italic",
                    }}
                  >
                    Your cart is empty.
                  </Typography>
                  <Typography
                    sx={{ color: "rgba(0,0,0,0.28)", fontSize: "0.75rem", mt: 0.25 }}
                  >
                    Search and add classes on the left.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={0.75}>
                  {cartClasses.map((cls, idx) => (
                    <CartItem
                      key={cls.id}
                      cls={cls}
                      index={idx}
                      onRemove={() =>
                        setCartClasses((prev) => prev.filter((c) => c.id !== cls.id))
                      }
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Paper>
        </Box>
      </Container>

      {/* ── Floating DEV TEST toggle (always visible, corner of screen) ── */}
      <DevTestToggle active={devTest.active} onToggle={devTest.toggle} />

      {/* ── Conflict error toast ── */}
      <Snackbar
        open={!!conflictError}
        autoHideDuration={4000}
        onClose={() => setConflictError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          onClose={() => setConflictError(null)}
          sx={{
            borderRadius: "12px", fontWeight: 700,
            boxShadow: "0 8px 32px rgba(220,38,38,0.25)",
          }}
        >
          {conflictError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
