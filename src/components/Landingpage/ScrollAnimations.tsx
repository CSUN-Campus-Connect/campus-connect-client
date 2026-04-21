'use client';

import * as React from 'react';
import { Box } from '@mui/material';

export function useScrollInView(
  { threshold = 0.2, freezeOnceVisible = false }: { threshold?: number; freezeOnceVisible?: boolean } = {}
) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (freezeOnceVisible && entry.isIntersecting) { setInView(true); return; }
        setInView(entry.isIntersecting);
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, freezeOnceVisible]);

  return { ref, inView };
}

export type ScrollFadeInProps = {
  children: React.ReactNode;
  delay?: number;
  translateY?: number;
};

export const ScrollFadeIn: React.FC<ScrollFadeInProps> = ({
  children,
  delay = 0,
  translateY = 24,
}) => {
  const { ref, inView } = useScrollInView({ freezeOnceVisible: true });

  return (
    <Box
      ref={ref}
      sx={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : `translateY(${translateY}px)`,
        transition: `opacity 700ms ${delay}ms ease-out, transform 700ms ${delay}ms ease-out`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </Box>
  );
};

export const ScrollSlideIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  from?: 'left' | 'right';
}> = ({ children, delay = 0, from = 'left' }) => {
  const { ref, inView } = useScrollInView({ freezeOnceVisible: true });
  const x = from === 'left' ? -60 : 60;

  return (
    <Box
      ref={ref}
      sx={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translate(0, 0)' : `translate(${x}px, 0)`,
        transition: `opacity 700ms ${delay}ms ease-out, transform 700ms ${delay}ms ease-out`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </Box>
  );
};