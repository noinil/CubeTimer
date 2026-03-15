# 🧩 CubeTimer v1.2.0

[![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r183-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Live-Demo-orange?style=for-the-badge&logo=github)](https://YOUR_USERNAME.github.io/CubeTimer/)

A high-performance, visually stunning **Professional 3D Cube Timer**. Powered by WebGL, featuring an industrial-grade aesthetic, millisecond-level precision, and full support for 2x2–7x7 cubes plus WCA-standard Megaminx.

---

## 🆕 What's New in v1.2.0

### 📱 Full Touch & Mobile Support
- **Touchpad Experience**: The entire timer area is now a sensitive touch-pad. Perfect for iPad and mobile users.
- **Physical Timer Emulation**: Mimics professional "Stackmat" timers. Long-press on the screen to ready (turns green), release to start timing.
- **Gesture Protection**: Integrated `touch-none` CSS to prevent accidental scrolling or zooming during intense solves.

### ⏱️ Professional-Grade Precision (v1.1.0+)
- **Millisecond Accuracy**: Timer precision at **0.001s**.
- **High-Performance Clock**: Powered by `performance.now()` for microsecond-level accuracy.

### 🌐 Global Accessibility & UX (v1.1.0+)
- **Full English UI**: Seamless international experience.
- **Smart State Reset**: Components automatically reset when switching puzzle types.

---

## ✨ Core Features

### 🎨 Ultimate Visual Aesthetics
- **Professional ABS Material**: Simulates the texture of premium speedcubes.
- **Extreme Rounded Design**: All puzzle stickers feature large Bézier rounded corners.
- **3D Physical Gaps**: Layered structure accurately restores black plastic cut lines.

### ⚙️ Hardcore Engineering
- **Full 3D Coverage**: Supports 2x2, 3x3, 4x4, 5x5, 6x6, 7x7, and **Megaminx**.
- **WCA-Standard Scrambles**: Professional scramble algorithms for all puzzle types.
- **Trackball Free Rotation**: 360-degree unrestricted flipping with dynamic damping.

---

## 🚀 Quick Start

### 1. Clone the project
```bash
git clone https://github.com/YOUR_USERNAME/CubeTimer.git
cd CubeTimer
```

### 2. Install dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Run development server
```bash
npm run dev
```

---

## 🎮 Usage Guide

| Action | Shortcut / Touch Method |
| :--- | :--- |
| **Start Inspection** | Press Spacebar or **Tap Screen** |
| **Prepare Timer** | Press & **Hold** Space/Screen (during inspection) |
| **Start Timing** | **Release** Space/Finger (when display turns green) |
| **Stop Timing** | Press Spacebar or **Tap Screen** again |
| **Free Rotate** | Left-click and drag |
| **Zoom In/Out** | Mouse wheel |
| **New Scramble** | Click the "New Scramble" button |
| **Manual Input** | Click the "Manual Scramble" button |

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Rendering**: [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ for the Cubing Community</p>
