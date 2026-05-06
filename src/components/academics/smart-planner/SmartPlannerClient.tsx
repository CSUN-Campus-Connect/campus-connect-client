"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CSUN_CS_2023_TEST_CASE, loadCSUNTestCase } from "./CSUNCompSciTestCase";
import { PlannerCanvas } from "./SmartPlannerCanvas";
import { apiGet, apiPost } from "./smartPlannerApi";
import { BG, css } from "./smartPlannerStyles";
import type {
  CustomCourse,
  ElectiveOptionChoice,
  MajorHit,
  ManualElectiveCourse,
  SkillTreeResponse,
} from "./smartPlannerTypes";
import {
  DEPT_COLORS,
  DEFAULT_SEMESTER_COLORS,
  buildEffectiveDeptColors,
  buildTierLabel,
  dedupeMajors,
  hexToRgb,
  normalizeCourseKey,
  parseCompletedInput,
  parseElectiveUnits,
  rgbaFromHex,
  type SemesterType,
} from "./smartPlannerUtils";

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
  const [graphDark, setGraphDark] = useState(true);
  const [semColors, setSemColors] = useState<Record<SemesterType, {bg:string;border:string;textColor:string}>>({
    Fall: { bg: DEFAULT_SEMESTER_COLORS.Fall.bg, border: DEFAULT_SEMESTER_COLORS.Fall.border, textColor: DEFAULT_SEMESTER_COLORS.Fall.text },
    Winter: { bg: DEFAULT_SEMESTER_COLORS.Winter.bg, border: DEFAULT_SEMESTER_COLORS.Winter.border, textColor: DEFAULT_SEMESTER_COLORS.Winter.text },
    Spring: { bg: DEFAULT_SEMESTER_COLORS.Spring.bg, border: DEFAULT_SEMESTER_COLORS.Spring.border, textColor: DEFAULT_SEMESTER_COLORS.Spring.text },
    Summer: { bg: DEFAULT_SEMESTER_COLORS.Summer.bg, border: DEFAULT_SEMESTER_COLORS.Summer.border, textColor: DEFAULT_SEMESTER_COLORS.Summer.text },
  });
  const [deptColorOverrides, setDeptColorOverrides] = useState<Record<string, string>>({});
  const [showDeptColorPicker, setShowDeptColorPicker] = useState(false);
  const [customCourses, setCustomCourses] = useState<CustomCourse[]>([]);
  const [raw, setRaw] = useState<SkillTreeResponse | null>(null);
  const effectiveDeptColors = useMemo(
    () => buildEffectiveDeptColors(raw?.nodes, deptColorOverrides),
    [raw?.nodes, deptColorOverrides]
  );
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [addCourseForm, setAddCourseForm] = useState({
    courseId: "", courseName: "", units: "3", semesterLabel: "", color: "#7c3aed",
  });

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

  const manualElectiveCourses = useMemo<ManualElectiveCourse[]>(() => {
    if (!raw?.electiveOptions?.length) return [];
    return raw.electiveOptions.flatMap((elective) => {
      const field = electiveFields[elective.id];
      const courseId = field?.courseId?.trim();
      if (!courseId) return [];
      const normalized = normalizeCourseKey(courseId);
      return [{
        id: `manual-elective-${elective.id}`,
        courseId: normalized,
        courseName: field?.courseName?.trim() || elective.courseName?.trim() || elective.label || "Upper Division Elective",
        units: parseElectiveUnits(field?.courseUnits ?? elective.courseUnits),
        semesterLabel: elective.semesterLabel,
        color: "#f59e0b",
        slotLabel: elective.label,
        category: elective.category,
      }];
    });
  }, [raw, electiveFields]);

  const graphRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showSemColorPicker, setShowSemColorPicker] = useState<string | null>(null);
  const latestQuery = useRef(0);

  useEffect(() => {
    if (!raw?.electiveOptions?.length) return;
    setElectiveFields((prev) => {
      const next = { ...prev };
      for (const elective of raw.electiveOptions ?? []) {
        const existing = next[elective.id];
        if (existing?.courseId?.trim()) continue;
        if (elective.selected || elective.courseId) {
          next[elective.id] = {
            courseId: elective.selected ?? elective.courseId ?? "",
            courseName: elective.courseName ?? "",
            courseUnits: elective.courseUnits != null ? String(elective.courseUnits) : "",
          };
        }
      }
      return next;
    });
  }, [raw]);

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
        majorName, year: catalogYear, level, completedCourses,
        selectedElectives,
        chosenElectives: selectedElectives,
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
      setStatus("Loading CSUN Computer Science 2023 roadmap…");
      const out = await loadCSUNTestCase();
      setRaw(out as any);
      setStatus("Test roadmap loaded.");
      setMajorInput(CSUN_CS_2023_TEST_CASE.majorName);
      setCatalogYear(CSUN_CS_2023_TEST_CASE.year);
      setLevel("undergraduate");
      if ((out as any).electiveOptions?.length) setShowElectiveModal(true);
    } catch (e: any) {
      setRaw(null); setStatus(""); setError(e?.message ?? "Test case failed.");
    } finally {
      setTestLoading(false);
    }
  }

  const handleDeleteNode = useCallback((key: string) => {
    if (key.startsWith("custom-")) {
      const id = key.replace("custom-", "");
      setCustomCourses((prev) => prev.filter((c) => c.id !== id));
    } else {
      setDeletedKeys((prev) => new Set([...prev, key]));
    }
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

  useEffect(() => {
    if (!raw) {
      setShowElectiveModal(false);
      return;
    }
    if (pendingElectives.length > 0) {
      setShowElectiveModal(true);
    } else {
      setShowElectiveModal(false);
    }
  }, [raw, pendingElectives.length]);

  const integratedElectiveCourses = useMemo<CustomCourse[]>(() => {
    return manualElectiveCourses.map((course) => ({
      id: course.id,
      courseId: course.courseId,
      courseName: course.courseName,
      units: course.units,
      semesterLabel: course.semesterLabel,
      color: course.color,
    }));
  }, [manualElectiveCourses]);

  const effectiveRaw = useMemo<SkillTreeResponse | null>(() => {
    if (!raw) return null;
    if (!manualElectiveCourses.length) return raw;

    const semesterIndexByLabel = new Map<string, number>();
    raw.semesters.forEach((semester, idx) => {
      semesterIndexByLabel.set(semester.label, semester.tierIndex);
      semesterIndexByLabel.set(buildTierLabel(idx, startTerm, includeSummer, includeWinter), semester.tierIndex);
    });

    const unitsByTier = manualElectiveCourses.reduce<Record<number, number>>((acc, course) => {
      const tierIndex = semesterIndexByLabel.get(course.semesterLabel) ?? raw.semesters.find((s) => s.label === course.semesterLabel)?.tierIndex ?? 0;
      acc[tierIndex] = (acc[tierIndex] ?? 0) + course.units;
      return acc;
    }, {});

    return {
      ...raw,
      semesters: raw.semesters.map((semester) => ({
        ...semester,
        totalUnits: semester.totalUnits + (unitsByTier[semester.tierIndex] ?? 0),
      })),
    };
  }, [raw, manualElectiveCourses, startTerm, includeSummer, includeWinter]);

  const totalUnits = effectiveRaw?.semesters.reduce((s, t) => s + t.totalUnits, 0) ?? 0;
  const customUnits = customCourses.reduce((s, c) => s + c.units, 0);
  const visibleCourses = (effectiveRaw ? effectiveRaw.nodes.filter((n) => !deletedKeys.has(n.key)).length : 0) + customCourses.length + integratedElectiveCourses.length;

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

  const applyElectiveChoice = (elective: ElectiveOption, courseId: string) => {
    const choice = elective.options?.find((option) => option.courseId === courseId);
    setElectiveFields((prev) => ({
      ...prev,
      [elective.id]: {
        courseId,
        courseName: choice?.courseName ?? prev[elective.id]?.courseName ?? elective.courseName ?? "",
        courseUnits: choice?.courseUnits != null ? String(choice.courseUnits) : (prev[elective.id]?.courseUnits ?? (elective.courseUnits != null ? String(elective.courseUnits) : "")),
      },
    }));
  };

  return (
    <ReactFlowProvider>
      <style>{css}</style>
      <div style={{ minHeight:"100vh", background: BG, fontFamily:"'DM Sans', system-ui, sans-serif" }}>

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
          {raw && (
            <button
              onClick={() => {
                const semLabels = raw.semesters.map((_, i) => buildTierLabel(i, startTerm, includeSummer, includeWinter));
                setAddCourseForm((f) => ({ ...f, semesterLabel: semLabels[0] ?? "" }));
                setShowAddCourseModal(true);
              }}
              style={{ display:"inline-flex", alignItems:"center", gap:6, color:"#fff", fontSize:12, fontWeight:800, padding:"5px 13px", background:"rgba(124,58,237,0.22)", border:"1px solid rgba(124,58,237,0.50)", borderRadius:999, letterSpacing:"0.02em", cursor:"pointer", transition:"background 0.14s", fontFamily:"inherit" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Course
            </button>
          )}
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
              <input className="sp-field" value={catalogYear} onChange={(e) => setCatalogYear(e.target.value)} placeholder="e.g. 2023"/>
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
                  {pendingElectives.length > 0 ? `${pendingElectives.length} elective${pendingElectives.length!==1?"s":""} unset` : `${manualElectiveCourses.length} upper elective${manualElectiveCourses.length!==1?"s":""} configured`}
                </span>
                <button className="sp-ghost-btn" onClick={() => setShowElectiveModal(true)} style={{ padding:"3px 9px", fontSize:11 }}>{pendingElectives.length > 0 ? "Choose" : "Edit"}</button>
              </div>
            )}

            {/* Semester Block Colors */}
            <div style={{ marginBottom: 12 }}>
              <span className="sp-label">Semester Block Colors</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {(["Fall", "Winter", "Spring", "Summer"] as const).map((sem) => {
                  const defaultColors: Record<SemesterType, {bg:string;border:string;textColor:string}> = {
                    Fall:   { bg: DEFAULT_SEMESTER_COLORS.Fall.bg, border: DEFAULT_SEMESTER_COLORS.Fall.border, textColor: DEFAULT_SEMESTER_COLORS.Fall.text },
                    Winter: { bg: DEFAULT_SEMESTER_COLORS.Winter.bg, border: DEFAULT_SEMESTER_COLORS.Winter.border, textColor: DEFAULT_SEMESTER_COLORS.Winter.text },
                    Spring: { bg: DEFAULT_SEMESTER_COLORS.Spring.bg, border: DEFAULT_SEMESTER_COLORS.Spring.border, textColor: DEFAULT_SEMESTER_COLORS.Spring.text },
                    Summer: { bg: DEFAULT_SEMESTER_COLORS.Summer.bg, border: DEFAULT_SEMESTER_COLORS.Summer.border, textColor: DEFAULT_SEMESTER_COLORS.Summer.text },
                  };
                  const current = semColors[sem] || defaultColors[sem];
                  return (
                    <div key={sem}>
                      <button
                        onClick={() => setShowSemColorPicker(showSemColorPicker === sem ? null : sem)}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 8,
                          background: rgbaFromHex(current.border, 0.18), border: `1.5px solid ${current.border}`,
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

            {/* Department Colors */}
            <div style={{ marginBottom: 12 }}>
              <button
                onClick={() => setShowDeptColorPicker((v) => !v)}
                style={{
                  width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
                  background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.14)",
                  borderRadius:8, padding:"6px 11px", cursor:"pointer",
                  color:"rgba(255,255,255,0.80)", fontSize:10, fontWeight:800,
                  letterSpacing:"0.11em", textTransform:"uppercase", fontFamily:"inherit",
                  transition:"background 0.14s",
                }}
              >
                <span>Department Colors</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points={showDeptColorPicker ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/></svg>
              </button>
              {showDeptColorPicker && (
                <div style={{ background:"rgba(0,0,0,0.28)", borderRadius:9, padding:"10px 11px", border:"1px solid rgba(255,255,255,0.10)", marginTop:4 }}>
                  <p style={{ margin:"0 0 8px", fontSize:10, color:"rgba(255,255,255,0.42)", lineHeight:1.5 }}>
                    Override colors by department prefix (e.g. COMP, MATH, GE).
                  </p>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {Object.entries(effectiveDeptColors).map(([dept, color]) => {
                      const effectiveColor = deptColorOverrides[dept] ?? color;
                      return (
                        <div key={dept} style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{
                            background: effectiveColor, color:"#fff",
                            borderRadius:5, padding:"2px 7px", fontSize:10, fontWeight:800,
                            letterSpacing:"0.05em", minWidth:52, textAlign:"center", flexShrink:0,
                          }}>{dept}</span>
                          <input
                            type="color"
                            value={effectiveColor}
                            onChange={(e) => setDeptColorOverrides((prev) => ({ ...prev, [dept]: e.target.value }))}
                            style={{ width:28, height:24, border:"none", background:"transparent", padding:0, cursor:"pointer", flexShrink:0 }}
                          />
                          <input
                            className="sp-field"
                            value={effectiveColor}
                            onChange={(e) => setDeptColorOverrides((prev) => ({ ...prev, [dept]: e.target.value }))}
                            style={{ fontSize:10, padding:"4px 7px", flex:1, minWidth:0 }}
                          />
                          {deptColorOverrides[dept] && (
                            <button
                              onClick={() => setDeptColorOverrides((prev) => { const n = {...prev}; delete n[dept]; return n; })}
                              style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:5, padding:"3px 6px", cursor:"pointer", color:"rgba(255,255,255,0.60)", fontSize:10, fontFamily:"inherit" }}
                              title="Reset to default"
                            >↺</button>
                          )}
                        </div>
                      );
                    })}
                    {/* Add custom dept */}
                    <div style={{ marginTop:4, borderTop:"1px solid rgba(255,255,255,0.10)", paddingTop:7 }}>
                      <span className="sp-label" style={{ marginBottom:4 }}>Add Custom Dept</span>
                      <div style={{ display:"flex", gap:5 }}>
                        <input
                          className="sp-field"
                          id="custom-dept-input"
                          placeholder="e.g. ART"
                          style={{ fontSize:10, padding:"4px 7px", textTransform:"uppercase", flex:1 }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const inp = e.currentTarget;
                              const val = inp.value.trim().toUpperCase();
                              if (val) { setDeptColorOverrides((prev) => ({ ...prev, [val]: prev[val] ?? "#6b7280" })); inp.value = ""; }
                            }
                          }}
                        />
                        <button
                          className="sp-ghost-btn"
                          style={{ padding:"3px 9px", fontSize:10 }}
                          onClick={() => {
                            const inp = document.getElementById("custom-dept-input") as HTMLInputElement;
                            if (!inp) return;
                            const val = inp.value.trim().toUpperCase();
                            if (val) { setDeptColorOverrides((prev) => ({ ...prev, [val]: prev[val] ?? "#6b7280" })); inp.value = ""; }
                          }}
                        >Add</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
            <button className="sp-test-btn" onClick={onLoadTestCase} disabled={loading||testLoading} title="Load CSUN CS 2023 roadmap">
              {testLoading ? (
                <><span style={{ width:11, height:11, border:"2px solid rgba(196,181,253,0.28)", borderTopColor:"#c4b5fd", borderRadius:"50%", display:"inline-block", animation:"sp-spin 0.7s linear infinite" }}/>Loading…</>
              ) : (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4"/><path d="M9 21H5a2 2 0 0 1-2-2v-4"/><path d="M15 3h4a2 2 0 0 1 2 2v4"/><path d="M15 21h4a2 2 0 0 0 2-2v-4"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>Test: CSUN CS 2023 Roadmap</>
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
                    <div className="sp-stat-val">{totalUnits + customUnits}</div>
                    <div className="sp-stat-lbl">Units</div>
                  </div>
                </div>

                {manualElectiveCourses.length > 0 && (
                  <div style={{ marginTop:10, marginBottom:10 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontSize:10, fontWeight:800, letterSpacing:"0.09em", textTransform:"uppercase", color:"rgba(255,255,255,0.40)" }}>Upper Electives ({manualElectiveCourses.length})</span>
                      <button className="sp-ghost-btn" style={{ padding:"2px 8px", fontSize:10 }} onClick={() => setShowElectiveModal(true)}>Manage</button>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                      {manualElectiveCourses.map((c) => (
                        <div key={c.id} style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.18)", borderRadius:8, padding:"5px 8px" }}>
                          <span style={{ width:8, height:8, borderRadius:2, background:c.color, flexShrink:0 }}/>
                          <span style={{ fontSize:11, fontWeight:800, color:"#fff", flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.courseId}</span>
                          <span style={{ fontSize:10, color:"rgba(255,255,255,0.45)", whiteSpace:"nowrap" }}>{c.units}u · {c.semesterLabel.replace("Year ","Y").replace(" Fall"," F").replace(" Spring"," Sp").replace(" Summer"," Su").replace(" Winter"," W")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {customCourses.length > 0 && (
                  <div style={{ marginTop:10 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontSize:10, fontWeight:800, letterSpacing:"0.09em", textTransform:"uppercase", color:"rgba(255,255,255,0.40)" }}>Custom Courses ({customCourses.length})</span>
                      <button className="sp-ghost-btn" style={{ padding:"2px 8px", fontSize:10 }} onClick={() => setCustomCourses([])}>Clear all</button>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                      {customCourses.map((c) => (
                        <div key={c.id} style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:8, padding:"5px 8px" }}>
                          <span style={{ width:8, height:8, borderRadius:2, background:c.color, flexShrink:0 }}/>
                          <span style={{ fontSize:11, fontWeight:800, color:"#fff", flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.courseId}</span>
                          <span style={{ fontSize:10, color:"rgba(255,255,255,0.45)", whiteSpace:"nowrap" }}>{c.units}u · {c.semesterLabel.replace("Year ","Y").replace(" Fall"," F").replace(" Spring"," Sp").replace(" Summer"," Su").replace(" Winter"," W")}</span>
                          <button onClick={() => setCustomCourses((prev) => prev.filter((x) => x.id !== c.id))}
                            style={{ background:"none", border:"none", color:"rgba(255,255,255,0.35)", cursor:"pointer", fontSize:13, padding:"0 2px", lineHeight:1, flexShrink:0 }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color="#f87171"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color="rgba(255,255,255,0.35)"; }}
                          >×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
              raw={effectiveRaw}
              deletedKeys={deletedKeys}
              onDeleteNode={handleDeleteNode}
              graphRef={graphRef}
              graphDark={graphDark}
              semColorOverrides={semColors}
              deptColorOverrides={effectiveDeptColors}
              customCourses={[...customCourses, ...integratedElectiveCourses]}
              startTerm={startTerm}
              includeSummer={includeSummer}
              includeWinter={includeWinter}
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
                    Choose one course for each requirement group. Listed options can be selected directly, and upper-division electives can still be typed in manually.
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
                  .filter((el) => !electiveSearchQuery || [el.label, el.category ?? "", el.semesterLabel].join(" ").toLowerCase().includes(electiveSearchQuery.toLowerCase()))
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
                            {(f.courseId || elective.courseId) && (
                              <div style={{ fontSize:"10.5px", color:"rgba(255,255,255,0.58)", marginTop:4 }}>
                                Planned course: <span style={{ color:"rgba(255,255,255,0.86)", fontWeight:700 }}>{f.courseId || elective.courseId}</span>
                              </div>
                            )}
                          </div>
                          {filled && (
                            <span style={{ background:"rgba(34,197,94,0.18)", color:"#4ade80", border:"1px solid rgba(34,197,94,0.28)", borderRadius:999, padding:"2px 8px", fontSize:10, fontWeight:800, whiteSpace:"nowrap" }}>
                              ✓ Set
                            </span>
                          )}
                        </div>

                        {elective.options && elective.options.length > 0 && (
                          <div style={{ marginTop:10 }}>
                            <span className="sp-label" style={{ marginBottom:4 }}>Choose Option</span>
                            <select
                              className="sp-field"
                              value={f.courseId}
                              onChange={(e) => applyElectiveChoice(elective, e.target.value)}
                              style={{ padding:"7px 9px", fontSize:12 }}
                            >
                              <option value="">Select one course…</option>
                              {elective.options.map((option) => (
                                <option key={option.courseId} value={option.courseId}>
                                  {option.courseId.replace(/-/g, " ")} · {option.courseName}{option.courseUnits ? ` (${option.courseUnits}u)` : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Three input fields */}
                        <div className="sp-elec-field-row">
                          <div>
                                    <span className="sp-label" style={{ marginBottom:4 }}>Course ID</span>
                            <input className="sp-field" type="text" placeholder="e.g. COMP 424 or COMP 524"
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
                  onClick={() => { setShowElectiveModal(false); void onBuild(); }}>
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

        {/* ════════ ADD COURSE MODAL ════════ */}
        {showAddCourseModal && raw && (
          <div
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1001 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowAddCourseModal(false); }}
          >
            <div style={{ background:"linear-gradient(135deg,#1a0a2e 0%,#12082e 100%)", border:"1px solid rgba(124,58,237,0.35)", borderRadius:22, padding:28, maxWidth:460, width:"92%", animation:"sp-pop 0.2s ease", boxShadow:"0 24px 80px rgba(0,0,0,0.60)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                <div>
                  <h3 style={{ margin:0, fontWeight:950, fontSize:20, color:"#fff", display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ background:"rgba(124,58,237,0.28)", border:"1px solid rgba(124,58,237,0.45)", borderRadius:8, width:30, height:30, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>★</span>
                    Add Custom Course
                  </h3>
                  <p style={{ margin:"4px 0 0", fontSize:12, color:"rgba(255,255,255,0.45)" }}>
                    Add an extra class to any semester in your roadmap.
                  </p>
                </div>
                <button onClick={() => setShowAddCourseModal(false)}
                  style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, width:30, height:30, cursor:"pointer", color:"rgba(255,255,255,0.70)", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
              </div>

              <div style={{ display:"grid", gap:13 }}>
                {/* Course ID */}
                <div>
                  <span className="sp-label">Course ID</span>
                  <input className="sp-field" type="text" placeholder="e.g. COMP 499"
                    value={addCourseForm.courseId}
                    onChange={(e) => setAddCourseForm((f) => ({ ...f, courseId: e.target.value }))}
                  />
                </div>

                {/* Course Name */}
                <div>
                  <span className="sp-label">Course Name</span>
                  <input className="sp-field" type="text" placeholder="e.g. Senior Capstone"
                    value={addCourseForm.courseName}
                    onChange={(e) => setAddCourseForm((f) => ({ ...f, courseName: e.target.value }))}
                  />
                </div>

                {/* Units + Semester in a row */}
                <div style={{ display:"grid", gridTemplateColumns:"96px 1fr", gap:10 }}>
                  <div>
                    <span className="sp-label">Units</span>
                    <input className="sp-field" type="number" placeholder="3" min={0.5} max={12} step={0.5}
                      value={addCourseForm.units}
                      onChange={(e) => setAddCourseForm((f) => ({ ...f, units: e.target.value }))}
                    />
                  </div>
                  <div>
                    <span className="sp-label">Semester</span>
                    <select className="sp-field"
                      value={addCourseForm.semesterLabel}
                      onChange={(e) => setAddCourseForm((f) => ({ ...f, semesterLabel: e.target.value }))}
                      style={{ padding:"7px 9px" }}
                    >
                      {raw.semesters.map((_, i) => {
                        const lbl = buildTierLabel(i, startTerm, includeSummer, includeWinter);
                        return <option key={lbl} value={lbl}>{lbl}</option>;
                      })}
                    </select>
                  </div>
                </div>

                {/* Color picker */}
                <div>
                  <span className="sp-label">Card Color</span>
                  <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                    {["#7c3aed","#0284c7","#16a34a","#d97706","#dc2626","#0d9488","#e879f9","#f59e0b","#64748b","#ec4899"].map((c) => (
                      <button key={c} onClick={() => setAddCourseForm((f) => ({ ...f, color: c }))}
                        style={{
                          width:26, height:26, borderRadius:7, background:c, border:"none", cursor:"pointer", flexShrink:0,
                          outline: addCourseForm.color === c ? `3px solid #fff` : "none",
                          outlineOffset: 2, transition:"transform 0.12s",
                          transform: addCourseForm.color === c ? "scale(1.18)" : "scale(1)",
                        }}
                      />
                    ))}
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginLeft:4 }}>
                      <input type="color" value={addCourseForm.color}
                        onChange={(e) => setAddCourseForm((f) => ({ ...f, color: e.target.value }))}
                        style={{ width:30, height:26, border:"none", background:"transparent", padding:0, cursor:"pointer" }}
                      />
                      <input className="sp-field" value={addCourseForm.color}
                        onChange={(e) => setAddCourseForm((f) => ({ ...f, color: e.target.value }))}
                        style={{ fontSize:11, padding:"5px 8px", width:84 }}
                      />
                    </div>
                  </div>
                  {/* Preview card */}
                  <div style={{ marginTop:10, padding:"8px 12px", borderRadius:10, background: (() => { const rgb = hexToRgb(addCourseForm.color); return rgb ? `rgb(${Math.round(rgb[0]*0.18)},${Math.round(rgb[1]*0.18)},${Math.round(rgb[2]*0.18)})` : "#1a1a2e"; })(), border:`1.5px solid ${addCourseForm.color}`, display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ background:addCourseForm.color, color:"#fff", borderRadius:5, padding:"2px 7px", fontSize:10, fontWeight:800 }}>★ {addCourseForm.courseId || "DEPT 000"}</span>
                    <span style={{ fontSize:11, color:"#fff", fontWeight:700 }}>{addCourseForm.courseName || "Course Name"}</span>
                    <span style={{ marginLeft:"auto", fontSize:10, color:"rgba(255,255,255,0.60)", fontWeight:700 }}>{addCourseForm.units}u</span>
                  </div>
                </div>
              </div>

              <div style={{ display:"flex", gap:9, marginTop:20 }}>
                <button
                  className="sp-build-btn"
                  style={{ flex:2 }}
                  disabled={!addCourseForm.courseId.trim() || !addCourseForm.courseName.trim() || !addCourseForm.semesterLabel}
                  onClick={() => {
                    const units = parseFloat(addCourseForm.units) || 3;
                    setCustomCourses((prev) => [...prev, {
                      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                      courseId: addCourseForm.courseId.trim().toUpperCase(),
                      courseName: addCourseForm.courseName.trim(),
                      units,
                      semesterLabel: addCourseForm.semesterLabel,
                      color: addCourseForm.color,
                    }]);
                    setAddCourseForm((f) => ({ ...f, courseId:"", courseName:"", units:"3" }));
                    setShowAddCourseModal(false);
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add to Roadmap
                </button>
                <button className="sp-ghost-btn" style={{ flex:1, justifyContent:"center" }} onClick={() => setShowAddCourseModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ReactFlowProvider>
  );
}
