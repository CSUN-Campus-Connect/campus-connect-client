import type { EventItem } from '../types';

export function buildICS(event: EventItem): string {
  const fmt = (iso: string) =>
    iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '').replace('Z', 'Z');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusConnect//CSUN Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(event.startISO)}`,
    `DTEND:${fmt(event.endISO)}`,
    `UID:campusconnect-${event.id}@csun.edu`,
    `SUMMARY:${event.title.replace(/\n/g, ' ')}`,
    `DESCRIPTION:${event.shortDescription.replace(/\n/g, ' ')}`,
    `LOCATION:${event.location} (${event.building})`,
    `URL:${event.csunUrl ?? 'https://www.csun.edu'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}
