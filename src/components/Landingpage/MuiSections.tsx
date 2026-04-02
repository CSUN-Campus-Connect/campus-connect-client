'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Box, Typography, Button } from '@mui/material';
import { motion, type MotionValue } from 'framer-motion';
import { keyframes } from '@mui/system';
import GlassPanel from '@/components/Landingpage/GlassPanels';

const crimson = Crimson_Text({
  subsets: ['latin'],
  weight: ['700'], // or ['400','600','700'] if you want more weights

});
// text / generic scroll fade
import { ScrollFadeIn } from '@/components/Landingpage/ScrollAnimations';
// media components
import {
  CsunSignParallax,
  MatadorStaircaseParallax,
  ToroHeroVideo,
  AnimatedFeatureCarousel,
  AnimatedImageStripGrid,
} from '@/components/Landingpage/MediaAnimations';
import { Crimson_Text } from 'next/font/google';

const featureCards = [
  {
    title: 'Student Marketplace',
    text: 'Buy, sell, and trade books, dorm essentials, and more on a secure student focused marketplace.',
    image: '/images/Homepage/marketplace.jpg',
  },
  {
    title: 'Clubs and Communities',
    text: 'Discover clubs, join communities, and never miss a meeting or group hangout again.',
    image: '/images/Homepage/clubs.jpg',
  },
  {
    title: 'SRC and Campus Life',
    text: 'Track SRC activities, fitness classes, and interactive wellness features tied to your campus.',
    image: '/images/Homepage/src.jpg',
  },
  {
    title: 'Smart Degree Planner',
    text: 'Visualize semesters, map prerequisites, and keep graduation on track with a guided planner.',
    image: '/images/Homepage/degree.jpg',
  },
  {
    title: 'Events and Media Feed',
    text: 'Live event feeds, student media highlights, and campus stories in one curated stream.',
    image: '/images/Homepage/events.jpg',
  },
];

// base images for the collage columns
// Column 1 images
const stripImagesCol1 = Array.from({ length: 8 }, (_, i) =>
  `/images/HPstrip/Column1/${i + 1}.jpg`
);

// Column 2 images
const stripImagesCol2 = Array.from({ length: 8 }, (_, i) =>
  `/images/HPstrip/Column2/${i + 1}.jpg`
);

// Column 3 images
const stripImagesCol3 = Array.from({ length: 8 }, (_, i) =>
  `/images/HPstrip/Column3/${i + 1}.jpg`
);


export type HeroSectionProps = {
  heroY: MotionValue<number>;
  heroScale: MotionValue<number>;
  heroOpacity: MotionValue<number>;
};

/* -----------------------------------------------------------
   HERO: LOGO + ENTER BUTTON (TOP INTRO)
----------------------------------------------------------- */

export const HeroSection: React.FC<HeroSectionProps> = ({
  heroY,
  heroScale,
  heroOpacity,
}) => {
  const [showMoreInfo, setShowMoreInfo] = React.useState(true);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowMoreInfo(window.scrollY < 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true } as any);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMoreInfoClick = () => {
    const target = document.getElementById('carousel-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const bounceArrow = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(8px); }
  `;

  return (
    <Box
      component={motion.section}
      style={{
        y: heroY,
        scale: heroScale,
        opacity: heroOpacity,
      }}
      sx={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        pt: { xs: 10, md: 16 },
        px: { xs: 2, md: 3 },
        position: 'relative',
      }}
    >
      <ScrollFadeIn translateY={18}>
        <Box
          sx={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <Box
            sx={{
              mb: 2,
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.9))',
            }}
          >
            <Image
              src="/ToroConnectLP.png"
              alt="Toro Campus Connect Logo"
              width={420}
              height={420}
              priority
              style={{ objectFit: 'contain', width: 'auto', height: 'auto', maxWidth: '360px' }}
            />
          </Box>

          <Button
            component={Link}
            href="/access"
            sx={{
              mt: 1,
              px: 6,
              py: 1.5,
              borderRadius: 0,
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: 'rgba(255,255,255,0.9)',
              backgroundColor: 'rgba(10,0,0,0.45)',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              boxShadow:
                '0 0 0 1px rgba(255,255,255,0.25), 0 14px 30px rgba(0,0,0,0.7)',
              transition:
                'transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, border-color 0.18s ease',
              '&:hover': {
                transform: 'translateY(-2px) scale(1.02)',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: '#ffffff',
                boxShadow:
                  '0 0 0 1px rgba(255,255,255,0.4), 0 20px 45px rgba(0,0,0,0.9), 0 0 50px rgba(255,255,255,0.45)',
              },
            }}
          >
            Enter
          </Button>
        </Box>
      </ScrollFadeIn>

      {showMoreInfo && (
        <Button
          onClick={handleMoreInfoClick}
          sx={{
            position: 'absolute',
            bottom: { xs: -25, md: -35 },
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.3,
            px: 0,
            py: 0,
            minWidth: 'auto',
            backgroundColor: 'transparent',
            border: 'none',
            boxShadow: 'none',
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            fontSize: '0.85rem',
            '&:hover': {
              backgroundColor: 'transparent',
              boxShadow: 'none',
            },
          }}
        >
          <Box component="span">More info</Box>
          <Box
            component="span"
            sx={{
              fontSize: '1.6rem',
              lineHeight: 1,
              animation: `${bounceArrow} 2.1s ease-in-out infinite`,
            }}
          >
            ˅
          </Box>
        </Button>
      )}
    </Box>
  );
};

/* -----------------------------------------------------------
   EXPLORE / CAROUSEL
----------------------------------------------------------- */

export const CarouselSection: React.FC = () => {
  return (
    <Box
      id="carousel-section"
      component="section"
      sx={{
        width: '100%',
        mb: { xs: 4, md: 4 },
      }}
    >
      <ScrollFadeIn>
        <GlassPanel>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, mb: 0.5, fontSize: '1.4rem' }}
          >
            Explore Toro Campus Connect
          </Typography>
          <Typography
            variant="body2"
            sx={{ opacity: 0.9, fontSize: '0.95rem' }}
          >
            A dynamic hub where students plug into campus life, resources, and each other.
          </Typography>
        </GlassPanel>
      </ScrollFadeIn>
      <Box sx={{ mt: { xs: 2, md: 3 } }}>
        <AnimatedFeatureCarousel cards={featureCards} />
      </Box>
    </Box>
  );
};

/* -----------------------------------------------------------
   DESCRIPTION SECTION
----------------------------------------------------------- */

export const DescriptionSection: React.FC = () => (
  <Box
    component="section"
    sx={{
      width: '100%',
      mb: { xs: 4, md: 5 },
    }}
  >
    <ScrollFadeIn>
      <GlassPanel>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mb: 1, fontSize: '1.4rem' }}
        >
          A New Way To Connect With Campus Life
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.95rem',
            lineHeight: 1.7,
            opacity: 0.96,
            mb: 1,
          }}
        >
          Toro Campus Connect is built to help students feel at home on campus from the first day
          to graduation. It brings together the tools and spaces students rely on every day and
          wraps them in a social experience that feels natural and fun.
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.95rem',
            lineHeight: 1.7,
            opacity: 0.96,
          }}
        >
          Discover ways to connect with friends, clubs, and events while staying organized with
          schedules, planning tools, and student focused services. Toro Campus Connect keeps
          everything you need for daily college life in one place so you can focus on making the
          most of every semester.
        </Typography>
      </GlassPanel>
    </ScrollFadeIn>
  </Box>
);

/* -----------------------------------------------------------
   VIDEO CONNECT SECTION (AFTER DESCRIPTION)
----------------------------------------------------------- */

export const VideoConnectSection: React.FC = () => (
  <Box sx={{ width: '100%', mb: { xs: 5, md: 7 } }}>
    <ToroHeroVideo />
  </Box>
);


/* -----------------------------------------------------------
   IMAGE COLLAGE SECTION
----------------------------------------------------------- */

export const ImageCollageSection: React.FC = () => (
  <Box
    component="section"
    sx={{
      width: '100%',
      mb: { xs: 8, md: 10 },
    }}
  >
    <ScrollFadeIn>
      {/* this Box centers the GlassPanel as a block */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <GlassPanel>
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '2.4rem', sm: '3.2rem', md: '4rem' },
              fontFamily: crimson.style.fontFamily,
              fontWeight: 700,
              textTransform: 'uppercase',
              lineHeight: 1.1,
              textAlign: 'center',  
              width: '100%',    
            }}
          >
            Community in Motion
          </Typography>
        </GlassPanel>
      </Box>
    </ScrollFadeIn>

    <Box sx={{ mt: { xs: 3, md: 4 } }}>
      <AnimatedImageStripGrid
          columns={[
          stripImagesCol1,
          stripImagesCol2,
          stripImagesCol3,
        ]}
      />
    </Box>
  </Box>
);


export const CsunSignSection: React.FC = () => (
  <Box
    component="section"
    sx={{
      width: '100%',
      my: { xs: 6, md: 10 },
    }}
  >
    <CsunSignParallax />
  </Box>
);

/* -----------------------------------------------------------
   FEATURES & TEAM
----------------------------------------------------------- */

type FeatureItemProps = {
  title: string;
  text: string;
};

const FeatureItem: React.FC<FeatureItemProps> = ({ title, text }) => (
  <ScrollFadeIn translateY={14}>
    <Box
      component="li"
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'minmax(0, 180px) minmax(0, 1fr)',
        },
        columnGap: 1.5,
        rowGap: 0.5,
        fontSize: '0.93rem',
      }}
    >
      <Typography component="span" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography component="span" sx={{ opacity: 0.96 }}>
        {text}
      </Typography>
    </Box>
  </ScrollFadeIn>
);

export const FeaturesSection: React.FC = () => (
  <Box
    component="section"
    sx={{
      width: '100%',
      mb: { xs: 4, md: 5 },
    }}
  >
    <ScrollFadeIn>
      <GlassPanel>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mb: 1, fontSize: '1.4rem' }}
        >
          Included Features:
        </Typography>
        <Box
          component="ul"
          sx={{
            listStyle: 'none',
            p: 0,
            m: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <FeatureItem
            title="Student based marketplace"
            text=" -  Post listings for books, supplies, housing, rides, and more in a student only space."
          />
          <FeatureItem
            title="Note share"
            text=" -  Share and discover class notes, study guides, and helpful resources by course and topic."
          />
          <FeatureItem
            title="Club platforms"
            text=" -  Centralize club announcements, chats, membership info, and event calendars."
          />
          <FeatureItem
            title="SRC interactive features"
            text=" -  Engage with fitness classes, schedules, and interactive SRC programming."
          />
          <FeatureItem
            title="Degree planner tool"
            text=" -  Design your academic roadmap, keep track of requirements, and plan future terms."
          />
          <FeatureItem
            title="Events and student media feed"
            text=" -  Scroll through live event posts, student media, and campus highlights in a single feed."
          />
        </Box>
      </GlassPanel>
    </ScrollFadeIn>
  </Box>
);

export const MatadorStaircaseSection: React.FC = () => (
  <Box
    component="section"
    sx={{
      width: '100%',
      my: { xs: 6, md: 10 },
    }}
  >
    <MatadorStaircaseParallax />
  </Box>
);

type TeamColumnProps = {
  role: string;
  members: string[];
};

const TeamColumn: React.FC<TeamColumnProps> = ({ role, members }) => (
  <ScrollFadeIn translateY={16}>
    <Box
      sx={{
        p: 1.5,
        borderRadius: 0,
        border: '1px solid rgba(255,255,255,0.9)',
        backgroundColor: 'rgba(0,0,0,0.45)',
        boxShadow:
          '0 0 0 1px rgba(255,255,255,0.25), 0 10px 30px rgba(0,0,0,0.8)',
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, mb: 0.75, fontSize: '1rem' }}
      >
        {role}
      </Typography>
      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          p: 0,
          m: 0,
          fontSize: '0.9rem',
          opacity: 0.97,
        }}
      >
        {members.map(m => (
          <Box
            key={m}
            component="li"
            sx={{
              '& + &': { mt: 0.25 },
            }}
          >
            {m}
          </Box>
        ))}
      </Box>
    </Box>
  </ScrollFadeIn>
);

export const TeamSection: React.FC = () => (
  <Box
    component="section"
    sx={{
      width: '100%',
      mb: { xs: 4, md: 5 },
    }}
  >
    <ScrollFadeIn>
      <GlassPanel>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mb: 0.75, fontSize: '1.4rem' }}
        >
          Meet The Team
        </Typography>
        <Typography
          variant="body2"
          sx={{ opacity: 0.9, fontSize: '0.95rem', mb: 2 }}
        >
          The Toro Campus Connect experience was built by a dedicated team of CSUN CS developers
          passionate about enhancing student life through technology, all while wanting leave a meaningful impression
          and legacy at CSU Northridge for their capstone project 2025-2026.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr',
            },
            gap: 2,
            mb: 2,
          }}
        >
          <TeamColumn
            role="Frontend and Scrum"
            members={[
              'Sarah - Frontend Designer and Scrum master',
              'Vram - Frontend Designer',
            ]}
          />
          <TeamColumn
            role="Full Stack"
            members={[
              'Joseph - Full stack development',
              'Elijah - Full stack development',
            ]}
          />
          <TeamColumn
            role="Backend"
            members={[
              'Justin - Backend services',
              'Ivan - Backend services',
              'Giselle - Backend services',
            ]}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontSize: '0.95rem',
            lineHeight: 1.7,
            opacity: 0.96,
          }}
        >
          Together, the team focuses on creating a smooth, accessible, and visually engaging way for
          students to tap into every corner of campus life. With features designed to aid students in academics and 
          bring a sense of community, Toro Campus Connect is their gift to future Matadors.
        </Typography>
      </GlassPanel>
    </ScrollFadeIn>
  </Box>
);
