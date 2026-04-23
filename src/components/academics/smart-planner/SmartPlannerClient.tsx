"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  useReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CSUN_CS_2022_TEST_CASE, loadCSUNTestCase } from "./CSUNCompSciTestCase";

// ─── Types ────────────────────────────────────────────────────────────────────

type MajorHit = { id: string; name: string; type: string | null; category: string | null };

type SkillTreeNode = {
  key: string;
  title?: string | null;
  units?: number | null;
  subject: string;
  catalog: string;
  levelBand: number;
  department: string;
  deptColor: string;
  tierIndex: number;
  semesterLabel: string;
};

type ElectiveOption = {
  id: string;
  label: string;
  category?: string;
  semesterLabel: string;
  selected: string | null;
  courseId?: string;
  courseName?: string;
  courseUnits?: number;
};

type SkillTreeResponse = {
  majorName: string;
  catalogYear: string;
  matchedRoadmap: { title: string; url: string };
  semesters: Array<{ tierIndex: number; label: string; totalUnits: number; courseKeys: string[] }>;
  nodes: SkillTreeNode[];
  edges: Array<{ from: string; to: string }>;
  electiveOptions?: ElectiveOption[];
};

// ─── API helpers ──────────────────────────────────────────────────────────────

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}
async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function normalizeCourseKey(s: string) {
  return s.trim().toUpperCase().replace(/\s+/g, "-");
}
function parseCompletedInput(text: string): string[] {
  return text.split(/[\n,]+/g).map((s) => normalizeCourseKey(s)).filter(Boolean);
}
function dedupeMajors(items: MajorHit[]): MajorHit[] {
  const seenId = new Set<string>();
  const seenName = new Set<string>();
  const out: MajorHit[] = [];
  for (const m of items) {
    const id = (m.id ?? "").trim().toLowerCase();
    const name = (m.name ?? "").trim().toLowerCase();
    if (id && seenId.has(id)) continue;
    if (name && seenName.has(name)) continue;
    if (id) seenId.add(id);
    if (name) seenName.add(name);
    out.push(m);
  }
  return out;
}

// ─── Color palette ────────────────────────────────────────────────────────────

const DEPT_COLORS: Record<string, string> = {
  COMP: "#7c3aed", MATH: "#16a34a", PHYS: "#0284c7",
  ENGR: "#d97706", BIOL: "#dc2626", CHEM: "#9333ea",
  ENGL: "#0d9488", PHIL: "#b45309", BUS:  "#ea580c",
  GE:   "#6b21a8", SCI:  "#0e7490", ELEC: "#475569",
  DEFAULT: "#6b7280",
};

function getDeptColor(key: string): string {
  const dept = key.replace(/-.*/, "").toUpperCase().slice(0, 4);
  return DEPT_COLORS[dept] ?? DEPT_COLORS.DEFAULT;
}

// ─── Tier palette — semester-aware, always dark, no fill ──────────────────────
function getTierPalette(label: string, _idx: number) {
  const l = label.toLowerCase();
  if (l.includes("fall"))   return { border: "#7c3aed", textColor: "#c4b5fd" };
  if (l.includes("spring")) return { border: "#16a34a", textColor: "#86efac" };
  if (l.includes("summer")) return { border: "#d97706", textColor: "#fcd34d" };
  if (l.includes("winter")) return { border: "#0284c7", textColor: "#7dd3fc" };
  return { border: "#6b7280", textColor: "#d1d5db" };
}

// dept color → dark bg tint for card
function getDeptBg(color: string): string {
  return color + "22"; // ~13% opacity tint
}
// dept color → light pastel bg
const DEPT_LIGHT_BG: Record<string, string> = {
  "#7c3aed": "#5100ff", "#16a34a": "#00ff4c", "#0284c7": "#0095ff",
  "#d97706": "#ff9900", "#dc2626": "#ff0000", "#9333ea": "#9500ff",
  "#0d9488": "#00ffee", "#b45309": "#ff4800", "#ea580c": "#ff5900",
  "#6b21a8": "#6a00ff", "#0e7490": "#00d9ff", "#475569": "#f1f5f9",
  "#6b7280": "#5579c2",
};
function getDeptLightBg(color: string): string {
  return DEPT_LIGHT_BG[color] ?? "#f3f4f6";
}

type CourseNodeData = {
  nodeKey: string;
  title: string | null;
  units: number | null;
  levelBand: number;
  semesterLabel: string;
  tierIndex: number;
  onDelete: (id: string) => void;
  graphDark: boolean;
};

function SmartCourseNode({ id, data, selected }: { id: string; data: CourseNodeData; selected?: boolean }) {
  const pillColor = getDeptColor(data.nodeKey);
  const isDark = data.graphDark !== false;
  const parts = data.nodeKey.split("-");
  const sub = parts[0];
  const cat = parts.slice(1).join(" ");
  const cardBg = isDark ? getDeptBg(pillColor) : getDeptLightBg(pillColor);
  const handleColor = isDark ? "#fff" : "#333";

  return (
    <div style={{
      background: cardBg,
      border: `2px solid ${selected ? (isDark ? "#ffffff" : "#0f172a") : pillColor}`,
      borderRadius: 14, padding: "10px 14px", width: 215,
      cursor: "grab", boxShadow: "none", transition: "border-color 0.2s, background 0.2s",
      userSelect: "none", position: "relative",
    }}>
      <Handle type="target" position={Position.Top}    style={{ background: handleColor, width:10, height:10, border:"2px solid rgba(255,255,255,0.28)" }} />
      <Handle type="source" position={Position.Bottom} style={{ background: handleColor, width:10, height:10, border:"2px solid rgba(255,255,255,0.28)" }} />
      <Handle type="target" position={Position.Left}   style={{ background: handleColor, width:8,  height:8,  border:"2px solid rgba(255,255,255,0.28)", top:"50%" }} id="l-in" />
      <Handle type="source" position={Position.Right}  style={{ background: handleColor, width:8,  height:8,  border:"2px solid rgba(255,255,255,0.28)", top:"50%" }} id="r-out" />

      <button onClick={(e) => { e.stopPropagation(); data.onDelete(id); }} title="Remove" style={{
        position:"absolute", top:6, right:6,
        background: isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.08)", border:"none",
        borderRadius:6, width:20, height:20, color: isDark ? "rgba(255,255,255,0.50)" : "rgba(15,23,42,0.55)",
        fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
        lineHeight:1, transition:"background 0.14s, color 0.14s", padding:0,
      }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background="rgba(239,68,68,0.25)"; (e.currentTarget as HTMLButtonElement).style.color="#f87171"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.08)"; (e.currentTarget as HTMLButtonElement).style.color = isDark ? "rgba(255,255,255,0.50)" : "rgba(15,23,42,0.55)"; }}
      >×</button>

      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5, paddingRight:14 }}>
        <span style={{
          background: pillColor, color: "#fff",
          borderRadius:6, padding:"2px 7px", fontSize:10, fontWeight:800, letterSpacing:"0.05em", whiteSpace:"nowrap",
        }}>{sub} {cat}</span>
        {data.units != null && (
          <span style={{ fontSize:10, color: isDark ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.60)", fontWeight:700 }}>
            {data.units}u
          </span>
        )}
      </div>

      <div style={{ fontSize:11.5, color: isDark ? "rgba(255,255,255,0.94)" : "#1a1a2e", fontWeight:800, lineHeight:1.35, marginBottom:6, minHeight:15 }}>
        {data.title ?? ""}
      </div>

      <div style={{
        display:"inline-flex", alignItems:"center",
        background: isDark ? `${pillColor}22` : `${pillColor}20`,
        border: `1px solid ${isDark ? `${pillColor}55` : pillColor}`,
        borderRadius:6, padding:"2px 7px",
        fontSize:9.5, color: isDark ? "rgba(255,255,255,0.80)" : "#1a1a2e", fontWeight:700, letterSpacing:"0.03em",
      }}>{data.semesterLabel}</div>
    </div>
  );
}

const nodeTypes = { smartCourse: SmartCourseNode };

// ─── Layout (INVERTED: Year 1 at bottom, Senior at top) ──────────────────────

const LANE_W   = 1160;
const LANE_X   = 20;
const LANE_PAD = 34;
const NODE_W   = 230;
const NODE_H   = 118;
const START_Y  = 66;
const SIDE_PAD = 42;
const H_GAP    = 42;
const ROW_GAP  = 34;

// light bg per semester label
function getTierLightBg(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("fall"))   return "#f4efff";
  if (l.includes("spring")) return "#effcf3";
  if (l.includes("summer")) return "#fff7eb";
  if (l.includes("winter")) return "#eef8ff";
  return "#f1f5f9";
}

function buildLayout(
  raw: SkillTreeResponse,
  deletedKeys: Set<string>,
  onDelete: (id: string) => void,
  semColorOverrides?: Record<string, {bg:string;border:string;textColor:string}>,
  graphDark?: boolean
): { rfNodes: Node[]; rfEdges: Edge[] } {
  const isDark = graphDark !== false;
  const tiers = raw.semesters.slice().sort((a, b) => a.tierIndex - b.tierIndex);
  const maxTier = tiers[tiers.length - 1]?.tierIndex ?? 0;

  const rfNodes: Node[] = [];
  const rfEdges: Edge[] = [];

  const tierHeights = new Map<number, number>();
  for (const t of tiers) {
    const active = raw.nodes.filter((n) => n.tierIndex === t.tierIndex && !deletedKeys.has(n.key));
    const cols = Math.max(1, Math.min(4, Math.ceil(Math.sqrt(active.length || 1))));
    const rows = Math.max(1, Math.ceil((active.length || 1) / cols));
    tierHeights.set(t.tierIndex, Math.max(190, START_Y + rows * NODE_H + (rows - 1) * ROW_GAP + 38));
  }

  const tierYMap = new Map<number, number>();
  let runningY = 0;
  for (let i = tiers.length - 1; i >= 0; i--) {
    const t = tiers[i];
    tierYMap.set(t.tierIndex, runningY);
    runningY += (tierHeights.get(t.tierIndex) ?? 200) + LANE_PAD;
  }

  for (const t of tiers) {
    const laneY = tierYMap.get(t.tierIndex) ?? 0;
    const laneH = tierHeights.get(t.tierIndex) ?? 200;
    const tiDisplayIdx = maxTier - t.tierIndex;
    const defaultPalette = getTierPalette(t.label, tiDisplayIdx);
    const override = semColorOverrides?.[t.label.split(" ")[0]] ?? semColorOverrides?.[t.label];
    const border = override?.border ?? defaultPalette.border;
    const textColor = override?.textColor ?? defaultPalette.textColor;
    const active = raw.nodes.filter((n) => n.tierIndex === t.tierIndex && !deletedKeys.has(n.key));

    const laneBg = isDark ? "transparent" : getTierLightBg(t.label);

    rfNodes.push({
      id: `tier-${t.tierIndex}`,
      type: "default",
      position: { x: LANE_X, y: laneY },
      selectable: false, draggable: false,
      data: {
        label: (
          <div style={{ textAlign:"left" }}>
            <div style={{ fontWeight:950, fontSize:13.5, color: isDark ? textColor : border, letterSpacing:"0.05em", textTransform:"uppercase" }}>
              {t.label.toUpperCase()}
            </div>
            <div style={{ fontSize:10.5, color: isDark ? `${textColor}88` : "rgba(0,0,0,0.44)", fontWeight:700, marginTop:2 }}>
              {t.totalUnits} units
            </div>
          </div>
        ),
      },
      style: {
        width: LANE_W, height: laneH,
        background: laneBg,
        border: `2px solid ${border}`,
        borderRadius: 24, padding:"18px 18px 16px",
        pointerEvents:"none", boxShadow:"none",
      },
      zIndex: 0,
    });

    const cols = Math.max(1, Math.min(4, Math.ceil(Math.sqrt(active.length || 1))));
    const totalRowWidth = cols * NODE_W + (cols - 1) * H_GAP;
    const startX = LANE_X + SIDE_PAD + Math.max(0, (LANE_W - SIDE_PAD * 2 - totalRowWidth) / 2);

    active.forEach((n, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      rfNodes.push({
        id: n.key,
        type: "smartCourse",
        position: { x: startX + col * (NODE_W + H_GAP), y: laneY + START_Y + row * (NODE_H + ROW_GAP) },
        data: {
          nodeKey: n.key, title: n.title ?? null, units: n.units ?? null,
          levelBand: n.levelBand, semesterLabel: n.semesterLabel,
          tierIndex: n.tierIndex, onDelete, graphDark: isDark,
        } as CourseNodeData,
        zIndex: 10,
      });
    });
  }

  const nodeSet = new Set(rfNodes.map((nd) => nd.id));
  for (const e of raw.edges) {
    const from = normalizeCourseKey(e.from);
    const to   = normalizeCourseKey(e.to);
    if (!nodeSet.has(from) || !nodeSet.has(to)) continue;
    const fromTier = raw.nodes.find((n) => n.key === from)?.tierIndex ?? 0;
    const toTier   = raw.nodes.find((n) => n.key === to)?.tierIndex ?? 0;
    if (toTier <= fromTier) continue;
    rfEdges.push({
      id: `${from}->${to}`, source: from, target: to,
      sourceHandle: null, targetHandle: null,
      type: "smoothstep", animated: true,
      style: { stroke: isDark ? "rgba(255,255,255,0.70)" : "rgba(31,41,55,0.70)", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: isDark ? "rgba(255,255,255,0.70)" : "rgba(31,41,55,0.70)", width: 16, height: 16 },
    });
  }

  return { rfNodes, rfEdges };
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const BG = `radial-gradient(1200px 600px at 20% 0%, rgba(255,255,255,0.10), transparent 55%),
linear-gradient(180deg, rgba(168,5,50,1) 0%, rgba(120,0,35,0.98) 55%, rgba(168,5,50,1) 100%)`;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,700;0,9..40,800;0,9..40,900;0,9..40,1000&display=swap');

  @keyframes sp-spin { to { transform: rotate(360deg) } }
  @keyframes sp-fade { from { opacity:0; transform:translateY(5px) } to { opacity:1; transform:translateY(0) } }
  @keyframes sp-pop  { from { opacity:0; transform:scale(0.93) } to { opacity:1; transform:scale(1) } }

  .sp-field {
    width: 100%; background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.20); border-radius: 10px;
    color: #fff; padding: 8px 12px; font-size: 13px;
    font-family: 'DM Sans', system-ui, sans-serif; outline: none;
    transition: border-color 0.18s, background 0.18s; box-sizing: border-box;
  }
  .sp-field:focus { border-color: rgba(255,255,255,0.55); background: rgba(255,255,255,0.12); }
  .sp-field::placeholder { color: rgba(255,255,255,0.36); }
  .sp-field option { background: #780023; color: #fff; }

  .sp-label {
    display: block; font-size: 10px; font-weight: 800;
    letter-spacing: 0.11em; text-transform: uppercase;
    color: rgba(255,255,255,0.46); margin-bottom: 5px;
  }

  .sp-toggle {
    display: flex; background: rgba(0,0,0,0.18);
    border: 1px solid rgba(255,255,255,0.13); border-radius: 10px; overflow: hidden;
  }
  .sp-toggle-btn {
    flex: 1; padding: 7px 0; border: none; background: transparent;
    color: rgba(255,255,255,0.46); font-weight: 700; font-size: 12px;
    font-family: 'DM Sans', system-ui, sans-serif; cursor: pointer; transition: all 0.15s;
  }
  .sp-toggle-btn.on { background: rgba(255,255,255,0.15); color: #fff; }

  .sp-build-btn {
    width: 100%; padding: 11px; background: rgba(0,0,0,0.75); color: #fff;
    border: none; border-radius: 12px; font-weight: 900; font-size: 13px;
    font-family: 'DM Sans', system-ui, sans-serif; cursor: pointer; letter-spacing: 0.03em;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    transition: opacity 0.18s, transform 0.15s;
  }
  .sp-build-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .sp-build-btn:disabled { opacity: 0.38; cursor: not-allowed; }

  .sp-test-btn {
    width: 100%; padding: 9px; background: rgba(124,58,237,0.20);
    color: #c4b5fd; border: 1px solid rgba(124,58,237,0.42); border-radius: 12px;
    font-weight: 800; font-size: 12px; font-family: 'DM Sans', system-ui, sans-serif;
    cursor: pointer; letter-spacing: 0.03em; margin-top: 7px;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: background 0.18s, transform 0.15s;
  }
  .sp-test-btn:hover:not(:disabled) { background: rgba(124,58,237,0.32); transform: translateY(-1px); }
  .sp-test-btn:disabled { opacity: 0.38; cursor: not-allowed; }

  .sp-ghost-btn {
    padding: 6px 13px; background: rgba(255,255,255,0.10);
    color: rgba(255,255,255,0.82); border: 1px solid rgba(255,255,255,0.22);
    border-radius: 999px; font-weight: 800; font-size: 12px;
    font-family: 'DM Sans', system-ui, sans-serif; cursor: pointer;
    transition: background 0.14s; display: flex; align-items: center; gap: 5px;
  }
  .sp-ghost-btn:hover { background: rgba(255,255,255,0.17); }
  .sp-ghost-btn:disabled { opacity: 0.42; cursor: not-allowed; }

  .sp-dropdown {
    position: absolute; top: calc(100% + 4px); left: 0; right: 0;
    max-height: 230px; overflow-y: auto; background: #780023;
    border: 1px solid rgba(255,255,255,0.18); border-radius: 12px;
    z-index: 50; box-shadow: 0 16px 40px rgba(0,0,0,0.45);
    scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.22) transparent;
  }
  .sp-dropdown-item {
    padding: 9px 13px; cursor: pointer;
    border-bottom: 1px solid rgba(255,255,255,0.08); transition: background 0.12s;
  }
  .sp-dropdown-item:hover { background: rgba(255,255,255,0.12); }
  .sp-dropdown-item:last-child { border-bottom: none; }

  .sp-checkbox {
    display: flex; align-items: center; gap: 7px; cursor: pointer;
    color: rgba(255,255,255,0.70); font-size: 12px; font-weight: 600;
  }
  .sp-checkbox input { accent-color: #fff; width: 13px; height: 13px; }

  .sp-divider { border: none; border-top: 1px solid rgba(255,255,255,0.11); margin: 13px 0; }

  .sp-stat-row { display: flex; gap: 7px; animation: sp-fade 0.35s ease; }
  .sp-stat {
    flex: 1; background: rgba(0,0,0,0.22); border: 1px solid rgba(255,255,255,0.11);
    border-radius: 11px; padding: 9px 6px; text-align: center;
  }
  .sp-stat-val { font-size: 21px; font-weight: 950; color: #fff; line-height: 1; }
  .sp-stat-lbl { font-size: 9px; font-weight: 800; letter-spacing: 0.09em; color: rgba(255,255,255,0.40); margin-top: 3px; text-transform: uppercase; }

  /* Elective modal */
  .sp-elec-card {
    border-radius: 13px; padding: 14px 15px; transition: border-color 0.15s, background 0.15s;
  }
  .sp-elec-field-row { display: grid; grid-template-columns: 1fr 2fr 64px; gap: 7px; margin-top: 10px; }

  /* Graph light mode */
  .graph-light .react-flow__edge-path { stroke: rgba(30,30,60,0.85) !important; }
  .graph-light .react-flow__connection-line { stroke: rgba(30,30,60,0.85) !important; }
  .graph-light .react-flow__controls { background: rgba(255,255,255,0.96) !important; border-color: rgba(0,0,0,0.14) !important; }
  .graph-light .react-flow__controls-button { fill: rgba(0,0,0,0.60) !important; border-bottom-color: rgba(0,0,0,0.08) !important; }
  .graph-light .react-flow__minimap { border-color: rgba(0,0,0,0.12) !important; }

  /* ReactFlow overrides */
  .react-flow__node { box-shadow: none !important; }
  .react-flow__controls { background: rgba(255,255,255,0.07) !important; border: 1px solid rgba(255,255,255,0.12) !important; border-radius: 10px !important; }
  .react-flow__controls-button { background: transparent !important; border-bottom: 1px solid rgba(255,255,255,0.08) !important; fill: rgba(255,255,255,0.70) !important; }
  .react-flow__controls-button:hover { background: rgba(255,255,255,0.09) !important; }
  .react-flow__minimap { border: 1px solid rgba(255,255,255,0.10) !important; border-radius: 10px !important; }
  .react-flow__edge-path { stroke: rgba(255,255,255,0.72) !important; stroke-width: 2 !important; }
  .react-flow__edge.animated path { stroke-dasharray: 5 5; }
  .react-flow__connection-line { stroke: rgba(255,255,255,0.88) !important; stroke-width: 2 !important; }
  .react-flow__handle { transition: opacity 0.15s; }
`;

// ─── Inner canvas ─────────────────────────────────────────────────────────────

function PlannerCanvas({
  raw,
  deletedKeys,
  onDeleteNode,
  graphRef,
  graphDark,
  semColorOverrides,
}: {
  raw: SkillTreeResponse | null;
  deletedKeys: Set<string>;
  onDeleteNode: (key: string) => void;
  graphRef?: React.RefObject<HTMLDivElement | null>;
  graphDark?: boolean;
  semColorOverrides?: Record<string, {bg:string;border:string;textColor:string}>;
}) {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!raw) { setNodes([]); setEdges([]); return; }
    const { rfNodes, rfEdges } = buildLayout(raw, deletedKeys, onDeleteNode, semColorOverrides, graphDark);
    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [raw, deletedKeys, onDeleteNode, setNodes, setEdges]);

  useEffect(() => {
    if (raw) setTimeout(() => fitView({ padding: 0.10, duration: 500 }), 120);
  }, [raw, fitView]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge({
          ...params,
          type: "smoothstep",
          animated: true,
          style: { stroke: "rgba(255,255,255,0.82)", strokeWidth: 2.2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(255,255,255,0.82)", width: 16, height: 16 },
        }, eds)
      ),
    [setEdges]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => setEdges((eds) => eds.filter((e) => e.id !== edge.id)),
    [setEdges]
  );

  if (!raw) {
    return (
      <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:18, padding:40, position:"relative" }}>
        <div aria-hidden style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize:"32px 32px", pointerEvents:"none" }} />
        <div style={{ width:68, height:68, borderRadius:18, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/>
            <rect x="9" y="15" width="6" height="6" rx="1"/>
            <path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9"/><line x1="12" y1="12" x2="12" y2="15"/>
          </svg>
        </div>
        <div style={{ textAlign:"center", position:"relative" }}>
          <p style={{ margin:0, fontSize:20, fontWeight:950, color:"rgba(255,255,255,0.78)" }}>No roadmap built yet</p>
          <p style={{ margin:"8px 0 0", fontSize:13, color:"rgba(255,255,255,0.38)", maxWidth:340, lineHeight:1.65 }}>
            Configure your major on the left and click <strong style={{ color:"rgba(255,255,255,0.62)" }}>Build Roadmap</strong>, or try the{" "}
            <strong style={{ color:"#c4b5fd" }}>CSUN Test Case</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={graphRef} id="rf-graph-capture" style={{ height:"100%", background: graphDark === false ? "#e8edf5" : "#06080e" }} className={graphDark === false ? "graph-light" : ""}>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={onConnect} onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.12 }}
        proOptions={{ hideAttribution: true }} connectionMode={"loose" as any}
      >
        <Background color={graphDark === false ? "#c8d0e0" : "#131828"} gap={22} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(n) => n.id.startsWith("tier-") ? (graphDark === false ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.04)") : getDeptColor(n.id)}
          maskColor={graphDark === false ? "rgba(232,237,245,0.72)" : "rgba(0,0,0,0.72)"}
          style={{ background: graphDark === false ? "#e8edf5" : "#06080e" }}
        />
      </ReactFlow>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SmartPlannerClient() {
  const [level, setLevel] = useState<"undergraduate" | "graduate">("undergraduate");
  const [majorInput, setMajorInput] = useState("");
  const [majorResults, setMajorResults] = useState<MajorHit[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<MajorHit | null>(null);
  const [showMajorDropdown, setShowMajorDropdown] = useState(false);
  const [catalogYear, setCatalogYear] = useState("2022");
  const [pace, setPace] = useState<"full-time" | "part-time">("full-time");
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
  const [startTerm, setStartTerm] = useState<"Fall" | "Spring" | "Summer" | "Winter">("Fall");
  const [includeSummer, setIncludeSummer] = useState(false);
  const [includeWinter, setIncludeWinter] = useState(false);
  const [completedText, setCompletedText] = useState("");
  const completedCourses = useMemo(() => parseCompletedInput(completedText), [completedText]);
  const [graphDark, setGraphDark] = useState(true);
  const [semColors, setSemColors] = useState<Record<string, {bg:string;border:string;textColor:string}>>({});

  const [raw, setRaw] = useState<SkillTreeResponse | null>(null);
  const [deletedKeys, setDeletedKeys] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  const [showElectiveModal, setShowElectiveModal] = useState(false);
  // Rich elective state: per-slot { courseId, courseName, courseUnits }
  const [electiveFields, setElectiveFields] = useState<
    Record<string, { courseId: string; courseName: string; courseUnits: string }>
  >({});
  const [electiveSearchQuery, setElectiveSearchQuery] = useState("");

  const graphRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showSemColorPicker, setShowSemColorPicker] = useState<string | null>(null);
  const latestQuery = useRef(0);

  // Major search
  useEffect(() => {
    const q = majorInput.trim();
    setSelectedMajor(null);
    if (q.length < 2) { setMajorResults([]); return; }
    const id = ++latestQuery.current;
    const t = setTimeout(async () => {
      try {
        const qs = new URLSearchParams({ query: q, level });
        const r = await apiGet<{ results: MajorHit[] }>(`/api/academics/smartplanner/majors/search?${qs}`);
        if (latestQuery.current !== id) return;
        setMajorResults(dedupeMajors(r.results ?? []));
      } catch {
        if (latestQuery.current !== id) return;
        setMajorResults([]);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [majorInput, level]);

  const filteredMajorResults = useMemo(() => {
    const q = majorInput.trim().toLowerCase();
    if (!q) return majorResults.slice(0, 25);
    return majorResults
      .filter((m) => (m.name ?? "").toLowerCase().includes(q) || (m.id ?? "").toLowerCase().includes(q))
      .slice(0, 25);
  }, [majorResults, majorInput]);

  // Build selectedElectives from rich fields for backend
  const selectedElectives = useMemo(() => {
    const out: Record<string, string> = {};
    for (const [id, f] of Object.entries(electiveFields)) {
      if (f.courseId.trim()) out[id] = f.courseId.trim();
    }
    return out;
  }, [electiveFields]);

  async function onBuild() {
    setError(""); setStatus(""); setLoading(true); setDeletedKeys(new Set());
    try {
      const majorName = selectedMajor?.name ?? majorInput.trim();
      if (!majorName) throw new Error("Enter or select a major.");
      if (!catalogYear) throw new Error("Enter a catalog year.");
      setStatus("Building degree roadmap…");
      const out = await apiPost<SkillTreeResponse>("/api/academics/smartplanner/planner/skill-tree", {
        majorName, year: catalogYear, level, completedCourses, selectedElectives,
        pace, startYear, startTerm, includeSummer, includeWinter, maxTiers: 16,
      });
      setRaw(out);
      setStatus("Roadmap ready.");
      if (out.electiveOptions?.length) setShowElectiveModal(true);
    } catch (e: any) {
      setRaw(null); setStatus(""); setError(e?.message ?? "Build failed.");
    } finally {
      setLoading(false);
    }
  }

  async function onLoadTestCase() {
    setError(""); setStatus(""); setTestLoading(true); setDeletedKeys(new Set());
    try {
      setStatus("Loading CSUN Computer Science 2022 roadmap…");
      const out = await loadCSUNTestCase();
      setRaw(out as any);
      setStatus("Test roadmap loaded.");
      setMajorInput(CSUN_CS_2022_TEST_CASE.majorName);
      setCatalogYear(CSUN_CS_2022_TEST_CASE.year);
      setLevel("undergraduate");
      if ((out as any).electiveOptions?.length) setShowElectiveModal(true);
    } catch (e: any) {
      setRaw(null); setStatus(""); setError(e?.message ?? "Test case failed.");
    } finally {
      setTestLoading(false);
    }
  }

  const handleDeleteNode = useCallback((key: string) => {
    setDeletedKeys((prev) => new Set([...prev, key]));
  }, []);

  const savePdf = useCallback(async () => {
    const el = graphRef.current;
    if (!el || !raw) return;
    setPdfLoading(true);
    try {
      const load = (src: string): Promise<void> =>
        new Promise((res, rej) => {
          if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
          const s = document.createElement("script");
          s.src = src; s.onload = () => res(); s.onerror = () => rej(new Error("Script failed: " + src));
          document.head.appendChild(s);
        });
      await load("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      await load("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      const canvas = await (window as any).html2canvas(el, { backgroundColor: "#06080e", scale: 2, useCORS: true, logging: false });
      const { jsPDF } = (window as any).jspdf;
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const m = 8;
      const ratio = Math.min((pw - m * 2) / canvas.width, (ph - m * 2 - 14) / canvas.height);
      pdf.setFontSize(11); pdf.setTextColor(40, 40, 40);
      pdf.text(`${raw.majorName} — ${raw.catalogYear} Degree Plan`, m, m + 6);
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", m, m + 14, canvas.width * ratio, canvas.height * ratio);
      pdf.save(`${(raw.majorName ?? "plan").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${raw.catalogYear}.pdf`);
    } catch (err: any) {
      alert("PDF export failed: " + (err?.message ?? "unknown"));
    } finally {
      setPdfLoading(false);
    }
  }, [raw]);

  const pendingElectives = useMemo(() => {
    if (!raw?.electiveOptions) return [];
    return raw.electiveOptions.filter((e) => !electiveFields[e.id]?.courseId?.trim());
  }, [raw, electiveFields]);

  const totalUnits = raw?.semesters.reduce((s, t) => s + t.totalUnits, 0) ?? 0;
  const visibleCourses = raw ? raw.nodes.filter((n) => !deletedKeys.has(n.key)).length : 0;

  const updateElectiveField = (
    id: string,
    field: "courseId" | "courseName" | "courseUnits",
    value: string
  ) => {
    setElectiveFields((prev) => ({
      ...prev,
      [id]: { courseId: "", courseName: "", courseUnits: "", ...prev[id], [field]: value },
    }));
  };

  return (
    <ReactFlowProvider>
      <style>{css}</style>
      <div style={{ minHeight:"100vh", background: BG, fontFamily:"'DM Sans', system-ui, sans-serif" }}>

        {/* ── Top Bar ── */}
        <div style={{
          position:"sticky", top:0, zIndex:40,
          borderBottom: "1px solid rgba(255,255,255,0.11)",
          background: "rgba(100,0,28,0.74)", backdropFilter:"blur(16px)",
          padding:"0 24px", display:"flex", alignItems:"center", gap:12, height:54,
        }}>
          <Link href="/academics" style={{ display:"inline-flex", alignItems:"center", gap:5, color: "rgba(255,255,255,0.76)", textDecoration:"none", fontSize:12, fontWeight:700, padding:"4px 11px", border: "1px solid rgba(255,255,255,0.20)", borderRadius:999, transition:"background 0.14s" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Academics
          </Link>
          <span style={{ color: "rgba(255,255,255,0.20)", fontSize:15 }}>/</span>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.86)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 3 3 15l6 1 1 5 5-8"/><path d="M9 9l5.5 5.5"/>
            </svg>
            <span style={{ fontWeight:950, fontSize:15, color: "#fff", letterSpacing:"0.01em" }}>Smart Planner</span>
            <span style={{ background: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius:999, padding:"2px 8px", fontSize:9, fontWeight:800, letterSpacing:"0.07em" }}>BETA</span>
          </div>
          {/* Always-visible Build Your Own button */}
          <Link href="/academics/smart-planner/build-your-own" style={{ display:"inline-flex", alignItems:"center", gap:6, color: "#fff", textDecoration:"none", fontSize:12, fontWeight:800, padding:"5px 13px", background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.24)", borderRadius:999, letterSpacing:"0.02em", transition:"background 0.14s" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Build Your Own
          </Link>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:12 }}>
            <button
              onClick={() => setGraphDark((d) => !d)}
              style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 11px", background:"rgba(255,255,255,0.10)", border:"1px solid rgba(255,255,255,0.22)", borderRadius:999, cursor:"pointer", color:"rgba(255,255,255,0.82)", fontSize:11, fontWeight:700, transition:"all 0.15s" }}
              title={graphDark ? "Switch graph to light" : "Switch graph to dark"}
            >
              {graphDark
                ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>}
              Graph {graphDark ? "Light" : "Dark"}
            </button>
            {raw && (
              <>
                <span style={{ fontSize:11.5, color: "rgba(255,255,255,0.50)", fontWeight:600 }}>{raw.majorName} · {raw.catalogYear}</span>
                <button className="sp-ghost-btn" onClick={savePdf} disabled={pdfLoading}>
                  {pdfLoading
                    ? <span style={{ width:11, height:11, border:"2px solid rgba(255,255,255,0.28)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"sp-spin 0.7s linear infinite" }}/>
                    : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
                  {pdfLoading ? "Exporting…" : "Save PDF"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div style={{ display:"grid", gridTemplateColumns:"355px 1fr", height:"calc(100vh - 54px)" }}>

          {/* ════════ LEFT SIDEBAR ════════ */}
          <div style={{ borderRight: "1px solid rgba(255,255,255,0.09)", overflowY:"auto", padding:"18px 17px 32px", display:"flex", flexDirection:"column", gap:0, scrollbarWidth:"thin", scrollbarColor: "rgba(255,255,255,0.17) transparent" }}>

            <div style={{ marginBottom:18 }}>
              <p style={{ margin:0, fontSize:21, fontWeight:950, color: "#fff", letterSpacing:"-0.02em", lineHeight:1.2 }}>Degree Roadmap Builder</p>
              <p style={{ margin:"5px 0 0", fontSize:12.5, color: "rgba(255,255,255,0.52)", lineHeight:1.6 }}>
                Generate a semester-by-semester prerequisite graph. Year 1 at the bottom, senior year at the top.
              </p>
            </div>

            {/* Level */}
            <div style={{ marginBottom:12 }}>
              <span className="sp-label">Program Level</span>
              <div className="sp-toggle">
                <button className={`sp-toggle-btn${level==="undergraduate"?" on":""}`} onClick={() => setLevel("undergraduate")}>Undergrad</button>
                <button className={`sp-toggle-btn${level==="graduate"?" on":""}`} onClick={() => setLevel("graduate")}>Graduate</button>
              </div>
            </div>

            {/* Major */}
            <div style={{ marginBottom:12, position:"relative" }}>
              <span className="sp-label">Major</span>
              <input className="sp-field" value={majorInput}
                onChange={(e) => { setMajorInput(e.target.value); setShowMajorDropdown(true); }}
                onFocus={() => setShowMajorDropdown(true)}
                onBlur={() => setTimeout(() => setShowMajorDropdown(false), 150)}
                placeholder="Search: Computer Science…"
              />
              {selectedMajor && (
                <div style={{ marginTop:4, display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ fontSize:10, color:"rgba(255,255,255,0.36)" }}>Selected:</span>
                  <span style={{ background:"rgba(255,255,255,0.13)", border:"1px solid rgba(255,255,255,0.24)", color:"#fff", borderRadius:999, padding:"1px 8px", fontSize:10, fontWeight:800 }}>
                    ✓ {selectedMajor.name}
                  </span>
                </div>
              )}
              {showMajorDropdown && filteredMajorResults.length > 0 && (
                <div className="sp-dropdown">
                  {filteredMajorResults.map((m) => (
                    <div key={m.id} className="sp-dropdown-item"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setSelectedMajor(m); setMajorInput(m.name); setShowMajorDropdown(false); }}
                    >
                      <div style={{ fontWeight:800, fontSize:13, color:"#fff" }}>{m.name}</div>
                      <div style={{ fontSize:10.5, color:"rgba(255,255,255,0.42)", marginTop:1 }}>{m.id}{m.category?` · ${m.category}`:""}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Catalog Year */}
            <div style={{ marginBottom:12 }}>
              <span className="sp-label">Catalog Year</span>
              <input className="sp-field" value={catalogYear} onChange={(e) => setCatalogYear(e.target.value)} placeholder="e.g. 2022"/>
            </div>

            {/* Pace */}
            <div style={{ marginBottom:12 }}>
              <span className="sp-label">Pace</span>
              <div className="sp-toggle">
                <button className={`sp-toggle-btn${pace==="full-time"?" on":""}`} onClick={() => setPace("full-time")}>Full-time</button>
                <button className={`sp-toggle-btn${pace==="part-time"?" on":""}`} onClick={() => setPace("part-time")}>Part-time</button>
              </div>
            </div>

            {/* Start term + year */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:12 }}>
              <div>
                <span className="sp-label">Start Term</span>
                <select className="sp-field" value={startTerm} onChange={(e) => setStartTerm(e.target.value as any)} style={{ padding:"7px 9px" }}>
                  {["Fall","Spring","Summer","Winter"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <span className="sp-label">Start Year</span>
                <input className="sp-field" type="number" value={startYear}
                  onChange={(e) => setStartYear(parseInt(e.target.value || String(new Date().getFullYear()), 10))}/>
              </div>
            </div>

            <div style={{ display:"flex", gap:18, marginBottom:15 }}>
              <label className="sp-checkbox"><input type="checkbox" checked={includeWinter} onChange={(e) => setIncludeWinter(e.target.checked)}/> Winter</label>
              <label className="sp-checkbox"><input type="checkbox" checked={includeSummer} onChange={(e) => setIncludeSummer(e.target.checked)}/> Summer</label>
            </div>

            <hr className="sp-divider"/>

            {/* Completed courses */}
            <div style={{ marginBottom:14 }}>
              <span className="sp-label">Completed / Transfer Courses</span>
              <textarea className="sp-field" value={completedText} onChange={(e) => setCompletedText(e.target.value)}
                placeholder={"COMP 110, COMP 182\n(comma or newline separated)"}
                style={{ minHeight:68, resize:"vertical", lineHeight:1.55 }}/>
              {completedCourses.length > 0 && (
                <span style={{ fontSize:10.5, color:"rgba(255,255,255,0.40)", marginTop:4, display:"block" }}>
                  {completedCourses.length} course{completedCourses.length!==1?"s":""} marked complete
                </span>
              )}
            </div>

            {/* Pending electives */}
            {pendingElectives.length > 0 && (
              <div style={{ background:"rgba(245,158,11,0.11)", border:"1px solid rgba(245,158,11,0.26)", borderRadius:11, padding:"10px 13px", marginBottom:11, display:"flex", alignItems:"center", gap:9 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span style={{ flex:1, fontSize:11.5, fontWeight:700, color:"#fbbf24" }}>
                  {pendingElectives.length} elective{pendingElectives.length!==1?"s":""} unset
                </span>
                <button className="sp-ghost-btn" onClick={() => setShowElectiveModal(true)} style={{ padding:"3px 9px", fontSize:11 }}>Choose</button>
              </div>
            )}

            {/* Semester Block Colors */}
            <div style={{ marginBottom: 12 }}>
              <span className="sp-label">Semester Block Colors</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {(["Fall", "Winter", "Spring", "Summer"] as const).map((sem) => {
                  const defaultColors: Record<string, {bg:string;border:string;textColor:string}> = {
                    Fall:   {bg:"rgba(124,58,237,0.18)",  border:"rgba(167,139,250,0.70)", textColor:"#c4b5fd"},
                    Winter: {bg:"rgba(2,132,199,0.18)",   border:"rgba(125,211,252,0.65)", textColor:"#7dd3fc"},
                    Spring: {bg:"rgba(22,163,74,0.18)",   border:"rgba(134,239,172,0.70)", textColor:"#86efac"},
                    Summer: {bg:"rgba(217,119,6,0.18)",   border:"rgba(252,211,77,0.65)",  textColor:"#fcd34d"},
                  };
                  const current = semColors[sem] || defaultColors[sem];
                  return (
                    <div key={sem}>
                      <button
                        onClick={() => setShowSemColorPicker(showSemColorPicker === sem ? null : sem)}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 8,
                          background: `${current.bg}`, border: `1.5px solid ${current.border}`,
                          borderRadius: 8, padding: "5px 10px", cursor: "pointer",
                          color: current.textColor, fontSize: 11, fontWeight: 800,
                          transition: "opacity 0.14s", fontFamily: "inherit",
                        }}
                      >
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: current.border, flexShrink: 0 }} />
                        {sem}
                        <svg style={{ marginLeft: "auto" }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points={showSemColorPicker === sem ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/></svg>
                      </button>
                      {showSemColorPicker === sem && (
                        <div style={{ background:"rgba(0,0,0,0.30)", borderRadius:9, padding:"10px 11px", border:"1px solid rgba(255,255,255,0.12)", marginTop:3 }}>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                            {([["bg","Background"],["border","Border"],["textColor","Text"]] as [string,string][]).map(([field, label]) => (
                              <div key={field} style={{ gridColumn: field === "textColor" ? "1 / -1" : "auto" }}>
                                <span className="sp-label" style={{ marginBottom:3 }}>{label}</span>
                                <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                                  <input
                                    type="color"
                                    value={(current as any)[field] || "#ffffff"}
                                    onChange={(e) => setSemColors((prev) => ({...prev, [sem]: {...(prev[sem] || defaultColors[sem]), [field]: e.target.value}}))}
                                    style={{ width:32, height:26, border:"none", background:"transparent", padding:0, cursor:"pointer" }}
                                  />
                                  <input
                                    className="sp-field"
                                    value={(current as any)[field] || ""}
                                    onChange={(e) => setSemColors((prev) => ({...prev, [sem]: {...(prev[sem] || defaultColors[sem]), [field]: e.target.value}}))}
                                    style={{ fontSize:11, padding:"5px 8px" }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          <button className="sp-ghost-btn" onClick={() => setSemColors((prev) => { const n={...prev}; delete n[sem]; return n; })} style={{ marginTop:7, fontSize:10, padding:"3px 9px" }}>Reset</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <hr className="sp-divider"/>

            <button className="sp-build-btn" onClick={onBuild} disabled={loading||testLoading||!majorInput.trim()||!catalogYear.trim()}>
              {loading ? (
                <><span style={{ width:12, height:12, border:"2.5px solid rgba(255,255,255,0.28)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"sp-spin 0.7s linear infinite" }}/>Building roadmap…</>
              ) : (
                <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>Build Roadmap</>
              )}
            </button>

            {/* Test case button */}
            <button className="sp-test-btn" onClick={onLoadTestCase} disabled={loading||testLoading} title="Load CSUN CS 2022 roadmap">
              {testLoading ? (
                <><span style={{ width:11, height:11, border:"2px solid rgba(196,181,253,0.28)", borderTopColor:"#c4b5fd", borderRadius:"50%", display:"inline-block", animation:"sp-spin 0.7s linear infinite" }}/>Loading…</>
              ) : (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4"/><path d="M9 21H5a2 2 0 0 1-2-2v-4"/><path d="M15 3h4a2 2 0 0 1 2 2v4"/><path d="M15 21h4a2 2 0 0 0 2-2v-4"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>Test: CSUN CS 2022 Roadmap</>
              )}
            </button>

            {/* Status / error */}
            {status && !error && (
              <div style={{ marginTop:9, fontSize:12, color:"#6ee7b7", display:"flex", alignItems:"center", gap:5, animation:"sp-fade 0.3s ease" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {status}
              </div>
            )}
            {error && (
              <div style={{ marginTop:9, fontSize:12, color:"#fca5a5", display:"flex", alignItems:"flex-start", gap:5, animation:"sp-fade 0.3s ease" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:2 }}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                {error}
              </div>
            )}

            {/* Stats */}
            {raw && (
              <>
                <hr className="sp-divider"/>
                <div className="sp-stat-row">
                  <div className="sp-stat">
                    <div className="sp-stat-val">{raw.semesters.length}</div>
                    <div className="sp-stat-lbl">Semesters</div>
                  </div>
                  <div className="sp-stat">
                    <div className="sp-stat-val">{visibleCourses}</div>
                    <div className="sp-stat-lbl">Courses</div>
                  </div>
                  <div className="sp-stat">
                    <div className="sp-stat-val">{totalUnits}</div>
                    <div className="sp-stat-lbl">Units</div>
                  </div>
                </div>

                {deletedKeys.size > 0 && (
                  <div style={{ marginTop:10, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.40)" }}>
                      {deletedKeys.size} course{deletedKeys.size!==1?"s":""} hidden
                    </span>
                    <button
                      onClick={() => setDeletedKeys(new Set())}
                      className="sp-ghost-btn"
                      style={{ padding:"3px 9px", fontSize:11 }}
                    >
                      Restore all
                    </button>
                  </div>
                )}

                {raw.matchedRoadmap?.title && (
                  <p style={{ margin:"10px 0 0", fontSize:10.5, color:"rgba(255,255,255,0.36)", lineHeight:1.55 }}>
                    Plan: <span style={{ color:"rgba(255,255,255,0.62)" }}>{raw.matchedRoadmap.title}</span>
                  </p>
                )}
                {raw.matchedRoadmap?.url && (
                  <a href={raw.matchedRoadmap.url} target="_blank" rel="noreferrer"
                    style={{ display:"inline-flex", alignItems:"center", gap:5, marginTop:5, fontSize:10.5, color:"rgba(196,181,253,0.78)", textDecoration:"none", fontWeight:700 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    View official roadmap
                  </a>
                )}
              </>
            )}
          </div>

          {/* ════════ RIGHT: Graph ════════ */}
          <div style={{ position:"relative", overflow:"hidden" }}>
            <PlannerCanvas
              raw={raw}
              deletedKeys={deletedKeys}
              onDeleteNode={handleDeleteNode}
              graphRef={graphRef}
              graphDark={graphDark}
              semColorOverrides={semColors}
            />
          </div>
        </div>

        {/* ════════ ELECTIVE MODAL ════════ */}
        {showElectiveModal && raw?.electiveOptions && (
          <div
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.74)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowElectiveModal(false); }}
          >
            <div style={{ background:"#4a0015", border:"1px solid rgba(255,255,255,0.15)", borderRadius:20, padding:26, maxWidth:580, width:"92%", maxHeight:"82vh", overflow:"auto", animation:"sp-pop 0.2s ease", scrollbarWidth:"thin", scrollbarColor:"rgba(255,255,255,0.18) transparent" }}>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                <div>
                  <h3 style={{ margin:0, fontWeight:950, fontSize:19, color:"#fff" }}>Choose Electives</h3>
                  <p style={{ margin:"3px 0 0", fontSize:12, color:"rgba(255,255,255,0.46)" }}>
                    Enter the course ID, name, and units for each elective slot.
                  </p>
                </div>
                <button onClick={() => setShowElectiveModal(false)}
                  style={{ background:"rgba(255,255,255,0.09)", border:"1px solid rgba(255,255,255,0.16)", borderRadius:8, width:30, height:30, cursor:"pointer", color:"rgba(255,255,255,0.72)", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
              </div>

              <input className="sp-field" type="text" placeholder="Filter electives…"
                value={electiveSearchQuery} onChange={(e) => setElectiveSearchQuery(e.target.value)}
                style={{ marginBottom:13 }}/>

              <div style={{ display:"grid", gap:9 }}>
                {raw.electiveOptions
                  .filter((el) => !electiveSearchQuery || el.label.toLowerCase().includes(electiveSearchQuery.toLowerCase()))
                  .map((elective) => {
                    const f = electiveFields[elective.id] ?? { courseId:"", courseName:"", courseUnits:"" };
                    const filled = !!f.courseId.trim();
                    return (
                      <div key={elective.id} className="sp-elec-card" style={{
                        background: filled ? "rgba(34,197,94,0.09)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${filled ? "rgba(34,197,94,0.26)" : "rgba(255,255,255,0.11)"}`,
                      }}>
                        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                          <div>
                            <div style={{ fontWeight:800, fontSize:13.5, color:"#fff" }}>{elective.label}</div>
                            <div style={{ fontSize:10.5, color:"rgba(255,255,255,0.40)", marginTop:2 }}>
                              {elective.category && `${elective.category} · `}{elective.semesterLabel}
                            </div>
                          </div>
                          {filled && (
                            <span style={{ background:"rgba(34,197,94,0.18)", color:"#4ade80", border:"1px solid rgba(34,197,94,0.28)", borderRadius:999, padding:"2px 8px", fontSize:10, fontWeight:800, whiteSpace:"nowrap" }}>
                              ✓ Set
                            </span>
                          )}
                        </div>

                        {/* Three input fields */}
                        <div className="sp-elec-field-row">
                          <div>
                            <span className="sp-label" style={{ marginBottom:4 }}>Course ID</span>
                            <input className="sp-field" type="text" placeholder="e.g. COMP 524"
                              value={f.courseId}
                              onChange={(e) => updateElectiveField(elective.id, "courseId", e.target.value)}
                              style={{ fontSize:12 }}/>
                          </div>
                          <div>
                            <span className="sp-label" style={{ marginBottom:4 }}>Course Name</span>
                            <input className="sp-field" type="text" placeholder="e.g. Computer Graphics"
                              value={f.courseName}
                              onChange={(e) => updateElectiveField(elective.id, "courseName", e.target.value)}
                              style={{ fontSize:12 }}/>
                          </div>
                          <div>
                            <span className="sp-label" style={{ marginBottom:4 }}>Units</span>
                            <input className="sp-field" type="number" placeholder="3" min={1} max={6}
                              value={f.courseUnits}
                              onChange={(e) => updateElectiveField(elective.id, "courseUnits", e.target.value)}
                              style={{ fontSize:12 }}/>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div style={{ display:"flex", gap:9, marginTop:18 }}>
                <button className="sp-build-btn" style={{ flex:2 }}
                  onClick={() => { setShowElectiveModal(false); onBuild(); }}>
                  Apply & Rebuild
                </button>
                <button className="sp-ghost-btn" style={{ flex:1, justifyContent:"center" }}
                  onClick={() => setShowElectiveModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ReactFlowProvider>
  );
}
