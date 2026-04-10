import { NextResponse } from "next/server";
import { chatbotEmailAgentReply, parseSiteLang } from "@/lib/chatbotI18n";
import type { SiteLangCode } from "@/lib/siteLanguage";

export const runtime = "nodejs";

type HistoryItem = { role: "user" | "assistant"; content: string };

declare const process: {
  env: Record<string, string | undefined>;
  cwd: () => string;
};

const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY_ITEMS = 20;
const MAX_BODY_CHARS = 50_000;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 15;

type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();

const HUMAN_AGENT_TRIGGERS = [
  "human",
  "real person",
  "real people",
  "agent",
  "representative",
  "talk to someone",
  "speak to someone",
  "connect me to",
  "transfer to",
  "live agent",
  "live chat",
  "customer service",
  "staff",
  "actual person",
];

function getClientIp(req: Request): string {
  const xfwd = req.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(req: Request): { ok: true } | { ok: false; retryAfterMs: number } {
  const key = getClientIp(req);
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { ok: true };
  }
  if (bucket.count >= RATE_MAX_REQUESTS) {
    return { ok: false, retryAfterMs: Math.max(0, bucket.resetAt - now) };
  }
  bucket.count += 1;
  return { ok: true };
}

function safeString(x: unknown): string {
  return typeof x === "string" ? x : "";
}

function wantsHumanOrAgent(message: string): boolean {
  const lower = message.toLowerCase().trim();
  if (!lower) return false;
  return HUMAN_AGENT_TRIGGERS.some((phrase) => lower.includes(phrase));
}

function languageLabelForModel(code: SiteLangCode): string {
  if (code === "en") return "English";
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "language" });
    return dn.of(code.replace(/_/g, "-")) || code;
  } catch {
    return code;
  }
}

function systemInstruction(lang: SiteLangCode): string {
  const lines = [
    "You are a helpful campus assistant for general CSUN guidance.",
    "Be honest: if you are unsure, say you are unsure.",
    "Do not invent exact dates, deadlines, office hours, fees, or policies.",
    "Encourage users to verify details on official CSUN sources and with the relevant office.",
    "Keep answers concise and user-friendly.",
    "Include a short disclaimer that your answer is not official CSUN advice (phrase it naturally in the reply language).",
  ];
  if (lang !== "en") {
    const label = languageLabelForModel(lang);
    lines.push(
      "",
      `The user's chosen site language is ${label} (locale ${lang}). Write your entire response in ${label}, including the disclaimer.`
    );
  } else {
    lines.push("", "Write your entire response in English.");
  }
  lines.push(
    "",
    'If the user asks to speak to a human, agent, representative, real person, or for more help from staff, tell them to use the "Open email" link in this chat—a team member will reply within 24 hours. Say this in the same language as your other replies.'
  );
  return lines.join("\n");
}

function extractGeminiErrorMessage(json: Record<string, unknown> | null, httpStatus: number): string {
  const err =
    json && typeof json === "object" && json.error && typeof json.error === "object"
      ? (json.error as { message?: string })
      : null;
  return (
    safeString(err?.message) ||
    safeString(json && typeof json.message === "string" ? json.message : null) ||
    `Gemini request failed (HTTP ${httpStatus}).`
  );
}

async function callGemini(args: {
  apiKey: string;
  message: string;
  history: HistoryItem[];
  lang: SiteLangCode;
}): Promise<string> {
  const modelId = (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    modelId
  )}:generateContent?key=${encodeURIComponent(args.apiKey)}`;

  const contents = [
    ...args.history.map((h) => ({
      role: h.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: h.content }],
    })),
    { role: "user" as const, parts: [{ text: args.message }] },
  ];

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction(args.lang) }] },
      contents,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 512,
      },
    }),
  });

  const json = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (!res.ok) {
    throw new Error(extractGeminiErrorMessage(json, res.status));
  }

  const candidates = json && typeof json === "object" && Array.isArray(json.candidates) ? json.candidates : [];
  const first = candidates[0];
  const parts =
    first &&
    typeof first === "object" &&
    first.content &&
    typeof first.content === "object" &&
    Array.isArray((first.content as { parts?: unknown }).parts)
      ? (first.content as { parts: Array<{ text?: string }> }).parts
      : [];

  const text = parts
    .map((p) => safeString(p?.text))
    .join("")
    .trim();

  return text || "Not official CSUN advice. I'm not sure—please verify on official CSUN sources.";
}

export async function POST(req: Request) {
  const rl = checkRateLimit(req);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_CHARS) {
    return NextResponse.json({ error: "Request body too large." }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const message = safeString(body?.message).trim();
  const history = Array.isArray(body?.history) ? (body.history as unknown[]) : [];
  const lang = parseSiteLang(body?.language ?? body?.locale);

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json(
      { error: `Message too long (max ${MAX_MESSAGE_CHARS} characters).` },
      { status: 400 }
    );
  }

  if (wantsHumanOrAgent(message)) {
    return NextResponse.json({ reply: chatbotEmailAgentReply(lang) });
  }

  const parsedHistory: HistoryItem[] = history
    .slice(-MAX_HISTORY_ITEMS)
    .map((h) => {
      const item = h && typeof h === "object" && h !== null ? (h as { role?: string; content?: unknown }) : {};
      const role = item.role === "assistant" ? "assistant" : "user";
      const content = safeString(item.content).slice(0, MAX_MESSAGE_CHARS).trim();
      return { role: role as "user" | "assistant", content };
    })
    .filter((h) => h.content.length > 0);

  let apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    try {
      // @ts-expect-error dynamic import for optional env file
      const { readFile } = await import("fs/promises");
      // @ts-expect-error dynamic import for optional env file
      const { join } = await import("path");
      const chatbotEnvPath = join(process.cwd(), ".env.chatbot");
      const envRaw = await readFile(chatbotEnvPath, "utf-8");
      const line = envRaw.split(/\r?\n/).find((l) => l.startsWith("GEMINI_API_KEY="));
      if (line) apiKey = line.replace(/^GEMINI_API_KEY=/, "").trim();
    } catch {}
  }
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Server not configured. Missing GEMINI_API_KEY. Add it to .env, .env.local, or .env.chatbot in the client folder.",
      },
      { status: 500 }
    );
  }

  try {
    const reply = await callGemini({ apiKey, message, history: parsedHistory, lang });
    return NextResponse.json({ reply });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chat service error. Please try again later.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
