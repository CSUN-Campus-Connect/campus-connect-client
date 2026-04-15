'use client';

// ============================================================================
// useMarketplace Hook
// Centralises all data-fetching, optimistic updates, and API calls
// so the page component stays lean and readable.
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { MarketplaceListing, SortOption, CategoryFilter } from '../types/marketplace.types';
import { API_BASE } from '../constants/marketplace.constants';

interface UseMarketplaceOptions {
  token: string | null;
  userId?: string;
}

export function useMarketplace({ token, userId }: UseMarketplaceOptions) {
  const [listings, setListings]       = useState<MarketplaceListing[]>([]);
  const [favorites, setFavorites]     = useState<Set<string>>(new Set());
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [category, setCategory]       = useState<CategoryFilter>('all');
  const [sort, setSort]               = useState<SortOption>('recent');
  const [search, setSearch]           = useState('');
  const [refresh, setRefresh]         = useState(0);

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 320);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  // Fetch listings
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (category !== 'all') params.set('category', category);
        if (debouncedSearch)    params.set('search', debouncedSearch);
        params.set('sortBy', sort);
        params.set('status', 'active');

        const { data } = await axios.get(`${API_BASE}/api/v1/marketplace?${params}`);
        setListings(data);
      } catch (err: any) {
        setError(err.response?.data?.message ?? 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [category, debouncedSearch, sort, refresh]);

  // Fetch favorites (only when authenticated)
  useEffect(() => {
    if (!token) { setFavorites(new Set()); return; }
    const fetch = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/v1/marketplace/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(new Set(data.map((l: MarketplaceListing) => l.id)));
      } catch {
        // Fail silently — favorites are non-critical
      }
    };
    fetch();
  }, [token, refresh]);

  // Toggle favourite with optimistic update
  const toggleFavorite = useCallback(async (id: string) => {
    if (!token) return false;
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    try {
      await axios.post(
        `${API_BASE}/api/v1/marketplace/${id}/favorite`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return true;
    } catch {
      // Revert
      setFavorites((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
      return false;
    }
  }, [token]);

  // Delete listing (owner only)
  const deleteListing = useCallback(async (id: string): Promise<boolean> => {
    if (!token) return false;
    try {
      await axios.delete(`${API_BASE}/api/v1/marketplace/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings((prev) => prev.filter((l) => l.id !== id));
      return true;
    } catch (err: any) {
      return false;
    }
  }, [token]);

  // Increment view count (fire-and-forget)
  const incrementView = useCallback((id: string) => {
    axios.post(`${API_BASE}/api/v1/marketplace/${id}/view`).catch(() => {});
  }, []);

  const triggerRefresh = useCallback(() => setRefresh((n) => n + 1), []);

  // Apply client-side sort (server also sorts, but keeps UI responsive)
  const sorted = [...listings].sort((a, b) => {
    if (sort === 'price-low')  return a.price - b.price;
    if (sort === 'price-high') return b.price - a.price;
    if (sort === 'popular')    return (b._count?.favoritedBy ?? 0) - (a._count?.favoritedBy ?? 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return {
    listings: sorted,
    favorites,
    loading,
    error,
    category, setCategory,
    sort, setSort,
    search, setSearch,
    toggleFavorite,
    deleteListing,
    incrementView,
    triggerRefresh,
  };
}
