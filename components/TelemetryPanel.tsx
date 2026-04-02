'use client';

import React from 'react';
import { TelemetryCard } from './TelemetryCard';
import { TelemetryPoint } from '@/app/utils/dataEngine';

interface TelemetryPanelProps {
  data: TelemetryPoint[];
  isLowBattery: boolean;
}

export function TelemetryPanel({
  data,
  isLowBattery,
}: TelemetryPanelProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-64 bg-card/50 backdrop-blur-sm rounded-lg border border-border p-4 flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-muted-foreground text-center">
          Waiting for telemetry data...
        </p>
      </div>
    );
  }

  const lastPoint = data[data.length - 1];

  // Calculate velocity magnitude
  const velocity = Math.sqrt(
    lastPoint.vx ** 2 + lastPoint.vy ** 2 + lastPoint.vz ** 2
  );

  // Calculate pitch and roll magnitudes
  const pitchMagnitude = Math.abs(lastPoint.pitch);
  const rollMagnitude = Math.abs(lastPoint.roll);

  return (
    <div className="w-full space-y-3 overflow-y-auto max-h-[calc(100vh-160px)] lg:max-h-[calc(100vh-400px)] pr-2 scrollbar-hide">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        <TelemetryCard
          label="Altitude"
          value={lastPoint.alt}
          unit="m"
          status={lastPoint.alt > 5 ? 'safe' : 'warning'}
        />
        
        <TelemetryCard
          label="Velocity"
          value={velocity}
          unit="m/s"
          status={velocity > 30 ? 'warning' : 'safe'}
          trend={velocity > 0 ? 'up' : 'stable'}
        />

        <TelemetryCard
          label="Battery"
          value={lastPoint.battery}
          unit="%"
          status={
            isLowBattery ? 'critical' : lastPoint.battery < 30 ? 'warning' : 'safe'
          }
        />

        <TelemetryCard
          label="Voltage"
          value={lastPoint.voltage}
          unit="V"
          status={lastPoint.voltage < 10 ? 'critical' : 'safe'}
        />

        <div className="sm:col-span-2 lg:col-span-1 border-t border-slate-800 pt-3 mt-1">
          <div className="grid grid-cols-3 gap-2">
            <TelemetryCard
              label="Vx"
              value={lastPoint.vx}
              unit="m/s"
              status="safe"
              compact
            />
            <TelemetryCard
              label="Vy"
              value={lastPoint.vy}
              unit="m/s"
              status="safe"
              compact
            />
            <TelemetryCard
              label="Vz"
              value={lastPoint.vz}
              unit="m/s"
              status="safe"
              compact
            />
          </div>
        </div>

        <div className="sm:col-span-2 lg:col-span-1 border-t border-slate-800 pt-3">
          <div className="grid grid-cols-3 gap-2">
            <TelemetryCard
              label="Roll"
              value={lastPoint.roll}
              unit="°"
              status={rollMagnitude > 45 ? 'warning' : 'safe'}
              compact
            />
            <TelemetryCard
              label="Pitch"
              value={lastPoint.pitch}
              unit="°"
              status={pitchMagnitude > 45 ? 'warning' : 'safe'}
              compact
            />
            <TelemetryCard
              label="Yaw"
              value={lastPoint.yaw}
              unit="°"
              status="safe"
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
}
