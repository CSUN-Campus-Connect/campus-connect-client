'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Box, Typography, Container } from '@mui/material';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Bebas_Neue, Outfit } from 'next/font/google';
import { ScrollFadeIn } from '@/components/Landingpage/ScrollAnimations';
import {
  VideoSection,
  AnimatedImageStripGrid,
  OverlapMatador,
  OverlapCsunSign,
} from '@/components/Landingpage/MediaAnimations';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: ['400'] });
const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800'] });

const featureCards = [
  {
    title: 'Social Feed',
    text: 'Posts, photos, and updates from students and orgs you follow. Your campus timeline.',
    image: '/images/Homepage/events.jpg',
  },
  {
    title: 'Messaging',
    text: 'DMs and group chats with classmates. Coordinate study sessions, plan hangouts, whatever.',
    image: '/images/Homepage/clubs.jpg',
  },
  {
    title: 'Marketplace',
    text: 'Textbooks, furniture, parking passes — buy and sell with other CSUN students.',
    image: '/images/Homepage/marketplace.jpg',
  },
  {
    title: 'Clubs & Orgs',
    text: 'Find your people. 300+ clubs, all in one place with announcements and events.',
    image: '/images/Homepage/clubs.jpg',
  },
  {
    title: 'Events & Media',
    text: 'See what\'s going on this week without checking five different Instagram pages.',
    image: '/images/Homepage/events.jpg',
  },
  {
    title: 'SRC & Fitness',
    text: 'Class schedules, open gym hours, and everything happening at the rec center.',
    image: '/images/Homepage/src.jpg',
  },
  {
    title: 'Degree Planner',
    text: 'Figure out what classes you need and when to take them. No more guessing.',
    image: '/images/Homepage/degree.jpg',
  },
  {
    title: 'Course Search',
    text: 'Look up classes, read what other students said about professors, plan your semester.',
    image: '/images/Homepage/events.jpg',
  },
  {
    title: 'Notifications',
    text: 'Class updates, club announcements, marketplace replies — all in one place so you don\'t miss anything.',
    image: '/images/Homepage/degree.jpg',
  },
  {
    title: 'University Info',
    text: 'Campus maps, dining menus, emergency contacts, athletics scores — the stuff you always have to Google.',
    image: '/images/Homepage/src.jpg',
  },
];

const stripImagesCol1 = Array.from({ length: 8 }, (_, i) => `/images/HPstrip/Column1/${i + 1}.jpg`);
const stripImagesCol2 = Array.from({ length: 8 }, (_, i) => `/images/HPstrip/Column2/${i + 1}.jpg`);
const stripImagesCol3 = Array.from({ length: 8 }, (_, i) => `/images/HPstrip/Column3/${i + 1}.jpg`);

const teamFrontend = [
  { name: 'Sarah', role: 'Frontend / Scrum' },
  { name: 'Vram', role: 'Frontend' },
  { name: 'Elijah', role: 'Frontend' },
];

const teamMiddle = [
  { name: 'Joseph', role: 'Full Stack' },
  { name: 'Ivan', role: 'DevOps / Backend' },
];

const teamBackend = [
  { name: 'Justin', role: 'Backend' },
  { name: 'Giselle', role: 'Backend' },
];

export type HeroSectionProps = {
  heroY: MotionValue<number>;
  heroScale: MotionValue<number>;
  heroOpacity: MotionValue<number>;
};

export const HeroSection: React.FC<HeroSectionProps> = ({ heroY, heroScale, heroOpacity }) => {
  const handleExplore = () => {
    const el = document.getElementById('video-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box
      component={motion.section}
      style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
      className="lp-intro"
    >
      <Box sx={{ mb: 4 }}>
        <Image
          src="/ToroConnectLP.png"
          alt="Toro Campus Connect Logo"
          width={200}
          height={200}
          priority
          style={{ objectFit: 'contain', width: 'auto', height: 'auto', maxWidth: '180px' }}
        />
      </Box>

      <Typography
        className={outfit.className}
        sx={{
          fontFamily: outfit.style.fontFamily,
          fontSize: { xs: '2.4rem', md: '3.2rem' },
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: '-0.03em',
          color: '#1a1a1a',
          maxWidth: 520,
        }}
      >
        Your entire campus,
        <br />
        <Box component="span" sx={{ color: '#CC0033' }}>one app.</Box>
      </Typography>

      <Typography
        className={outfit.className}
        sx={{
          fontFamily: outfit.style.fontFamily,
          fontSize: '0.95rem',
          fontWeight: 400,
          color: '#999',
          mt: 1.5,
          maxWidth: 360,
          lineHeight: 1.6,
        }}
      >
        Where you find your classes, your clubs, your people, and everything else going on at CSUN.
      </Typography>

      <Box sx={{ display: 'flex', gap: 1.5, mt: 3.5 }}>
        <Link href="/access" className="lp-btn-red" style={{ textDecoration: 'none' }}>
          Sign up
        </Link>
        <Box component="button" className="lp-btn-outline" onClick={handleExplore}>
          See more
        </Box>
      </Box>

      <Box
        onClick={handleExplore}
        sx={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
        }}
      >
        <Box className="lp-scroll-line" />
      </Box>
    </Box>
  );
};

export const VideoBlock: React.FC = () => (
  <Box id="video-section" sx={{ background: '#FFFBF5' }}>
    <VideoSection />
  </Box>
);

export const HorizontalFeatures: React.FC = () => (
  <Box
    component="section"
    sx={{ background: '#FFFBF5', pt: { xs: 4, md: 6 }, pb: { xs: 4, md: 5 }, pl: { xs: 2, md: 4 } }}
  >
    <ScrollFadeIn>
      <Typography
        className={outfit.className}
        sx={{
          fontFamily: outfit.style.fontFamily,
          fontSize: { xs: '1.6rem', md: '2rem' },
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: '#1a1a1a',
          mb: 2.5,
        }}
      >
        What&apos;s in here
      </Typography>
    </ScrollFadeIn>

    <Box className="lp-horz-track">
      {featureCards.map((card) => (
        <Box key={card.title} className="lp-hcard">
          <Box className="lp-hcard-img">
            <Image
              src={card.image}
              alt={card.title}
              fill
              sizes="280px"
              style={{ objectFit: 'cover' }}
            />
          </Box>
          <Box sx={{ p: '1.2rem 1rem' }}>
            <Typography className={outfit.className} sx={{ fontFamily: outfit.style.fontFamily, fontSize: '0.95rem', fontWeight: 600, color: '#1a1a1a', mb: 0.3 }}>
              {card.title}
            </Typography>
            <Typography className={outfit.className} sx={{ fontFamily: outfit.style.fontFamily, fontSize: '0.8rem', lineHeight: 1.5, color: '#aaa', fontWeight: 400 }}>
              {card.text}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  </Box>
);

export const OverlapSections: React.FC = () => (
  <Box sx={{ background: '#FFFBF5' }}>
    <OverlapMatador />
    <OverlapCsunSign />
  </Box>
);

export const CollageSection: React.FC = () => (
  <Box
    component="section"
    sx={{ background: '#1a1a1a', color: '#fff', py: { xs: 5, md: 7 }, px: { xs: 2, md: 3 }, textAlign: 'center' }}
  >
    <Container maxWidth="md">
      <ScrollFadeIn>
        <Typography
          className={outfit.className}
          sx={{
            fontFamily: outfit.style.fontFamily,
            fontSize: { xs: '1.6rem', md: '2rem' },
            fontWeight: 700,
            letterSpacing: '-0.02em',
            mb: 3,
          }}
        >
          Community in Motion
        </Typography>
      </ScrollFadeIn>
      <AnimatedImageStripGrid columns={[stripImagesCol1, stripImagesCol2, stripImagesCol3]} />
    </Container>
  </Box>
);

export const CtaSection: React.FC = () => (
  <Box
    component="section"
    sx={{
      background: '#CC0033',
      color: '#fff',
      py: { xs: 5, md: 6 },
      px: { xs: 2, md: 4 },
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      alignItems: 'center',
      justifyContent: 'center',
      gap: { xs: 3, md: 6 },
    }}
  >
    <ScrollFadeIn>
      <Box sx={{ maxWidth: 380 }}>
        <Typography
          className={outfit.className}
          sx={{
            fontFamily: outfit.style.fontFamily,
            fontSize: { xs: '1.8rem', md: '2.2rem' },
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            mb: 1,
          }}
        >
          Wanna try it?
        </Typography>
        <Typography
          className={outfit.className}
          sx={{ fontFamily: outfit.style.fontFamily, fontSize: '0.9rem', opacity: 0.75, lineHeight: 1.6, mb: 2.5 }}
        >
          We launch Spring 2026. Sign up and we&apos;ll let you know when it&apos;s ready.
        </Typography>
        <Link href="/access" className="lp-btn-white" style={{ textDecoration: 'none' }}>
          Sign up
        </Link>
      </Box>
    </ScrollFadeIn>

    <ScrollFadeIn delay={150}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {[
          { n: '10+', l: 'features' },
          { n: '38k', l: 'students at CSUN' },
          { n: '5', l: 'apps we replace' },
        ].map((s, idx) => (
          <Box
            key={s.l}
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 1.5,
              py: 1.2,
              borderTop: idx === 0 ? '1px solid rgba(255,255,255,0.15)' : 'none',
              borderBottom: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <Typography className={outfit.className} sx={{ fontFamily: outfit.style.fontFamily, fontSize: '1.4rem', fontWeight: 700, minWidth: 50 }}>
              {s.n}
            </Typography>
            <Typography className={outfit.className} sx={{ fontFamily: outfit.style.fontFamily, fontSize: '0.85rem', opacity: 0.6 }}>
              {s.l}
            </Typography>
          </Box>
        ))}
      </Box>
    </ScrollFadeIn>
  </Box>
);

export const TeamSection: React.FC = () => (
  <Box component="section" sx={{ background: '#FFFBF5', py: { xs: 5, md: 7 }, px: 2 }}>
    <Container maxWidth="md">
      <ScrollFadeIn>
        <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
          <Typography
            className={outfit.className}
            sx={{
              fontFamily: outfit.style.fontFamily,
              fontSize: { xs: '1.6rem', md: '1.9rem' },
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#1a1a1a',
              mb: 0.5,
            }}
          >
            Seven seniors, one semester, no sleep.
          </Typography>
          <Typography
            className={outfit.className}
            sx={{
              fontFamily: outfit.style.fontFamily,
              fontSize: '0.95rem',
              color: '#888',
              maxWidth: 400,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            COMP 490 Senior Design, 2025–2026. We wanted to leave something behind that actually helps.
          </Typography>
        </Box>
      </ScrollFadeIn>

      <ScrollFadeIn delay={80}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: { xs: 3, md: 4 },
            maxWidth: 700,
            mx: 'auto',
          }}
        >
          {[
            { label: 'Frontend', members: teamFrontend },
            { label: 'Full Stack & DevOps', members: teamMiddle },
            { label: 'Backend', members: teamBackend },
          ].map((col) => (
            <Box key={col.label}>
              <Typography
                className={outfit.className}
                sx={{
                  fontFamily: outfit.style.fontFamily,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#CC0033',
                  mb: 2,
                  pb: 1,
                  borderBottom: '2px solid #CC0033',
                  display: 'inline-block',
                }}
              >
                {col.label}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {col.members.map((m) => (
                  <Box key={m.name}>
                    <Typography
                      className={outfit.className}
                      sx={{
                        fontFamily: outfit.style.fontFamily,
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        lineHeight: 1.3,
                      }}
                    >
                      {m.name}
                    </Typography>
                    <Typography
                      className={outfit.className}
                      sx={{
                        fontFamily: outfit.style.fontFamily,
                        fontSize: '0.78rem',
                        color: '#aaa',
                        lineHeight: 1.3,
                      }}
                    >
                      {m.role}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </ScrollFadeIn>
    </Container>
  </Box>
);

const legalDocs = [
  {
    title: 'Terms of Service',
    content: `By accessing or using CampusConnect, you agree to these Terms. CampusConnect is a student project (CSUN COMP 490) and is not an official CSUN product.\n\nEligibility: Must be enrolled CSUN student/faculty/staff, 18+ years old. Register with valid CSUN email.\n\nUser Content: You retain ownership. You grant us a non-exclusive license to display your content for platform operation.\n\nProhibited: No illegal activity, harassment, fake reviews, impersonation, unauthorized access, spam, prohibited item sales, or academic dishonesty.\n\nMarketplace: We are not a party to transactions. All transactions at your own risk.\n\nGoverning Law: State of California. Disputes in Los Angeles County courts.\n\nContact: campusconnect.csun@gmail.com`,
  },
  {
    title: 'Privacy Policy',
    content: `We collect: account info (name, CSUN email, hashed password), profile info, user content, device/usage data. We use publicly available CSUN API data.\n\nWe do not sell your data. We share with: other users (normal functionality), service providers (Supabase, Vercel), for legal compliance/safety.\n\nFERPA: We do not access education records. Course/faculty data comes from public APIs.\n\nSecurity: PostgreSQL with encryption at rest, hashed passwords, HTTPS/TLS.\n\nYour rights: Access, correction, deletion, portability, opt-out. CCPA rights for CA residents.\n\nContact: campusconnect.csun@gmail.com`,
  },
  {
    title: 'Community Guidelines',
    content: `Be Respectful: No hate speech, harassment, bullying, threats, or doxxing.\n\nBe Honest: Real identity, genuine reviews, accurate listings.\n\nKeep It Legal: No weapons, drugs, stolen goods, counterfeit items, academic work.\n\nKeep It Safe: No explicit content, graphic violence, or promotion of self-harm. Emergencies: 818-677-2111.\n\nEnforcement: Warnings, content removal, suspension, or permanent ban based on severity.`,
  },
  {
    title: 'Copyright & DMCA',
    content: `We respond to DMCA takedown notices. Send to campusconnect.csun@gmail.com with subject "DMCA Takedown Notice."\n\nCounter-notifications accepted if content removed in error.\n\nThree valid DMCA notices result in permanent account suspension.\n\nUsers are responsible for ensuring their content doesn't infringe third-party rights.`,
  },
  {
    title: 'Acceptable Use Policy',
    content: `Permitted: Communication, marketplace transactions, honest reviews, discovering clubs/events, accessing campus info.\n\nProhibited: Illegal activity, malware, security probing, bots/scrapers, disrupting infrastructure, data harvesting, commercial advertising, ban evasion, reverse engineering.\n\nViolations may result in content removal, suspension, or bans. Illegal activity reported to law enforcement.`,
  },
  {
    title: 'Disclaimer & Liability',
    content: `Provided "as is" without warranties. Not affiliated with CSUN or the CSU system.\n\nWe do not guarantee accuracy of campus data. Always verify through official CSUN channels.\n\nMarketplace: Not a party to transactions. Users transact at own risk.\n\nReviews are subjective user opinions.\n\nTotal aggregate liability: $0 (free, non-commercial student project).`,
  },
  {
    title: 'Cookie Policy',
    content: `Essential cookies: Authentication, sessions, security (cannot opt out).\n\nPreference cookies: Theme, notification settings.\n\nAnalytics cookies: Anonymous usage data.\n\nThird-party: Vercel/Supabase may set cookies per their policies.\n\nManage via browser settings. Mobile app uses local/secure storage.\n\nContact: campusconnect.csun@gmail.com`,
  },
];

type LegalItemProps = { title: string; content: string; isOpen: boolean; onToggle: () => void };

const LegalItem: React.FC<LegalItemProps> = ({ title, content, isOpen, onToggle }) => (
  <Box className="lp-legal-row">
    <Box component="button" className="lp-legal-toggle" onClick={onToggle}>
      <Typography className={outfit.className} sx={{ fontFamily: outfit.style.fontFamily, fontSize: '0.9rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>
        {title}
      </Typography>
      <Box className="lp-legal-chevron" sx={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
        <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
      </Box>
    </Box>
    <Box className="lp-legal-content" sx={{ maxHeight: isOpen ? '500px' : '0px' }}>
      <Typography
        className={outfit.className}
        sx={{
          fontFamily: outfit.style.fontFamily,
          fontSize: '0.78rem',
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.35)',
          pt: 1,
          pb: 2,
          whiteSpace: 'pre-line',
        }}
      >
        {content}
      </Typography>
    </Box>
  </Box>
);

export const LegalSection: React.FC = () => {
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);

  return (
    <Box component="section" sx={{ background: '#111', color: '#fff', py: { xs: 4, md: 5 }, px: { xs: 2, md: 3 } }}>
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography className={outfit.className} sx={{ fontFamily: outfit.style.fontFamily, fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>
            Legal
          </Typography>
          <Typography className={outfit.className} sx={{ fontFamily: outfit.style.fontFamily, fontSize: '0.65rem', color: 'rgba(255,255,255,0.15)' }}>
            Effective March 2026
          </Typography>
        </Box>

        {legalDocs.map((doc, idx) => (
          <LegalItem
            key={doc.title}
            title={doc.title}
            content={doc.content}
            isOpen={openIdx === idx}
            onToggle={() => setOpenIdx((prev) => (prev === idx ? null : idx))}
          />
        ))}

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography className={outfit.className} sx={{ fontFamily: outfit.style.fontFamily, fontSize: '0.65rem', color: 'rgba(255,255,255,0.12)' }}>
            © 2026 CampusConnect. Not affiliated with California State University, Northridge.
          </Typography>
          <Typography
            component="a"
            href="mailto:campusconnect.csun@gmail.com"
            className={outfit.className}
            sx={{ fontFamily: outfit.style.fontFamily, fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', textDecoration: 'none', '&:hover': { color: 'rgba(255,255,255,0.35)' } }}
          >
            campusconnect.csun@gmail.com
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};