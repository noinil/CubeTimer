# 🧩 CubeTimer v2.0.0

[![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r183-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

A high-performance, visually stunning **Professional 3D Cube Timer**. Powered by WebGL, featuring an industrial-grade aesthetic, millisecond-level precision, and full support for 2x2–7x7 cubes plus WCA-standard Megaminx.

---

## 🆕 v2.0.0: Enhanced Statistics Visualization

- **📊 History Reference Lines in Time Distribution**: Vertical dashed lines for historical average (gray), PB Ao5 (purple), and PB Ao12 (amber) overlaid on the session histogram.
- **📈 History Reference Lines in Trend Chart**: Horizontal dashed lines for all-time PB (green), historical average (gray), PB Ao5 (purple), and PB Ao12 (amber) in the Recent 20 Solves panel.
- **Dynamic Y-Axis Ticks**: Time Distribution Y-axis now uses a nice-number algorithm to keep tick labels readable regardless of solve count, while preserving the `sessionMax+1` domain.
- **Dimmed History Curve**: History density curve in Time Distribution uses a darker green to reduce visual noise.

## 🆕 v1.2.1: Penalty Support & Interaction Fixes

- **🔴 Penalty Toggles**: Mark the most recent record as **DNF** or apply a **+2s** penalty instantly after stopping the timer. Results are immediately synced with session history and statistics.
- **🛡️ Anti-Misclick**: Timing control is now restricted to the **"Action Pad"** below the time to prevent accidental starts/stops when interacting with the 3D cube or scramble.
- **START Workflow**: Renamed "Reset" to **"START"** to better guide the user into a new solve session.
- **📊 Historical Stats**: New "Load History" feature to compare current sessions with generated historical statistics.

## 🚀 Features

- **Multi-Puzzle Support**: Support for 2x2, 3x3, 4x4, 5x5, 6x6, 7x7, and Megaminx.
- **3D Preview**: Real-time 3D visualization of the cube state based on the scramble.
- **Precision Timing**: High-resolution timer using `performance.now()` with millisecond precision.
- **Session Statistics**: Automatic calculation of Best, Worst, Average, Ao5, and Ao12 for the current session.
- **Historical Stats**: Load external statistics JSON files to compare your current session with your all-time PBs and averages.
- **Penalty Support**: Easily mark records as DNF or add +2s penalties.
- **Export/Import**: Save and load your session records.

## 📊 Statistics Tools

Inside the `tool/` directory, you'll find `stats_generator.py`, a Python script designed to process your exported session data and generate a comprehensive statistics file.

### Generating Stats

1. Export your records from the UI (saves as `.dat` files).
2. Run the generator:
   ```bash
   python3 tool/stats_generator.py -d /path/to/your/records -t 3x3
   ```
3. This creates a `3x3_stats.json` file.

### Loading History

In the CubeTimer web interface, click the **Load History** button next to the puzzle type selector and select your generated `*_stats.json` file. Your all-time PB and history will appear on the right side of the session statistics cards.

## 🆕 v1.2.0: Touch & Mobile Support

- **Stackmat Emulation**: Mimics professional timers. Long-press on the **START/INSPECT** button to ready (turns green), release to start timing.
- **Full Touch Support**: Optimized for tablets and mobile devices.

---

## 🚀 Quick Start

### 1. Clone & Setup
```bash
git clone https://github.com/YOUR_USERNAME/CubeTimer.git
cd CubeTimer
npm install --legacy-peer-deps
```

### 2. Run Development
```bash
npm run dev
```

---

## 🎮 Usage Guide

| Action | Shortcut / Touch Method |
| :--- | :--- |
| **Start Inspection** | Press Spacebar or **Click/Tap "START"** |
| **Prepare Timer** | Press & **Hold** Space/Button (during inspection) |
| **Start Timing** | **Release** Space/Button (when pad turns green) |
| **Stop Timing** | Press Spacebar or **Click/Tap "STOP"** |
| **Mark DNF** | Click **DNF** button (when timer is stopped) |
| **Mark +2** | Click **+2** button (when timer is stopped) |
| **New Scramble** | Click the **"New Scramble"** button |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Rendering**: Three.js, @react-three/fiber
- **UI Components**: Tailwind CSS v4, Radix UI
- **Analytics**: Recharts

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ for the Cubing Community</p>
