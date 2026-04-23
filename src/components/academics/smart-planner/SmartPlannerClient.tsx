"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ReactFlow,
  Background,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  Position,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Types
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
};

type SkillTreeResponse = {
  majorName: string;
  catalogYear: string;
  matchedRoadmap: { title: string; url: string };
  semesters: Array<{ tierIndex: number; label: string; totalUnits: number; courseKeys: string[] }>;
  nodes: SkillTreeNode[];
  edges: Array<{ from: string; to: string }>;
  electiveOptions?: ElectiveOption[];
  debug?: any;
};

// API helper functions for fetching the skill tree data and related info from the backend. These will be used to power the "Build Roadmap" functionality and fetch the necessary data to render the graph and elective options. They are defined here as internal details of the SmartPlannerClient component, but could be moved to a separate module if needed for reuse or organization.

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}
async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

// utils for parsing and normalizing course keys, elective options, and building the graph layout. These are all internal details that won't affect the overall structure of the component, but are necessary for processing the data and rendering the graph correctly.

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
function shadeForBand(levelBand: number) {
  if (levelBand >= 500) return 0.45;
  if (levelBand >= 400) return 0.55;
  if (levelBand >= 300) return 0.65;
  if (levelBand >= 200) return 0.75;
  return 0.85;
}
function resolveNodeColor(deptColor: string, shade: number): string {
  const match = deptColor.match(/hsl\((\d+),(\d+)%,(\d+)%\)/);
  if (!match) return "#a0a0a0";
  const h = parseInt(match[1], 10);
  const s = parseInt(match[2], 10);
  const l = parseInt(match[3], 10);
  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    s /= 100; l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
  };
  const [r1, g1, b1] = hslToRgb(h, s, l);
  const t = 1 - shade;
  return `rgb(${Math.round(r1 + (255 - r1) * t)},${Math.round(g1 + (255 - g1) * t)},${Math.round(b1 + (255 - b1) * t)})`;
}

function buildTierLayout(raw: SkillTreeResponse) {
  const tiers = raw.semesters.slice().sort((a, b) => a.tierIndex - b.tierIndex);
  const depts = Array.from(new Set(raw.nodes.map((n) => n.department))).sort();
  const deptIndex = new Map<string, number>();
  depts.forEach((d, i) => deptIndex.set(d, i));

  const tierHeight = 240;
  const sectorWidth = 540;
  const yForTier = (tierIndex: number) => 80 + (tiers.length - 1 - tierIndex) * tierHeight;

  const rfNodes: Node[] = [];
  const rfEdges: Edge[] = [];

  // Tier band backgrounds
  for (const t of tiers) {
    rfNodes.push({
      id: `tier-${t.tierIndex}`,
      position: { x: 20, y: yForTier(t.tierIndex) - 60 },
      data: { label: `${t.label}  ·  ${t.totalUnits} units` },
      selectable: false,
      draggable: false,
      style: {
        width: depts.length * sectorWidth - 60,
        height: tierHeight - 20,
        border: "1px solid rgba(168,5,50,0.18)",
        background: "linear-gradient(135deg, rgba(168,5,50,0.07) 0%, rgba(120,0,35,0.03) 100%)",
        color: "rgba(255,255,255,0.88)",
        borderRadius: 18,
        padding: 14,
        fontWeight: 800,
        fontSize: 13,
        letterSpacing: "0.04em",
      },
    });
  }

  // Position course nodes
  const byCell = new Map<string, SkillTreeNode[]>();
  for (const n of raw.nodes) {
    const cell = `${n.tierIndex}|${n.department}`;
    const arr = byCell.get(cell) ?? [];
    arr.push(n);
    byCell.set(cell, arr);
  }
  for (const arr of byCell.values()) arr.sort((a, b) => a.levelBand - b.levelBand || a.key.localeCompare(b.key));

  const pos = new Map<string, { x: number; y: number }>();
  for (const n of raw.nodes) {
    const dIdx = deptIndex.get(n.department) ?? 0;
    const cell = `${n.tierIndex}|${n.department}`;
    const arr = byCell.get(cell) ?? [];
    const i = arr.findIndex((x) => x.key === n.key);
    pos.set(n.key, { x: 60 + dIdx * sectorWidth + i * 220, y: yForTier(n.tierIndex) + 20 });
  }

  for (const n of raw.nodes) {
    const p = pos.get(n.key) ?? { x: 40, y: 40 };
    const shade = shadeForBand(n.levelBand);
    rfNodes.push({
      id: n.key,
      position: p,
      data: {
        label: (
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontWeight: 900, fontSize: 14 }}>{n.key.replace("-", " ")}</div>
            <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 2 }}>{n.title ?? ""}</div>
            <div style={{ fontSize: 10, opacity: 0.60, marginTop: 3 }}>
              {n.department} · {n.levelBand}s{n.units != null ? ` · ${n.units}u` : ""}
            </div>
          </div>
        ),
      },
      sourcePosition: Position.Top,
      targetPosition: Position.Bottom,
      style: {
        width: 210,
        padding: "12px 14px",
        borderRadius: 14,
        color: "#0f172a",
        border: "1.5px solid rgba(255,255,255,0.28)",
        background: resolveNodeColor(n.deptColor, shade),
        textAlign: "center",
        boxShadow: "0 8px 24px rgba(0,0,0,0.30), 0 0 0 1px rgba(255,255,255,0.07) inset",
        transition: "all 0.2s ease",
      },
    });
  }

  const nodeSet = new Set(rfNodes.map((n) => n.id));
  for (const e of raw.edges) {
    const from = normalizeCourseKey(e.from);
    const to = normalizeCourseKey(e.to);
    if (!nodeSet.has(from) || !nodeSet.has(to)) continue;
    const fromTier = raw.nodes.find((n) => n.key === from)?.tierIndex ?? 0;
    const toTier = raw.nodes.find((n) => n.key === to)?.tierIndex ?? 0;
    if (toTier < fromTier) continue;
    rfEdges.push({
      id: `${from}->${to}`,
      source: from,
      target: to,
      type: "smoothstep",
      animated: true,
      style: { stroke: "rgba(168,5,50,0.60)", strokeWidth: 2.2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(168,5,50,0.60)" },
    });
  }

  return { rfNodes, rfEdges };
}

// ─── Inline styles that match the existing BG / crimson palette ───────────────

const BG = `radial-gradient(1200px 600px at 20% 0%, rgba(255,255,255,0.10), transparent 55%),
linear-gradient(180deg, rgba(168,5,50,1) 0%, rgba(120,0,35,0.98) 55%, rgba(168,5,50,1) 100%)`;

const css = `
  @keyframes sp-spin  { to { transform: rotate(360deg) } }
  @keyframes sp-fade  { from { opacity:0; transform:translateY(5px) } to { opacity:1; transform:translateY(0) } }

  .sp-field {
    width: 100%;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.20);
    border-radius: 10px;
    color: #fff;
    padding: 9px 13px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.18s, background 0.18s;
  }
  .sp-field:focus {
    border-color: rgba(255,255,255,0.55);
    background: rgba(255,255,255,0.12);
  }
  .sp-field::placeholder { color: rgba(255,255,255,0.38); }
  .sp-field option { background: #780023; color: #fff; }

  .sp-label {
    display: block;
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.52);
    margin-bottom: 5px;
  }

  .sp-toggle {
    display: flex;
    background: rgba(0,0,0,0.18);
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 10px;
    overflow: hidden;
  }
  .sp-toggle-btn {
    flex: 1;
    padding: 8px 0;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.50);
    font-weight: 700;
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.16s;
  }
  .sp-toggle-btn.on {
    background: rgba(255,255,255,0.15);
    color: #fff;
  }

  .sp-build-btn {
    width: 100%;
    padding: 12px;
    background: rgba(0,0,0,0.75);
    color: #fff;
    border: none;
    border-radius: 12px;
    font-weight: 900;
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
    letter-spacing: 0.03em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: opacity 0.18s, transform 0.15s;
  }
  .sp-build-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .sp-build-btn:disabled { opacity: 0.40; cursor: not-allowed; }

  .sp-ghost-btn {
    padding: 7px 14px;
    background: rgba(255,255,255,0.10);
    color: rgba(255,255,255,0.85);
    border: 1px solid rgba(255,255,255,0.22);
    border-radius: 999px;
    font-weight: 800;
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .sp-ghost-btn:hover { background: rgba(255,255,255,0.18); }
  .sp-ghost-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .sp-card {
    background: rgba(255,255,255,0.95);
    border: 1px solid rgba(0,0,0,0.06);
    border-radius: 16px;
    padding: 18px 20px;
  }

  .sp-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0; right: 0;
    max-height: 230px;
    overflow-y: auto;
    background: #780023;
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 12px;
    z-index: 50;
    box-shadow: 0 16px 40px rgba(0,0,0,0.45);
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.25) transparent;
  }
  .sp-dropdown-item {
    padding: 10px 14px;
    cursor: pointer;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    transition: background 0.12s;
  }
  .sp-dropdown-item:hover { background: rgba(255,255,255,0.12); }
  .sp-dropdown-item:last-child { border-bottom: none; }

  .sp-checkbox {
    display: flex;
    align-items: center;
    gap: 7px;
    cursor: pointer;
    color: rgba(255,255,255,0.75);
    font-size: 13px;
    font-weight: 600;
  }
  .sp-checkbox input { accent-color: #fff; width: 14px; height: 14px; }

  .sp-divider {
    border: none;
    border-top: 1px solid rgba(255,255,255,0.12);
    margin: 16px 0;
  }

  .sp-stat-row {
    display: flex;
    gap: 8px;
    animation: sp-fade 0.35s ease;
  }
  .sp-stat {
    flex: 1;
    background: rgba(0,0,0,0.20);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 10px 8px;
    text-align: center;
  }
  .sp-stat-val { font-size: 22px; font-weight: 950; color: #fff; line-height: 1; }
  .sp-stat-lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: rgba(255,255,255,0.45); margin-top: 3px; text-transform: uppercase; }

  /* Override ReactFlow controls to match theme */
  .react-flow__controls { background: rgba(255,255,255,0.08) !important; border: 1px solid rgba(255,255,255,0.14) !important; border-radius: 10px !important; }
  .react-flow__controls-button { background: transparent !important; border-bottom: 1px solid rgba(255,255,255,0.10) !important; fill: rgba(255,255,255,0.75) !important; }
  .react-flow__controls-button:hover { background: rgba(255,255,255,0.10) !important; }
  .react-flow__minimap { border: 1px solid rgba(255,255,255,0.12) !important; border-radius: 12px !important; }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function SmartPlannerClient() {
  const [level, setLevel] = useState<"undergraduate" | "graduate">("undergraduate");
  const [majorInput, setMajorInput] = useState("");
  const [majorResults, setMajorResults] = useState<MajorHit[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<MajorHit | null>(null);
  const [showMajorDropdown, setShowMajorDropdown] = useState(false);
  const [catalogYear, setCatalogYear] = useState("2023");
  const [pace, setPace] = useState<"full-time" | "part-time">("full-time");
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
  const [startTerm, setStartTerm] = useState<"Fall" | "Spring" | "Summer" | "Winter">("Fall");
  const [includeSummer, setIncludeSummer] = useState(false);
  const [includeWinter, setIncludeWinter] = useState(false);
  const [completedText, setCompletedText] = useState("");
  const completedCourses = useMemo(() => parseCompletedInput(completedText), [completedText]);

  const [raw, setRaw] = useState<SkillTreeResponse | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showElectiveModal, setShowElectiveModal] = useState(false);
  const [selectedElectives, setSelectedElectives] = useState<Record<string, string>>({});
  const [electiveSearchQuery, setElectiveSearchQuery] = useState("");

  const graphRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const latestQuery = useRef(0);

  useEffect(() => {
    const q = majorInput.trim();
    setSelectedMajor(null);
    if (q.length < 2) { setMajorResults([]); return; }
    const id = ++latestQuery.current;
    const t = setTimeout(async () => {
      try {
        const qs = new URLSearchParams({ query: q, level });
        const r = await apiGet<{ results: MajorHit[] }>(`/api/academics/majors/search?${qs.toString()}`);
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

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!raw) { setNodes([]); setEdges([]); return; }
    const { rfNodes, rfEdges } = buildTierLayout(raw);
    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [raw, setNodes, setEdges]);

  async function onBuild() {
    setError(""); setStatus(""); setLoading(true);
    try {
      const majorName = selectedMajor?.name ?? majorInput.trim();
      if (!majorName) throw new Error("Enter or select a major.");
      if (!catalogYear) throw new Error("Enter a catalog year.");
      setStatus("Building your degree roadmap…");
      const out = await apiPost<SkillTreeResponse>("/api/academics/planner/skill-tree", {
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
      const h2c = (window as any).html2canvas;
      const { jsPDF } = (window as any).jspdf;
      const canvas = await h2c(el, { backgroundColor: "#0f172a", scale: 2, useCORS: true, logging: false });
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
    return raw.electiveOptions.filter((e) => !selectedElectives[e.id]);
  }, [raw, selectedElectives]);

  const totalUnits = raw?.semesters.reduce((s, t) => s + t.totalUnits, 0) ?? 0;

  return (
    <ReactFlowProvider>
      <style>{css}</style>

      {/* ── Root: same crimson gradient as AcademicsView ── */}
      <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter', system-ui, sans-serif" }}>

        {/* ── Top Bar ── */}
        <div
          style={{
            position: "sticky", top: 0, zIndex: 40,
            borderBottom: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(120,0,35,0.70)",
            backdropFilter: "blur(14px)",
            padding: "0 24px",
            display: "flex", alignItems: "center", gap: 12, height: 58,
          }}
        >
          {/* Back to Academics */}
          <Link
            href="/academics"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              color: "rgba(255,255,255,0.80)", textDecoration: "none",
              fontSize: 13, fontWeight: 700,
              padding: "5px 12px",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 999,
              transition: "background 0.15s",
            }}
          >
            {/* left-arrow */}
            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Academics
          </Link>

          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 16 }}>/</span>

          {/* Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* tree icon */}
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.90)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 3 3 15l6 1 1 5 5-8"/><path d="M9 9l5.5 5.5"/>
            </svg>
            <span style={{ fontWeight: 950, fontSize: 16, color: "#fff", letterSpacing: "0.01em" }}>
              Smart Planner
            </span>
            <span
              style={{
                background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.28)",
                color: "#fff", borderRadius: 999,
                padding: "2px 8px", fontSize: 10, fontWeight: 800, letterSpacing: "0.07em",
              }}
            >
              BETA
            </span>
          </div>

          {/* Right: PDF button + plan label */}
          {raw && (
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>
                {raw.majorName} · {raw.catalogYear}
              </span>
              <button className="sp-ghost-btn" onClick={savePdf} disabled={pdfLoading}>
                {pdfLoading
                  ? <span style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "sp-spin 0.7s linear infinite" }} />
                  : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  )
                }
                {pdfLoading ? "Exporting…" : "Save PDF"}
              </button>
            </div>
          )}
        </div>

        {/* ── Two-column layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", height: "calc(100vh - 58px)" }}>

          {/* ════════ LEFT SIDEBAR ════════ */}
          <div
            style={{
              borderRight: "1px solid rgba(255,255,255,0.10)",
              overflowY: "auto",
              padding: "22px 20px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 0,
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.20) transparent",
            }}
          >

            {/* Hero blurb */}
            <div style={{ marginBottom: 22 }}>
              <p
                style={{
                  margin: 0, fontSize: 22, fontWeight: 950, lineHeight: 1.2, color: "#fff",
                  letterSpacing: "-0.01em",
                }}
              >
                Degree Roadmap Builder
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.58)", lineHeight: 1.6 }}>
                Select your major and we'll generate a semester-by-semester prerequisite graph for your entire degree.
              </p>
            </div>

            {/* ── Level ── */}
            <div style={{ marginBottom: 14 }}>
              <span className="sp-label">Program Level</span>
              <div className="sp-toggle">
                <button className={`sp-toggle-btn ${level === "undergraduate" ? "on" : ""}`} onClick={() => setLevel("undergraduate")}>Undergrad</button>
                <button className={`sp-toggle-btn ${level === "graduate" ? "on" : ""}`} onClick={() => setLevel("graduate")}>Graduate</button>
              </div>
            </div>

            {/* ── Major ── */}
            <div style={{ marginBottom: 14, position: "relative" }}>
              <span className="sp-label">Major</span>
              <input
                className="sp-field"
                aria-label="Search major"
                value={majorInput}
                onChange={(e) => { setMajorInput(e.target.value); setShowMajorDropdown(true); }}
                onFocus={() => setShowMajorDropdown(true)}
                onBlur={() => setTimeout(() => setShowMajorDropdown(false), 150)}
                placeholder="Search: Computer Science…"
              />
              {selectedMajor && (
                <div style={{ marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.40)" }}>Selected:</span>
                  <span style={{
                    background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.28)",
                    color: "#fff", borderRadius: 999, padding: "2px 9px", fontSize: 11, fontWeight: 800,
                    display: "inline-flex", alignItems: "center", gap: 4,
                  }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {selectedMajor.name}
                  </span>
                </div>
              )}
              {showMajorDropdown && filteredMajorResults.length > 0 && (
                <div className="sp-dropdown">
                  {filteredMajorResults.map((m) => (
                    <div
                      key={m.id}
                      className="sp-dropdown-item"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setSelectedMajor(m); setMajorInput(m.name); setShowMajorDropdown(false); }}
                    >
                      <div style={{ fontWeight: 800, fontSize: 13.5, color: "#fff" }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>
                        {m.id}{m.category ? ` · ${m.category}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Catalog Year ── */}
            <div style={{ marginBottom: 14 }}>
              <span className="sp-label">Catalog Year</span>
              <input className="sp-field" aria-label="Catalog year" value={catalogYear} onChange={(e) => setCatalogYear(e.target.value)} placeholder="e.g. 2023" />
            </div>

            {/* ── Pace ── */}
            <div style={{ marginBottom: 14 }}>
              <span className="sp-label">Pace</span>
              <div className="sp-toggle">
                <button className={`sp-toggle-btn ${pace === "full-time" ? "on" : ""}`} onClick={() => setPace("full-time")}>Full-time</button>
                <button className={`sp-toggle-btn ${pace === "part-time" ? "on" : ""}`} onClick={() => setPace("part-time")}>Part-time</button>
              </div>
            </div>

            {/* ── Start term + year ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div>
                <span className="sp-label">Start Term</span>
                <select className="sp-field" aria-label="Start term" value={startTerm} onChange={(e) => setStartTerm(e.target.value as any)} style={{ padding: "8px 10px" }}>
                  {["Fall", "Spring", "Summer", "Winter"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <span className="sp-label">Start Year</span>
                <input
                  className="sp-field"
                  type="number"
                  aria-label="Start year"
                  value={startYear}
                  onChange={(e) => setStartYear(parseInt(e.target.value || String(new Date().getFullYear()), 10))}
                />
              </div>
            </div>

            {/* ── Optional semesters ── */}
            <div style={{ display: "flex", gap: 20, marginBottom: 18 }}>
              <label className="sp-checkbox"><input type="checkbox" checked={includeWinter} onChange={(e) => setIncludeWinter(e.target.checked)} /> Winter</label>
              <label className="sp-checkbox"><input type="checkbox" checked={includeSummer} onChange={(e) => setIncludeSummer(e.target.checked)} /> Summer</label>
            </div>

            <hr className="sp-divider" />

            {/* ── Completed courses ── */}
            <div style={{ marginBottom: 16 }}>
              <span className="sp-label">Completed Courses</span>
              <textarea
                className="sp-field"
                aria-label="Completed courses, comma or newline separated"
                value={completedText}
                onChange={(e) => setCompletedText(e.target.value)}
                placeholder={"COMP 110, MATH 150A\n(comma or newline separated)"}
                style={{ minHeight: 76, resize: "vertical", lineHeight: 1.55 }}
              />
              {completedCourses.length > 0 && (
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4, display: "block" }}>
                  {completedCourses.length} course{completedCourses.length !== 1 ? "s" : ""} marked complete
                </span>
              )}
            </div>

            {/* ── Pending electives warning ── */}
            {pendingElectives.length > 0 && (
              <div style={{
                background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.28)",
                borderRadius: 12, padding: "11px 14px", marginBottom: 14,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: "#fbbf24" }}>
                  {pendingElectives.length} elective{pendingElectives.length !== 1 ? "s" : ""} unset
                </span>
                <button className="sp-ghost-btn" onClick={() => setShowElectiveModal(true)} style={{ padding: "4px 10px", fontSize: 12 }}>
                  Choose
                </button>
              </div>
            )}

            {/* ── Build button ── */}
            <button className="sp-build-btn" onClick={onBuild} disabled={loading || !majorInput.trim() || !catalogYear.trim()}>
              {loading ? (
                <>
                  <span style={{ width: 14, height: 14, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "sp-spin 0.7s linear infinite" }} />
                  Building roadmap…
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  Build Roadmap
                </>
              )}
            </button>

            {/* Status / Error */}
            {status && !error && (
              <div style={{ marginTop: 9, fontSize: 13, color: "#6ee7b7", display: "flex", alignItems: "center", gap: 6, animation: "sp-fade 0.3s ease" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {status}
              </div>
            )}
            {error && (
              <div style={{ marginTop: 9, fontSize: 13, color: "#fca5a5", display: "flex", alignItems: "flex-start", gap: 6, animation: "sp-fade 0.3s ease" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}

            {/* ── Post-build stats ── */}
            {raw && (
              <>
                <hr className="sp-divider" />
                <div className="sp-stat-row">
                  <div className="sp-stat">
                    <div className="sp-stat-val">{raw.semesters.length}</div>
                    <div className="sp-stat-lbl">Semesters</div>
                  </div>
                  <div className="sp-stat">
                    <div className="sp-stat-val">{raw.nodes.length}</div>
                    <div className="sp-stat-lbl">Courses</div>
                  </div>
                  <div className="sp-stat">
                    <div className="sp-stat-val">{totalUnits}</div>
                    <div className="sp-stat-lbl">Units</div>
                  </div>
                </div>
                {raw.matchedRoadmap?.title && (
                  <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "rgba(255,255,255,0.42)", lineHeight: 1.55 }}>
                    Plan: <span style={{ color: "rgba(255,255,255,0.68)" }}>{raw.matchedRoadmap.title}</span>
                  </p>
                )}
              </>
            )}
          </div>

          {/* ════════ RIGHT: GRAPH PANEL ════════ */}
          <div style={{ position: "relative", overflow: "hidden" }}>
            {!raw ? (
              /* Empty state */
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: 40, position: "relative" }}>
                {/* dot-grid background */}
                <div aria-hidden style={{
                  position: "absolute", inset: 0,
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
                  backgroundSize: "32px 32px", pointerEvents: "none",
                }} />
                <div style={{
                  width: 68, height: 68, borderRadius: 18,
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.60)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/>
                    <rect x="9" y="15" width="6" height="6" rx="1"/>
                    <path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9"/>
                    <line x1="12" y1="12" x2="12" y2="15"/>
                  </svg>
                </div>
                <div style={{ textAlign: "center", position: "relative" }}>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 950, color: "rgba(255,255,255,0.80)" }}>
                    No roadmap built yet
                  </p>
                  <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(255,255,255,0.40)", maxWidth: 340, lineHeight: 1.65 }}>
                    Configure your major and preferences on the left, then click{" "}
                    <strong style={{ color: "rgba(255,255,255,0.65)" }}>Build Roadmap</strong> to generate your prerequisite-chained degree plan.
                  </p>
                </div>
              </div>
            ) : (
              /* React Flow */
              <div ref={graphRef} id="rf-graph-capture" style={{ height: "100%", background: "#0f172a" }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  fitView
                  fitViewOptions={{ padding: 0.32 }}
                  proOptions={{ hideAttribution: true }}
                >
                  <Background color="#1e293b" gap={18} size={1} />
                  <Controls />
                  <MiniMap
                    nodeColor={(node) => node.id.startsWith("tier-") ? "rgba(255,255,255,0.04)" : "#A80532"}
                    maskColor="rgba(0,0,0,0.65)"
                    style={{ background: "#0f172a" }}
                  />
                </ReactFlow>
              </div>
            )}
          </div>
        </div>

        {/* ════════ ELECTIVE MODAL ════════ */}
        {showElectiveModal && raw?.electiveOptions && (
          <div
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(5px)",
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowElectiveModal(false); }}
          >
            <div style={{
              background: "#5c0018", border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: 20, padding: 28, maxWidth: 560, width: "92%",
              maxHeight: "80vh", overflow: "auto", animation: "sp-fade 0.2s ease",
              scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.20) transparent",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 950, fontSize: 20, color: "#fff" }}>Choose Electives</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.50)" }}>Enter a course code for each elective slot</p>
                </div>
                <button
                  onClick={() => setShowElectiveModal(false)}
                  aria-label="Close elective chooser"
                  style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "rgba(255,255,255,0.75)", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}
                >×</button>
              </div>

              <input
                className="sp-field"
                type="text"
                aria-label="Filter electives"
                placeholder="Filter electives…"
                value={electiveSearchQuery}
                onChange={(e) => setElectiveSearchQuery(e.target.value)}
                style={{ marginBottom: 14 }}
              />

              <div style={{ display: "grid", gap: 10 }}>
                {raw.electiveOptions
                  .filter((el) => !electiveSearchQuery || el.label.toLowerCase().includes(electiveSearchQuery.toLowerCase()))
                  .map((elective) => (
                    <div key={elective.id} style={{
                      background: selectedElectives[elective.id] ? "rgba(34,197,94,0.10)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${selectedElectives[elective.id] ? "rgba(34,197,94,0.28)" : "rgba(255,255,255,0.12)"}`,
                      borderRadius: 12, padding: 14,
                    }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "#fff", marginBottom: 3 }}>{elective.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.42)", marginBottom: 9 }}>
                        {elective.category && `${elective.category} · `}{elective.semesterLabel}
                      </div>
                      <input
                        className="sp-field"
                        type="text"
                        aria-label={`Course code for ${elective.label}`}
                        placeholder="e.g. COMP 524"
                        value={selectedElectives[elective.id] || ""}
                        onChange={(e) => setSelectedElectives({ ...selectedElectives, [elective.id]: e.target.value })}
                        style={{ fontSize: 13 }}
                      />
                    </div>
                  ))}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button className="sp-build-btn" style={{ flex: 2 }} onClick={() => { setShowElectiveModal(false); onBuild(); }}>
                  Apply & Rebuild
                </button>
                <button className="sp-ghost-btn" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowElectiveModal(false)}>
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
