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

import { api } from "../../../lib/axios";


const red = "#B11226";

type ThemeMode = "light" | "dark";
type TextSize = "small" | "medium" | "large" | "extra-large";

type AppearanceSettings = {
  theme: ThemeMode;
  textSize: TextSize;
};

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
        ...(isLast ? {} : { borderBottom: "1px solid #F1F5F9" }),
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontWeight: 800, color: "#111827" }}>{label}</Typography>
        {description && (
          <Typography sx={{ fontSize: 13.5, color: "#6B7280", mt: 0.35 }}>
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
        label="Loading..."
        size="small"
        sx={{
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
          fontWeight: 600,
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
          backgroundColor: "#FEF2F2",
          color: red,
          fontWeight: 700,
          "& .MuiChip-icon": {
            ml: 1,
          },
        }}
      />
    );
  }
}

export default function AppearancePage() {
  const [theme, setTheme] = useState<ThemeMode>(DEFAULT_APPEARANCE_SETTINGS.theme);
  const [textSize, setTextSize] = useState<TextSize>(
    DEFAULT_APPEARANCE_SETTINGS.textSize
  );

  const [initialSettings, setInitialSettings] =
    useState<AppearanceSettings | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("loading");

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearSavedStatusRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justLoadedRef = useRef(true);

  const selectSx = {
    width: 150,
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: red },
    "& .MuiSelect-select": { py: 1, fontWeight: 500 },
  };

  const menuPaperSx = {
    "& .MuiMenuItem-root": { fontWeight: 300 },
    "& .MuiMenuItem-root.Mui-selected": { fontWeight: 700 },
  };

  const currentSettings: AppearanceSettings = {
    theme,
    textSize,
  };

  useEffect(() => {
    let isMounted = true;

    const fetchAppearanceSettings = async () => {
      try {
        setHasLoaded(false);
        setSaveStatus("loading");

        const token = localStorage.getItem("token");

        const response = await api.get("/api/v1/settings/appearance", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: AppearanceSettings = response.data.data;
        if (!isMounted) return;

        setTheme(data.theme);
        setTextSize(data.textSize);
        setInitialSettings(data);
        setSaveStatus("idle");
      } catch (error) {
        if (!isMounted) return;

        setTheme(DEFAULT_APPEARANCE_SETTINGS.theme);
        setTextSize(DEFAULT_APPEARANCE_SETTINGS.textSize);
        setInitialSettings(DEFAULT_APPEARANCE_SETTINGS);
        setSaveStatus("idle");
      } finally {
        if (isMounted) {
          setHasLoaded(true);
          justLoadedRef.current = true;
        }
      }
    };

    fetchAppearanceSettings();

    return () => {
      isMounted = false;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      if (clearSavedStatusRef.current) {
        clearTimeout(clearSavedStatusRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasLoaded || !initialSettings) return;

    // Prevent auto-save from firing immediately after initial backend load.
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      return;
    }

    const hasChanges =
      currentSettings.theme !== initialSettings.theme ||
      currentSettings.textSize !== initialSettings.textSize;

    if (!hasChanges) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (clearSavedStatusRef.current) {
      clearTimeout(clearSavedStatusRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaveStatus("saving");

        const token = localStorage.getItem("token");
        await api.patch("/api/v1/settings/appearance", currentSettings, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setInitialSettings(currentSettings);
        setSaveStatus("saved");

        clearSavedStatusRef.current = setTimeout(() => {
          setSaveStatus("idle");
        }, 1800);
      } catch (error) {
        setSaveStatus("idle");
      }
    }, 700);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [theme, textSize, hasLoaded, initialSettings]);

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
          <Typography sx={{ fontSize: 26, fontWeight: 900, color: "#111827" }}>
            Appearance
          </Typography>
          <Typography sx={{ color: "#6B7280", mt: 0.5 }}>
            Customize theme and readability
          </Typography>
        </Box>

        <SaveStatusChip status={saveStatus} />
      </Box>

      <Box
        sx={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 3,
          overflow: "hidden",
          maxWidth: 700,
          boxShadow: "0 1px 0 rgba(17,24,39,0.03)",
        }}
      >
        <Divider sx={{ borderColor: "#F1F5F9" }} />

        <SettingsRow
          label="Theme"
          description="Choose light or dark mode"
          right={
            <FormControl size="small">
              <Select
                value={theme}
                onChange={(e) => {
                  const nextTheme = e.target.value as ThemeMode;

                  // TODO: If the app later supports live theme switching,
                  // apply the visual theme here in addition to persisting the preference.

                  setTheme(nextTheme);
                }}
                sx={selectSx}
                MenuProps={{ PaperProps: { sx: menuPaperSx } }}
                disabled={!hasLoaded}
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
                onChange={(e) => {
                  const nextTextSize = e.target.value as TextSize;

                  // TODO: If the app later supports live text scaling,
                  // apply the visual text-size preference here in addition to persisting it.

                  setTextSize(nextTextSize);
                }}
                sx={selectSx}
                MenuProps={{ PaperProps: { sx: menuPaperSx } }}
                disabled={!hasLoaded}
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