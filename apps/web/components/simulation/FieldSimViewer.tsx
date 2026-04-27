'use client';
import { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { FieldVector } from '@/lib/types';
import { generateFieldVectors } from '@/lib/mock-data';
import { RotateCcw, Pause, Play, ZoomIn, ZoomOut } from 'lucide-react';

// ─── FIELD VECTOR ARROW ───────────────────────────────────────────────────────
function FieldArrow({ vector, time }: { vector: FieldVector; time: number }) {
  const { x, y, z, fx, fy, fz, magnitude } = vector;
  const meshRef = useRef<THREE.Mesh>(null);

  const clampedMag = Math.min(magnitude / 2.5, 1);
  const color = new THREE.Color().setHSL(0.6 - clampedMag * 0.6, 1, 0.5); // blue→red
  const scale = 0.25 + clampedMag * 0.5;
  const animOffset = Math.sin(time * 0.8 + x + y + z) * 0.05;

  const len = Math.sqrt(fx*fx + fy*fy + fz*fz) + 0.001;
  const dir = new THREE.Vector3(fx/len, fy/len, fz/len);
  const axis = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, dir);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.y = y + animOffset;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[x, y, z]}
      quaternion={quaternion}
      scale={[scale, scale * 2, scale]}
    >
      <coneGeometry args={[0.08, 0.35, 6]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4 + clampedMag * 0.6}
        transparent
        opacity={0.75}
      />
    </mesh>
  );
}

// ─── COIL RING ────────────────────────────────────────────────────────────────
function CoilRing({ position, color, radius = 2.5 }: { position: [number,number,number]; color: string; radius?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.x += delta * 0.2;
  });
  return (
    <mesh ref={meshRef} position={position}>
      <torusGeometry args={[radius, 0.08, 16, 64]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} metalness={0.8} roughness={0.2} />
    </mesh>
  );
}

// ─── LEVITATED OBJECT ─────────────────────────────────────────────────────────
function LevitatedObject({ time }: { time: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(time * 1.2) * 0.12;
      meshRef.current.rotation.y += 0.008;
    }
  });
  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <octahedronGeometry args={[0.4, 0]} />
      <meshStandardMaterial
        color="#00d4ff"
        emissive="#0066ff"
        emissiveIntensity={1.2}
        metalness={1}
        roughness={0.1}
      />
    </mesh>
  );
}

// ─── GRID FLOOR ───────────────────────────────────────────────────────────────
function GridFloor() {
  return (
    <gridHelper args={[10, 20, 'rgba(0,212,255,0.1)', 'rgba(0,212,255,0.05)']} position={[0, -2, 0]} />
  );
}

// ─── SCENE ────────────────────────────────────────────────────────────────────
function Scene({ vectors, playing }: { vectors: FieldVector[]; playing: boolean }) {
  const timeRef = useRef(0);
  const { clock } = useThree();

  useFrame(() => {
    if (playing) timeRef.current = clock.getElapsedTime();
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 4, 0]} color="#00d4ff" intensity={3} distance={8} />
      <pointLight position={[0, -4, 0]} color="#8b5cf6" intensity={2} distance={8} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />

      {/* Coil rings */}
      <CoilRing position={[0, -1.5, 0]} color="#00d4ff" radius={2.8} />
      <CoilRing position={[0, -0.8, 0]} color="#0066ff" radius={2.2} />
      <CoilRing position={[0, 1.5, 0]}  color="#00d4ff" radius={2.8} />
      <CoilRing position={[0, 0.8, 0]}  color="#0066ff" radius={2.2} />

      {/* Field vectors */}
      {vectors.slice(0, 120).map((v, i) => (
        <FieldArrow key={i} vector={v} time={timeRef.current} />
      ))}

      {/* Levitated payload */}
      <LevitatedObject time={timeRef.current} />

      {/* Floor grid */}
      <GridFloor />

      {/* Axis labels */}
      <Text position={[4, 0, 0]} fontSize={0.3} color="#ef4444" anchorX="left">X</Text>
      <Text position={[0, 4, 0]} fontSize={0.3} color="#22c55e" anchorY="bottom">Y</Text>
      <Text position={[0, 0, 4]} fontSize={0.3} color="#3b82f6" anchorX="left">Z</Text>
    </>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function FieldSimViewer({ compact = false }: { compact?: boolean }) {
  const [vectors] = useState(() => generateFieldVectors(6));
  const [playing, setPlaying] = useState(true);
  const height = compact ? 300 : 520;

  return (
    <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', height }}>
      {/* Scanner line effect */}
      <div className="scanner-line" />

      {/* Controls */}
      <div style={{
        position: 'absolute', top: 12, right: 12, zIndex: 10,
        display: 'flex', gap: 6
      }}>
        {[
          { icon: playing ? Pause : Play, label: 'play', action: () => setPlaying(p => !p) },
          { icon: RotateCcw, label: 'reset', action: () => {} },
        ].map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            aria-label={label}
            style={{
              width: 32, height: 32,
              background: 'rgba(6,15,30,0.8)',
              border: '1px solid var(--border-default)',
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.color = 'var(--accent-cyan)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12, zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
          Flux Density
        </div>
        {[
          { label: '≥2.0T', color: '#ef4444' },
          { label: '1.5T', color: '#f97316' },
          { label: '1.0T', color: '#eab308' },
          { label: '0.5T', color: '#22c55e' },
          { label: '0.1T', color: '#3b82f6' },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Status overlay */}
      <div style={{
        position: 'absolute', top: 12, left: 12, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 10px',
        background: 'rgba(6,15,30,0.85)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 6,
      }}>
        <div className="live-dot" />
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-green)', letterSpacing: '0.05em' }}>
          FIELD ACTIVE
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          1.82T avg
        </span>
      </div>

      {/* Canvas */}
      <Canvas
        camera={{ position: [6, 4, 6], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Scene vectors={vectors} playing={playing} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={playing}
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
