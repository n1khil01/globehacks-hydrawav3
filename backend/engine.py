"""
Hydrawav3 Protocol Decision Engine
===================================
This is the brain. Pure Python logic — no AI, no LLMs.

The engine takes a PatientInput and runs it through:
  1. Goal profile lookup      → baseline modality weights
  2. Anatomical zone mapping  → pad placement + reason
  3. Modifier cascade         → age, pain, HRV, experience, flags
  4. Clamp + score            → final output with confidence

Every rule here is explicit and auditable. This is what separates
a real product from an AI wrapper.
"""

from pydantic import BaseModel, Field
from typing import Optional


# ─── INPUT / OUTPUT MODELS ────────────────────────────────────────────────────

class PatientInput(BaseModel):
    age: int = Field(..., ge=10, le=110, description="Patient age")
    practitioner_type: str = Field(..., description="pt | chiro | sports | spa")
    area: str = Field(..., description="Primary complaint anatomical area")
    goal: str = Field(..., description="Session goal key")
    pain_level: int = Field(..., ge=0, le=10, description="Discomfort / mobility restriction 0–10")
    hrv_status: str = Field("normal", description="low | normal | high")
    sessions: str = Field("0", description="Prior sessions: 0 | 1-3 | 4-10 | 10+")
    flags: list[str] = Field(default_factory=list, description="Secondary flags from intake")


class SessionOutcome(BaseModel):
    area: str
    goal: str
    protocol_name: str
    mobility_improvement: int = Field(..., ge=0, le=10)
    discomfort_reduction: int = Field(..., ge=0, le=10)
    patient_wellness: int = Field(..., ge=0, le=10)
    rom_gain: int = Field(..., ge=0, le=30)


# ─── STATIC LOOKUP TABLES ─────────────────────────────────────────────────────

# Pad placement by anatomical area
# Each entry defines Sun (heating) and Moon (cooling) positions + reasoning
PLACEMENT_MAP: dict[str, dict] = {
    "lower_back": {
        "sun": {
            "location": "Right lower back (L3–L5)",
            "reason": "Warms deep paraspinal tissue, supports fluid mobilization and circulation to the lumbar region.",
        },
        "moon": {
            "location": "Left lower back / sacrum",
            "reason": "Cooling contrast creates a push-pull gradient across the lumbar fascia, supporting parasympathetic tone.",
        },
    },
    "hip": {
        "sun": {
            "location": "Right hip / greater trochanter",
            "reason": "Thermal activation of the IT band insertion and hip flexors, supporting mobility.",
        },
        "moon": {
            "location": "Lower back (compensatory zone)",
            "reason": "Addresses upstream compensation patterns commonly co-presenting with hip restriction.",
        },
    },
    "shoulder": {
        "sun": {
            "location": "Posterior shoulder / rotator cuff",
            "reason": "Warms the infraspinatus and teres minor to support rotation recovery.",
        },
        "moon": {
            "location": "Upper trap / cervical junction",
            "reason": "Cooling calms overactive trap tone that commonly co-presents with shoulder restriction.",
        },
    },
    "knee": {
        "sun": {
            "location": "Quadriceps / VMO",
            "reason": "Activates quad firing patterns supporting patellar tracking and knee stability.",
        },
        "moon": {
            "location": "Posterior knee / popliteal",
            "reason": "Cooling the posterior chain supports recovery and reduces residual tension behind the joint.",
        },
    },
    "neck": {
        "sun": {
            "location": "Upper thoracic (T1–T4)",
            "reason": "Warms the thoracic base to release tension that loads the cervical spine from below.",
        },
        "moon": {
            "location": "Suboccipital / C1–C3",
            "reason": "Targeted cooling of the suboccipitals reduces referral patterns and calms the nervous system.",
        },
    },
    "calf": {
        "sun": {
            "location": "Gastrocnemius / mid-calf",
            "reason": "Thermal support for calf tissue recovery, promotes micro-circulation.",
        },
        "moon": {
            "location": "Achilles / calcaneal insertion",
            "reason": "Cooling at the tendon insertion supports recovery and reduces tension at the attachment site.",
        },
    },
    "full_body": {
        "sun": {
            "location": "Thoracic spine (mid-back)",
            "reason": "Central spinal placement maximizes systemic thermal input for full-body wellness effects.",
        },
        "moon": {
            "location": "Lumbar / sacral base",
            "reason": "Lower placement balances the thermal gradient and supports whole-system parasympathetic activation.",
        },
    },
}


# Baseline modality profiles per session goal
# thermal, pbm, vibro = intensity percentages (0–100)
# duration = minutes | intensity = human label | sequence = PWR firing order
GOAL_PROFILES: dict[str, dict] = {
    "recovery": {
        "name": "Post-Session Recovery",
        "thermal": 75, "pbm": 80, "vibro": 60,
        "duration": 9, "intensity": "Moderate", "sequence": "Standard PWR",
    },
    "activation": {
        "name": "Pre-Session Activation",
        "thermal": 85, "pbm": 65, "vibro": 80,
        "duration": 7, "intensity": "High", "sequence": "Thermal-first",
    },
    "relaxation": {
        "name": "Deep Muscle Relaxation",
        "thermal": 60, "pbm": 70, "vibro": 85,
        "duration": 9, "intensity": "Low–Moderate", "sequence": "Vibro-lead",
    },
    "parasympathetic": {
        "name": "Nervous System Reset",
        "thermal": 50, "pbm": 75, "vibro": 90,
        "duration": 12, "intensity": "Low", "sequence": "Vibro-lead",
    },
    "pain_support": {
        "name": "Pain Support Protocol",
        "thermal": 65, "pbm": 85, "vibro": 70,
        "duration": 9, "intensity": "Low–Moderate", "sequence": "PBM-enhanced",
    },
}


# ─── ENGINE CLASS ─────────────────────────────────────────────────────────────

class ProtocolEngine:
    """
    Deterministic protocol computation engine.
    Rules are explicit, ordered, and fully auditable.
    """

    def compute(self, p: PatientInput) -> dict:
        # 1. Load baseline from goal profile
        base = GOAL_PROFILES.get(p.goal, GOAL_PROFILES["recovery"]).copy()
        placement = PLACEMENT_MAP.get(p.area, PLACEMENT_MAP["lower_back"])
        confidence = 88
        duration_mod = 0

        # ── 2. Age modifier ──────────────────────────────────────────────────
        if p.age > 65:
            base["thermal"] -= 10    # Reduce thermal for older tissue tolerance
            base["vibro"] -= 5
            duration_mod += 1        # Slightly longer session for older patients
            confidence -= 2
        elif p.age < 25:
            base["vibro"] += 5       # Younger patients tolerate and benefit from more vibro
            confidence += 2

        # ── 3. Pain / restriction severity modifier ──────────────────────────
        if p.pain_level >= 8:
            # High discomfort → reduce thermal, increase vibro (gentler approach)
            base["vibro"] += 10
            base["thermal"] -= 5
            base["intensity"] = "Low"
        elif p.pain_level <= 2:
            # Low discomfort → safe to push thermal, reduce vibro
            base["thermal"] += 5
            base["vibro"] -= 5

        # ── 4. HRV modifier ──────────────────────────────────────────────────
        if p.hrv_status == "low":
            # Fatigued nervous system → prioritize recovery modalities
            base["vibro"] += 10
            base["thermal"] -= 8
            base["duration"] += 2
            base["name"] = "Recovery-Priority " + base["name"]
        elif p.hrv_status == "high":
            # Well-recovered → safe to load thermal, ease off vibro
            base["thermal"] += 5
            base["vibro"] -= 5

        # ── 5. Experience modifier ───────────────────────────────────────────
        if p.sessions == "0":
            # First session → conservative across the board
            base["thermal"] = min(base["thermal"], 65)
            base["vibro"] = min(base["vibro"], 70)
            base["intensity"] = "Low–Moderate"
        elif p.sessions == "10+":
            # High experience → can push intensity, confidence in placement higher
            base["thermal"] += 8
            confidence += 4
            duration_mod -= 1   # Experienced patients may need shorter sessions

        # ── 6. Secondary flag modifiers ──────────────────────────────────────
        flag_rules = {
            "guarding":      {"vibro": +12, "thermal": -5},
            "high_stress":   {"vibro": +8,  "pbm": +5,   "duration": +2},
            "athlete":       {"thermal": +8, "vibro": +5, "duration": -1},
            "post_surgical": {"thermal": -15, "vibro": -15, "intensity": "Low"},
            "chronic":       {"duration": +2, "pbm": +8},
            "compensation":  {},  # confidence boost only
        }

        for flag in p.flags:
            if flag in flag_rules:
                mods = flag_rules[flag]
                for key, delta in mods.items():
                    if key == "intensity":
                        base["intensity"] = delta
                    elif key in base:
                        base[key] += delta
                if flag == "compensation":
                    confidence += 3
                if flag == "chronic":
                    confidence -= 3

        # ── 7. Practitioner-type tuning ──────────────────────────────────────
        practitioner_rules = {
            "chiro":  {"thermal": +5},         # Chiros use more thermal for pre-adjustment prep
            "sports": {"vibro": +5, "thermal": +5},
            "spa":    {"vibro": +5, "thermal": -5, "pbm": +5},  # Spa = calmer profile
            "pt":     {},  # PT defaults are already balanced
        }
        for key, delta in practitioner_rules.get(p.practitioner_type, {}).items():
            if key in base:
                base[key] += delta

        # ── 8. Clamp all values to valid ranges ──────────────────────────────
        base["thermal"]  = max(20, min(100, base["thermal"]))
        base["pbm"]      = max(20, min(100, base["pbm"]))
        base["vibro"]    = max(20, min(100, base["vibro"]))
        base["duration"] = max(7,  min(15,  base["duration"] + duration_mod))
        confidence       = max(70, min(99,  confidence))

        # ── 9. Assemble output ───────────────────────────────────────────────
        return {
            "protocol_name": base["name"],
            "confidence_pct": confidence,
            "placement": {
                "sun": placement["sun"],
                "moon": placement["moon"],
            },
            "modalities": {
                "thermal": base["thermal"],
                "pbm": base["pbm"],
                "vibro": base["vibro"],
            },
            "session": {
                "duration_min": base["duration"],
                "intensity": base["intensity"],
                "sequence": base["sequence"],
            },
            "flags_applied": p.flags,
        }

    def compute_composite_score(self, outcome: SessionOutcome) -> int:
        """
        Weighted composite recovery score (0–100).
        Mobility and discomfort weighted equally, ROM as a bonus signal.
        """
        base = (
            outcome.mobility_improvement * 4 +      # 0–40
            outcome.discomfort_reduction * 4 +      # 0–40
            outcome.patient_wellness * 1.5           # 0–15
        )
        rom_bonus = min(outcome.rom_gain * 0.5, 5)  # up to +5 for ROM gain
        return round(min(100, base + rom_bonus))