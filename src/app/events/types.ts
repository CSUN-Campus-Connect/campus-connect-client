export type AudienceId = 'all' | 'undergrad' | 'graduate' | 'alumni';

export type CategoryId =
  | 'all'
  | 'academic'
  | 'career'
  | 'social'
  | 'wellness'
  | 'sports'
  | 'arts'
  | 'workshop';

export type Speaker = { name: string; title: string };
export type AgendaItem = { time: string; activity: string };

export type EventItem = {
  id: number;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: Exclude<CategoryId, 'all'>;
  date: string;
  time: string;
  startISO?: string;
  endISO?: string;
  location: string;
  building: string;
  image: string;
  price: string;
  capacity: number;
  registered: number;
  audience: AudienceId[];
  organizer: string;
  contact: string;
  phone: string;
  speakers: Speaker[];
  agenda: AgendaItem[];
  tags: string[];
  hybrid: boolean;
  accessibility: string;
  parking: string;
  featured?: boolean;
  trending?: boolean;
  freebies?: string[];
};
