'use client';

import * as React from 'react';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { motion, useScroll, useTransform, useAnimation } from 'framer-motion';
import { Bebas_Neue, Outfit } from 'next/font/google';
import { ScrollSlideIn } from '@/components/Landingpage/ScrollAnimations';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: ['400'] });
const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800'] });

export const HERO_VIDEO_SRC =
  'https://live-csu-northridge.pantheonsite.io/sites/default/files/2025-09/Generic%20Webpage%20Final%20New%20Bitrate.mp4';

export const VideoSection: React.FC = () => {
  const sectionRef = React.useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const videoScale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);
  const floatY = useTransform(scrollYProgress, [0.3, 0.7], [40, -20]);
  const floatOpacity = useTransform(scrollYProgress, [0.2, 0.4, 0.8, 1], [0, 1, 1, 0]);

  return (
    <>
      <Box
        ref={sectionRef}
        sx={{
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: '100%',
            aspectRatio: { xs: '16 / 9', md: '2.1 / 1' },
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Box className="lp-video-fade-left" />
          <Box className="lp-video-fade-right" />

          <Box
            component={motion.div}
            style={{ scale: videoScale }}
            sx={{ position: 'absolute', inset: 0, zIndex: 0 }}
          >
            <Box
              component="video"
              src={HERO_VIDEO_SRC}
              autoPlay
              muted
              loop
              playsInline
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>

          <Box className="lp-play-circle" sx={{ position: 'relative' }}>
            <svg viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </Box>
        </Box>
      </Box>

      <Box
        component={motion.div}
        style={{ y: floatY, opacity: floatOpacity }}
        sx={{
          position: 'relative',
          zIndex: 4,
          mt: '-50px',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <Typography
          className={bebas.className}
          sx={{
            fontFamily: bebas.style.fontFamily,
            fontSize: { xs: '1.6rem', md: '2rem' },
            fontWeight: 400,
            letterSpacing: '0.04em',
            color: '#1a1a1a',
          }}
        >
          Get Connected{' '}
          <Box component="span" sx={{ color: '#CC0033' }}>with Toro</Box>
        </Typography>
      </Box>
    </>
  );
};

export type AnimatedImageStripGridProps = {
  columns: string[][];
};

export const AnimatedImageStripGrid: React.FC<AnimatedImageStripGridProps> = ({ columns }) => {
  const loopedColumns = React.useMemo(
    () => columns.map((col) => [...col, ...col, ...col]),
    [columns]
  );

  return (
    <Box className="lp-strip-grid" sx={{ maxWidth: 750, mx: 'auto' }}>
      {loopedColumns.map((images, colIdx) => (
        <Box
          key={colIdx}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            height: { xs: 500, md: 700 },
            borderRadius: '16px',
          }}
        >
          <Box className={`lp-strip-scroll ${colIdx % 2 === 0 ? 'lp-strip-scroll-down' : 'lp-strip-scroll-up'}`}>
            {images.map((src, imgIdx) => (
              <Box key={`${src}-${imgIdx}`} className="lp-strip-cell">
                <Image src={src} alt="" fill sizes="250px" style={{ objectFit: 'cover' }} />
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export const OverlapMatador: React.FC = () => (
  <Box className="lp-overlap" sx={{ px: { xs: 2, md: 4 }, my: { xs: 4, md: 6 } }}>
    <ScrollSlideIn from="left">
      <Box className="lp-overlap-img" sx={{ ml: 0 }}>
        <Image
          src="/images/Homepage/MatadorSunset.png"
          alt="Matador Statue Sunset"
          fill
          style={{ objectFit: 'cover' }}
        />
      </Box>
    </ScrollSlideIn>
    <ScrollSlideIn from="right" delay={150}>
      <Box className="lp-overlap-card" sx={{ right: { xs: 'auto', md: '2rem' } }}>
        <Typography
          className={outfit.className}
          sx={{
            fontFamily: outfit.style.fontFamily,
            fontSize: { xs: '1.6rem', md: '2rem' },
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            mb: 1,
            color: '#1a1a1a',
          }}
        >
          Built by Matadors,{' '}
          <Box component="span" sx={{ color: '#CC0033' }}>for Matadors.</Box>
        </Typography>
        <Typography
          className={outfit.className}
          sx={{
            fontFamily: outfit.style.fontFamily,
            fontSize: '0.875rem',
            lineHeight: 1.65,
            color: '#888',
          }}
        >
          Seven CSUN seniors who got tired of juggling five different apps just to get through a Tuesday. So we made this instead.
        </Typography>
      </Box>
    </ScrollSlideIn>
  </Box>
);

export const OverlapCsunSign: React.FC = () => (
  <Box className="lp-overlap" sx={{ px: { xs: 2, md: 4 }, my: { xs: 4, md: 6 } }}>
    <ScrollSlideIn from="right">
      <Box className="lp-overlap-img" sx={{ ml: 'auto' }}>
        <Image
          src="/images/Homepage/CSUN_Sign.jpg"
          alt="CSUN campus sign"
          fill
          style={{ objectFit: 'cover' }}
        />
      </Box>
    </ScrollSlideIn>
    <ScrollSlideIn from="left" delay={150}>
      <Box className="lp-overlap-card" sx={{ left: { xs: 'auto', md: '2rem' }, right: 'auto' }}>
        <Typography
          className={outfit.className}
          sx={{
            fontFamily: outfit.style.fontFamily,
            fontSize: { xs: '1.6rem', md: '2rem' },
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            mb: 1,
            color: '#1a1a1a',
          }}
        >
          Connect. Collaborate.{' '}
          <Box component="span" sx={{ color: '#CC0033' }}>Conquer.</Box>
        </Typography>
        <Typography
          className={outfit.className}
          sx={{
            fontFamily: outfit.style.fontFamily,
            fontSize: '0.875rem',
            lineHeight: 1.65,
            color: '#888',
          }}
        >
          The people you sit next to in class might end up being the people you start a company with. This is where that starts.
        </Typography>
      </Box>
    </ScrollSlideIn>
  </Box>
);