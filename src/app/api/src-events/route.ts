const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

const NETWORK_ERROR_STATUS = 200;
const FETCH_TIMEOUT_MS = 8000;

type BackendEventItem = {
  uid?: string;
  title?: string;
  description?: string | null;
  location?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  url?: string | null;
  imageUrl?: string | null;
  isAllDay?: boolean;
  categories?: string[] | null;
};

type BackendEventsResponse = {
  data?: BackendEventItem[];
};

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

export async function GET(): Promise<Response> {
  try {
    const json = await fetchJson<BackendEventsResponse>(`${BACKEND_URL}/api/v1/src/events`);
    const items = Array.isArray(json.data) ? json.data : [];

    const events = items.map((e) => ({
      uid: e.uid ?? "",
      summary: e.title ?? "",
      description: e.description ?? "",
      location: e.location ?? "",
      dtstart: e.startTime ?? null,
      dtend: e.endTime ?? null,
      url: e.url ?? "",
      imageUrl: e.imageUrl ?? null,
      allDay: e.isAllDay ?? false,
      categories: Array.isArray(e.categories) ? e.categories : [],
    }));

    return jsonResponse(events, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[src-events] backend unavailable, returning empty events:", err);

    return jsonResponse([], {
      status: NETWORK_ERROR_STATUS,
      headers: {
        "Cache-Control": "no-store",
        "X-SRC-Backend-Status": "unavailable",
      },
    });
  }
}
