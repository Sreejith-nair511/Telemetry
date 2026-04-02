'use client';

import React from 'react';
import { AlertCircle, Zap } from 'lucide-react';

interface SystemStatusBannerProps {
  mode: string;
  systemStatus: string;
  isLowBattery: boolean;
  isSignalLost: boolean;
}

export function SystemStatusBanner({
  mode,
  systemStatus,
  isLowBattery,
  isSignalLost,
}: SystemStatusBannerProps) {
  const getStatusColor = () => {
    if (isSignalLost) return 'bg-red-500/20 border-red-500/50 text-red-400';
    if (isLowBattery) return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
    return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400';
  };

  const getStatusText = () => {
    if (isSignalLost) return 'SIGNAL LOST';
    if (isLowBattery) return 'LOW BATTERY';
    return 'LIVE TELEMETRY';
  };

  return (
    <div className={`rounded-lg border backdrop-blur-sm p-4 transition-all duration-300 ${getStatusColor()}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isSignalLost ? (
            <AlertCircle className="w-5 h-5 animate-pulse" />
          ) : (
            <div className={`w-3 h-3 rounded-full ${isLowBattery ? 'bg-yellow-500' : 'bg-cyan-400'} animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]`} />
          )}
          <div className="font-mono text-sm font-bold uppercase tracking-wide flex items-center gap-2">
            {getStatusText()}
            {!isSignalLost && !isLowBattery && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-1">Flight Mode</div>
            <div className="text-sm font-mono font-bold text-white">{mode}</div>
          </div>
          
          <div className="text-right border-l border-slate-800 pl-6">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-1">System State</div>
            <div className="text-sm font-mono font-bold text-white">{systemStatus}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
