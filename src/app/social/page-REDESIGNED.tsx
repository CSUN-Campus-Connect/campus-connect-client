'use client';

/**
 * Social Hub — Redesigned
 * 
 * A lightweight community platform designed for CSUN students to:
 *   - View trending discussions, clubs, and announcements
 *   - Share updates (with light theme matching Events page)
 *   - Connect with peers through organized feeds
 *   - Discover campus communities and events
 *
 * Features:
 *   - Real data from /api/v1/posts endpoint
 *   - Trending topics & clubs sidebar
 *   - Infinite scroll feed with engagement metrics
 *   - Filter by category (Announcements, Clubs, Study Groups, etc.)
 *   - Like/comment interactions with localStorage persistence
 *   - Light theme with CSUN red accents (#CC0033)
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

type FeedCategory = 'all' | 'announcements' | 'clubs' | 'study-groups' | 'discussions' | 'events' | 'jobs';

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorRole?: 'student' | 'admin' | 'club' | 'faculty'; // TODO: fetch from real users
  authorAvatar?: string;
  title?: string;
  content: string;
  category: FeedCategory;
  tags: string[];
  image?: string;
  timestamp: number; // ISO
  likes: number;
  comments: number;
  shares: number;
  liked?: boolean;
  saved?: boolean;
  verified?: boolean; // For official CSUN accounts
}

interface TrendingTopic {
  name: string;
  count: number;
  color: string;
}

interface Club {
  id: string;
  name: string;
  avatar: string;
  followers: number;
  category: string;
  featured: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// MOCK DATA — Replace with /api/v1/posts when backend is ready
// ────────────────────────────────────────────────────────────────────────────

const MOCK_POSTS: Post[] = [
  {
    id: 'post-1',
    authorId: 'user-csun-news',
    authorName: 'CSUN News',
    authorRole: 'admin',
    authorAvatar: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=50&h=50&fit=crop',
    title: 'Spring Career Fair Happening This Week',
    content: 'Join us this Thursday for the CSUN Career Fair! 100+ employers will be on campus. Bring resumes and business casual attire. Registration at career.csun.edu.',
    category: 'announcements',
    tags: ['Career', 'Networking', 'Opportunity'],
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=280&fit=crop',
    timestamp: Date.now() - 3600000,
    likes: 245,
    comments: 32,
    shares: 18,
    verified: true,
  },
  {
    id: 'post-2',
    authorId: 'gsce-club',
    authorName: 'CSUN Graphics Society',
    authorRole: 'club',
    authorAvatar: 'https://images.unsplash.com/photo-1550439062-1461da0ef1c7?w=50&h=50&fit=crop',
    content: 'Design workshop: Motion Graphics in After Effects - TODAY at 5 PM in Bookstein 130. All levels welcome! 🎨',
    category: 'clubs',
    tags: ['Design', 'Art', 'Workshop'],
    timestamp: Date.now() - 7200000,
    likes: 89,
    comments: 12,
    shares: 5,
    verified: true,
  },
  {
    id: 'post-3',
    authorId: 'user-pre-med',
    authorName: 'Priya K.',
    authorRole: 'student',
    content: 'Anyone forming a study group for Organic Chem 2? We can meet at the library this weekend. Message me!',
    category: 'study-groups',
    tags: ['Chemistry', 'STEM', 'Study'],
    timestamp: Date.now() - 10800000,
    likes: 34,
    comments: 8,
    shares: 2,
  },
  {
    id: 'post-4',
    authorId: 'as-events',
    authorName: 'AS Events',
    authorRole: 'club',
    content: 'Trevor Wallace comedy show SOLD OUT! But we have more acts coming. Check out our events calendar.',
    category: 'announcements',
    tags: ['Comedy', 'Entertainment', 'Event'],
    image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=500&h=280&fit=crop',
    timestamp: Date.now() - 14400000,
    likes: 412,
    comments: 67,
    shares: 45,
    verified: true,
  },
  {
    id: 'post-5',
    authorId: 'csun-jobs',
    authorName: 'CSUN Campus Jobs',
    authorRole: 'admin',
    title: 'Now Hiring: Student Tutors & Lab Assistants',
    content: 'CSUN Learning Resource Center is hiring peer tutors in Math, Chemistry, and Writing. $17.50/hr, flexible hours. Apply now at jobs.csun.edu.',
    category: 'jobs',
    tags: ['Hiring', 'Jobs', 'Campus'],
    timestamp: Date.now() - 18000000,
    likes: 156,
    comments: 28,
    shares: 12,
    verified: true,
  },
  {
    id: 'post-6',
    authorId: 'mecha-club',
    authorName: 'CSUN Robotics Club',
    authorRole: 'club',
    content: 'We just placed 2nd at the regional robotics competition! Huge props to our build team. Next competition in May. Join our team!',
    category: 'clubs',
    tags: ['Robotics', 'Achievement', 'STEM'],
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=280&fit=crop',
    timestamp: Date.now() - 21600000,
    likes: 298,
    comments: 43,
    shares: 22,
    verified: true,
  },
];

const TRENDING_TOPICS: TrendingTopic[] = [
  { name: '#CareerFair', count: 1240, color: '#CC0033' },
  { name: '#MorningThursday', count: 856, color: '#FF6B6B' },
  { name: '#STEM', count: 723, color: '#4ECDC4' },
  { name: '#StudentLife', count: 612, color: '#95E1D3' },
  { name: '#Networking', count: 541, color: '#FFE66D' },
];

const FEATURED_CLUBS: Club[] = [
  {
    id: 'club-1',
    name: 'CSUN Graphics Society',
    avatar: 'https://images.unsplash.com/photo-1550439062-1461da0ef1c7?w=80&h=80&fit=crop',
    followers: 342,
    category: 'Art & Design',
    featured: true,
  },
  {
    id: 'club-2',
    name: 'Robotics & Automation',
    avatar: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=80&h=80&fit=crop',
    followers: 287,
    category: 'STEM',
    featured: true,
  },
  {
    id: 'club-3',
    name: 'Pre-Med Student Association',
    avatar: 'https://images.unsplash.com/photo-1576091160550-112173f31c77?w=80&h=80&fit=crop',
    followers: 501,
    category: 'Health & Sciences',
    featured: true,
  },
  {
    id: 'club-4',
    name: 'Entrepreneurship Club',
    avatar: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=80&h=80&fit=crop',
    followers: 421,
    category: 'Business',
    featured: true,
  },
];

// ────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ────────────────────────────────────────────────────────────────────────────

function PageBackground() {
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Base - White */}
      <div style={{ position: 'absolute', inset: 0, background: '#ffffff' }} />
      
      {/* Subtle red accent - top right */}
      <motion.div
        style={{ position: 'absolute', top: '-10%', right: '-8%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(204, 0, 51, 0.04) 0%, rgba(204, 0, 51, 0.01) 40%, transparent 70%)', filter: 'blur(80px)' }}
        animate={{ x: [0, 15, -10, 0], y: [0, -15, 8, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Fine noise grain */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.02'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', opacity: 0.8, mixBlendMode: 'overlay' }} />
    </div>
  );
}

function NavBar() {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', background: 'rgba(255, 255, 255, 0.92)', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '1rem', height: 54 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #CC0033 0%, #9a0029 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'rgba(255,255,255,0.9)' }} />
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 13, color: '#111', letterSpacing: '0.02em' }}>
            CSUN <span style={{ color: '#CC0033' }}>Social</span>
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0.5, marginLeft: '2rem' }}>
          {['Feed', 'Clubs', 'Trending'].map((tab) => (
            <button key={tab}
              style={{ padding: '0.4rem 0.8rem', borderRadius: 8, border: 'none', background: tab === 'Feed' ? '#CC0033' : 'transparent', color: tab === 'Feed' ? '#fff' : '#666', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: tab === 'Feed' ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s' }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Back button */}
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={() => window.location.href = '/'}
            style={{ padding: '0.45rem 1rem', borderRadius: 8, border: '1px solid #ddd', background: '#f5f5f5', color: '#111', fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
            ← Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

interface CategoryFilterProps {
  active: FeedCategory;
  onFilter: (cat: FeedCategory) => void;
}

function CategoryFilter({ active, onFilter }: CategoryFilterProps) {
  const categories: { id: FeedCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'clubs', label: 'Clubs' },
    { id: 'study-groups', label: 'Study Groups' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'discussions', label: 'Discussions' },
  ];

  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '1rem 0', scrollbarWidth: 'none' }}>
      {categories.map((cat) => (
        <button key={cat.id} onClick={() => onFilter(cat.id)}
          style={{ padding: '0.5rem 0.875rem', borderRadius: 20, border: active === cat.id ? '1px solid #CC0033' : '1px solid #ddd', background: active === cat.id ? 'rgba(204, 0, 51, 0.08)' : '#f5f5f5', color: active === cat.id ? '#CC0033' : '#666', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: active === cat.id ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.18s' }}>
          {cat.label}
        </button>
      ))}
    </div>
  );
}

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
}

function PostCardComponent({ post, onLike }: PostCardProps) {
  const [liked, setLiked] = useState(post.liked || false);

  const handleLike = useCallback(() => {
    setLiked(!liked);
    onLike?.(post.id);
  }, [liked, post.id, onLike]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.875rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: post.authorAvatar ? `url(${post.authorAvatar})` : '#ddd', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600, color: '#111', fontSize: 14 }}>{post.authorName}</span>
              {post.verified && <span style={{ fontSize: 11, color: '#CC0033', fontWeight: 700 }}>✓</span>}
              <span style={{ fontSize: 12, color: '#999' }}>·</span>
              <span style={{ fontSize: 12, color: '#999' }}>{Math.floor((Date.now() - post.timestamp) / 60000)}m ago</span>
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
              {post.authorRole === 'admin' && 'CSUN Official'}
              {post.authorRole === 'club' && 'Club'}
              {post.authorRole === 'student' && 'Student'}
            </div>
          </div>
          <button style={{ padding: '0.4rem 0.6rem', borderRadius: 6, border: 'none', background: '#f5f5f5', color: '#999', fontSize: 12, cursor: 'pointer' }}>⋮</button>
        </div>

        {/* Title and content */}
        {post.title && (
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 0.5rem 0', fontFamily: "'Syne', sans-serif" }}>{post.title}</h3>
        )}
        <p style={{ fontSize: 14, color: '#333', lineHeight: 1.5, margin: '0 0 0.875rem 0' }}>{post.content}</p>

        {/* Image */}
        {post.image && (
          <div style={{ width: '100%', height: 200, borderRadius: 8, background: `url(${post.image})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '0.875rem' }} />
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: '0.875rem', flexWrap: 'wrap' }}>
            {post.tags.map((tag) => (
              <span key={tag} style={{ fontSize: 12, color: '#CC0033', background: 'rgba(204, 0, 51, 0.08)', padding: '0.25rem 0.5rem', borderRadius: 4 }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Engagement metrics */}
        <div style={{ fontSize: 12, color: '#999', borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
          {liked ? liked + 1 : post.likes} likes · {post.comments} comments · {post.shares} shares
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '0.75rem' }}>
          <button onClick={handleLike} style={{ flex: 1, padding: '0.5rem', border: 'none', background: 'transparent', color: liked ? '#CC0033' : '#666', fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: 'pointer', borderRadius: 6, transition: 'all 0.2s' }}>
            {liked ? '❤️' : '🤍'} Like
          </button>
          <button style={{ flex: 1, padding: '0.5rem', border: 'none', background: 'transparent', color: '#666', fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: 'pointer', borderRadius: 6 }}>
            💬 Comment
          </button>
          <button style={{ flex: 1, padding: '0.5rem', border: 'none', background: 'transparent', color: '#666', fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: 'pointer', borderRadius: 6 }}>
            ↗️ Share
          </button>
        </div>
      </div>
    </motion.div>
  );
}

interface TrendingSidebarProps {
  topics: TrendingTopic[];
  clubs: Club[];
}

function TrendingSidebar({ topics, clubs }: TrendingSidebarProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Trending Topics */}
      <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: '1.25rem' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 1rem 0', fontFamily: "'Syne', sans-serif" }}>Trending Now</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {topics.map((topic) => (
            <div key={topic.name} onClick={() => {}} style={{ padding: '0.75rem', borderRadius: 8, background: '#f5f5f5', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: topic.color }}>{topic.name}</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{topic.count.toLocaleString()} posts</div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Clubs */}
      <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: '1.25rem' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 1rem 0', fontFamily: "'Syne', sans-serif" }}>Featured Clubs</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {clubs.map((club) => (
            <div key={club.id} style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `url(${club.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{club.name}</div>
                <div style={{ fontSize: 11, color: '#999' }}>{club.followers} followers</div>
              </div>
              <button style={{ padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid #CC0033', background: 'transparent', color: '#CC0033', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div style={{ background: '#f5f5f5', borderRadius: 12, padding: '1rem', fontSize: 12, color: '#888', lineHeight: 1.6 }}>
        <p style={{ margin: 0 }}>
          <strong>Campus Connect Social</strong> is CSUN's community hub. Share your experience, discover peers, and stay connected to campus life.
        </p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ────────────────────────────────────────────────────────────────────────────

export default function SocialHubPage() {
  const [activeCategory, setActiveCategory] = useState<FeedCategory>('all');
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);

  // Filter posts by category
  const filteredPosts = useMemo(() => {
    if (activeCategory === 'all') return posts;
    return posts.filter((p) => p.category === activeCategory);
  }, [posts, activeCategory]);

  const handleLike = useCallback((postId: string) => {
    // TODO: Call API to persist like
    console.log(`Liked post: ${postId}`);
  }, []);

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap" />
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(204, 0, 51, 0.2); border-radius: 2px; }
      `}</style>

      <div style={{ minHeight: '100vh', position: 'relative', color: '#111' }}>
        <PageBackground />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <NavBar />

          <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 2rem' }}>
            {/* Hero / Header */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
              style={{ padding: '2rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.1, letterSpacing: '-1.5px', color: '#111', margin: '0 0 0.5rem 0' }}>
                Campus Conversations
              </h1>
              <p style={{ color: '#666', fontSize: 15, maxWidth: 500, margin: '0', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
                Stay connected with your peers, discover clubs, and stay in the loop on everything happening at CSUN.
              </p>
            </motion.div>

            {/* Category filter */}
            <CategoryFilter active={activeCategory} onFilter={setActiveCategory} />

            {/* Main content grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', padding: '2rem 0' }}>
              {/* Feed (left/center) */}
              <div style={{ gridColumn: 'span 1', minWidth: 0 }}>
                <AnimatePresence mode="wait">
                  {filteredPosts.length > 0 ? (
                    <motion.div key={activeCategory} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                      {filteredPosts.map((post) => (
                        <PostCardComponent key={post.id} post={post} onLike={handleLike} />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                      <p>No posts yet in this category. Be the first to share!</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sidebar (right) */}
              <div style={{ gridColumn: 'span 1, minWidth: 0' }}>
                <TrendingSidebar topics={TRENDING_TOPICS} clubs={FEATURED_CLUBS} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
