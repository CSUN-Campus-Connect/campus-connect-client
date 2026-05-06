const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

const NETWORK_ERROR_STATUS = 200;
const FETCH_TIMEOUT_MS = 8000;

type BackendScheduleItem = {
  id?: string;
  title?: string;
  instructor?: string | null;
  location?: string | null;
  day?: string;
  startTime?: string;
  endTime?: string;
  category?: string;
  description?: string | null;
  shortDescription?: string | null;
  registrationUrl?: string | null;
  imageUrl?: string | null;
  spots?: number | null;
  isAllDay?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  kind?: "class" | "event" | null;
};

type BackendScheduleResponse = {
  data?: BackendScheduleItem[];
};

const CATEGORY_MAP: Record<string, string> = {
  Aquatics: "aquatics",
  "Group Exercise": "cardio",
  Boxing: "hiit",
  Intramural: "sports",
  "Outdoor Adventures": "strength",
  "Special Event": "special",
  Other: "event",
};

const DAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

function inferCategory(item: BackendScheduleItem): string {
  const haystack = `${item.title ?? ""} ${item.location ?? ""} ${item.description ?? ""}`.toLowerCase();

  if (/(red cross|cpr|first aid|first-aid|aed|membership|locker|renewal|certification)/.test(haystack)) return "special";
  if (/(children'?s swim|adult swim|intermediate lessons|beginner lessons|swim lessons|aquatic|pool)/.test(haystack)) return "aquatics";
  if (/(intramural|basketball|volleyball|soccer|softball|ultimate frisbee|night hits)/.test(haystack)) return "sports";
  if (/(yoga|pilates|zumba|dance|cardio|cycle|spin|group exercise|fitness)/.test(haystack)) return "cardio";
  return CATEGORY_MAP[item.category ?? ""] ?? "event";
}

function inferDayOfWeek(item: BackendScheduleItem, week: string): number {
  if (item.day && item.day in DAY_INDEX) return DAY_INDEX[item.day];

  const exactDate = item.startDate
    ?? item.id?.match(/(20\d{2}-\d{2}-\d{2})/)?.[1]
    ?? item.registrationUrl?.match(/(20\d{2}-\d{2}-\d{2})/)?.[1]
    ?? null;

  if (exactDate) {
    const d = new Date(`${exactDate}T00:00:00Z`);
    if (!Number.isNaN(d.getTime())) return d.getUTCDay();
  }

  const haystack = `${item.id ?? ""} ${item.title ?? ""} ${item.description ?? ""}`.toLowerCase();
  for (const [dayName, index] of Object.entries(DAY_INDEX)) {
    if (haystack.includes(dayName.toLowerCase())) return index;
  }

  const weekStart = week ? new Date(`${week}T00:00:00Z`) : null;
  if (weekStart && !Number.isNaN(weekStart.getTime())) return weekStart.getUTCDay();

  return 0;
}

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return Response.json(body, init);
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}`);
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(req: Request): Promise<Response> {
  const reqUrl = new URL(req.url);
  const week = reqUrl.searchParams.get("week") ?? "";
  const day = reqUrl.searchParams.get("day") ?? "";

  const params = new URLSearchParams();
  if (week) params.set("week", week);
  if (day) params.set("day", day);

  const url = `${BACKEND_URL}/api/v1/src/schedule${params.toString() ? `?${params}` : ""}`;

  try {
    const json = await fetchJson<BackendScheduleResponse>(url);
    const items = Array.isArray(json.data) ? json.data : [];

    const scheduleItems = items.map((c) => ({
      id: c.id ?? "",
      name: c.title ?? "",
      instructor: c.instructor ?? "",
      location: c.location ?? "",
      dayOfWeek: inferDayOfWeek(c, week),
      startTime: c.startTime ?? "00:00",
      endTime: c.endTime ?? "00:00",
      category: inferCategory(c),
      spots: c.spots ?? undefined,
      spotsLeft: c.spots ?? undefined,
      imageUrl: c.imageUrl ?? null,
      description: c.description ?? "",
      shortDescription: c.shortDescription ?? c.description ?? "",
      registrationUrl: c.registrationUrl ?? "",
      isAllDay: Boolean(c.isAllDay),
      startDate: c.startDate ?? null,
      endDate: c.endDate ?? null,
      kind: c.kind ?? "class",
    }));

    return jsonResponse(scheduleItems, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[src-schedule] backend unavailable, returning empty schedule:", err);

    return jsonResponse([], {
      status: NETWORK_ERROR_STATUS,
      headers: {
        "Cache-Control": "no-store",
        "X-SRC-Backend-Status": "unavailable",
      },
    });
  }
}
