# 🧩 CubeTimer v1.2.1

[![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r183-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

A high-performance, visually stunning **Professional 3D Cube Timer**. Powered by WebGL, featuring an industrial-grade aesthetic, millisecond-level precision, and full support for 2x2–7x7 cubes plus WCA-standard Megaminx.

---

## 🆕 v1.2.1: Penalty Support & Interaction Fixes

- **🔴 Penalty Toggles**: Mark the most recent record as **DNF** or apply a **+2s** penalty instantly after stopping the timer. Results are immediately synced with session history and statistics.
- **🛡️ Anti-Misclick**: Timing control is now restricted to the **"Action Pad"** below the time to prevent accidental starts/stops when interacting with the 3D cube or scramble.
- **START Workflow**: Renamed "Reset" to **"START"** to better guide the user into a new solve session.

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
