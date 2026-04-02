'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TelemetryPoint } from '@/app/utils/dataEngine';

interface GraphPanelProps {
  data: TelemetryPoint[];
}

export function GraphPanel({ data }: GraphPanelProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex-1 bg-card/50 backdrop-blur-sm rounded-lg border border-border p-4 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          No telemetry data to display
        </p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = data.map((point, index) => {
    const now = Date.now();
    const relativeSecs = ((point.timestamp - now) / 1000).toFixed(1);
    return {
      index,
      timestamp: relativeSecs + 's',
      alt: Math.round(point.alt),
      vx: Math.round(point.vx * 100) / 100,
      vy: Math.round(point.vy * 100) / 100,
      vz: Math.round(point.vz * 100) / 100,
      velocity: Math.sqrt(point.vx**2 + point.vy**2 + point.vz**2).toFixed(2),
      roll: Math.round(point.roll * 10) / 10,
      pitch: Math.round(point.pitch * 10) / 10,
      yaw: Math.round(point.yaw * 10) / 10,
      battery: point.battery,
      voltage: point.voltage,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded p-2 text-[10px] text-slate-300 shadow-xl">
        <p className="text-slate-500 mb-1 font-mono">{payload[0].payload.timestamp}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-mono font-bold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-4">
      {/* Primary Metrics Group */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Altitude Chart */}
        <div className="h-64 bg-card/40 backdrop-blur-md rounded-xl border border-border/50 p-4 transition-all hover:border-cyan-500/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Altitude (m)</h3>
            <span className="text-xs font-mono font-bold text-cyan-400">{chartData[chartData.length-1]?.alt}m</span>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="timestamp" hide />
              <YAxis domain={['auto', 'auto']} stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="alt" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Velocity Chart */}
        <div className="h-64 bg-card/40 backdrop-blur-md rounded-xl border border-border/50 p-4 transition-all hover:border-blue-500/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Total Velocity (m/s)</h3>
            <span className="text-xs font-mono font-bold text-blue-400">{chartData[chartData.length-1]?.velocity}</span>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="timestamp" hide />
              <YAxis domain={[0, 'auto']} stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="velocity" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vector Dynamics Group */}
      <div className="h-64 bg-card/40 backdrop-blur-md rounded-xl border border-border/50 p-4 transition-all hover:border-purple-500/30">
        <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4">Velocity Vectors (Vx, Vy, Vz)</h3>
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="timestamp" hide />
            <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="vx" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} name="Vx" />
            <Line type="monotone" dataKey="vy" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} name="Vy" />
            <Line type="monotone" dataKey="vz" stroke="#8b5cf6" strokeWidth={2} dot={false} isAnimationActive={false} name="Vz" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stabilization Group */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Orientation Chart */}
        <div className="h-64 bg-card/40 backdrop-blur-md rounded-xl border border-border/50 p-4 transition-all hover:border-amber-500/30">
          <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4">Attitude Angles (deg)</h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="timestamp" hide />
              <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="roll" stroke="#fbbf24" strokeWidth={2} dot={false} isAnimationActive={false} name="Roll" />
              <Line type="monotone" dataKey="pitch" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} name="Pitch" />
              <Line type="monotone" dataKey="yaw" stroke="#d97706" strokeWidth={2} dot={false} isAnimationActive={false} name="Yaw" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* System Health Chart */}
        <div className="h-64 bg-card/40 backdrop-blur-md rounded-xl border border-border/50 p-4 transition-all hover:border-emerald-500/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">System Energy (%)</h3>
            <span className="text-xs font-mono font-bold text-emerald-400">{chartData[chartData.length-1]?.battery}%</span>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="timestamp" hide />
              <YAxis domain={[0, 100]} stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="battery" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} name="Battery" />
              <Line type="monotone" dataKey="voltage" stroke="#34d399" strokeWidth={2} dot={false} isAnimationActive={false} name="Voltage" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
