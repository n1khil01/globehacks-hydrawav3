// src/components/ProtocolOutput.jsx
// Screen 2 — Shows the engine's output: pad placement, modality settings,
// and the AI-generated wellness rationale.

import { useEffect, useState } from "react";
import { getRationale } from "../api/client";

function IntensityBar({ value }) {
  return (
    <div className="intensity-bar">
      <div className="intensity-fill" style={{ width: `${value}%` }} />
    </div>
  );
}

function PadCard({ type, location, reason }) {
  const isSun = type === "sun";
  return (
    <div className={`pad-card ${isSun ? "pad-sun" : "pad-moon"}`}>
      <div className="pad-label">{isSun ? "☀ Sun pad — heating" : "◐ Moon pad — cooling"}</div>
      <div className="pad-location">{location}</div>
      <div className="pad-reason">{reason}</div>
    </div>
  );
}

export default function ProtocolOutput({ protocol, patientInput, onNext, onBack }) {
  const [rationale, setRationale] = useState(null);
  const [rationaleLoading, setRationaleLoading] = useState(true);

  // Fetch AI rationale independently so the protocol renders immediately
  useEffect(() => {
    setRationaleLoading(true);
    getRationale(patientInput)
      .then((data) => setRationale(data.rationale))
      .catch(() =>
        setRationale(
          "The selected modality balance supports the body's natural recovery mechanisms. " +
          "Vibro-acoustic and thermal settings are calibrated to the patient's current wellness state."
        )
      )
      .finally(() => setRationaleLoading(false));
  }, [patientInput]);

  const { protocol_name, confidence_pct, placement, modalities, session } = protocol;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="protocol-header">
        <div>
          <div className="protocol-title">{protocol_name}</div>
          <div className="protocol-sub">Hydrawav3 PWR Session</div>
        </div>
        <div className="confidence-badge">Match {confidence_pct}%</div>
      </div>

      {/* Pad placement */}
      <section>
        <div className="section-label">Pad placement</div>
        <div className="grid grid-cols-2 gap-3">
          <PadCard type="sun" {...placement.sun} />
          <PadCard type="moon" {...placement.moon} />
        </div>
      </section>

      {/* Modality settings */}
      <section>
        <div className="section-label">Modality settings</div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: "Thermal", key: "thermal" },
            { name: "Light (PBM)", key: "pbm" },
            { name: "Vibro-acoustic", key: "vibro" },
          ].map(({ name, key }) => (
            <div key={key} className="modality-card">
              <div className="modality-name">{name}</div>
              <div className="modality-val">{modalities[key]}%</div>
              <IntensityBar value={modalities[key]} />
            </div>
          ))}
        </div>
      </section>

      {/* Session params */}
      <section>
        <div className="grid grid-cols-3 gap-3">
          <div className="modality-card">
            <div className="modality-name">Duration</div>
            <div className="modality-val">{session.duration_min} min</div>
          </div>
          <div className="modality-card">
            <div className="modality-name">Intensity</div>
            <div className="modality-val">{session.intensity}</div>
          </div>
          <div className="modality-card">
            <div className="modality-name">Sequence</div>
            <div className="modality-val">{session.sequence}</div>
          </div>
        </div>
      </section>

      {/* AI Rationale */}
      <section className="rationale-box">
        <div className="section-label">Wellness rationale</div>
        {rationaleLoading ? (
          <p className="text-muted italic text-sm">Generating rationale...</p>
        ) : (
          <p className="text-sm leading-relaxed">{rationale}</p>
        )}
      </section>

      {/* Actions */}
      <div className="flex justify-between">
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn-primary" onClick={onNext}>Log session outcome →</button>
      </div>
    </div>
  );
}