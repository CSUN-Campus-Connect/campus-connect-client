import type { EventItem } from '../types';

export function buildICS(event: EventItem) {
  const dtStart = event.startISO ? event.startISO.replace(/[-:]/g, '').replace('.000', '').replace(/Z$/, 'Z') : '';
  const dtEnd = event.endISO ? event.endISO.replace(/[-:]/g, '').replace('.000', '').replace(/Z$/, 'Z') : '';
  const uid = `campusconnect-${event.id}@csun.edu`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusConnect//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    dtStart ? `DTSTART:${dtStart}` : '',
    dtEnd ? `DTEND:${dtEnd}` : '',
    `UID:${uid}`,
    `SUMMARY:${event.title.replace(/\n/g, ' ')}`,
    `DESCRIPTION:${event.fullDescription.replace(/\n/g, ' ')}`,
    `LOCATION:${event.location} (${event.building})`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  return lines.join('\r\n');
}
