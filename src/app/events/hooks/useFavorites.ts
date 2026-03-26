/**
 * useFavorites — localStorage-backed favorites management hook
 *
 * Provides heart-save persistence across page reloads.
 * Stored as Set<eventId> in localStorage under 'csun-event-favorites'.
 */

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'csun-event-favorites';

interface UseFavoritesResult {
  favorites: Set<string>;
  isFavorite: (eventId: string) => boolean;
  toggleFavorite: (eventId: string) => void;
}

export function useFavorites(): UseFavoritesResult {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR safety
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      setFavorites(new Set(parsed));
    } catch (error) {
      console.warn('Failed to load favorites from localStorage:', error);
      setFavorites(new Set());
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage whenever favorites change
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favorites)));
  }, [favorites, isHydrated]);

  const isFavorite = (eventId: string) => favorites.has(eventId);

  const toggleFavorite = (eventId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  return { favorites, isFavorite, toggleFavorite };
}
