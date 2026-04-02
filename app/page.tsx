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

  const isLive = state.buffer.isPlaying && state.buffer.points.length > 0;
  const lastTimestamp =
    state.buffer.points.length > 0
      ? state.buffer.points[state.buffer.points.length - 1].timestamp
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <TopBar
        isLive={isLive}
        lastUpdateTime={state.buffer.lastUpdateTime}
        packetCount={state.buffer.packetCount}
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Error Display */}
        {state.error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm font-mono">
            Error: {state.error}
          </div>
        )}

        {/* System Status Banner */}
        <SystemStatusBanner
          mode={state.currentMode}
          systemStatus={state.currentSystemStatus}
          isLowBattery={state.isLowBattery}
          isSignalLost={state.isSignalLost}
        />

        {/* Main Dashboard */}
        <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
          {/* Left Column: Controls */}
          <div className="w-full lg:w-80 flex flex-col gap-4 order-2 lg:order-1">
            <PlaybackControls
              isPlaying={state.buffer.isPlaying}
              speed={state.buffer.speed}
              isLoading={state.isLoading}
              onTogglePlayback={togglePlayback}
              onSetSpeed={setSpeed}
              onLoadFile={loadFile}
              onReset={reset}
            />

            {/* Telemetry Cards */}
            <div className="flex-1 min-h-0">
              <TelemetryPanel
                data={state.buffer.points}
                isLowBattery={state.isLowBattery}
              />
            </div>
          </div>

          {/* Center Column: Graphs */}
          <div className="flex-1 min-h-0 order-1 lg:order-2">
            <GraphPanel data={state.buffer.points} />
          </div>

          {/* Right Column: Stats */}
          <div className="w-full lg:w-64 flex flex-col order-3">
            <DataStatsPanel
              packetCount={state.buffer.packetCount}
              dataRate={state.dataRate}
              lastTimestamp={lastTimestamp}
              totalPoints={state.buffer.totalPoints}
              data={state.buffer.points}
            />
          </div>
        </div>

        {/* Status Info */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 backdrop-blur-md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Buffer Status</span>
                <span className="text-cyan-400">{state.buffer.points.length}/100</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 transition-all duration-500" 
                  style={{ width: `${Math.min(100, state.buffer.points.length)}%` }}
                />
              </div>
            </div>
            <div>
              <span className="block mb-1">Archive Progress</span>
              <span className="text-white font-bold">
                {state.buffer.totalPoints > 0 
                  ? `${Math.round((state.buffer.currentIndex / state.buffer.totalPoints) * 100)}%` 
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="block mb-1">Total Packets</span>
              <span className="text-white font-bold">{state.buffer.packetCount}</span>
            </div>
            <div>
              <span className="block mb-1">Update Rate</span>
              <span className="text-cyan-400 font-bold">{state.buffer.speed}x SCALE</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
