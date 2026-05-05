"use client";

import * as React from "react";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useSiteAppearance } from "@/components/SiteAppearanceProvider";

const brandRed = "#B11226";

function useMuiTheme() {
  const { theme: mode } = useSiteAppearance();
  return React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode === "dark" ? "dark" : "light",
          primary: { main: brandRed },
          ...(mode === "dark"
            ? {
                background: { default: "#12141a", paper: "#1c1f28" },
                divider: "rgba(255,255,255,0.12)",
              }
            : {
                background: { default: "#f8fafc", paper: "#ffffff" },
              }),
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: mode === "dark" ? "#12141a" : undefined,
              },
            },
          },
        },
      }),
    [mode]
  );
}

export type ThemeRegistryProps = {
  options: { key: string; prepend?: boolean };
  children: React.ReactNode;
};

// Based on Emotion SSR + Next.js App Router:
// https://github.com/emotion-js/emotion/issues/2928#issuecomment-1319747902
// and MUI Next.js App Router guide.
export default function ThemeRegistry({ options, children }: ThemeRegistryProps) {
  const muiTheme = useMuiTheme();

  const [{ cache, flush }] = React.useState(() => {
    const cache = createCache(options);
    cache.compat = true;
    const prevInsert = cache.insert;
    const inserted: string[] = [];
    cache.insert = (...args: unknown[]) => {
      const serialized = args[1] as { name: string } | undefined;
      if (serialized && typeof serialized === "object" && "name" in serialized && cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return (prevInsert as (...a: unknown[]) => unknown).apply(cache, args);
    };
    const flush = () => {
      const prevInserted = inserted.slice();
      inserted.length = 0;
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;
    let styles = "";
    for (const name of names) {
      styles += cache.inserted[name] ?? "";
    }
    const content = options.prepend ? `@layer emotion {${styles}}` : styles;
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
