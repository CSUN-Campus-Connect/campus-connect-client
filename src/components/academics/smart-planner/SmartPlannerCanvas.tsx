"use client";

import React, { useCallback, useEffect } from "react";
import {
  ReactFlow,
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
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";

import type { CustomCourse, SkillTreeResponse } from "./smartPlannerTypes";
import type { SemesterPalette, SemesterType } from "./smartPlannerUtils";
import {
  DEPT_COLORS,
  LIGHT_SEMESTER_BG,
  buildTierLabel,
  getDeptColor,
  getDeptFromCourseKey,
  getSemesterPaletteForSeason,
  getTierSeason,
  hexToRgb,
  normalizeCourseKey,
  rgbaFromHex,
} from "./smartPlannerUtils";

export type CourseNodeData = {
  nodeKey: string;
  title: string | null;
  units: number | null;
  levelBand: number;
  semesterLabel: string;
  tierIndex: number;
  onDelete: (id: string) => void;
  semPalette: SemesterPalette;
  graphDark?: boolean;
  deptColorOverrides?: Record<string, string>;
  isCustom?: boolean;
  customColor?: string;
};

function SmartCourseNode({ id, data, selected }: { id: string; data: CourseNodeData; selected?: boolean }) {
  const dept = getDeptFromCourseKey(data.nodeKey);
  const pillColor = data.isCustom
    ? (data.customColor ?? "#6b7280")
    : (data.deptColorOverrides?.[dept] ?? getDeptColor(data.nodeKey));
  const parts = data.nodeKey.split("-");
  const sub = parts[0];
  const cat = parts.slice(1).join(" ");

  const rgb = hexToRgb(pillColor);
  const cardBg = data.graphDark === false
    ? (rgb ? `rgb(${Math.round(rgb[0]*0.85+20)}, ${Math.round(rgb[1]*0.85+20)}, ${Math.round(rgb[2]*0.85+20)})` : "#f0eeff")
    : (rgb ? `rgb(${Math.round(rgb[0]*0.18)}, ${Math.round(rgb[1]*0.18)}, ${Math.round(rgb[2]*0.18)})` : "#0d0b1a");
  const textColor = "#ffffff";
  const handleBorderColor = data.graphDark === false
    ? (rgb ? `rgb(${Math.round(rgb[0]*0.45)}, ${Math.round(rgb[1]*0.45)}, ${Math.round(rgb[2]*0.45)})` : "#333")
    : (rgb ? `rgb(${Math.round(rgb[0]*0.08)}, ${Math.round(rgb[1]*0.08)}, ${Math.round(rgb[2]*0.08)})` : "#000");
  const handleColor = "#ffffff";

  return (
    <div style={{
      background: cardBg,
      border: `2px solid ${selected ? (data.graphDark === false ? "#0f172a" : "#ffffff") : pillColor}`,
      borderRadius: 14, padding: "10px 14px", width: 215,
      cursor: "grab", boxShadow: data.isCustom ? `0 0 0 1px ${rgbaFromHex(pillColor, 0.35)}, 0 4px 16px ${rgbaFromHex(pillColor, 0.18)}` : "none",
      transition: "border-color 0.2s, background 0.2s",
      userSelect: "none", position: "relative",
    }}>
      <Handle type="target" position={Position.Top} style={{ background: handleColor, width:10, height:10, border:`2px solid ${handleBorderColor}` }} />
      <Handle type="source" position={Position.Bottom} style={{ background: handleColor, width:10, height:10, border:`2px solid ${handleBorderColor}` }} />
      <Handle type="target" position={Position.Left} style={{ background: handleColor, width:8, height:8, border:`2px solid ${handleBorderColor}`, top:"50%" }} id="l-in" />
      <Handle type="source" position={Position.Right} style={{ background: handleColor, width:8, height:8, border:`2px solid ${handleBorderColor}`, top:"50%" }} id="r-out" />

      <button onClick={(e) => { e.stopPropagation(); data.onDelete(id); }} title="Remove" style={{
        position:"absolute", top:6, right:6,
        background: "rgba(255,255,255,0.12)", border:"none",
        borderRadius:6, width:20, height:20, color: "rgba(255,255,255,0.60)",
        fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
        lineHeight:1, transition:"background 0.14s, color 0.14s", padding:0,
      }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background="rgba(239,68,68,0.25)"; (e.currentTarget as HTMLButtonElement).style.color="#f87171"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color="rgba(255,255,255,0.60)"; }}
      >×</button>

      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5, paddingRight:14 }}>
        <span style={{
          background: pillColor, color: "#fff",
          borderRadius:6, padding:"2px 7px", fontSize:10, fontWeight:800, letterSpacing:"0.05em", whiteSpace:"nowrap",
          display:"flex", alignItems:"center", gap:4,
        }}>
          {data.isCustom && <span style={{ fontSize:9 }}>★</span>}
          {sub} {cat}
        </span>
        {data.units != null && (
          <span style={{ fontSize:10, color: "rgba(255,255,255,0.88)", fontWeight:700 }}>
            {data.units}u
          </span>
        )}
        {data.isCustom && (
          <span style={{ fontSize:8, color: rgbaFromHex(pillColor, 0.9), background: rgbaFromHex(pillColor, 0.18), border:`1px solid ${rgbaFromHex(pillColor,0.35)}`, borderRadius:4, padding:"1px 5px", fontWeight:800, letterSpacing:"0.06em" }}>CUSTOM</span>
        )}
      </div>

      <div style={{ fontSize:11.5, color: textColor, fontWeight:800, lineHeight:1.35, marginBottom:6, minHeight:15 }}>
        {data.title ?? ""}
      </div>

      <div style={{
        display:"inline-flex", alignItems:"center",
        background: rgbaFromHex(data.semPalette.badge, data.graphDark === false ? 0.20 : 0.18),
        border: `1px solid ${rgbaFromHex(data.semPalette.badge, 0.45)}`,
        borderRadius:6, padding:"2px 7px",
        fontSize:9.5, color: "rgba(255,255,255,0.86)", fontWeight:700, letterSpacing:"0.03em",
      }}>{data.semesterLabel}</div>
    </div>
  );
}

const nodeTypes = { smartCourse: SmartCourseNode };

// ─── Layout (INVERTED: Year 1 at bottom, Senior at top) ──────────────────────

const LANE_W    = 1400;   // wider lane
const LANE_X    = 20;
const LANE_PAD  = 48;     // more breathing room between lanes
const NODE_W    = 230;
const NODE_H    = 120;
const START_Y   = 72;
const SIDE_PAD  = 52;
const H_GAP     = 56;     // more horizontal gap between cards
const ROW_GAP   = 44;     // more vertical gap between rows
const DEPT_GAP  = 28;     // extra gap between dept groups
const DEPT_LBL  = 22;     // height of dept label row inside lane

export function buildLayout(
  raw: SkillTreeResponse,
  deletedKeys: Set<string>,
  onDelete: (id: string) => void,
  semColorOverrides?: Partial<Record<SemesterType | string, {bg:string;border:string;textColor:string}>>,
  graphDark?: boolean,
  startTerm: SemesterType = "Fall",
  includeSummer = false,
  includeWinter = false,
  deptColorOverrides?: Record<string, string>,
  customCourses?: CustomCourse[]
): { rfNodes: Node[]; rfEdges: Edge[] } {
  const tiers = raw.semesters.slice().sort((a, b) => a.tierIndex - b.tierIndex);

  const rfNodes: Node[] = [];
  const rfEdges: Edge[] = [];

  // Helper: get dept key from course key
  function getDept(key: string) {
    return getDeptFromCourseKey(key);
  }

  // Pre-compute tier heights (accounting for dept grouping)
  const tierHeights = new Map<number, number>();
  for (const t of tiers) {
    const active = raw.nodes.filter((n) => n.tierIndex === t.tierIndex && !deletedKeys.has(n.key));
    // Group by dept
    const depts: string[] = [...new Set(active.map((n) => getDept(n.key)))];
    const numDepts = Math.max(1, depts.length);
    // Each dept: up to 4 cols, rows = ceil(deptNodes/cols)
    let totalHeight = START_Y;
    for (const dept of depts) {
      const deptNodes = active.filter((n) => getDept(n.key) === dept);
      const cols = Math.max(1, Math.min(4, deptNodes.length));
      const rows = Math.max(1, Math.ceil(deptNodes.length / cols));
      totalHeight += DEPT_LBL + rows * NODE_H + (rows - 1) * ROW_GAP + DEPT_GAP;
    }
    tierHeights.set(t.tierIndex, Math.max(220, totalHeight + 20));
  }

  const tierYMap = new Map<number, number>();
  let runningY = 0;
  for (let i = tiers.length - 1; i >= 0; i--) {
    const t = tiers[i];
    tierYMap.set(t.tierIndex, runningY);
    runningY += (tierHeights.get(t.tierIndex) ?? 220) + LANE_PAD;
  }

  for (const t of tiers) {
    const laneY = tierYMap.get(t.tierIndex) ?? 0;
    const laneH = tierHeights.get(t.tierIndex) ?? 220;

    const season = getTierSeason(t.tierIndex, startTerm, includeSummer, includeWinter);
    const semesterPalette = getSemesterPaletteForSeason(season, semColorOverrides);
    const border = semesterPalette.border;
    const textColor = semesterPalette.text;
    const active = raw.nodes.filter((n) => n.tierIndex === t.tierIndex && !deletedKeys.has(n.key));

    // Add any custom courses for this semester
    const tierLabel = buildTierLabel(t.tierIndex, startTerm, includeSummer, includeWinter);
    const customForTier = (customCourses ?? []).filter((c) => c.semesterLabel === tierLabel);

    const laneBg = graphDark === false
      ? LIGHT_SEMESTER_BG[season] ?? semesterPalette.bg
      : semesterPalette.bg;

    const displayLabel = buildTierLabel(t.tierIndex, startTerm, includeSummer, includeWinter);
    const totalUnitsInTier = t.totalUnits + customForTier.reduce((s, c) => s + c.units, 0);

    rfNodes.push({
      id: `tier-${t.tierIndex}`,
      type: "default",
      position: { x: LANE_X, y: laneY },
      selectable: false, draggable: false,
      data: {
        label: (
          <div style={{ textAlign:"left" }}>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <span style={{
                background: border, color:"#fff",
                borderRadius:6, padding:"2px 8px",
                fontSize:9.5, fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase",
                flexShrink:0,
              }}>
                {season.toUpperCase()}
              </span>
              <div style={{ fontWeight:950, fontSize:13.5, color: border, letterSpacing:"0.05em", textTransform:"uppercase" }}>
                {displayLabel.toUpperCase()}
              </div>
            </div>
            <div style={{ fontSize:10.5, color: rgbaFromHex(textColor, 0.68), fontWeight:700, marginTop:4 }}>
              {totalUnitsInTier} units{customForTier.length > 0 ? ` (+${customForTier.reduce((s,c)=>s+c.units,0)} custom)` : ""}
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

    // Group nodes by department
    const depts: string[] = [...new Set(active.map((n) => getDept(n.key)))].sort();
    let deptOffsetY = START_Y;

    for (const dept of depts) {
      const deptNodes = active.filter((n) => getDept(n.key) === dept);
      const cols = Math.max(1, Math.min(4, deptNodes.length));
      const totalDeptWidth = cols * NODE_W + (cols - 1) * H_GAP;
      const deptStartX = LANE_X + SIDE_PAD + Math.max(0, (LANE_W - SIDE_PAD * 2 - totalDeptWidth) / 2);

      // Dept sub-label node (ghost, non-interactive)
      const deptColor = deptColorOverrides?.[dept] ?? DEPT_COLORS[dept] ?? DEPT_COLORS.DEFAULT;
      rfNodes.push({
        id: `dept-label-${t.tierIndex}-${dept}`,
        type: "default",
        position: { x: deptStartX, y: laneY + deptOffsetY - 4 },
        selectable: false, draggable: false,
        data: {
          label: (
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ width:8, height:8, borderRadius:2, background: deptColor, flexShrink:0, display:"inline-block" }}/>
              <span style={{ fontSize:9, fontWeight:800, color: graphDark === false ? rgbaFromHex(deptColor, 0.85) : rgbaFromHex(deptColor, 0.90), letterSpacing:"0.10em", textTransform:"uppercase" }}>{dept}</span>
            </div>
          ),
        },
        style: {
          width: totalDeptWidth, height: DEPT_LBL,
          background: "transparent", border: "none",
          padding:"0 4px", pointerEvents:"none", boxShadow:"none",
        },
        zIndex: 1,
      });

      deptOffsetY += DEPT_LBL + 6;

      deptNodes.forEach((n, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const nodeSeason = getTierSeason(n.tierIndex, startTerm, includeSummer, includeWinter);
        rfNodes.push({
          id: n.key,
          type: "smartCourse",
          position: { x: deptStartX + col * (NODE_W + H_GAP), y: laneY + deptOffsetY + row * (NODE_H + ROW_GAP) },
          data: {
            nodeKey: n.key, title: n.title ?? null, units: n.units ?? null,
            levelBand: n.levelBand, semesterLabel: buildTierLabel(n.tierIndex, startTerm, includeSummer, includeWinter),
            tierIndex: n.tierIndex, onDelete,
            semPalette: getSemesterPaletteForSeason(nodeSeason, semColorOverrides),
            graphDark,
            deptColorOverrides,
          } as CourseNodeData,
          zIndex: 10,
        });
      });

      const rows = Math.ceil(deptNodes.length / cols);
      deptOffsetY += rows * NODE_H + (rows - 1) * ROW_GAP + DEPT_GAP;
    }

    // Place custom courses at the end of the lane
    if (customForTier.length > 0) {
      const customCols = Math.max(1, Math.min(4, customForTier.length));
      const totalCustomWidth = customCols * NODE_W + (customCols - 1) * H_GAP;
      const customStartX = LANE_X + SIDE_PAD + Math.max(0, (LANE_W - SIDE_PAD * 2 - totalCustomWidth) / 2);

      // Custom courses dept label
      rfNodes.push({
        id: `dept-label-${t.tierIndex}-CUSTOM`,
        type: "default",
        position: { x: customStartX, y: laneY + deptOffsetY - 4 },
        selectable: false, draggable: false,
        data: {
          label: (
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:9, color:"rgba(255,255,255,0.55)", fontWeight:800, letterSpacing:"0.10em", textTransform:"uppercase" }}>★ CUSTOM ADDITIONS</span>
            </div>
          ),
        },
        style: { width: totalCustomWidth, height: DEPT_LBL, background:"transparent", border:"none", padding:"0 4px", pointerEvents:"none", boxShadow:"none" },
        zIndex: 1,
      });
      deptOffsetY += DEPT_LBL + 6;

      customForTier.forEach((c, index) => {
        const col = index % customCols;
        const row = Math.floor(index / customCols);
        const nodeSeason = getTierSeason(t.tierIndex, startTerm, includeSummer, includeWinter);
        rfNodes.push({
          id: `custom-${c.id}`,
          type: "smartCourse",
          position: { x: customStartX + col * (NODE_W + H_GAP), y: laneY + deptOffsetY + row * (NODE_H + ROW_GAP) },
          data: {
            nodeKey: normalizeCourseKey(c.courseId),
            title: c.courseName,
            units: c.units,
            levelBand: 0,
            semesterLabel: c.semesterLabel,
            tierIndex: t.tierIndex,
            onDelete,
            semPalette: getSemesterPaletteForSeason(nodeSeason, semColorOverrides),
            graphDark,
            deptColorOverrides,
            isCustom: true,
            customColor: c.color,
          } as CourseNodeData,
          zIndex: 10,
        });
      });
    }
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
      style: { stroke: graphDark === false ? "rgba(30,30,60,0.60)" : "rgba(255,255,255,0.55)", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: graphDark === false ? "rgba(30,30,60,0.60)" : "rgba(255,255,255,0.55)", width: 14, height: 14 },
      zIndex: 5, // between tier blocks (0) and course cards (10)
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
  .react-flow__edge-path { stroke: rgba(255,255,255,0.55) !important; stroke-width: 2 !important; }
  .react-flow__edge.animated path { stroke-dasharray: 5 5; }
  .react-flow__connection-line { stroke: rgba(255,255,255,0.88) !important; stroke-width: 2 !important; }
  .react-flow__handle { transition: opacity 0.15s; }
  /* Ensure edges render above semester blocks (z=0) but below course cards (z=10) */
  .react-flow__edges { z-index: 5 !important; }
  .react-flow__edge { z-index: 5 !important; }
`;

// ─── Inner canvas ─────────────────────────────────────────────────────────────

export function PlannerCanvas({
  raw,
  deletedKeys,
  onDeleteNode,
  graphRef,
  graphDark,
  semColorOverrides,
  deptColorOverrides,
  customCourses,
  startTerm,
  includeSummer,
  includeWinter,
}: {
  raw: SkillTreeResponse | null;
  deletedKeys: Set<string>;
  onDeleteNode: (key: string) => void;
  graphRef?: React.RefObject<HTMLDivElement | null>;
  graphDark?: boolean;
  semColorOverrides?: Record<string, {bg:string;border:string;textColor:string}>;
  deptColorOverrides?: Record<string, string>;
  customCourses?: CustomCourse[];
  startTerm?: SemesterType;
  includeSummer?: boolean;
  includeWinter?: boolean;
}) {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!raw) { setNodes([]); setEdges([]); return; }
    const { rfNodes, rfEdges } = buildLayout(
      raw, deletedKeys, onDeleteNode, semColorOverrides, graphDark,
      startTerm ?? "Fall", includeSummer ?? false, includeWinter ?? false, deptColorOverrides, customCourses
    );
    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [raw, deletedKeys, onDeleteNode, semColorOverrides, deptColorOverrides, customCourses, graphDark, startTerm, includeSummer, includeWinter, setNodes, setEdges]);

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
          style: { stroke: graphDark === false ? "rgba(30,30,60,0.85)" : "rgba(255,255,255,0.82)", strokeWidth: 2.2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: graphDark === false ? "rgba(30,30,60,0.85)" : "rgba(255,255,255,0.82)", width: 16, height: 16 },
        }, eds)
      ),
    [setEdges, graphDark]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => setEdges((eds) => eds.filter((e) => e.id !== edge.id)),
    [setEdges]
  );

  const graphBgColor = graphDark === false ? "#e8edf5" : "#06080e";
  const bgDotColor  = graphDark === false ? "#c8d0e0" : "#131828";

  if (!raw) {
    return (
      <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:18, padding:40, position:"relative", background: graphBgColor }}>
        <div aria-hidden style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle, ${graphDark === false ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"} 1px, transparent 1px)`, backgroundSize:"32px 32px", pointerEvents:"none" }} />
        <div style={{ width:68, height:68, borderRadius:18, background: graphDark === false ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)", border:`1px solid ${graphDark === false ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.15)"}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={graphDark === false ? "rgba(0,0,0,0.40)" : "rgba(255,255,255,0.55)"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/>
            <rect x="9" y="15" width="6" height="6" rx="1"/>
            <path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9"/><line x1="12" y1="12" x2="12" y2="15"/>
          </svg>
        </div>
        <div style={{ textAlign:"center", position:"relative" }}>
          <p style={{ margin:0, fontSize:20, fontWeight:950, color: graphDark === false ? "rgba(0,0,0,0.70)" : "rgba(255,255,255,0.78)" }}>No roadmap built yet</p>
          <p style={{ margin:"8px 0 0", fontSize:13, color: graphDark === false ? "rgba(0,0,0,0.40)" : "rgba(255,255,255,0.38)", maxWidth:340, lineHeight:1.65 }}>
            Configure your major on the left and click <strong style={{ color: graphDark === false ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.62)" }}>Build Roadmap</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={graphRef} id="rf-graph-capture" style={{ height:"100%" }} className={graphDark === false ? "graph-light" : ""}>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={onConnect} onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.12 }}
        proOptions={{ hideAttribution: true }} connectionMode={"loose" as any}
        style={{ background: graphBgColor }}
      >
        <Background color={bgDotColor} gap={22} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            if (n.id.startsWith("tier-")) return (graphDark === false ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.04)");
            const dept = getDeptFromCourseKey(n.id);
            return deptColorOverrides?.[dept] ?? getDeptColor(n.id, deptColorOverrides);
          }}
          maskColor={graphDark === false ? "rgba(200,210,230,0.60)" : "rgba(0,0,0,0.72)"}
          style={{ background: graphBgColor }}
        />
      </ReactFlow>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

