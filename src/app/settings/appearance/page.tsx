"use client";

import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";

import { useSiteAppearance } from "@/components/SiteAppearanceProvider";
import type { TextSize, ThemeMode } from "@/lib/siteAppearance";

const red = "#B11226";

type SaveStatus = "idle" | "saving" | "saved";

function SettingsRow({
  label,
  description,
  right,
  isLast,
}: {
  label: string;
  description?: string;
  right: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <Box
      sx={{
        px: 2.5,
        py: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        ...(isLast ? {} : { borderBottom: (t) => `1px solid ${t.palette.divider}` }),
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontWeight: 800 }} color="text.primary">
          {label}
        </Typography>
        {description && (
          <Typography sx={{ fontSize: 13.5, mt: 0.35 }} color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: "0 0 auto" }}>{right}</Box>
    </Box>
  );
}

function SaveStatusChip({ status }: { status: SaveStatus }) {
  if (status === "saving") {
    return (
      <Chip
        icon={<CircularProgress size={14} />}
        label="Saving..."
        size="small"
        sx={{
          backgroundColor: "rgba(177, 18, 38, 0.12)",
          color: red,
          fontWeight: 700,
          "& .MuiChip-icon": {
            ml: 1,
          },
        }}
      />
    );
  }

  if (status === "saved") {
    return (
      <Chip
        label="Saved"
        size="small"
        color="success"
        variant="outlined"
        sx={{ fontWeight: 700 }}
      />
    );
  }

  return null;
}

export default function AppearancePage() {
  const { theme, textSize, setTheme, setTextSize } = useSiteAppearance();

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [hasHydrated, setHasHydrated] = useState(false);
  const appearanceInitRef = useRef(false);
  const prevRef = useRef<{ theme: ThemeMode; textSize: TextSize } | null>(null);
  const clearSavedRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectSx = {
    width: 150,
    "& .MuiSelect-select": { py: 1, fontWeight: 500 },
  };

  const menuPaperSx = {
    "& .MuiMenuItem-root": { fontWeight: 300 },
    "& .MuiMenuItem-root.Mui-selected": { fontWeight: 700 },
  };

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!appearanceInitRef.current) {
      appearanceInitRef.current = true;
      prevRef.current = { theme, textSize };
      return;
    }

    if (
      !prevRef.current ||
      (prevRef.current.theme === theme && prevRef.current.textSize === textSize)
    ) {
      return;
    }

    prevRef.current = { theme, textSize };

    if (clearSavedRef.current) clearTimeout(clearSavedRef.current);

    setSaveStatus("saving");
    const t = setTimeout(() => {
      setSaveStatus("saved");
      clearSavedRef.current = setTimeout(() => setSaveStatus("idle"), 1600);
    }, 200);

    return () => clearTimeout(t);
  }, [theme, textSize, hasHydrated]);

  return (
    <Box>
      <Box
        sx={{
          mb: 2.25,
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 26, fontWeight: 900 }} color="text.primary">
            Appearance
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Customize theme and readability
          </Typography>
        </Box>

        <SaveStatusChip status={saveStatus} />
      </Box>

      <Box
        sx={{
          border: (t) => `1px solid ${t.palette.divider}`,
          borderRadius: 3,
          overflow: "hidden",
          maxWidth: 700,
          boxShadow: (t) =>
            t.palette.mode === "dark"
              ? "0 1px 0 rgba(255,255,255,0.04)"
              : "0 1px 0 rgba(17,24,39,0.03)",
        }}
      >
        <Divider />

        <SettingsRow
          label="Theme"
          description="Choose light or dark mode"
          right={
            <FormControl size="small">
              <Select
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemeMode)}
                sx={selectSx}
                MenuProps={{ PaperProps: { sx: menuPaperSx } }}
                disabled={!hasHydrated}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </Select>
            </FormControl>
          }
        />

        <SettingsRow
          label="Text size"
          description="Adjust readability"
          isLast
          right={
            <FormControl size="small">
              <Select
                value={textSize}
                onChange={(e) => setTextSize(e.target.value as TextSize)}
                sx={selectSx}
                MenuProps={{ PaperProps: { sx: menuPaperSx } }}
                disabled={!hasHydrated}
              >
                <MenuItem value="small">Small</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="large">Large</MenuItem>
                <MenuItem value="extra-large">Extra Large</MenuItem>
              </Select>
            </FormControl>
          }
        />
      </Box>
    </Box>
  );
}
