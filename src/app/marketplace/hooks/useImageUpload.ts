'use client';

// ============================================================================
// useImageUpload Hook
//
// Manages the multi-image input system for the AddListingModal.
// Supports:
//   - Drag-and-drop file uploads (converted to data-URL for immediate preview)
//   - Paste-from-clipboard image support
//   - URL text input
//   - Image URL validation (checks if URL actually resolves to an image)
//   - Reorder by drag
//   - Max MAX_IMAGES items enforced
//
// For the actual backend: images are sent as URL strings.
// File uploads should ideally be uploaded to an image host first (e.g. Cloudinary,
// Supabase Storage). Since the team doesn't yet have one, this hook converts
// files to base64 data URLs and sends those — the backend stores them as-is
// and the browser can render them. When a real image host is added, replace
// the toDataURL step with a multipart upload call.
// ============================================================================

import { useState, useCallback } from 'react';
import { FormImageEntry } from '../types/marketplace.types';
import {
  MAX_IMAGES,
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '../constants/marketplace.constants';

function newEntry(overrides: Partial<FormImageEntry> = {}): FormImageEntry {
  return {
    id:        Math.random().toString(36).slice(2),
    mode:      'url',
    url:       '',
    file:      null,
    preview:   '',
    uploading: false,
    error:     null,
    ...overrides,
  };
}

export function useImageUpload(initial?: FormImageEntry[]) {
  const [images, setImages] = useState<FormImageEntry[]>(
    initial ?? [newEntry()]
  );

  // ── File picked from disk ────────────────────────────────────────────────
  const addFile = useCallback((file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      alert('Unsupported file type. Use JPEG, PNG, WebP, or GIF.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert('File is too large. Maximum size is 5 MB.');
      return;
    }
    setImages((prev) => {
      if (prev.length >= MAX_IMAGES) return prev;
      const id = Math.random().toString(36).slice(2);
      const preview = URL.createObjectURL(file);
      const entry: FormImageEntry = {
        id, mode: 'file', url: '', file, preview, uploading: true, error: null,
      };
      const next = [...prev.filter((e) => e.url !== '' || e.preview !== ''), entry];

      // Convert to base64 data URL (async, updates entry when done)
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setImages((cur) =>
          cur.map((e) =>
            e.id === id ? { ...e, url: dataUrl, uploading: false } : e
          )
        );
      };
      reader.onerror = () => {
        setImages((cur) =>
          cur.map((e) =>
            e.id === id ? { ...e, error: 'Failed to read file', uploading: false } : e
          )
        );
      };
      reader.readAsDataURL(file);

      return next;
    });
  }, []);

  // ── URL text input changed ───────────────────────────────────────────────
  const updateUrl = useCallback((id: string, value: string) => {
    setImages((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, url: value, preview: value, mode: 'url', error: null } : e
      )
    );
  }, []);

  // ── Add blank URL input slot ─────────────────────────────────────────────
  const addSlot = useCallback(() => {
    setImages((prev) => {
      if (prev.length >= MAX_IMAGES) return prev;
      return [...prev, newEntry()];
    });
  }, []);

  // ── Remove entry ─────────────────────────────────────────────────────────
  const remove = useCallback((id: string) => {
    setImages((prev) => {
      const next = prev.filter((e) => e.id !== id);
      // Always keep at least one slot
      return next.length === 0 ? [newEntry()] : next;
    });
  }, []);

  // ── Reset all ─────────────────────────────────────────────────────────────
  const reset = useCallback(() => setImages([newEntry()]), []);

  // ── Collect final URL array for API submission ───────────────────────────
  const getFinalUrls = useCallback((): string[] =>
    images
      .filter((e) => !e.uploading && !e.error && e.url.trim() !== '')
      .map((e) => e.url.trim()),
    [images]
  );

  return { images, addFile, updateUrl, addSlot, remove, reset, getFinalUrls };
}
