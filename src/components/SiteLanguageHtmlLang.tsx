"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getStoredSiteLang } from "@/lib/siteLanguage";

export default function SiteLanguageHtmlLang() {
  const pathname = usePathname();

  useEffect(() => {
    const lang = getStoredSiteLang();
    document.documentElement.lang = lang === "en" ? "en" : lang;
  }, [pathname]);

  return null;
}
