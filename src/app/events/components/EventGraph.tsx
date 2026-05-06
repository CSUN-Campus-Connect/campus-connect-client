'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import type { EventItem } from '../types';
import { CATEGORY_COLOR_MAP } from '../data/constants';

/**
 * EventGraph — Radial Cluster Layout
 *
 * Redesigned from the original flat grid layout to a radial / orbital system:
 * - Each category cluster occupies an orbital ring sector
 * - Node radius = sqrt(registered/capacity) * BASE_R  → proportional, never giant
 * - Edges rendered as curved bezier paths with opacity fade
 * - Canvas redraws only when dims/data/hover change (no rAF loop for perf)
 *
 * Layout algorithm — O(N + E):
 *   1. Assign each event to its category sector (arc slice of the ring)  O(N)
 *   2. Within each sector, place nodes along evenly-spaced radii           O(N)
 *   3. Build edge list: same-category or audience-overlap edges            O(N²) bounded at ~14 events ≈ 182 pairs max
 *   4. Draw edges, then nodes, then labels on canvas                       O(N + E)
 */

interface NodeData {
  event: EventItem;
  x: number;
  y: number;
  r: number;
  color: string;
}

interface EdgeData {
  a: NodeData;
  b: NodeData;
  weight: number;
}

// Maximum absolute radius a node can occupy (prevents one node from dominating)
const MAX_NODE_R = 36;
const MIN_NODE_R = 12;

function buildRadialLayout(events: EventItem[], W: number, H: number): {
  nodes: NodeData[];
  edges: EdgeData[];
} {
  const cx = W / 2;
  const cy = H / 2;
  const outerR = Math.min(W, H) * 0.38;  // ring radius
  const innerR = outerR * 0.35;           // minimum placement radius

  // Group events by category
  const categoryGroups = new Map<string, EventItem[]>();
  events.forEach((ev) => {
    const g = categoryGroups.get(ev.category) ?? [];
    g.push(ev);
    categoryGroups.set(ev.category, g);
  });

  const cats = [...categoryGroups.keys()];
  const sectorAngle = (Math.PI * 2) / cats.length;

  const nodes: NodeData[] = [];

  cats.forEach((cat, sectorIdx) => {
    const eventsInSector = categoryGroups.get(cat)!;
    const baseSectorAngle = sectorIdx * sectorAngle - Math.PI / 2; // top-origin

    eventsInSector.forEach((ev, nodeIdx) => {
      // Spread nodes within the sector arc
      const spread = sectorAngle * 0.7;  // 70% of sector width
      const angleOffset = eventsInSector.length > 1
        ? ((nodeIdx / (eventsInSector.length - 1)) - 0.5) * spread
        : 0;
      const angle = baseSectorAngle + angleOffset;

      // Radius varies by engagement score — higher score = closer to center (more prominent)
      const score = ev.engagementScore ?? 20;
      const normalised = Math.min(score / 80, 1); // clamp to 0–1
      const radius = outerR - normalised * (outerR - innerR);

      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      // Node size: sqrt to prevent huge circles
      const density = ev.capacity > 0 ? ev.registered / ev.capacity : 0.3;
      const r = Math.max(MIN_NODE_R, Math.min(MAX_NODE_R, MIN_NODE_R + density * (MAX_NODE_R - MIN_NODE_R)));

      nodes.push({ event: ev, x, y, r, color: CATEGORY_COLOR_MAP[ev.category] ?? '#D22030' });
    });
  });

  // Build edges
  const edges: EdgeData[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const sameCategory = a.event.category === b.event.category;
      const audienceOverlap = a.event.audience.some((au) => b.event.audience.includes(au));
      if (sameCategory || audienceOverlap) {
        edges.push({ a, b, weight: sameCategory ? 0.4 : 0.12 });
      }
    }
  }

  return { nodes, edges };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  events: EventItem[];
  onSelectEvent: (ev: EventItem) => void;
}

export default function EventGraph({ events, onSelectEvent }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const [dims, setDims] = useState({ w: 860, h: 520 });
  const [hovered, setHovered] = useState<NodeData | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setDims({ w, h: Math.max(420, w * 0.56) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { nodes, edges } = useMemo(
    () => buildRadialLayout(events, dims.w, dims.h),
    [events, dims]
  );

  // Canvas draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = dims.w * dpr;
    canvas.height = dims.h * dpr;
    canvas.style.width  = dims.w + 'px';
    canvas.style.height = dims.h + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, dims.w, dims.h);

    // Grid background — light dots for visual structure
    const gridSize = 40;
    ctx.fillStyle = 'rgba(204, 0, 51, 0.03)';
    for (let x = 0; x < dims.w; x += gridSize) {
      for (let y = 0; y < dims.h; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Subtle radial background rings (guide lines) — red accent
    const cx = dims.w / 2;
    const cy = dims.h / 2;
    [0.2, 0.38, 0.56].forEach((frac) => {
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(dims.w, dims.h) * frac, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(204, 0, 51, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Edges — curved bezier paths with red accent
    edges.forEach(({ a, b, weight }) => {
      const mx = (a.x + b.x) / 2 + (cy - (a.y + b.y) / 2) * 0.15;
      const my = (a.y + b.y) / 2 + ((a.x + b.x) / 2 - cx) * 0.15;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(mx, my, b.x, b.y);
      ctx.strokeStyle = weight > 0.25 ? `rgba(204, 0, 51, ${weight * 0.6})` : `rgba(204, 0, 51, ${weight * 0.4})`;
      ctx.lineWidth = weight > 0.25 ? 1.8 : 0.8;
      ctx.stroke();
    });

    // Nodes
    nodes.forEach((node) => {
      const isHov = hovered?.event.id === node.event.id;

      if (isHov) {
        // Outer glow ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r + 12, 0, Math.PI * 2);
        ctx.strokeStyle = `${node.color}44`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Node gradient fill
      const grad = ctx.createRadialGradient(
        node.x - node.r * 0.3, node.y - node.r * 0.3, 0,
        node.x, node.y, node.r
      );
      grad.addColorStop(0, isHov ? node.color             : `${node.color}dd`);
      grad.addColorStop(1, isHov ? `${node.color}aa`      : `${node.color}55`);

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Border
      ctx.strokeStyle = isHov ? '#ffffff88' : `${node.color}99`;
      ctx.lineWidth   = isHov ? 1.5 : 1;
      ctx.stroke();

      // Label — abbreviated, scaled to node size
      const maxChars = Math.floor(node.r / 3.5);
      const raw      = node.event.title.split(' ').slice(0, 2).join(' ');
      const label    = raw.length > maxChars ? raw.slice(0, maxChars - 1) + '…' : raw;

      ctx.fillStyle = '#ffffffee';
      ctx.font      = `700 ${Math.max(8, node.r * 0.3)}px 'Syne', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, node.x, node.y);
    });
  }, [nodes, edges, hovered, dims]);

  // Hit-test helper
  const findNode = (clientX: number, clientY: number): NodeData | null => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    for (const node of nodes) {
      if (Math.hypot(mx - node.x, my - node.y) <= node.r + 8) return node;
    }
    return null;
  };

  // Unique categories for legend
  const legendCats = useMemo(
    () => [...new Set(events.map((ev) => ev.category))],
    [events]
  );

  return (
    <div ref={containerRef} style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: '#D22030', fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 6 }}>
          Algorithmic Cluster View
        </div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: '#CC0033', marginBottom: 6, textShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          Event Engagement Graph
        </h2>
        <p style={{ fontSize: 13, color: '#666', fontFamily: "'DM Sans', sans-serif", maxWidth: 560 }}>
          Nodes sized by RSVP density, placed by engagement score. Edges connect events sharing a category or audience. Hover to inspect — click to open details.
        </p>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        {legendCats.map((cat) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLOR_MAP[cat as keyof typeof CATEGORY_COLOR_MAP] ?? '#CC0033' }} />
            <span style={{ fontSize: 11, color: '#666', fontFamily: "'DM Sans', sans-serif" }}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </span>
          </div>
        ))}
      </div>

      {/* Canvas wrapper */}
      <div
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #ffffff 0%, #f9f9f9 50%, #f5f5f5 100%)',
          border: '2px solid #CC0033',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 0 20px rgba(204, 0, 51, 0.1)',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ display: 'block', cursor: hovered ? 'pointer' : 'default' }}
          onMouseMove={(e) => {
            const node = findNode(e.clientX, e.clientY);
            setHovered(node);
            if (node) {
              const rect = canvasRef.current!.getBoundingClientRect();
              setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            } else {
              setTooltip(null);
            }
          }}
          onMouseLeave={() => { setHovered(null); setTooltip(null); }}
          onClick={(e) => { const n = findNode(e.clientX, e.clientY); if (n) onSelectEvent(n.event); }}
        />

        {/* Floating tooltip */}
        {hovered && tooltip && (
          <div
            style={{
              position: 'absolute',
              left: Math.min(tooltip.x + 14, dims.w - 210),
              top:  Math.max(4, tooltip.y - 72),
              background: '#1a0608',
              border: `1px solid ${hovered.color}44`,
              borderRadius: 12,
              padding: '10px 14px',
              pointerEvents: 'none',
              minWidth: 190,
              zIndex: 10,
              boxShadow: `0 4px 20px rgba(0,0,0,0.4)`,
            }}
          >
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12, color: '#fff', marginBottom: 4 }}>
              {hovered.event.title}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Sans', sans-serif", marginBottom: 3 }}>
              {hovered.event.registered.toLocaleString()} / {hovered.event.capacity.toLocaleString()} registered
            </div>
            <div style={{ fontSize: 10, color: hovered.color, fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>
              Score {Math.round(hovered.event.engagementScore ?? 0)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}