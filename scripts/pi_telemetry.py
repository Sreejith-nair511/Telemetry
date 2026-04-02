import asyncio
import json
import time
import random
import websockets

# Configuration
RELAY_SERVER_URL = "ws://localhost:8080"  # Update with your Dashboard's IP if different
SEND_INTERVAL = 0.5  # 2Hz (Adjust as needed)

async def stream_telemetry():
    print(f"Connecting to telemetry relay at {RELAY_SERVER_URL}...")
    
    try:
        async with websockets.connect(RELAY_SERVER_URL) as websocket:
            print("Connected! Streaming telemetry...")
            
            # Initial State
            alt = 100.0
            battery = 100.0
            mode = "ARMED"
            
            while True:
                # 1. Simulate/Read Data
                # Replace with real sensor readings if available
                alt += (random.random() - 0.5) * 0.2
                vx = (random.random() - 0.5) * 1.0
                vy = (random.random() - 0.5) * 1.0
                vz = (random.random() - 0.5) * 0.1
                roll = (random.random() - 0.5) * 10
                pitch = (random.random() - 0.5) * 10
                yaw = (random.random() - 0.5) * 5
                voltage = 14.8 * (battery / 100.0)
                battery = max(0, battery - 0.05)
                
                # 2. Package into TelemetryPoint format
                telemetry_packet = {
                    "timestamp": int(time.time() * 1000),
                    "alt": round(alt, 2),
                    "vx": round(vx, 3),
                    "vy": round(vy, 3),
                    "vz": round(vz, 3),
                    "roll": round(roll, 2),
                    "pitch": round(pitch, 2),
                    "yaw": round(yaw, 2),
                    "voltage": round(voltage, 2),
                    "battery": round(battery, 1),
                    "mode": mode,
                    "systemStatus": mode
                }
                
                # 3. Send via WebSocket
                await websocket.send(json.dumps(telemetry_packet))
                
                # 4. Wait for next interval
                await asyncio.sleep(SEND_INTERVAL)
                
    except Exception as e:
        print(f"Error: {e}")
        print("Retrying in 5 seconds...")
        await asyncio.sleep(5)
        await stream_telemetry()

if __name__ == "__main__":
    asyncio.run(stream_telemetry())
