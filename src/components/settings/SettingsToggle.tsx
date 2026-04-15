"use client";

import Switch from "@mui/material/Switch";
import { brandRed } from "./settingsTheme";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

/** Fixed px geometry so the knob stays centered in the track (immune to root font-size scaling). */
const TRACK_W = 44;
const TRACK_H = 22;
const THUMB = 18;
const INSET = 2;
const THUMB_TRAVEL = TRACK_W - INSET * 2 - THUMB;

export function SettingsToggle({ checked, onChange, disabled, inputProps }: Props) {
  return (
    <Switch
      disableRipple
      checked={checked}
      disabled={disabled}
      onChange={(_, v) => onChange(v)}
      inputProps={inputProps}
      sx={{
        width: TRACK_W,
        height: TRACK_H,
        padding: 0,
        overflow: "visible",
        "& .MuiSwitch-switchBase": {
          padding: 0,
          top: "50%",
          left: INSET,
          margin: 0,
          /* Keep MUI’s vertical centering while sliding horizontally only */
          transform: "translate(0, -50%)",
          transition: (t) =>
            t.transitions.create(["transform"], { duration: t.transitions.duration.shortest }),
          "&.Mui-checked": {
            color: "#fff",
            transform: `translate(${THUMB_TRAVEL}px, -50%)`,
            "&:hover": {
              backgroundColor: "rgba(177, 18, 38, 0.12)",
            },
          },
          "&.Mui-disabled": {
            opacity: 0.45,
          },
          "&:hover": {
            backgroundColor: "transparent",
          },
        },
        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
          backgroundColor: brandRed,
          opacity: 1,
          borderColor: "rgba(0,0,0,0.06)",
        },
        "& .MuiSwitch-thumb": {
          width: THUMB,
          height: THUMB,
          boxSizing: "border-box",
          backgroundColor: "#fff",
          border: "1px solid rgba(0,0,0,0.14)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        },
        "& .MuiSwitch-switchBase.Mui-checked .MuiSwitch-thumb": {
          borderColor: "rgba(255,255,255,0.55)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.28)",
        },
        "& .MuiSwitch-track": {
          width: TRACK_W,
          height: TRACK_H,
          borderRadius: TRACK_H / 2,
          opacity: 1,
          backgroundColor: "#d1d5db",
          border: "1px solid rgba(0,0,0,0.08)",
          boxSizing: "border-box",
        },
      }}
    />
  );
}
