# AGENT.md - Developer & AI Instructions for CubeTimer (v2.0.0)

This document provides essential context and coding standards for AI agents (Gemini, Claude, etc.) working on this repository.

## 🆕 v2.0.0: Enhanced Statistics Visualization
- **History Reference Lines (Time Distribution)**: Vertical dashed lines for `summary.overall_mean` (gray `#6B7280`), `pb_ao5.time` (purple `#6D28D9`), `pb_ao12.time` (amber `#A16207`). All null-safe.
- **History Reference Lines (Trend Chart)**: Horizontal dashed lines for `pb_single.time` (green `#065F46`), `summary.overall_mean` (gray), `pb_ao5.time` (purple), `pb_ao12.time` (amber). All null-safe.
- **Dynamic Y-Axis**: Time Distribution Y-axis domain is always `[0, sessionMax+1]`; tick step chosen via nice-number algorithm (~4–5 ticks).
- **Dimmed History Curve**: History density overlay in Time Distribution uses `#065F46` (dark green).
- **ExternalStats Type**: Added `.time: number | null` fields to `pb_single`, `pb_ao5`, `pb_ao12`; added `summary.overall_mean: number | null`.

## 🆕 v1.2.2: Historical Stats Integration
- **Load History**: Support for loading external `*_stats.json` files via a "Load History" button in the header.
- **External Stats Display**: Historical PBs and averages are displayed in the `StatCard` components next to current session stats.
- **JSON Schema**: Supports mapping `pb_single.time_fmt`, `summary.overall_mean_fmt`, `pb_ao5.time_fmt`, and `pb_ao12.time_fmt`.
- **UI Styling**: Historical values use the same color as session values but with `opacity-40` and include "PB" or "HIST" labels.

## 🆕 v1.2.1: Penalty Logic & Interaction Fixes
- **DNF & +2 Penalty**: Support for marking the most recent record as DNF or applying a +2s penalty via UI buttons.
- **Sync Logic**: Penalty toggles must use functional state updates in `App.tsx` and sync with `localStorage` via `updateRecord`.
- **Anti-Misclick Interaction**: 
  - The main timer container is for display only.
  - Interaction is restricted to the **Action Pad** button below the time.
  - No keyboard shortcuts for penalties (to prevent accidental triggers).
- **Naming Convention**: Use **"START"** instead of "Reset" for starting a new solve session.

## 🆕 v1.2.0: Touch & Mobile Support
- **Dual-Trigger Logic**: Supports both Spacebar (Keyboard) and Pointer (Touch/Click) via the Action Pad.
- **Pointer Events**: Use `onPointerDown` and `onPointerUp` for timing control.
- **CSS**: `touch-none` and `select-none` are applied to the timer to prevent gesture interference.

## ⏱️ Precision & Timing Logic (CRITICAL)
- **Standard**: All timing must be at **0.001s (millisecond)** precision.
- **High-Res Clock**: Use `performance.now()` for all elapsed time calculations.
- **Format**: 
  - Under 60s: `S.SSS`
  - Over 60s: `M:SS.SSS`

## 🏗️ Architecture & Patterns
- **Component Reset**: When changing `puzzleType`, always use `key={puzzleType}` on the `Timer` component in `App.tsx` to force a complete state reset.
- **Refs for State**: Use `useRef` for high-frequency values (start times, intervals) in `Timer.tsx` to avoid stale closures.
- **UI Language**: Always English for all labels, buttons, and user-facing messages.
- **Theming**: Strict dark mode using `bg-gray-900` as the primary background.

## 📂 Key File Map
- `src/app/App.tsx`: Main entry, puzzle state management, high-level UI.
- `src/app/components/Timer.tsx`: Timing engine with **Action Pad** control.
- `src/app/utils/storage.ts`: Persistence layer (localStorage).

## 🤖 AI Maintenance Rules (MANDATORY)
1. **Sync Documentation**: After implementing any major feature or version bump, you **MUST** update both `AGENT.md` and `README.md`.
2. **Version Alignment**: Ensure the version string in `src/app/App.tsx`, `README.md`, and `AGENT.md` are always aligned.
3. **Single Source of Truth**: Only modify `AGENT.md`; the Git pre-commit hook handles syncing.

---
*Note: This file is optimized for AI consumption. Keep it concise and updated with ogni version release.*
