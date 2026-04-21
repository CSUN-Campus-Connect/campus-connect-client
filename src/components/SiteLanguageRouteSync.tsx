"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { reapplyGoogleTranslateFromStorage } from "@/lib/siteLanguage";

export default function SiteLanguageRouteSync() {
  const pathname = usePathname();

  useEffect(() => {
    reapplyGoogleTranslateFromStorage();
  }, [pathname]);

  return null;
}
