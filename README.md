# ASCEND Telemetry Dashboard 🚀

A premium, high-fidelity telemetry streaming platform for drone and robotics data. Now with **native Raspberry Pi WebSocket support**.

## 🌟 Key Features
- **Real-Time Streaming**: Low-latency telemetry via WebSockets.
- **Always Live**: Continuous 2Hz stream with sliding window visualization.
- **Hardware-Link Monitoring**: Real-time connection status pulse for hardware.
- **Multimodal**: Supports both live hardware (Raspberry Pi) and Excel playback.

---

## 🛠️ Hardware Setup (Raspberry Pi OS)

To stream real-time data from your Raspberry Pi (Running Raspberry Pi OS/Debian) to the dashboard:

### 1. Install System Dependencies
Update your system and install Python 3 development tools:
```bash
sudo apt update
sudo apt install python3-pip python3-venv -y
```

### 2. Create a Virtual Environment (Recommended)
Raspberry Pi OS often requires virtual environments for pip installations:
```bash
cd ~
mkdir ascend-telemetry && cd ascend-telemetry
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Python Dependencies
```bash
pip install websockets
```

### 4. Running the Streamer
Download `scripts/pi_telemetry.py` to your Pi.
- Open the script and update `RELAY_SERVER_URL` with your Dashboard machine's IP (e.g., `ws://192.168.1.10:8080`).
- Run the script:
```bash
python scripts/pi_telemetry.py
```

### 5. (Advanced) Run as a System Service
To make the telemetry stream start automatically on boot:
1. Create a service file: `sudo nano /etc/systemd/system/telemetry.service`
2. Paste the following (adjust paths):
```ini
[Unit]
Description=ASCEND Telemetry Streamer
After=network.target

[Service]
ExecStart=/home/pi/ascend-telemetry/venv/bin/python /home/pi/ascend-telemetry/scripts/pi_telemetry.py
WorkingDirectory=/home/pi/ascend-telemetry
StandardOutput=inherit
StandardError=inherit
Restart=always
User=pi

[Install]
WantedBy=multi-user.target
```
3. Enable and start:
```bash
sudo systemctl enable telemetry.service
sudo systemctl start telemetry.service
```

---

## 🛰️ Relay Server Setup

The relay server acts as the central hub between your Pi and the Dashboard.

### 1. Start the Relay Server
Run this in a separate terminal on your main machine:
```bash
node server/index.js
```
The relay server will listen on `ws://localhost:8080`.

---

## 💻 Dashboard Dashboard Setup

### 1. Install & Start
```bash
npm install
npm run dev
```

### 2. Live Monitoring
- **Automatic Detection**: The dashboard automatically switches to `HARDWARE-LINK` mode once the Pi begins streaming.
- **Visual Cues**: The `Zap` icon in the TopBar will pulse Amber when data is flowing through the WebSocket.

---

## 📊 Telemetry Data Format
The system expects JSON packets:
```json
{
  "timestamp": 1712065800000,
  "alt": 100.5,
  "vx": 0.12,
  "vy": -0.05,
  "vz": 0.01,
  "roll": 2.5,
  "pitch": -1.2,
  "yaw": 355.0,
  "voltage": 14.8,
  "battery": 85.5,
  "mode": "SEARCHING",
  "systemStatus": "ACTIVE"
}
```

---

## 📜 License
MIT
