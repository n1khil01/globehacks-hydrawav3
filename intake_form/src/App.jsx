import { useState } from "react";
import IntakeForm from "./components/IntakeForm";
import ProtocolOutput from "./components/ProtocolOutput";
import OutcomeLogger from "./components/OutcomeLogger";
import { generateProtocol, logOutcome } from "./api/client";

export default function App() {
  const [screen, setScreen] = useState(0);
  const [patientInput, setPatientInput] = useState(null);
  const [protocol, setProtocol] = useState(null);
  const [sessionRecord, setSessionRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleIntakeSubmit(formData) {
    setLoading(true);
    setError(null);
    try {
      const result = await generateProtocol(formData);
      setPatientInput(formData);
      setProtocol(result);
      setScreen(1);
    } catch (e) {
      setError("Could not connect to the backend. Is the server running on port 8000?");
    } finally {
      setLoading(false);
    }
  }

  async function handleOutcomeSave(outcomeData) {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...outcomeData,
        area: patientInput.area,
        goal: patientInput.goal,
        protocol_name: protocol.protocol_name,
      };
      const record = await logOutcome(payload);
      setSessionRecord(record.record);
      setScreen(3);
    } catch (e) {
      setError("Failed to save outcome.");
    } finally {
      setLoading(false);
    }
  }

  function newSession() {
    setScreen(0);
    setPatientInput(null);
    setProtocol(null);
    setSessionRecord(null);
    setError(null);
  }

  const titles = [
    { title: "Session Manager", sub: "Intelligent mapping and customized sessions" },
    { title: "Recommended Protocol", sub: "Review and confirm before starting session" },
    { title: "Session Outcome", sub: "Log results to improve future recommendations" },
    { title: "Session Complete", sub: "Outcome saved to patient profile" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f0eb", fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#1a2332", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#ffffff", letterSpacing: "-0.3px" }}>HYDRAWAV3</div>
          <div style={{ fontSize: "11px", color: "#8a9ab5", letterSpacing: "1.5px", textTransform: "uppercase" }}>Practitioner</div>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: "36px", height: "4px", borderRadius: "2px",
              background: i < screen ? "#c47853" : i === screen ? "#ffffff" : "rgba(255,255,255,0.2)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#1a2332", marginBottom: "4px" }}>
          {titles[screen].title}
        </h1>
        <p style={{ fontSize: "14px", color: "#7a8a9a", marginBottom: "28px" }}>
          {titles[screen].sub}
        </p>

        {error && (
          <div style={{ background: "#fdf0ee", border: "1px solid #f0c4bc", borderRadius: "8px", padding: "12px 16px", color: "#c0392b", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {screen === 0 && <IntakeForm onSubmit={handleIntakeSubmit} loading={loading} />}

        {screen === 1 && protocol && (
          <ProtocolOutput
            protocol={protocol}
            patientInput={patientInput}
            onNext={() => setScreen(2)}
            onBack={() => setScreen(0)}
          />
        )}

        {screen === 2 && (
          <OutcomeLogger
            protocol={protocol}
            onSave={handleOutcomeSave}
            onBack={() => setScreen(1)}
            loading={loading}
          />
        )}

        {screen === 3 && sessionRecord && (
          <div>
            <div style={{ background: "#eef5ee", border: "1px solid #b8ddb8", borderRadius: "12px", padding: "28px", textAlign: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "28px", color: "#4a9a4a", marginBottom: "8px" }}>✓</div>
              <div style={{ fontSize: "17px", fontWeight: "600", color: "#1a3a1a" }}>Session logged successfully</div>
              <div style={{ fontSize: "13px", color: "#5a7a5a", marginTop: "6px" }}>Outcome data saved. Protocol weights updated.</div>
            </div>

            <div style={{ background: "#ffffff", border: "1px solid #e8e0d8", borderRadius: "12px", padding: "20px 24px" }}>
              <div style={{ fontSize: "15px", fontWeight: "600", color: "#1a2332", marginBottom: "14px" }}>Session record</div>
              {[
                ["Protocol", sessionRecord.protocol_name],
                ["Area", sessionRecord.patient_area],
                ["Mobility improvement", `${sessionRecord.mobility_score}/10`],
                ["Discomfort reduction", `${sessionRecord.discomfort_reduction}/10`],
                ["ROM gain", `~${sessionRecord.rom_gain_degrees}°`],
                ["Composite score", `${sessionRecord.composite_score}/100`],
              ].map(([k, v], idx, arr) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: idx === arr.length - 1 ? "none" : "1px solid #f0ebe4", fontSize: "14px" }}>
                  <span style={{ color: "#7a8a9a" }}>{k}</span>
                  <span style={{ color: k === "Composite score" ? "#c47853" : "#1a2332", fontWeight: "500" }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button onClick={newSession} style={{ background: "#c47853", color: "#ffffff", border: "none", borderRadius: "8px", padding: "11px 24px", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>
                New patient →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}