import type { Category, Audience, NavItem } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All Categories', color: '#D22030' },
  { id: 'academic', name: 'Academic', color: '#3B82F6' },
  { id: 'career', name: 'Career', color: '#10B981' },
  { id: 'social', name: 'Social', color: '#F59E0B' },
  { id: 'wellness', name: 'Wellness', color: '#8B5CF6' },
  { id: 'sports', name: 'Sports', color: '#EC4899' },
  { id: 'arts', name: 'Arts', color: '#14B8A6' },
  { id: 'workshop', name: 'Workshop', color: '#F97316' },
];

export const CATEGORY_COLOR_MAP: Record<string, string> = {
  academic: '#3B82F6',
  career: '#10B981',
  social: '#F59E0B',
  wellness: '#8B5CF6',
  sports: '#EC4899',
  arts: '#14B8A6',
  workshop: '#F97316',
};

export const AUDIENCES: Audience[] = [
  { id: 'all', name: 'All Students' },
  { id: 'undergrad', name: 'Undergraduates' },
  { id: 'graduate', name: 'Graduate Students' },
  { id: 'alumni', name: 'Alumni' },
  { id: 'faculty', name: 'Faculty & Staff' },
];

export const NAV_SECTIONS: NavItem[] = [
  { id: 'discover', label: 'Discover' },
  { id: 'graph', label: 'Engagement Graph' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'calendar', label: 'Calendar' },
];
