"use client";

import * as React from "react";
import { chatbotDisclaimerLine, chatbotGreeting } from "@/lib/chatbotI18n";
import type { SiteLangCode } from "@/lib/siteLanguage";
import { getStoredSiteLang } from "@/lib/siteLanguage";
import { EmailAgentButton } from "./EmailAgentButton";
import GlassSurface from "./GlassSurface";

type ChatRole = "user" | "assistant";
type ChatItem = { role: ChatRole; content: string };
const MAX_MESSAGE_CHARS = 2000;
const PANEL_W = 360;
const PANEL_H = 520;
const BUTTON_W = 140;
const BUTTON_H = 56;
const MARGIN = 20;
const RED = "#800020";

function supportsBackdropFilter(): boolean {
  if (typeof window === "undefined" || typeof CSS === "undefined" || !CSS.supports) return false;
  return CSS.supports("backdrop-filter", "blur(10px)") || CSS.supports("-webkit-backdrop-filter", "blur(10px)");
}

export function CsunChatbotWidget() {
  const [open, setOpen] = React.useState(false);
  const [fullScreen, setFullScreen] = React.useState(false);
  const [position, setPosition] = React.useState<{ left: number; top: number } | null>(null);
  const [fluidGlassSupported, setFluidGlassSupported] = React.useState(true);
  const [uiLang, setUiLang] = React.useState<SiteLangCode>("en");
  const [items, setItems] = React.useState<ChatItem[]>([{ role: "assistant", content: chatbotGreeting("en") }]);
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const dragRef = React.useRef<{ startX: number; startY: number; startLeft: number; startTop: number } | null>(null);
  const didDragRef = React.useRef(false);
  const composingRef = React.useRef(false);

  React.useEffect(() => setFluidGlassSupported(supportsBackdropFilter()), []);
  React.useEffect(() => {
    const lang = getStoredSiteLang();
    setUiLang(lang);
    setItems([{ role: "assistant", content: chatbotGreeting(lang) }]);
  }, []);
  React.useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [open, items, loading]);

  const handleDragStart = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (fullScreen) return;
      didDragRef.current = false;
      const w = typeof window === "undefined" ? 0 : window.innerWidth;
      const h = typeof window === "undefined" ? 0 : window.innerHeight;
      const startLeft = position?.left ?? Math.max(0, w - (open ? PANEL_W : BUTTON_W) - MARGIN);
      const startTop = position?.top ?? Math.max(0, h - (open ? PANEL_H : BUTTON_H) - MARGIN);
      dragRef.current = { startX: e.clientX, startY: e.clientY, startLeft, startTop };
      const onMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        didDragRef.current = true;
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        const w = typeof window === "undefined" ? 0 : window.innerWidth;
        const h = typeof window === "undefined" ? 0 : window.innerHeight;
        const width = open ? PANEL_W : BUTTON_W;
        const height = open ? PANEL_H : BUTTON_H;
        setPosition({
          left: Math.min(Math.max(0, w - width - MARGIN), Math.max(0, dragRef.current.startLeft + dx)),
          top: Math.min(Math.max(0, h - height - MARGIN), Math.max(0, dragRef.current.startTop + dy)),
        });
      };
      const onUp = () => {
        if (!dragRef.current) return;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        dragRef.current = null;
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [fullScreen, open, position?.left, position?.top]
  );

  async function send() {
    const text = message.trim();
    if (!text || loading) return;
    if (text.length > MAX_MESSAGE_CHARS) {
      setError(`Please keep your message under ${MAX_MESSAGE_CHARS} characters.`);
      return;
    }
    setError(null);
    setLoading(true);
    setMessage("");
    setItems((prev) => [...prev, { role: "user", content: text }]);
    try {
      const lang = getStoredSiteLang();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: text,
          language: lang,
          history: items.map((i) => ({ role: i.role, content: i.content })),
        }),
      });
      const data = (await res.json().catch(() => null)) as any;
      if (!res.ok || !data?.reply) throw new Error(typeof data?.error === "string" ? data.error : "Something went wrong.");
      setItems((prev) => [...prev, { role: "assistant", content: String(data.reply) }]);
    } catch (e: any) {
      setError(String(e?.message ?? "Request failed."));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (!fullScreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullScreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullScreen]);

  React.useEffect(() => {
    if (!fullScreen || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fullScreen]);

  const clampedPosition = React.useMemo(() => {
    if (position === null || typeof window === "undefined") return null;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const width = open ? PANEL_W : BUTTON_W;
    const height = open ? PANEL_H : BUTTON_H;
    return {
      left: Math.min(Math.max(0, w - width - MARGIN), Math.max(0, position.left)),
      top: Math.min(Math.max(0, h - height - MARGIN), Math.max(0, position.top)),
    };
  }, [position, open]);

  return (
    <div
      className="notranslate"
      translate="no"
      style={{
        position: "fixed",
        ...(fullScreen
          ? { left: 0, top: 0, width: "100dvw", height: "100dvh" }
          : clampedPosition === null
            ? { right: MARGIN, bottom: MARGIN }
            : { left: clampedPosition.left, top: clampedPosition.top }),
        zIndex: 2147483647,
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
        display: "flex",
        alignItems: fullScreen ? "stretch" : undefined,
        justifyContent: fullScreen ? "stretch" : undefined,
      }}
    >
      {!open && (
        <div
          role="button"
          tabIndex={0}
          onMouseDown={(e) => {
            if (e.button === 0) handleDragStart(e);
          }}
          onClick={() => {
            if (didDragRef.current) {
              didDragRef.current = false;
              return;
            }
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen(true);
            }
          }}
          style={{ cursor: "grab", flexShrink: 0 }}
          title="Drag to move · Click to open"
          aria-label="Need Help? Open chatbot"
        >
          {fluidGlassSupported ? (
            <GlassSurface
              width={BUTTON_W}
              height={BUTTON_H}
              borderRadius={12}
              brightness={50}
              opacity={0.93}
              blur={11}
              displace={0.5}
              distortionScale={-180}
              redOffset={0}
              greenOffset={10}
              blueOffset={20}
              mixBlendMode="screen"
              className="chatbot-trigger-glass"
              style={{ border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}
            >
              <span style={{ fontWeight: 900, color: "rgba(0,0,0,0.85)", fontSize: 14, padding: "0 8px", textAlign: "center" }}>Need Help?</span>
            </GlassSurface>
          ) : (
            <div
              style={{
                width: BUTTON_W,
                height: BUTTON_H,
                borderRadius: 12,
                background: RED,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 14,
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              Need Help?
            </div>
          )}
        </div>
      )}
      {open && (
        <div
          className="notranslate"
          translate="no"
          style={{
            width: fullScreen ? "100%" : PANEL_W,
            height: fullScreen ? "100%" : PANEL_H,
            maxWidth: fullScreen ? "100%" : undefined,
            maxHeight: fullScreen ? "100%" : undefined,
            minHeight: fullScreen ? 0 : undefined,
            background: "white",
            borderRadius: fullScreen ? 0 : 12,
            border: "1px solid rgba(0,0,0,0.12)",
            boxShadow: fullScreen ? "0 24px 60px rgba(0,0,0,0.35)" : "0 18px 50px rgba(0,0,0,0.28)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            onMouseDown={(e) => {
              if (e.button === 0 && !fullScreen) handleDragStart(e);
            }}
            style={{
              padding: "12px 12px",
              background: RED,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              cursor: fullScreen ? "default" : "grab",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: 14, lineHeight: 1.1 }}>CSUN Help</div>
              <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>{chatbotDisclaimerLine(uiLang)}</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setFullScreen((v) => !v);
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(255,255,255,0.12)",
                  color: "white",
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
                aria-label={fullScreen ? "Exit full screen" : "Full screen"}
                title={fullScreen ? "Exit full screen" : "Full screen"}
              >
                {fullScreen ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="4 14 10 14 10 20" />
                    <polyline points="20 10 14 10 14 4" />
                    <line x1="14" y1="10" x2="21" y2="3" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  setFullScreen(false);
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(255,255,255,0.12)",
                  color: "white",
                  fontWeight: 900,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>
          <div
            ref={listRef}
            style={{ flex: 1, padding: 12, overflowY: "auto", background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)" }}
          >
            {items.map((it, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: it.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    whiteSpace: "pre-line",
                    background: it.role === "user" ? RED : "white",
                    color: it.role === "user" ? "white" : "rgba(0,0,0,0.86)",
                    border: it.role === "user" ? "none" : "1px solid rgba(0,0,0,0.10)",
                  }}
                >
                  {it.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "white",
                    color: "rgba(0,0,0,0.7)",
                    border: "1px solid rgba(0,0,0,0.10)",
                  }}
                >
                  Typing…
                </div>
              </div>
            )}
          </div>
          <div
            className="notranslate"
            translate="no"
            style={{
              padding: 12,
              paddingBottom: "max(12px, env(safe-area-inset-bottom, 0px))",
              borderTop: "1px solid rgba(0,0,0,0.08)",
              background: "white",
              flexShrink: 0,
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {error && (
              <div
                style={{
                  marginBottom: 10,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(220,38,38,0.35)",
                  background: "rgba(220,38,38,0.06)",
                  color: "rgba(153,27,27,0.95)",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {error}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "rgba(0,0,0,0.65)" }}>Email Agent instead:</span>
              <EmailAgentButton label="Open email" />
            </div>
            <form
              style={{ display: "flex", gap: 8 }}
              onSubmit={(e) => {
                e.preventDefault();
                if (composingRef.current) return;
                void send();
              }}
            >
              <input
                id="cc-csun-chatbot-message"
                name="cc_chatbot_message"
                type="text"
                enterKeyHint="send"
                autoComplete="off"
                autoCorrect="off"
                spellCheck
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask a CSUN question…"
                disabled={loading}
                onCompositionStart={() => {
                  composingRef.current = true;
                }}
                onCompositionEnd={() => {
                  composingRef.current = false;
                }}
                className="notranslate"
                translate="no"
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: 40,
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.15)",
                  padding: "0 10px",
                  outline: "none",
                  fontSize: 16,
                }}
              />
              <button
                type="submit"
                disabled={loading || !message.trim()}
                style={{
                  width: 88,
                  height: 40,
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: loading || !message.trim() ? "rgba(0,0,0,0.08)" : RED,
                  color: loading || !message.trim() ? "rgba(0,0,0,0.35)" : "white",
                  fontWeight: 900,
                  cursor: loading || !message.trim() ? "not-allowed" : "pointer",
                }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
