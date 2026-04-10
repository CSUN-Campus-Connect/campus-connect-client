"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  APPEARANCE_STORAGE_KEY,
  DEFAULT_APPEARANCE,
  type AppearanceSettings,
  type TextSize,
  type ThemeMode,
  applyAppearanceToDocument,
  readAppearanceFromStorage,
  writeAppearanceToStorage,
} from "@/lib/siteAppearance";

type SiteAppearanceContextValue = {
  theme: ThemeMode;
  textSize: TextSize;
  setTheme: (theme: ThemeMode) => void;
  setTextSize: (textSize: TextSize) => void;
};

const SiteAppearanceContext = createContext<SiteAppearanceContextValue | null>(null);

export function SiteAppearanceProvider({ children }: { children: React.ReactNode }) {
  const [appearance, setAppearance] = useState<AppearanceSettings>(DEFAULT_APPEARANCE);

  useLayoutEffect(() => {
    const next = readAppearanceFromStorage();
    setAppearance(next);
    applyAppearanceToDocument(next);
  }, []);

  useLayoutEffect(() => {
    applyAppearanceToDocument(appearance);
    writeAppearanceToStorage(appearance);
  }, [appearance]);

  useLayoutEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== APPEARANCE_STORAGE_KEY) return;
      setAppearance(readAppearanceFromStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = useCallback((theme: ThemeMode) => {
    setAppearance((prev) => ({ ...prev, theme }));
  }, []);

  const setTextSize = useCallback((textSize: TextSize) => {
    setAppearance((prev) => ({ ...prev, textSize }));
  }, []);

  const value = useMemo<SiteAppearanceContextValue>(
    () => ({
      theme: appearance.theme,
      textSize: appearance.textSize,
      setTheme,
      setTextSize,
    }),
    [appearance.theme, appearance.textSize, setTheme, setTextSize]
  );

  return (
    <SiteAppearanceContext.Provider value={value}>{children}</SiteAppearanceContext.Provider>
  );
}

export function useSiteAppearance(): SiteAppearanceContextValue {
  const ctx = useContext(SiteAppearanceContext);
  if (!ctx) {
    throw new Error("useSiteAppearance must be used within SiteAppearanceProvider");
  }
  return ctx;
}
