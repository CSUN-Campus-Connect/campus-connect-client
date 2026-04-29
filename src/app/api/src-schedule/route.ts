// src/app/api/src-schedule/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

const CATEGORY_MAP: Record<string, string> = {
  "Aquatics":           "aquatics",
  "Group Exercise":     "cardio",
  "Boxing":             "hiit",
  "Intramural":         "cardio",
  "Outdoor Adventures": "cardio",
  "Special Event":      "cardio",
  "Other":              "cardio",
};

const DAY_INDEX: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
};

export async function GET(req: NextRequest) {
  try {
    const week = req.nextUrl.searchParams.get("week") ?? "";
    const day  = req.nextUrl.searchParams.get("day")  ?? "";

    const params = new URLSearchParams();
    if (week) params.set("week", week);
    if (day)  params.set("day", day);

    const res = await fetch(
      `${BACKEND_URL}/api/v1/src/schedule?${params}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      console.error("[src-schedule] Backend returned", res.status);
      return NextResponse.json([], { status: res.status });
    }

    const json = await res.json();

    // Map SRCScheduleClass (backend) → WeeklyClass (WeeklySchedule.tsx)
    const classes = (json.data ?? []).map((c: any) => ({
      id:         c.id,
      name:       c.title,
      instructor: c.instructor ?? "",
      location:   c.location ?? "",
      dayOfWeek:  DAY_INDEX[c.day] ?? 0,
      startTime:  c.startTime,
      endTime:    c.endTime,
      category:   CATEGORY_MAP[c.category] ?? "cardio",
      spots:      c.spots ?? undefined,
      spotsLeft:  c.spots ?? undefined,
    }));

    return NextResponse.json(classes);
  } catch (err) {
    console.error("[src-schedule] error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
