// src/components/OutcomeLogger.jsx
// Screen 3 — Post-session outcome capture.
// These scores feed back into the session log and future protocol weighting.

import { useState } from "react";

function OutcomeSlider({ label, id, min, max, value, unit, onChange }) {
  return (
    <div className="outcome-metric">
      <div className="metric-label">{label}</div>
      <input
        type="range"
        min={min} max={max} step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="metric-slider"
      />
      <div className="metric-val">{value}{unit}</div>
    </div>
  );
}

export default function OutcomeLogger({ protocol, onSave, onBack, loading }) {
  const [outcomes, setOutcomes] = useState({
    mobility_improvement: 5,
    discomfort_reduction: 5,
    patient_wellness: 6,
    rom_gain: 8,
  });

  function set(key, val) {
    setOutcomes((o) => ({ ...o, [key]: val }));
  }

  function handleSave() {
    onSave({
      area: protocol.flags_applied?.[0] || "unknown",
      goal: "recovery",
      protocol_name: protocol.protocol_name,
      ...outcomes,
    });
  }

  return (
    <div className="space-y-4">

      <OutcomeSlider
        label="Mobility improvement"
        min={0} max={10}
        value={outcomes.mobility_improvement}
        unit="/10"
        onChange={(v) => set("mobility_improvement", v)}
      />
      <OutcomeSlider
        label="Discomfort reduction"
        min={0} max={10}
        value={outcomes.discomfort_reduction}
        unit="/10"
        onChange={(v) => set("discomfort_reduction", v)}
      />
      <OutcomeSlider
        label="Patient reported wellness"
        min={0} max={10}
        value={outcomes.patient_wellness}
        unit="/10"
        onChange={(v) => set("patient_wellness", v)}
      />
      <OutcomeSlider
        label="ROM gain observed (degrees)"
        min={0} max={30}
        value={outcomes.rom_gain}
        unit="°"
        onChange={(v) => set("rom_gain", v)}
      />

      <div className="flex justify-between mt-6">
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save & complete →"}
        </button>
      </div>
    </div>
  );
}