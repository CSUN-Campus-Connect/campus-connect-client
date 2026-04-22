// =============================================================================
// components/PostComposer.tsx
// Rich compose box for creating new posts on the social feed.
// Features: image upload with preview, live char counter (X/500), ring ring.
// =============================================================================

import { useRef, useState, KeyboardEvent, ChangeEvent } from "react";

interface PostComposerProps {
  currentUserInitials: string;
  currentUserAvatar?: string;
  onPost: (body: string, images?: string[]) => Promise<void>;
}

const MAX_CHARS = 500;

export function PostComposer({ currentUserInitials, currentUserAvatar, onPost }: PostComposerProps) {
  const [value,      setValue]      = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [images,     setImages]     = useState<string[]>([]);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remaining = MAX_CHARS - value.length;
  const overLimit = remaining < 0;
  const progress  = Math.min(value.length / MAX_CHARS, 1);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    autoResize();
  }

  async function handleSubmit() {
    const text = value.trim();
    if ((!text && images.length === 0) || overLimit || submitting) return;
    setSubmitting(true);
    try {
      await onPost(text, images);
      setValue("");
      setImages([]);
      if (textareaRef.current) {
        textareaRef.current.value = "";
        textareaRef.current.style.height = "auto";
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    files.slice(0, 4 - images.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        if (ev.target?.result) {
          setImages(prev => [...prev, ev.target!.result as string].slice(0, 4));
        }
      };
      reader.readAsDataURL(file);
    });
    // reset input so same file can be re-selected
    e.target.value = "";
  }

  function removeImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx));
  }

  // char ring colour
  const ringColour = overLimit ? "#ef4444" : remaining < 30 ? "#f59e0b" : "var(--csun-red)";
  const circumference = 2 * Math.PI * 10; // r=10
  const dash = circumference * progress;

  return (
    <div style={{
      background: "var(--bg-surface)",
      borderRadius: "var(--radius-lg)",
      border: "1px solid var(--border-subtle)",
      padding: "16px 18px",
      boxShadow: "var(--shadow-sm)",
      marginBottom: 16,
    }}>
      <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
        {/* Avatar */}
        <div className="avatar" style={{ width:38, height:38, fontSize:13, flexShrink:0, marginTop:2 }}>
          {currentUserAvatar
            ? <img src={currentUserAvatar} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            : <span className="avatar-initials">{currentUserInitials}</span>
          }
        </div>

        {/* Input area */}
        <div style={{ flex:1 }}>
          <textarea
            ref={textareaRef}
            placeholder="What's on your mind?"
            aria-label="Write a new post"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={submitting}
            rows={2}
            maxLength={MAX_CHARS + 50}
            style={{
              width: "100%",
              resize: "none",
              border: "none",
              outline: "none",
              background: "transparent",
              color: "var(--text-primary)",
              fontSize: 15,
              lineHeight: 1.6,
              fontFamily: "inherit",
              overflowY: "hidden",
              boxSizing: "border-box",
            }}
          />

          {/* Image previews */}
          {images.length > 0 && (
            <div style={{ display:"grid", gridTemplateColumns: images.length === 1 ? "1fr" : "1fr 1fr", gap:6, marginTop:10, borderRadius:"var(--radius-md)", overflow:"hidden" }}>
              {images.map((src, idx) => (
                <div key={idx} style={{ position:"relative", aspectRatio: images.length === 1 ? "16/9" : "1/1", overflow:"hidden", borderRadius:"var(--radius-md)", border:"1px solid var(--border-subtle)" }}>
                  <img src={src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  <button
                    onClick={() => removeImage(idx)}
                    aria-label={`Remove image ${idx + 1}`}
                    style={{ position:"absolute", top:5, right:5, width:22, height:22, borderRadius:"50%", background:"rgba(0,0,0,0.55)", border:"none", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, lineHeight:1 }}
                  >×</button>
                </div>
              ))}
            </div>
          )}

          {/* Toolbar row */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:10, paddingTop:10, borderTop:"1px solid var(--border-subtle)", gap:8 }}>

            {/* Left: image upload button */}
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display:"none" }}
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting || images.length >= 4}
                aria-label="Attach image"
                style={{ width:34, height:34, borderRadius:"var(--radius-md)", border:"1px solid var(--border-subtle)", background:"transparent", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-muted)", cursor: images.length >= 4 ? "not-allowed" : "pointer", opacity: images.length >= 4 ? 0.4 : 1, transition:"background 150ms, color 150ms" }}
                onMouseEnter={e => { if (images.length < 4) { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.color = "var(--csun-red)"; } }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </button>
            </div>

            {/* Right: char counter + post button */}
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {value.length > 0 && (
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  {/* Ring */}
                  <svg width={24} height={24} style={{ transform:"rotate(-90deg)", flexShrink:0 }}>
                    <circle cx={12} cy={12} r={10} fill="none" stroke="var(--border-subtle)" strokeWidth={2.5} />
                    <circle
                      cx={12} cy={12} r={10} fill="none"
                      stroke={ringColour} strokeWidth={2.5}
                      strokeDasharray={`${dash} ${circumference}`}
                      strokeLinecap="round"
                      style={{ transition:"stroke-dasharray 150ms, stroke 150ms" }}
                    />
                  </svg>
                  {/* Numeric counter */}
                  <span style={{ fontSize:12, fontWeight:600, minWidth:42, textAlign:"right", color: overLimit ? "#ef4444" : remaining < 30 ? "#f59e0b" : "var(--text-muted)", fontVariantNumeric:"tabular-nums" }}>
                    {value.length}/{MAX_CHARS}
                  </span>
                </div>
              )}

              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={(!value.trim() && images.length === 0) || overLimit || submitting}
                style={{ opacity: ((!value.trim() && images.length === 0) || overLimit || submitting) ? .5 : 1, transition:"opacity 150ms" }}
              >
                {submitting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

