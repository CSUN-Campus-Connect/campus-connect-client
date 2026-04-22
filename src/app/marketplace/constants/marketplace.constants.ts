// ============================================================================
// MARKETPLACE CONSTANTS
// Centralised so UI and validation stay in sync
// ============================================================================

export const CATEGORIES = [
  { id: 'all',         label: 'All Items',     accent: '#D22030' },
  { id: 'textbooks',   label: 'Textbooks',     accent: '#3b82f6' },
  { id: 'electronics', label: 'Electronics',   accent: '#10b981' },
  { id: 'furniture',   label: 'Furniture',     accent: '#f59e0b' },
  { id: 'clothing',    label: 'Clothing',      accent: '#8b5cf6' },
  { id: 'accessories', label: 'Accessories',   accent: '#ec4899' },
  { id: 'other',       label: 'Other',         accent: '#6b7280' },
] as const;

export const CONDITIONS: { value: string; label: string; color: string; bg: string }[] = [
  { value: 'likeNew',   label: 'Like New',  color: '#059669', bg: 'rgba(5,150,105,0.12)'  },
  { value: 'excellent', label: 'Excellent', color: '#0891b2', bg: 'rgba(8,145,178,0.12)'  },
  { value: 'good',      label: 'Good',      color: '#16a34a', bg: 'rgba(22,163,74,0.12)'  },
  { value: 'fair',      label: 'Fair',      color: '#ca8a04', bg: 'rgba(202,138,4,0.12)'  },
  { value: 'poor',      label: 'Poor',      color: '#dc2626', bg: 'rgba(220,38,38,0.12)'  },
];

export const SORT_OPTIONS = [
  { value: 'recent',     label: 'Most Recent'       },
  { value: 'price-low',  label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular',    label: 'Most Popular'       },
] as const;

export const LISTING_TYPES = [
  { value: 'sale', label: 'For Sale', color: '#0891b2' },
  { value: 'rent', label: 'For Rent', color: '#8b5cf6' },
  { value: 'free', label: 'Free / Give Away', color: '#10b981' },
] as const;

export const MEETUP_LOCATIONS = [
  'Library Front Desk',
  'SRC Entrance',
  'USU Plaza',
  'Oviatt Library',
  'Student Center',
] as const;

// Max images per listing
export const MAX_IMAGES = 8;

// Accepted image MIME types for file upload
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Max file size: 5 MB
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export function getConditionMeta(condition: string) {
  return (
    CONDITIONS.find((c) => c.value === condition) ?? {
      label: condition,
      color: '#6b7280',
      bg: 'rgba(107,114,128,0.12)',
    }
  );
}

export function getCategoryAccent(categoryId: string): string {
  return CATEGORIES.find((c) => c.id === categoryId)?.accent ?? '#D22030';
}

export function getListingTypeMeta(type: string) {
  return (
    LISTING_TYPES.find((lt) => lt.value === type) ?? {
      value: 'sale',
      label: 'For Sale',
      color: '#0891b2',
    }
  );
}
