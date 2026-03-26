import type { CategoryId, AudienceId, NavSection } from '../types';

export const CATEGORIES: { id: CategoryId; name: string; color: string }[] = [
  { id: 'all',      name: 'All Events',   color: '#D22030' },
  { id: 'academic', name: 'Academic',     color: '#3b82f6' },
  { id: 'career',   name: 'Career',       color: '#10b981' },
  { id: 'social',   name: 'Social',       color: '#f59e0b' },
  { id: 'wellness', name: 'Wellness',     color: '#8b5cf6' },
  { id: 'sports',   name: 'Sports',       color: '#ef4444' },
  { id: 'arts',     name: 'Arts & Culture', color: '#ec4899' },
  { id: 'workshop', name: 'Workshops',    color: '#06b6d4' },
];

export const AUDIENCES: { id: AudienceId; name: string }[] = [
  { id: 'all',       name: 'All Students' },
  { id: 'undergrad', name: 'Undergraduates' },
  { id: 'graduate',  name: 'Graduate' },
  { id: 'alumni',    name: 'Alumni' },
  { id: 'faculty',   name: 'Faculty & Staff' },
];

export const NAV_SECTIONS: { id: NavSection; label: string }[] = [
  { id: 'discover',  label: 'Discover' },
  { id: 'graph',     label: 'Engagement Graph' },
  { id: 'timeline',  label: 'Timeline' },
  { id: 'calendar',  label: 'Calendar' },
  { id: 'favorites', label: 'Favorites' },
];

export const CATEGORY_COLOR_MAP: Record<Exclude<CategoryId, 'all'>, string> = {
  academic: '#3b82f6',
  career:   '#10b981',
  social:   '#f59e0b',
  wellness: '#8b5cf6',
  sports:   '#ef4444',
  arts:     '#ec4899',
  workshop: '#06b6d4',
};
