'use client';

/**
 * ============================================================================
 * MARKETPLACE FAVORITES PAGE - CampusConnect
 * ============================================================================
 * 
 * Displays all items the user has favorited
 * Quick access to saved listings
 * Theme: CSUN Red (#A80532) with glassmorphism design
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuthorize } from '@/lib/useAuthorize';
import MarketplaceCard from '@/components/marketplace/MarketplaceCard';
import { LoadingState, ErrorState, EmptyState } from '@/components/marketplace/MarketplaceStates';

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

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<MarketplaceListing[]>([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set<string>());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceListing | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const router = useRouter();
  const { auth, token, user, loading: authLoading } = useAuthorize();

  // Require authentication
  useEffect(() => {
    if (authLoading) return;
    
    if (!auth || !token) {
      alert('Please log in to view your favorites');
      router.push('/login');
    }
  }, [auth, token, authLoading, router]);

  // Fetch favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!auth || !token) return;

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/marketplace/favorites`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setFavorites(response.data);
        const ids = new Set<string>(response.data.map((listing: MarketplaceListing) => listing.id));
        setFavoriteIds(ids);
      } catch (err: any) {
        console.error('Error fetching favorites:', err);
        setError(err.response?.data?.message || 'Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [auth, token, refreshTrigger]);

  // Toggle favorite
  const toggleFavorite = async (id: string) => {
    if (!auth || !token) return;

    // Optimistic update
    setFavoriteIds(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
        // Remove from list
        setFavorites(current => current.filter(item => item.id !== id));
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/marketplace/${id}/favorite`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // Revert on error
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // Contact seller
  const handleContactSeller = (item: MarketplaceListing) => {
    setSelectedItem(item);
    setContactMessage(`Hi! I'm interested in your "${item.title}". Is it still available?`);
    setShowContactModal(true);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!contactMessage.trim() || !selectedItem || !token) return;

    setSendingMessage(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Message sent to ${selectedItem.seller.firstName}! They will contact you via email.`);
      setShowContactModal(false);
      setContactMessage('');
      setSelectedItem(null);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  };

  if (authLoading || (loading && favorites.length === 0)) {
    return <LoadingState />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #A80532 0%, #8B0428 50%, #6D0320 100%)',
      position: 'relative'
    }}>
      {/* Pattern overlay */}
      <div style={{ 
        position: 'fixed', 
        inset: 0, 
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.02) 0%, transparent 50%)',
        zIndex: 0, 
        pointerEvents: 'none' 
      }} />

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Back Button */}
        <button
          onClick={() => router.push("/marketplace")}
          style={{
            position: "fixed",
            top: "1.5rem",
            left: "1.5rem",
            zIndex: 100,
            background: "rgba(255, 255, 255, 0.98)",
            padding: "0.75rem 1rem",
            borderRadius: "12px",
            border: "2px solid rgba(168, 5, 50, 0.2)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
            fontWeight: "700",
            fontSize: "0.95rem",
            color: "#A80532"
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "#A80532";
            el.style.color = "white";
            el.style.transform = "translateX(-5px)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "rgba(255, 255, 255, 0.98)";
            el.style.color = "#A80532";
            el.style.transform = "translateX(0)";
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        {/* Hero Section */}
        <div style={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          color: 'white',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          padding: '3rem 1.5rem'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="#A80532" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <h1 style={{ 
                fontSize: '3rem', 
                fontWeight: '800', 
                color: 'white', 
                letterSpacing: '-1px',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                margin: 0
              }}>
                My Favorites
              </h1>
            </div>
            <p style={{ 
              fontSize: '1.125rem', 
              color: 'rgba(255, 255, 255, 0.95)', 
              fontWeight: '500',
              margin: 0
            }}>
              {favorites.length} saved {favorites.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        {/* Content */}
        {loading && <LoadingState />}
        {error && !loading && <ErrorState error={error} onRetry={() => setRefreshTrigger(prev => prev + 1)} />}
        
        {!loading && !error && favorites.length === 0 && (
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              borderRadius: '20px', 
              padding: '3rem 2rem',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
            }}>
              <svg 
                width="80" 
                height="80" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#A80532" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ margin: '0 auto 1.5rem' }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>
                No Favorites Yet
              </h3>
              <p style={{ fontSize: '1rem', color: '#6B7280', marginBottom: '2rem' }}>
                Start browsing the marketplace and click the heart icon to save items you like!
              </p>
              <button
                onClick={() => router.push('/marketplace')}
                style={{
                  background: '#A80532',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '50px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '1rem',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#8B0428'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.background = '#A80532'}
              >
                Browse Marketplace
              </button>
            </div>
          </div>
        )}

        {!loading && !error && favorites.length > 0 && (
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {favorites.map((item) => (
                <MarketplaceCard
                  key={item.id}
                  item={item}
                  isFavorite={favoriteIds.has(item.id)}
                  onToggleFavorite={toggleFavorite}
                  onContactSeller={handleContactSeller}
                  formatTimeAgo={formatTimeAgo}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Contact Seller Modal */}
        {showContactModal && selectedItem && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(168, 5, 50, 0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '1rem'
            }}
            onClick={() => setShowContactModal(false)}
          >
            <div 
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 250, 250, 0.98) 100%)',
                borderRadius: '24px',
                padding: '2.5rem',
                maxWidth: '550px',
                width: '100%',
                boxShadow: '0 25px 50px rgba(168, 5, 50, 0.4)',
                border: '2px solid rgba(168, 5, 50, 0.15)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#A80532', marginBottom: '0.5rem' }}>
                    Contact Seller
                  </h2>
                  <p style={{ color: '#6B7280', fontSize: '0.95rem', fontWeight: '500' }}>
                    Send a message to <span style={{ color: '#A80532', fontWeight: '700' }}>{selectedItem.seller.firstName} {selectedItem.seller.lastName}</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowContactModal(false)}
                  style={{
                    background: 'rgba(168, 5, 50, 0.1)',
                    border: '2px solid rgba(168, 5, 50, 0.2)',
                    color: '#A80532',
                    padding: '0.6rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Write your message..."
                rows={5}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid rgba(168, 5, 50, 0.2)',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  marginBottom: '1.5rem',
                  background: 'white',
                  outline: 'none'
                }}
              />

              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !contactMessage.trim()}
                style={{
                  width: '100%',
                  background: sendingMessage || !contactMessage.trim() ? '#9CA3AF' : 'linear-gradient(135deg, #A80532 0%, #8B0428 100%)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '50px',
                  border: 'none',
                  cursor: sendingMessage || !contactMessage.trim() ? 'not-allowed' : 'pointer',
                  fontWeight: '700',
                  fontSize: '1.05rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                {sendingMessage ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;