import type { MajorHit, SkillTreeNode } from "./smartPlannerTypes";

export function normalizeCourseKey(s: string) {
  return s.trim().toUpperCase().replace(/\s+/g, "-");
}
export function parseCompletedInput(text: string): string[] {
  return text.split(/[\n,]+/g).map((s) => normalizeCourseKey(s)).filter(Boolean);
}
export function parseElectiveUnits(value?: string | number | null): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string") {
    const n = parseFloat(value);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 3;
}

export function dedupeMajors(items: MajorHit[]): MajorHit[] {
  const seenId = new Set<string>();
  const seenName = new Set<string>();
  const out: MajorHit[] = [];
  for (const m of items) {
    const id = (m.id ?? "").trim().toLowerCase();
    const name = (m.name ?? "").trim().toLowerCase();
    if (id && seenId.has(id)) continue;
    if (name && seenName.has(name)) continue;
    if (id) seenId.add(id);
    if (name) seenName.add(name);
    out.push(m);
  }
  return out;
}

// ─── Color palette ────────────────────────────────────────────────────────────

export const DEPT_COLORS: Record<string, string> = {
  COMP: "#7c3aed", MATH: "#16a34a", PHYS: "#0284c7",
  ENGR: "#d97706", BIOL: "#dc2626", CHEM: "#9333ea",
  ENGL: "#0d9488", PHIL: "#b45309", BUS:  "#ea580c",
  GE:   "#6b21a8", SCI:  "#0e7490", ELEC: "#475569",
  DEFAULT: "#6b7280",
};

export const DYNAMIC_DEPT_PALETTE = [
  "#7c3aed", "#16a34a", "#0284c7", "#d97706", "#dc2626", "#9333ea",
  "#0d9488", "#b45309", "#ea580c", "#2563eb", "#e11d48", "#0891b2",
  "#65a30d", "#c2410c", "#4f46e5", "#059669", "#ca8a04", "#db2777",
  "#14b8a6", "#8b5cf6", "#22c55e", "#f97316", "#06b6d4", "#84cc16",
] as const;

export function normalizeDeptKey(value: string | null | undefined): string {
  return (value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 6);
}

export function getDeptFromCourseKey(key: string): string {
  return normalizeDeptKey(key.replace(/-.*/, ""));
}

export function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getAutoDeptColor(dept: string): string {
  const normalized = normalizeDeptKey(dept) || "DEFAULT";
  if (DEPT_COLORS[normalized]) return DEPT_COLORS[normalized];
  const idx = hashString(normalized) % DYNAMIC_DEPT_PALETTE.length;
  return DYNAMIC_DEPT_PALETTE[idx];
}

export function buildEffectiveDeptColors(
  nodes: SkillTreeNode[] | undefined,
  overrides?: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {};
  const deptSet = new Set<string>();

  for (const key of Object.keys(DEPT_COLORS)) {
    if (key !== "DEFAULT") deptSet.add(key);
  }

  for (const node of nodes ?? []) {
    const fromKey = getDeptFromCourseKey(node.key);
    if (fromKey) deptSet.add(fromKey);
    const fromDepartment = normalizeDeptKey(node.department);
    if (fromDepartment) deptSet.add(fromDepartment);
  }

  for (const dept of Array.from(deptSet).sort()) {
    result[dept] = overrides?.[dept] ?? getAutoDeptColor(dept);
  }

  for (const [dept, color] of Object.entries(overrides ?? {})) {
    const normalized = normalizeDeptKey(dept);
    if (normalized) result[normalized] = color;
  }

  result.DEFAULT = overrides?.DEFAULT ?? DEPT_COLORS.DEFAULT;
  return result;
}

export function getDeptColor(key: string, deptColorMap?: Record<string, string>): string {
  const dept = getDeptFromCourseKey(key);
  return deptColorMap?.[dept] ?? getAutoDeptColor(dept);
}

// ─── Semester and card styling ───────────────────────────────────────────────
export type SemesterType = "Fall" | "Spring" | "Summer" | "Winter";

export type SemesterPalette = { bg: string; border: string; text: string; badge: string };

export const DEFAULT_SEMESTER_COLORS: Record<SemesterType, SemesterPalette> = {
  Fall:   { bg: "#12082e", border: "#7c3aed", text: "#c4b5fd", badge: "#7c3aed" },
  Winter: { bg: "#061828", border: "#0284c7", text: "#7dd3fc", badge: "#0284c7" },
  Spring: { bg: "#072010", border: "#16a34a", text: "#86efac", badge: "#16a34a" },
  Summer: { bg: "#201200", border: "#d97706", text: "#fcd34d", badge: "#d97706" },
};

export function getSemesterType(label: string): SemesterType | null {
  const l = label.toLowerCase();
  if (l.includes("fall")) return "Fall";
  if (l.includes("winter")) return "Winter";
  if (l.includes("spring")) return "Spring";
  if (l.includes("summer")) return "Summer";
  return null;
}

export function getSemesterPalette(
  label: string,
  semColorOverrides?: Partial<Record<SemesterType | string, { bg: string; border: string; textColor?: string; text?: string; badge?: string }>>
): SemesterPalette {
  const sem = getSemesterType(label) ?? "Fall";
  const override = semColorOverrides?.[sem] ?? semColorOverrides?.[label];
  const base = DEFAULT_SEMESTER_COLORS[sem];
  return {
    bg: override?.bg ?? base.bg,
    border: override?.border ?? base.border,
    text: override?.textColor ?? override?.text ?? base.text,
    badge: override?.border ?? override?.badge ?? base.badge,
  };
}

// Season-based palette lookup (used by buildLayout)
export function getSemesterPaletteForSeason(
  season: SemesterType,
  semColorOverrides?: Partial<Record<SemesterType | string, { bg: string; border: string; textColor?: string; text?: string }>>
): SemesterPalette {
  const override = semColorOverrides?.[season];
  const base = DEFAULT_SEMESTER_COLORS[season];
  return {
    bg: override?.bg ?? base.bg,
    border: override?.border ?? base.border,
    text: override?.textColor ?? override?.text ?? base.text,
    badge: override?.border ?? base.badge,
  };
}

export const LIGHT_SEMESTER_BG: Record<SemesterType, string> = {
  Fall: "#e8e0ff",
  Winter: "#ddf0ff",
  Spring: "#d6f5e3",
  Summer: "#fff3d6",
};

// Compute the season for a given tier index based on startTerm + which terms are included
export function getTierSeason(
  tierIndex: number,
  startTerm: SemesterType,
  includeSummer: boolean,
  includeWinter: boolean
): SemesterType {
  const pool: SemesterType[] = [];
  // Build ordered pool: Fall → Winter? → Spring → Summer?
  const base: SemesterType[] = ["Fall", "Spring"];
  if (includeWinter) base.splice(1, 0, "Winter");  // Fall → Winter → Spring
  if (includeSummer) base.push("Summer");            // … → Summer
  // Rotate so startTerm is first
  const startIdx = base.indexOf(startTerm);
  const ordered = startIdx >= 0
    ? [...base.slice(startIdx), ...base.slice(0, startIdx)]
    : base;
  return ordered[tierIndex % ordered.length];
}

// Build a human-readable label like "Year 1 Fall" from tier index + season
export function buildTierLabel(
  tierIndex: number,
  startTerm: SemesterType,
  includeSummer: boolean,
  includeWinter: boolean
): string {
  const pool: SemesterType[] = ["Fall", "Spring"];
  if (includeWinter) pool.splice(1, 0, "Winter");
  if (includeSummer) pool.push("Summer");
  const startIdx = Math.max(0, pool.indexOf(startTerm));
  const ordered = [...pool.slice(startIdx), ...pool.slice(0, startIdx)];
  const season = ordered[tierIndex % ordered.length];
  const yearNum = Math.floor(tierIndex / ordered.length) + 1;
  return `Year ${yearNum} ${season}`;
}


export function hexToRgb(hex: string): [number, number, number] | null {
  const cleaned = hex.replace("#", "").trim();
  const full = cleaned.length === 3 ? cleaned.split("").map((ch) => ch + ch).join("") : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

export function rgbaFromHex(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function darkenHex(hex: string, factor = 0.34): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb;
  return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;
}
