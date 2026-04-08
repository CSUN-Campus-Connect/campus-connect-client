'use client';

import { useMemo } from 'react';
import type { EventItem } from '../types';

/**
 * useEventRanking
 *
 * Applies a weighted engagement score to each event so that the
 * Discover feed surfaces the most relevant events first.
 *
 * Scoring formula (inspired by the Hacker News "gravity" algorithm):
 *
 *   engagementScore = (rsvpDensity * W_density)
 *                   + (viewWeight   * W_views)
 *                   - (hoursUntil   * W_urgency)
 *                   + (featuredBoost)
 *                   + (trendingBoost)
 *
 * Where:
 *   rsvpDensity  = registered / capacity          (0–1)
 *   viewWeight   = log10(viewCount + 1) / 4       (0–1 normalised)
 *   hoursUntil   = hours from now until startISO  (decay for far-future events)
 *   W_density    = 40
 *   W_views      = 20
 *   W_urgency    = 0.002 (gentle — we don't want to bury future events)
 *   featuredBoost = 15
 *   trendingBoost = 10
 *
 * Time complexity:  O(N)
 * Space complexity: O(N)
 */

interface RankingResult {
  rankedEvents: EventItem[];
}

export function useEventRanking(events: EventItem[]): RankingResult {
  const rankedEvents = useMemo(() => {
    const now = Date.now();

    const scored = events.map((ev): EventItem => {
      const rsvpDensity = ev.capacity > 0 ? ev.registered / ev.capacity : 0;

      const views = ev.viewCount ?? 0;
      const viewWeight = Math.log10(views + 1) / 4;

      const startMs = new Date(ev.startISO).getTime();
      const hoursUntil = Math.max(0, (startMs - now) / 3_600_000);

      const featuredBoost = ev.featured ? 15 : 0;
      const trendingBoost = ev.trending ? 10 : 0;

      const engagementScore =
        rsvpDensity * 40 +
        viewWeight * 20 -
        hoursUntil * 0.002 +
        featuredBoost +
        trendingBoost;

      // urgencyScore: days until event — for the timeline view
      const urgencyScore = hoursUntil / 24;

      return { ...ev, engagementScore, urgencyScore };
    });

    // Sort descending by engagement score
    return scored.sort((a, b) => (b.engagementScore ?? 0) - (a.engagementScore ?? 0));
  }, [events]);

  return { rankedEvents };
}
