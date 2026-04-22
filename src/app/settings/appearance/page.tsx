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
import { api } from "../../../lib/axios";
 
const red = "#B11226";
 
// Shape of the appearance settings stored in the database
type AppearanceSettings = {
  theme: ThemeMode;
  textSize: TextSize;
};
 
// Tracks whether settings are being loaded from the API, auto-saved, or confirmed saved
type SaveStatus = "idle" | "loading" | "saving" | "saved";
 
const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  theme: "light",
  textSize: "medium",
};
 
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
  if (status === "loading") {
    return (
      <Chip
        icon={<CircularProgress size={14} />}
        label="Loading..."
        size="small"
        sx={{
          backgroundColor: "rgba(177, 18, 38, 0.08)",
          color: red,
          fontWeight: 700,
          "& .MuiChip-icon": { ml: 1 },
        }}
      />
    );
  }
 
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
          "& .MuiChip-icon": { ml: 1 },
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
  // Global theme state shared across the app via SiteAppearanceProvider
  const { theme, textSize, setTheme, setTextSize } = useSiteAppearance();
 
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  // True once the initial API fetch has completed (controls whether selects are interactive)
  const [hasLoaded, setHasLoaded] = useState(false);
  // The last settings successfully saved to the database — used to detect unsaved changes
  const [initialSettings, setInitialSettings] = useState<AppearanceSettings>(
    DEFAULT_APPEARANCE_SETTINGS
  );
 
  // Prevents auto-save from firing immediately after the initial API load sets theme/textSize
  const justLoadedRef = useRef(false);
  // Debounce timer: delays the PATCH request until the user stops changing settings
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Timer that clears the "Saved" chip after 1.8 seconds
  const clearSavedStatusRef = useRef<ReturnType<typeof setTimeout> | null>(null);
 
  const selectSx = {
    width: 150,
    "& .MuiSelect-select": { py: 1, fontWeight: 500 },
  };
 
  const menuPaperSx = {
    "& .MuiMenuItem-root": { fontWeight: 300 },
    "& .MuiMenuItem-root.Mui-selected": { fontWeight: 700 },
  };
 
  // Fetch saved appearance settings from the API on mount and apply them globally
  useEffect(() => {
    let isMounted = true;
 
    const fetchAppearanceSettings = async () => {
      try {
        setSaveStatus("loading");
 
        const token = localStorage.getItem("token");
        const response = await api.get("/api/v1/settings/appearance", {
          headers: { Authorization: `Bearer ${token}` },
        });
 
        const data: AppearanceSettings = response.data.data;
        if (!isMounted) return;
 
        // Apply fetched settings to global provider so the whole app reflects them
        setTheme(data.theme);
        setTextSize(data.textSize);
        setInitialSettings(data);
        setSaveStatus("idle");
      } catch {
        if (!isMounted) return;
 
        // Fall back to defaults if the endpoint fails (e.g. new user, network error)
        setTheme(DEFAULT_APPEARANCE_SETTINGS.theme);
        setTextSize(DEFAULT_APPEARANCE_SETTINGS.textSize);
        setInitialSettings(DEFAULT_APPEARANCE_SETTINGS);
        setSaveStatus("idle");
      } finally {
        if (isMounted) {
          setHasLoaded(true);
          // Signal the auto-save effect to skip the first change triggered by this load
          justLoadedRef.current = true;
        }
      }
    };
 
    fetchAppearanceSettings();
 
    return () => {
      isMounted = false;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (clearSavedStatusRef.current) clearTimeout(clearSavedStatusRef.current);
    };
  }, []);
 
  // Auto-save to the API whenever the user changes theme or text size (debounced 700ms)
  useEffect(() => {
    // Wait until the initial fetch has finished before watching for changes
    if (!hasLoaded) return;
 
    // Skip the first trigger caused by the initial load setting theme/textSize
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      return;
    }
 
    // Only save if something actually changed from what's in the database
    const hasChanges =
      theme !== initialSettings.theme || textSize !== initialSettings.textSize;
    if (!hasChanges) return;
 
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (clearSavedStatusRef.current) clearTimeout(clearSavedStatusRef.current);
 
    // Capture current values in a closure so the timeout uses the right snapshot
    const currentSettings = { theme, textSize };
 
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaveStatus("saving");
 
        const token = localStorage.getItem("token");
        await api.patch("/api/v1/settings/appearance", currentSettings, {
          headers: { Authorization: `Bearer ${token}` },
        });
 
        // Update baseline so subsequent no-op changes don't trigger another save
        setInitialSettings(currentSettings);
        setSaveStatus("saved");
 
        clearSavedStatusRef.current = setTimeout(() => {
          setSaveStatus("idle");
        }, 1800);
      } catch {
        setSaveStatus("idle");
      }
    }, 700);
 
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [theme, textSize, hasLoaded]);
 
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
                disabled={!hasLoaded}
                inputProps={{ "aria-label": "Theme" }}
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
                disabled={!hasLoaded}
                inputProps={{ "aria-label": "Text size" }}
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