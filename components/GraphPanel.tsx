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
  const chartData = data.map((point, index) => ({
    index,
    timestamp: (point.timestamp / 1000).toFixed(1),
    alt: Math.round(point.alt),
    vx: Math.round(point.vx * 100) / 100,
    vy: Math.round(point.vy * 100) / 100,
    vz: Math.round(point.vz * 100) / 100,
    roll: Math.round(point.roll * 10) / 10,
    pitch: Math.round(point.pitch * 10) / 10,
    yaw: Math.round(point.yaw * 10) / 10,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-300">
        <p className="text-slate-400 mb-1">t: {payload[0].payload.timestamp}s</p>
        {payload.map((entry: any) => (
          <p key={entry.dataKey} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col gap-4 min-h-0">
      {/* Altitude Chart */}
      <div className="flex-1 bg-card/50 backdrop-blur-sm rounded-lg border border-border p-4">
        <h3 className="text-xs font-mono text-slate-400 mb-2 uppercase tracking-wide">
          Altitude vs Time
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="timestamp"
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="alt"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Velocity Components Chart */}
      <div className="flex-1 bg-card/50 backdrop-blur-sm rounded-lg border border-border p-4">
        <h3 className="text-xs font-mono text-slate-400 mb-2 uppercase tracking-wide">
          Velocity Components
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="timestamp"
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="vx"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={500}
              name="Vx"
            />
            <Line
              type="monotone"
              dataKey="vy"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={500}
              name="Vy"
            />
            <Line
              type="monotone"
              dataKey="vz"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={500}
              name="Vz"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Orientation Chart */}
      <div className="flex-1 bg-card/50 backdrop-blur-sm rounded-lg border border-border p-4">
        <h3 className="text-xs font-mono text-slate-400 mb-2 uppercase tracking-wide">
          Orientation Angles
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="timestamp"
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="roll"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={500}
              name="Roll"
            />
            <Line
              type="monotone"
              dataKey="pitch"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={500}
              name="Pitch"
            />
            <Line
              type="monotone"
              dataKey="yaw"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={500}
              name="Yaw"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
