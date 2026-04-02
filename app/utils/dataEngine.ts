import * as XLSX from 'xlsx';
import { generateTelemetry, syncWithLastPoint } from './telemetryGenerator';

export interface TelemetryPoint {
  timestamp: number; // relative time in milliseconds
  alt: number;
  vx: number;
  vy: number;
  vz: number;
  roll: number;
  pitch: number;
  yaw: number;
  voltage: number;
  battery: number;
  mode: string;
  systemStatus: string;
}

export interface TelemetryBuffer {
  points: TelemetryPoint[];
  currentIndex: number;
  totalPoints: number;
  isPlaying: boolean;
  speed: 1 | 2 | 5;
  lastUpdateTime: number;
  packetCount: number;
}

/**
 * Parse Excel file and extract telemetry data
 */
export async function parseExcelFile(file: File): Promise<TelemetryPoint[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);

        const telemetryData = validateAndCleanData(rows);
        resolve(telemetryData);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Validate and clean telemetry data from parsed Excel rows
 */
function validateAndCleanData(rows: any[]): TelemetryPoint[] {
  if (!rows || rows.length === 0) {
    throw new Error('No data found in Excel file');
  }

  // Get first timestamp for normalization
  const firstTimestamp = parseFloat(rows[0].Timestamp) || 0;
  let lastVoltage = 12.0; // Default voltage

  const telemetryPoints: TelemetryPoint[] = rows
    .map((row, index) => {
      const timestamp = parseFloat(row.Timestamp) || 0;
      const voltage = parseFloat(row.Voltage);
      
      // Update lastVoltage if current is valid
      if (!isNaN(voltage) && voltage > 0) {
        lastVoltage = voltage;
      }

      return {
        timestamp: (timestamp - firstTimestamp) * 1000, // Convert to ms and normalize
        alt: parseFloat(row.Alt) || 0,
        vx: parseFloat(row.Vx) || 0,
        vy: parseFloat(row.Vy) || 0,
        vz: parseFloat(row.Vz) || 0,
        roll: parseFloat(row.Roll) || 0,
        pitch: parseFloat(row.Pitch) || 0,
        yaw: parseFloat(row.Yaw) || 0,
        voltage: !isNaN(voltage) && voltage > 0 ? voltage : lastVoltage,
        battery: Math.max(0, parseFloat(row.Battery) || 0), // Clean negative values
        mode: String(row.Mode || 'IDLE').toUpperCase(),
        systemStatus: String(row.System_Status || 'IDLE').toUpperCase(),
      };
    })
    .filter((point) => !isNaN(point.timestamp)); // Remove invalid timestamps

  if (telemetryPoints.length === 0) {
    throw new Error('No valid telemetry data found');
  }

  return telemetryPoints;
}

/**
 * Initialize playback engine state
 */
export function initializePlaybackEngine(
  data: TelemetryPoint[]
): TelemetryBuffer {
  return {
    points: data.slice(0, Math.min(100, data.length)), // Start with first 100 points
    currentIndex: 0,
    totalPoints: data.length,
    isPlaying: false,
    speed: 1,
    lastUpdateTime: Date.now(),
    packetCount: 0,
  };
}

/**
 * Get next telemetry point (Always returns a valid point)
 * Automatically switches to generation if dataset is exhausted
 */
export function getNextTelemetry(
  allData: TelemetryPoint[],
  currentIndex: number
): { point: TelemetryPoint; nextIndex: number } {
  if (allData.length > 0 && currentIndex < allData.length) {
    const point = allData[currentIndex];
    // If it's the last point in dataset, sync the generator
    if (currentIndex === allData.length - 1) {
      syncWithLastPoint(point);
    }
    return { point, nextIndex: currentIndex + 1 };
  }

  // Dataset exhausted or empty, use generator
  const generatedPoint = generateTelemetry();
  return { point: generatedPoint, nextIndex: currentIndex + 1 };
}

/**
 * Get next batch of telemetry points based on playback speed
 */
export function getNextBatch(
  allData: TelemetryPoint[],
  currentIndex: number,
  batchSize: number,
  speed: 1 | 2 | 5
): { batch: TelemetryPoint[]; nextIndex: number } {
  const adjustedBatchSize = batchSize * speed;
  const batch: TelemetryPoint[] = [];
  let currentPos = currentIndex;

  for (let i = 0; i < adjustedBatchSize; i++) {
    const { point, nextIndex } = getNextTelemetry(allData, currentPos);
    batch.push(point);
    currentPos = nextIndex;
  }

  return {
    batch,
    nextIndex: currentPos,
  };
}

/**
 * Calculate system metrics from telemetry buffer
 */
export function calculateMetrics(buffer: TelemetryBuffer) {
  const points = buffer.points;
  if (points.length === 0) {
    return {
      isLowBattery: false,
      isSignalLost: false,
      dataRate: 0,
      averageVelocity: 0,
      currentMode: 'IDLE',
      currentSystemStatus: 'IDLE',
    };
  }

  const lastPoint = points[points.length - 1];
  const velocity = Math.sqrt(
    lastPoint.vx ** 2 + lastPoint.vy ** 2 + lastPoint.vz ** 2
  );

  return {
    isLowBattery: lastPoint.battery < 20,
    isSignalLost: false, // Set by playback hook based on timing
    dataRate: buffer.packetCount > 0 ? (points.length / (Date.now() - buffer.lastUpdateTime)) * 1000 : 0,
    averageVelocity: velocity,
    currentMode: lastPoint.mode,
    currentSystemStatus: lastPoint.systemStatus,
  };
}
