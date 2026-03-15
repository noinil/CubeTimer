# AGENT.md - Developer & AI Instructions for CubeTimer (v1.1.0)

This document provides essential context and coding standards for AI agents (Gemini-cli, Claude-code, etc.) working on this repository.

## 🛠️ Tech Stack & Environment
- **Core**: React 19 (Functional Components + Hooks), TypeScript 5+, Vite 6.
- **Styling**: Tailwind CSS 4.0+, Lucide React icons.
- **3D Engine**: Three.js, @react-three/fiber, @react-three/drei.
- **Charts**: Recharts.
- **Installation**: Always use `npm install --legacy-peer-deps` due to React 19 peer dependency constraints in the current ecosystem.

## ⏱️ Precision & Timing Logic (CRITICAL)
- **Standard**: All timing must be at **0.001s (millisecond)** precision.
- **High-Res Clock**: Use `performance.now()` for all elapsed time calculations. Do NOT rely on `Date.now()` or `setInterval` tick counts for the actual record.
- **UI Refresh**: During active timing, use a 1ms interval (`setInterval(..., 1)`) or `requestAnimationFrame` to ensure the display looks fluid.
- **Format**: 
  - Under 60s: `S.SSS`
  - Over 60s: `M:SS.SSS`

## 🧩 Domain Knowledge: Cube Logic
- **Scramble Notation**: Standard WCA (World Cube Association) notation.
- **NxNxN Cubes**: 
  - Face order: U, D, L, R, F, B.
  - State: Row-major index arrays (0 to n²-1 per face).
  - Layers: Max inner layers = `floor(n/2)`. Wide moves (Xw) start from n=4.
- **Megaminx**: 
  - Scramble: Pochmann style (D++/R++/U').
  - State: 132-sticker color array.

## 🏗️ Architecture & Patterns
- **Component Reset**: When changing `puzzleType`, always use `key={puzzleType}` on the `Timer` component in `App.tsx` to force a complete state reset and prevent data residue.
- **Refs for State**: Use `useRef` for high-frequency values (start times, intervals) in `Timer.tsx` to avoid stale closure issues during rapid spacebar interactions.
- **UI Language**: Always English for all labels, buttons, and user-facing messages.
- **Theming**: Strict dark mode using `bg-gray-900` as the primary background.

## 📂 Key File Map
- `src/app/App.tsx`: Main entry, puzzle state management, high-level UI.
- `src/app/components/Timer.tsx`: The high-precision timing engine.
- `src/app/components/RubiksCube3D.tsx`: Generic 3D renderer for all NxNxN cubes.
- `src/app/utils/storage.ts`: Persistence layer (localStorage).

---
*Note: This file is optimized for AI consumption. Keep it concise and updated with ogni version release.*
