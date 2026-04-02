'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { TelemetryPoint } from '@/app/utils/dataEngine';

interface DataStatsPanelProps {
  packetCount: number;
  dataRate: number;
  lastTimestamp: number;
  totalPoints: number;
  data: TelemetryPoint[];
}

export function DataStatsPanel({
  packetCount,
  dataRate,
  lastTimestamp,
  totalPoints,
  data,
}: DataStatsPanelProps) {
  const handleExportCSV = () => {
    if (data.length === 0) return;

    const headers = [
      'Timestamp(s)',
      'Altitude(m)',
      'Vx(m/s)',
      'Vy(m/s)',
      'Vz(m/s)',
      'Roll(°)',
      'Pitch(°)',
      'Yaw(°)',
      'Voltage(V)',
      'Battery(%)',
      'Mode',
      'SystemStatus',
    ];

    const rows = data.map((p) => [
      (p.timestamp / 1000).toFixed(3),
      p.alt.toFixed(2),
      p.vx.toFixed(2),
      p.vy.toFixed(2),
      p.vz.toFixed(2),
      p.roll.toFixed(2),
      p.pitch.toFixed(2),
      p.yaw.toFixed(2),
      p.voltage.toFixed(2),
      p.battery.toFixed(1),
      p.mode,
      p.systemStatus,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telemetry-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatTimestamp = (ms: number) => {
    const now = Date.now();
    const diff = Math.max(0, now - ms);
    if (diff < 2000) return 'JUST NOW';
    return `${Math.floor(diff / 1000)}s AGO`;
  };

  return (
    <div className="w-64 space-y-3 overflow-y-auto max-h-[calc(100vh-160px)] pr-2 scrollbar-hide">
      <div className="bg-card/40 backdrop-blur-md rounded-xl border border-border/50 p-4 shadow-lg group hover:border-cyan-500/30 transition-all duration-300">
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
          <span>Packets</span>
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
        </div>
        <div className="text-3xl font-mono font-bold text-white group-hover:text-cyan-400 transition-colors">
          {packetCount.toLocaleString()}
        </div>
      </div>

      <div className="bg-card/40 backdrop-blur-md rounded-xl border border-border/50 p-4 shadow-lg group hover:border-blue-500/30 transition-all duration-300">
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
          Data Rate
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-mono font-bold text-white group-hover:text-blue-400 transition-colors">
            {dataRate.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-600 font-mono uppercase">Hz</div>
        </div>
      </div>

      <div className="bg-card/40 backdrop-blur-md rounded-xl border border-border/50 p-4 shadow-lg group hover:border-purple-500/30 transition-all duration-300">
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
          Buffer Size
        </div>
        <div className="text-3xl font-mono font-bold text-white group-hover:text-purple-400 transition-colors">
          {data.length}
        </div>
        <div className="text-[10px] text-slate-600 font-mono uppercase mt-1">Last 100 Points</div>
      </div>

      <div className="bg-card/40 backdrop-blur-md rounded-xl border border-border/50 p-4 shadow-lg group hover:border-amber-500/30 transition-all duration-300">
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
          Last Sync
        </div>
        <div className="text-xl font-mono font-bold text-amber-500 group-hover:text-amber-400 transition-colors uppercase">
          {formatTimestamp(lastTimestamp)}
        </div>
      </div>

      <button
        onClick={handleExportCSV}
        disabled={data.length === 0}
        className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-slate-700 text-sm font-mono transition-colors flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" />
        Export CSV
      </button>
    </div>
  );
}
