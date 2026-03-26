import { useMemo } from 'react';
import type { EventItem, RelatedEventSlot } from '../types';

/**
 * useRelatedEvents
 *
 * After a user registers for an event, this hook surfaces up to 3
 * related events they might also want to attend.
 *
 * Scoring algorithm — O(N):
 *   1. Exclude the registered event itself.
 *   2. Score each remaining event:
 *      +3 if same category (strongest affinity signal)
 *      +2 if audience arrays overlap (shared target demographic)
 *      +1 if trending (social proof)
 *      +0.5 * (engagementScore / 100) normalised boost
 *   3. Sort descending, return top 3.
 *
 * reason field explains the primary match to the UI layer.
 */
export function useRelatedEvents(
  registeredEvent: EventItem | null,
  allEvents: EventItem[],
  max = 3
): RelatedEventSlot[] {
  return useMemo(() => {
    if (!registeredEvent) return [];

    return allEvents
      .filter((ev) => ev.id !== registeredEvent.id)
      .map((ev): { ev: EventItem; score: number; reason: RelatedEventSlot['reason'] } => {
        let score = 0;
        let reason: RelatedEventSlot['reason'] = 'trending';

        const sameCategory = ev.category === registeredEvent.category;
        const audienceOverlap = ev.audience.some((a) =>
          registeredEvent.audience.includes(a)
        );

        if (sameCategory) {
          score += 3;
          reason = 'same_category';
        }
        if (audienceOverlap) {
          score += 2;
          if (!sameCategory) reason = 'same_audience';
        }
        if (ev.trending) {
          score += 1;
        }
        score += ((ev.engagementScore ?? 0) / 100) * 0.5;

        return { ev, score, reason };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, max)
      .map(({ ev, reason }) => ({ event: ev, reason }));
  }, [registeredEvent, allEvents, max]);
}
