'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { AudienceId, CategoryId, EventItem } from './types';
import EventGridCard from './components/EventGridCard';
import EventDetailsModal from './components/EventDetailsModal';
import EventRegisterModal from './components/EventRegisterModal';

const categories: { id: CategoryId; name: string; icon: string; color: string }[] = [
  { id: 'all',       name: 'All Events',         icon: '', color: '#D22030' },
  { id: 'academic',  name: 'Academic',           icon: '', color: '#3b82f6' },
  { id: 'career',    name: 'Career & Jobs',      icon: '', color: '#10b981' },
  { id: 'social',    name: 'Social',             icon: '', color: '#f59e0b' },
  { id: 'wellness',  name: 'Wellness',           icon: '', color: '#8b5cf6' },
  { id: 'sports',    name: 'Sports',             icon: '', color: '#ef4444' },
  { id: 'arts',      name: 'Arts & Culture',     icon: '', color: '#ec4899' },
  { id: 'workshop',  name: 'Workshops',          icon: '', color: '#06b6d4' },
];

const audiences: { id: AudienceId; name: string }[] = [
  { id: 'all',       name: 'All Students' },
  { id: 'undergrad', name: 'Undergraduates' },
  { id: 'graduate',  name: 'Graduate Students' },
  { id: 'alumni',    name: 'Alumni' },
];

function getCategoryColor(categoryId: CategoryId) {
  return categories.find((c) => c.id === categoryId)?.color || '#D22030';
}

function buildICS(e: EventItem) {
  // Basic ICS content for download
  const dtStart = e.startISO ? e.startISO.replace(/[-:]/g, '').replace('.000', '').replace(/Z$/, 'Z') : '';
  const dtEnd   = e.endISO   ? e.endISO.replace(/[-:]/g, '').replace('.000', '').replace(/Z$/, 'Z')   : '';
  const uid = `campusconnect-${e.id}@csun.edu`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusConnect//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    dtStart ? `DTSTART:${dtStart}` : '',
    dtEnd   ? `DTEND:${dtEnd}`     : '',
    `UID:${uid}`,
    `SUMMARY:${e.title.replace(/\n/g, ' ')}`,
    `DESCRIPTION:${e.fullDescription.replace(/\n/g, ' ')}`,
    `LOCATION:${e.location} (${e.building})`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);
  return lines.join('\r\n');
}

const initialEvents: EventItem[] = [
  // ==== Your originals (dates bumped to current academic year) ====
  {
    id: 1,
    title: 'Career Fair: Tech Industry',
    shortDescription: 'Connect with leading tech companies and explore career opportunities.',
    fullDescription:
      "Join us for CSUN's largest tech career fair featuring representatives from Google, Microsoft, Amazon, and 50+ companies. Resume reviews, mock interviews, and real recruiting.",
    category: 'career',
    date: 'Dec 15, 2025',
    time: '10:00 AM – 4:00 PM',
    startISO: '2025-12-15T10:00:00-08:00',
    endISO:   '2025-12-15T16:00:00-08:00',
    location: 'University Student Union - Grand Salon',
    building: 'USU, Grand Salon, 2nd Floor',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=700&fit=crop',
    price: 'Free',
    capacity: 500,
    registered: 342,
    audience: ['undergrad', 'graduate', 'alumni'],
    organizer: 'Career Center',
    contact: 'career@csun.edu',
    phone: '(818) 677-2878',
    speakers: [
      { name: 'Sarah Chen', title: 'Google Recruiter' },
      { name: 'Michael Rodriguez', title: 'Amazon Talent Acquisition' },
    ],
    agenda: [
      { time: '10:00 AM', activity: 'Check-in & Networking' },
      { time: '11:00 AM', activity: 'Resume Review Sessions' },
      { time: '1:00 PM',  activity: 'Mock Interviews' },
      { time: '3:00 PM',  activity: 'Industry Panel Discussion' },
    ],
    tags: ['Networking', 'Tech', 'Internships'],
    hybrid: true,
    accessibility: 'Wheelchair accessible, ASL interpreter available',
    parking: 'Available in B3 lot with validation',
    featured: true,
    trending: true,
    freebies: ['Free company swag', 'Resume checks'],
  },
  {
    id: 2,
    title: 'Matador Nights: Winter Wonderland',
    shortDescription: 'End-of-semester celebration with food, games, and entertainment.',
    fullDescription:
      'Celebrate the end of finals with free food, carnival games, photo booths, live music, and giveaways! A beloved CSUN tradition.',
    category: 'social',
    date: 'Dec 18, 2025',
    time: '7:00 PM – 11:00 PM',
    startISO: '2025-12-18T19:00:00-08:00',
    endISO:   '2025-12-18T23:00:00-08:00',
    location: 'Matador Square',
    building: 'Outdoor Plaza, Main Courtyard',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=700&fit=crop',
    price: 'Free',
    capacity: 2000,
    registered: 1567,
    audience: ['all'],
    organizer: 'Associated Students',
    contact: 'as@csun.edu',
    phone: '(818) 677-2875',
    speakers: [],
    agenda: [
      { time: '7:00 PM', activity: 'Gates Open - Food & Games' },
      { time: '8:00 PM', activity: 'Live Band Performance' },
      { time: '9:30 PM', activity: 'DJ Set & Dancing' },
    ],
    tags: ['Free Food', 'Entertainment', 'Music'],
    hybrid: false,
    accessibility: 'Fully accessible venue',
    parking: 'Free parking after 6 PM',
    featured: true,
    trending: true,
    freebies: ['Free food', 'T-shirt giveaway'],
  },
  {
    id: 3,
    title: 'Research Symposium: Innovation in STEM',
    shortDescription: 'Showcase of student research projects.',
    fullDescription:
      'Annual research symposium featuring cutting-edge student and faculty research in Science, Technology, Engineering, and Mathematics.',
    category: 'academic',
    date: 'Dec 20, 2025',
    time: '9:00 AM – 5:00 PM',
    startISO: '2025-12-20T09:00:00-08:00',
    endISO:   '2025-12-20T17:00:00-08:00',
    location: 'Oviatt Library',
    building: 'Delmar T. Oviatt Library',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&h=700&fit=crop',
    price: 'Free',
    capacity: 300,
    registered: 178,
    audience: ['undergrad', 'graduate'],
    organizer: 'Office of Research',
    contact: 'research@csun.edu',
    phone: '(818) 677-2901',
    speakers: [{ name: 'Dr. Lisa Wang', title: 'NASA Scientist' }],
    agenda: [
      { time: '9:00 AM',  activity: 'Registration & Coffee' },
      { time: '10:00 AM', activity: 'Keynote Address' },
      { time: '11:00 AM', activity: 'Poster Sessions' },
    ],
    tags: ['Research', 'STEM', 'Academic'],
    hybrid: true,
    accessibility: 'Wheelchair accessible',
    parking: 'Visitor parking in B5 lot',
    featured: true,
  },
  {
    id: 4,
    title: 'Mindfulness & Meditation Workshop',
    shortDescription: 'Learn stress-reduction techniques.',
    fullDescription:
      'Join our certified wellness instructor for mindfulness meditation and stress management strategies.',
    category: 'wellness',
    date: 'Dec 14, 2025',
    time: '12:00 PM – 1:30 PM',
    startISO: '2025-12-14T12:00:00-08:00',
    endISO:   '2025-12-14T13:30:00-08:00',
    location: 'Student Recreation Center',
    building: 'SRC, Mind & Body Studio',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=700&fit=crop',
    price: 'Free',
    capacity: 30,
    registered: 28,
    audience: ['all'],
    organizer: 'University Counseling Services',
    contact: 'counseling@csun.edu',
    phone: '(818) 677-2366',
    speakers: [{ name: 'Amanda Green', title: 'Meditation Instructor' }],
    agenda: [
      { time: '12:00 PM', activity: 'Introduction' },
      { time: '12:20 PM', activity: 'Guided Meditation' },
    ],
    tags: ['Wellness', 'Mental Health'],
    hybrid: true,
    accessibility: 'Wheelchair accessible',
    parking: 'SRC parking available',
  },

  // ==== NEW: Arts & Culture ====
  {
    id: 5,
    title: 'CSUN Student Film Festival: Red Carpet Night',
    shortDescription: 'Premiere of student shorts with Q&A and red carpet photos.',
    fullDescription:
      'Walk the red carpet and watch award-worthy student short films. Meet the directors, vote for Audience Choice, and enjoy a post-screening mixer.',
    category: 'arts',
    date: 'Jan 24, 2026',
    time: '6:30 PM – 9:30 PM',
    startISO: '2026-01-24T18:30:00-08:00',
    endISO:   '2026-01-24T21:30:00-08:00',
    location: 'Armer Theater',
    building: 'MZ 100',
    image: 'https://images.unsplash.com/photo-1517602302552-471fe67acf66?w=1200&h=700&fit=crop',
    price: 'Free w/ RSVP',
    capacity: 350,
    registered: 210,
    audience: ['all', 'alumni'],
    organizer: 'Department of Cinema & Television Arts',
    contact: 'film@csun.edu',
    phone: '(818) 677-3192',
    speakers: [{ name: 'Student Directors', title: 'CTVA' }],
    agenda: [
      { time: '6:30 PM', activity: 'Red Carpet & Photos' },
      { time: '7:00 PM', activity: 'Shorts Block 1' },
      { time: '8:15 PM', activity: 'Shorts Block 2 + Q&A' },
      { time: '9:10 PM', activity: 'Awards & Mixer' },
    ],
    tags: ['Film', 'CTVA', 'Red Carpet'],
    hybrid: false,
    accessibility: 'Wheelchair accessible seating available',
    parking: 'B1/B2 garages',
    featured: true,
    freebies: ['Photo booth prints'],
  },

  // ==== NEW: Career / Entrepreneurship ====
  {
    id: 6,
    title: 'Startup Pitch Competition – $10K in Prizes',
    shortDescription: 'Pitch your startup to judges from LA’s tech ecosystem.',
    fullDescription:
      'Teams have 5 minutes to pitch and 5 minutes of Q&A. Mentors from local VCs & accelerators. Top teams split $10,000 in non-dilutive prizes.',
    category: 'career',
    date: 'Feb 5, 2026',
    time: '5:00 PM – 8:00 PM',
    startISO: '2026-02-05T17:00:00-08:00',
    endISO:   '2026-02-05T20:00:00-08:00',
    location: 'Bookstein Hall',
    building: 'BH 411',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&h=700&fit=crop',
    price: 'Free (teams must apply)',
    capacity: 200,
    registered: 150,
    audience: ['undergrad', 'graduate', 'alumni'],
    organizer: 'Entrepreneurship Club',
    contact: 'eclub@csun.edu',
    phone: '(818) 677-XXXX',
    speakers: [
      { name: 'VC Panel', title: 'Guest Judges' },
      { name: 'A. Patel', title: 'Techstars Mentor' },
    ],
    agenda: [
      { time: '5:00 PM', activity: 'Check-in & Networking' },
      { time: '5:30 PM', activity: 'Opening Remarks' },
      { time: '5:40 PM', activity: 'Team Pitches' },
      { time: '7:30 PM', activity: 'Awards & Photos' },
    ],
    tags: ['Entrepreneurship', 'Pitch', 'Prizes'],
    hybrid: false,
    accessibility: 'Elevator access available',
    parking: 'B3 lot',
    trending: true,
    freebies: ['Pizza & drinks'],
  },

  // ==== NEW: Social / Dance ====
  {
    id: 7,
    title: 'Salsa Night – Lessons + Social',
    shortDescription: 'Free beginner lessons followed by social dancing.',
    fullDescription:
      'No experience needed! Come with friends or solo. Learn fundamentals from pros, then dance the night away. Dress comfy.',
    category: 'social',
    date: 'Jan 31, 2026',
    time: '7:00 PM – 10:00 PM',
    startISO: '2026-01-31T19:00:00-08:00',
    endISO:   '2026-01-31T22:00:00-08:00',
    location: 'University Student Union',
    building: 'Grand Salon',
    image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=1200&h=700&fit=crop',
    price: 'Free',
    capacity: 400,
    registered: 260,
    audience: ['all'],
    organizer: 'CSUN Dance Club',
    contact: 'dance@csun.edu',
    phone: '(818) 677-XXXX',
    speakers: [{ name: 'StudioX Instructors', title: 'Guest Instructors' }],
    agenda: [
      { time: '7:00 PM', activity: 'Beginner Lesson' },
      { time: '8:00 PM', activity: 'Social Dancing' },
      { time: '9:45 PM', activity: 'Group Photo' },
    ],
    tags: ['Dance', 'Latin', 'Social'],
    hybrid: false,
    accessibility: 'Wheelchair accessible',
    parking: 'B3 lot',
    freebies: ['Bottled water'],
  },

  // ==== NEW: Workshop / Academic (AI) ====
  {
    id: 8,
    title: 'AI & Machine Learning Workshop: Build Your First Neural Net',
    shortDescription: 'Hands-on intro—train, test, and visualize a simple NN.',
    fullDescription:
      'Bring your laptop. We’ll use hosted notebooks (no installs) to build a small image classifier. Great first step into ML.',
    category: 'workshop',
    date: 'Jan 27, 2026',
    time: '2:00 PM – 5:00 PM',
    startISO: '2026-01-27T14:00:00-08:00',
    endISO:   '2026-01-27T17:00:00-08:00',
    location: 'Jacaranda Hall',
    building: 'JD 1568 Lab',
    image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=1200&h=700&fit=crop',
    price: 'Free (limited seats)',
    capacity: 40,
    registered: 35,
    audience: ['undergrad', 'graduate'],
    organizer: 'CS Department',
    contact: 'cs@csun.edu',
    phone: '(818) 677-XXXX',
    speakers: [{ name: 'Dr. Nguyen', title: 'ML Researcher' }],
    agenda: [
      { time: '2:00 PM', activity: 'Setup & Notebook' },
      { time: '2:30 PM', activity: 'Model Building' },
      { time: '3:30 PM', activity: 'Training & Evaluation' },
      { time: '4:30 PM', activity: 'Q&A / Next Steps' },
    ],
    tags: ['AI', 'ML', 'Coding'],
    hybrid: true,
    accessibility: 'Wheelchair accessible, captions',
    parking: 'B5 lot',
    featured: true,
    freebies: ['Stickers'],
  },

  // ==== NEW: Sports ====
  {
    id: 9,
    title: 'Bicycle Race Game – CSUN vs UC Riverside',
    shortDescription: 'Pack the Matadome! Free pizza for first 300 students.',
    fullDescription:
      'Cheer on the Matadors in a high-energy rivalry game. Wear red! Giveaways during halftime.',
    category: 'sports',
    date: 'Feb 12, 2026',
    time: '6:30 PM – 9:00 PM',
    startISO: '2026-02-12T18:30:00-08:00',
    endISO:   '2026-02-12T21:00:00-08:00',
    location: 'The Matadome',
    building: 'Redwood Hall',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&h=700&fit=crop',
    price: 'Free w/ CSUN ID',
    capacity: 2500,
    registered: 1900,
    audience: ['all', 'alumni'],
    organizer: 'Athletics',
    contact: 'athletics@csun.edu',
    phone: '(818) 677-XXXX',
    speakers: [],
    agenda: [
      { time: '6:30 PM', activity: 'Doors Open' },
      { time: '7:00 PM', activity: 'Tip Off' },
      { time: '8:00 PM', activity: 'Halftime Giveaways' },
    ],
    tags: ['Game Day', 'Giveaways', 'Spirit'],
    hybrid: false,
    accessibility: 'Accessible seating available',
    parking: 'F5/F6 lots',
    trending: true,
    freebies: ['Pizza', 'Foam fingers'],
  },

  // ==== NEW: Theatre ====
  {
    id: 10,
    title: 'Shakespeare in the Quad – “Much Ado About Nothing”',
    shortDescription: 'Outdoor theatre performance under the lights.',
    fullDescription:
      'Bring a blanket or lawn chair and enjoy a modern, student-directed production with live music.',
    category: 'arts',
    date: 'Mar 6, 2026',
    time: '7:00 PM – 9:00 PM',
    startISO: '2026-03-06T19:00:00-08:00',
    endISO:   '2026-03-06T21:00:00-08:00',
    location: 'Matador Walk (The Quad)',
    building: 'Outdoor Stage',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&h=700&fit=crop',
    price: 'Free',
    capacity: 500,
    registered: 260,
    audience: ['all', 'alumni'],
    organizer: 'Theatre Department',
    contact: 'theatre@csun.edu',
    phone: '(818) 677-XXXX',
    speakers: [{ name: 'Student Cast', title: 'Directed by M. Lopez' }],
    agenda: [
      { time: '7:00 PM', activity: 'Act I' },
      { time: '7:50 PM', activity: 'Intermission' },
      { time: '8:00 PM', activity: 'Act II' },
    ],
    tags: ['Theatre', 'Shakespeare', 'Outdoors'],
    hybrid: false,
    accessibility: 'Accessible seating zones',
    parking: 'B2/B3 after 6 PM',
  },

  // ==== NEW: Grad School Prep ====
  {
    id: 11,
    title: 'Graduate School Workshop – USC & UCLA Advisors',
    shortDescription: 'Applications, statements of purpose, funding Q&A.',
    fullDescription:
      'Advisors from USC & UCLA share tips on crafting strong applications and finding funding. Bring questions!',
    category: 'academic',
    date: 'Jan 22, 2026',
    time: '3:00 PM – 4:30 PM',
    startISO: '2026-01-22T15:00:00-08:00',
    endISO:   '2026-01-22T16:30:00-08:00',
    location: 'Sierra Hall',
    building: 'SH 190',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1200&h=700&fit=crop',
    price: 'Free (RSVP)',
    capacity: 120,
    registered: 80,
    audience: ['undergrad', 'graduate'],
    organizer: 'Graduate Studies',
    contact: 'grad@csun.edu',
    phone: '(818) 677-XXXX',
    speakers: [
      { name: 'USC Advisor Panel', title: 'Admissions' },
      { name: 'UCLA Advisor Panel', title: 'Admissions' },
    ],
    agenda: [
      { time: '3:00 PM', activity: 'Admissions Overview' },
      { time: '3:35 PM', activity: 'Funding & Fellowships' },
      { time: '4:00 PM', activity: 'Q&A' },
    ],
    tags: ['Grad School', 'Applications', 'Funding'],
    hybrid: true,
    accessibility: 'Captions provided',
    parking: 'B2 lot',
    freebies: ['Guide PDF'],
  },

  // ==== NEW: Training Fair (Training For dogs!) ====
  {
    id: 12,
    title: 'Dog Training',
    shortDescription: 'Dog Training resources, free snacks, and puppy train.',
    fullDescription:
      'De-stress before midterms. Meet campus counselors, grab snacks, and hang out with certified dog trainers.',
    category: 'wellness',
    date: 'Feb 26, 2026',
    time: '11:00 AM – 2:00 PM',
    startISO: '2026-02-26T11:00:00-08:00',
    endISO:   '2026-02-26T14:00:00-08:00',
    location: 'USU Plaza del Sol',
    building: 'USU',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=700&fit=crop',
    price: 'Free',
    capacity: 800,
    registered: 420,
    audience: ['all'],
    organizer: 'University Counseling Services',
    contact: 'counseling@csun.edu',
    phone: '(818) 677-2366',
    speakers: [],
    agenda: [
      { time: '11:00 AM', activity: 'Booths Open' },
      { time: '12:00 PM', activity: 'Mindfulness Mini-Session' },
      { time: '1:00 PM',  activity: 'Service Dogs and Trainers Meet & Greet' },
    ],
    tags: ['Trainers', 'Service Dogs', 'Snacks'],
    hybrid: false,
    accessibility: 'Wheelchair accessible',
    parking: 'G3/G4',
    freebies: ['Snacks', 'Stress balls'],
  },
];

const EventsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [selectedAudience, setSelectedAudience] = useState<AudienceId>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set<number>());
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registrationData, setRegistrationData] = useState({ name: '', email: '', phone: '' });

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const base = events.filter((event) => {
      const matchesSearch =
        !q ||
        event.title.toLowerCase().includes(q) ||
        event.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        event.shortDescription.toLowerCase().includes(q);

      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      const matchesAudience =
        selectedAudience === 'all' ||
        event.audience.includes(selectedAudience) ||
        event.audience.includes('all');

      return matchesSearch && matchesCategory && matchesAudience;
    });

    // Surface featured/trending first, then alphabetically
    return [...base].sort((a, b) => {
      const aScore = (a.featured ? 2 : 0) + (a.trending ? 1 : 0);
      const bScore = (b.featured ? 2 : 0) + (b.trending ? 1 : 0);
      if (bScore !== aScore) return bScore - aScore;
      return a.title.localeCompare(b.title);
    });
  }, [events, searchQuery, selectedCategory, selectedAudience]);

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleRegister = (event: EventItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedEvent(event);
    setShowRegisterModal(true);
  };

  const submitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    // Optimistically update registrations
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === selectedEvent.id && ev.registered < ev.capacity
          ? { ...ev, registered: ev.registered + 1 }
          : ev
      )
    );

    alert(
      ` Registration successful for "${selectedEvent.title}".\nA confirmation will be sent to ${registrationData.email}.`
    );
    setShowRegisterModal(false);
    setRegistrationData({ name: '', email: '', phone: '' });
  };

  const addToCalendar = (event: EventItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const ics = buildICS(event);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `${event.title.replace(/\s+/g, '_')}.ics`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareEvent = async (event: EventItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}/events#event-${event.id}`; // simple anchor link
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
        alert(` Share link copied!\n\n"${event.title}"`);
      } else {
        throw new Error('Clipboard not available');
      }
    } catch {
      alert(` Share link:\n${link}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1e2e 0%, #2a1a3d 100%)', position: 'relative' }}>
      <motion.div
        aria-hidden
        style={{
          position: 'fixed',
          top: '-10%',
          left: '-10%',
          width: '520px',
          height: '520px',
          borderRadius: '999px',
          background: 'rgba(210, 32, 48, 0.14)',
          filter: 'blur(120px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
        animate={{ x: [0, 30, -20, 0], y: [0, -25, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        style={{
          position: 'fixed',
          right: '-8%',
          top: '18%',
          width: '420px',
          height: '420px',
          borderRadius: '999px',
          background: 'rgba(56, 189, 248, 0.1)',
          filter: 'blur(110px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
        animate={{ x: [0, -35, 10, 0], y: [0, 20, -15, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(210, 32, 48, 0.95) 0%, rgba(139, 25, 35, 0.95) 100%)',
            color: 'white',
            padding: '4rem 2rem',
          }}
        >
          <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '0.5rem 1.5rem',
                borderRadius: '50px',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
               DISCOVER OPPORTUNITIES AT CSUN
            </div>

            <h1 style={{ fontSize: '4.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-2px' }}>
              Campus Events Hub
            </h1>
            <p style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.9 }}>
              Explore workshops, career fairs, social gatherings, and academic events
            </p>

            {/* Search */}
            <div
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                maxWidth: '900px',
                margin: '0 auto 2rem',
              }}
            >
              <svg style={{ marginLeft: '1rem', color: '#6b7280' }} width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search events, tags, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1.125rem',
                  fontWeight: 500,
                }}
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  background: showFilters ? '#D22030' : '#f3f4f6',
                  color: showFilters ? 'white' : '#374151',
                  padding: '1rem 1.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Filters
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
              {[
                { icon: '', label: 'Events', value: `${events.length}+` },
                { icon: '', label: 'Categories', value: `${categories.length - 1}` },
                { icon: '', label: 'Students', value: '5.2K+' },
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '1.25rem 2rem',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>{stat.icon}</span>
                  <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stat.value}</div>
                    <div style={{ fontSize: '0.875rem' }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            background: 'rgba(30, 30, 46, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.25rem 2rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto' }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '16px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    border: selectedCategory === cat.id ? `2px solid ${cat.color}` : '2px solid transparent',
                    cursor: 'pointer',
                    background: selectedCategory === cat.id ? cat.color : 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div
            style={{
              background: 'rgba(30, 30, 46, 0.9)',
              padding: '1.5rem 2rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div
              style={{
                maxWidth: '1400px',
                margin: '0 auto',
                display: 'flex',
                gap: '2rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', color: 'white', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Audience
                </label>
                <select
                  value={selectedAudience}
                  onChange={(e) => setSelectedAudience(e.target.value as AudienceId)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  {audiences.map((aud) => (
                    <option key={aud.id} value={aud.id} style={{ background: '#1e1e2e' }}>
                      {aud.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', color: 'white', fontWeight: 600, marginBottom: '0.5rem' }}>
                  View
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setViewMode('grid')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: 'none',
                      background: viewMode === 'grid' ? '#D22030' : 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: 'none',
                      background: viewMode === 'list' ? '#D22030' : 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem' }}>
          <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>
            {selectedCategory === 'all' ? 'All Events' : categories.find((c) => c.id === selectedCategory)?.name}
            <span style={{ color: '#D22030', marginLeft: '1rem' }}>({filteredEvents.length})</span>
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(380px, 1fr))' : '1fr',
              gap: '2rem',
            }}
          >
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((event, idx) => (
                <motion.div
                  layout
                  key={event.id}
                  id={`event-${event.id}`}
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -14, scale: 0.97 }}
                  transition={{ delay: idx * 0.03, type: 'spring', stiffness: 170, damping: 22 }}
                  whileHover={{ y: -8, scale: 1.012 }}
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowEventModal(true);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.18)',
                  }}
                >
                  <EventGridCard
                    event={event}
                    isFavorite={favorites.has(event.id)}
                    onToggleFavorite={toggleFavorite}
                    onRegister={handleRegister}
                    onAddToCalendar={addToCalendar}
                    onShare={shareEvent}
                    getCategoryColor={getCategoryColor}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <EventDetailsModal
          open={showEventModal}
          event={selectedEvent}
          onClose={() => setShowEventModal(false)}
          onRegister={handleRegister}
          onAddToCalendar={addToCalendar}
          getCategoryColor={getCategoryColor}
        />

        <EventRegisterModal
          open={showRegisterModal}
          event={selectedEvent}
          registrationData={registrationData}
          setRegistrationData={setRegistrationData}
          onClose={() => setShowRegisterModal(false)}
          onSubmit={submitRegistration}
          getCategoryColor={getCategoryColor}
        />
      </div>
    </div>
  );
};

export default EventsPage;
