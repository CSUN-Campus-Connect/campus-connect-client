// =============================================================================
// components/feed/Composer.jsx
//
// Post composer -- the primary content-creation surface of the feed.
//
// Features:
//   - Expandable textarea that collapses when empty/blurred
//   - Real image upload via drag-and-drop or click-to-browse
//   - Preview grid with per-image upload progress + remove buttons
//   - Tag selection chips for categorizing posts
//   - Character counter with color-coded warning (amber < 50, red < 0)
//   - Keyboard shortcut: Cmd/Ctrl+Enter to submit
//   - Calls api.uploadImage() per file, then api.createPost() on submit
//
// Props:
//   currentUser   -- session user object (for avatar display)
//   availableTags -- string array of selectable tags (excludes 'All')
//   onPost        -- callback invoked with the new post after success
// =============================================================================

import { useState, useRef, useCallback } from 'react';
import { Avatar, Tag, Spinner, ImageIcon, CloseIcon, SendIcon } from '../ui/primitives';
import { uploadImage, createPost } from '../../api/posts';

const MAX_CHARS  = 500;
const MAX_IMAGES = 4;

export function Composer({ currentUser, availableTags = [], onPost }) {
  const [content,    setContent]    = useState('');
  const [tags,       setTags]       = useState([]);
  const [files,      setFiles]      = useState([]);   // { id, file, preview, uploading, url, error }
  const [expanded,   setExpanded]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);
  const [dragging,   setDragging]   = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef  = useRef(null);

  const charsLeft = MAX_CHARS - content.length;
  const overLimit = charsLeft < 0;
  const canPost   = content.trim().length > 0 && !overLimit && !submitting &&
                    files.every(f => !f.uploading && !f.error);

  // -- Tag toggle: adds or removes a tag from the selected set
  function toggleTag(t) {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  // -- File processing: validates, creates preview URLs, uploads in parallel
  const processFiles = useCallback(async (rawFiles) => {
    const valid = Array.from(rawFiles)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, MAX_IMAGES - files.length);

    if (!valid.length) return;

    const newEntries = valid.map(file => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
      url: null,
      error: null,
    }));

    setFiles(prev => [...prev, ...newEntries]);
    setExpanded(true);

    await Promise.all(newEntries.map(async entry => {
      try {
        const url = await uploadImage(entry.file);
        setFiles(prev => prev.map(f =>
          f.id === entry.id ? { ...f, uploading: false, url } : f
        ));
      } catch {
        setFiles(prev => prev.map(f =>
          f.id === entry.id ? { ...f, uploading: false, error: 'Upload failed' } : f
        ));
      }
    }));
  }, [files.length]);

  // -- Drag-and-drop handler
  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  }

  // -- Submit: collects uploaded URLs, calls createPost API, resets state
  async function handleSubmit() {
    if (!canPost) return;
    setSubmitting(true);
    setError(null);

    try {
      const imageUrls = files.filter(f => f.url).map(f => f.url);
      const result = await createPost(content.trim(), imageUrls);
      onPost({ ...result.post, tags });
      setContent(''); setTags([]); setExpanded(false);
      files.forEach(f => URL.revokeObjectURL(f.preview));
      setFiles([]);
    } catch (e) {
      setError(e.message ?? 'Failed to post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit();
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--r-lg)',
        border: `1.5px solid ${dragging ? 'var(--red)' : 'var(--border)'}`,
        boxShadow: dragging ? 'var(--red-glow)' : 'var(--shadow-sm)',
        padding: '18px 20px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <Avatar user={currentUser} size={44} ring />

        <div style={{ flex: 1, minWidth: 0 }}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => { setContent(e.target.value); if (!expanded) setExpanded(true); }}
            onFocus={() => setExpanded(true)}
            onKeyDown={handleKeyDown}
            aria-label="Write a post"
            placeholder="Share an update, idea, or resource with fellow Matadors..."
            maxLength={MAX_CHARS + 50}
            style={{
              width: '100%', border: 'none', outline: 'none', resize: 'none',
              fontSize: '1rem', lineHeight: 1.65, background: 'transparent',
              color: 'var(--text1)', minHeight: expanded ? 96 : 44,
              fontFamily: 'var(--font-body)',
              transition: 'min-height 0.22s var(--ease)',
              caretColor: 'var(--red)',
              '::placeholder': { color: 'var(--text3)' },
            }}
          />

          {expanded && (
            <div style={{ animation: 'slideDown 0.2s var(--ease)' }}>
              {/* Image preview grid */}
              {files.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(files.length, 2)}, 1fr)`,
                  gap: 8, marginBottom: 12,
                }}>
                  {files.map(f => (
                    <div key={f.id} style={{
                      position: 'relative', borderRadius: 'var(--r-md)',
                      overflow: 'hidden', border: '1px solid var(--border)',
                      paddingBottom: files.length === 1 ? '42%' : '60%',
                      background: 'var(--bg)',
                    }}>
                      <img src={f.preview} alt="" style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%', objectFit: 'cover',
                        opacity: f.uploading ? 0.5 : 1, transition: 'opacity 0.2s',
                      }} />
                      {f.uploading && (
                        <div style={{
                          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                          background: 'rgba(255,255,255,0.5)',
                        }}>
                          <Spinner size={22} />
                        </div>
                      )}
                      {f.error && (
                        <div style={{
                          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                          background: 'rgba(220,38,38,0.15)',
                          fontSize: '0.75rem', fontWeight: 700, color: '#DC2626',
                        }}>
                          Upload failed
                        </div>
                      )}
                      <button
                        aria-label="Remove image"
                        onClick={() => {
                          URL.revokeObjectURL(f.preview);
                          setFiles(prev => prev.filter(x => x.id !== f.id));
                        }}
                        style={{
                          position: 'absolute', top: 6, right: 6,
                          width: 24, height: 24, borderRadius: '50%',
                          background: 'rgba(0,0,0,0.55)', border: 'none',
                          display: 'grid', placeItems: 'center', cursor: 'pointer',
                          color: '#fff',
                        }}
                      >
                        <CloseIcon size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Tag chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {availableTags.map(t => (
                  <Tag key={t} label={t} small active={tags.includes(t)} onClick={() => toggleTag(t)} />
                ))}
              </div>

              {error && (
                <p style={{ fontSize: '0.82rem', color: '#DC2626', marginBottom: 8, fontWeight: 600 }}>
                  {error}
                </p>
              )}
            </div>
          )}

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={files.length >= MAX_IMAGES}
              title={`Attach image (${files.length}/${MAX_IMAGES})`}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border)', background: 'transparent',
                color: files.length >= MAX_IMAGES ? 'var(--text3)' : 'var(--text2)',
                fontSize: '0.82rem', fontWeight: 600,
                cursor: files.length >= MAX_IMAGES ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (files.length < MAX_IMAGES) e.currentTarget.style.borderColor = 'var(--red)'; }}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <ImageIcon size={15} />
              Photo{files.length > 0 ? ` (${files.length}/${MAX_IMAGES})` : ''}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={e => { processFiles(e.target.files); e.target.value = ''; }}
            />

            <span style={{
              fontSize: '0.80rem', fontWeight: 600, marginLeft: 'auto',
              color: overLimit ? '#DC2626' : charsLeft < 50 ? 'var(--amber)' : 'var(--text3)',
              transition: 'color 0.2s',
            }}>
              {charsLeft}
            </span>

            {expanded && (
              <button
                onClick={() => {
                  setContent(''); setTags([]); setExpanded(false); setError(null);
                  files.forEach(f => URL.revokeObjectURL(f.preview));
                  setFiles([]);
                }}
                style={{
                  padding: '8px 16px', borderRadius: 'var(--r-sm)',
                  border: '1px solid var(--border)', background: 'transparent',
                  color: 'var(--text2)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canPost}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 20px', borderRadius: 'var(--r-sm)',
                border: 'none', fontWeight: 700, fontSize: '0.875rem',
                fontFamily: 'var(--font-head)',
                background: canPost ? 'var(--red)' : 'var(--border)',
                color: canPost ? '#fff' : 'var(--text3)',
                boxShadow: canPost ? 'var(--red-glow)' : 'none',
                transition: 'all 0.2s var(--spring)',
                transform: canPost ? 'scale(1.02)' : 'scale(1)',
                cursor: canPost ? 'pointer' : 'not-allowed',
              }}
            >
              {submitting ? <Spinner size={15} color="#fff" /> : <SendIcon size={14} />}
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>

      {dragging && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 'var(--r-lg)',
          background: 'rgba(210,32,48,0.06)',
          display: 'grid', placeItems: 'center', pointerEvents: 'none',
          zIndex: 2,
        }}>
          <p style={{ fontWeight: 700, color: 'var(--red)', fontSize: '0.9rem' }}>
            Drop images here
          </p>
        </div>
      )}
    </div>
  );
}
