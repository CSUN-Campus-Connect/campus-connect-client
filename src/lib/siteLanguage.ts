export const SITE_LANG_STORAGE_KEY = "cc_site_lang_v1";

export type SiteLangCode = (typeof SITE_LANGUAGES)[number]["code"];

export const SITE_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ja", label: "Japanese" },
  { code: "zh-CN", label: "Chinese (Simplified)" },
  { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" },
  { code: "pt", label: "Portuguese" },
  { code: "ko", label: "Korean" },
  { code: "ru", label: "Russian" },
  { code: "hy", label: "Armenian" },
] as const;

export function getStoredSiteLang(): SiteLangCode {
  if (typeof window === "undefined") return "en";
  try {
    const raw = localStorage.getItem(SITE_LANG_STORAGE_KEY);
    if (raw && SITE_LANGUAGES.some((l) => l.code === raw)) {
      return raw as SiteLangCode;
    }
  } catch {
    /* ignore */
  }
  return "en";
}

export function setStoredSiteLang(code: SiteLangCode) {
  try {
    localStorage.setItem(SITE_LANG_STORAGE_KEY, code);
  } catch {
    /* ignore */
  }
}

export function setGoogtransCookie(lang: SiteLangCode): void {
  if (typeof window === "undefined") return;
  const path = "/";
  const maxAge = 60 * 60 * 24 * 365;
  if (lang === "en") {
    const expire = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = `googtrans=;${expire};path=${path}`;
    document.cookie = `googtrans=;${expire};path=${path};domain=${window.location.hostname}`;
  } else {
    document.cookie = `googtrans=/en/${lang};path=${path};max-age=${maxAge};SameSite=Lax`;
  }
}

export function applySiteLanguage(code: SiteLangCode): void {
  if (typeof window === "undefined") return;
  setStoredSiteLang(code);
  setGoogtransCookie(code);
}

export function syncGoogtransCookieFromStorage(): void {
  if (typeof window === "undefined") return;
  setGoogtransCookie(getStoredSiteLang());
}

function triggerGoogleComboChange(lang: SiteLangCode): void {
  let tries = 0;
  const id = window.setInterval(() => {
    tries += 1;
    const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (combo) {
      if (lang === "en") {
        const first = combo.options[0];
        if (first) {
          combo.selectedIndex = 0;
          combo.dispatchEvent(new Event("change", { bubbles: true }));
        }
      } else {
        const opt = Array.from(combo.options).find((o) => {
          const v = o.value;
          return v === lang || v.endsWith(`/${lang}`) || v.split("/").pop() === lang;
        });
        combo.value = opt ? opt.value : lang;
        combo.dispatchEvent(new Event("change", { bubbles: true }));
      }
      window.clearInterval(id);
      return;
    }
    if (tries >= 120) window.clearInterval(id);
  }, 100);
}

export function reapplyGoogleTranslateFromStorage(): void {
  if (typeof window === "undefined") return;
  syncGoogtransCookieFromStorage();
  const lang = getStoredSiteLang();
  triggerGoogleComboChange(lang);
}

export function labelForSiteLang(code: SiteLangCode): string {
  return SITE_LANGUAGES.find((l) => l.code === code)?.label ?? code;
}
