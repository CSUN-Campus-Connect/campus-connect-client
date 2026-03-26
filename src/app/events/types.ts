export type AudienceId = 'all' | 'undergrad' | 'graduate' | 'alumni' | 'faculty';

export type CategoryId =
  | 'all'
  | 'academic'
  | 'career'
  | 'social'
  | 'wellness'
  | 'sports'
  | 'arts'
  | 'workshop';

export type NavSection = 'discover' | 'graph' | 'timeline' | 'calendar' | 'favorites';

export interface Category {
  id: CategoryId;
  name: string;
  color: string;
}

export interface Audience {
  id: AudienceId;
  name: string;
}

export interface NavItem {
  id: NavSection;
  label: string;
}

export interface Speaker {
  name: string;
  title: string;
  affiliation?: string;
}

export interface AgendaItem {
  time: string;
  activity: string;
}

export interface EventItem {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: Exclude<CategoryId, 'all'>;
  date: string;
  time: string;
  startISO: string;
  endISO: string;
  location: string;
  building: string;
  image: string;
  price: string;
  capacity: number;
  registered: number;
  audience: AudienceId[];
  organizer: string;
  organizerUrl?: string;
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
  // Algorithm fields
  engagementScore?: number;   // computed by useEventRanking
  urgencyScore?: number;      // computed by useEventRanking
  viewCount?: number;
  csunUrl?: string;           // Real CSUN event portal link
}

export interface RegistrationForm {
  name: string;
  email: string;
  phone: string;
}

export interface RelatedEventSlot {
  event: EventItem;
  reason: 'same_category' | 'same_audience' | 'trending';
}