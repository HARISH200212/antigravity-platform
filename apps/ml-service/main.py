"""
AntiGravity Technologies — ML Service
AGT-LEV-2026-04: FastAPI + PPO Field Optimizer

Endpoints:
  POST /optimize         — Run PPO optimization on coil config
  GET  /model/info       — Agent model metadata
  GET  /health           — Liveness probe
  GET  /training/history — Training run history
  POST /simulate         — Lightweight analytical EM field simulation
"""

from __future__ import annotations

import asyncio
import time
import math
import random
import uuid
import os
from datetime import datetime, timezone
from typing import Optional, List

import numpy as np
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AntiGravity ML Service",
    description=(
        "AGT-LEV-2026-04 AI Field Optimizer — PPO Reinforcement Learning agent "
        "for adaptive coil current optimization.\n\n"
        "- **Algorithm:** Proximal Policy Optimization (PPO)\n"
        "- **Framework:** Stable-Baselines3 v2.3\n"
        "- **Observation:** [flux, temperature, displacement, coilA-D]\n"
        "- **Action:** Δ coil currents (continuous, bounded ±2A)\n"
        "- **Reward:** R = stability_score − 0.3 × power_norm"
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:4000", "https://*.run.app"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# ─── Pydantic Models ──────────────────────────────────────────────────────────
class CoilConfig(BaseModel):
    coilA: float = Field(..., ge=0, le=20, description="Coil A current in Amperes")
    coilB: float = Field(..., ge=0, le=20)
    coilC: float = Field(..., ge=0, le=20)
    coilD: float = Field(..., ge=0, le=20)
    frequency: float = Field(50.0, ge=20, le=100, description="Drive frequency in Hz")
    phase: float = Field(0.0, ge=0, le=360, description="Phase offset in degrees")


class SensorReading(BaseModel):
    flux: float = Field(..., description="Flux density in Tesla")
    temperature: float = Field(..., description="Temperature in °C")
    displacement: float = Field(..., description="Payload displacement in mm")


class OptimizeRequest(BaseModel):
    coil_config: CoilConfig
    sensor_reading: Optional[SensorReading] = None
    experiment_id: Optional[str] = None
    safety_thresholds: Optional[dict] = None


class OptimizeResponse(BaseModel):
    request_id: str
    experiment_id: Optional[str]
    agent_version: str
    suggested_config: CoilConfig
    expected_power_saving_pct: float
    expected_stability_pct: float
    reward_score: float
    confidence: float
    optimization_method: str
    latency_ms: float
    generated_at: str


class SimulateRequest(BaseModel):
    coil_config: CoilConfig
    grid_size: int = Field(5, ge=2, le=10)


class FieldVector(BaseModel):
    x: float; y: float; z: float
    fx: float; fy: float; fz: float
    magnitude: float


class SimulateResponse(BaseModel):
    vectors: List[FieldVector]
    avg_flux_density: float
    peak_flux_density: float
    computation_time_ms: float


class TrainingRun(BaseModel):
    id: str
    version: str
    episodes: int
    avg_reward: float
    power_saving_pct: float
    stability_score: float
    completed_at: str


# ─── PPO Policy (lightweight stub — replace with actual SB3 model in prod) ──
class PPOPolicy:
    """
    Lightweight PPO policy stub.
    In production: loads stable-baselines3 PPO model from GCS/MLflow artifact store.
    
    Action space: Δ coil currents ∈ [-2A, +2A] for each coil.
    Reward: R = stability_norm − 0.3 * power_norm
    """
    
    VERSION = "v3.2"
    TOTAL_EPISODES = 52_480
    AVG_REWARD = 0.847
    
    def __init__(self):
        # Seed for reproducibility
        np.random.seed(42)
        # Weight vector learned during training (simplified linear policy)
        self._weights = np.array([0.18, 0.19, 0.17, 0.18, -0.08, -0.04])
    
    def predict(self, coil_config: CoilConfig, sensor: Optional[SensorReading]) -> dict:
        """
        Compute suggested delta for each coil based on current state.
        Returns suggested absolute coil currents.
        """
        currents = np.array([coil_config.coilA, coil_config.coilB, coil_config.coilC, coil_config.coilD])
        
        # Build observation vector
        flux = sensor.flux if sensor else 1.82
        temp = sensor.temperature if sensor else 52.4
        disp = sensor.displacement if sensor else 14.6
        obs = np.array([flux/2.5, temp/85.0, disp/25.0, *currents/20.0])
        
        # Policy: reduce currents toward minimum stable operating point
        # Stability constraint: flux > 1.4T required for levitation
        target_flux = 1.7  # T — minimum stable flux
        flux_margin = max(0, flux - target_flux)
        
        # Compute reduction factor (more reduction when flux is comfortable)
        reduction = 0.75 + (1.0 - min(flux_margin / 0.8, 1.0)) * 0.05
        reduction += (np.random.random() - 0.5) * 0.02  # small exploration noise
        reduction = float(np.clip(reduction, 0.65, 0.92))
        
        suggested_currents = currents * reduction
        
        # Clip to safe operating range
        suggested_currents = np.clip(suggested_currents, 4.0, 18.0)
        
        # Compute expected metrics
        power_ratio = np.sum(suggested_currents) / np.sum(currents)
        power_saving = (1.0 - power_ratio) * 100.0
        stability = 94.7 - power_saving * 0.12 + np.random.normal(0, 0.5)
        reward = stability / 100.0 - 0.3 * (1.0 - power_ratio)
        confidence = 0.85 + np.random.uniform(0, 0.12)
        
        return {
            "coilA": round(float(suggested_currents[0]), 2),
            "coilB": round(float(suggested_currents[1]), 2),
            "coilC": round(float(suggested_currents[2]), 2),
            "coilD": round(float(suggested_currents[3]), 2),
            "frequency": coil_config.frequency,
            "phase": coil_config.phase,
            "power_saving_pct": round(max(0, power_saving), 2),
            "stability_pct": round(float(np.clip(stability, 70, 99)), 2),
            "reward": round(float(np.clip(reward, 0, 1)), 4),
            "confidence": round(float(np.clip(confidence, 0, 1)), 3),
        }


_policy = PPOPolicy()

# ─── Pre-populated training history ──────────────────────────────────────────
TRAINING_HISTORY: List[TrainingRun] = [
    TrainingRun(
        id=str(uuid.uuid4()), version=f"v{i+1}",
        episodes=(i + 1) * 5248,
        avg_reward=round(0.30 + i * 0.065 + random.uniform(-0.02, 0.02), 3),
        power_saving_pct=round(8.0 + i * 1.5 + random.uniform(-0.5, 0.5), 1),
        stability_score=round(75.0 + i * 2.2 + random.uniform(-1, 1), 1),
        completed_at=datetime(2026, 4, 10 + i, 14, 0, tzinfo=timezone.utc).isoformat(),
    )
    for i in range(10)
]


# ─── Analytical EM Field Simulation ──────────────────────────────────────────
def compute_field_vector(x: float, y: float, z: float, coil: CoilConfig) -> FieldVector:
    """Dipole superposition model for 4 coils at (±a, ±a, 0)."""
    a = 1.0
    coil_positions = [
        (-a, -a, 0, coil.coilA), (a, -a, 0, coil.coilB),
        (a,  a, 0, coil.coilC), (-a, a,  0, coil.coilD),
    ]
    Fx = Fy = Fz = 0.0
    for cx, cy, cz, I in coil_positions:
        dx, dy, dz = x - cx, y - cy, z - cz
        r2 = dx*dx + dy*dy + dz*dz + 1e-6
        r3 = r2 ** 1.5
        mu0 = 4e-7 * math.pi
        k = mu0 * I / (4 * math.pi * r3)
        Fx -= k * dx; Fy -= k * dy; Fz -= k * dz
    magnitude = math.sqrt(Fx*Fx + Fy*Fy + Fz*Fz)
    return FieldVector(x=x, y=y, z=z, fx=round(Fx, 6), fy=round(Fy, 6), fz=round(Fz, 6), magnitude=round(magnitude, 4))


# ─── Routes ──────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "service": "agt-ml-service", "version": "1.0.0", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/model/info")
async def model_info():
    return {
        "agent_version": PPOPolicy.VERSION,
        "algorithm": "PPO",
        "framework": "stable-baselines3==2.3.2",
        "total_episodes": PPOPolicy.TOTAL_EPISODES,
        "avg_reward": PPOPolicy.AVG_REWARD,
        "convergence_rate": 0.947,
        "observation_space": "[flux_density, temperature, displacement, coilA, coilB, coilC, coilD]",
        "action_space": "Δ_coil_currents (continuous, bounded ±2A per coil)",
        "reward_function": "R = stability_score_norm − 0.3 × power_norm",
        "neural_network": "3-layer MLP (256→256→64, tanh activation)",
        "last_trained": TRAINING_HISTORY[-1].completed_at,
        "model_artifact": "gs://agt-mlflow/ppo-v3.2/model.zip",
    }


@app.post("/optimize", response_model=OptimizeResponse)
async def optimize(req: OptimizeRequest):
    """
    Run PPO policy inference to generate an optimal coil configuration.
    Minimizes power consumption while maintaining levitation stability.
    Target: >15% power reduction, >90% stability retention.
    """
    t0 = time.perf_counter()
    
    # Small simulated inference delay (GPU model load in production)
    await asyncio.sleep(0.008 + random.uniform(0, 0.012))
    
    result = _policy.predict(req.coil_config, req.sensor_reading)
    
    latency_ms = (time.perf_counter() - t0) * 1000
    
    return OptimizeResponse(
        request_id=str(uuid.uuid4()),
        experiment_id=req.experiment_id,
        agent_version=PPOPolicy.VERSION,
        suggested_config=CoilConfig(
            coilA=result["coilA"], coilB=result["coilB"],
            coilC=result["coilC"], coilD=result["coilD"],
            frequency=result["frequency"], phase=result["phase"],
        ),
        expected_power_saving_pct=result["power_saving_pct"],
        expected_stability_pct=result["stability_pct"],
        reward_score=result["reward"],
        confidence=result["confidence"],
        optimization_method="ppo-v3.2",
        latency_ms=round(latency_ms, 2),
        generated_at=datetime.now(timezone.utc).isoformat(),
    )


@app.post("/simulate", response_model=SimulateResponse)
async def simulate(req: SimulateRequest):
    """
    Compute analytical EM field vectors using dipole superposition.
    For production: delegates to FEniCS FEM solver on GPU cluster.
    """
    t0 = time.perf_counter()
    g = req.grid_size
    half = g // 2
    
    vectors = []
    all_mags = []
    
    for xi in range(-half, half):
        for yi in range(-half, half):
            for zi in range(-half, half, 2):
                v = compute_field_vector(xi * 0.4, yi * 0.4, zi * 0.4, req.coil_config)
                # Scale magnitude with coil current level
                avg_current = (req.coil_config.coilA + req.coil_config.coilB +
                               req.coil_config.coilC + req.coil_config.coilD) / 4
                scale = avg_current / 8.0
                v.magnitude = round(v.magnitude * scale * 500, 4)
                vectors.append(v)
                all_mags.append(v.magnitude)
    
    latency_ms = (time.perf_counter() - t0) * 1000
    
    return SimulateResponse(
        vectors=vectors,
        avg_flux_density=round(float(np.mean(all_mags)), 4),
        peak_flux_density=round(float(np.max(all_mags)), 4),
        computation_time_ms=round(latency_ms, 2),
    )


@app.get("/training/history", response_model=List[TrainingRun])
async def training_history():
    return TRAINING_HISTORY


@app.post("/training/retrain")
async def retrain(background_tasks: BackgroundTasks):
    """Trigger a background retraining run (queues to MLflow/Vertex AI in production)."""
    run_id = str(uuid.uuid4())
    background_tasks.add_task(_mock_retrain, run_id)
    return {"status": "queued", "run_id": run_id, "message": "Retraining job queued"}


async def _mock_retrain(run_id: str):
    """Simulates a background training run (~30s)."""
    await asyncio.sleep(30)
    new_run = TrainingRun(
        id=run_id, version=f"v{len(TRAINING_HISTORY) + 1}",
        episodes=PPOPolicy.TOTAL_EPISODES + 5248,
        avg_reward=round(PPOPolicy.AVG_REWARD + random.uniform(0, 0.02), 3),
        power_saving_pct=round(22.1 + random.uniform(0, 1.5), 1),
        stability_score=round(94.7 + random.uniform(0, 1.5), 1),
        completed_at=datetime.now(timezone.utc).isoformat(),
    )
    TRAINING_HISTORY.append(new_run)
