import type { AudienceId, CategoryId } from '../types';

export const categories: { id: CategoryId; name: string; icon: string; color: string }[] = [
  { id: 'all', name: 'All Events', icon: '', color: '#D22030' },
  { id: 'academic', name: 'Academic', icon: '', color: '#3b82f6' },
  { id: 'career', name: 'Career & Jobs', icon: '', color: '#10b981' },
  { id: 'social', name: 'Social', icon: '', color: '#f59e0b' },
  { id: 'wellness', name: 'Wellness', icon: '', color: '#8b5cf6' },
  { id: 'sports', name: 'Sports', icon: '', color: '#ef4444' },
  { id: 'arts', name: 'Arts & Culture', icon: '', color: '#ec4899' },
  { id: 'workshop', name: 'Workshops', icon: '', color: '#06b6d4' },
];

export const audiences: { id: AudienceId; name: string }[] = [
  { id: 'all', name: 'All Students' },
  { id: 'undergrad', name: 'Undergraduates' },
  { id: 'graduate', name: 'Graduate Students' },
  { id: 'alumni', name: 'Alumni' },
];
