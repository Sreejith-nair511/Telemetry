'use client';

import React from 'react';
import { TopBar } from '@/components/TopBar';
import { PlaybackControls } from '@/components/PlaybackControls';
import { SystemStatusBanner } from '@/components/SystemStatusBanner';
import { TelemetryPanel } from '@/components/TelemetryPanel';
import { GraphPanel } from '@/components/GraphPanel';
import { DataStatsPanel } from '@/components/DataStatsPanel';
import { usePlaybackEngine } from '@/hooks/usePlaybackEngine';

export default function Page() {
  const { state, loadFile, togglePlayback, setSpeed, reset } = usePlaybackEngine();

  return (
    <div className="min-h-screen bg-background">
      <TopBar
        isLive={state.buffer.isPlaying}
        isSocketConnected={state.isSocketConnected}
        lastUpdateTime={state.buffer.lastUpdateTime}
        packetCount={state.buffer.packetCount}
        lastPacketId={state.lastPacketId}
      />

      <main className="max-w-7xl mx-auto p-4 lg:p-6 lg:h-[calc(100vh-80px)]">
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* Left Column: Controls & Telemetry List */}
          <div className="w-full lg:w-80 flex flex-col gap-6 order-2 lg:order-1">
            <PlaybackControls
              isPlaying={state.buffer.isPlaying}
              speed={state.buffer.speed}
              isLoading={state.isLoading}
              onTogglePlayback={togglePlayback}
              onSetSpeed={setSpeed}
              onLoadFile={loadFile}
              onReset={reset}
            />

            <div className="flex-1 min-h-0">
              <TelemetryPanel
                data={state.buffer.packets.map(p => p.payload)}
                isLowBattery={state.isLowBattery}
              />
            </div>
          </div>

          {/* Center Column: Graphs & Global Status */}
          <div className="flex-1 flex flex-col gap-6 order-1 lg:order-2 min-w-0">
            <SystemStatusBanner
              mode={state.currentMode}
              systemStatus={state.currentSystemStatus}
              isLowBattery={state.isLowBattery}
              isSignalLost={state.isSignalLost}
            />

            <div className="flex-1 min-h-0 bg-slate-900/20 rounded-xl overflow-hidden">
              <GraphPanel data={state.buffer.packets.map(p => ({
                ...p.payload,
                timestamp: p.timestamp // Use absolute packet timestamp for graph X-axis
              }))} />
            </div>

            {/* Packet Monitoring Info */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 backdrop-blur-md">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Packet Buffer</span>
                    <span className="text-cyan-400">{state.buffer.packets.length}/100</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500 transition-all duration-500" 
                      style={{ width: `${Math.min(100, state.buffer.packets.length)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <span className="block mb-1">Stream Latency</span>
                  <span className="text-amber-500 font-bold">{state.lastPacketLatency}ms</span>
                </div>
                <div>
                  <span className="block mb-1">Throughput</span>
                  <span className="text-white font-bold">{state.dataRate.toFixed(1)} P/s</span>
                </div>
                <div>
                  <span className="block mb-1">Scale Factor</span>
                  <span className="text-cyan-400 font-bold">{state.buffer.speed}x</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stats */}
          <div className="w-full lg:w-64 flex flex-col order-3 shrink-0">
            <DataStatsPanel
              packetCount={state.buffer.packetCount}
              dataRate={state.dataRate}
              lastTimestamp={state.buffer.lastUpdateTime}
              totalPoints={state.buffer.totalPoints}
              data={state.buffer.packets.map(p => p.payload)}
              lastPacketId={state.lastPacketId}
              lastPacketLatency={state.lastPacketLatency}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
