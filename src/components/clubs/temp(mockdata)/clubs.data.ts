// ═══════════════════════════════════════════════════════════════════════════════
// clubs.data.ts — Types, categories, and static club list
// ═══════════════════════════════════════════════════════════════════════════════
//
//  TO SWITCH TO SUPABASE — replace the CLUBS constant with:
//
//   import { createClient } from '@supabase/supabase-js'
//   const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
//
//   export async function getClubs(): Promise<Club[]> {
//     const { data, error } = await supabase.from('clubs').select('*').order('name')
//     if (error) throw error
//     return data ?? []
//   }
//
//   In your Server Component (page.tsx):
//     const clubs = await getClubs()   ← replaces static CLUBS import
//
// ═══════════════════════════════════════════════════════════════════════════════

export type ClubCategory =
  | "STEM" | "Business" | "Arts" | "Cultural"
  | "Sports" | "Literature" | "Fraternity" | "Sorority"
  | string; // allow future DB-driven categories

// Hub card data (lightweight — no posts/events/members)
// BACKEND: Supabase table `clubs` — partial select for hub grid
export type Club = {
  id: string;
  slug?: string;
  name: string;
  category?: ClubCategory;
  description?: string;
  tagline?: string;
  tags?: string[];        // BACKEND: clubs.tags text[]
  logoUrl?: string;       // BACKEND: Supabase Storage — clubs.logo_url
  bannerUrl?: string;     // BACKEND: Supabase Storage — clubs.banner_url
  href?: string;          // BACKEND: computed as `/clubs/${id}` — don't store in DB
  story?: string;
  card?: {                // BACKEND: JSONB column clubs.card — leadership-editable
    headline?: string;
    blurb?: string;
    chips?: string[];
  };
};

// Full profile data for ClubProfilePage
// BACKEND: SELECT * FROM clubs WHERE id = :clubId
export type ClubDetail = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  introMessage: string;   // BACKEND: clubs.intro_message
  logoUrl?: string;
  bannerUrl?: string;
  accentColor: string;    // BACKEND: clubs.accent_color
  discordUrl?: string;
  memberCount: number;    // BACKEND: COUNT(*) FROM club_members WHERE club_id = id
  category: string;
  founded: string;
};

// BACKEND: Supabase table `club_members`
export type ClubMember = {
  id: string;
  name: string;
  avatar?: string;
  role: "President" | "VP" | "Officer" | "Member";
  joinedAt: string;
  major?: string;
  blocked?: boolean;
};

// BACKEND: Supabase table `club_posts`
// Any member can post; leadership-only editing enforced via Supabase RLS policy
export type ClubPost = {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  images?: string[];
  createdAt: string;
  likes: number;
  liked: boolean; // BACKEND: JOIN club_post_likes WHERE user_id = current_user
  comments: { id: string; author: string; text: string }[];
};

// BACKEND: Supabase table `club_events`
export type ClubEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  cover?: string;
  rsvpCount: number; // BACKEND: COUNT(*) FROM club_event_rsvps WHERE event_id = id
  rsvped: boolean;   // BACKEND: check club_event_rsvps WHERE user_id = current_user
};

// ─── FILTER CATEGORIES ────────────────────────────────────────────────────────
// BACKEND: Replace with:
//   const { data } = await supabase.from('clubs').select('category').order('category')
//   export const CLUB_CATEGORIES = [...new Set(data?.map(r => r.category))]
export const CLUB_CATEGORIES: ClubCategory[] = [
  "STEM", "Business", "Arts", "Cultural",
  "Sports", "Literature", "Fraternity", "Sorority",
];

// ─── STATIC CLUB LIST ─────────────────────────────────────────────────────────
// BACKEND: Replace with: const clubs = await getClubs()
// Unsplash images are placeholders — replace with Supabase Storage bucket URLs
export const CLUBS: Club[] = [
  // Robotics & AI — robot arm banner, circuit board logo
  { id: "club-001", name: "Robotics & AI Society", category: "STEM", tagline: "Building the future, one bot at a time.", description: "A community of builders exploring robotics and AI through projects, workshops, and competitions.", tags: ["Robotics", "AI", "Projects"], logoUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=256&h=256&fit=crop&auto=format", bannerUrl: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=1400&h=400&fit=crop&auto=format", href: "/clubs/club-001", card: { headline: "Weekly builds and workshops", blurb: "Hands-on robotics, perception, and autonomy.", chips: ["ROS", "Vision", "Competitions"] } },
  // ACM — code on laptop banner, keyboard logo
  { id: "club-002", name: "ACM", category: "STEM", tagline: "Build. Ship. Connect.", description: "Student chapter focused on software, workshops, and networking.", tags: ["Workshops", "Teams", "Career"], logoUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=256&h=256&fit=crop&auto=format", bannerUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1400&h=400&fit=crop&auto=format", href: "/clubs/club-002", card: { headline: "Workshops and project teams", blurb: "Learn by building with friends.", chips: ["Hack Nights", "LeetCode", "Mentorship"] } },
  // IEEE — circuit/PCB banner, electrical components logo
  { id: "club-003", name: "IEEE Student Branch", category: "STEM", tagline: "Hands-on engineering.", description: "Projects, competitions, and speaker events for engineering students.", tags: ["Hardware", "Competitions", "Speakers"], logoUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=256&h=256&fit=crop&auto=format", bannerUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1400&h=400&fit=crop&auto=format", href: "/clubs/club-003", card: { headline: "Build hardware, ship projects", blurb: "Prototype, test, and compete.", chips: ["Circuits", "Embedded", "Talks"] } },
  // Game Dev — game controller banner, game setup logo
  { id: "club-004", name: "Game Dev Club", category: "Arts", tagline: "Make games with friends.", description: "Game jams, mentorship, and portfolio projects for all skill levels.", tags: ["Game Jams", "Unity", "Portfolio"], logoUrl: "https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=256&h=256&fit=crop&auto=format", bannerUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1400&h=400&fit=crop&auto=format", href: "/clubs/club-004", card: { headline: "Ship a game this month", blurb: "Jams, teams, and feedback loops.", chips: ["Jams", "Art", "Code"] } },
  // ASL Club — hands communicating banner, hands logo
  { id: "club-005", name: "ASL Club", category: "Cultural", tagline: "Connect through sign language.", description: "Learn American Sign Language, celebrate Deaf culture, and build bridges on campus.", tags: ["ASL", "Deaf Culture", "Language"], logoUrl: "https://images.unsplash.com/photo-1521220546621-cf34a1165c67?w=256&h=256&fit=crop&auto=format", bannerUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&h=400&fit=crop&auto=format", href: "/clubs/club-005", card: { headline: "Weekly sign circles", blurb: "All levels welcome — zero experience needed.", chips: ["Language", "Culture", "Workshops"] } },
  // Sports Club — soccer/sports field banner, ball logo
  { id: "club-006", name: "Matadors Sports Club", category: "Sports", tagline: "Compete. Train. Win.", description: "Recreational and competitive intramural leagues — soccer, basketball, volleyball, and more.", tags: ["Soccer", "Basketball", "Intramurals"], logoUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=256&h=256&fit=crop&auto=format", bannerUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1400&h=400&fit=crop&auto=format", href: "/clubs/club-006", card: { headline: "Join a team this semester", blurb: "Soccer, basketball, volleyball & more.", chips: ["Leagues", "Tournaments", "Fitness"] } },
  // Matadors Racing — race car / formula banner, wheel logo
  { id: "club-007", name: "Matadors Racing", category: "STEM", tagline: "Zero to sixty. Build it yourself.", description: "Design, build, and race formula-style EVs in national collegiate competitions.", tags: ["Motorsports", "EV", "Engineering"], logoUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=256&h=256&fit=crop&auto=format", bannerUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=400&fit=crop&auto=format", href: "/clubs/club-007", card: { headline: "Build a race car from scratch", blurb: "Mechanical, electrical & software all in one team.", chips: ["Formula SAE", "EV", "CAD"] } },
  // FASA — Filipino festival/lanterns banner, community logo
  { id: "club-008", name: "Filipino American Student Association", category: "Cultural", tagline: "Pride. Heritage. Community.", description: "FASA celebrates Filipino culture and provides a home away from home on campus.", tags: ["Filipino", "Culture", "Community"], logoUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=256&h=256&fit=crop&auto=format", bannerUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1400&h=400&fit=crop&auto=format", href: "/clubs/club-008", card: { headline: "Your home away from home", blurb: "Culture, community & real connections.", chips: ["PCN", "Service", "Heritage"] } },
  // Fraternity — group of guys / campus banner, handshake logo
  { id: "club-009", name: "Alpha Epsilon Pi", category: "Fraternity", tagline: "Brotherhood. Leadership. Service.", description: "A fraternity committed to developing leaders through brotherhood, philanthropy, and professional development.", tags: ["Brotherhood", "Leadership", "Philanthropy"], logoUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=256&h=256&fit=crop&auto=format", bannerUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1400&h=400&fit=crop&auto=format", href: "/clubs/club-009", card: { headline: "Rush AEPi this semester", blurb: "Brotherhood built on values and vision.", chips: ["Rush", "Philanthropy", "Greek Life"] } },
  // Creative Writing — typewriter banner, pen/notebook logo
  { id: "club-010", name: "Creative Writing Society", category: "Literature", tagline: "Words that move the world.", description: "Workshop-based club for fiction, poetry, and creative nonfiction writers at all levels.", tags: ["Fiction", "Poetry", "Workshops"], logoUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=256&h=256&fit=crop&auto=format", bannerUrl: "https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=1400&h=400&fit=crop&auto=format", href: "/clubs/club-010", card: { headline: "Write, workshop, publish", blurb: "Fiction, poetry, essays — all welcome.", chips: ["Workshops", "Open Mic", "Magazine"] } },
  // Marketing & Entrepreneurship — pitch/whiteboard banner, chart logo
  { id: "club-011", name: "Marketing & Entrepreneurship Club", category: "Business", tagline: "Build brands. Launch ideas.", description: "Connects marketers and entrepreneurs through case competitions, pitches, and industry speakers.", tags: ["Marketing", "Startups", "Networking"], logoUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=256&h=256&fit=crop&auto=format", bannerUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1400&h=400&fit=crop&auto=format", href: "/clubs/club-011", card: { headline: "Pitch, compete, network", blurb: "Case competitions and startup mentorship.", chips: ["Cases", "Pitch", "Branding"] } },
  // Sorority — women together / campus banner, group logo
  { id: "club-012", name: "Delta Phi Lambda", category: "Sorority", tagline: "Sisterhood. Service. Culture.", description: "A multicultural sorority rooted in Asian American interests — community service, academic excellence, and lifelong sisterhood.", tags: ["Sisterhood", "Service", "Culture"], logoUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=256&h=256&fit=crop&auto=format", bannerUrl: "https://images.unsplash.com/photo-1541802645635-11f2286a7482?w=1400&h=400&fit=crop&auto=format", href: "/clubs/club-012", card: { headline: "Rush Delta Phi Lambda", blurb: "Sisterhood built on service and culture.", chips: ["Recruitment", "Service", "Asian American"] } },
];
