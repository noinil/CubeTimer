# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install --legacy-peer-deps   # install deps (react/react-dom are peerDeps)
npm run dev                      # dev server at localhost:5173 (Vite, HMR)
npm run build                    # production build
```

No test suite or linter configured.

## Stack & entry point

React + TypeScript + Vite + Tailwind CSS 4. Entry: `src/main.tsx` → `src/app/App.tsx`.
Path alias `@` → `src/`. Dark theme (`bg-gray-900`).

## Key files

| File | Purpose |
|------|---------|
| `src/app/types/cube.ts` | `TimeRecord`, `CubeState`, `PuzzleType` (`'2x2'\|'3x3'\|'4x4'\|'5x5'\|'6x6'\|'7x7'`), `Move` |
| `src/app/utils/cubeLogic.ts` | 3×3 scramble + cube state |
| `src/app/utils/cubeLogic2x2.ts` | 2×2 scramble + cube state (4 stickers/face) |
| `src/app/utils/cubeLogic4x4.ts` | 4×4 scramble + cube state (16 stickers/face, wide moves) |
| `src/app/utils/cubeLogic5x5.ts` | 5×5 scramble + cube state (25 stickers/face, wide moves) |
| `src/app/utils/cubeLogic6x6.ts` | 6×6 scramble + cube state (36 stickers/face, wide + 3-wide moves) |
| `src/app/utils/cubeLogic7x7.ts` | 7×7 scramble + cube state (49 stickers/face, wide + 3-wide moves) |
| `src/app/utils/storage.ts` | localStorage CRUD (`rubiks-timer-records`); `exportRecords(records, puzzleType)` shared by App and Statistics |
| `src/app/components/Timer.tsx` | Spacebar timer with WCA inspection |
| `src/app/components/RubiksCubeCSS.tsx` | CSS `preserve-3d` cube; `size` prop (2\|3\|4\|5\|6\|7) controls face px and grid cols; outer div needs `relative` |
| `src/app/components/Statistics.tsx` | Stat cards, Recharts charts, Ao5/Ao12 table, CSV export |
| `src/app/components/ui/` | shadcn/ui component library (mostly unused directly) |

## App flow

1. Header dropdown selects puzzle type (2×2 / 3×3 / 4×4 / 5×5 / 6×6 / 7×7)
2. On mount or type change: generate scramble → compute `CubeState` → show in preview
3. Spacebar starts timer; on stop, `TimeRecord` (with `puzzleType`) saved to localStorage; new scramble generated after 1 s
4. **Switching puzzle type**: prompts to save current records, then **always** calls `clearAllRecords()` and wipes the list — records do not persist across switches

## Timer state machine

`idle` → (space) → `inspection` → (hold space 300 ms) → `ready` → (release) → `running` → (space) → `stopped`

- Inspection: 15 s WCA countdown in red; expires → auto DNF
- Ready: shows `0.00` in green. Stopped+DNF: shows `DNF` in red
- All state in refs to avoid stale closures

## Scramble rules

- All generators: no same-face+layer consecutive moves; also block opposite-face+same-layer
- **Max layers = `floor(n/2)`** — moving more than half the layers is equivalent to the opposite face + a whole-cube rotation (which changes nothing)
- Lengths: 2×2 = 12, 3×3 = 25, 4×4 = 40, 5×5 = 60, 6×6 = 80, 7×7 = 100
- Move sets by puzzle:
  - 3×3: U/D/F/B/L/R only
  - 4×4/5×5: base + wide (Xw) — floor(n/2) = 2
  - 6×6/7×7: base + wide (Xw) + triple-wide (3Xw) — floor(n/2) = 3

## Cube logic

**2×2** — face indices: `0 1 / 2 3`. CW rotation: `new = [old[2],old[0],old[3],old[1]]`. Edge cycles: 2 stickers per adjacent row/col. CCW = 3× CW.

**4×4** — face indices row-major 0–15. CW rotation: `new[i*4+j] = old[(3-j)*4+i]`. Each move has an outer edge cycle; wide moves add an inner edge cycle. CCW = 3× CW.

**n×n (5–7)** — face indices row-major 0–(n²-1). CW rotation: `new[i*n+j] = old[(n-1-j)*n+i]`. Each move applies up to 3 edge cycle layers (outer, inner1, inner2). CCW = 3× CW.

## Statistics / CSV export

- Ao5/Ao12: `calcAo(records, startIndex, n)` — drop best+worst, average middle; DNF = Infinity; ≥2 DNFs → "DNF"
- Export filename: `CubeTimerResults/<puzzleType>_YYYYMMDD_HHMMSS.dat`
- File format: `# puzzle: 3x3` / `# scramble,time,date` / one row per solve

## Known constraints

- `react`/`react-dom` not auto-installed: `npm install --force react@18.3.1 react-dom@18.3.1` if missing
- `plus2` penalty is in `TimeRecord` and stat calculations but has no UI yet
- Browser download API: `CubeTimerResults/` prefix is a hint only — Chrome may create the subfolder, others may not
