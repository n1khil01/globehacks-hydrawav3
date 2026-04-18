// src/components/IntakeForm.jsx
// Screen 1 — Patient intake. Fills in under 60 seconds.

import { useState } from "react";

const AREAS = [
  { value: "lower_back", label: "Lower back" },
  { value: "hip", label: "Hip / IT band" },
  { value: "shoulder", label: "Shoulder" },
  { value: "knee", label: "Knee" },
  { value: "neck", label: "Neck / upper trap" },
  { value: "calf", label: "Calf / ankle" },
  { value: "full_body", label: "Full body / systemic" },
];

const GOALS = [
  { value: "recovery", label: "Post-session recovery" },
  { value: "activation", label: "Pre-session activation" },
  { value: "relaxation", label: "Muscle relaxation" },
  { value: "parasympathetic", label: "Nervous system reset" },
  { value: "pain_support", label: "Pain support" },
];

const PRACTITIONER_TYPES = [
  { value: "pt", label: "Physical Therapist" },
  { value: "chiro", label: "Chiropractor" },
  { value: "sports", label: "Sports Trainer" },
  { value: "spa", label: "Wellness / Medspa" },
];

const FLAGS = [
  { value: "guarding", label: "Muscular guarding" },
  { value: "compensation", label: "Compensation pattern" },
  { value: "post_surgical", label: "Post-surgical" },
  { value: "high_stress", label: "High stress / anxiety" },
  { value: "athlete", label: "Active athlete" },
  { value: "chronic", label: "Chronic pattern" },
];

export default function IntakeForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    age: 42,
    practitioner_type: "pt",
    area: "lower_back",
    goal: "recovery",
    pain_level: 5,
    hrv_status: "normal",
    sessions: "0",
    flags: [],
  });

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function toggleFlag(val) {
    setForm((f) => ({
      ...f,
      flags: f.flags.includes(val)
        ? f.flags.filter((v) => v !== val)
        : [...f.flags, val],
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">

        <div className="field">
          <label>Patient age</label>
          <input
            type="number"
            min={10} max={110}
            value={form.age}
            onChange={(e) => set("age", parseInt(e.target.value))}
          />
        </div>

        <div className="field">
          <label>Practitioner type</label>
          <select value={form.practitioner_type} onChange={(e) => set("practitioner_type", e.target.value)}>
            {PRACTITIONER_TYPES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Primary complaint area</label>
          <select value={form.area} onChange={(e) => set("area", e.target.value)}>
            {AREAS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Session goal</label>
          <select value={form.goal} onChange={(e) => set("goal", e.target.value)}>
            {GOALS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>HRV status</label>
          <select value={form.hrv_status} onChange={(e) => set("hrv_status", e.target.value)}>
            <option value="normal">Normal / unknown</option>
            <option value="low">Low HRV (fatigued)</option>
            <option value="high">High HRV (well recovered)</option>
          </select>
        </div>

        <div className="field">
          <label>Prior sessions with device</label>
          <select value={form.sessions} onChange={(e) => set("sessions", e.target.value)}>
            <option value="0">First session</option>
            <option value="1-3">1–3 sessions</option>
            <option value="4-10">4–10 sessions</option>
            <option value="10+">10+ sessions</option>
          </select>
        </div>

        <div className="field col-span-2">
          <label>Discomfort / mobility restriction — {form.pain_level}/10</label>
          <input
            type="range"
            min={0} max={10} step={1}
            value={form.pain_level}
            onChange={(e) => set("pain_level", parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>No restriction</span>
            <span>Severe restriction</span>
          </div>
        </div>

        <div className="field col-span-2">
          <label>Secondary flags (select all that apply)</label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {FLAGS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => toggleFlag(f.value)}
                className={`flag-chip ${form.flags.includes(f.value) ? "selected" : ""}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Generating..." : "Generate protocol →"}
        </button>
      </div>
    </form>
  );
}