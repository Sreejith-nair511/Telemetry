'use client';

import { TelemetryPoint } from './dataEngine';

/**
 * Telemetry Generation Engine - Creates realistic, continuous drone data
 * Ensures smooth evolution of all parameters regardless of data source
 */

interface GeneratorState {
  timestamp: number;
  alt: number;
  vx: number;
  vy: number;
  vz: number;
  roll: number;
  pitch: number;
  yaw: number;
  voltage: number;
  battery: number;
  mode: string;
  systemStatus: string;
  modeTransitionCounter: number;
  descentPhase: boolean;
}

let generatorState: GeneratorState = {
  timestamp: 0,
  alt: 100, // Start at 100m altitude
  vx: 0,
  vy: 0,
  vz: 0,
  roll: 0,
  pitch: 0,
  yaw: 0,
  voltage: 14.8,
  battery: 100,
  mode: 'IDLE',
  systemStatus: 'ARMED',
  modeTransitionCounter: 0,
  descentPhase: false,
};

/**
 * Initialize generator state (call when starting fresh telemetry)
 */
export function initializeGenerator() {
  generatorState = {
    timestamp: 0,
    alt: 100,
    vx: 0,
    vy: 0,
    vz: 0,
    roll: 0,
    pitch: 0,
    yaw: 0,
    voltage: 14.8,
    battery: 100,
    mode: 'IDLE',
    systemStatus: 'ARMED',
    modeTransitionCounter: 0,
    descentPhase: false,
  };
}

/**
 * Sync generator state with a real telemetry point
 * Used to ensure smooth transition from dataset to generation
 */
export function syncWithLastPoint(point: TelemetryPoint) {
  generatorState = {
    ...generatorState,
    alt: point.alt,
    vx: point.vx,
    vy: point.vy,
    vz: point.vz,
    roll: point.roll,
    pitch: point.pitch,
    yaw: point.yaw,
    voltage: point.voltage,
    battery: point.battery,
    mode: point.mode,
    systemStatus: point.systemStatus,
    timestamp: point.timestamp,
  };
}

/**
 * Generate next realistic telemetry point
 * Called every 5 seconds, produces smooth, realistic drone behavior
 */
export function generateTelemetry(): TelemetryPoint {
  generatorState.timestamp += 5000; // 5 second intervals

  // --- MODE TRANSITION LOGIC ---
  // Cycle naturally: IDLE → SEARCHING → ALIGNING → DESCENDING → LANDING → IDLE
  generatorState.modeTransitionCounter++;
  
  if (generatorState.modeTransitionCounter > 24) { 
    // Transition every 2 minutes (24 * 5 seconds) instead of 5 for more dynamic feel
    generatorState.modeTransitionCounter = 0;
    const modes = ['IDLE', 'SEARCHING', 'ALIGNING', 'DESCENDING', 'LANDING'];
    const currentModeIndex = modes.indexOf(generatorState.mode);
    generatorState.mode = modes[(currentModeIndex + 1) % modes.length];
    
    if (generatorState.mode === 'DESCENDING' || generatorState.mode === 'LANDING') {
      generatorState.descentPhase = true;
    } else if (generatorState.mode === 'IDLE') {
      generatorState.descentPhase = false;
      // generatorState.alt remains low until explicit takeoff logic (not implemented yet)
    }
  }

  // --- ALTITUDE CONTROL ---
  if (generatorState.descentPhase) {
    // Gradual descent
    generatorState.alt = Math.max(0.5, generatorState.alt - (0.2 + Math.random() * 0.5));
    generatorState.vz = -(0.1 + Math.random() * 0.2); 
    if (generatorState.alt <= 0.5) {
      generatorState.alt = 0;
      generatorState.vz = 0;
      generatorState.mode = 'IDLE';
      generatorState.descentPhase = false;
    }
  } else if (generatorState.mode !== 'IDLE') {
    // Stable hover with minor drift
    const drift = (Math.random() - 0.5) * 0.2;
    generatorState.alt = Math.max(1, generatorState.alt + drift);
    generatorState.vz = (Math.random() - 0.5) * 0.05;
  }

  // --- VELOCITY VARIATIONS ---
  // Small continuous variations - no abrupt spikes
  generatorState.vx += (Math.random() - 0.5) * 0.1;
  generatorState.vx = Math.max(-1.5, Math.min(1.5, generatorState.vx)); 

  generatorState.vy += (Math.random() - 0.5) * 0.1;
  generatorState.vy = Math.max(-1.5, Math.min(1.5, generatorState.vy));

  // --- ORIENTATION CHANGES ---
  // Smooth gradual transitions
  generatorState.roll += (Math.random() - 0.5) * 1.5;
  generatorState.roll = Math.max(-25, Math.min(25, generatorState.roll));

  generatorState.pitch += (Math.random() - 0.5) * 1.5;
  generatorState.pitch = Math.max(-25, Math.min(25, generatorState.pitch));

  generatorState.yaw += (Math.random() - 0.5) * 2;
  if (generatorState.yaw >= 360) generatorState.yaw -= 360;
  if (generatorState.yaw < 0) generatorState.yaw += 360;

  // --- BATTERY & VOLTAGE ---
  // Slow decay over time - 0.1% every 5 seconds
  generatorState.battery = Math.max(0, generatorState.battery - 0.1);
  generatorState.voltage = 14.8 * (generatorState.battery / 100) + (10 + Math.random() * 0.2); 

  // --- SYSTEM STATUS ---
  generatorState.systemStatus = generatorState.mode === 'IDLE' ? 'ARMED' : generatorState.mode;

  return {
    timestamp: generatorState.timestamp,
    alt: parseFloat(generatorState.alt.toFixed(2)),
    vx: parseFloat(generatorState.vx.toFixed(3)),
    vy: parseFloat(generatorState.vy.toFixed(3)),
    vz: parseFloat(generatorState.vz.toFixed(3)),
    roll: parseFloat(generatorState.roll.toFixed(2)),
    pitch: parseFloat(generatorState.pitch.toFixed(2)),
    yaw: parseFloat(generatorState.yaw.toFixed(2)),
    voltage: parseFloat(generatorState.voltage.toFixed(2)),
    battery: parseFloat(generatorState.battery.toFixed(1)),
    mode: generatorState.mode,
    systemStatus: generatorState.systemStatus,
  };
}

/**
 * Get state for persistence/debugging
 */
export function getGeneratorState() {
  return { ...generatorState };
}

/**
 * Set state from persistence
 */
export function setGeneratorState(state: Partial<GeneratorState>) {
  generatorState = { ...generatorState, ...state };
}
