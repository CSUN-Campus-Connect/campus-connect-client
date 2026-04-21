"use client";

import Box from "@mui/material/Box";
import { settingsDividerInsetPx } from "./settingsTheme";

type Props = {
  /** Align with row that has a leading icon tile */
  variant?: "withIcon" | "noIcon";
};

export function SettingsInsetDivider({ variant = "withIcon" }: Props) {
  const ml = variant === "withIcon" ? settingsDividerInsetPx.withIcon : settingsDividerInsetPx.noIcon;
  return <Box sx={{ height: "1px", bgcolor: "#E2E5EC", ml: `${ml}px`, mr: 2 }} />;
}
