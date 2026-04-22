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

// ─── Color palette per semester ───────────────────────────────────────────────

const SEMESTER_COLORS: Record<SemesterType, { bg: string; border: string; text: string; badge: string }> = {
  Fall:   { bg: "#1a0a3e", border: "#7c3aed", text: "#c4b5fd", badge: "#7c3aed" },
  Spring: { bg: "#0a2e1a", border: "#16a34a", text: "#86efac", badge: "#16a34a" },
  Summer: { bg: "#2e1a00", border: "#d97706", text: "#fcd34d", badge: "#d97706" },
  Winter: { bg: "#0a1f2e", border: "#0284c7", text: "#7dd3fc", badge: "#0284c7" },
};

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

// ─── CSUN semester options ────────────────────────────────────────────────────

const CSUN_SEMESTERS: { label: string; type: SemesterType; year: number }[] = (() => {
  const out = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y <= currentYear + 5; y++) {
    out.push({ label: `Fall ${y}`,   type: "Fall"   as SemesterType, year: y });
    out.push({ label: `Spring ${y}`, type: "Spring" as SemesterType, year: y });
    out.push({ label: `Summer ${y}`, type: "Summer" as SemesterType, year: y });
    out.push({ label: `Winter ${y}`, type: "Winter" as SemesterType, year: y });
  }
  return out;
})();

// ─── Custom Course Node ───────────────────────────────────────────────────────

function CourseNode({ data, selected }: { data: CourseData & { onDelete: (id: string) => void }; selected?: boolean }) {
  const sc = SEMESTER_COLORS[data.semester] || SEMESTER_COLORS.Fall;
  const cardColor = data.cardColor || sc.bg;
  const cardTextColor = data.cardTextColor || sc.text || "#ffffff";
  const pillColor = data.pillColor || getDeptColor(data.courseId);
  const pillTextColor = data.pillTextColor || "#ffffff";

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${cardColor} 0%, rgba(15,23,42,0.96) 100%)`,
        border: `1.5px solid ${selected ? "#ffffff" : sc.border}`,
        borderRadius: 14,
        padding: "10px 14px",
        width: 300,
        cursor: "grab",
        boxShadow: selected
          ? `0 0 0 2px rgba(255,255,255,0.35), 0 12px 32px rgba(0,0,0,0.48)`
          : `0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset`,
        transition: "box-shadow 0.2s, border-color 0.2s",
        position: "relative",
        userSelect: "none",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#ffffff", width: 10, height: 10, border: "2px solid rgba(255,255,255,0.28)" }}
      />

      <button
        onClick={(e) => { e.stopPropagation(); data.onDelete(data.id); }}
        title="Remove course"
        style={{
          position: "absolute", top: 6, right: 6,
          background: "rgba(255,255,255,0.08)", border: "none",
          borderRadius: 6, width: 20, height: 20,
          color: "rgba(255,255,255,0.50)", fontSize: 13, cursor: "pointer",
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
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.70)", fontWeight: 700 }}>
            {data.units}u
          </span>
        )}
        {data.tag && (
          <span style={{
            fontSize: 9, padding: "1px 5px",
            background: "rgba(255,255,255,0.10)", borderRadius: 4,
            color: "rgba(255,255,255,0.72)", fontWeight: 700, letterSpacing: "0.05em",
          }}>
            {data.tag.toUpperCase()}
          </span>
        )}
      </div>

      <div style={{
        fontSize: 12.5, color: cardTextColor, fontWeight: 800,
        lineHeight: 1.35, marginBottom: 6, paddingRight: 16,
      }}>
        {data.courseName || "Untitled Course"}
      </div>

      <div style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        background: `${sc.badge}22`,
        border: `1px solid ${sc.badge}55`,
        borderRadius: 6, padding: "2px 7px",
        fontSize: 10, color: cardTextColor, fontWeight: 700,
      }}>
        {data.semester} {data.year}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#ffffff", width: 10, height: 10, border: "2px solid rgba(255,255,255,0.28)" }}
      />
    </div>
  );
}

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
  .react-flow__controls { background: rgba(255,255,255,0.07) !important; border: 1px solid rgba(255,255,255,0.12) !important; border-radius: 10px !important; }
  .react-flow__controls-button { background: transparent !important; border-bottom: 1px solid rgba(255,255,255,0.09) !important; fill: rgba(255,255,255,0.72) !important; }
  .react-flow__controls-button:hover { background: rgba(255,255,255,0.10) !important; }
  .react-flow__minimap { border: 1px solid rgba(255,255,255,0.10) !important; border-radius: 10px !important; }
  .react-flow__edge-path { stroke: rgba(255,255,255,0.95) !important; stroke-width: 2.4 !important; }
  .react-flow__edge.animated path { stroke-dasharray: 6 6; }
  .react-flow__connection-line { stroke: rgba(255,255,255,0.95) !important; stroke-width: 2.4 !important; }
`;

// ─── Inner canvas component (needs useReactFlow inside provider) ──────────────

function PlannerCanvas({
  courses,
  onDeleteCourse,
  includeWinter,
  includeSummer,
  graphRef,
}: {
  courses: CourseData[];
  onDeleteCourse: (id: string) => void;
  includeWinter: boolean;
  includeSummer: boolean;
  graphRef?: React.RefObject<HTMLDivElement | null>;
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

  // Build semester order

  const combos = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => set.add(`${c.semester}-${c.year}`));
    if (set.size === 0) {
      const y = new Date().getFullYear();
      set.add(`Fall-${y}`); set.add(`Spring-${y}`);
    }
    return Array.from(set).sort((a, b) => {
      const [sa, ya] = a.split("-");
      const [sb, yb] = b.split("-");
      const order: Record<string, number> = { Winter: 0, Spring: 1, Summer: 2, Fall: 3 };
      if (ya !== yb) return Number(ya) - Number(yb);
      return (order[sa] ?? 0) - (order[sb] ?? 0);
    });
  }, [courses]);


  // Build lane background nodes
  const laneNodes: Node[] = useMemo(() => {
    let runningY = 0;
    return combos.map((key) => {
      const [sem, yr] = key.split("-") as [SemesterType, string];
      const sc = SEMESTER_COLORS[sem] || SEMESTER_COLORS.Fall;
      const inLane = courses.filter((c) => c.semester === sem && String(c.year) === yr);
      const totalUnits = inLane.reduce((s, c) => s + (c.units || 0), 0);
      const cols = Math.max(1, Math.min(3, Math.ceil(Math.sqrt(inLane.length || 1))));
      const rows = Math.max(1, Math.ceil((inLane.length || 1) / cols));
      const laneH = Math.max(250, START_Y + rows * NODE_H + (rows - 1) * ROW_GAP + 46);

      const laneNode = {
        id: `lane-${key}`,
        type: "default",
        position: { x: LANE_X, y: runningY },
        selectable: false,
        draggable: false,
        data: {
          label: (
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 950, fontSize: 15, color: sc.text, letterSpacing: "0.04em" }}>
                {sem.toUpperCase()} {yr}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.44)", fontWeight: 700, marginTop: 3 }}>
                {totalUnits} units
              </div>
            </div>
          ),
        },
        style: {
          width: LANE_W,
          height: laneH,
          background: `linear-gradient(180deg, ${sc.bg}dd 0%, rgba(10,10,20,0.62) 100%)`,
          border: `1px solid ${sc.border}55`,
          borderRadius: 24,
          padding: "18px 18px 16px",
          pointerEvents: "none",
        },
      };
      runningY += laneH + LANE_PAD;
      return laneNode;
    });
  }, [combos, courses]);

  // Build course nodes
  const coursePositions = useMemo(() => {
    const positions = new Map<string, { x: number; y: number }>();
    const laneY = new Map<string, number>();
    let runningY = 0;

    combos.forEach((key) => {
      const inLane = courses.filter((c) => `${c.semester}-${c.year}` === key);
      const cols = Math.max(1, Math.min(3, Math.ceil(Math.sqrt(inLane.length || 1))));
      const rows = Math.max(1, Math.ceil((inLane.length || 1) / cols));
      const laneH = Math.max(250, START_Y + rows * NODE_H + (rows - 1) * ROW_GAP + 46);
      laneY.set(key, runningY);
      runningY += laneH + LANE_PAD;

      inLane.forEach((c, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const totalRowWidth = cols * NODE_W + (cols - 1) * H_GAP;
        const startX = LANE_X + SIDE_PAD + Math.max(0, (LANE_W - SIDE_PAD * 2 - totalRowWidth) / 2);
        positions.set(c.id, {
          x: startX + col * (NODE_W + H_GAP),
          y: runningY - (laneH + LANE_PAD) + START_Y + row * (NODE_H + ROW_GAP),
        });
      });
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
      data: { ...c, onDelete: onDeleteCourse },
      zIndex: 10,
    }));
    setNodes([...laneNodes, ...courseNodes]);
  }, [courses, laneNodes, coursePositions, onDeleteCourse, setNodes]);

  useEffect(() => {
    setTimeout(() => fitView({ padding: 0.1, duration: 400 }), 80);
  }, [laneNodes.length, fitView]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            animated: true,
            style: { stroke: "rgba(255,255,255,0.95)", strokeWidth: 2.6 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(255,255,255,0.95)", width: 20, height: 20 },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges]
  );

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
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "28px 28px", pointerEvents: "none",
          }}
        />
        <div style={{
          width: 68, height: 68, borderRadius: 18,
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/>
            <rect x="9" y="15" width="6" height="6" rx="1"/>
            <path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9"/><line x1="12" y1="12" x2="12" y2="15"/>
          </svg>
        </div>
        <div style={{ textAlign: "center", position: "relative" }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 950, color: "rgba(255,255,255,0.78)" }}>
            No courses yet
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(255,255,255,0.38)", maxWidth: 320, lineHeight: 1.65 }}>
            Add courses on the left panel. Then drag{" "}
            <strong style={{ color: "rgba(255,255,255,0.60)" }}>handles</strong> between nodes to create prerequisite arrows.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={graphRef} style={{ width: "100%", height: "100%" }}>
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
      style={{ background: "#090d1a" }}
    >
      <Background color="#1a2235" gap={22} size={1} />
      <Controls />
      <MiniMap
        nodeColor={(n) => n.id.startsWith("lane-") ? "rgba(255,255,255,0.03)" : "#A80532"}
        maskColor="rgba(0,0,0,0.60)"
        style={{ background: "#0a0f1e", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10 }}
      />
      <Panel position="bottom-center">
        <div style={{
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20,
          padding: "6px 14px", fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 600,
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
  const [includeWinter, setIncludeWinter] = useState(false);
  const [includeSummer, setIncludeSummer] = useState(false);
  const [connectMode, setConnectMode] = useState<"prereq-chain" | "independent">("prereq-chain");

  // Queue-chain: track last added course id for auto-prereq-chaining
  const lastAddedId = useRef<string | null>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleFormChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCourse = () => {
    if (!form.courseId.trim()) return;
    const newId = genId();
    const defaultCard = SEMESTER_COLORS[form.semester] || SEMESTER_COLORS.Fall;
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

    const nextDefault = SEMESTER_COLORS[form.semester] || SEMESTER_COLORS.Fall;
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
      const canvas = await h2c(el, { backgroundColor: "#090d1a", scale: 2, useCORS: true, logging: false });
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
  }, [courses.length]);

  const totalUnits = courses.reduce((s, c) => s + (c.units || 0), 0);
  const semGroups = useMemo(() => {
    const m = new Map<string, CourseData[]>();
    courses.forEach((c) => {
      const k = `${c.semester} ${c.year}`;
      m.set(k, [...(m.get(k) ?? []), c]);
    });
    return m;
  }, [courses]);

  const visibleSemesters = useMemo(() => {
    return CSUN_SEMESTERS.filter((s) => {
      if (s.type === "Winter" && !includeWinter) return false;
      if (s.type === "Summer" && !includeSummer) return false;
      return true;
    });
  }, [includeWinter, includeSummer]);

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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.90)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              background: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.26)",
              color: "#fff", borderRadius: 999, padding: "2px 8px",
              fontSize: 10, fontWeight: 800, letterSpacing: "0.07em",
            }}>
              CUSTOM
            </span>
          </div>

          <Link
            href="/academics/smart-planner"
            className="byop-ghost-btn"
            style={{ textDecoration: "none" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Dynamic Builder
          </Link>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
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

            {/* Section: Add Course */}
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

            {/* Semester dropdown */}
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
                {visibleSemesters.map((s) => (
                  <option key={`${s.type}-${s.year}`} value={`${s.type}-${s.year}`}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional semester toggles */}
            <div style={{ display: "flex", gap: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, color: "rgba(255,255,255,0.70)", fontWeight: 600 }}>
                <input type="checkbox" checked={includeWinter} onChange={(e) => setIncludeWinter(e.target.checked)} style={{ accentColor: "#fff" }} />
                Winter
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, color: "rgba(255,255,255,0.70)", fontWeight: 600 }}>
                <input type="checkbox" checked={includeSummer} onChange={(e) => setIncludeSummer(e.target.checked)} style={{ accentColor: "#fff" }} />
                Summer
              </label>
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

            {/* Appearance */}
            <div>
              <label className="byop-label">Course Colors</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label className="byop-label" style={{ marginBottom: 6 }}>Card Color</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="color"
                      value={form.cardColor ?? "#1a0a3e"}
                      onChange={(e) => handleFormChange("cardColor", e.target.value)}
                      style={{ width: 42, height: 32, border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
                    />
                    <input
                      className="byop-field"
                      value={form.cardColor ?? "#1a0a3e"}
                      onChange={(e) => handleFormChange("cardColor", e.target.value || "#1a0a3e")}
                      placeholder="#1a0a3e"
                      style={{ fontSize: 12, padding: "7px 10px" }}
                    />
                  </div>
                </div>
                <div>
                  <label className="byop-label" style={{ marginBottom: 6 }}>Card Text</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="color"
                      value={form.cardTextColor ?? "#e9ddff"}
                      onChange={(e) => handleFormChange("cardTextColor", e.target.value)}
                      style={{ width: 42, height: 32, border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
                    />
                    <input
                      className="byop-field"
                      value={form.cardTextColor ?? "#e9ddff"}
                      onChange={(e) => handleFormChange("cardTextColor", e.target.value || "#e9ddff")}
                      placeholder="#e9ddff"
                      style={{ fontSize: 12, padding: "7px 10px" }}
                    />
                  </div>
                </div>
                <div>
                  <label className="byop-label" style={{ marginBottom: 6 }}>Pill Color</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="color"
                      value={form.pillColor ?? getDeptColor(form.courseId || "DEFAULT")}
                      onChange={(e) => handleFormChange("pillColor", e.target.value)}
                      style={{ width: 42, height: 32, border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
                    />
                    <input
                      className="byop-field"
                      value={form.pillColor ?? getDeptColor(form.courseId || "DEFAULT")}
                      onChange={(e) => handleFormChange("pillColor", e.target.value || getDeptColor(form.courseId || "DEFAULT"))}
                      placeholder="#7c3aed"
                      style={{ fontSize: 12, padding: "7px 10px" }}
                    />
                  </div>
                </div>
                <div>
                  <label className="byop-label" style={{ marginBottom: 6 }}>Pill Text</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="color"
                      value={form.pillTextColor ?? "#ffffff"}
                      onChange={(e) => handleFormChange("pillTextColor", e.target.value)}
                      style={{ width: 42, height: 32, border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
                    />
                    <input
                      className="byop-field"
                      value={form.pillTextColor ?? "#ffffff"}
                      onChange={(e) => handleFormChange("pillTextColor", e.target.value || "#ffffff")}
                      placeholder="#ffffff"
                      style={{ fontSize: 12, padding: "7px 10px" }}
                    />
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", margin: "6px 0 0", lineHeight: 1.5 }}>
                Card colors style the whole course card. Pill colors only style the course ID badge.
              </p>
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
                        const sc = SEMESTER_COLORS[c.semester] || SEMESTER_COLORS.Fall;
                        return (
                          <div key={c.id} className="byop-course-pill" style={{ background: `${c.cardColor || sc.bg}55`, borderColor: `${(SEMESTER_COLORS[c.semester] || SEMESTER_COLORS.Fall).border}55` }}>
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
              includeWinter={includeWinter}
              includeSummer={includeSummer}
              graphRef={graphRef}
            />
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
