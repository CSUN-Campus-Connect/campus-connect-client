'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import type { EventItem } from '../types';
import { CATEGORY_COLOR_MAP } from '../data/constants';

interface Props {
  events: EventItem[];
  onSelectEvent: (ev: EventItem) => void;
}

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

const CLUSTER_CENTERS: Record<string, [number, number]> = {
  career:   [0.22, 0.32],
  academic: [0.52, 0.25],
  workshop: [0.75, 0.32],
  social:   [0.20, 0.70],
  sports:   [0.50, 0.75],
  arts:     [0.78, 0.68],
  wellness: [0.62, 0.52],
};

function buildGraph(events: EventItem[], W: number, H: number): { nodes: NodeData[]; edges: EdgeData[] } {
  const BASE_RADIUS = Math.min(W, H) * 0.055;
  const nodes: NodeData[] = events.map((ev, idx) => {
    const density = ev.capacity > 0 ? ev.registered / ev.capacity : 0;
    const r = BASE_RADIUS * (0.45 + density * 0.7);
    const [cx, cy] = CLUSTER_CENTERS[ev.category] ?? [0.5, 0.5];
    const angle = (idx * 137.5 * Math.PI) / 180;
    const spread = BASE_RADIUS * 1.6 * (1 - (ev.engagementScore ?? 20) / 100);
    const x = cx * W + Math.cos(angle) * spread;
    const y = cy * H + Math.sin(angle) * spread;
    return { event: ev, x, y, r, color: CATEGORY_COLOR_MAP[ev.category] ?? '#D22030' };
  });

  const edges: EdgeData[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const sameCategory = a.event.category === b.event.category;
      const audienceOverlap = a.event.audience.some((au) => b.event.audience.includes(au));
      if (sameCategory || audienceOverlap) {
        const weight = sameCategory ? 0.35 : 0.12;
        edges.push({ a, b, weight });
      }
    }
  }

  return { nodes, edges };
}

export default function EventGraph({ events, onSelectEvent }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<NodeData | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 900, h: 500 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setDims({ w: el.clientWidth, h: Math.max(420, el.clientWidth * 0.5) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { nodes, edges } = useMemo(
    () => buildGraph(events, dims.w, dims.h),
    [events, dims]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;
    canvas.style.width = dims.w + 'px';
    canvas.style.height = dims.h + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, dims.w, dims.h);

    edges.forEach(({ a, b, weight }) => {
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2 - 20;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(midX, midY, b.x, b.y);
      ctx.strokeStyle = `rgba(255,255,255,${weight})`;
      ctx.lineWidth = weight > 0.2 ? 1.2 : 0.6;
      ctx.stroke();
    });

    nodes.forEach((node) => {
      const isHov = hovered?.event.id === node.event.id;

      if (isHov) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r + 10, 0, Math.PI * 2);
        ctx.strokeStyle = `${node.color}55`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      const grad = ctx.createRadialGradient(
        node.x - node.r * 0.3,
        node.y - node.r * 0.3,
        0,
        node.x,
        node.y,
        node.r
      );
      grad.addColorStop(0, isHov ? node.color : `${node.color}cc`);
      grad.addColorStop(1, isHov ? `${node.color}cc` : `${node.color}66`);
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = isHov ? '#fff' : `${node.color}88`;
      ctx.lineWidth = isHov ? 2 : 1;
      ctx.stroke();

      const label = node.event.title.split(' ').slice(0, 2).join(' ');
      ctx.fillStyle = '#fff';
      ctx.font = `700 ${Math.max(9, node.r * 0.35)}px 'Syne', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label.length > 14 ? label.slice(0, 13) + '…' : label, node.x, node.y);
    });
  }, [nodes, edges, hovered, dims]);

  const findNode = (cx: number, cy: number): NodeData | null => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const mx = cx - rect.left;
    const my = cy - rect.top;
    for (const node of nodes) {
      const d = Math.sqrt((mx - node.x) ** 2 + (my - node.y) ** 2);
      if (d <= node.r + 6) return node;
    }
    return null;
  };

  return (
    <div ref={containerRef} style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      {/* Section header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: '#D22030', fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 6 }}>
          Algorithmic Cluster View
        </div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, color: '#fff', marginBottom: 6 }}>
          Event Engagement Graph
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Sans', sans-serif", maxWidth: 560 }}>
          Nodes sized by RSVP density. Edges represent category affinity and audience overlap.
          Hover to inspect — click to open details.
        </p>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        {Object.entries(CLUSTER_CENTERS).map(([cat]) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLOR_MAP[cat as keyof typeof CATEGORY_COLOR_MAP] ?? '#D22030' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif" }}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </span>
          </div>
        ))}
      </div>

      {/* Canvas container */}
      <div
        style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.015)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 20,
          overflow: 'hidden',
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
          onClick={(e) => {
            const node = findNode(e.clientX, e.clientY);
            if (node) onSelectEvent(node.event);
          }}
        />

        {/* Tooltip */}
        {hovered && tooltip && (
          <div
            style={{
              position: 'absolute',
              left: Math.min(tooltip.x + 12, dims.w - 200),
              top: tooltip.y - 60,
              background: '#1a0608',
              border: '1px solid rgba(210,32,48,0.3)',
              borderRadius: 10,
              padding: '10px 14px',
              pointerEvents: 'none',
              zIndex: 10,
              minWidth: 180,
            }}
          >
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12, color: '#fff', marginBottom: 3 }}>
              {hovered.event.title}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif" }}>
              {hovered.event.registered.toLocaleString()} / {hovered.event.capacity.toLocaleString()} registered
            </div>
            <div style={{ fontSize: 10, color: hovered.color, fontFamily: "'Syne', sans-serif", marginTop: 3 }}>
              Score: {Math.round(hovered.event.engagementScore ?? 0)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
