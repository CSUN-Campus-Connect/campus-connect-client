"use client";
// src/app/security/page.tsx

import * as React from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/axios";
import { ArrowRight, AlertCircle, CheckCircle2, ChevronLeft } from "lucide-react";

const smooth: [number, number, number, number] = [0.16, 1, 0.3, 1];
const RED = "#CC0033";
const GRAY = "#767676";

const REPORT_TYPES = [
  { value: "CRIMINAL",            label: "Criminal Activity",         description: "Theft, assault, vandalism, or other criminal behavior" },
  { value: "SAFETY_HAZARD",       label: "Safety Hazard",             description: "Broken equipment, spills, unsafe conditions" },
  { value: "DISCRIMINATION",      label: "Discrimination",             description: "Bias, discrimination, or civil rights concerns" },
  { value: "SEXUAL_VIOLENCE",     label: "Sexual Violence / Title IX", description: "Sexual harassment, assault, stalking, or dating violence" },
  { value: "MISCONDUCT",          label: "Student Misconduct",        description: "Violations of student code of conduct" },
  { value: "ACADEMIC_DISHONESTY", label: "Academic Dishonesty",       description: "Cheating, plagiarism, or academic fraud" },
  { value: "DISTURBANCE",         label: "Disturbance",               description: "Noise, disruptive behavior, or public disturbance" },
  { value: "SUSPICIOUS_ACTIVITY", label: "Suspicious Activity",       description: "Unusual or concerning behavior on campus" },
  { value: "ESCORT_REQUEST",      label: "Escort Request",            description: "Request a safety escort on campus" },
  { value: "LOST_FOUND",          label: "Lost & Found",              description: "Report lost or found items on campus" },
  { value: "PARKING",             label: "Parking Issue",             description: "Parking violations, accidents, or concerns" },
  { value: "MENTAL_HEALTH",       label: "Mental Health Concern",     description: "Concern about someone's wellbeing" },
];

const RELATIONSHIPS = [
  { value: "VICTIM",       label: "I am the person affected" },
  { value: "WITNESS",      label: "I witnessed this incident" },
  { value: "BYSTANDER",    label: "I heard about this from someone" },
  { value: "ON_BEHALF_OF", label: "I'm reporting on behalf of someone" },
];

const steps = ["Type", "Details", "Review"];

const iClass = "w-full px-4 py-3 text-[13px] font-light bg-[#FAFAF7] text-[#111] placeholder:text-[#bbb] focus:outline-none transition-colors duration-200";
const iStyle = { fontFamily: "'Sora', sans-serif", borderRadius: 0, border: "1px solid #e5e5e5" };
const onFocus = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = RED);
const onBlur  = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = "#e5e5e5");

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] mb-2" style={{ color: GRAY }}>{children}</label>;
}
function SField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><FieldLabel>{label}</FieldLabel>{children}</div>;
}

function StepIndicator({ active }: { active: number }) {
  return (
    <div className="flex items-center mb-10">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center text-[11px] font-semibold transition-colors"
              style={{ background: i <= active ? RED : "#f0f0f0", color: i <= active ? "#fff" : GRAY }}>
              {i < active ? "✓" : i + 1}
            </div>
            <span className="text-[12px] font-medium hidden sm:block" style={{ color: i === active ? "#111" : GRAY }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-[1px] mx-3" style={{ background: i < active ? RED : "#e5e5e5" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function SecurityPage() {
  const [step, setStep] = React.useState(0);
  const [anon, setAnon] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState<{ caseNumber: string; trackingToken?: string } | null>(null);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState({
    reportType: "", title: "", description: "",
    location: "", incidentDate: "", reporterRelationship: "VICTIM",
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const upd = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));
  const sel = REPORT_TYPES.find(t => t.value === form.reportType);
  const ok0 = !!form.reportType;
  const ok1 = !!(form.title && form.description && form.incidentDate);

  const handleSubmit = async () => {
    setSubmitting(true); setError("");
    try {
      const endpoint = anon ? "/api/v1/security/reports/anonymous" : "/api/v1/security/reports";
      const headers = anon ? {} : { Authorization: `Bearer ${token}` };
      const res = await api.post(endpoint, {
        reportType: form.reportType, title: form.title,
        description: form.description, location: form.location || undefined,
        incidentDate: new Date(form.incidentDate).toISOString(),
        reporterRelationship: form.reporterRelationship,
      }, { headers });
      setSubmitted({ caseNumber: res.data.caseNumber, trackingToken: res.data.trackingToken });
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to submit. Please try again.");
    }
    setSubmitting(false);
  };

  const reset = () => {
    setSubmitted(null); setStep(0); setAnon(false);
    setForm({ reportType: "", title: "", description: "", location: "", incidentDate: "", reporterRelationship: "VICTIM" });
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: smooth }}>
        <div className="h-[3px] mb-8" style={{ background: "#166534" }} />
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={16} color="#166534" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "#166534" }}>Report Submitted</span>
        </div>
        <h2 className="text-[2rem] font-extrabold tracking-tight mb-1 text-[#111]">{submitted.caseNumber}</h2>
        <p className="text-[13px] font-light mb-8" style={{ color: GRAY }}>
          Your report has been received and routed to the appropriate department.
        </p>
        {submitted.trackingToken && (
          <div className="p-5 mb-8" style={{ background: "#fef9ec", border: "1px solid #f0c842" }}>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-2" style={{ color: "#92650a" }}>Save your tracking token</div>
            <p className="text-[12px] font-light mb-3" style={{ color: "#92650a" }}>This is the only way to follow up on your anonymous report.</p>
            <div className="px-4 py-3 text-[13px] font-light break-all text-[#111]"
              style={{ background: "#fff", border: "1px solid #e5e5e5", fontFamily: "monospace" }}>
              {submitted.trackingToken}
            </div>
          </div>
        )}
        <button onClick={reset}
          className="group flex items-center gap-2 px-6 py-3 text-[13px] font-semibold text-white"
          style={{ background: RED }}>
          Submit Another <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>
    );
  }

  return (
    <>
      {/* Anon toggle */}
      <div className="flex items-center justify-between px-5 py-4 mb-8 cursor-pointer transition-colors"
        style={{ border: anon ? "1px solid #f0c842" : "1px solid #e5e5e5", background: anon ? "#fef9ec" : "#FAFAF7" }}
        onClick={() => setAnon(v => !v)}>
        <div>
          <div className="text-[13px] font-semibold text-[#111] mb-0.5">Anonymous Reporting</div>
          <div className="text-[12px] font-light" style={{ color: GRAY }}>
            {anon ? "Your identity won't be attached to this report." : "Your CSUN account will be linked."}
          </div>
        </div>
        <div className="relative w-10 h-5 flex-shrink-0 transition-colors"
          style={{ background: anon ? "#b08800" : "#ddd", borderRadius: 9999 }}>
          <div className="absolute top-0.5 w-4 h-4 bg-white transition-transform"
            style={{ borderRadius: 9999, transform: anon ? "translateX(22px)" : "translateX(2px)" }} />
        </div>
      </div>

      <StepIndicator active={step} />

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 mb-6 text-[13px]"
          style={{ background: "#fff0f3", border: "1px solid #fca5a5", color: "#9b0025" }}>
          <AlertCircle size={14} className="mt-0.5 shrink-0" />{error}
        </div>
      )}

      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-5" style={{ color: GRAY }}>What are you reporting?</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
            {REPORT_TYPES.map(type => (
              <button key={type.value} onClick={() => upd("reportType", type.value)}
                className="text-left px-4 py-3 transition-all"
                style={{ border: form.reportType === type.value ? `2px solid ${RED}` : "1px solid #e5e5e5", background: form.reportType === type.value ? "#fff5f7" : "#FAFAF7" }}>
                <div className="text-[13px] font-semibold text-[#111] mb-0.5">{type.label}</div>
                <div className="text-[11px] font-light" style={{ color: GRAY }}>{type.description}</div>
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <button disabled={!ok0} onClick={() => setStep(1)}
              className="group flex items-center gap-2 px-6 py-3 text-[13px] font-semibold text-white disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: RED }}>
              Continue <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      )}

      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col gap-5">
          {sel && (
            <div className="px-3 py-1.5 inline-flex self-start text-[11px] font-semibold"
              style={{ background: "#fff5f7", color: RED, border: `1px solid ${RED}30` }}>{sel.label}</div>
          )}
          <SField label="Title">
            <input className={iClass} style={iStyle} placeholder="Brief summary of the incident"
              value={form.title} onChange={e => upd("title", e.target.value)} onFocus={onFocus} onBlur={onBlur} />
          </SField>
          <SField label="Description">
            <textarea className={iClass} style={{ ...iStyle, minHeight: 130, resize: "vertical" }}
              placeholder="Describe what happened in as much detail as you're comfortable sharing."
              value={form.description} onChange={e => upd("description", e.target.value)} onFocus={onFocus} onBlur={onBlur} />
          </SField>
          <SField label="Location (optional)">
            <input className={iClass} style={iStyle} placeholder="Where did this happen?"
              value={form.location} onChange={e => upd("location", e.target.value)} onFocus={onFocus} onBlur={onBlur} />
          </SField>
          <SField label="When did this happen?">
            <input type="datetime-local" className={iClass} style={iStyle}
              value={form.incidentDate} onChange={e => upd("incidentDate", e.target.value)} onFocus={onFocus} onBlur={onBlur} />
          </SField>
          <SField label="Your relationship to this incident">
            <select className={iClass} style={iStyle}
              value={form.reporterRelationship} onChange={e => upd("reporterRelationship", e.target.value)} onFocus={onFocus} onBlur={onBlur}>
              {RELATIONSHIPS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </SField>
          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(0)}
              className="flex items-center gap-1.5 text-[13px] font-light hover:text-[#111] transition-colors" style={{ color: GRAY }}>
              <ChevronLeft size={14} /> Back
            </button>
            <button disabled={!ok1} onClick={() => setStep(2)}
              className="group flex items-center gap-2 px-6 py-3 text-[13px] font-semibold text-white disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: RED }}>
              Review <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-6" style={{ color: GRAY }}>Review before submitting</div>
          {anon && (
            <div className="flex items-start gap-2 px-4 py-3 mb-6 text-[12px] font-light"
              style={{ background: "#fef9ec", border: "1px solid #f0c842", color: "#92650a" }}>
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              This report will be submitted anonymously. You'll receive a tracking token — save it.
            </div>
          )}
          <div className="flex flex-col gap-5 pb-6 mb-6 border-b border-[#eee]">
            {[
              { label: "Report Type",  value: sel?.label ?? "—" },
              { label: "Title",        value: form.title },
              { label: "When",         value: new Date(form.incidentDate).toLocaleString() },
              { label: "Relationship", value: RELATIONSHIPS.find(r => r.value === form.reporterRelationship)?.label ?? "—" },
              ...(form.location ? [{ label: "Location", value: form.location }] : []),
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: GRAY }}>{label}</div>
                <div className="text-[13px] font-medium text-[#111]">{value}</div>
              </div>
            ))}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: GRAY }}>Description</div>
              <div className="px-4 py-3 text-[13px] font-light leading-relaxed text-[#111] whitespace-pre-wrap"
                style={{ background: "#FAFAF7", border: "1px solid #eee" }}>{form.description}</div>
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-[13px] font-light hover:text-[#111] transition-colors" style={{ color: GRAY }}>
              <ChevronLeft size={14} /> Edit
            </button>
            <button disabled={submitting} onClick={handleSubmit}
              className="group flex items-center gap-2 px-8 py-3 text-[13px] font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: RED }}>
              {submitting ? "Submitting…" : "Submit Report"}
              {!submitting && <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />}
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}