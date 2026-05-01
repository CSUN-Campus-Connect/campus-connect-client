// src/app/admin/theme.ts

export const adminTheme = {
  // Backgrounds
  bg:       "#f7f7f7",
  bgCard:   "#ffffff",
  bgAccent: "#fff5f5",   // very faint red tint — used sparingly
  bgHover:  "#f4f4f4",
  bgInput:  "#f7f7f7",

  // Borders
  border:     "#ebebeb",
  borderDark: "#d8d8d8",

  // Text
  textPrimary:   "#111111",
  textSecondary: "#555555",
  textMuted:     "#888888",
  textLight:     "#aaaaaa",
  textWhite:     "#ffffff",

  // Accent — CSUN red only
  accent:       "#CC0033",
  accentLight:  "#e05070",
  accentBg:     "#fff5f5",
  accentBorder: "#f5c6cb",

  // Status — 3 colors max
  // active/open   → dark charcoal
  // neutral/closed → grey
  // critical       → CSUN red
  statusActive:   { color: "#111111", bg: "#f0f0f0", border: "#d8d8d8" },
  statusNeutral:  { color: "#888888", bg: "#f7f7f7", border: "#e0e0e0" },
  statusCritical: { color: "#CC0033", bg: "#fff5f5", border: "#f5c6cb" },

  // Semantic — kept minimal, only used where absolutely necessary
  success:       "#2d6a3f",
  successBg:     "#f4faf6",
  successBorder: "#c3deca",

  warning:       "#7a5c00",
  warningBg:     "#fdf8ec",
  warningBorder: "#e8d89a",

  error:         "#CC0033",
  errorBg:       "#fff5f5",
  errorBorder:   "#f5c6cb",

  info:          "#555555",
  infoBg:        "#f4f4f4",
  infoBorder:    "#d8d8d8",

  // Font
  font: "'DM Sans', 'Helvetica Neue', sans-serif",

  // Table
  thStyle: {
    textAlign: "left" as const,
    padding: "10px 12px",
    color: "#aaaaaa",
    fontWeight: 500 as const,
    fontSize: "11px",
    letterSpacing: "0.3px",
    borderBottom: "1px solid #ebebeb",
  },
  tdStyle: {
    padding: "10px 12px",
    borderBottom: "1px solid #f4f4f4",
  },

  // Buttons
  btnPrimary: {
    padding: "6px 16px",
    background: "#CC0033",
    border: "none",
    borderRadius: "5px",
    color: "#fff",
    fontSize: "12px",
    cursor: "pointer" as const,
  },
  btnSecondary: {
    padding: "6px 16px",
    background: "#ffffff",
    border: "1px solid #d8d8d8",
    borderRadius: "5px",
    color: "#555555",
    fontSize: "12px",
    cursor: "pointer" as const,
  },
  btnDanger: {
    padding: "5px 12px",
    background: "#ffffff",
    border: "1px solid #f5c6cb",
    borderRadius: "4px",
    color: "#CC0033",
    fontSize: "11px",
    cursor: "pointer" as const,
  },
  btnWarning: {
    padding: "5px 12px",
    background: "#ffffff",
    border: "1px solid #d8d8d8",
    borderRadius: "4px",
    color: "#7a5c00",
    fontSize: "11px",
    cursor: "pointer" as const,
  },
  btnSuccess: {
    padding: "5px 12px",
    background: "#ffffff",
    border: "1px solid #c3deca",
    borderRadius: "4px",
    color: "#2d6a3f",
    fontSize: "11px",
    cursor: "pointer" as const,
  },

  // Inputs
  input: {
    padding: "7px 12px",
    background: "#f7f7f7",
    border: "1px solid #d8d8d8",
    borderRadius: "5px",
    color: "#111111",
    fontSize: "13px",
    outline: "none" as const,
  },
  select: {
    padding: "6px 10px",
    background: "#f7f7f7",
    border: "1px solid #d8d8d8",
    borderRadius: "5px",
    color: "#555555",
    fontSize: "12px",
  },

  // Badge — use statusActive, statusNeutral, statusCritical instead of this
  // for status indicators. Reserve badge() for category tags only.
  badge: (color: string, bgColor: string, borderColor: string) => ({
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "3px",
    border: `1px solid ${borderColor}`,
    color,
    background: bgColor,
    fontWeight: 400 as const,
  }),
};

// ─── Status helpers ───────────────────────────────────────────────────────────
// Use these instead of hand-coding colors per page.

const t = adminTheme;

// Security / moderation case stages
export const stageStyle = (stage: "Open" | "Investigating" | "Resolving" | "Closed") => {
  switch (stage) {
    case "Open":         return t.statusActive;
    case "Investigating":return t.statusActive;
    case "Resolving":    return t.statusNeutral;
    case "Closed":       return t.statusNeutral;
  }
};

// Urgency — only CRITICAL gets red
export const urgencyStyle = (urgency: string) => {
  if (urgency === "CRITICAL" || urgency === "TIME_SENSITIVE") return t.statusCritical;
  return t.statusNeutral;
};

// Generic status → 3-bucket mapping
export const statusStyle = (status: string) => {
  const critical = ["ESCALATED", "REOPENED", "CRITICAL", "URGENT"];
  const neutral  = ["CLOSED", "RESOLVED", "DISMISSED", "INACTIVE", "SOLD", "DELETED"];
  if (critical.includes(status)) return t.statusCritical;
  if (neutral.includes(status))  return t.statusNeutral;
  return t.statusActive;
};