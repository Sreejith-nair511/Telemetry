'use client';

import React from 'react';

interface TelemetryCardProps {
  label: string;
  value: number | string;
  unit: string;
  status?: 'safe' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  compact?: boolean;
}

export function TelemetryCard({
  label,
  value,
  unit,
  status = 'safe',
  trend,
  compact = false,
}: TelemetryCardProps) {
  const statusColors = {
    safe: 'border-green-500/20 bg-green-500/5 hover:border-green-500/40',
    warning: 'border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/40',
    critical: 'border-red-500/20 bg-red-500/5 hover:border-red-500/40 glow-critical',
  };

  const textColors = {
    safe: 'text-green-400',
    warning: 'text-yellow-400',
    critical: 'text-red-400',
  };

  const formattedValue =
    typeof value === 'number' ? value.toFixed(compact ? 1 : 2) : value;

  if (compact) {
    return (
      <div className={`rounded-xl border backdrop-blur-md p-2 transition-all duration-300 group ${statusColors[status]}`}>
        <div className="text-[9px] font-mono text-slate-500 uppercase tracking-tight mb-0.5 truncate">
          {label}
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className={`text-base font-mono font-bold ${textColors[status]} truncate`}>
            {formattedValue}
          </span>
          <span className="text-[8px] text-slate-600 font-mono uppercase">{unit}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border backdrop-blur-md p-4 transition-all duration-300 group ${statusColors[status]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">
          {label}
        </span>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-bold ${textColors[status]} opacity-60`}>
            <span className="animate-pulse">●</span>
            {trend.toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-3xl font-mono font-bold ${textColors[status]} tracking-tighter transition-all duration-300 group-hover:scale-105 origin-left`}>
          {formattedValue}
        </span>
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{unit}</span>
      </div>
    </div>
  );
}
