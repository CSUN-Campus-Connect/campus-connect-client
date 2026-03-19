'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  motion, useScroll, useTransform, useInView, useMotionValueEvent,
  AnimatePresence,
} from 'framer-motion';
import {
  ShoppingBag, Users, CalendarDays, Dumbbell, GraduationCap, Search,
  Rss, MessageCircle, Bell, School, ChevronDown, ArrowRight, ArrowDown,
  Play, X,
} from 'lucide-react';

const HERO_VIDEO =
  'https://live-csu-northridge.pantheonsite.io/sites/default/files/2025-09/Generic%20Webpage%20Final%20New%20Bitrate.mp4';

const features = [
  { icon: Rss, name: 'Social Feed', desc: 'Posts, photos, updates from students and orgs you follow.' },
  { icon: MessageCircle, name: 'Messaging', desc: 'DMs and group chats. Study sessions, hangouts, whatever.' },
  { icon: ShoppingBag, name: 'Marketplace', desc: 'Textbooks, furniture, parking passes — student to student.' },
  { icon: Users, name: 'Clubs & Orgs', desc: 'Find your people. 300+ clubs, announcements, events.' },
  { icon: CalendarDays, name: 'Events', desc: "What's happening this week without five Instagram pages." },
  { icon: Dumbbell, name: 'SRC & Fitness', desc: 'Class schedules, gym hours, rec center programming.' },
  { icon: GraduationCap, name: 'Degree Planner', desc: 'What classes you need and when. No more guessing.' },
  { icon: Search, name: 'Course Search', desc: 'Look up classes, read reviews, plan your semester.' },
  { icon: Bell, name: 'Notifications', desc: "Updates, replies, announcements — won't miss anything." },
  { icon: School, name: 'University Info', desc: 'Maps, dining, contacts, athletics — the stuff you Google.' },
];

const teamCols = [
  { group: 'Frontend', people: [{ name: 'Vram', role: 'Frontend' }, { name: 'Elijah', role: 'Frontend' }] },
  { group: 'Backend', people: [{ name: 'Justin', role: 'Backend' }, { name: 'Giselle', role: 'Backend' }] },
  { group: 'Cross-team', people: [{ name: 'Sarah', role: 'Frontend / Scrum' }, { name: 'Ivan', role: 'DevOps / Backend' }, { name: 'Joseph', role: 'Full Stack' }] },
];

const legalDocs = [
  { title: 'Terms of Service', body: 'By using CampusConnect you agree to these terms. CSUN COMP 490 student project, not official. Must be enrolled, 18+, valid CSUN email. You own your content. No illegal activity, harassment, fake reviews, prohibited items. Marketplace is between users. California law. support@campusconnect.com' },
  { title: 'Privacy Policy', body: 'We collect name, email, hashed password, profile, usage data. Public CSUN API data used. Don\'t sell info. Share with Supabase, Vercel, legal. No FERPA records. Encrypted. Request access/deletion. CCPA applies. support@campusconnect.com' },
  { title: 'Community Guidelines', body: 'No hate speech, harassment, doxxing. Real identity, genuine reviews. No weapons, drugs, stolen goods, academic work. No explicit content. Emergencies: 818-677-2111. Warnings → removal → suspension → ban.' },
  { title: 'Copyright & DMCA', body: 'DMCA notices to support@campusconnect.com. Counter-notifications accepted. Three strikes = ban. You\'re responsible for your content.' },
  { title: 'Acceptable Use', body: 'No bots, scrapers, malware. No data harvesting, fake accounts. Violations reported to law enforcement.' },
  { title: 'Disclaimer', body: '"As is." Not affiliated with CSUN. Don\'t guarantee accuracy. Not party to transactions. Reviews are opinions. Liability: $0.' },
  { title: 'Cookies', body: 'Essential (auth, required). Preferences (settings). Analytics (anonymous). Third-party (Vercel/Supabase). Browser settings. Mobile uses secure storage.' },
];

const stripCols = [
  Array.from({ length: 8 }, (_, i) => `/images/HPstrip/Column1/${i + 1}.jpg`),
  Array.from({ length: 8 }, (_, i) => `/images/HPstrip/Column2/${i + 1}.jpg`),
  Array.from({ length: 8 }, (_, i) => `/images/HPstrip/Column3/${i + 1}.jpg`),
];

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >{children}</motion.div>
  );
}

function ClipReveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref} className={className}
      initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
      animate={inView ? { clipPath: 'inset(0% 0% 0% 0%)' } : {}}
      transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
    >{children}</motion.div>
  );
}

function LineReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });
  return (
    <span ref={ref} className={`block overflow-hidden ${className}`}>
      <motion.span className="block"
        initial={{ y: '110%' }}
        animate={inView ? { y: '0%' } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >{children}</motion.span>
    </span>
  );
}

function ParallaxImg({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);
  return (
    <div ref={ref} className={`overflow-hidden relative ${className}`}>
      <motion.div style={{ y }} className="relative w-full h-full" >
        <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" priority />
      </motion.div>
    </div>
  );
}

const lookbookPhotos = [
  { src: '/images/HPstrip/Column1/1.jpg', w: 'w-[45%] md:w-[30%]', pos: 'top-[2%] left-[3%]', rot: '-rotate-3', z: 'z-[3]' },
  { src: '/images/HPstrip/Column2/2.jpg', w: 'w-[38%] md:w-[25%]', pos: 'top-[0%] right-[8%]', rot: 'rotate-2', z: 'z-[2]' },
  { src: '/images/HPstrip/Column3/3.jpg', w: 'w-[35%] md:w-[22%]', pos: 'top-[14%] left-[32%]', rot: 'rotate-[5deg]', z: 'z-[4]' },
  { src: '/images/HPstrip/Column1/4.jpg', w: 'w-[42%] md:w-[28%]', pos: 'top-[30%] left-[1%]', rot: 'rotate-1', z: 'z-[2]' },
  { src: '/images/HPstrip/Column2/5.jpg', w: 'w-[40%] md:w-[26%]', pos: 'top-[28%] right-[2%]', rot: '-rotate-[4deg]', z: 'z-[5]' },
  { src: '/images/HPstrip/Column3/1.jpg', w: 'w-[32%] md:w-[20%]', pos: 'top-[44%] left-[25%]', rot: '-rotate-2', z: 'z-[3]' },
  { src: '/images/HPstrip/Column1/6.jpg', w: 'w-[44%] md:w-[27%]', pos: 'top-[52%] left-[0%]', rot: 'rotate-3', z: 'z-[1]' },
  { src: '/images/HPstrip/Column2/7.jpg', w: 'w-[36%] md:w-[24%]', pos: 'top-[50%] right-[6%]', rot: 'rotate-[6deg]', z: 'z-[4]' },
  { src: '/images/HPstrip/Column3/8.jpg', w: 'w-[38%] md:w-[23%]', pos: 'top-[66%] left-[18%]', rot: '-rotate-[5deg]', z: 'z-[6]' },
  { src: '/images/HPstrip/Column1/3.jpg', w: 'w-[40%] md:w-[25%]', pos: 'top-[70%] right-[15%]', rot: 'rotate-2', z: 'z-[2]' },
  { src: '/images/HPstrip/Column2/4.jpg', w: 'w-[34%] md:w-[21%]', pos: 'top-[78%] left-[5%]', rot: 'rotate-[4deg]', z: 'z-[3]' },
  { src: '/images/HPstrip/Column3/6.jpg', w: 'w-[37%] md:w-[22%]', pos: 'top-[82%] right-[0%]', rot: '-rotate-3', z: 'z-[1]' },
];

function LookbookScatter() {
  return (
    <div className="relative w-full h-[600px] md:h-[800px] max-w-[900px] mx-auto">
      {lookbookPhotos.map((photo, i) => (
        <motion.div
          key={photo.src}
          className={`absolute ${photo.w} ${photo.pos} ${photo.rot} ${photo.z}`}
          initial={{ opacity: 0, scale: 0.85, rotate: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.06, zIndex: 20, rotate: 0 }}
        >
          <div className="relative aspect-[4/3] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.12)] border-[3px] border-white">
            <Image
              src={photo.src}
              alt=""
              fill
              sizes="300px"
              className="object-cover"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.span ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
    >
      {inView && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.span>{value}</motion.span>{suffix}
        </motion.span>
      )}
    </motion.span>
  );
}

const heroWords = ['Social.', 'Courses.', 'SRC.', 'Clubs.', 'Events.', 'Marketplace.', 'Messaging.'];

function HeroCyclingWords() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [fading, setFading] = useState(false);
  const phaseRef = useRef<'showing' | 'holding' | 'fading'>('showing');
  const indexRef = useRef(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const tick = () => {
      if (phaseRef.current === 'showing') {
        indexRef.current += 1;
        setVisibleCount(indexRef.current);
        if (indexRef.current >= heroWords.length) {
          phaseRef.current = 'holding';
          timer = setTimeout(tick, 2800);
        } else {
          timer = setTimeout(tick, 300);
        }
      } else if (phaseRef.current === 'holding') {
        phaseRef.current = 'fading';
        setFading(true);
        timer = setTimeout(tick, 700);
      } else {
        phaseRef.current = 'showing';
        indexRef.current = 0;
        setFading(false);
        setVisibleCount(0);
        timer = setTimeout(tick, 500);
      }
    };

    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1">
      {heroWords.map((word, i) => (
        <motion.span
          key={word}
          animate={{
            opacity: fading ? 0 : (i < visibleCount ? 1 : 0),
            y: fading ? -6 : (i < visibleCount ? 0 : 10),
            filter: fading ? 'blur(3px)' : (i < visibleCount ? 'blur(0px)' : 'blur(4px)'),
          }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="text-[1.1rem] md:text-[1.4rem] font-extralight tracking-wide text-[#ccc]"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const { scrollY } = useScroll();
  const heroClip = useTransform(scrollY, [0, 600], ['inset(0% 0% 0% 0%)', 'inset(0% 5% 10% 5%)']);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  const vidRef = useRef(null);
  const { scrollYProgress: vidProg } = useScroll({ target: vidRef, offset: ['start end', 'end start'] });
  const vidScale = useTransform(vidProg, [0, 0.5, 1], [1.15, 1, 1.05]);

  const [openLegal, setOpenLegal] = useState<number | null>(null);
  const [showHeader, setShowHeader] = useState(false);
  useMotionValueEvent(scrollY, 'change', (v) => setShowHeader(v > 600));

  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <div className="bg-white text-[#111] min-h-screen selection:bg-[#CC0033] selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@100;200;300;400;500;600;700;800&display=swap');
        * { font-family: 'Sora', sans-serif; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { scrollbar-width: none; }
      `}</style>

      {/* -------- STICKY NAV -------- */}
      <motion.nav
        initial={{ y: -70 }}
        animate={{ y: showHeader ? 0 : -70 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm border-b border-black/5 flex items-center justify-between px-6 py-3"
      >
        <div className="flex items-center gap-3">
          <Image src="/ToroConnectLP.png" alt="" width={26} height={26} className="w-[26px] h-[26px]" />
          <span className="text-[13px] font-semibold tracking-tight">Toro Campus Connect</span>
        </div>
        <Link href="/register" className="text-[12px] font-semibold text-[#CC0033] hover:underline underline-offset-4">
          Sign up &rarr;
        </Link>
      </motion.nav>

      {/* ======== HERO — full bleed white, massive type ======== */}
      <motion.section
        style={{ clipPath: heroClip, opacity: heroOpacity }}
        className="relative min-h-screen flex flex-col justify-between px-6 md:px-14 pt-8 pb-12 md:pb-16 bg-white"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <Image src="/ToroConnectLP.png" alt="Toro Campus Connect" width={36} height={36} priority className="w-9 h-9" />
            <span className="text-[13px] font-light tracking-wide text-[#999]">Toro Campus Connect</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="flex items-center gap-5"
          >
            <Link href="/register" className="text-[13px] font-semibold text-[#CC0033] hover:underline underline-offset-4 decoration-[#CC0033]">
              Sign up
            </Link>
            <button
              onClick={() => document.getElementById('vid')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-[13px] text-[#999] hover:text-[#555] transition-colors"
            >
              Explore
            </button>
          </motion.div>
        </div>

        {/* Center — cycling words */}
        <div className="flex-1 flex items-center justify-center">
          <HeroCyclingWords />
        </div>

        {/* Bottom — headline + CTA */}
        <div>
          <div className="max-w-5xl">
            <LineReveal>
              <h1 className="text-[4rem] md:text-[7rem] lg:text-[8.5rem] font-extralight leading-[0.92] tracking-tighter text-[#111]">
                Your whole
              </h1>
            </LineReveal>
            <LineReveal>
              <h1 className="text-[4rem] md:text-[7rem] lg:text-[8.5rem] font-extrabold leading-[0.92] tracking-tighter text-[#CC0033]">
                campus.
              </h1>
            </LineReveal>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="mt-6 md:mt-8"
          >
            <p className="text-[15px] md:text-[16px] text-[#999] max-w-xs leading-relaxed font-light">
              Classes, clubs, messaging, events, the SRC, marketplace — it&apos;s all here. Made by students, for CSUN.
            </p>
          </motion.div>

          <motion.button
            onClick={() => document.getElementById('vid')?.scrollIntoView({ behavior: 'smooth' })}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2"
          >
            <ArrowDown className="w-5 h-5 text-[#ccc] animate-bounce" />
          </motion.button>
        </div>
      </motion.section>

      {/* ======== VIDEO — full bleed ======== */}
      <section id="vid" ref={vidRef} className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden bg-black">
        <motion.div style={{ scale: vidScale }} className="absolute inset-0">
          <video src={HERO_VIDEO} autoPlay muted loop playsInline className="w-full h-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            className="w-16 h-16 bg-white flex items-center justify-center cursor-pointer"
          >
            <Play className="w-5 h-5 text-[#CC0033] ml-0.5" fill="#CC0033" />
          </motion.div>
        </div>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-0 left-0 h-[3px] bg-[#CC0033] z-20"
        />
      </section>

      {/* ======== FEATURES — editorial list with hover image ======== */}
      <section className="py-20 md:py-32 px-6 md:px-14 bg-white">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-4">
              <div>
                <h2 className="text-[2.5rem] md:text-[3.5rem] font-extrabold leading-[1] tracking-tight">
                  What&apos;s in here
                </h2>
              </div>
              <p className="text-[14px] text-[#aaa] max-w-xs leading-relaxed font-light">
                Ten features. One app. No more switching between CSUN, SRC, Safe, and Athletics.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {features.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: i * 0.03, ease: 'easeOut' }}
                onMouseEnter={() => setActiveFeature(i)}
                className="group border-t border-[#eee] py-5 px-1 flex items-start gap-4 cursor-default transition-colors hover:bg-[#FAFAF7]"
              >
                <f.icon className="w-[18px] h-[18px] text-[#CC0033] stroke-[1.5] mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-semibold">{f.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#ddd] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[12px] text-[#bbb] leading-relaxed font-light block mt-0.5">{f.desc}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== FULL BLEED — Matador ======== */}
      <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
        <ParallaxImg src="/images/Homepage/MatadorSunset.png" alt="Matador Sunset" className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 md:px-14 pb-10 md:pb-16">
          <Reveal>
            <h3 className="text-white text-[2.5rem] md:text-[4rem] font-extrabold leading-[0.95] tracking-tight max-w-lg">
              Built by Matadors,{' '}
              <span className="font-extralight">for Matadors.</span>
            </h3>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-white/60 text-[14px] md:text-[15px] font-light leading-relaxed max-w-sm mt-4">
              Seven CSUN seniors who got tired of juggling five different apps just to get through a Tuesday. So we made this instead.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ======== NUMBERS BAR ======== */}
      <section className="bg-[#111] text-white py-10 px-6 md:px-14">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {[
            { n: 10, s: '+', label: 'features' },
            { n: 38, s: 'k', label: 'students at CSUN' },
            { n: 5, s: '', label: 'apps we replace' },
            { n: 7, s: '', label: 'developers' },
          ].map((item, i) => (
            <Reveal key={item.label} delay={i * 0.08}>
              <div className="flex items-baseline gap-2">
                <span className="text-[2rem] md:text-[2.5rem] font-extrabold tracking-tight tabular-nums">
                  <Counter value={item.n} suffix={item.s} />
                </span>
                <span className="text-[13px] text-white/40 font-light">{item.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ======== FULL BLEED — CSUN Sign ======== */}
      <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
        <ParallaxImg src="/images/Homepage/CSUN_Sign.jpg" alt="CSUN Sign" className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 md:px-14 pb-10 md:pb-16">
          <Reveal>
            <h3 className="text-white text-[2.5rem] md:text-[4rem] font-extralight leading-[0.95] tracking-tight max-w-lg">
              Connect. Collaborate.{' '}
              <span className="font-extrabold">Conquer.</span>
            </h3>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-white/60 text-[14px] md:text-[15px] font-light leading-relaxed max-w-sm mt-4">
              The people you sit next to in class might end up being the people you start a company with. This is where that starts.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ======== LOOKBOOK ======== */}
      <section className="bg-[#FAFAF7] py-16 md:py-24 px-5 overflow-hidden">
        <Reveal className="text-center mb-6">
          <h2 className="text-[2rem] md:text-[3rem] font-extrabold tracking-tight leading-[1]">
            Community{' '}
            <span className="font-extralight">in Motion</span>
          </h2>
        </Reveal>
        <LookbookScatter />
      </section>

      {/* ======== CTA ======== */}
      <section className="bg-[#CC0033] text-white py-20 md:py-28 px-6 md:px-14">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
          <Reveal>
            <div>
              <LineReveal>
                <h2 className="text-[3rem] md:text-[4.5rem] font-extralight leading-[0.9] tracking-tighter">Wanna</h2>
              </LineReveal>
              <LineReveal>
                <h2 className="text-[3rem] md:text-[4.5rem] font-extrabold leading-[0.9] tracking-tighter">try it?</h2>
              </LineReveal>
              <p className="text-white/50 text-[14px] font-light leading-relaxed max-w-xs mt-5">
                We launch Spring 2026. Sign up and we&apos;ll let you know when it&apos;s ready.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <Link
              href="/register"
              className="group inline-flex items-center gap-3 bg-white text-[#CC0033] px-8 py-4 text-[14px] font-semibold hover:bg-[#f5f5f5] transition-colors"
            >
              Sign up
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ======== TEAM ======== */}
      <section className="py-20 md:py-28 px-6 md:px-14 bg-white">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-[1.8rem] md:text-[2.5rem] font-extrabold tracking-tight leading-[1] mb-2">
              Seven seniors,{' '}
              <span className="font-extralight">one semester, no sleep.</span>
            </h2>
            <p className="text-[14px] text-[#aaa] font-light leading-relaxed max-w-md mb-10">
              COMP 490 Senior Design, 2025–2026. We wanted to leave something behind that actually helps.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              {teamCols.map((col) => (
                <div key={col.group}>
                  <div className="text-[11px] font-semibold text-[#CC0033] tracking-wide pb-2 mb-4 border-b-2 border-[#CC0033] inline-block">
                    {col.group}
                  </div>
                  <div className="space-y-3">
                    {col.people.map((p) => (
                      <div key={p.name}>
                        <div className="text-[15px] font-semibold">{p.name}</div>
                        <div className="text-[12px] text-[#ccc] font-light">{p.role}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======== LEGAL ======== */}
      <section className="bg-white py-14 px-6 md:px-14 border-t border-black/5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="text-[1.2rem] font-extrabold tracking-tight">Legal</h3>
              <p className="text-[12px] text-[#bbb] font-light mt-0.5">Effective March 2026</p>
            </div>
            <a href="mailto:support@campusconnect.com" className="text-[12px] text-[#CC0033] font-medium hover:underline underline-offset-4">
              support@campusconnect.com
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {legalDocs.map((doc, idx) => (
              <div key={doc.title} className="border-t border-black/[0.06]">
                <button onClick={() => setOpenLegal(openLegal === idx ? null : idx)} className="w-full flex justify-between items-center py-4 text-left group">
                  <span className="text-[14px] font-medium text-[#555] group-hover:text-[#111] transition-colors">{doc.title}</span>
                  <ChevronDown className={`w-4 h-4 text-[#ccc] transition-transform duration-300 ${openLegal === idx ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openLegal === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-[12px] text-[#aaa] leading-relaxed pb-5 font-light pr-8">{doc.body}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-black/[0.04] flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
            <p className="text-[11px] text-[#ccc] font-light">© 2026 CampusConnect. Not affiliated with California State University, Northridge.</p>
            <p className="text-[11px] text-[#ccc] font-light">COMP 490 Senior Design 2025–2026</p>
          </div>
        </div>
      </section>
    </div>
  );
}