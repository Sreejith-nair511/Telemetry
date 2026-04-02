'use client';

import React from 'react';
import { Satellite } from 'lucide-react';

interface TopBarProps {
  isLive: boolean;
  lastUpdateTime: number;
  packetCount: number;
  lastPacketId: number;
}

export function TopBar({
  isLive,
  lastUpdateTime,
  packetCount,
  lastPacketId,
}: TopBarProps) {
  const formatTime = (ms: number) => {
    const now = Date.now();
    const secondsAgo = Math.floor((now - ms) / 1000);
    
    if (secondsAgo < 60) {
      return `${secondsAgo}s ago`;
    }
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo}m ago`;
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-[#0a0e27]/60 backdrop-blur-xl border-b border-white/5 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-10 h-10 rounded-lg bg-[#111833] border border-white/10 flex items-center justify-center overflow-hidden">
              <img src="/favicon.png" alt="ASCEND Logo" className="w-7 h-7 object-contain" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-mono font-black text-white tracking-[0.2em] uppercase">
                ASCEND <span className="text-cyan-500">Base Station</span>
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/5 border border-white/10 text-slate-500 tracking-widest uppercase">
                v2.2.1-LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Aerospace Telemetry Orchestrator</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <div className="space-y-1">
            <div className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.2em]">Signal Link</div>
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5 items-end h-3">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className={`w-1 rounded-full transition-all duration-500 ${
                      isLive ? 'bg-cyan-500' : 'bg-slate-700'
                    }`} 
                    style={{ height: `${i * 25}%`, opacity: isLive ? 1 : 0.3 }}
                  />
                ))}
              </div>
              <span className={`text-xs font-mono font-bold tracking-widest ${isLive ? 'text-white' : 'text-slate-500'}`}>
                {isLive ? 'ESTABLISHED' : 'SEARCHING...'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.2em]">Mission Clock</div>
            <div className="text-xs font-mono font-bold text-white tracking-widest">
              {packetCount > 0 ? formatTime(lastUpdateTime).toUpperCase() : '00:00:00'}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.2em]">Data Stream</div>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-slate-700'}`} />
              <div className="flex flex-col">
                <span className="text-xs font-mono font-bold text-cyan-500 tracking-widest">
                  {packetCount.toLocaleString()} <span className="text-slate-600 font-normal ml-1">PKTS</span>
                </span>
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter">
                  ID: {lastPacketId.toString().padStart(6, '0')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`} />
        </div>
      </div>
    </div>
  );
}
