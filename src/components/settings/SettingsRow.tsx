"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { settingsDividerInsetPx, type SettingsIconTint } from "./settingsTheme";

type Props = {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: string;
  action: React.ReactNode;
  /** Pastel icon tile palette */
  tint?: SettingsIconTint;
  /** Inset divider under this row (not under icon) */
  divider?: boolean;
};

export function SettingsRow({ icon, title, description, action, tint = "brand", divider }: Props) {
  const inset = icon ? settingsDividerInsetPx.withIcon : settingsDividerInsetPx.noIcon;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.5,
        }}
      >
        {icon ? (
          <Box
            sx={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "text.secondary",
            }}
          >
            {icon}
          </Box>
        ) : null}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9375rem", color: "text.primary", letterSpacing: "-0.01em" }}>
              {title}
            </Typography>
            {description ? (
              <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", mt: 0.35, lineHeight: 1.45 }}>{description}</Typography>
            ) : null}
          </Box>
          <Box
            sx={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              alignSelf: "center",
            }}
          >
            {action}
          </Box>
        </Box>
      </Box>
      {divider ? <Box sx={{ height: "1px", bgcolor: "divider", ml: `${inset}px`, mr: 2 }} /> : null}
    </Box>
  );
}
