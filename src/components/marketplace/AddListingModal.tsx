'use client';

import React, { useState } from 'react';
import axios from 'axios';

/**
 * AddListingModal Component
 * 
 * Modal dialog for creating new marketplace listings
 * Includes full form validation and API integration
 * Styled to match CSUN theme with glassmorphism effects
 * 
 * Props:
 * - isOpen: Boolean to control modal visibility
 * - onClose: Callback function when modal is closed
 * - onSuccess: Callback function when listing is created successfully
 * - token: JWT authentication token for API requests
 */

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string | null;
}

interface FormData {
  title: string;
  description: string;
  price: string;
  originalPrice: string;
  category: string;
  condition: string;
  location: string;
  images: string[];
}

interface FormErrors {
  title?: string;
  description?: string;
  price?: string;
  originalPrice?: string;
  category?: string;
  condition?: string;
  location?: string;
  images?: string;
}

const AddListingModal: React.FC<AddListingModalProps> = ({ isOpen, onClose, onSuccess, token }) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    condition: '',
    location: '',
    images: ['']
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ============================================================================
  // FORM VALIDATION
  // ============================================================================
  
  /**
   * Validate Form Data
   * Checks all required fields and format constraints
   * Returns object with field-specific error messages
   */
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    // Title validation (3-100 characters)
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    // Description validation (10-2000 characters)
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    // Price validation (must be positive number)
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    // Original price validation (optional, but must be valid if provided)
    if (formData.originalPrice && (isNaN(Number(formData.originalPrice)) || Number(formData.originalPrice) < Number(formData.price))) {
      newErrors.originalPrice = 'Original price must be greater than current price';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Condition validation
    if (!formData.condition) {
      newErrors.condition = 'Condition is required';
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    // Images validation (at least one non-empty URL)
    const validImages = formData.images.filter(img => img.trim() !== '');
    if (validImages.length === 0) {
      newErrors.images = 'At least one image URL is required';
    }

    return newErrors;
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handle Input Change
   * Updates form data state when user types in fields
   * Clears error for the field being edited
   */
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Handle Image URL Change
   * Updates specific image URL in the images array
   */
  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: undefined }));
    }
  };

  /**
   * Add Image URL Field
   * Adds another input field for additional images (max 10)
   */
  const addImageField = () => {
    if (formData.images.length < 10) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
    }
  };

  /**
   * Remove Image URL Field
   * Removes image input field at specific index
   */
  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, images: newImages }));
    }
  };

  /**
   * Handle Form Submit
   * Validates form data and sends POST request to API
   * Shows success message and refreshes listings on success
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!token) {
      console.error('No token available!');
      setSubmitError('You must be logged in to create a listing');
      return;
    }

    console.log('Submitting with token:', token.substring(0, 20) + '...');
    setIsSubmitting(true);

    try {
      // Filter out empty image URLs
      const validImages = formData.images.filter(img => img.trim() !== '');

      // Prepare request body matching backend schema
      const requestBody = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        category: formData.category,
        condition: formData.condition,
        location: formData.location.trim(),
        images: validImages
      };

      console.log('Request body:', requestBody);
      console.log('API URL:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/marketplace`);

      // Make API request
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/marketplace`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Success! Response:', response.data);

      // Success - reset form and close modal
      setFormData({
        title: '',
        description: '',
        price: '',
        originalPrice: '',
        category: '',
        condition: '',
        location: '',
        images: ['']
      });
      setErrors({});
      onSuccess(); // Trigger parent to refresh listings
      onClose(); // Close modal
    } catch (error: any) {
      console.error('Error creating listing:', error);
      setSubmitError(error.response?.data?.message || 'Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle Close
   * Resets form state and calls parent onClose callback
   */
  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        title: '',
        description: '',
        price: '',
        originalPrice: '',
        category: '',
        condition: '',
        location: '',
        images: ['']
      });
      setErrors({});
      setSubmitError(null);
      onClose();
    }
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={handleClose}
    >
      <div 
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          border: '1px solid #E5E7EB',
          animation: 'modalSlideIn 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ 
              fontSize: '1.75rem', 
              fontWeight: '700', 
              color: '#111827', 
              marginBottom: '0.25rem' 
            }}>
              List an Item
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>
              Fill in the details below to create your listing
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close listing form"
            style={{
              background: '#F3F4F6',
              border: 'none',
              color: '#6B7280',
              padding: '0.5rem',
              borderRadius: '8px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: isSubmitting ? 0.5 : 1
            }}
            onMouseEnter={(e) => !isSubmitting && ((e.target as HTMLElement).style.background = '#E5E7EB')}
            onMouseLeave={(e) => !isSubmitting && ((e.target as HTMLElement).style.background = '#F3F4F6')}
          >
            <svg aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Submit Error Display */}
        {submitError && (
          <div style={{
            background: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            color: '#DC2626',
            fontSize: '0.875rem'
          }}>
            {submitError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Title Field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="listing-title" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Title <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              id="listing-title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Calculus 11th Edition"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.title ? '#DC2626' : '#D1D5DB'}`,
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => !errors.title && (e.target.style.borderColor = '#A80532')}
              onBlur={(e) => !errors.title && (e.target.style.borderColor = '#D1D5DB')}
            />
            {errors.title && <p style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.title}</p>}
          </div>

          {/* Description Field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="listing-description" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Description <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <textarea
              id="listing-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your item, its condition, and any details buyers should know..."
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.description ? '#DC2626' : '#D1D5DB'}`,
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => !errors.description && (e.target.style.borderColor = '#A80532')}
              onBlur={(e) => !errors.description && (e.target.style.borderColor = '#D1D5DB')}
            />
            {errors.description && <p style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.description}</p>}
          </div>

          {/* Price Fields Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Current Price */}
            <div>
              <label htmlFor="listing-price" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Price <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span aria-hidden="true" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}>$</span>
                <input
                  id="listing-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 1.5rem',
                    border: `1px solid ${errors.price ? '#DC2626' : '#D1D5DB'}`,
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => !errors.price && (e.target.style.borderColor = '#A80532')}
                  onBlur={(e) => !errors.price && (e.target.style.borderColor = '#D1D5DB')}
                />
              </div>
              {errors.price && <p style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.price}</p>}
            </div>

            {/* Original Price (Optional) */}
            <div>
              <label htmlFor="listing-original-price" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Original Price (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <span aria-hidden="true" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}>$</span>
                <input
                  id="listing-original-price"
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 1.5rem',
                    border: `1px solid ${errors.originalPrice ? '#DC2626' : '#D1D5DB'}`,
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => !errors.originalPrice && (e.target.style.borderColor = '#A80532')}
                  onBlur={(e) => !errors.originalPrice && (e.target.style.borderColor = '#D1D5DB')}
                />
              </div>
              {errors.originalPrice && <p style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.originalPrice}</p>}
            </div>
          </div>

          {/* Category and Condition Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Category Dropdown */}
            <div>
              <label htmlFor="listing-category" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Category <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select
                id="listing-category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${errors.category ? '#DC2626' : '#D1D5DB'}`,
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  cursor: 'pointer',
                  background: 'white',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => !errors.category && (e.target.style.borderColor = '#A80532')}
                onBlur={(e) => !errors.category && (e.target.style.borderColor = '#D1D5DB')}
              >
                <option value="">Select category...</option>
                <option value="textbooks">Textbooks</option>
                <option value="electronics">Electronics</option>
                <option value="furniture">Furniture</option>
                <option value="clothing">Clothing</option>
                <option value="accessories">Accessories</option>
                <option value="other">Other</option>
              </select>
              {errors.category && <p style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.category}</p>}
            </div>

            {/* Condition Dropdown */}
            <div>
              <label htmlFor="listing-condition" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Condition <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select
                id="listing-condition"
                value={formData.condition}
                onChange={(e) => handleInputChange('condition', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${errors.condition ? '#DC2626' : '#D1D5DB'}`,
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  cursor: 'pointer',
                  background: 'white',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => !errors.condition && (e.target.style.borderColor = '#A80532')}
                onBlur={(e) => !errors.condition && (e.target.style.borderColor = '#D1D5DB')}
              >
                <option value="">Select condition...</option>
                <option value="likeNew">Like New</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
              {errors.condition && <p style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.condition}</p>}
            </div>
          </div>

          {/* Location Field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="listing-location" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Location <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              id="listing-location"
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Northridge Campus, Sierra Hall"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.location ? '#DC2626' : '#D1D5DB'}`,
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => !errors.location && (e.target.style.borderColor = '#A80532')}
              onBlur={(e) => !errors.location && (e.target.style.borderColor = '#D1D5DB')}
            />
            {errors.location && <p style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.location}</p>}
          </div>

          {/* Image URLs */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Image URLs <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.75rem' }}>
              Add image URLs from hosting services like Imgur, Unsplash, or your own server
            </p>
            {formData.images.map((image, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="url"
                  aria-label={`Image URL ${index + 1}`}
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: `1px solid ${errors.images && index === 0 ? '#DC2626' : '#D1D5DB'}`,
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#A80532')}
                  onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    aria-label={`Remove image ${index + 1}`}
                    style={{
                      padding: '0.75rem',
                      background: '#FEE2E2',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#DC2626',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#FECACA'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.background = '#FEE2E2'}
                  >
                    <svg aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
            ))}
            {formData.images.length < 10 && (
              <button
                type="button"
                onClick={addImageField}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(168, 5, 50, 0.05)',
                  border: '1px dashed #A80532',
                  borderRadius: '8px',
                  color: '#A80532',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  marginTop: '0.5rem'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.background = 'rgba(168, 5, 50, 0.1)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'rgba(168, 5, 50, 0.05)'}
              >
                + Add Another Image
              </button>
            )}
            {errors.images && <p style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '0.5rem' }}>{errors.images}</p>}
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '0.875rem',
                background: 'white',
                border: '2px solid #D1D5DB',
                borderRadius: '8px',
                color: '#374151',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.2s',
                opacity: isSubmitting ? 0.5 : 1
              }}
              onMouseEnter={(e) => !isSubmitting && ((e.target as HTMLElement).style.borderColor = '#A80532')}
              onMouseLeave={(e) => !isSubmitting && ((e.target as HTMLElement).style.borderColor = '#D1D5DB')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '0.875rem',
                background: isSubmitting ? '#9CA3AF' : '#A80532',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => !isSubmitting && ((e.target as HTMLElement).style.background = '#8B0428')}
              onMouseLeave={(e) => !isSubmitting && ((e.target as HTMLElement).style.background = '#A80532')}
            >
              {isSubmitting ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddListingModal;