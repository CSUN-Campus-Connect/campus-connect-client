import type { AnimatedBg } from "@/components/messages/MessagesView/backgrounds";

export const MESSAGE_CHAT_PREFS_KEY = "cc_message_chat_prefs_v1";
export const MESSAGE_PREFS_CHANGED_EVENT = "cc-message-chat-prefs-changed";

export type MessageChatPreferences = {
  blockedUserIds: string[];
  backgroundByThreadId: Record<string, number | null>;
  animatedBackgroundByThreadId: Record<string, AnimatedBg | null>;
  customBackgroundByThreadId: Record<string, string>;
};

const defaultPrefs: MessageChatPreferences = {
  blockedUserIds: [],
  backgroundByThreadId: {},
  animatedBackgroundByThreadId: {},
  customBackgroundByThreadId: {},
};

function parseAnimatedBg(raw: unknown): AnimatedBg | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== "object" || !("type" in raw)) return null;
  const t = (raw as { type: string }).type;
  if (t === "grainient" && "color1" in raw && "color2" in raw && "color3" in raw) {
    const o = raw as { color1: string; color2: string; color3: string };
    return { type: "grainient", color1: o.color1, color2: o.color2, color3: o.color3 };
  }
  if (t === "gridscan") return { type: "gridscan" };
  if (t === "lightning" && "color" in raw) {
    return { type: "lightning", color: String((raw as { color: string }).color) };
  }
  if (t === "particles" && "colors" in raw && Array.isArray((raw as { colors: unknown }).colors)) {
    const colors = (raw as { colors: string[] }).colors.filter((c) => typeof c === "string");
    return { type: "particles", colors: colors.length ? colors : ["#ffffff", "#c7d2fe", "#a78bfa"] };
  }
  return null;
}

export function loadMessageChatPreferences(): MessageChatPreferences {
  if (typeof window === "undefined") return { ...defaultPrefs };
  try {
    const raw = localStorage.getItem(MESSAGE_CHAT_PREFS_KEY);
    if (!raw) return { ...defaultPrefs };
    const data = JSON.parse(raw) as Partial<MessageChatPreferences>;
    const blockedUserIds = Array.isArray(data.blockedUserIds)
      ? data.blockedUserIds.filter((x): x is string => typeof x === "string")
      : [];
    const backgroundByThreadId: Record<string, number | null> = {};
    if (data.backgroundByThreadId && typeof data.backgroundByThreadId === "object") {
      for (const [k, v] of Object.entries(data.backgroundByThreadId)) {
        if (v === null) backgroundByThreadId[k] = null;
        else if (typeof v === "number") backgroundByThreadId[k] = v;
      }
    }
    const animatedBackgroundByThreadId: Record<string, AnimatedBg | null> = {};
    if (data.animatedBackgroundByThreadId && typeof data.animatedBackgroundByThreadId === "object") {
      for (const [k, v] of Object.entries(data.animatedBackgroundByThreadId)) {
        animatedBackgroundByThreadId[k] = parseAnimatedBg(v);
      }
    }
    const customBackgroundByThreadId: Record<string, string> = {};
    if (data.customBackgroundByThreadId && typeof data.customBackgroundByThreadId === "object") {
      for (const [k, v] of Object.entries(data.customBackgroundByThreadId)) {
        if (typeof v === "string") customBackgroundByThreadId[k] = v;
      }
    }
    return {
      blockedUserIds,
      backgroundByThreadId,
      animatedBackgroundByThreadId,
      customBackgroundByThreadId,
    };
  } catch {
    return { ...defaultPrefs };
  }
}

export function saveMessageChatPreferences(prefs: MessageChatPreferences): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MESSAGE_CHAT_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* quota / private mode */
  }
}

export function notifyMessageChatPreferencesChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(MESSAGE_PREFS_CHANGED_EVENT));
}

/** Stable JSON for deduping saves / sync listeners (avoids feedback loops). */
export function serializeMessageChatPreferences(p: MessageChatPreferences): string {
  return JSON.stringify({
    blockedUserIds: [...p.blockedUserIds].sort(),
    backgroundByThreadId: p.backgroundByThreadId,
    animatedBackgroundByThreadId: p.animatedBackgroundByThreadId,
    customBackgroundByThreadId: p.customBackgroundByThreadId,
  });
}
