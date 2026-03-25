'use client';

import { useMemo } from 'react';
import type { EventItem } from '../types';

/**
 * useEventRanking
 *
 * Ranks and scores events based on:
 * 1. Engagement metrics (registered ÷ capacity, trending status)
 * 2. Proximity to current date (urgency)
 * 3. Event popularity (featured status)
 *
 * Returns events sorted by composite score (engagement + urgency + popularity weighting).
 */

export function useEventRanking(events: EventItem[]) {
  const rankedEvents = useMemo(() => {
    const now = new Date();

    return [...events]
      .map((ev) => {
        // Engagement score: capacity utilization + popularity
        const capacityRatio = ev.capacity > 0 ? ev.registered / ev.capacity : 0;
        const engagementScore =
          capacityRatio * 40 +
          (ev.trending ? 30 : 0) +
          (ev.featured ? 20 : 0) +
          (ev.viewCount ?? 0) * 0.01;

        // Urgency score: how soon the event is
        const eventDate = new Date(ev.startISO);
        const daysUntil = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        const urgencyScore = Math.max(0, 100 - daysUntil * 2); // Decreases as date is further away

        // Popularity modifier
        const popularityBoost = ev.featured ? 15 : 0;

        const finalScore = engagementScore + urgencyScore * 0.4 + popularityBoost;

        return {
          ...ev,
          engagementScore: Math.round(engagementScore),
          urgencyScore: Math.round(urgencyScore),
          _sortScore: finalScore,
        };
      })
      .sort((a, b) => b._sortScore - a._sortScore)
      .map(({ _sortScore, ...ev }) => ev);
  }, [events]);

  return { rankedEvents };
}
