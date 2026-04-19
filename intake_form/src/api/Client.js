// src/api/client.js
// All communication with the FastAPI backend lives here.
// Swap BASE_URL for your deployed URL in production.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

// Generate a protocol from patient intake data
export async function generateProtocol(patientInput) {
  return post("/protocol/generate", patientInput);
}

// Get AI-generated wellness rationale for a protocol
export async function getRationale(patientInput) {
  return post("/protocol/rationale", patientInput);
}

// Save a session outcome to the backend log
export async function logOutcome(outcomeData) {
  return post("/outcome/log", outcomeData);
}

// Get all session history
export async function getHistory() {
  return get("/outcome/history");
}

// Get aggregate recovery trends
export async function getTrends() {
  return get("/outcome/trends");
}