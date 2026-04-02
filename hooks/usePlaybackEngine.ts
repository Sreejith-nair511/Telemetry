'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  parseExcelFile,
  initializePlaybackEngine,
  getNextBatch,
  calculateMetrics,
  TelemetryPoint,
  TelemetryBuffer,
} from '@/app/utils/dataEngine';

export interface PlaybackState {
  buffer: TelemetryBuffer;
  isLowBattery: boolean;
  isSignalLost: boolean;
  dataRate: number;
  isLoading: boolean;
  error: string | null;
  currentMode: string;
  currentSystemStatus: string;
}

export function usePlaybackEngine() {
  const [state, setState] = useState<PlaybackState>({
    buffer: {
      points: [],
      currentIndex: 0,
      totalPoints: 0,
      isPlaying: true, // Always Live by default
      speed: 1,
      lastUpdateTime: Date.now(),
      packetCount: 0,
    },
    isLowBattery: false,
    isSignalLost: false,
    dataRate: 0,
    isLoading: false,
    error: null,
    currentMode: 'IDLE',
    currentSystemStatus: 'IDLE',
  });

  const allDataRef = useRef<TelemetryPoint[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSignalTimeRef = useRef<number>(Date.now());

  /**
   * Load Excel file and initialize playback
   */
  const loadFile = useCallback(async (file: File) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const telemetryData = await parseExcelFile(file);
      allDataRef.current = telemetryData;

      // Start from index 0 of the new dataset
      setState((prev) => ({
        ...prev,
        buffer: {
          ...prev.buffer,
          currentIndex: 0,
          totalPoints: telemetryData.length,
        },
        isLoading: false,
      }));
      lastSignalTimeRef.current = Date.now();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, []);

  /**
   * Toggle playback (Now acts as a "Pause Visualization" rather than "Stop Stream")
   */
  const togglePlayback = useCallback(() => {
    setState((prev) => ({
      ...prev,
      buffer: { ...prev.buffer, isPlaying: !prev.buffer.isPlaying },
    }));
  }, []);

  /**
   * Set playback speed
   */
  const setSpeed = useCallback((speed: 1 | 2 | 5) => {
    setState((prev) => ({
      ...prev,
      buffer: { ...prev.buffer, speed },
    }));
  }, []);

  /**
   * Reset playback - clears dataset and restarts generation
   */
  const reset = useCallback(() => {
    allDataRef.current = [];
    setState((prev) => ({
      ...prev,
      buffer: {
        ...prev.buffer,
        points: [],
        currentIndex: 0,
        totalPoints: 0,
        packetCount: 0,
        lastUpdateTime: Date.now(),
      },
    }));
    lastSignalTimeRef.current = Date.now();
  }, []);

  /**
   * Playback interval effect
   */
  useEffect(() => {
    if (!state.buffer.isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Update interval
    intervalRef.current = setInterval(() => {
      setState((prev) => {
        const batchSize = 1; // Stream 1 point every 5 seconds as requested
        const { batch, nextIndex } = getNextBatch(
          allDataRef.current,
          prev.buffer.currentIndex,
          batchSize,
          prev.buffer.speed
        );

        if (batch.length === 0) return prev;

        // Update buffer: append new points and keep last 100 for sliding window
        const newPoints = [...prev.buffer.points, ...batch];
        const trimmedPoints = newPoints.length > 100 ? newPoints.slice(-100) : newPoints;

        const newBuffer: TelemetryBuffer = {
          ...prev.buffer,
          points: trimmedPoints,
          currentIndex: nextIndex,
          packetCount: prev.buffer.packetCount + batch.length,
          lastUpdateTime: Date.now(),
        };

        lastSignalTimeRef.current = Date.now();

        // Calculate metrics
        const metrics = calculateMetrics(newBuffer);

        return {
          ...prev,
          buffer: newBuffer,
          isLowBattery: metrics.isLowBattery,
          dataRate: 1 / 5, // 1 point every 5 seconds = 0.2 rows/sec
          currentMode: metrics.currentMode,
          currentSystemStatus: metrics.currentSystemStatus,
        };
      });
    }, 5000 / state.buffer.speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.buffer.isPlaying, state.buffer.speed]);

  // Check for signal loss (>10 seconds without data update)
  useEffect(() => {
    const signalLossInterval = setInterval(() => {
      setState((prev) => {
        const timeSinceLastSignal = Date.now() - lastSignalTimeRef.current;
        const isSignalLost = timeSinceLastSignal > 10000;
        return { ...prev, isSignalLost };
      });
    }, 1000);

    return () => clearInterval(signalLossInterval);
  }, []);

  return {
    state,
    loadFile,
    togglePlayback,
    setSpeed,
    reset,
  };
}
