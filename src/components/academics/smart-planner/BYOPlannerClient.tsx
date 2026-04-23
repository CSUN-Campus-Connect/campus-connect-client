"use client";

import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  MarkerType,
  useReactFlow,
  Panel,
  Node,
  Edge,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type SemesterType = "Fall" | "Spring" | "Summer" | "Winter";

interface CourseData {
  id: string;
  courseId: string;
  courseName: string;
  units: number;
  tag: "Lecture" | "Lab" | "Both" | "";
  semester: SemesterType;
  year: number;
  cardColor: string;
  cardTextColor: string;
  pillColor: string;
  pillTextColor: string;
}

// ─── Default color palette per semester ───────────────────────────────────────

const DEFAULT_SEMESTER_COLORS: Record<SemesterType, { bg: string; border: string; text: string; badge: string }> = {
  Fall:   { bg: "#1a0a3e", border: "#7c3aed", text: "#c4b5fd", badge: "#7c3aed" },
  Winter: { bg: "#0a1f2e", border: "#0284c7", text: "#7dd3fc", badge: "#0284c7" },
  Spring: { bg: "#0a2e1a", border: "#16a34a", text: "#86efac", badge: "#16a34a" },
  Summer: { bg: "#2e1a00", border: "#d97706", text: "#fcd34d", badge: "#d97706" },
};

const LIGHT_SEMESTER_BACKGROUNDS: Record<SemesterType, string> = {
  Fall: "#f4efff",
  Winter: "#eef8ff",
  Spring: "#effcf3",
  Summer: "#fff7eb",
};

// Semester type ordering: Fall(0) → Winter(1) → Spring(2) → Summer(3)
const SEM_ORDER: Record<SemesterType, number> = { Fall: 0, Winter: 1, Spring: 2, Summer: 3 };

const DEPT_COLORS: Record<string, string> = {
  COMP: "#7c3aed", MATH: "#16a34a", PHYS: "#0284c7", ENGR: "#d97706",
  BIOL: "#dc2626", CHEM: "#9333ea", ENGL: "#0d9488", BUS: "#ea580c",
  ART:  "#db2777", HIST: "#92400e", PSYC: "#0369a1", SOC: "#15803d",
  DEFAULT: "#6b7280",
};

function getDeptColor(courseId: string): string {
  const dept = courseId.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
  return DEPT_COLORS[dept] || DEPT_COLORS.DEFAULT;
}

// ─── CSUN semester options: Fall → Winter → Spring → Summer order ─────────────

function buildSemesterOptions(): { label: string; type: SemesterType; year: number }[] {
  const out: { label: string; type: SemesterType; year: number }[] = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y <= currentYear + 5; y++) {
    out.push({ label: `Fall ${y}`,   type: "Fall",   year: y });
    out.push({ label: `Winter ${y}`, type: "Winter", year: y });
    out.push({ label: `Spring ${y}`, type: "Spring", year: y });
    out.push({ label: `Summer ${y}`, type: "Summer", year: y });
  }
  return out;
}

const ALL_SEMESTERS = buildSemesterOptions();

// ─── Custom Course Node ───────────────────────────────────────────────────────

function CourseNode({
  data,
  selected,
  semColors,
  graphDark,
}: {
  data: CourseData & { onDelete: (id: string) => void };
  selected?: boolean;
  semColors?: Record<SemesterType, { bg: string; border: string; text: string; badge: string }>;
  graphDark?: boolean;
}) {
  const palette = semColors ?? DEFAULT_SEMESTER_COLORS;
  const sc = palette[data.semester] || palette.Fall;
  const cardColor = data.cardColor || sc.bg;
  const cardTextColor = data.cardTextColor || sc.text || "#ffffff";
  const pillColor = data.pillColor || getDeptColor(data.courseId);
  const pillTextColor = data.pillTextColor || "#ffffff";

  const lightNodeBg = LIGHT_SEMESTER_BACKGROUNDS[data.semester] || cardColor;
  const darkNodeBg = cardColor;

  return (
    <div
      style={{
        background: graphDark === false ? lightNodeBg : darkNodeBg,
        border: `2px solid ${selected ? (graphDark === false ? "#0f172a" : "#ffffff") : sc.border}`,
        borderRadius: 14,
        padding: "10px 14px",
        width: 300,
        cursor: "grab",
        boxShadow: "none",
        transition: "border-color 0.2s, background 0.2s",
        position: "relative",
        userSelect: "none",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: graphDark === false ? "#333" : "#ffffff", width: 10, height: 10, border: "2px solid rgba(255,255,255,0.28)" }}
      />

      <button
        onClick={(e) => { e.stopPropagation(); data.onDelete(data.id); }}
        title="Remove course"
        style={{
          position: "absolute", top: 6, right: 6,
          background: graphDark === false ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.08)", border: "none",
          borderRadius: 6, width: 20, height: 20,
          color: graphDark === false ? "rgba(15,23,42,0.55)" : "rgba(255,255,255,0.50)", fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.15s, color 0.15s",
          lineHeight: 1,
        }}
      >×</button>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{
          background: pillColor,
          color: pillTextColor,
          borderRadius: 6,
          padding: "3px 8px",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
        }}>
          {data.courseId || "???"}
        </span>
        {data.units > 0 && (
          <span style={{ fontSize: 10, color: graphDark === false ? "rgba(0,0,0,0.60)" : "rgba(255,255,255,0.70)", fontWeight: 700 }}>
            {data.units}u
          </span>
        )}
        {data.tag && (
          <span style={{
            fontSize: 9, padding: "1px 5px",
            background: graphDark === false ? `${pillColor}1f` : "rgba(255,255,255,0.10)", borderRadius: 4,
            color: graphDark === false ? "rgba(15,23,42,0.72)" : "rgba(255,255,255,0.72)", fontWeight: 700, letterSpacing: "0.05em",
          }}>
            {data.tag.toUpperCase()}
          </span>
        )}
      </div>

      <div style={{
        fontSize: 12.5, color: graphDark === false ? "#1a1a2e" : cardTextColor, fontWeight: 800,
        lineHeight: 1.35, marginBottom: 6, paddingRight: 16,
      }}>
        {data.courseName || "Untitled Course"}
      </div>

      <div style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        background: graphDark === false ? `${sc.badge}20` : `${sc.badge}22`,
        border: `1px solid ${graphDark === false ? sc.badge : `${sc.badge}55`}`,
        borderRadius: 6, padding: "2px 7px",
        fontSize: 10, color: graphDark === false ? "#1a1a2e" : cardTextColor, fontWeight: 700,
      }}>
        {data.semester} {data.year}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: graphDark === false ? "#333" : "#ffffff", width: 10, height: 10, border: "2px solid rgba(255,255,255,0.28)" }}
      />
    </div>
  );
}

// nodeTypes must be defined outside component to avoid re-registration
const nodeTypes = { course: CourseNode };

// ─── Main BYO Planner Component ───────────────────────────────────────────────

let _idCounter = 1;
function genId() { return `course-${Date.now()}-${_idCounter++}`; }

const EMPTY_FORM = {
  courseId: "",
  courseName: "",
  units: 3,
  tag: "" as CourseData["tag"],
  semester: "Fall" as SemesterType,
  year: new Date().getFullYear(),
  cardColor: "#1a0a3e",
  cardTextColor: "#e9ddff",
  pillColor: "#7c3aed",
  pillTextColor: "#ffffff",
};

const BG = `radial-gradient(1200px 600px at 20% 0%, rgba(255,255,255,0.10), transparent 55%),
linear-gradient(180deg, rgba(168,5,50,1) 0%, rgba(120,0,35,0.98) 55%, rgba(168,5,50,1) 100%)`;

const css = `
  @keyframes byop-spin { to { transform: rotate(360deg) } }
  @keyframes byop-fade { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
  @keyframes byop-pop  { from { opacity:0; transform:scale(0.92) } to { opacity:1; transform:scale(1) } }

  .byop-panel {
    width: 300px;
    min-width: 280px;
    height: 100%;
    overflow-y: auto;
    padding: 20px 16px;
    background: rgba(80,0,20,0.55);
    border-right: 1px solid rgba(255,255,255,0.10);
    backdrop-filter: blur(12px);
    display: flex;
    flex-direction: column;
    gap: 14px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.18) transparent;
  }

  .byop-field {
    width: 100%;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 9px;
    color: #fff;
    padding: 8px 11px;
    font-size: 13px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.16s, background 0.16s;
    box-sizing: border-box;
  }
  .byop-field:focus { border-color: rgba(255,255,255,0.50); background: rgba(255,255,255,0.11); }
  .byop-field::placeholder { color: rgba(255,255,255,0.32); }
  .byop-field option { background: #780023; color: #fff; }

  .byop-label {
    display: block;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.48);
    margin-bottom: 4px;
  }

  .byop-add-btn {
    width: 100%;
    padding: 10px;
    background: rgba(0,0,0,0.70);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-weight: 900;
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    transition: opacity 0.16s, transform 0.12s;
    letter-spacing: 0.03em;
  }
  .byop-add-btn:hover { opacity: 0.86; transform: translateY(-1px); }
  .byop-add-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .byop-ghost-btn {
    padding: 6px 12px;
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.80);
    border: 1px solid rgba(255,255,255,0.20);
    border-radius: 999px;
    font-weight: 700;
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.14s;
    display: inline-flex; align-items: center; gap: 5px;
  }
  .byop-ghost-btn:hover { background: rgba(255,255,255,0.16); }

  .byop-divider {
    border: none; border-top: 1px solid rgba(255,255,255,0.10); margin: 4px 0;
  }

  .byop-section-title {
    font-size: 10px; font-weight: 800; letter-spacing: 0.10em;
    text-transform: uppercase; color: rgba(255,255,255,0.40);
  }

  .byop-toggle-row {
    display: flex; gap: 6px;
  }
  .byop-toggle-btn {
    flex: 1; padding: 6px 0;
    border: 1px solid rgba(255,255,255,0.15);
    background: transparent;
    color: rgba(255,255,255,0.48);
    font-weight: 700; font-size: 12px; font-family: inherit;
    cursor: pointer; border-radius: 8px;
    transition: all 0.14s;
  }
  .byop-toggle-btn.on {
    background: rgba(255,255,255,0.14);
    color: #fff;
    border-color: rgba(255,255,255,0.30);
  }

  .byop-course-list {
    display: flex; flex-direction: column; gap: 6px;
    animation: byop-fade 0.25s ease;
  }
  .byop-course-pill {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 9px;
    padding: 7px 10px;
    font-size: 12px;
    transition: background 0.14s;
    cursor: default;
  }
  .byop-course-pill:hover { background: rgba(255,255,255,0.10); }

  /* React Flow overrides */
  .react-flow__node { box-shadow: none !important; }
  .react-flow__controls { background: rgba(255,255,255,0.07) !important; border: 1px solid rgba(255,255,255,0.12) !important; border-radius: 10px !important; }
  .react-flow__controls-button { background: transparent !important; border-bottom: 1px solid rgba(255,255,255,0.09) !important; fill: rgba(255,255,255,0.72) !important; }
  .react-flow__controls-button:hover { background: rgba(255,255,255,0.10) !important; }
  .react-flow__minimap { border: 1px solid rgba(255,255,255,0.10) !important; border-radius: 10px !important; }
  .react-flow__edge-path { stroke: rgba(255,255,255,0.95) !important; stroke-width: 2.4 !important; }
  .react-flow__edge.animated path { stroke-dasharray: 6 6; }
  .react-flow__connection-line { stroke: rgba(255,255,255,0.95) !important; stroke-width: 2.4 !important; }

  /* Graph light mode */
  .graph-light .react-flow__edge-path { stroke: rgba(30,30,60,0.80) !important; }
  .graph-light .react-flow__connection-line { stroke: rgba(30,30,60,0.80) !important; }
  .graph-light .react-flow__controls { background: rgba(255,255,255,0.85) !important; border-color: rgba(0,0,0,0.14) !important; }
  .graph-light .react-flow__controls-button { fill: rgba(0,0,0,0.60) !important; border-bottom-color: rgba(0,0,0,0.08) !important; }
  .graph-light .react-flow__minimap { border-color: rgba(0,0,0,0.12) !important; }
`;

// ─── Inner canvas component ───────────────────────────────────────────────────

function PlannerCanvas({
  courses,
  onDeleteCourse,
  graphRef,
  graphDark,
  semColors,
}: {
  courses: CourseData[];
  onDeleteCourse: (id: string) => void;
  graphRef?: React.RefObject<HTMLDivElement | null>;
  graphDark: boolean;
  semColors: Record<SemesterType, { bg: string; border: string; text: string; badge: string }>;
}) {
  const { fitView } = useReactFlow();

  const LANE_W = 980;
  const LANE_X = 36;
  const LANE_PAD = 28;
  const NODE_W = 300;
  const NODE_H = 112;
  const START_Y = 74;
  const SIDE_PAD = 40;
  const H_GAP = 34;
  const ROW_GAP = 36;

  // Build semester combos sorted: Fall→Winter→Spring→Summer within same year, ascending year
  // Then reverse so earliest is at BOTTOM (largest Y) and latest at TOP (smallest Y)
  const combos = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => set.add(`${c.semester}-${c.year}`));
    if (set.size === 0) {
      const y = new Date().getFullYear();
      set.add(`Fall-${y}`); set.add(`Spring-${y}`);
    }
    const sorted = Array.from(set).sort((a, b) => {
      const [sa, ya] = a.split("-") as [SemesterType, string];
      const [sb, yb] = b.split("-") as [SemesterType, string];
      if (ya !== yb) return Number(ya) - Number(yb);
      return (SEM_ORDER[sa] ?? 0) - (SEM_ORDER[sb] ?? 0);
    });
    // Reverse: latest at top (y=0 = top of screen), earliest at bottom
    return sorted.reverse();
  }, [courses]);

  // Build lane background nodes
  const laneNodes: Node[] = useMemo(() => {
    let runningY = 0;
    return combos.map((key) => {
      const [sem, yr] = key.split("-") as [SemesterType, string];
      const sc = semColors[sem] || DEFAULT_SEMESTER_COLORS.Fall;
      const inLane = courses.filter((c) => c.semester === sem && String(c.year) === yr);
      const totalUnits = inLane.reduce((s, c) => s + (c.units || 0), 0);
      const cols = inLane.length <= 1 ? 1 : inLane.length <= 4 ? 2 : 3;
      const rows = Math.max(1, Math.ceil((inLane.length || 1) / cols));
      const laneH = Math.max(250, START_Y + rows * NODE_H + (rows - 1) * ROW_GAP + 46);

      const graphBg = graphDark
        ? `linear-gradient(180deg, ${sc.bg}dd 0%, rgba(10,10,20,0.72) 100%)`
        : LIGHT_SEMESTER_BACKGROUNDS[sem] || "#f8fbff";

      const laneNode = {
        id: `lane-${key}`,
        type: "default",
        position: { x: LANE_X, y: runningY },
        selectable: false,
        draggable: false,
        data: {
          label: (
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 950, fontSize: 15, color: graphDark ? sc.text : sc.border, letterSpacing: "0.04em" }}>
                {sem.toUpperCase()} {yr}
              </div>
              <div style={{ fontSize: 11, color: graphDark ? "rgba(255,255,255,0.44)" : "rgba(0,0,0,0.44)", fontWeight: 700, marginTop: 3 }}>
                {totalUnits} units
              </div>
            </div>
          ),
        },
        style: {
          width: LANE_W,
          height: laneH,
          background: graphBg,
          border: `2px solid ${sc.border}`,
          borderRadius: 24,
          padding: "18px 18px 16px",
          pointerEvents: "none",
          boxShadow: "none",
        },
      };
      runningY += laneH + LANE_PAD;
      return laneNode;
    });
  }, [combos, courses, graphDark, semColors]);

  // Build course positions
  const coursePositions = useMemo(() => {
    const positions = new Map<string, { x: number; y: number }>();
    let runningY = 0;

    combos.forEach((key) => {
      const [sem, yr] = key.split("-") as [SemesterType, string];
      const inLane = courses.filter((c) => c.semester === sem && String(c.year) === yr);
      const cols = inLane.length <= 1 ? 1 : inLane.length <= 4 ? 2 : 3;
      const rows = Math.max(1, Math.ceil((inLane.length || 1) / cols));
      const laneH = Math.max(250, START_Y + rows * NODE_H + (rows - 1) * ROW_GAP + 46);

      inLane.forEach((c, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const totalRowWidth = cols * NODE_W + (cols - 1) * H_GAP;
        const startX = LANE_X + SIDE_PAD + Math.max(0, (LANE_W - SIDE_PAD * 2 - totalRowWidth) / 2);
        positions.set(c.id, {
          x: startX + col * (NODE_W + H_GAP),
          y: runningY + START_Y + row * (NODE_H + ROW_GAP),
        });
      });
      runningY += laneH + LANE_PAD;
    });
    return positions;
  }, [courses, combos]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Rebuild nodes whenever courses change
  useEffect(() => {
    const courseNodes: Node[] = courses.map((c) => ({
      id: c.id,
      type: "course",
      position: coursePositions.get(c.id) ?? { x: 100, y: 100 },
      data: { ...c, onDelete: onDeleteCourse, semColors, graphDark },
      zIndex: 10,
    }));
    setNodes([...laneNodes, ...courseNodes]);
  }, [courses, laneNodes, coursePositions, onDeleteCourse, setNodes, semColors, graphDark]);

  useEffect(() => {
    setTimeout(() => fitView({ padding: 0.1, duration: 400 }), 80);
  }, [laneNodes.length, fitView]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);
      const sourceY = sourceNode?.position?.y ?? 0;
      const targetY = targetNode?.position?.y ?? 0;
      const shouldSwap = sourceY < targetY;

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            source: shouldSwap ? params.target : params.source,
            target: shouldSwap ? params.source : params.target,
            type: "smoothstep",
            animated: true,
            style: { stroke: graphDark ? "rgba(255,255,255,0.95)" : "rgba(30,30,80,0.80)", strokeWidth: 2.6 },
            markerEnd: { type: MarkerType.ArrowClosed, color: graphDark ? "rgba(255,255,255,0.95)" : "rgba(30,30,80,0.80)", width: 20, height: 20 },
          },
          eds
        )
      );
    },
    [setEdges, graphDark, nodes]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges]
  );

  const graphBgColor = graphDark ? "#090d1a" : "#e8edf5";
  const bgColor = graphDark ? "#1a2235" : "#c8d0e0";

  if (courses.length === 0) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          padding: 40,
          position: "relative",
          background: graphBgColor,
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `radial-gradient(circle, ${graphDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} 1px, transparent 1px)`,
            backgroundSize: "28px 28px", pointerEvents: "none",
          }}
        />
        <div style={{
          width: 68, height: 68, borderRadius: 18,
          background: graphDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
          border: `1px solid ${graphDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.14)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={graphDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.40)"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/>
            <rect x="9" y="15" width="6" height="6" rx="1"/>
            <path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9"/><line x1="12" y1="12" x2="12" y2="15"/>
          </svg>
        </div>
        <div style={{ textAlign: "center", position: "relative" }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 950, color: graphDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.70)" }}>
            No courses yet
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: graphDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.40)", maxWidth: 320, lineHeight: 1.65 }}>
            Add courses on the left panel. Then drag{" "}
            <strong style={{ color: graphDark ? "rgba(255,255,255,0.60)" : "rgba(0,0,0,0.60)" }}>handles</strong> between nodes to create prerequisite arrows.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={graphRef} style={{ width: "100%", height: "100%" }} className={graphDark ? "" : "graph-light"}>
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onEdgeClick={onEdgeClick}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.18 }}
      proOptions={{ hideAttribution: true }}
      deleteKeyCode={null}
      style={{ background: graphBgColor }}
    >
      <Background color={bgColor} gap={22} size={1} />
      <Controls />
      <MiniMap
        nodeColor={(n) => n.id.startsWith("lane-") ? "rgba(255,255,255,0.03)" : "#A80532"}
        maskColor={graphDark ? "rgba(0,0,0,0.60)" : "rgba(200,210,230,0.60)"}
        style={{ background: graphDark ? "#0a0f1e" : "#d0d8e8", border: `1px solid ${graphDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)"}`, borderRadius: 10 }}
      />
      <Panel position="bottom-center">
        <div style={{
          background: graphDark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)",
          border: `1px solid ${graphDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`, borderRadius: 20,
          padding: "6px 14px", fontSize: 11, color: graphDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", fontWeight: 600,
        }}>
          Drag node handles to connect prerequisites · Click an edge to remove it
        </div>
      </Panel>
    </ReactFlow>
    </div>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────

export default function BYOPlanner() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [connectMode, setConnectMode] = useState<"prereq-chain" | "independent">("prereq-chain");
  const [graphDark, setGraphDark] = useState(true);

  // Semester block colors (user-customizable)
  const [semColors, setSemColors] = useState<Record<SemesterType, { bg: string; border: string; text: string; badge: string }>>({
    ...DEFAULT_SEMESTER_COLORS,
  });

  const lastAddedId = useRef<string | null>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleFormChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCourse = () => {
    if (!form.courseId.trim()) return;
    const newId = genId();
    const defaultCard = semColors[form.semester] || DEFAULT_SEMESTER_COLORS.Fall;
    const newCourse: CourseData = {
      id: newId,
      courseId: (form.courseId ?? "").trim().toUpperCase(),
      courseName: (form.courseName ?? "").trim(),
      units: Number(form.units) || 0,
      tag: form.tag,
      semester: form.semester,
      year: Number(form.year),
      cardColor: form.cardColor || defaultCard.bg,
      cardTextColor: form.cardTextColor || defaultCard.text,
      pillColor: form.pillColor || getDeptColor(form.courseId || "DEFAULT"),
      pillTextColor: form.pillTextColor || "#ffffff",
    };
    setCourses((prev) => [...prev, newCourse]);

    if (connectMode === "prereq-chain") {
      lastAddedId.current = newId;
    } else {
      lastAddedId.current = null;
    }

    const nextDefault = semColors[form.semester] || DEFAULT_SEMESTER_COLORS.Fall;
    setForm((prev) => ({
      ...prev,
      courseId: "",
      courseName: "",
      units: 3,
      cardColor: prev.cardColor || nextDefault.bg,
      cardTextColor: prev.cardTextColor || nextDefault.text,
      pillColor: prev.pillColor || getDeptColor("DEFAULT"),
      pillTextColor: prev.pillTextColor || "#ffffff",
    }));
  };

  const handleDeleteCourse = useCallback((id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    if (lastAddedId.current === id) lastAddedId.current = null;
  }, []);

  const savePdf = useCallback(async () => {
    const el = graphRef.current;
    if (!el || courses.length === 0) return;
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
      const h2c = (window as any).html2canvas;
      const { jsPDF } = (window as any).jspdf;
      const canvas = await h2c(el, { backgroundColor: graphDark ? "#090d1a" : "#e8edf5", scale: 2, useCORS: true, logging: false });
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const m = 8;
      const ratio = Math.min((pw - m * 2) / canvas.width, (ph - m * 2 - 14) / canvas.height);
      pdf.setFontSize(11);
      pdf.text("Build Your Own Degree Plan", m, m + 6);
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", m, m + 14, canvas.width * ratio, canvas.height * ratio);
      pdf.save("build-your-own-degree-plan.pdf");
    } catch (err: any) {
      alert("PDF export failed: " + (err?.message ?? "unknown"));
    } finally {
      setPdfLoading(false);
    }
  }, [courses.length, graphDark]);

  const totalUnits = courses.reduce((s, c) => s + (c.units || 0), 0);
  const semGroups = useMemo(() => {
    const m = new Map<string, CourseData[]>();
    courses.forEach((c) => {
      const k = `${c.semester} ${c.year}`;
      m.set(k, [...(m.get(k) ?? []), c]);
    });
    return m;
  }, [courses]);

  const updateSemColor = (sem: SemesterType, field: "bg" | "border" | "text" | "badge", value: string) => {
    setSemColors((prev) => ({
      ...prev,
      [sem]: { ...prev[sem], [field]: value },
    }));
  };

  const [showSemColorPicker, setShowSemColorPicker] = useState<SemesterType | null>(null);

  return (
    <ReactFlowProvider>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>

        {/* ── Top Bar ── */}
        <div style={{
          position: "sticky", top: 0, zIndex: 40,
          borderBottom: "1px solid rgba(255,255,255,0.11)",
          background: "rgba(120,0,35,0.72)", backdropFilter: "blur(14px)",
          padding: "0 24px",
          display: "flex", alignItems: "center", gap: 12, height: 58,
          flexShrink: 0,
        }}>
          <Link
            href="/academics"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              color: "rgba(255,255,255,0.78)", textDecoration: "none",
              fontSize: 13, fontWeight: 700,
              padding: "5px 12px",
              border: "1px solid rgba(255,255,255,0.20)",
              borderRadius: 999,
              transition: "background 0.14s",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Academics
          </Link>

          <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 16 }}>/</span>

          <Link
            href="/academics/smart-planner"
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              color: "rgba(255,255,255,0.78)", textDecoration: "none",
              fontSize: 14, fontWeight: 800,
              transition: "color 0.14s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 3 3 15l6 1 1 5 5-8"/><path d="M9 9l5.5 5.5"/>
            </svg>
            Smart Planner
          </Link>

          <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 16 }}>/</span>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.90)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <span style={{ fontWeight: 950, fontSize: 16, color: "#fff", letterSpacing: "0.01em" }}>
              Build Your Own
            </span>
            <span style={{
              background: "rgba(255,255,255,0.13)",
              border: "1px solid rgba(255,255,255,0.26)",
              color: "#fff", borderRadius: 999, padding: "2px 8px",
              fontSize: 10, fontWeight: 800, letterSpacing: "0.07em",
            }}>
              CUSTOM
            </span>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            {/* Graph Dark/Light toggle */}
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
            {courses.length > 0 && (
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", fontWeight: 600 }}>
                {courses.length} course{courses.length !== 1 ? "s" : ""} · {totalUnits} units
              </span>
            )}
            <button className="byop-ghost-btn" onClick={savePdf} disabled={pdfLoading || courses.length === 0}>
              {pdfLoading ? "Exporting…" : "Save PDF"}
            </button>
            {courses.length > 0 && (
              <button
                className="byop-ghost-btn"
                onClick={() => { setCourses([]); lastAddedId.current = null; }}
                style={{ fontSize: 11 }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                </svg>
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* ── Body: Panel + Canvas ── */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden", height: "calc(100vh - 58px)" }}>

          {/* ── LEFT PANEL ── */}
          <div className="byop-panel">

            <div>
              <p className="byop-section-title">Add Course</p>
            </div>

            {/* Course ID */}
            <div>
              <label className="byop-label">Course ID</label>
              <input
                className="byop-field"
                placeholder="e.g. COMP 440"
                value={form.courseId ?? ""}
                onChange={(e) => handleFormChange("courseId", e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddCourse(); }}
              />
            </div>

            {/* Course Name */}
            <div>
              <label className="byop-label">Course Name</label>
              <input
                className="byop-field"
                placeholder="e.g. Database Management"
                value={form.courseName ?? ""}
                onChange={(e) => handleFormChange("courseName", e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddCourse(); }}
              />
            </div>

            {/* Units + Tag row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label className="byop-label">Units</label>
                <input
                  className="byop-field"
                  type="number"
                  min={0} max={6} step={0.5}
                  value={form.units ?? 0}
                  onChange={(e) => handleFormChange("units", e.target.value)}
                />
              </div>
              <div>
                <label className="byop-label">Type (opt.)</label>
                <select
                  className="byop-field"
                  value={form.tag ?? ""}
                  onChange={(e) => handleFormChange("tag", e.target.value as CourseData["tag"])}
                >
                  <option value="">—</option>
                  <option value="Lecture">Lecture</option>
                  <option value="Lab">Lab</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>

            {/* Semester dropdown — includes all semesters including Winter/Summer */}
            <div>
              <label className="byop-label">Semester</label>
              <select
                className="byop-field"
                value={`${form.semester ?? "Fall"}-${form.year ?? new Date().getFullYear()}`}
                onChange={(e) => {
                  const [sem, yr] = e.target.value.split("-");
                  handleFormChange("semester", sem as SemesterType);
                  handleFormChange("year", Number(yr));
                }}
              >
                {ALL_SEMESTERS.map((s) => (
                  <option key={`${s.type}-${s.year}`} value={`${s.type}-${s.year}`}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Link mode */}
            <div>
              <label className="byop-label">Add Mode</label>
              <div className="byop-toggle-row">
                <button
                  className={`byop-toggle-btn${connectMode === "prereq-chain" ? " on" : ""}`}
                  onClick={() => setConnectMode("prereq-chain")}
                  title="Each new course chains off the last"
                >
                  ⛓ Chain
                </button>
                <button
                  className={`byop-toggle-btn${connectMode === "independent" ? " on" : ""}`}
                  onClick={() => setConnectMode("independent")}
                  title="Add as standalone node"
                >
                  ＋ Solo
                </button>
              </div>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", margin: "5px 0 0", lineHeight: 1.5 }}>
                {connectMode === "prereq-chain"
                  ? "Courses chain together in order. Drag handles to relink."
                  : "Add as independent node. Manually drag handles to link."}
              </p>
            </div>

            {/* Course Appearance */}
            <div>
              <label className="byop-label">Course Colors</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {(["cardColor", "cardTextColor", "pillColor", "pillTextColor"] as const).map((field) => (
                  <div key={field}>
                    <label className="byop-label" style={{ marginBottom: 6 }}>
                      {field === "cardColor" ? "Card Color" : field === "cardTextColor" ? "Card Text" : field === "pillColor" ? "Pill Color" : "Pill Text"}
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="color"
                        value={(form as any)[field] ?? "#ffffff"}
                        onChange={(e) => handleFormChange(field, e.target.value)}
                        style={{ width: 42, height: 32, border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
                      />
                      <input
                        className="byop-field"
                        value={(form as any)[field] ?? "#ffffff"}
                        onChange={(e) => handleFormChange(field, e.target.value || "#ffffff")}
                        style={{ fontSize: 12, padding: "7px 10px" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Semester block colors */}
            <div>
              <label className="byop-label">Semester Block Colors</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(["Fall", "Winter", "Spring", "Summer"] as SemesterType[]).map((sem) => (
                  <div key={sem} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => setShowSemColorPicker(showSemColorPicker === sem ? null : sem)}
                      style={{
                        flex: 1,
                        display: "flex", alignItems: "center", gap: 8,
                        background: `${semColors[sem].bg}cc`,
                        border: `1.5px solid ${semColors[sem].border}`,
                        borderRadius: 8, padding: "6px 10px",
                        cursor: "pointer", color: semColors[sem].text,
                        fontSize: 11, fontWeight: 800,
                        transition: "opacity 0.14s",
                      }}
                    >
                      <span style={{ width: 12, height: 12, borderRadius: 3, background: semColors[sem].border, flexShrink: 0 }} />
                      {sem}
                      <svg style={{ marginLeft: "auto" }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points={showSemColorPicker === sem ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/></svg>
                    </button>
                  </div>
                ))}

                {/* Color picker panel for selected semester */}
                {showSemColorPicker && (
                  <div style={{
                    background: "rgba(0,0,0,0.35)", borderRadius: 10, padding: "10px 12px",
                    border: "1px solid rgba(255,255,255,0.12)", marginTop: 2,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: "rgba(255,255,255,0.50)", textTransform: "uppercase", marginBottom: 8 }}>
                      {showSemColorPicker} Colors
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {([["bg", "Background"], ["border", "Border"]] as [keyof typeof DEFAULT_SEMESTER_COLORS.Fall, string][]).map(([field, label]) => (
                        <div key={field}>
                          <label className="byop-label" style={{ marginBottom: 4 }}>{label}</label>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input
                              type="color"
                              value={semColors[showSemColorPicker][field]}
                              onChange={(e) => updateSemColor(showSemColorPicker, field, e.target.value)}
                              style={{ width: 36, height: 28, border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
                            />
                            <input
                              className="byop-field"
                              value={semColors[showSemColorPicker][field]}
                              onChange={(e) => updateSemColor(showSemColorPicker, field, e.target.value)}
                              style={{ fontSize: 11, padding: "5px 8px" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      className="byop-ghost-btn"
                      onClick={() => setSemColors((prev) => ({ ...prev, [showSemColorPicker]: { ...DEFAULT_SEMESTER_COLORS[showSemColorPicker] } }))}
                      style={{ marginTop: 8, fontSize: 10, padding: "4px 10px" }}
                    >
                      Reset to default
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Add button */}
            <button
              className="byop-add-btn"
              onClick={handleAddCourse}
              disabled={!form.courseId.trim()}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Course
            </button>

            <hr className="byop-divider" />

            {/* Course list by semester */}
            {courses.length > 0 && (
              <div>
                <p className="byop-section-title" style={{ marginBottom: 8 }}>
                  Added Courses ({courses.length})
                </p>
                <div className="byop-course-list">
                  {Array.from(semGroups.entries()).map(([sem, cs]) => (
                    <div key={sem}>
                      <div style={{
                        fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.38)",
                        letterSpacing: "0.08em", textTransform: "uppercase",
                        marginBottom: 4, marginTop: 6,
                      }}>{sem}</div>
                      {cs.map((c) => {
                        const sc = semColors[c.semester] || DEFAULT_SEMESTER_COLORS.Fall;
                        return (
                          <div key={c.id} className="byop-course-pill" style={{ background: `${c.cardColor || sc.bg}88`, borderColor: `${sc.border}88` }}>
                            <span style={{
                              background: c.pillColor || getDeptColor(c.courseId),
                              color: c.pillTextColor || "#fff", borderRadius: 5, padding: "1px 6px",
                              fontSize: 10, fontWeight: 800, whiteSpace: "nowrap",
                            }}>
                              {c.courseId}
                            </span>
                            <span style={{ flex: 1, fontSize: 11, color: c.cardTextColor || sc.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.courseName || "—"}
                            </span>
                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>
                              {c.units}u
                            </span>
                            <button
                              onClick={() => handleDeleteCourse(c.id)}
                              style={{
                                background: "none", border: "none", cursor: "pointer",
                                color: "rgba(255,255,255,0.30)", fontSize: 15,
                                padding: 0, display: "flex", alignItems: "center",
                                transition: "color 0.12s",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.30)")}
                            >×</button>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {courses.length === 0 && (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", lineHeight: 1.6, textAlign: "center", padding: "12px 0" }}>
                No courses added yet.<br />Fill the form above and click <strong style={{ color: "rgba(255,255,255,0.50)" }}>Add Course</strong>.
              </div>
            )}
          </div>

          {/* ── RIGHT: Graph Canvas ── */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <PlannerCanvas
              courses={courses}
              onDeleteCourse={handleDeleteCourse}
              graphRef={graphRef}
              graphDark={graphDark}
              semColors={semColors}
            />
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
