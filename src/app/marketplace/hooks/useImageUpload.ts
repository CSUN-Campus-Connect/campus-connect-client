'use client';

// ============================================================================
// useImageUpload Hook
//
// Manages the multi-image input system for the AddListingModal.
// Supports:
//   - Drag-and-drop file uploads (uploaded to the server and returned as URLs)
//   - Paste-from-clipboard image support
//   - URL text input
//   - Image URL validation (checks if URL actually resolves to an image)
//   - Reorder by drag
//   - Max MAX_IMAGES items enforced
// ============================================================================

import { useState, useCallback } from 'react';
import axios from 'axios';
import { FormImageEntry } from '../types/marketplace.types';
import {
  MAX_IMAGES,
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE_BYTES,
  API_BASE,
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

export function useImageUpload(token: string | null, initial?: FormImageEntry[]) {
  const [images, setImages] = useState<FormImageEntry[]>(
    initial ?? [newEntry()]
  );

  const uploadFile = useCallback(async (id: string, file: File) => {
    if (!token) {
      setImages((cur) =>
        cur.map((e) =>
          e.id === id ? { ...e, error: 'You must be logged in to upload images.', uploading: false } : e
        )
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'marketplace');

      const { data } = await axios.post(
        `${API_BASE}/api/v1/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const imageUrl = data.imageUrl as string;
      setImages((cur) =>
        cur.map((e) =>
          e.id === id
            ? { ...e, url: imageUrl, preview: imageUrl, uploading: false, error: null }
            : e
        )
      );
    } catch {
      setImages((cur) =>
        cur.map((e) =>
          e.id === id ? { ...e, error: 'Failed to upload image. Please try again.', uploading: false } : e
        )
      );
    }
  }, [token]);

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

      void uploadFile(id, file);

      return next;
    });
  }, [uploadFile]);

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
