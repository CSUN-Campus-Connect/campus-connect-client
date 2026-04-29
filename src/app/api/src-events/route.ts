// src/app/api/src-events/route.ts
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/src/events`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error("[src-events] Backend returned", res.status);
      return NextResponse.json([], { status: res.status });
    }

    const json = await res.json();

    // Map SRCEvent (backend) → CalEvent (EventsBanner.tsx)
    const events = (json.data ?? []).map((e: any) => ({
      uid:         e.uid,
      summary:     e.title,
      description: e.description ?? "",
      location:    e.location ?? "",
      dtstart:     e.startTime,
      dtend:       e.endTime,
      url:         e.url ?? "",
      imageUrl:    e.imageUrl ?? null,
      allDay:      e.isAllDay ?? false,
      categories:  e.categories ?? [],
    }));

    return NextResponse.json(events);
  } catch (err) {
    console.error("[src-events] error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
