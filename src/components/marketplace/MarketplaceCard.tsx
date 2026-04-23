'use client';

import React from 'react';

/**
 * MarketplaceCard Component
 * 
 * Individual listing card displayed in the marketplace grid
 * Shows item image, title, price, seller info, and condition
 * Handles favorite toggle and contact seller actions
 * 
 * Props:
 * - item: Marketplace listing data
 * - isFavorite: Boolean indicating if item is in user's favorites
 * - onToggleFavorite: Callback when heart icon is clicked
 * - onContactSeller: Callback when "Contact Seller" button is clicked
 * - formatTimeAgo: Function to convert timestamp to relative time
 */

interface Seller {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
}

interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number | null;
  images: string[];
  condition: string;
  category: string;
  location: string;
  views: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  seller: Seller;
  _count?: { favoritedBy: number };
}

interface MarketplaceCardProps {
  item: MarketplaceListing;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onContactSeller: (item: MarketplaceListing) => void;
  onDeleteListing?: (id: string) => void;
  formatTimeAgo: (timestamp: string) => string;
  currentUserId?: string;
}

const MarketplaceCard: React.FC<MarketplaceCardProps> = ({
  item,
  isFavorite,
  onToggleFavorite,
  onContactSeller,
  onDeleteListing,
  formatTimeAgo,
  currentUserId
}) => {
  /**
   * Calculate savings percentage if original price exists
   */
  const calculateSavings = (): number | null => {
    if (!item.originalPrice || item.originalPrice <= item.price) return null;
    return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
  };

  /**
   * Format condition label for display
   */
  const formatCondition = (condition: string): string => {
    if (condition === 'likeNew') return 'Like New';
    return condition.charAt(0).toUpperCase() + condition.slice(1);
  };

  /**
   * Get condition color based on value
   */
  const getConditionColor = (condition: string): string => {
    switch(condition) {
      case 'likeNew': return '#059669';
      case 'excellent': return '#0891B2';
      case 'good': return '#16A34A';
      case 'fair': return '#CA8A04';
      case 'poor': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const savings = calculateSavings();
  const isOwnListing = currentUserId && item.seller.id === currentUserId;

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'translateY(-4px)';
        el.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
      }}
    >
      {/* Image Container */}
      <div style={{ position: 'relative', overflow: 'hidden', height: '200px' }}>
        <img
          src={item.images[0] || 'https://images.unsplash.com/photo-1581287053822-fd7bf4f4bfec?w=600&h=400&fit=crop'}
          alt={item.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Condition Badge */}
        <div style={{ 
          position: 'absolute', 
          top: '0.75rem', 
          left: '0.75rem', 
          zIndex: 10 
        }}>
          <span style={{
            background: 'rgba(255, 255, 255, 0.98)',
            color: getConditionColor(item.condition),
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            border: `2px solid ${getConditionColor(item.condition)}`,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}>
            {formatCondition(item.condition)}
          </span>
        </div>

        {/* Category Badge (for textbooks) */}
        {item.category === 'textbooks' && (
          <div style={{ 
            position: 'absolute', 
            top: '0.75rem', 
            left: '0.75rem',
            marginTop: '2.5rem',
            zIndex: 10 
          }}>
            <span style={{
              background: '#A80532',
              color: 'white',
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.7rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              boxShadow: '0 2px 8px rgba(168, 5, 50, 0.3)'
            }}>
              Textbook
            </span>
          </div>
        )}

        {/* Favorite Button - FIXED */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
          aria-label={isFavorite ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: 'rgba(255, 255, 255, 0.95)',
            width: '36px',
            height: '36px',
            padding: '0',
            borderRadius: '50%',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = 'scale(1.15)';
            el.style.boxShadow = '0 4px 16px rgba(168, 5, 50, 0.4)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = 'scale(1)';
            el.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.2)';
          }}
        >
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isFavorite ? '#A80532' : 'none'}
            stroke={isFavorite ? '#A80532' : '#6B7280'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      {/* Card Content */}
      <div style={{ padding: '1rem' }}>
        {/* Title */}
        <h3 style={{ 
          fontSize: '1rem', 
          fontWeight: '600', 
          color: '#111827', 
          marginBottom: '0.5rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {item.title}
        </h3>

        {/* Description Preview */}
        <p style={{ 
          fontSize: '0.85rem', 
          color: '#6B7280', 
          marginBottom: '0.75rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: '1.4'
        }}>
          {item.description}
        </p>

        {/* Price Section */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#A80532' }}>
              ${item.price.toFixed(2)}
            </span>
            {item.originalPrice && (
              <span style={{ 
                fontSize: '0.95rem', 
                color: '#9CA3AF', 
                textDecoration: 'line-through' 
              }}>
                ${item.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          {savings && (
            <span style={{
              display: 'inline-block',
              background: '#DCFCE7',
              color: '#16A34A',
              padding: '0.125rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              Save {savings}%
            </span>
          )}
        </div>

        {/* Seller Info */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          marginBottom: '0.75rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <img
            src={item.seller.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.seller.firstName}`}
            alt={`${item.seller.firstName} ${item.seller.lastName}`}
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              border: '2px solid #E5E7EB',
              objectFit: 'cover'
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ 
              fontSize: '0.85rem', 
              fontWeight: '600', 
              color: '#374151', 
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {item.seller.firstName} {item.seller.lastName}
            </p>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#6B7280'
            }}>
              {item.location}
            </div>
          </div>
        </div>

        {/* Contact Seller Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onContactSeller(item);
          }}
          style={{
            width: '100%',
            background: '#A80532',
            color: 'white',
            padding: '0.75rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.875rem',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#8B0428'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.background = '#A80532'}
        >
          <svg aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Contact Seller
        </button>

        {/* Time Posted */}
        <div style={{ 
          marginTop: '0.75rem',
          fontSize: '0.75rem', 
          color: '#9CA3AF',
          textAlign: 'center'
        }}>
          Posted {formatTimeAgo(item.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceCard;