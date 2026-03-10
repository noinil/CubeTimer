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

This is a React + TypeScript + Vite + Tailwind CSS 4 app — a Rubik's Cube speedsolving timer supporting 2×2 and 3×3.

**Entry point:** `src/main.tsx` → `src/app/App.tsx`

**Core data flow in `App.tsx`:**
1. User selects puzzle type (2×2 / 3×3) via dropdown in the header
2. On mount or type change, generates a scramble via `generateScramble()` / `generateScramble2x2()` and computes `CubeState` via the corresponding `applyScramble*()`
3. Passes `scramble` + `onTimeRecorded(time, dnf?)` callback to `<Timer>`
4. Passes `cubeState` + `size` to `<RubiksCubeCSS>` for the 3D preview
5. When a solve completes (or DNFs), saves the `TimeRecord` (including `puzzleType`) to `localStorage`, then auto-generates a new scramble after 1 second

**Key files:**
- `src/app/types/cube.ts` — `TimeRecord`, `CubeState`, `PuzzleType`, and `Move` types
- `src/app/utils/cubeLogic.ts` — 3×3 scramble generation and cube state simulation
- `src/app/utils/cubeLogic2x2.ts` — 2×2 scramble generation and cube state simulation (same face names, 4 stickers per face)
- `src/app/utils/storage.ts` — localStorage CRUD for `TimeRecord[]` under key `rubiks-timer-records`
- `src/app/components/Timer.tsx` — spacebar-driven timer with WCA-style inspection
- `src/app/components/RubiksCubeCSS.tsx` — CSS 3D cube rendered with `preserve-3d`, accepts `size` prop (2|3); face dimensions and grid columns adapt automatically
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

## 2×2 cube logic (`cubeLogic2x2.ts`)

Each face has 4 stickers indexed as:
```
0 | 1
-----
2 | 3
```
Clockwise face rotation: `new = [old[2], old[0], old[3], old[1]]`. Edge cycles mirror the 3×3 logic but operate on 2 stickers per adjacent row/column instead of 3. CCW = 3× CW.

## Statistics / records table

- Per-row **Ao5** and **Ao12** are computed by `calcAo(records, startIndex, n)`: takes `n` consecutive records starting at the row's index (newest-first array), drops best and worst, averages the middle. DNF counts as Infinity; two or more DNFs in a window → display "DNF".
- **Save records** button exports a `.dat` (CSV) file via browser download. Filename: `CubeTimerResults/<puzzleType>_YYYYMMDD_HHMMSS.dat`. Format:
  ```
  # puzzle: 3x3
  # scramble,time,date
  R2F'U2B'L...,12.34,2026/3/9 14:25:00
  ```
  Scramble has spaces stripped. Time is formatted (e.g. `12.34` or `1:02.34`). DNF records show `DNF` for time.

## Known constraints / gotchas

- `react` and `react-dom` are listed as `peerDependencies` (optional) and are **not** auto-installed. Run `npm install --force react@18.3.1 react-dom@18.3.1` if they are missing.
- `plus2` penalty exists on `TimeRecord` type and is handled in stat calculations, but there is no UI to apply it yet.
- The browser download API cannot write directly to the filesystem; the `CubeTimerResults/` prefix in the filename is a hint — Chrome creates the subfolder in Downloads, other browsers may not.
- Records from before the 2×2 feature have no `puzzleType` field; treat them as 3×3.
