import { useState } from "react";
import IntakeScreen from "./screens/IntakeScreen";
import ProtocolScreen from "./screens/ProtocolScreen";
import OutcomeScreen from "./screens/OutcomeScreen";
import SummaryScreen from "./screens/SummaryScreen";
import Header from "./components/Header";

export default function App() {
  const [screen, setScreen] = useState(0);
  const [intakeData, setIntakeData] = useState(null);
  const [protocol, setProtocol] = useState(null);
  const [outcomeData, setOutcomeData] = useState(null);

  const handleIntakeSubmit = async (data) => {
    setIntakeData(data);
    // Call backend to compute protocol
    const res = await fetch("/api/protocol", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    setProtocol(result);
    setScreen(1);
  };

  const handleOutcomeSubmit = async (outcomes) => {
    setOutcomeData(outcomes);
    // Call backend to save outcome and update profile weights
    await fetch("/api/outcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intakeData, protocol, outcomes }),
    });
    setScreen(3);
  };

  const handleNewSession = () => {
    setScreen(0);
    setIntakeData(null);
    setProtocol(null);
    setOutcomeData(null);
  };

  return (
    <div className="app">
      <Header currentStep={screen} />
      <main className="main">
        {screen === 0 && <IntakeScreen onSubmit={handleIntakeSubmit} />}
        {screen === 1 && (
          <ProtocolScreen
            protocol={protocol}
            intakeData={intakeData}
            onBack={() => setScreen(0)}
            onNext={() => setScreen(2)}
          />
        )}
        {screen === 2 && (
          <OutcomeScreen
            onBack={() => setScreen(1)}
            onSubmit={handleOutcomeSubmit}
          />
        )}
        {screen === 3 && (
          <SummaryScreen
            protocol={protocol}
            intakeData={intakeData}
            outcomeData={outcomeData}
            onNew={handleNewSession}
          />
        )}
      </main>
    </div>
  );
}