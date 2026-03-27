"use client";

import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";

import { api } from "../../../lib/axios";

const red = "#B11226";
const border = "#E5E7EB";
const primaryText = "#111827";
const secondaryText = "#6B7280";

type NotificationSettings = {
  clubsNotifications: boolean;
  campusEventsNotifications: boolean;
  marketplaceNotifications: boolean;
  academicNotifications: boolean;
  followRequestNotifications: boolean;
};

type SaveStatus = "idle" | "loading" | "saving" | "saved";

const defaultNotificationSettings: NotificationSettings = {
  clubsNotifications: true,
  campusEventsNotifications: true,
  marketplaceNotifications: true,
  academicNotifications: true,
  followRequestNotifications: true,
};

function SettingsRow({
  label,
  description,
  right,
}: {
  label: string;
  description?: string;
  right: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        py: 2.25,
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontWeight: 700, color: primaryText }}>
          {label}
        </Typography>

        {description && (
          <Typography sx={{ fontSize: 14, color: secondaryText, mt: 0.5 }}>
            {description}
          </Typography>
        )}
      </Box>

      {right}
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
          color: secondaryText,
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

  return null;
}

export default function NotificationsPage() {
  const [clubsNotifications, setClubsNotifications] = useState(
    defaultNotificationSettings.clubsNotifications
  );
  const [campusEventsNotifications, setCampusEventsNotifications] = useState(
    defaultNotificationSettings.campusEventsNotifications
  );
  const [marketplaceNotifications, setMarketplaceNotifications] = useState(
    defaultNotificationSettings.marketplaceNotifications
  );
  const [academicNotifications, setAcademicNotifications] = useState(
    defaultNotificationSettings.academicNotifications
  );
  const [followRequestNotifications, setFollowRequestNotifications] = useState(
    defaultNotificationSettings.followRequestNotifications
  );

  const [initialSettings, setInitialSettings] =
    useState<NotificationSettings | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("loading");

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearSavedStatusRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justLoadedRef = useRef(true);

  const brandSwitchSx = {
    "& .MuiSwitch-switchBase.Mui-checked": { color: red },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
      backgroundColor: red,
    },
  };

  const currentSettings: NotificationSettings = {
    clubsNotifications,
    campusEventsNotifications,
    marketplaceNotifications,
    academicNotifications,
    followRequestNotifications,
  };

  useEffect(() => {
    let isMounted = true;

    const fetchNotificationSettings = async () => {
      try {
        setHasLoaded(false);
        setSaveStatus("loading");

        const token = localStorage.getItem("token");

        const response = await api.get("/api/v1/settings/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: NotificationSettings = response.data.data;

        if (!isMounted) return;

        setClubsNotifications(data.clubsNotifications);
        setCampusEventsNotifications(data.campusEventsNotifications);
        setMarketplaceNotifications(data.marketplaceNotifications);
        setAcademicNotifications(data.academicNotifications);
        setFollowRequestNotifications(data.followRequestNotifications);

        setInitialSettings(data);
        setSaveStatus("idle");
      } catch (error) {
        if (!isMounted) return;

        // If loading saved notification settings fails, fall back to defaults so the page
        // remains usable if backend persistence is unavailable 
        setClubsNotifications(defaultNotificationSettings.clubsNotifications);
        setCampusEventsNotifications(
          defaultNotificationSettings.campusEventsNotifications
        );
        setMarketplaceNotifications(
          defaultNotificationSettings.marketplaceNotifications
        );
        setAcademicNotifications(defaultNotificationSettings.academicNotifications);
        setFollowRequestNotifications(
          defaultNotificationSettings.followRequestNotifications
        );

        setInitialSettings(defaultNotificationSettings);
        setSaveStatus("idle");
      } finally {
        if (isMounted) {
          setHasLoaded(true);
          justLoadedRef.current = true;
        }
      }
    };

    fetchNotificationSettings();

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

    // Prevent auto-save from firing immediately right after initial settings load.
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      return;
    }

    const hasChanges =
      currentSettings.clubsNotifications !== initialSettings.clubsNotifications ||
      currentSettings.campusEventsNotifications !==
        initialSettings.campusEventsNotifications ||
      currentSettings.marketplaceNotifications !==
        initialSettings.marketplaceNotifications ||
      currentSettings.academicNotifications !==
        initialSettings.academicNotifications ||
      currentSettings.followRequestNotifications !==
        initialSettings.followRequestNotifications;

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

        await api.patch("/api/v1/settings/notifications", currentSettings,{
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
  }, [
    clubsNotifications,
    campusEventsNotifications,
    marketplaceNotifications,
    academicNotifications,
    followRequestNotifications,
    hasLoaded,
    initialSettings,
  ]);

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 26, fontWeight: 900, color: primaryText }}>
            Notifications
          </Typography>
          <Typography sx={{ color: secondaryText, mt: 0.5 }}>
            Choose which categories you want to be notified about
          </Typography>
        </Box>

        <SaveStatusChip status={saveStatus} />
      </Box>

      <Box
        sx={{
          background: "#fff",
          border: `1px solid ${border}`,
          borderRadius: 2,
          overflow: "hidden",
          maxWidth: 760,
        }}
      >
        <Divider sx={{ borderColor: border }} />

        <Box sx={{ px: 3 }}>
          <SettingsRow
            label="Clubs"
            description="Updates from clubs you're in"
            right={
              <Switch
                checked={clubsNotifications}
                onChange={(e) => setClubsNotifications(e.target.checked)}
                sx={brandSwitchSx}
                disabled={!hasLoaded}
              />
            }
          />

          <Divider sx={{ borderColor: border }} />

          <SettingsRow
            label="Campus Events + Reminders"
            description="Upcoming campus events"
            right={
              <Switch
                checked={campusEventsNotifications}
                onChange={(e) => setCampusEventsNotifications(e.target.checked)}
                sx={brandSwitchSx}
                disabled={!hasLoaded}
              />
            }
          />

          <Divider sx={{ borderColor: border }} />

          <SettingsRow
            label="Marketplace"
            description="Your marketplace listings"
            right={
              <Switch
                checked={marketplaceNotifications}
                onChange={(e) => setMarketplaceNotifications(e.target.checked)}
                sx={brandSwitchSx}
                disabled={!hasLoaded}
              />
            }
          />

          <Divider sx={{ borderColor: border }} />

          <SettingsRow
            label="Academic"
            description="Academic-related updates"
            right={
              <Switch
                checked={academicNotifications}
                onChange={(e) => setAcademicNotifications(e.target.checked)}
                sx={brandSwitchSx}
                disabled={!hasLoaded}
              />
            }
          />

          <Divider sx={{ borderColor: border }} />

          <SettingsRow
            label="Follow Requests + Mentions"
            description="When someone follows or tags you"
            right={
              <Switch
                checked={followRequestNotifications}
                onChange={(e) => setFollowRequestNotifications(e.target.checked)}
                sx={brandSwitchSx}
                disabled={!hasLoaded}
              />
            }
          />
        </Box>
      </Box>
    </Box>
  );
}