// ============================================================================
// MARKETPLACE SHARED TYPE DEFINITIONS
// Used across all marketplace components and pages
// ============================================================================

export interface Seller {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
}

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number | null;
  originalPrice: number | null;
  images: string[];
  condition: string;
  category: string;
  location: string;
  listingType: 'sale' | 'rent' | 'free';
  meetupLocation?: string;
  rentalPrice: number | null;
  rentalDurationDays: number | null;
  views: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  seller: Seller;
  _count?: { favoritedBy: number };
}

export type SortOption = 'recent' | 'price-low' | 'price-high' | 'popular';
export type CategoryFilter = 'all' | 'textbooks' | 'electronics' | 'furniture' | 'clothing' | 'accessories' | 'other';

export interface FormImageEntry {
  id: string;           // client-only UUID for stable key
  mode: 'url' | 'file';
  url: string;          // final URL (either typed or from file upload)
  file: File | null;    // only set when mode === 'file'
  preview: string;      // object URL preview (blob:) or the typed URL
  uploading: boolean;
  error: string | null;
}

export interface ListingFormData {
  title: string;
  description: string;
  price: string;
  originalPrice: string;
  category: string;
  condition: string;
  location: string;
  listingType: 'sale' | 'rent' | 'free';
  meetupLocation?: string;
  rentalPrice?: string;
  rentalDurationDays?: string;
  images: FormImageEntry[];
}
