"use client";

import * as React from "react";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  // Default theme; can be customized. Ensures stable SSR.
  components: {
    MuiCssBaseline: { styleOverrides: { body: {} } },
  },
});

export type ThemeRegistryProps = {
  options: { key: string; prepend?: boolean };
  children: React.ReactNode;
};

// Based on Emotion SSR + Next.js App Router:
// https://github.com/emotion-js/emotion/issues/2928#issuecomment-1319747902
// and MUI Next.js App Router guide.
export default function ThemeRegistry({ options, children }: ThemeRegistryProps) {
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
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </CacheProvider>
  );
}
