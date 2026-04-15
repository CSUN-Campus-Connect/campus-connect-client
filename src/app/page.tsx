'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValueEvent,
  AnimatePresence,
} from 'framer-motion';
import {
  ShoppingBag, Users, CalendarDays, Dumbbell, GraduationCap,
  Search, Rss, MessageCircle, Bell, School,
  ChevronDown, ArrowRight, ArrowDown, Play,
} from 'lucide-react';

const HERO_VIDEO =
  'https://live-csu-northridge.pantheonsite.io/sites/default/files/2025-09/Generic%20Webpage%20Final%20New%20Bitrate.mp4';

/** The 10 app features shown in the grid */
const features = [
  { icon: Rss,            name: 'Social Feed',     desc: 'Posts, photos, updates from students and orgs you follow.' },
  { icon: MessageCircle,  name: 'Messaging',       desc: 'DMs and group chats. Study sessions, hangouts, whatever.' },
  { icon: ShoppingBag,    name: 'Marketplace',     desc: 'Textbooks, furniture, parking passes — student to student.' },
  { icon: Users,          name: 'Clubs & Orgs',    desc: 'Find your people. 300+ clubs, announcements, events.' },
  { icon: CalendarDays,   name: 'Events',          desc: "What's happening this week without five Instagram pages." },
  { icon: Dumbbell,       name: 'SRC & Fitness',   desc: 'Class schedules, gym hours, rec center programming.' },
  { icon: GraduationCap,  name: 'Degree Planner',  desc: 'What classes you need and when. No more guessing.' },
  { icon: Search,         name: 'Course Search',   desc: 'Look up classes, read reviews, plan your semester.' },
  { icon: Bell,           name: 'Notifications',   desc: "Updates, replies, announcements — won't miss anything." },
  { icon: School,         name: 'University Info',  desc: 'Maps, dining, contacts, athletics — the stuff you Google.' },
];

const stats = [
  { number: 10, suffix: '+', label: 'features' },
  { number: 38, suffix: 'k', label: 'students at CSUN' },
  { number: 5,  suffix: '',  label: 'apps we replace' },
  { number: 7,  suffix: '',  label: 'developers' },
];

const teamGroups = [
  {
    group: 'Frontend',
    people: [
      { name: 'Vram',   role: 'Frontend' },
      { name: 'Elijah', role: 'Frontend' },
    ],
  },
  {
    group: 'Backend',
    people: [
      { name: 'Justin',  role: 'Backend' },
      { name: 'Giselle', role: 'Backend' },
    ],
  },
  {
    group: 'Cross-team',
    people: [
      { name: 'Sarah',  role: 'Frontend / Scrum' },
      { name: 'Ivan',   role: 'DevOps / Backend' },
      { name: 'Joseph', role: 'Full Stack' },
    ],
  },
];

const legalDocs = [
  { title: 'Terms of Service',    body: 'By using CampusConnect you agree to these terms. CSUN COMP 490 student project, not official. Must be enrolled, 18+, valid CSUN email. You own your content. No illegal activity, harassment, fake reviews, prohibited items. Marketplace is between users. California law. support@campusconnect.com' },
  { title: 'Privacy Policy',      body: 'We collect name, email, hashed password, profile, usage data. Public CSUN API data used. Don\'t sell info. Share with Supabase, Vercel, legal. No FERPA records. Encrypted. Request access/deletion. CCPA applies. support@campusconnect.com' },
  { title: 'Community Guidelines', body: 'No hate speech, harassment, doxxing. Real identity, genuine reviews. No weapons, drugs, stolen goods, academic work. No explicit content. Emergencies: 818-677-2111. Warnings → removal → suspension → ban.' },
  { title: 'Copyright & DMCA',    body: 'DMCA notices to support@campusconnect.com. Counter-notifications accepted. Three strikes = ban. You\'re responsible for your content.' },
  { title: 'Acceptable Use',      body: 'No bots, scrapers, malware. No data harvesting, fake accounts. Violations reported to law enforcement.' },
  { title: 'Disclaimer',          body: '"As is." Not affiliated with CSUN. Don\'t guarantee accuracy. Not party to transactions. Reviews are opinions. Liability: $0.' },
  { title: 'Cookies',             body: 'Essential (auth, required). Preferences (settings). Analytics (anonymous). Third-party (Vercel/Supabase). Browser settings. Mobile uses secure storage.' },
];

const heroWords = ['Social.', 'Safety.', 'Courses.', 'SRC.', 'Clubs.', 'Events.', 'Marketplace.', 'Messaging.'];

const lookbookPhotos = [
  { src: '/images/HPstrip/Column1/1.jpg', size: 'w-[45%] md:w-[30%]', position: 'top-[2%] left-[3%]',    rotation: '-rotate-3',       z: 'z-[3]' },
  { src: '/images/HPstrip/Column2/2.jpg', size: 'w-[38%] md:w-[25%]', position: 'top-[0%] right-[8%]',   rotation: 'rotate-2',        z: 'z-[2]' },
  { src: '/images/HPstrip/Column3/3.jpg', size: 'w-[35%] md:w-[22%]', position: 'top-[14%] left-[32%]',  rotation: 'rotate-[5deg]',   z: 'z-[4]' },
  { src: '/images/HPstrip/Column1/4.jpg', size: 'w-[42%] md:w-[28%]', position: 'top-[30%] left-[1%]',   rotation: 'rotate-1',        z: 'z-[2]' },
  { src: '/images/HPstrip/Column2/5.jpg', size: 'w-[40%] md:w-[26%]', position: 'top-[28%] right-[2%]',  rotation: '-rotate-[4deg]',  z: 'z-[5]' },
  { src: '/images/HPstrip/Column3/1.jpg', size: 'w-[32%] md:w-[20%]', position: 'top-[44%] left-[25%]',  rotation: '-rotate-2',       z: 'z-[3]' },
  { src: '/images/HPstrip/Column1/6.jpg', size: 'w-[44%] md:w-[27%]', position: 'top-[52%] left-[0%]',   rotation: 'rotate-3',        z: 'z-[1]' },
  { src: '/images/HPstrip/Column2/7.jpg', size: 'w-[36%] md:w-[24%]', position: 'top-[50%] right-[6%]',  rotation: 'rotate-[6deg]',   z: 'z-[4]' },
  { src: '/images/HPstrip/Column3/8.jpg', size: 'w-[38%] md:w-[23%]', position: 'top-[66%] left-[18%]',  rotation: '-rotate-[5deg]',  z: 'z-[6]' },
  { src: '/images/HPstrip/Column1/3.jpg', size: 'w-[40%] md:w-[25%]', position: 'top-[70%] right-[15%]', rotation: 'rotate-2',        z: 'z-[2]' },
  { src: '/images/HPstrip/Column2/4.jpg', size: 'w-[34%] md:w-[21%]', position: 'top-[78%] left-[5%]',   rotation: 'rotate-[4deg]',   z: 'z-[3]' },
  { src: '/images/HPstrip/Column3/6.jpg', size: 'w-[37%] md:w-[22%]', position: 'top-[82%] right-[0%]',  rotation: '-rotate-3',       z: 'z-[1]' },
];

const smooth: [number, number, number, number] = [0.16, 1, 0.3, 1];


/**
 * FadeUp — fades in and slides up when scrolled into view.
 * Most common animation on the page.
 *
 * @param delay  seconds to wait before animating (stagger items)
 */
function FadeUp({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isVisible = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: smooth }}
    >
      {children}
    </motion.div>
  );
}

function SlideUpText({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const isVisible = useInView(ref, { once: true, margin: '-20px' });

  return (
    <span ref={ref} className={`block overflow-hidden ${className}`}>
      <motion.span
        className="block"
        initial={{ y: '110%' }}
        animate={isVisible ? { y: '0%' } : {}}
        transition={{ duration: 0.8, ease: smooth }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function ParallaxImage({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  // Image shifts from -6% to +6% as you scroll past it
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  return (
    <div ref={ref} className={`overflow-hidden relative ${className}`}>
      <motion.div style={{ y }} className="relative w-full h-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      </motion.div>
    </div>
  );
}

function HeroCyclingWords() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Refs survive re-renders — we track phase & index here so the
  // setTimeout chain doesn't get confused by stale state.
  const phase = useRef<'showing' | 'holding' | 'fading'>('showing');
  const index = useRef(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const tick = () => {
      switch (phase.current) {
        case 'showing':
          // Reveal next word
          index.current += 1;
          setVisibleCount(index.current);

          if (index.current >= heroWords.length) {
            // All words visible → move to holding phase
            phase.current = 'holding';
            timer = setTimeout(tick, 2800);
          } else {
            // Show next word after 300ms
            timer = setTimeout(tick, 300);
          }
          break;

        case 'holding':
          // Start fading everything out
          phase.current = 'fading';
          setIsFading(true);
          timer = setTimeout(tick, 700);
          break;

        case 'fading':
          // Reset everything and start over
          phase.current = 'showing';
          index.current = 0;
          setIsFading(false);
          setVisibleCount(0);
          timer = setTimeout(tick, 500);
          break;
      }
    };

    // Kick off the first tick after a short delay
    timer = setTimeout(tick, 600);

    // Cleanup on unmount
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1">
      {heroWords.map((word, i) => {
        const isRevealed = i < visibleCount;

        return (
          <motion.span
            key={word}
            animate={{
              opacity: isFading ? 0 : isRevealed ? 1 : 0,
              y: isFading ? -6 : isRevealed ? 0 : 10,
              filter: isFading
                ? 'blur(3px)'
                : isRevealed
                  ? 'blur(0px)'
                  : 'blur(4px)',
            }}
            transition={{ duration: 0.45, ease: smooth }}
            className="text-[1.1rem] md:text-[1.4rem] font-extralight tracking-wide text-[#CC0033]"
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
}

function LookbookScatter() {
  return (
    <div className="relative w-full h-[600px] md:h-[800px] max-w-[900px] mx-auto">
      {lookbookPhotos.map((photo, i) => (
        <motion.div
          key={photo.src}
          className={`absolute ${photo.size} ${photo.position} ${photo.rotation} ${photo.z}`}
          initial={{ opacity: 0, scale: 0.85, rotate: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, delay: i * 0.06, ease: smooth }}
          whileHover={{ scale: 1.06, zIndex: 20, rotate: 0 }}
        >
          <div className="relative aspect-[4/3] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.12)] border-[3px] border-white">
            <Image src={photo.src} alt="" fill sizes="300px" className="object-cover" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const { scrollY } = useScroll();
  const heroClip = useTransform(
    scrollY,
    [0, 600],
    ['inset(0% 0% 0% 0%)', 'inset(0% 5% 10% 5%)'],
  );
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const videoRef = useRef(null);
  const { scrollYProgress: videoScrollProgress } = useScroll({
    target: videoRef,
    offset: ['start end', 'end start'],
  });
  const videoScale = useTransform(videoScrollProgress, [0, 0.5, 1], [1.15, 1, 1.05]);

  const [showNav, setShowNav] = useState(false);
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setShowNav(latest > 600);
  });

  const [openLegalIndex, setOpenLegalIndex] = useState<number | null>(null);

  function toggleLegal(index: number) {
    setOpenLegalIndex(openLegalIndex === index ? null : index);
  }

  function scrollToVideo() {
    document.getElementById('vid')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="bg-white text-[#111] min-h-screen selection:bg-[#CC0033] selection:text-white">
      <motion.nav
        initial={{ y: -70 }}
        animate={{ y: showNav ? 0 : -70 }}
        transition={{ duration: 0.35, ease: smooth }}
        className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm border-b border-black/5 flex items-center justify-between px-6 py-3"
      >
        <div className="flex items-center gap-3">
          <Image src="/ToroConnectLP.png" alt="" width={26} height={26} className="w-[26px] h-[26px]" />
          <span className="text-[13px] font-semibold tracking-tight">Toro Campus Connect</span>
        </div>
        <Link
          href="/register"
          className="text-[12px] font-semibold text-[#CC0033] hover:underline underline-offset-4"
        >
          Sign up &rarr;
        </Link>
      </motion.nav>
      <motion.section
        style={{ clipPath: heroClip, opacity: heroOpacity }}
        className="relative min-h-screen flex flex-col justify-between px-6 md:px-14 pt-8 pb-12 md:pb-16 bg-white"
      >
        {/* Top bar — logo + links */}
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <Image
              src="/ToroConnectLP.png"
              alt="Toro Campus Connect"
              width={36}
              height={36}
              priority
              className="w-9 h-9"
            />
            <span className="text-[13px] font-light tracking-wide text-[#999]">
              Toro Campus Connect
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="flex items-center gap-5"
          >
            <Link
              href="/register"
              className="text-[13px] font-semibold text-[#CC0033] hover:underline underline-offset-4 decoration-[#CC0033]"
            >
              Sign up
            </Link>
            <button
              onClick={scrollToVideo}
              className="text-[13px] text-[#999] hover:text-[#555] transition-colors"
            >
              Explore
            </button>
          </motion.div>
        </div>

        {/* Center — animated cycling feature words */}
        <div className="flex-1 flex items-center justify-center">
          <HeroCyclingWords />
        </div>

        {/* Bottom — main headline + tagline */}
        <div>
          <div className="max-w-5xl">
            <SlideUpText>
              <h1 className="text-[4rem] md:text-[7rem] lg:text-[8.5rem] font-extralight leading-[0.92] tracking-tighter text-[#111]">
                Your whole
              </h1>
            </SlideUpText>
            <SlideUpText>
              <h1 className="text-[4rem] md:text-[7rem] lg:text-[8.5rem] font-extrabold leading-[0.92] tracking-tighter text-[#CC0033]">
                campus.
              </h1>
            </SlideUpText>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="mt-6 md:mt-8"
          >
            <p className="text-[15px] md:text-[16px] text-[#999] max-w-xs leading-relaxed font-light">
              Experience the university in one app — it&apos;s all here.
              Made by students, for CSUN.
            </p>
          </motion.div>

          {/* Bounce arrow → scroll to video */}
          <motion.button
            onClick={scrollToVideo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2"
          >
            <ArrowDown className="w-5 h-5 text-[#ccc] animate-bounce" />
          </motion.button>
        </div>
      </motion.section>
      <section
        id="vid"
        ref={videoRef}
        className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden bg-black"
      >
        {/* Video with scroll-driven zoom */}
        <motion.div style={{ scale: videoScale }} className="absolute inset-0">
          <video
            src={HERO_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Red progress line at the bottom */}
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: smooth }}
          className="absolute bottom-0 left-0 h-[3px] bg-[#CC0033] z-20"
        />
      </section>
      <section className="py-20 md:py-32 px-6 md:px-14 bg-white">
        <div className="max-w-6xl mx-auto">

          {/* Section header */}
          <FadeUp>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-4">
              <h2 className="text-[2.5rem] md:text-[3.5rem] font-extrabold leading-[1] tracking-tight">
                Everything you<br />actually need
              </h2>
              <p className="text-[14px] text-[#aaa] max-w-xs leading-relaxed font-light">
                The CSUN website is confusing right? <br/>Well try this.
              </p>
            </div>
          </FadeUp>

          {/* Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {features.map((feature, i) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.5, delay: i * 0.03, ease: 'easeOut' }}
                  className="group border-t border-[#eee] py-5 px-1 flex items-start gap-4 cursor-default transition-colors hover:bg-[#FAFAF7]"
                >
                  <Icon className="w-[18px] h-[18px] text-[#CC0033] stroke-[1.5] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-semibold">{feature.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#ddd] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[12px] text-[#bbb] leading-relaxed font-light block mt-0.5">
                      {feature.desc}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
        <ParallaxImage
          src="/images/Homepage/MatadorSunset.png"
          alt="Matador Sunset"
          className="absolute inset-0 w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />

        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 md:px-14 pb-10 md:pb-16">
          <FadeUp>
            <h3 className="text-white text-[2.5rem] md:text-[4rem] font-extrabold leading-[0.95] tracking-tight max-w-lg">
              Built by Matadors,{' '}
              <span className="font-extralight">for Matadors.</span>
            </h3>
          </FadeUp>
          <FadeUp delay={0.15}>
            <p className="text-white/60 text-[14px] md:text-[15px] font-light leading-relaxed max-w-sm mt-4">
              Why scatter through many applications and endless redirects when you can have it all here!
            </p>
          </FadeUp>
        </div>
      </section>
      <section className="bg-[#111] text-white py-10 px-6 md:px-14">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {stats.map((item, i) => (
            <FadeUp key={item.label} delay={i * 0.08}>
              <div className="flex items-baseline gap-2">
                <span className="text-[2rem] md:text-[2.5rem] font-extrabold tracking-tight tabular-nums">
                  {item.number}{item.suffix}
                </span>
                <span className="text-[13px] text-white/40 font-light">{item.label}</span>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>
      <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
        <ParallaxImage
          src="/images/Homepage/CSUN_Sign.jpg"
          alt="CSUN Sign"
          className="absolute inset-0 w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />

        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 md:px-14 pb-10 md:pb-16">
          <FadeUp>
            <h3 className="text-white text-[2.5rem] md:text-[4rem] font-extralight leading-[0.95] tracking-tight max-w-lg">
              Connect. Collaborate.{' '}
              <span className="font-extrabold">Conquer.</span>
            </h3>
          </FadeUp>
          <FadeUp delay={0.15}>
            <p className="text-white/60 text-[14px] md:text-[15px] font-light leading-relaxed max-w-sm mt-4">
              The people you sit next to in class might end up being the people
              you start a company with. <br/>This is where that starts.
            </p>
          </FadeUp>
        </div>
      </section>
      <section className="bg-[#FAFAF7] py-16 md:py-24 px-5 overflow-hidden">
        <FadeUp className="text-center mb-6">
          <h2 className="text-[2rem] md:text-[3rem] font-extrabold tracking-tight leading-[1]">
            Community{' '}
            <span className="font-extralight">in Motion</span>
          </h2>
        </FadeUp>
        <LookbookScatter />
      </section>
      <section className="bg-[#CC0033] text-white py-20 md:py-28 px-6 md:px-14">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
          <FadeUp>
            <div>
              <SlideUpText>
                <h2 className="text-[3rem] md:text-[4.5rem] font-extralight leading-[0.9] tracking-tighter">
                  Wanna
                </h2>
              </SlideUpText>
              <SlideUpText>
                <h2 className="text-[3rem] md:text-[4.5rem] font-extrabold leading-[0.9] tracking-tighter">
                  try it?
                </h2>
              </SlideUpText>
              <p className="text-white/50 text-[14px] font-light leading-relaxed max-w-xs mt-5">
                We launch Fall 2026. Sign up and we&apos;ll let you know when it&apos;s ready.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <Link
              href="/register"
              className="group inline-flex items-center gap-3 bg-white text-[#CC0033] px-8 py-4 text-[14px] font-semibold hover:bg-[#f5f5f5] transition-colors"
            >
              Sign up
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
            </Link>
          </FadeUp>
        </div>
      </section>
      <section className="py-20 md:py-28 px-6 md:px-14 bg-white">
        <div className="max-w-3xl mx-auto">

          <FadeUp>
            <h2 className="text-[1.8rem] md:text-[2.5rem] font-extrabold tracking-tight leading-[1] mb-2">
              Seven seniors,{' '}
              <span className="font-extralight">one semester, no sleep.</span>
            </h2>
            <p className="text-[14px] text-[#aaa] font-light leading-relaxed max-w-md mb-10">
              COMP 490 Senior Design, 2025–2026. We wanted to leave something behind
              that actually helps.
            </p>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              {teamGroups.map((group) => (
                <div key={group.group}>
                  {/* Group label */}
                  <div className="text-[11px] font-semibold text-[#CC0033] tracking-wide pb-2 mb-4 border-b-2 border-[#CC0033] inline-block">
                    {group.group}
                  </div>

                  {/* People */}
                  <div className="space-y-3">
                    {group.people.map((person) => (
                      <div key={person.name}>
                        <div className="text-[15px] font-semibold">{person.name}</div>
                        <div className="text-[12px] text-[#ccc] font-light">{person.role}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>
      <section className="bg-white py-14 px-6 md:px-14 border-t border-black/5">
        <div className="max-w-3xl mx-auto">

          {/* Legal header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="text-[1.2rem] font-extrabold tracking-tight">Legal</h3>
              <p className="text-[12px] text-[#bbb] font-light mt-0.5">Effective March 2026</p>
            </div>
            <a
              href="mailto:support@campusconnect.com"
              className="text-[12px] text-[#CC0033] font-medium hover:underline underline-offset-4"
            >
              support@campusconnect.com
            </a>
          </div>

          {/* Accordion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {legalDocs.map((doc, idx) => (
              <div key={doc.title} className="border-t border-black/[0.06]">
                <button
                  onClick={() => toggleLegal(idx)}
                  className="w-full flex justify-between items-center py-4 text-left group"
                >
                  <span className="text-[14px] font-medium text-[#555] group-hover:text-[#111] transition-colors">
                    {doc.title}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#ccc] transition-transform duration-300 ${
                      openLegalIndex === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Expandable body */}
                <AnimatePresence>
                  {openLegalIndex === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: smooth }}
                      className="overflow-hidden"
                    >
                      <p className="text-[12px] text-[#aaa] leading-relaxed pb-5 font-light pr-8">
                        {doc.body}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-black/[0.04] flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
            <p className="text-[11px] text-[#ccc] font-light">
              © 2026 CampusConnect. Not affiliated with California State University, Northridge.
            </p>
            <p className="text-[11px] text-[#ccc] font-light">
              COMP 490 Senior Design 2025–2026
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}