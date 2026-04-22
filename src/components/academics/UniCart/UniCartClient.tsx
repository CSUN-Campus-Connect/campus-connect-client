"use client";

import * as React from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SchoolIcon from "@mui/icons-material/School";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ClassIcon from "@mui/icons-material/Class";

import type { UniCartClass } from "../shared/constants";
import { BG, btnGhost, btnPrimary } from "../shared/constants";
import { mockClassLibrary } from "../shared/mockData";
import { timesConflict } from "../shared/utils";
import { ClassSearchCard } from "./ClassSearchCard";
import { CartItem } from "./CartItem";
import { ScheduleGrid } from "./ScheduleGrid";
import { SearchTagPanel } from "./SearchTagPanel";

// ─────────────────────────────────────────────────────────────────────────────
export default function UniCartClient() {
  const [cartClasses, setCartClasses]     = React.useState<UniCartClass[]>([]);
  const [semester, setSemester]           = React.useState("Spring 2026");
  const [searchQuery, setSearchQuery]     = React.useState("");
  const [activeTag, setActiveTag]         = React.useState("All");
  const [conflictError, setConflictError] = React.useState<string | null>(null);

  // ── Filtering ───────────────────────────────────────────────────────────────
  const filteredLibrary = React.useMemo(() => {
    let list = mockClassLibrary.filter((c) => c.semester === semester);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) =>
        `${c.subject} ${c.number} ${c.title} ${c.professor} ${(c.tags ?? []).join(" ")}`
          .toLowerCase()
          .includes(q)
      );
    }

    if (activeTag !== "All") {
      if (activeTag === "Online")             list = list.filter((c) => c.isOnline);
      else if (activeTag === "In-Person")     list = list.filter((c) => !c.isOnline);
      else if (activeTag === "Hybrid")        list = list.filter((c) => (c.tags ?? []).includes("Hybrid"));
      else if (activeTag === "Open Seats")    list = list.filter((c) => (c.seatsAvailable ?? 0) > 0);
      else if (activeTag === "Waitlist Available") list = list.filter((c) => (c.waitlistCount ?? 0) > 0);
      else list = list.filter((c) => {
        const subj = c.subject.toUpperCase();
        const tag  = activeTag.toUpperCase();
        return (
          subj === tag ||
          (c.tags ?? []).some((t) => t.toUpperCase() === tag) ||
          c.courseType?.toUpperCase() === tag
        );
      });
    }

    return list;
  }, [semester, searchQuery, activeTag]);

  // ── Conflict detection ──────────────────────────────────────────────────────
  const getConflicts = React.useCallback(
    (cls: UniCartClass): string[] => {
      if (cls.isOnline || !cls.startTime) return [];
      return cartClasses
        .filter((c) => c.id !== cls.id && !c.isOnline && c.startTime)
        .filter((c) =>
          timesConflict(cls.days ?? [], cls.startTime, cls.endTime, c.days ?? [], c.startTime, c.endTime)
        )
        .map((c) => `${c.subject} ${c.number}`);
    },
    [cartClasses]
  );

  const handleAddToCart = (cls: UniCartClass) => {
    const conflicts = getConflicts(cls);
    if (conflicts.length > 0) {
      setConflictError(`Cannot add ${cls.subject} ${cls.number}: time conflict with ${conflicts.join(", ")}`);
      return;
    }
    if (cartClasses.some((c) => c.id === cls.id)) return;
    setCartClasses((prev) => [...prev, cls]);
  };

  const totalUnits        = cartClasses.reduce((s, c) => s + c.units, 0);
  const totalMaterialCost = cartClasses.reduce((s, c) => s + (c.materialCost ?? 0), 0);
  const onlineCount       = cartClasses.filter((c) => c.isOnline).length;

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #8b0000 0%, #A80532 35%, #c0182a 60%, #6b0f2a 100%)",
    }}>
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
            "&:hover": { bgcolor: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.45)" },
          }}
          size="small"
        >
          Academics
        </Button>
      </Box>

      {/* ── Hero Header ── */}
      <Box sx={{ position: "relative", overflow: "hidden", pt: 1.5, pb: 0 }}>
        {/* Decorative circles */}
        {[{ size: 320, top: -60, right: -80, opacity: 0.04 }, { size: 180, top: 10, right: 100, opacity: 0.03 }].map((s, i) => (
          <Box key={i} sx={{
            position: "absolute", top: s.top, right: s.right,
            width: s.size, height: s.size, borderRadius: "50%",
            background: "rgba(255,255,255,1)",
            opacity: s.opacity, pointerEvents: "none",
          }} />
        ))}

        <Container sx={{ position: "relative", zIndex: 1 }}>
          <Paper elevation={0} sx={{
            borderRadius: "20px",
            p: { xs: 2.5, md: 3 }, mb: 0,
            bgcolor: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(24px)",
          }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ md: "center" }}>
              <Box>
                <Typography sx={{ letterSpacing: 4, fontWeight: 900, color: "rgba(255,255,255,0.50)", fontSize: "0.58rem", textTransform: "uppercase", mb: 0.5, fontFamily: "'DM Mono', monospace" }}>
                  CSUN · COURSE ENROLLMENT
                </Typography>
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 0.75 }}>
                  <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.20)" }}>
                    <ShoppingCartIcon sx={{ color: "#fff", fontSize: 20 }} />
                  </Box>
                  <Typography fontWeight={900} sx={{ fontSize: { xs: "1.5rem", md: "1.9rem" }, color: "#fff", letterSpacing: -0.5, lineHeight: 1 }}>
                    UniCart
                  </Typography>
                </Stack>
                <Typography sx={{ color: "rgba(255,255,255,0.60)", fontSize: "0.84rem", lineHeight: 1.5, maxWidth: 500 }}>
                  Plan your semester schedule. Search classes, detect conflicts, and queue your enrollment.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* ── Main Content ── */}
      <Container sx={{ pt: 2.5, pb: 6 }}>
        {/* Two-column layout: Search | Cart+Schedule */}
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1fr 360px" }, alignItems: "start" }}>

          {/* ── LEFT: Class Search Library ── */}
          <Paper elevation={0} sx={{
            borderRadius: "18px",
            overflow: "hidden",
            bgcolor: "rgba(255,255,255,0.97)",
            border: "1px solid rgba(255,255,255,0.60)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          }}>
            {/* Panel header */}
            <Box sx={{
              px: 2.25, py: 1.75,
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              background: "linear-gradient(135deg, rgba(168,5,50,0.04), rgba(168,5,50,0.02))",
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <ClassIcon sx={{ fontSize: 18, color: "#A80532" }} />
                  <Typography fontWeight={900} sx={{ fontSize: "1rem", color: "#1a1a2e" }}>
                    Class Search Library
                  </Typography>
                </Stack>
                <Typography sx={{ fontSize: "0.72rem", color: "rgba(0,0,0,0.40)", fontWeight: 600 }}>
                  {filteredLibrary.length} section{filteredLibrary.length !== 1 ? "s" : ""} · {semester}
                </Typography>
              </Stack>
            </Box>

            <Box sx={{ p: 2.25 }}>
              {/* Search input */}
              <TextField
                fullWidth
                size="small"
                placeholder="Search by course, title, or professor (e.g. COMP 324, Art 101, Dr. Lee)…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inputProps={{ "aria-label": "Search by course, title, or professor" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 16, color: "rgba(0,0,0,0.35)" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 1.5,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    fontSize: "0.84rem",
                    "& fieldset": { borderColor: "rgba(0,0,0,0.12)" },
                    "&:hover fieldset": { borderColor: "rgba(168,5,50,0.30)" },
                    "&.Mui-focused fieldset": { borderColor: "#A80532" },
                  },
                }}
              />

              {/* Tag filters */}
              <Box sx={{ mb: 1.75 }}>
                <SearchTagPanel activeTag={activeTag} onTagChange={setActiveTag} />
              </Box>

              {/* Results */}
              {filteredLibrary.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4, px: 2 }}>
                  <SearchIcon sx={{ fontSize: 36, color: "rgba(0,0,0,0.15)", mb: 1 }} />
                  <Typography sx={{ color: "rgba(0,0,0,0.45)", fontSize: "0.90rem", fontWeight: 700 }}>
                    No sections match your search.
                  </Typography>
                  <Typography sx={{ color: "rgba(0,0,0,0.30)", fontSize: "0.80rem", mt: 0.4 }}>
                    Try adjusting filters or search terms.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.25}>
                  {filteredLibrary.map((cls) => (
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

          {/* ── RIGHT: Cart + Schedule ── */}
          <Stack spacing={2}>
            {/* Cart summary */}
            <Paper elevation={0} sx={{
              borderRadius: "18px",
              overflow: "hidden",
              bgcolor: "rgba(255,255,255,0.97)",
              border: "1px solid rgba(255,255,255,0.60)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            }}>
              {/* Cart header */}
              <Box sx={{
                px: 2.25, py: 1.75,
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                background: "linear-gradient(135deg, rgba(168,5,50,0.05), rgba(168,5,50,0.02))",
              }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ShoppingCartIcon sx={{ fontSize: 16, color: "#A80532" }} />
                    <Typography fontWeight={900} sx={{ fontSize: "0.95rem", color: "#1a1a2e" }}>
                      My Cart — {semester}
                    </Typography>
                  </Stack>
                  {cartClasses.length > 0 && (
                    <Button
                      variant="text" size="small"
                      onClick={() => setCartClasses([])}
                      sx={{ color: "rgba(0,0,0,0.35)", fontWeight: 800, fontSize: "0.72rem", textTransform: "none", "&:hover": { color: "#dc2626" } }}
                    >
                      Clear all
                    </Button>
                  )}
                </Stack>
              </Box>

              <Box sx={{ p: 2 }}>
                {/* Stats row */}
                {cartClasses.length > 0 && (
                  <Box sx={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${totalMaterialCost > 0 ? 4 : 3}, 1fr)`,
                    gap: 1, mb: 1.75,
                    p: 1.25, borderRadius: "12px",
                    bgcolor: "rgba(168,5,50,0.04)",
                    border: "1.5px solid rgba(168,5,50,0.10)",
                  }}>
                    {[
                      { icon: <ClassIcon sx={{ fontSize: 14, color: "#A80532" }} />, value: cartClasses.length, label: "Courses" },
                      { icon: <SchoolIcon sx={{ fontSize: 14, color: "#A80532" }} />, value: totalUnits, label: "Units" },
                      { icon: <CalendarTodayIcon sx={{ fontSize: 14, color: "#2563eb" }} />, value: onlineCount, label: "Online" },
                      ...(totalMaterialCost > 0
                        ? [{ icon: <AttachMoneyIcon sx={{ fontSize: 14, color: "#d97706" }} />, value: `~$${totalMaterialCost}`, label: "Materials" }]
                        : []),
                    ].map((s) => (
                      <Box key={s.label} sx={{ textAlign: "center" }}>
                        <Box sx={{ display: "flex", justifyContent: "center", mb: 0.25 }}>{s.icon}</Box>
                        <Typography sx={{ fontSize: "1.1rem", fontWeight: 900, color: "#1a1a2e", lineHeight: 1 }}>
                          {s.value}
                        </Typography>
                        <Typography sx={{ fontSize: "0.58rem", fontWeight: 700, color: "rgba(0,0,0,0.42)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                          {s.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Cart items */}
                {cartClasses.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 3 }}>
                    <ShoppingCartIcon sx={{ fontSize: 32, color: "rgba(0,0,0,0.12)", mb: 1 }} />
                    <Typography sx={{ color: "rgba(0,0,0,0.40)", fontSize: "0.85rem", fontStyle: "italic" }}>
                      Your cart is empty.
                    </Typography>
                    <Typography sx={{ color: "rgba(0,0,0,0.28)", fontSize: "0.75rem", mt: 0.25 }}>
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
                        onRemove={() => setCartClasses((prev) => prev.filter((c) => c.id !== cls.id))}
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            </Paper>

            {/* Weekly Schedule Grid */}
            <Paper elevation={0} sx={{
              borderRadius: "18px",
              overflow: "hidden",
              bgcolor: "rgba(255,255,255,0.97)",
              border: "1px solid rgba(255,255,255,0.60)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            }}>
              <Box sx={{
                px: 2.25, py: 1.75,
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                background: "linear-gradient(135deg, rgba(168,5,50,0.04), rgba(168,5,50,0.02))",
              }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarTodayIcon sx={{ fontSize: 16, color: "#A80532" }} />
                    <Typography fontWeight={900} sx={{ fontSize: "0.95rem", color: "#1a1a2e" }}>
                      Weekly Schedule
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: "0.68rem", color: "rgba(0,0,0,0.38)", fontWeight: 600 }}>
                    {cartClasses.filter((c) => !c.isOnline && c.startTime).length} in-person class{cartClasses.filter((c) => !c.isOnline && c.startTime).length !== 1 ? "es" : ""}
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ p: 2 }}>
                {cartClasses.filter((c) => !c.isOnline && c.startTime).length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 3 }}>
                    <CalendarTodayIcon sx={{ fontSize: 28, color: "rgba(0,0,0,0.10)", mb: 1 }} />
                    <Typography sx={{ color: "rgba(0,0,0,0.38)", fontSize: "0.82rem", fontStyle: "italic" }}>
                      No in-person classes added yet.
                    </Typography>
                  </Box>
                ) : (
                  <ScheduleGrid classes={cartClasses} />
                )}
              </Box>
            </Paper>
          </Stack>
        </Box>
      </Container>

      {/* Conflict error toast */}
      <Snackbar
        open={!!conflictError}
        autoHideDuration={4000}
        onClose={() => setConflictError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          onClose={() => setConflictError(null)}
          sx={{ borderRadius: "12px", fontWeight: 700, boxShadow: "0 8px 32px rgba(220,38,38,0.25)" }}
        >
          {conflictError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
