# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install --legacy-peer-deps   # Install dependencies (react/react-dom are peerDeps, install with --force if needed)
npm run dev                      # Start development server (Vite, default port 5173)
npm run build                    # Production build
```

There is no test suite or linter configured.

## Architecture

This is a React + TypeScript + Vite + Tailwind CSS 4 app — a 3x3 Rubik's Cube speedsolving timer.

**Entry point:** `src/main.tsx` → `src/app/App.tsx`

**Core data flow in `App.tsx`:**
1. On mount, generates a scramble via `generateScramble()` and computes the resulting `CubeState` via `applyScramble()`
2. Passes `scramble` + `onTimeRecorded(time, dnf?)` callback to `<Timer>`
3. Passes `cubeState` to `<RubiksCubeCSS>` for the 3D preview
4. When a solve completes (or DNFs), saves the `TimeRecord` to `localStorage`, then auto-generates a new scramble after 1 second

**Key files:**
- `src/app/types/cube.ts` — `TimeRecord`, `CubeState`, and `Move` types
- `src/app/utils/cubeLogic.ts` — scramble generation and cube state simulation (pure face-rotation logic, no external library)
- `src/app/utils/storage.ts` — localStorage CRUD for `TimeRecord[]` under key `rubiks-timer-records`
- `src/app/components/Timer.tsx` — spacebar-driven timer with WCA-style inspection
- `src/app/components/RubiksCubeCSS.tsx` — CSS 3D cube rendered with `preserve-3d`, drag-to-rotate across the entire panel
- `src/app/components/Statistics.tsx` — stat cards, Recharts charts, solve history table with per-row Ao5/Ao12, and CSV export

**UI components:** `src/app/components/ui/` contains a full shadcn/ui component library (Radix UI primitives + Tailwind). Most of the app uses custom Tailwind styling directly.

**Path alias:** `@` maps to `src/` (configured in `vite.config.ts`).

**Styling:** Tailwind CSS 4 via `@tailwindcss/vite` plugin. Dark theme (`bg-gray-900`).

## Timer state machine

`idle` → (any space press) → `inspection` → (hold space 300ms) → `ready` → (release space) → `running` → (space press) → `stopped`

- **inspection**: 15-second WCA countdown displayed in red. If it expires before the user holds space, the solve is recorded as DNF automatically.
- **ready**: displays `0.00` in green.
- **stopped + DNF**: displays `DNF` in red.
- After `stopped`, the next space press restarts from `inspection`.
- All timer state uses refs (`inspectionIntervalRef`, `inspectionExpireRef`, `runningIntervalRef`) to avoid stale closure issues. `onTimeRecordedRef` keeps the callback fresh.

## Statistics / records table

- Per-row **Ao5** and **Ao12** are computed by `calcAo(records, startIndex, n)`: takes `n` consecutive records starting at the row's index (newest-first array), drops best and worst, averages the middle. DNF counts as Infinity; two or more DNFs in a window → display "DNF".
- **Save records** button exports a `.dat` (CSV) file via browser download. Filename: `results/YYYYMMDD_HHMMSS.dat`. Format:
  ```
  # scramble,time,date
  R2F'U2B'L...,12.34,2026/3/9 14:25:00
  ```
  Scramble has spaces stripped. Time is formatted (e.g. `12.34` or `1:02.34`). DNF records show `DNF` for time.

## Known constraints / gotchas

- `react` and `react-dom` are listed as `peerDependencies` (optional) and are **not** auto-installed. Run `npm install --force react@18.3.1 react-dom@18.3.1` if they are missing.
- `plus2` penalty exists on `TimeRecord` type and is handled in stat calculations, but there is no UI to apply it yet.
- The browser download API cannot write directly to the filesystem; the `results/` prefix in the filename is a hint — Chrome creates the subfolder in Downloads, other browsers may not.
