export const APPEARANCE_STORAGE_KEY = "cc_appearance_v1";

export type ThemeMode = "light" | "dark";
export type TextSize = "small" | "medium" | "large" | "extra-large";

export type AppearanceSettings = {
  theme: ThemeMode;
  textSize: TextSize;
};

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: "light",
  textSize: "medium",
};

const TEXT_SIZES: TextSize[] = ["small", "medium", "large", "extra-large"];

export function readAppearanceFromStorage(): AppearanceSettings {
  if (typeof window === "undefined") return DEFAULT_APPEARANCE;
  try {
    const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (!raw) return DEFAULT_APPEARANCE;
    const data = JSON.parse(raw) as Partial<AppearanceSettings>;
    const theme: ThemeMode = data.theme === "dark" ? "dark" : "light";
    const textSize = TEXT_SIZES.includes(data.textSize as TextSize)
      ? (data.textSize as TextSize)
      : DEFAULT_APPEARANCE.textSize;
    return { theme, textSize };
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

export function writeAppearanceToStorage(settings: AppearanceSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* private mode / quota */
  }
}

/** Sync theme + text size to <html> for global CSS, Bootstrap, and native UI. */
export function applyAppearanceToDocument(settings: AppearanceSettings): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = settings.theme;
  root.dataset.textSize = settings.textSize;
  root.setAttribute("data-bs-theme", settings.theme === "dark" ? "dark" : "light");
  root.style.colorScheme = settings.theme === "dark" ? "dark" : "light";
}
