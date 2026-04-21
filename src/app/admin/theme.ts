// src/app/admin/theme.ts

export const adminTheme = {
  // Backgrounds
  bg: "#fafafa",
  bgCard: "#fff",
  bgAccent: "#fef2f3",
  bgHover: "#f8f8f8",
  bgInput: "#fafafa",
  bgCode: "#f5f5f5",

  // Borders
  border: "#f0f0f0",
  borderDark: "#e0e0e0",

  // Text
  textPrimary: "#1a1a1a",
  textSecondary: "#666",
  textMuted: "#999",
  textLight: "#bbb",
  textWhite: "#fff",

  // Accent (rose/red spectrum)
  accent: "#c94150",
  accentLight: "#e8848c",
  accentBg: "#fef2f3",
  accentBorder: "#f5c6cb",

  // Status
  success: "#2d8a4e",
  successBg: "#f0faf4",
  successBorder: "#c3e6cb",
  warning: "#b08800",
  warningBg: "#fef9ec",
  warningBorder: "#f0dca0",
  error: "#c94150",
  errorBg: "#fef2f3",
  errorBorder: "#f5c6cb",
  info: "#3b7dd8",
  infoBg: "#f0f5ff",
  infoBorder: "#b3d1ff",
  neutral: "#888",

  // Font
  font: "'DM Sans', 'Helvetica Neue', sans-serif",

  // Table styles
  thStyle: {
    textAlign: "left" as const,
    padding: "10px 12px",
    color: "#999",
    fontWeight: 500 as const,
    fontSize: "11px",
    letterSpacing: "0.3px",
    borderBottom: "1px solid #f0f0f0",
  },
  tdStyle: {
    padding: "10px 12px",
    borderBottom: "1px solid #f8f8f8",
  },

  // Button base styles
  btnPrimary: {
    padding: "6px 16px",
    background: "#c94150",
    border: "none",
    borderRadius: "5px",
    color: "#fff",
    fontSize: "12px",
    cursor: "pointer" as const,
  },
  btnSecondary: {
    padding: "6px 16px",
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "5px",
    color: "#666",
    fontSize: "12px",
    cursor: "pointer" as const,
  },
  btnDanger: {
    padding: "5px 12px",
    background: "#fff",
    border: "1px solid #f5c6cb",
    borderRadius: "4px",
    color: "#c94150",
    fontSize: "11px",
    cursor: "pointer" as const,
  },
  btnWarning: {
    padding: "5px 12px",
    background: "#fff",
    border: "1px solid #f0dca0",
    borderRadius: "4px",
    color: "#b08800",
    fontSize: "11px",
    cursor: "pointer" as const,
  },
  btnSuccess: {
    padding: "5px 12px",
    background: "#fff",
    border: "1px solid #c3e6cb",
    borderRadius: "4px",
    color: "#2d8a4e",
    fontSize: "11px",
    cursor: "pointer" as const,
  },

  // Input styles
  input: {
    padding: "7px 12px",
    background: "#fafafa",
    border: "1px solid #e0e0e0",
    borderRadius: "5px",
    color: "#1a1a1a",
    fontSize: "13px",
    outline: "none" as const,
  },
  select: {
    padding: "6px 10px",
    background: "#fafafa",
    border: "1px solid #e0e0e0",
    borderRadius: "5px",
    color: "#666",
    fontSize: "12px",
  },

  // Badge
  badge: (color: string, bgColor: string, borderColor: string) => ({
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "3px",
    border: `1px solid ${borderColor}`,
    color,
    background: bgColor,
  }),
};