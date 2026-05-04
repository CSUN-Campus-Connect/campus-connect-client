export const brandRed = "#B11226";

/** Main settings content pane (cards sit on this). */
export const settingsPageBg = "#FFFFFF";

/** Pastel icon tiles — matches grouped iOS-style settings lists */
export const settingsIconTints = {
  brand: { bg: "rgba(177, 18, 38, 0.12)", fg: brandRed },
  rose: { bg: "#FCE7F0", fg: "#BE185D" },
  pink: { bg: "#FDF2F8", fg: "#DB2777" },
  blue: { bg: "#E0E7FF", fg: "#4338CA" },
  sky: { bg: "#E0F2FE", fg: "#0369A1" },
  green: { bg: "#DCFCE7", fg: "#15803D" },
  emerald: { bg: "#D1FAE5", fg: "#047857" },
  amber: { bg: "#FEF3C7", fg: "#B45309" },
  orange: { bg: "#FFEDD5", fg: "#C2410C" },
  red: { bg: "#FEE2E2", fg: "#B91C1C" },
  slate: { bg: "#F1F5F9", fg: "#475569" },
  violet: { bg: "#EDE9FE", fg: "#6D28D9" },
  cyan: { bg: "#CFFAFE", fg: "#0E7490" },
  lime: { bg: "#ECFCCB", fg: "#4D7C0F" },
} as const;

export type SettingsIconTint = keyof typeof settingsIconTints;

export const settingsDividerInsetPx = {
  /** px-2 (16) + 40px icon + gap 12 */
  withIcon: 68,
  /** px-2 only */
  noIcon: 16,
} as const;
