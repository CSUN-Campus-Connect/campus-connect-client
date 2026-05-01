'use client';

// GlassPanels.tsx — Pure UI component, no backend integration needed.
// Used as a frosted-glass container in ClubsUI search/filter bar.
// No data fetching or mutation occurs here.

import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Frosted glass panel — animated aurora crimson bg with frosted glass overlay.
 * Page background stays white; the panel carries its own self-contained aurora.
 */
const GlassPanel: React.FC<GlassPanelProps> = ({ children, className = '' }) => {
  return (
    <div className={`glass-panel ${className}`}>
      {/* Animated aurora layers — live inside the panel */}
      <div className="aurora-layer-1" />
      <div className="aurora-layer-2" />
      <div className="aurora-shimmer" />
      {/* Content sits on top of everything */}
      <div className="glass-content">{children}</div>

      <style jsx>{`
        /* ── Container ── */
        .glass-panel {
          position: relative;
          border-radius: 28px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow:
            0 0 0 1px rgba(180, 0, 46, 0.14),
            0 20px 60px rgba(140, 0, 30, 0.32),
            0 4px 16px rgba(0, 0, 0, 0.10);
          transition:
            box-shadow 0.25s ease,
            border-color 0.25s ease,
            transform 0.25s ease;
          background: #e21c0ec9;
        }

        /* ── Aurora blob layer ── */
        .aurora-layer-1 {
          position: absolute;
          inset: -30%;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 90% 65% at 10%  5%,  rgba(230,20,50,0.90),  transparent 55%),
            radial-gradient(ellipse 80% 60% at 90%  8%,  rgba(212, 18, 99, 0.85),   transparent 55%),
            radial-gradient(ellipse 70% 55% at 50% 50%,  rgba(210,30,60,0.60),  transparent 60%),
            radial-gradient(ellipse 75% 60% at 15% 90%,  rgba(231, 82, 23, 0.8),   transparent 55%),
            radial-gradient(ellipse 80% 65% at 85% 88%,  rgba(200,10,40,0.75),  transparent 55%),
            radial-gradient(ellipse 60% 40% at 40% 30%,  rgba(255,50,70,0.40),  transparent 60%);
          filter: blur(40px) saturate(180%);
          animation: panelAuroraShift 20s ease-in-out infinite alternate;
        }

        /* ── Aurora streak layer ── */
        .aurora-layer-2 {
          position: absolute;
          inset: -20%;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 140% 35% at 25% 15%, rgba(255,80,100,0.28), transparent 55%),
            radial-gradient(ellipse 120% 30% at 75% 80%, rgba(200,20,55,0.22),  transparent 55%),
            radial-gradient(ellipse 160% 20% at 50% 55%, rgba(190,0,40,0.18),   transparent 60%);
          filter: blur(30px) saturate(160%);
          animation: panelAuroraStreaks 26s ease-in-out infinite alternate-reverse;
        }

        /* ── Shimmer pulse ── */
        .aurora-shimmer {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 50% 30% at 70% 20%, rgba(255,100,120,0.15), transparent 60%),
            radial-gradient(ellipse 40% 25% at 30% 75%, rgba(220,40,70,0.12),   transparent 60%);
          animation: panelShimmer 8s ease-in-out infinite alternate;
        }

        /* ── Frosted glass overlay — above aurora, below content ── */
        .glass-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          backdrop-filter: blur(20px) saturate(150%);
          background: rgba(50, 0, 12, 0.22);
        }

        /* ── Content — white text since bg is crimson ── */
        .glass-content {
          position: relative;
          z-index: 2;
          padding: 1.6rem 1.4rem;
          color: white;
        }

        .glass-panel:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.32);
          box-shadow:
            0 0 0 1px rgba(255, 100, 120, 0.20),
            0 28px 70px rgba(63, 63, 63, 0.42),
            0 6px 20px rgba(0, 0, 0, 0.14);
        }

        @keyframes panelAuroraShift {
          0%   { transform: translate(-4%, -5%) scale(1.03) rotate(0deg);    }
          25%  { transform: translate( 5%, -3%) scale(1.08) rotate(0.5deg);  }
          50%  { transform: translate( 3%,  6%) scale(1.05) rotate(-0.5deg); }
          75%  { transform: translate(-5%,  4%) scale(1.07) rotate(0.3deg);  }
          100% { transform: translate(-2%, -2%) scale(1.04) rotate(0deg);    }
        }

        @keyframes panelAuroraStreaks {
          0%   { transform: translate( 4%,  3%) scale(1.04); }
          33%  { transform: translate(-5%, -4%) scale(1.09); }
          66%  { transform: translate( 3%, -2%) scale(1.06); }
          100% { transform: translate(-3%,  5%) scale(1.05); }
        }

        @keyframes panelShimmer {
          0%   { opacity: 0.4; }
          50%  { opacity: 1;   }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default GlassPanel;
