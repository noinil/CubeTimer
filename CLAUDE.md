# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm i          # Install dependencies
npm run dev    # Start development server (Vite)
npm run build  # Production build
```

There is no test suite or linter configured.

## Architecture

This is a React + TypeScript + Vite + Tailwind CSS 4 app — a 3x3 Rubik's Cube speedsolving timer.

**Entry point:** `src/main.tsx` → `src/app/App.tsx`

**Core data flow in `App.tsx`:**
1. On mount, generates a scramble via `generateScramble()` and computes the resulting `CubeState` via `applyScramble()`
2. Passes `scramble` + `onTimeRecorded` callback to `<Timer>`
3. Passes `cubeState` to `<RubiksCubeCSS>` for the 3D preview
4. When a solve completes, saves the `TimeRecord` to `localStorage`, then auto-generates a new scramble after 1 second

**Key files:**
- `src/app/types/cube.ts` — `TimeRecord`, `CubeState`, and `Move` types
- `src/app/utils/cubeLogic.ts` — scramble generation and cube state simulation (pure face-rotation logic, no external library)
- `src/app/utils/storage.ts` — localStorage CRUD for `TimeRecord[]` under key `rubiks-timer-records`
- `src/app/components/Timer.tsx` — spacebar-driven timer (hold to ready → release to start → press to stop); states: `idle | ready | running | stopped`
- `src/app/components/RubiksCubeCSS.tsx` — CSS 3D cube rendered with `preserve-3d`, drag-to-rotate via mouse events
- `src/app/components/Statistics.tsx` — stat cards (best, worst, mean, Ao5, Ao12), Recharts histogram + trend line, and a full solve history table

**UI components:** `src/app/components/ui/` contains a full shadcn/ui component library (Radix UI primitives + Tailwind). These are available to use but most of the app uses custom Tailwind styling directly.

**Path alias:** `@` maps to `src/` (configured in `vite.config.ts`).

**Styling:** Tailwind CSS 4 via `@tailwindcss/vite` plugin. Global styles in `src/styles/`. The app uses a dark theme (`bg-gray-900`).

**`TimeRecord` penalties:** The `dnf` and `plus2` boolean fields exist on the type and are handled in statistics calculations, but the UI for applying them is not yet implemented.
