# 🧩 CubeTimer v1.0

[![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r183-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Live-Demo-orange?style=for-the-badge&logo=github)](https://YOUR_USERNAME.github.io/CubeTimer/)

A high-performance, visually stunning **Professional 3D Cube Timer**. Powered by WebGL, featuring an industrial-grade aesthetic, full support for 2x2–7x7 cubes, and WCA-standard Megaminx.

---

## ✨ Core Features

### 🎨 Ultimate Visual Aesthetics
- **Professional ABS Material**: Simulates the texture of premium speedcubes with high contrast and saturated color calibration.
- **Extreme Rounded Design**: All puzzle stickers feature large Bézier rounded corners for a sleek, modern look.
- **3D Physical Gaps**: Layered structure design accurately restores black plastic cut lines between pieces, preventing "sticker transparency."
- **Headlamp Lighting System**: Intelligent follow-camera lighting ensures the front faces are always bright and clear regardless of rotation.

### ⚙️ Hardcore Engineering
- **Full 3D Coverage**: Supports 2x2, 3x3, 4x4, 5x5, 6x6, 7x7, and **Megaminx**.
- **Efficient Scramble Algorithms**:
  - **NxNxN Cubes**: Implements strict "Axis-Switching" logic to eliminate redundant parallel moves.
  - **Megaminx**: Full implementation of the WCA-standard Pochmann (77-move) scramble.
- **Trackball Free Rotation**: 360-degree unrestricted flipping with responsive dynamic damping.
- **Manual Scramble Interface**: Input custom algorithms with multi-line paste support and instant 3D preview.

---

## 🚀 Quick Start

### 1. Clone the project
```bash
git clone https://github.com/YOUR_USERNAME/CubeTimer.git
cd CubeTimer
```

### 2. Install dependencies
Since the project utilizes the React 19 ecosystem, please use the following flag:
```bash
npm install --legacy-peer-deps
```

### 3. Run development server
```bash
npm run dev
```

---

## 🎮 Usage Guide

| Action | Shortcut / Method |
| :--- | :--- |
| **Start Inspection** | Press & Release Spacebar once |
| **Prepare Timer** | Press & **Hold** Spacebar (during inspection) |
| **Start Timing** | **Release** Spacebar (when display turns green) |
| **Stop Timing** | Press Spacebar again |
| **Free Rotate** | Left-click and drag |
| **Zoom In/Out** | Mouse wheel |
| **New Scramble** | Click the "New Scramble" button |
| **Custom Formula** | Click the "Keyboard" icon for manual input |

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
