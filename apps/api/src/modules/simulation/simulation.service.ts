import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface FieldVector { x: number; y: number; z: number; fx: number; fy: number; fz: number; magnitude: number; }

export interface SimulationJob {
  id: string;
  experimentId: string;
  coilConfig: Record<string, number>;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
  fieldVectors?: FieldVector[];
  avgFluxDensity?: number;
  peakFluxDensity?: number;
  simulationTimeMs?: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

const JOB_STORE = new Map<string, SimulationJob>();

// Pre-populated job
const PRE = {
  id: 'sim-001', experimentId: 'exp-001',
  coilConfig: { coilA: 8.4, coilB: 7.9, coilC: 8.1, coilD: 8.3, frequency: 50, phase: 0 },
  status: 'COMPLETED' as const, progress: 100,
  fieldVectors: generateVectors(6),
  avgFluxDensity: 1.82, peakFluxDensity: 2.31, simulationTimeMs: 28400,
  createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  startedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  completedAt: new Date(Date.now() - 1000 * 60 * 88).toISOString(),
};
JOB_STORE.set(PRE.id, PRE);

function generateVectors(g: number): FieldVector[] {
  const vecs: FieldVector[] = [];
  for (let x = -g/2; x < g/2; x++) for (let y = -g/2; y < g/2; y++) for (let z = -g/2; z < g/2; z += 2) {
    const d = Math.sqrt(x*x + y*y + (z-0.5)*(z-0.5)) + 0.01;
    const mag = Math.min(1.8 / (d * d), 2.5);
    vecs.push({ x, y, z, fx: -x/(d*d*d)*1.8, fy: -y/(d*d*d)*1.8, fz: -(z-0.5)/(d*d*d)*1.8, magnitude: mag });
  }
  return vecs;
}

@Injectable()
export class SimulationService {
  private readonly logger = new Logger(SimulationService.name);

  async submit(experimentId: string, coilConfig: Record<string, number>): Promise<SimulationJob> {
    const job: SimulationJob = {
      id: uuidv4(), experimentId, coilConfig,
      status: 'QUEUED', progress: 0,
      createdAt: new Date().toISOString(),
    };
    JOB_STORE.set(job.id, job);
    this.logger.log(`Simulation job ${job.id} queued for ${experimentId}`);

    // Async simulation — runs in background
    this.runSimulation(job.id).catch(err => this.logger.error(err));
    return job;
  }

  private async runSimulation(jobId: string): Promise<void> {
    const job = JOB_STORE.get(jobId);
    if (!job) return;

    job.status = 'RUNNING';
    job.startedAt = new Date().toISOString();
    const t0 = Date.now();

    // Simulate FEM computation in 3 stages
    for (const pct of [25, 60, 100]) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
      job.progress = pct;
    }

    job.fieldVectors = generateVectors(5);
    job.avgFluxDensity = +(1.7 + Math.random() * 0.3).toFixed(3);
    job.peakFluxDensity = +(job.avgFluxDensity + 0.3 + Math.random() * 0.2).toFixed(3);
    job.simulationTimeMs = Date.now() - t0;
    job.status = 'COMPLETED';
    job.completedAt = new Date().toISOString();
    this.logger.log(`Simulation ${jobId} completed in ${job.simulationTimeMs}ms`);
  }

  getJob(id: string): SimulationJob {
    const job = JOB_STORE.get(id);
    if (!job) throw new NotFoundException(`Simulation job ${id} not found`);
    return job;
  }

  listJobs(experimentId?: string): SimulationJob[] {
    return [...JOB_STORE.values()]
      .filter(j => !experimentId || j.experimentId === experimentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  cancel(id: string): SimulationJob {
    const job = this.getJob(id);
    if (job.status === 'COMPLETED' || job.status === 'FAILED') return job;
    job.status = 'FAILED';
    job.error = 'Cancelled by user';
    return job;
  }
}
