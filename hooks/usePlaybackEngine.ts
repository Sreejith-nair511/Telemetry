'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  parseExcelFile,
  initializePlaybackEngine,
  getNextBatch,
  calculateMetrics,
  TelemetryPoint,
  TelemetryPacket,
  TelemetryBuffer,
} from '@/app/utils/dataEngine';

export interface PlaybackState {
  buffer: TelemetryBuffer;
  isLowBattery: boolean;
  isSignalLost: boolean;
  isSocketConnected: boolean;
  dataRate: number;
  isLoading: boolean;
  error: string | null;
  currentMode: string;
  currentSystemStatus: string;
  lastPacketId: number;
  lastPacketLatency: number;
}

export function usePlaybackEngine() {
  const [state, setState] = useState<PlaybackState>({
    buffer: {
      packets: [],
      currentIndex: 0,
      totalPoints: 0,
      isPlaying: true, // Always Live by default
      speed: 1,
      lastUpdateTime: Date.now(),
      packetCount: 0,
    },
    isLowBattery: false,
    isSignalLost: false,
    isSocketConnected: false,
    dataRate: 0,
    isLoading: false,
    error: null,
    currentMode: 'IDLE',
    currentSystemStatus: 'IDLE',
    lastPacketId: 0,
    lastPacketLatency: 0,
  });

  const allDataRef = useRef<TelemetryPoint[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const lastSignalTimeRef = useRef<number>(Date.now());
  const packetIdCounterRef = useRef<number>(0);

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
        packets: [],
        currentIndex: 0,
        totalPoints: 0,
        packetCount: 0,
        lastUpdateTime: Date.now(),
      },
    }));
    lastSignalTimeRef.current = Date.now();
  }, []);

  /**
   * WebSocket Connection Logic
   */
  useEffect(() => {
    const connectSocket = () => {
      // Connect to the standalone relay server
      const ws = new WebSocket('ws://localhost:8080');
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to Telemetry Relay');
        setState(prev => ({ ...prev, isSocketConnected: true }));
      };

      ws.onmessage = (event) => {
        try {
          const point: TelemetryPoint = JSON.parse(event.data);
          
          setState((prev) => {
            packetIdCounterRef.current += 1;
            const newPacket: TelemetryPacket = {
              id: packetIdCounterRef.current,
              timestamp: Date.now(),
              payload: point,
            };

            const updatedPackets = [...prev.buffer.packets, newPacket];
            const trimmedPackets = updatedPackets.length > 200 ? updatedPackets.slice(-200) : updatedPackets;

            const newBuffer: TelemetryBuffer = {
              ...prev.buffer,
              packets: trimmedPackets,
              packetCount: prev.buffer.packetCount + 1,
              lastUpdateTime: Date.now(),
            };

            lastSignalTimeRef.current = Date.now();
            const metrics = calculateMetrics(newBuffer);

            return {
              ...prev,
              buffer: newBuffer,
              isLowBattery: metrics.isLowBattery,
              dataRate: metrics.dataRate,
              currentMode: metrics.currentMode,
              currentSystemStatus: metrics.currentSystemStatus,
              lastPacketId: metrics.lastPacketId,
              lastPacketLatency: metrics.lastPacketLatency,
            };
          });
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onclose = () => {
        console.log('Telemetry Relay disconnected');
        setState(prev => ({ ...prev, isSocketConnected: false }));
        // Tentative auto-reconnect after 5 seconds
        setTimeout(connectSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  /**
   * Playback interval effect (Only runs if WebSocket is NOT connected)
   */
  useEffect(() => {
    if (!state.buffer.isPlaying || state.isSocketConnected) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Update interval for simulation mode
    intervalRef.current = setInterval(() => {
      setState((prev) => {
        const batchSize = 1;
        const { batch, nextIndex } = getNextBatch(
          allDataRef.current,
          prev.buffer.currentIndex,
          batchSize,
          prev.buffer.speed
        );

        if (batch.length === 0) return prev;

        // Wrap telemetry points into packets
        const newPackets: TelemetryPacket[] = batch.map((point) => {
          packetIdCounterRef.current += 1;
          return {
            id: packetIdCounterRef.current,
            timestamp: Date.now(),
            payload: point,
          };
        });

        // Update buffer: append new packets and keep last 100 for sliding window
        const updatedPackets = [...prev.buffer.packets, ...newPackets];
        const trimmedPackets = updatedPackets.length > 100 ? updatedPackets.slice(-100) : updatedPackets;

        const newBuffer: TelemetryBuffer = {
          ...prev.buffer,
          packets: trimmedPackets,
          currentIndex: nextIndex,
          packetCount: prev.buffer.packetCount + newPackets.length,
          lastUpdateTime: Date.now(),
        };

        lastSignalTimeRef.current = Date.now();

        // Calculate metrics
        const metrics = calculateMetrics(newBuffer);

        return {
          ...prev,
          buffer: newBuffer,
          isLowBattery: metrics.isLowBattery,
          dataRate: metrics.dataRate,
          currentMode: metrics.currentMode,
          currentSystemStatus: metrics.currentSystemStatus,
          lastPacketId: metrics.lastPacketId,
          lastPacketLatency: metrics.lastPacketLatency,
        };
      });
    }, 500 / state.buffer.speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.buffer.isPlaying, state.buffer.speed, state.isSocketConnected]);

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
