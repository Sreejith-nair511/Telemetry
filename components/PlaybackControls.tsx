'use client';

import React, { useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlaybackControlsProps {
  isPlaying: boolean;
  speed: 1 | 2 | 5;
  isLoading: boolean;
  onTogglePlayback: () => void;
  onSetSpeed: (speed: 1 | 2 | 5) => void;
  onLoadFile: (file: File) => void;
  onReset: () => void;
}

export function PlaybackControls({
  isPlaying,
  speed,
  isLoading,
  onTogglePlayback,
  onSetSpeed,
  onLoadFile,
  onReset,
}: PlaybackControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const speedButtons: Array<1 | 2 | 5> = [1, 2, 5];

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-4 space-y-4">
      <div>
        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">
          Telemetry Source
        </label>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 disabled:opacity-50 rounded-lg border border-slate-700 text-xs font-mono transition-all duration-200 text-slate-300 hover:text-cyan-400"
        >
          {isLoading ? 'SYNCING...' : 'IMPORT ARCHIVE'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">
          Stream Control
        </label>
        <div className="flex gap-2">
          <Button
            onClick={onTogglePlayback}
            variant="outline"
            size="sm"
            className={`flex-1 gap-2 border-slate-700 hover:bg-slate-800 transition-all ${
              isPlaying ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5' : 'text-slate-400'
            }`}
          >
            {isPlaying ? (
              <>
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                STREAMING
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                PAUSED
              </>
            )}
          </Button>
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="border-slate-700 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all"
            title="Clear & Reset Stream"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">
          Time Scale
        </label>
        <div className="grid grid-cols-3 gap-2">
          {speedButtons.map((s) => (
            <button
              key={s}
              onClick={() => onSetSpeed(s)}
              className={`py-2 rounded-lg border font-mono text-xs font-bold transition-all duration-300 ${
                speed === s
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:bg-slate-700/40 hover:text-slate-300'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
