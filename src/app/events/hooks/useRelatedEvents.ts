/**
 * useRelatedEvents — compute suggestions for an event
 *
 * Returns up to 3 related events triggered when a user registers for an event.
 * Prefers: same category > trending > same audience.
 *
 * Rationale: Since registration happens "in place" (modal doesn't close), we want
 * immediate suggestions rather than waiting for detailed comparison. Speed = UX.
 */

import { useMemo } from 'react';
import type { EventItem, RelatedEventSlot } from '../types';

interface UseRelatedEventsResult {
  slots: RelatedEventSlot[];
}

export function useRelatedEvents(
  currentEvent: EventItem | null,
  allEvents: EventItem[]
): RelatedEventSlot[] {
  return useMemo(() => {
    if (!currentEvent) return [];

    type ReasonScore = [eventId: string, event: EventItem, reason: RelatedEventSlot['reason'], score: number];

    const candidates: ReasonScore[] = allEvents
      .filter((ev) => ev.id !== currentEvent.id)
      .flatMap((ev) => {
        const scores: ReasonScore[] = [];

        // Same category (highest priority)
        if (ev.category === currentEvent.category) {
          scores.push([ev.id, ev, 'same_category', 1000]);
        }

        // Trending (medium priority)
        if (ev.trending) {
          scores.push([ev.id, ev, 'trending', 500]);
        }

        // Same audience (low priority). Match if any audience overlaps (excluding 'all')
        const currentAuds = currentEvent.audience.filter((a) => a !== 'all');
        const evAuds = ev.audience.filter((a) => a !== 'all');
        if (currentAuds.some((a) => evAuds.includes(a))) {
          scores.push([ev.id, ev, 'same_audience', 200]);
        }

        return scores;
      });

    // Group by eventId, pick best reason for each
    const bestByEvent = new Map<string, ReasonScore>();
    candidates.forEach(([eventId, event, reason, score]) => {
      const existing = bestByEvent.get(eventId);
      if (!existing || existing[3] < score) {
        bestByEvent.set(eventId, [eventId, event, reason, score]);
      }
    });

    // Sort by score descending, take top 3
    const sorted = Array.from(bestByEvent.values())
      .sort(([, , , scoreA], [, , , scoreB]) => scoreB - scoreA)
      .slice(0, 3);

    return sorted.map(([, event, reason]) => ({ event, reason }));
  }, [currentEvent, allEvents]);
}
