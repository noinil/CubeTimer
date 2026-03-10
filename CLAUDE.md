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
| `src/app/types/cube.ts` | `TimeRecord`, `CubeState`, `PuzzleType` (`'2x2'\|'3x3'\|'4x4'`), `Move` |
| `src/app/utils/cubeLogic.ts` | 3×3 scramble + cube state |
| `src/app/utils/cubeLogic2x2.ts` | 2×2 scramble + cube state (4 stickers/face) |
| `src/app/utils/cubeLogic4x4.ts` | 4×4 scramble + cube state (16 stickers/face, wide moves) |
| `src/app/utils/storage.ts` | localStorage CRUD (`rubiks-timer-records`); `exportRecords(records, puzzleType)` shared by App and Statistics |
| `src/app/components/Timer.tsx` | Spacebar timer with WCA inspection |
| `src/app/components/RubiksCubeCSS.tsx` | CSS `preserve-3d` cube; `size` prop (2\|3\|4) controls face px and grid cols; outer div needs `relative` |
| `src/app/components/Statistics.tsx` | Stat cards, Recharts charts, Ao5/Ao12 table, CSV export |
| `src/app/components/ui/` | shadcn/ui component library (mostly unused directly) |

## App flow

1. Header dropdown selects puzzle type (2×2 / 3×3 / 4×4)
2. On mount or type change: generate scramble → compute `CubeState` → show in preview
3. Spacebar starts timer; on stop, `TimeRecord` (with `puzzleType`) saved to localStorage; new scramble generated after 1 s
4. **Switching puzzle type**: prompts to save current records, then **always** calls `clearAllRecords()` and wipes the list — records do not persist across switches

## Timer state machine

`idle` → (space) → `inspection` → (hold space 300 ms) → `ready` → (release) → `running` → (space) → `stopped`

- Inspection: 15 s WCA countdown in red; expires → auto DNF
- Ready: shows `0.00` in green. Stopped+DNF: shows `DNF` in red
- All state in refs to avoid stale closures

## Scramble rules

- All generators: no same-face consecutive moves
- **2×2 and 4×4 also block opposite-face consecutive moves** (L↔R, U↔D, F↔B) via `OPPOSITE_FACE` map — prevents pairs like `Rw Lw`
- Lengths: 2×2 = 11, 3×3 = 20, 4×4 = 40
- 4×4 moves: U/D/F/B/L/R + wide Uw/Dw/Fw/Bw/Lw/Rw, each with `'`/`2` variants

## Cube logic

**2×2** — face indices: `0 1 / 2 3`. CW rotation: `new = [old[2],old[0],old[3],old[1]]`. Edge cycles: 2 stickers per adjacent row/col. CCW = 3× CW.

**4×4** — face indices row-major 0–15. CW rotation: `new[i*4+j] = old[(3-j)*4+i]`. Each move has an outer edge cycle; wide moves add an inner edge cycle. CCW = 3× CW.

## Statistics / CSV export

- Ao5/Ao12: `calcAo(records, startIndex, n)` — drop best+worst, average middle; DNF = Infinity; ≥2 DNFs → "DNF"
- Export filename: `CubeTimerResults/<puzzleType>_YYYYMMDD_HHMMSS.dat`
- File format: `# puzzle: 3x3` / `# scramble,time,date` / one row per solve

## Known constraints

- `react`/`react-dom` not auto-installed: `npm install --force react@18.3.1 react-dom@18.3.1` if missing
- `plus2` penalty is in `TimeRecord` and stat calculations but has no UI yet
- Browser download API: `CubeTimerResults/` prefix is a hint only — Chrome may create the subfolder, others may not
