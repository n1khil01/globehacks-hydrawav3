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

const s = {
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  full: { gridColumn: "1 / -1" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "11px", fontWeight: "600", letterSpacing: "0.8px", textTransform: "uppercase", color: "#7a8a9a" },
  input: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #e8e0d8", background: "#ffffff", fontSize: "14px", color: "#1a2332", outline: "none" },
  select: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #e8e0d8", background: "#ffffff", fontSize: "14px", color: "#1a2332", outline: "none" },
  sliderLabel: { display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#7a8a9a", marginTop: "6px" },
  submitRow: { display: "flex", justifyContent: "flex-end", marginTop: "24px" },
  submitBtn: { background: "#c47853", color: "#ffffff", border: "none", borderRadius: "8px", padding: "12px 28px", fontSize: "14px", fontWeight: "500", cursor: "pointer" },
};

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
    <form onSubmit={handleSubmit}>
      <div style={s.grid}>

        <div style={s.field}>
          <label style={s.label}>Patient age</label>
          <input
            style={s.input}
            type="number"
            min={10} max={110}
            value={form.age}
            onChange={(e) => set("age", parseInt(e.target.value))}
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>Practitioner type</label>
          <select style={s.select} value={form.practitioner_type} onChange={(e) => set("practitioner_type", e.target.value)}>
            {PRACTITIONER_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div style={s.field}>
          <label style={s.label}>Primary complaint area</label>
          <select style={s.select} value={form.area} onChange={(e) => set("area", e.target.value)}>
            {AREAS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div style={s.field}>
          <label style={s.label}>Session goal</label>
          <select style={s.select} value={form.goal} onChange={(e) => set("goal", e.target.value)}>
            {GOALS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div style={s.field}>
          <label style={s.label}>HRV status</label>
          <select style={s.select} value={form.hrv_status} onChange={(e) => set("hrv_status", e.target.value)}>
            <option value="normal">Normal / unknown</option>
            <option value="low">Low HRV (fatigued)</option>
            <option value="high">High HRV (well recovered)</option>
          </select>
        </div>

        <div style={s.field}>
          <label style={s.label}>Prior sessions with device</label>
          <select style={s.select} value={form.sessions} onChange={(e) => set("sessions", e.target.value)}>
            <option value="0">First session</option>
            <option value="1-3">1–3 sessions</option>
            <option value="4-10">4–10 sessions</option>
            <option value="10+">10+ sessions</option>
          </select>
        </div>

        <div style={{ ...s.field, ...s.full }}>
          <label style={s.label}>Discomfort / mobility restriction — {form.pain_level}/10</label>
          <input
            type="range"
            min={0} max={10} step={1}
            value={form.pain_level}
            onChange={(e) => set("pain_level", parseInt(e.target.value))}
            style={{ width: "100%", accentColor: "#c47853" }}
          />
          <div style={s.sliderLabel}>
            <span>No restriction</span>
            <span>Severe restriction</span>
          </div>
        </div>

        <div style={{ ...s.field, ...s.full }}>
          <label style={s.label}>Secondary flags (select all that apply)</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginTop: "8px" }}>
            {FLAGS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => toggleFlag(f.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                  background: form.flags.includes(f.value) ? "#c47853" : "#ffffff",
                  color: form.flags.includes(f.value) ? "#ffffff" : "#3d3530",
                  border: form.flags.includes(f.value) ? "1px solid #c47853" : "1px solid #e8e0d8",
                  fontWeight: form.flags.includes(f.value) ? "500" : "400",
                }}
              >
                {form.flags.includes(f.value) ? "✓ " : ""}{f.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      <div style={s.submitRow}>
        <button type="submit" style={s.submitBtn} disabled={loading}>
          {loading ? "Generating..." : "Generate protocol →"}
        </button>
      </div>
    </form>
  );
}