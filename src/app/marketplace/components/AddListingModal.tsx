'use client';

// ============================================================================
// AddListingModal — Revamped
// Two-step flow: Details → Images
// Uses ImageUploadArea for flexible image input (file or URL)
// ============================================================================

import React, { useState } from 'react';
import axios from 'axios';
import ImageUploadArea from './ImageUploadArea';
import { useImageUpload } from '../hooks/useImageUpload';
import { CATEGORIES, CONDITIONS, API_BASE, LISTING_TYPES, MEETUP_LOCATIONS, getListingTypeMeta } from '../constants/marketplace.constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string | null;
}

interface FormErrors {
  title?: string;
  description?: string;
  price?: string;
  originalPrice?: string;
  category?: string;
  condition?: string;
  location?: string;
  listingType?: string;
  meetupLocation?: string;
  rentalPrice?: string;
  rentalDurationDays?: string;
  images?: string;
}

const STEPS = ['Details', 'Images'] as const;
type Step = typeof STEPS[number];

export default function AddListingModal({ isOpen, onClose, onSuccess, token }: Props) {
  const [step, setStep]           = useState<Step>('Details');
  const [title, setTitle]         = useState('');
  const [desc, setDesc]           = useState('');
  const [price, setPrice]         = useState('');
  const [origPrice, setOrigPrice] = useState('');
  const [category, setCategory]   = useState('');
  const [condition, setCondition] = useState('');
  const [location, setLocation]   = useState('');
  const [listingType, setListingType] = useState<'sale' | 'rent' | 'free'>('sale');
  const [meetupLocation, setMeetupLocation] = useState('');
  const [rentalPrice, setRentalPrice] = useState('');
  const [rentalDurationDays, setRentalDurationDays] = useState('');
  const [errors, setErrors]       = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const [success, setSuccess]         = useState(false);

  const imageUpload = useImageUpload();

  if (!isOpen) return null;

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateDetails = (): boolean => {
    const e: FormErrors = {};
    if (!title.trim() || title.length < 3)      e.title       = 'Title must be at least 3 characters.';
    if (title.length > 100)                       e.title       = 'Title cannot exceed 100 characters.';
    if (!desc.trim() || desc.length < 10)        e.description = 'Description must be at least 10 characters.';
    
    // Conditional price validation
    if (listingType === 'sale' && (!price || isNaN(+price) || +price <= 0)) {
      e.price = 'Enter a valid positive price.';
    } else if (listingType === 'free' && price) {
      // Free listings shouldn't have a price
      setPrice('');
    }
    
    if (origPrice && (+origPrice <= +price)) e.originalPrice = 'Original price must be higher than the selling price.';
    
    // Rental validation
    if (listingType === 'rent') {
      if (!rentalPrice || isNaN(+rentalPrice) || +rentalPrice <= 0) e.rentalPrice = 'Enter a valid rental price.';
      if (!rentalDurationDays || isNaN(+rentalDurationDays) || +rentalDurationDays <= 0) e.rentalDurationDays = 'Enter rental duration in days.';
    }
    
    if (!category)                                e.category    = 'Please select a category.';
    if (!condition)                               e.condition   = 'Please select a condition.';
    if (!location.trim())                         e.location    = 'Location is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateDetails()) setStep('Images');
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const urls = imageUpload.getFinalUrls();
    if (urls.length === 0) {
      setErrors((prev) => ({ ...prev, images: 'Add at least one image.' }));
      return;
    }

    if (!token) { setSubmitError('You must be logged in to list an item.'); return; }

    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}/api/v1/marketplace`,
        {
          title:         title.trim(),
          description:   desc.trim(),
          price:         listingType === 'free' ? null : parseFloat(price),
          originalPrice: origPrice ? parseFloat(origPrice) : null,
          category,
          condition,
          location:      location.trim(),
          listingType,
          meetupLocation: meetupLocation || null,
          rentalPrice:   listingType === 'rent' ? parseFloat(rentalPrice) : null,
          rentalDurationDays: listingType === 'rent' ? parseInt(rentalDurationDays) : null,
          images:        urls,
        },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      setSuccess(true);
      setTimeout(() => {
        handleReset();
        onSuccess();
        onClose();
      }, 1800);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message ?? 'Failed to create listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep('Details'); setTitle(''); setDesc(''); setPrice(''); setOrigPrice('');
    setCategory(''); setCondition(''); setLocation(''); setErrors({});
    setSubmitError(null); setSubmitting(false); setSuccess(false);
    setListingType('sale'); setMeetupLocation(''); setRentalPrice(''); setRentalDurationDays('');
    imageUpload.reset();
  };

  const handleClose = () => { if (!submitting) { handleReset(); onClose(); } };

  // ── Shared field style ──────────────────────────────────────────────────────
  const field = (hasError?: string): React.CSSProperties => ({
    width: '100%',
    padding: '11px 14px',
    border: `1px solid ${hasError ? '#dc2626' : '#e5e7eb'}`,
    borderRadius: 10,
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    background: '#fafafa',
    color: '#111827',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  });

  return (
    <>
      <style>{`
        @keyframes mp-spin { to { transform: rotate(360deg); } }
        @keyframes mp-pop { 0%{transform:scale(0.92);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes mp-check { 0%{stroke-dashoffset:30} 100%{stroke-dashoffset:0} }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 540, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.25)', animation: 'mp-pop 0.25s ease-out' }}
        >
          {/* Success screen */}
          {success && (
            <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(22,200,120,0.12)', border: '2px solid rgba(22,200,120,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16c878" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" strokeDasharray="30" style={{ animation: 'mp-check 0.35s 0.1s ease forwards', strokeDashoffset: 30 }} />
                </svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 6 }}>Listing Created!</h2>
              <p style={{ fontSize: 14, color: '#6b7280' }}>Your item is now live on the Matador Marketplace.</p>
            </div>
          )}

          {/* Form */}
          {!success && (
            <>
              {/* Header */}
              <div style={{ padding: '1.5rem 1.75rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 3 }}>List an Item</h2>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>
                    Step {STEPS.indexOf(step) + 1} of {STEPS.length} — {step}
                  </p>
                </div>
                <button onClick={handleClose} disabled={submitting} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '0.4rem', cursor: 'pointer', color: '#6b7280' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {/* Step indicator */}
              <div style={{ padding: '0.75rem 1.75rem', display: 'flex', gap: 6 }}>
                {STEPS.map((s, i) => (
                  <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: STEPS.indexOf(step) >= i ? '#A80532' : '#e5e7eb', transition: 'background 0.3s' }} />
                ))}
              </div>

              {/* Error banner */}
              {submitError && (
                <div style={{ margin: '0 1.75rem', background: '#fef2f2', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13 }}>
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ padding: '1rem 1.75rem 1.75rem' }}>

                {/* ── STEP: DETAILS ────────────────────────────────────── */}
                {step === 'Details' && (
                  <>
                    {/* Title */}
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Title <span style={{ color: '#dc2626' }}>*</span></label>
                      <input value={title} onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: undefined })); }} placeholder="e.g. Calculus 9th Edition" style={field(errors.title)}
                        onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#A80532'; }}
                        onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.title ? '#dc2626' : '#e5e7eb'; }}
                      />
                      {errors.title && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Description <span style={{ color: '#dc2626' }}>*</span></label>
                      <textarea value={desc} onChange={(e) => { setDesc(e.target.value); setErrors((p) => ({ ...p, description: undefined })); }} rows={4} placeholder="Describe the item, its condition, and any important details..." style={{ ...field(errors.description), resize: 'vertical' }}
                        onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = '#A80532'; }}
                        onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = errors.description ? '#dc2626' : '#e5e7eb'; }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        {errors.description ? <p style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{errors.description}</p> : <span />}
                        <span style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{desc.length}/2000</span>
                      </div>
                    </div>

                    {/* Price row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Price <span style={{ color: '#dc2626' }}>*</span></label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: 14 }}>$</span>
                          <input type="number" step="0.01" min="0" value={price} onChange={(e) => { setPrice(e.target.value); setErrors((p) => ({ ...p, price: undefined })); }} placeholder="0.00" style={{ ...field(errors.price), paddingLeft: 24 }}
                            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#A80532'; }}
                            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.price ? '#dc2626' : '#e5e7eb'; }}
                          />
                        </div>
                        {errors.price && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{errors.price}</p>}
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Original Price <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: 14 }}>$</span>
                          <input type="number" step="0.01" min="0" value={origPrice} onChange={(e) => { setOrigPrice(e.target.value); setErrors((p) => ({ ...p, originalPrice: undefined })); }} placeholder="0.00" style={{ ...field(errors.originalPrice), paddingLeft: 24 }}
                            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#A80532'; }}
                            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.originalPrice ? '#dc2626' : '#e5e7eb'; }}
                          />
                        </div>
                        {errors.originalPrice && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{errors.originalPrice}</p>}
                      </div>
                    </div>

                    {/* Category + Condition */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Category <span style={{ color: '#dc2626' }}>*</span></label>
                        <select value={category} onChange={(e) => { setCategory(e.target.value); setErrors((p) => ({ ...p, category: undefined })); }} style={{ ...field(errors.category), appearance: 'none', cursor: 'pointer' }}>
                          <option value="">Select...</option>
                          {CATEGORIES.filter((c) => c.id !== 'all').map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                        {errors.category && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{errors.category}</p>}
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Condition <span style={{ color: '#dc2626' }}>*</span></label>
                        <select value={condition} onChange={(e) => { setCondition(e.target.value); setErrors((p) => ({ ...p, condition: undefined })); }} style={{ ...field(errors.condition), appearance: 'none', cursor: 'pointer' }}>
                          <option value="">Select...</option>
                          {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        {errors.condition && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{errors.condition}</p>}
                      </div>
                    </div>

                    {/* Location */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Pickup Location <span style={{ color: '#dc2626' }}>*</span></label>
                      <input value={location} onChange={(e) => { setLocation(e.target.value); setErrors((p) => ({ ...p, location: undefined })); }} placeholder="e.g. Sierra Hall, CSUN Library" style={field(errors.location)}
                        onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#A80532'; }}
                        onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.location ? '#dc2626' : '#e5e7eb'; }}
                      />
                      {errors.location && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{errors.location}</p>}
                    </div>

                    {/* Listing Type */}
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Listing Type <span style={{ color: '#dc2626' }}>*</span></label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                        {LISTING_TYPES.map((type) => {
                          const meta = getListingTypeMeta(type.value);
                          const isSelected = listingType === type.value;
                          return (
                            <button key={type.value} type="button" onClick={() => { setListingType(type.value as any); setErrors((p) => ({ ...p, listingType: undefined })); }}
                              style={{
                                padding: '10px',
                                border: `2px solid ${isSelected ? '#A80532' : '#e5e7eb'}`,
                                borderRadius: 8,
                                background: isSelected ? '#FEE2E8' : '#fff',
                                cursor: 'pointer',
                                fontSize: 13,
                                fontWeight: 600,
                                color: isSelected ? '#A80532' : '#374151',
                                transition: 'all 0.2s',
                              }}>
                              <span>{meta.emoji}</span> {meta.label}
                            </button>
                          );
                        })}
                      </div>
                      {errors.listingType && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{errors.listingType}</p>}
                    </div>

                    {/* Price/Rental fields based on listing type */}
                    {listingType === 'sale' && (
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Price <span style={{ color: '#dc2626' }}>*</span></label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: 14 }}>$</span>
                          <input type="number" step="0.01" min="0" value={price} onChange={(e) => { setPrice(e.target.value); setErrors((p) => ({ ...p, price: undefined })); }} placeholder="0.00" style={{ ...field(errors.price), paddingLeft: 24 }}
                            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#A80532'; }}
                            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.price ? '#dc2626' : '#e5e7eb'; }}
                          />
                        </div>
                        {errors.price && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{errors.price}</p>}
                      </div>
                    )}

                    {listingType === 'rent' && (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Rental Price <span style={{ color: '#dc2626' }}>*</span></label>
                            <div style={{ position: 'relative' }}>
                              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: 14 }}>$</span>
                              <input type="number" step="0.01" min="0" value={rentalPrice} onChange={(e) => { setRentalPrice(e.target.value); setErrors((p) => ({ ...p, rentalPrice: undefined })); }} placeholder="0.00" style={{ ...field(errors.rentalPrice), paddingLeft: 24 }}
                                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#A80532'; }}
                                onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.rentalPrice ? '#dc2626' : '#e5e7eb'; }}
                              />
                            </div>
                            {errors.rentalPrice && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{errors.rentalPrice}</p>}
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Duration (Days) <span style={{ color: '#dc2626' }}>*</span></label>
                            <input type="number" min="1" value={rentalDurationDays} onChange={(e) => { setRentalDurationDays(e.target.value); setErrors((p) => ({ ...p, rentalDurationDays: undefined })); }} placeholder="e.g. 7" style={field(errors.rentalDurationDays)}
                              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#A80532'; }}
                              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.rentalDurationDays ? '#dc2626' : '#e5e7eb'; }}
                            />
                            {errors.rentalDurationDays && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{errors.rentalDurationDays}</p>}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Meetup Location (optional for all types) */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Preferred Meetup Location <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
                      <select value={meetupLocation} onChange={(e) => { setMeetupLocation(e.target.value); setErrors((p) => ({ ...p, meetupLocation: undefined })); }} style={{ ...field(errors.meetupLocation), appearance: 'none', cursor: 'pointer' }}>
                        <option value="">Select a location...</option>
                        {MEETUP_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                      </select>
                      {errors.meetupLocation && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{errors.meetupLocation}</p>}
                    </div>

                    {/* Next */}
                    <button type="button" onClick={handleNext} style={{ width: '100%', padding: '13px', background: '#A80532', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => { (e.currentTarget).style.background = '#8b0428'; }}
                      onMouseLeave={(e) => { (e.currentTarget).style.background = '#A80532'; }}>
                      Continue to Images
                    </button>
                  </>
                )}

                {/* ── STEP: IMAGES ─────────────────────────────────────── */}
                {step === 'Images' && (
                  <>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                        Photos <span style={{ color: '#dc2626' }}>*</span>
                        <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 6 }}>Up to 8 images</span>
                      </label>
                      <ImageUploadArea
                        images={imageUpload.images}
                        onAddFile={imageUpload.addFile}
                        onUpdateUrl={imageUpload.updateUrl}
                        onAddSlot={imageUpload.addSlot}
                        onRemove={imageUpload.remove}
                        error={errors.images}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <button type="button" onClick={() => setStep('Details')} style={{ flex: 1, padding: 13, background: '#fff', border: '2px solid #e5e7eb', borderRadius: 10, color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Back</button>
                      <button type="submit" disabled={submitting} style={{ flex: 2, padding: 13, background: submitting ? '#9ca3af' : '#A80532', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        {submitting ? (
                          <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'mp-spin 0.7s linear infinite' }} />Creating...</>
                        ) : 'Create Listing'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
