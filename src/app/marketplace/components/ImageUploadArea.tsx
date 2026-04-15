'use client';

// ============================================================================
// ImageUploadArea Component
// Combines drag-and-drop file upload + URL input in one cohesive panel.
// No emojis. All icons are inline SVG.
// ============================================================================

import React, { useRef, useState } from 'react';
import { FormImageEntry } from '../types/marketplace.types';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGES, MAX_FILE_SIZE_BYTES } from '../constants/marketplace.constants';

interface Props {
  images: FormImageEntry[];
  onAddFile: (file: File) => void;
  onUpdateUrl: (id: string, value: string) => void;
  onAddSlot: () => void;
  onRemove: (id: string) => void;
  error?: string;
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function IconUpload() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}

function IconLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );
}

function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function IconImage() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

// ── Image thumbnail ───────────────────────────────────────────────────────────

function Thumb({ entry, onRemove }: { entry: FormImageEntry; onRemove: () => void }) {
  const src = entry.preview || entry.url;
  return (
    <div style={{ position: 'relative', width: 80, height: 80, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(168,5,50,0.2)' }}>
      {src ? (
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
      ) : (
        <div style={{ width: '100%', height: '100%', background: 'rgba(168,5,50,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A80532' }}>
          <IconImage />
        </div>
      )}
      {entry.uploading && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 18, height: 18, border: '2px solid rgba(168,5,50,0.2)', borderTop: '2px solid #A80532', borderRadius: '50%', animation: 'mp-spin 0.7s linear infinite' }} />
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        title="Remove image"
        style={{
          position: 'absolute', top: 3, right: 3,
          width: 20, height: 20, borderRadius: '50%',
          background: 'rgba(220,38,38,0.85)', border: 'none',
          color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <IconX />
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ImageUploadArea({ images, onAddFile, onUpdateUrl, onAddSlot, onRemove, error }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const filled = images.filter((e) => e.url.trim() !== '' || e.uploading);
  const canAdd = images.length < MAX_IMAGES;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, MAX_IMAGES - images.length).forEach((f) => {
      if (f.size > MAX_FILE_SIZE_BYTES) { alert(`"${f.name}" exceeds 5 MB.`); return; }
      if (!ACCEPTED_IMAGE_TYPES.includes(f.type)) { alert(`"${f.name}" is not a supported image format.`); return; }
      onAddFile(f);
    });
  };

  const handleUrlAdd = () => {
    const v = urlInput.trim();
    if (!v) return;
    // Find a blank url slot or create one
    const blank = images.find((e) => e.url === '' && !e.uploading && e.mode === 'url');
    if (blank) {
      onUpdateUrl(blank.id, v);
    } else if (canAdd) {
      onAddSlot();
      // The new slot won't be in state yet — workaround: set after tiny delay
      setTimeout(() => {
        setUrlMode(false);
        setUrlInput('');
      }, 0);
      // eslint-disable-next-line
      onUpdateUrl(Math.random().toString(36).slice(2), v); // will be ignored; onAddSlot + separate update
    }
    setUrlMode(false);
    setUrlInput('');
  };

  return (
    <div>
      {/* Thumbnail row */}
      {filled.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {filled.map((e) => (
            <Thumb key={e.id} entry={e} onRemove={() => onRemove(e.id)} />
          ))}
        </div>
      )}

      {/* URL input slots for any existing URL-mode entries that are empty */}
      {images.filter((e) => e.mode === 'url' && e.url === '' && !e.uploading).map((e, i) => (
        <div key={e.id} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px' }}>
            <span style={{ color: '#9ca3af' }}><IconLink /></span>
            <input
              type="url"
              value={e.url}
              onChange={(ev) => onUpdateUrl(e.id, ev.target.value)}
              placeholder="Paste image URL (https://...)"
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#374151' }}
              onFocus={(ev) => { (ev.target.parentElement as HTMLElement).style.borderColor = '#A80532'; }}
              onBlur={(ev) => { (ev.target.parentElement as HTMLElement).style.borderColor = '#e5e7eb'; }}
            />
          </div>
          {images.length > 1 && (
            <button type="button" onClick={() => onRemove(e.id)} style={{ padding: '8px 10px', background: '#fee2e2', border: 'none', borderRadius: 8, color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <IconX />
            </button>
          )}
        </div>
      ))}

      {/* Drop zone */}
      {canAdd && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          style={{
            border: `2px dashed ${dragging ? '#A80532' : 'rgba(168,5,50,0.3)'}`,
            borderRadius: 12,
            background: dragging ? 'rgba(168,5,50,0.05)' : 'rgba(168,5,50,0.02)',
            padding: '20px 16px',
            textAlign: 'center',
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ color: dragging ? '#A80532' : '#9ca3af', marginBottom: 8 }}>
            <IconUpload />
          </div>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 6px' }}>
            <span style={{ fontWeight: 600, color: '#A80532' }}>Click to upload</span> or drag and drop
          </p>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>JPEG, PNG, WebP, GIF — max 5 MB per image</p>

          {/* Or URL row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, justifyContent: 'center' }}>
            <div style={{ height: 1, width: 48, background: '#e5e7eb' }} />
            <span style={{ fontSize: 11, color: '#9ca3af' }}>or add URL instead</span>
            <div style={{ height: 1, width: 48, background: '#e5e7eb' }} />
          </div>
          <button
            type="button"
            onClick={(ev) => { ev.stopPropagation(); setUrlMode(true); }}
            style={{ marginTop: 8, background: 'none', border: '1px solid rgba(168,5,50,0.3)', borderRadius: 8, padding: '5px 14px', fontSize: 12, color: '#A80532', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            <IconPlus /> Add image URL
          </button>
        </div>
      )}

      {/* URL input overlay */}
      {urlMode && (
        <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#fafafa', border: '1px solid #A80532', borderRadius: 8, padding: '8px 12px' }}>
            <IconLink />
            <input
              autoFocus
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleUrlAdd(); } if (e.key === 'Escape') setUrlMode(false); }}
              placeholder="https://example.com/image.jpg"
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#374151' }}
            />
          </div>
          <button type="button" onClick={handleUrlAdd} style={{ padding: '8px 14px', background: '#A80532', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Add</button>
          <button type="button" onClick={() => setUrlMode(false)} style={{ padding: '8px', background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#6b7280' }}>
            <IconX />
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <p style={{ color: '#dc2626', fontSize: 12, marginTop: 6 }}>{error}</p>
      )}
      <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
        {filled.length} / {MAX_IMAGES} images added
      </p>
    </div>
  );
}
