import { useEffect, useState } from "react";
import { getRationale } from "../api/client";

export default function ProtocolOutput({ protocol, patientInput, onNext, onBack }) {
  const [rationale, setRationale] = useState(null);
  const [rationaleLoading, setRationaleLoading] = useState(true);

  useEffect(() => {
    setRationaleLoading(true);
    getRationale(patientInput)
      .then((data) => setRationale(data.rationale))
      .catch(() => setRationale(
        "The selected modality balance supports the body's natural recovery mechanisms. " +
        "Vibro-acoustic and thermal settings are calibrated to the patient's current wellness state."
      ))
      .finally(() => setRationaleLoading(false));
  }, [patientInput]);

  const { protocol_name, confidence_pct, placement, modalities, session } = protocol;

  const card = {
    background: "#ffffff",
    border: "1px solid #e8e0d8",
    borderRadius: "12px",
    padding: "20px 24px",
    marginBottom: "16px",
  };

  const sectionLabel = {
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    color: "#7a8a9a",
    marginBottom: "14px",
  };

  return (
    <div>

      {/* Protocol header card */}
      <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "17px", fontWeight: "600", color: "#1a2332" }}>{protocol_name}</div>
          <div style={{ fontSize: "13px", color: "#7a8a9a", marginTop: "2px" }}>Hydrawav3 PWR Session</div>
        </div>
        <div style={{
          background: "#fdf0e8",
          border: "1px solid #e8c4a8",
          borderRadius: "20px",
          padding: "6px 16px",
          fontSize: "13px",
          fontWeight: "600",
          color: "#c47853",
        }}>
          Match {confidence_pct}%
        </div>
      </div>

      {/* Pad placement */}
      <div style={card}>
        <div style={sectionLabel}>Pad placement</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

          {/* Sun pad */}
          <div style={{ background: "#fff8f5", border: "1px solid #f0d0bc", borderRadius: "10px", padding: "16px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.8px", textTransform: "uppercase", color: "#c47853", marginBottom: "8px" }}>
              ☀ Sun pad — heating
            </div>
            <div style={{ fontSize: "15px", fontWeight: "600", color: "#1a2332", marginBottom: "6px" }}>
              {placement.sun.location}
            </div>
            <div style={{ fontSize: "12px", color: "#7a8a9a", lineHeight: "1.6" }}>
              {placement.sun.reason}
            </div>
          </div>

          {/* Moon pad */}
          <div style={{ background: "#f5f8ff", border: "1px solid #bcd0f0", borderRadius: "10px", padding: "16px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.8px", textTransform: "uppercase", color: "#4a7ab5", marginBottom: "8px" }}>
              ◐ Moon pad — cooling
            </div>
            <div style={{ fontSize: "15px", fontWeight: "600", color: "#1a2332", marginBottom: "6px" }}>
              {placement.moon.location}
            </div>
            <div style={{ fontSize: "12px", color: "#7a8a9a", lineHeight: "1.6" }}>
              {placement.moon.reason}
            </div>
          </div>

        </div>
      </div>

      {/* Modality settings */}
      <div style={card}>
        <div style={sectionLabel}>Modality settings</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
          {[
            { name: "Thermal", value: modalities.thermal },
            { name: "Light (PBM)", value: modalities.pbm },
            { name: "Vibro-acoustic", value: modalities.vibro },
          ].map(({ name, value }) => (
            <div key={name} style={{ background: "#f5f0eb", borderRadius: "10px", padding: "14px 16px" }}>
              <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.8px", textTransform: "uppercase", color: "#7a8a9a", marginBottom: "8px" }}>{name}</div>
              <div style={{ fontSize: "20px", fontWeight: "600", color: "#1a2332", marginBottom: "10px" }}>{value}%</div>
              <div style={{ height: "4px", borderRadius: "2px", background: "#e8e0d8", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${value}%`, background: "#c47853", borderRadius: "2px", transition: "width 0.5s ease" }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {[
            { name: "Duration", value: `${session.duration_min} min` },
            { name: "Intensity", value: session.intensity },
            { name: "Sequence", value: session.sequence },
          ].map(({ name, value }) => (
            <div key={name} style={{ background: "#f5f0eb", borderRadius: "10px", padding: "14px 16px" }}>
              <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.8px", textTransform: "uppercase", color: "#7a8a9a", marginBottom: "6px" }}>{name}</div>
              <div style={{ fontSize: "14px", fontWeight: "500", color: "#1a2332" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Wellness rationale */}
      <div style={card}>
        <div style={sectionLabel}>Wellness rationale</div>
        {rationaleLoading ? (
          <div style={{ fontSize: "13px", color: "#7a8a9a", fontStyle: "italic" }}>Generating rationale...</div>
        ) : (
          <div style={{ fontSize: "14px", color: "#3d3530", lineHeight: "1.7" }}>{rationale}</div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
        <button onClick={onBack} style={{ background: "transparent", color: "#7a8a9a", border: "1px solid #e8e0d8", borderRadius: "8px", padding: "11px 24px", fontSize: "14px", cursor: "pointer" }}>
          ← Back
        </button>
        <button onClick={onNext} style={{ background: "#c47853", color: "#ffffff", border: "none", borderRadius: "8px", padding: "11px 24px", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>
          Log session outcome →
        </button>
      </div>

    </div>
  );
}