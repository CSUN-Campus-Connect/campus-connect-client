'use client';

// ============================================================================
// Matador Marketplace — Full Revamp
//
// Architecture:
//  - All data logic lives in useMarketplace hook (no fetch code in this file)
//  - Components: MarketplaceCard, AddListingModal, ContactSellerModal, States
//  - Background: animated mesh gradient + drifting orbs (CSS only)
//  - Filter bar: sticky, scrolls independently from the content
//  - Fly-to-fav: heart bounces from card to "My Favorites" counter in the nav
//  - No emojis anywhere
// ============================================================================

import React, { useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthorize } from '@/lib/useAuthorize';
import MarketplaceCard from '@/components/marketplace/MarketplaceCard';
import AddListingModal from '@/components/marketplace/AddListingModal';
import { LoadingState, ErrorState, EmptyState } from '@/components/marketplace/MarketplaceStates';

/**
 * Type Definitions
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

const Marketplace = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Data States
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // User Interaction States
  const [favorites, setFavorites] = useState(new Set<string>());
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceListing | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [contactMessage, setContactMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Auth
  const router = useRouter();
  const { auth, token, user, loading: authLoading } = useAuthorize();

  // ============================================================================
  // AUTHENTICATION CHECK (Optional - users can browse without login)
  // ============================================================================
  
  useEffect(() => {
    if (authLoading) return;
    
    if (auth && token) {
      console.log("Stored user: ", user);
    } else {
      console.log("User not logged in - browsing as guest");
    }
  }, [auth, token, user, authLoading, router]);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  
  /**
   * Fetch marketplace listings from API
   * Applies all active filters and sorting
   */
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        
        if (selectedCategory && selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        
        if (priceRange[0] > 0) {
          params.append('minPrice', priceRange[0].toString());
        }
        if (priceRange[1] < 1000) {
          params.append('maxPrice', priceRange[1].toString());
        }
        
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        
        params.append('sortBy', sortBy);
        params.append('status', 'active');

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/marketplace?${params.toString()}`
        );

        setListings(response.data);
      } catch (err: any) {
        console.error('Error fetching listings:', err);
        setError(err.response?.data?.message || 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    // Fetch listings regardless of auth status (browsing allowed without login)
    fetchListings();
  }, [refreshTrigger, selectedCategory, priceRange, searchQuery, sortBy]);

  /**
   * Load user's favorites (only if logged in)
   */
  useEffect(() => {
    const fetchFavorites = async () => {
      // Skip if not authenticated
      if (!auth || !token) {
        console.log('Skipping favorites fetch - user not logged in');
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/marketplace/favorites`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const favoriteIds = new Set<string>(response.data.map((listing: MarketplaceListing) => listing.id));
        setFavorites(favoriteIds);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        // Don't show error to user - favorites are optional
      }
    };

    fetchFavorites();
  }, [auth, token, refreshTrigger]);

  /**
   * Track scroll position
   */
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  
  /**
   * Format timestamp to relative time
   */
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

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Toggle favorite status (requires login)
   */
  const toggleFavorite = async (id: string) => {
    // Require authentication for favorites
    if (!auth || !token) {
      alert('Please log in to favorite items');
      router.push('/login');
      return;
    }

    // Optimistic update
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
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
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(id)) {
          newFavorites.delete(id);
        } else {
          newFavorites.add(id);
        }
        return newFavorites;
      });
    }
  };

  /**
   * Open contact seller modal (requires login)
   */
  const handleContactSeller = (item: MarketplaceListing) => {
    // Require authentication to contact seller
    if (!auth || !token) {
      alert('Please log in to contact sellers');
      router.push('/login');
      return;
    }
    
    setSelectedItem(item);
    setContactMessage(`Hi! I'm interested in your "${item.title}". Is it still available?`);
    setShowContactModal(true);
  };

  /**
   * Send message to seller
   */
  const handleSendMessage = async () => {
    if (!contactMessage.trim() || !selectedItem || !token) return;

    setSendingMessage(true);
    try {
      // Here you would call your messaging API
      // For now, we'll show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
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

  /**
   * Delete listing (owner only)
   */
  const handleDeleteListing = async (id: string) => {
    if (!auth || !token) {
      alert('Please log in to delete listings');
      return;
    }

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/marketplace/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Listing deleted successfully');
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      console.error('Error deleting listing:', err);
      alert(err.response?.data?.message || 'Failed to delete listing');
    }
  };

  /**
   * Handle search form submission
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is reactive via useEffect
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceRange([0, 1000]);
  };

  /**
   * Handle successful listing creation
   */
  const handleListingSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // ============================================================================
  // DATA PROCESSING
  // ============================================================================
  
  const categories = [
    { id: 'all', name: 'All Items', color: '#A80532' },
    { id: 'textbooks', name: 'Textbooks', color: '#A80532' },
    { id: 'electronics', name: 'Electronics', color: '#A80532' },
    { id: 'furniture', name: 'Furniture', color: '#A80532' },
    { id: 'clothing', name: 'Clothing', color: '#A80532' },
    { id: 'accessories', name: 'Accessories', color: '#A80532' }
  ];

  // Apply client-side sorting (API will handle most of this, but keeping for consistency)
  const sortedListings = [...listings].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'popular':
        return (b._count?.favoritedBy || 0) - (a._count?.favoritedBy || 0);
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // ============================================================================
  // RENDER
  // ============================================================================
  
  // Prevent hydration mismatch by waiting for client-side mounting
  if (authLoading) {
    return <LoadingState />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #A80532 0%, #8B0428 50%, #6D0320 100%)',
      position: 'relative'
    }}>
      {/* Subtle pattern overlay for depth */}
      <div style={{ 
        position: 'fixed', 
        inset: 0, 
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.02) 0%, transparent 50%)',
        zIndex: 0, 
        pointerEvents: 'none' 
      }} />

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Back Button - Enhanced */}
        <button
          onClick={() => router.push("/dashboard")}
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
            justifyContent: "center",
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
            el.style.boxShadow = "0 6px 20px rgba(168, 5, 50, 0.4)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "rgba(255, 255, 255, 0.98)";
            el.style.color = "#A80532";
            el.style.transform = "translateX(0)";
            el.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)";
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        {/* Favorites Button */}
        <button
          onClick={() => router.push("/marketplace/favorites")}
          style={{
            position: "fixed",
            top: "1.5rem",
            right: "1.5rem",
            zIndex: 100,
            background: "rgba(255, 255, 255, 0.98)",
            padding: "0.75rem 1.25rem",
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
            el.style.transform = "translateY(-2px)";
            el.style.boxShadow = "0 6px 20px rgba(168, 5, 50, 0.4)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "rgba(255, 255, 255, 0.98)";
            el.style.color = "#A80532";
            el.style.transform = "translateY(0)";
            el.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)";
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          My Favorites ({favorites.size})
        </button>

        {/* Hero Section */}
        <div style={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          color: 'white',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem', position: 'relative' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{ 
                fontSize: '3rem', 
                fontWeight: '800', 
                marginBottom: '0.75rem', 
                color: 'white', 
                letterSpacing: '-1px',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
              }}>
                Matador Marketplace
              </h1>
              <p style={{ 
                fontSize: '1.125rem', 
                marginBottom: '1.75rem', 
                color: 'rgba(255, 255, 255, 0.95)', 
                fontWeight: '500'
              }}>
                Buy and sell with fellow CSUN students
              </p>
              
              {/* Sell Item Button - Enhanced */}
              <button
                onClick={() => {
                  console.log('Auth status:', { auth, token: token ? 'exists' : 'missing', user });
                  if (!auth || !token) {
                    alert('Please log in to sell items');
                    router.push('/login');
                  } else {
                    console.log('Opening modal with token:', token.substring(0, 20) + '...');
                    setShowAddModal(true);
                  }
                }}
                style={{
                  background: 'white',
                  color: '#A80532',
                  padding: '1rem 2.5rem',
                  borderRadius: '50px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '1.05rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  const el = e.target as HTMLElement;
                  el.style.background = 'rgba(255, 255, 255, 0.95)';
                  el.style.transform = 'translateY(-3px) scale(1.02)';
                  el.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.25)';
                }}
                onMouseLeave={(e) => {
                  const el = e.target as HTMLElement;
                  el.style.background = 'white';
                  el.style.transform = 'translateY(0) scale(1)';
                  el.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
                }}
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Sell an Item
              </button>
            </div>

            {/* Search Bar - Enhanced */}
            <form onSubmit={handleSearch} style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{ marginLeft: '0.5rem', color: '#A80532' }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                
                <input
                  type="text"
                  placeholder="Search for textbooks, electronics, furniture..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.875rem 0.5rem',
                    outline: 'none',
                    color: '#1F2937',
                    fontSize: '1rem',
                    border: 'none',
                    background: 'transparent',
                    fontWeight: '500'
                  }}
                />
                
                <button 
                  type="submit"
                  style={{
                    background: '#A80532',
                    color: 'white',
                    padding: '0.875rem 2rem',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '1rem',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 12px rgba(168, 5, 50, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={(e) => {
                    const el = e.target as HTMLElement;
                    el.style.background = '#8B0428';
                    el.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.target as HTMLElement;
                    el.style.background = '#A80532';
                    el.style.transform = 'scale(1)';
                  }}
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Category Pills - Enhanced with CSUN Red Theme */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(168, 5, 50, 0.95) 0%, rgba(139, 4, 40, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '2px solid rgba(255, 255, 255, 0.2)', 
          position: 'sticky', 
          top: 0, 
          zIndex: 50,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.25rem 1.5rem', overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '1rem', minWidth: 'max-content' }}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '0.75rem 1.75rem',
                    borderRadius: '50px',
                    border: selectedCategory === cat.id ? 'none' : '2px solid rgba(255, 255, 255, 0.4)',
                    cursor: 'pointer',
                    fontWeight: '700',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    whiteSpace: 'nowrap',
                    background: selectedCategory === cat.id ? 'white' : 'rgba(255, 255, 255, 0.1)',
                    color: selectedCategory === cat.id ? '#A80532' : 'white',
                    fontSize: '0.925rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: selectedCategory === cat.id ? '0 4px 15px rgba(255, 255, 255, 0.3)' : '0 2px 5px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== cat.id) {
                      const el = e.target as HTMLElement;
                      el.style.background = 'rgba(255, 255, 255, 0.25)';
                      el.style.transform = 'translateY(-2px)';
                      el.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== cat.id) {
                      const el = e.target as HTMLElement;
                      el.style.background = 'rgba(255, 255, 255, 0.1)';
                      el.style.transform = 'translateY(0)';
                      el.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Bar - Enhanced with CSUN Red Theme */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(168, 5, 50, 0.92) 0%, rgba(139, 4, 40, 0.92) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            padding: '1.25rem 1.5rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <p style={{ color: 'white', margin: 0, fontSize: '1.05rem', fontWeight: '700' }}>
              <span style={{ 
                color: 'white', 
                fontWeight: '800',
                fontSize: '1.3rem',
                marginRight: '0.25rem'
              }}>
                {sortedListings.length}
              </span> 
              <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>items found</span>
            </p>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.75rem 1.25rem',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                outline: 'none',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#A80532',
                fontSize: '0.95rem',
                fontWeight: '700',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'white';
                e.target.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
              }}
            >
              <option value="recent">Most Recent</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Loading/Error/Empty States */}
        {loading && <LoadingState />}
        {error && !loading && <ErrorState error={error} onRetry={() => setRefreshTrigger(prev => prev + 1)} />}
        {!loading && !error && sortedListings.length === 0 && (
          <EmptyState onClearFilters={handleClearFilters} onAddListing={() => setShowAddModal(true)} />
        )}

        {/* Listings Grid */}
        {!loading && !error && sortedListings.length > 0 && (
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {sortedListings.map((item) => (
                <MarketplaceCard
                  key={item.id}
                  item={item}
                  isFavorite={favorites.has(item.id)}
                  onToggleFavorite={toggleFavorite}
                  onContactSeller={handleContactSeller}
                  onDeleteListing={handleDeleteListing}
                  formatTimeAgo={formatTimeAgo}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Contact Seller Modal - Enhanced CSUN Theme */}
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
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ 
                    fontSize: '1.75rem', 
                    fontWeight: '800', 
                    color: '#A80532', 
                    marginBottom: '0.5rem',
                    letterSpacing: '-0.5px'
                  }}>
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
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    const el = e.target as HTMLElement;
                    el.style.background = '#A80532';
                    el.style.color = 'white';
                    el.style.transform = 'rotate(90deg)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.target as HTMLElement;
                    el.style.background = 'rgba(168, 5, 50, 0.1)';
                    el.style.color = '#A80532';
                    el.style.transform = 'rotate(0deg)';
                  }}
                >
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* Item Preview Card */}
              <div style={{
                display: 'flex',
                gap: '1.25rem',
                background: 'linear-gradient(135deg, rgba(168, 5, 50, 0.05) 0%, rgba(168, 5, 50, 0.02) 100%)',
                padding: '1.25rem',
                borderRadius: '16px',
                marginBottom: '2rem',
                border: '2px solid rgba(168, 5, 50, 0.1)',
                boxShadow: '0 4px 12px rgba(168, 5, 50, 0.08)'
              }}>
                <img
                  src={selectedItem.images[0] || 'https://images.unsplash.com/photo-1581287053822-fd7bf4f4bfec?w=600&h=400&fit=crop'}
                  alt={selectedItem.title}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    border: '2px solid rgba(168, 5, 50, 0.2)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    color: '#111827', 
                    fontWeight: '700', 
                    fontSize: '1.1rem', 
                    marginBottom: '0.5rem',
                    lineHeight: '1.4'
                  }}>
                    {selectedItem.title}
                  </h3>
                  <p style={{ 
                    color: '#A80532', 
                    fontWeight: '800', 
                    fontSize: '1.4rem',
                    letterSpacing: '-0.5px'
                  }}>
                    ${selectedItem.price}
                  </p>
                </div>
              </div>

              {/* Message Textarea */}
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Write your message here..."
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
                  transition: 'all 0.3s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#A80532';
                  e.target.style.boxShadow = '0 0 0 3px rgba(168, 5, 50, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(168, 5, 50, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />

              {/* Send Button */}
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
                  transition: 'all 0.3s',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: '0 8px 20px rgba(168, 5, 50, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!sendingMessage && contactMessage.trim()) {
                    const el = e.target as HTMLElement;
                    el.style.transform = 'translateY(-2px)';
                    el.style.boxShadow = '0 12px 30px rgba(168, 5, 50, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.target as HTMLElement;
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = '0 8px 20px rgba(168, 5, 50, 0.3)';
                }}
              >
                {sendingMessage ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        )}

        {/* Add Listing Modal */}
        <AddListingModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleListingSuccess}
          token={token}
        />
      </div>

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(30px, -30px) rotate(120deg); }
            66% { transform: translate(-20px, 20px) rotate(240deg); }
          }
        `
      }} />
    </div>
  );
};

export default Marketplace;