"""
Hydrawav3 Recovery Intelligence — FastAPI Backend
Handles protocol generation, outcome logging, and AI rationale.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from google import genai
from datetime import datetime
from engine import ProtocolEngine, PatientInput, SessionOutcome

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="Hydrawav3 Recovery Intelligence API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = ProtocolEngine()
session_log: list[dict] = []


@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.post("/protocol/generate")
def generate_protocol(patient: PatientInput):
    """
    Core endpoint. Runs the decision engine — no AI involved.
    """
    result = engine.compute(patient)
    return result


@app.post("/protocol/rationale")
def get_rationale(patient: PatientInput):
    protocol = engine.compute(patient)

    prompt = f"""You are a wellness protocol assistant for Hydrawav3, a hands-off recovery platform.

Patient data:
- Primary area: {patient.area.replace('_', ' ')}
- Session goal: {patient.goal.replace('_', ' ')}
- Discomfort level: {patient.pain_level}/10
- HRV status: {patient.hrv_status}
- Secondary flags: {', '.join(patient.flags) if patient.flags else 'none'}

Generated protocol:
- Thermal intensity: {protocol['modalities']['thermal']}%
- Photobiomodulation: {protocol['modalities']['pbm']}%
- Vibro-acoustic: {protocol['modalities']['vibro']}%
- Duration: {protocol['session']['duration_min']} minutes
- Intensity level: {protocol['session']['intensity']}

Write 2-3 sentences explaining the wellness rationale in plain practitioner language.
Rules: use only "supports", "empowers", "recovery", "mobility", "wellness".
Never use "treats", "cures", "diagnoses", "medical", "clinical", or "heals".
Keep it under 70 words. Return only the rationale text, no preamble."""

    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )
        return {"rationale": response.text}
    except Exception:
        return {"rationale": "The selected modality balance supports the body's natural recovery mechanisms. Vibro-acoustic and thermal settings are calibrated to the patient's current wellness state."}


@app.post("/outcome/log")
def log_outcome(outcome: SessionOutcome):
    """
    Saves a session outcome to the in-memory log.
    """
    record = {
        "id": len(session_log) + 1,
        "timestamp": datetime.utcnow().isoformat(),
        "patient_area": outcome.area,
        "goal": outcome.goal,
        "mobility_score": outcome.mobility_improvement,
        "discomfort_reduction": outcome.discomfort_reduction,
        "wellness_score": outcome.patient_wellness,
        "rom_gain_degrees": outcome.rom_gain,
        "composite_score": engine.compute_composite_score(outcome),
        "protocol_name": outcome.protocol_name,
    }
    session_log.append(record)
    return {"success": True, "record": record}


@app.get("/outcome/history")
def get_history():
    return {"sessions": session_log, "count": len(session_log)}


@app.get("/outcome/trends")
def get_trends():
    if not session_log:
        return {"message": "No sessions logged yet."}

    avg_composite = sum(s["composite_score"] for s in session_log) / len(session_log)
    avg_rom = sum(s["rom_gain_degrees"] for s in session_log) / len(session_log)
    avg_mobility = sum(s["mobility_score"] for s in session_log) / len(session_log)

    area_counts: dict = {}
    for s in session_log:
        area_counts[s["patient_area"]] = area_counts.get(s["patient_area"], 0) + 1

    return {
        "total_sessions": len(session_log),
        "avg_composite_score": round(avg_composite, 1),
        "avg_rom_gain": round(avg_rom, 1),
        "avg_mobility_improvement": round(avg_mobility, 1),
        "sessions_by_area": area_counts,
    }