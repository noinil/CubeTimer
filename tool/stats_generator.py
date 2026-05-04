#!/usr/bin/env python3
"""
stats_generator.py — Cube timer statistics generator
Scans a directory (recursively) for timer record files matching a given
puzzle type, then computes PB single / Ao5 / Ao12, overall stats, and
an adaptive histogram, and writes everything to a JSON file.

Usage:
    ./stats_generator.py -d ~/records/ -t 3x3
    ./stats_generator.py -d ~/records/ -t Megaminx -o mega_stats.json

Dependencies: numpy (standard in any scientific Python environment)
"""

import argparse
import json
import math
import sys
from datetime import datetime
from pathlib import Path

import numpy as np

# ─── Constants ────────────────────────────────────────────────────────────────

SCHEMA_VERSION = "1.0"

VALID_PUZZLES = ["2x2", "3x3", "4x4", "5x5", "6x6", "7x7", "Megaminx"]

# Histogram parameters
N_BINS = 20
HIST_LOW_PERCENTILE  = 5.0
HIST_HIGH_PERCENTILE = 95.0

# ─── Argument Parsing ─────────────────────────────────────────────────────────

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate a statistics JSON file from cube timer records.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"Supported puzzle types: {', '.join(VALID_PUZZLES)}"
    )
    parser.add_argument(
        "-d", "--directory",
        required=True,
        metavar="DIR",
        help="Root directory to search recursively for record files."
    )
    parser.add_argument(
        "-t", "--type",
        required=True,
        metavar="PUZZLE",
        choices=VALID_PUZZLES,
        help="Puzzle type to filter (case-sensitive)."
    )
    parser.add_argument(
        "-o", "--output",
        default=None,
        metavar="FILE",
        help="Output JSON path. Default: <puzzle>_stats.json in current directory."
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Print per-file parse details."
    )
    return parser.parse_args()

# ─── File Discovery ───────────────────────────────────────────────────────────

def find_record_files(directory: str, puzzle_type: str, verbose: bool) -> list[Path]:
    """
    Walk the directory tree and return files matching the naming convention:
        CubeTimerResults_<puzzle_type>_<YYYYMMDD>_<HHMMSS>.dat

    The puzzle type in the filename is matched case-insensitively, so
    '3x3', '3X3' etc. all work.
    """
    root = Path(directory).expanduser().resolve()
    if not root.is_dir():
        sys.exit(f"[ERROR] '{directory}' is not a valid directory.")

    # Glob pattern: filename encodes the puzzle type directly.
    # We match case-insensitively by checking lowercased stem.
    pattern   = f"CubeTimerResults_{puzzle_type}_*.dat"
    pattern_lo = f"cubetimertesults_{puzzle_type.lower()}_*.dat"  # fallback

    matched: list[Path] = []
    for path in sorted(root.rglob("CubeTimerResults_*.dat")):
        # Extract puzzle token from filename:
        #   CubeTimerResults_5x5_20260406_191453.dat  →  parts[1] == '5x5'
        parts = path.stem.split("_")          # stem = name without .dat
        if len(parts) < 2:
            continue
        if parts[1].lower() == puzzle_type.lower():
            matched.append(path)
            if verbose:
                print(f"  [found] {path}")

    return matched

# ─── Record Parsing ───────────────────────────────────────────────────────────

_DATE_FORMAT = "%Y/%m/%d %H:%M:%S"


def _parse_time(s: str) -> float:
    """Parse time strings like '32.45' or '2:32.45' into float seconds."""
    if ":" in s:
        minutes, rest = s.split(":", 1)
        return int(minutes) * 60 + float(rest)
    return float(s)


def _fmt_time(seconds: float) -> str:
    """Format seconds as 'M:SS.xxx' if >= 60s, otherwise 'S.xxx'."""
    if seconds >= 60:
        m = int(seconds) // 60
        s = seconds - m * 60
        return f"{m}:{s:06.3f}"
    return f"{seconds:.3f}"


def _parse_datetime(s: str) -> datetime:
    """Parse dates like '2026/4/27 21:40:14' (no leading zeros required)."""
    return datetime.strptime(s.strip().rstrip("%"), _DATE_FORMAT)
    # Note: trailing '%' is stripped — this is the zsh no-newline artifact
    # that appears when copy-pasting from the terminal; it is NOT in the file.

def parse_file(path: Path) -> list[tuple[float | None, datetime]]:
    """
    Parse one record file.

    Returns a list of (time, datetime) tuples, where:
      - time is a float (seconds) for a normal solve
      - time is None for a DNF

    Lines starting with '#' and blank lines are ignored.
    Malformed data lines are skipped with a warning.
    """
    solves: list[tuple[float | None, datetime]] = []

    with path.open("r", encoding="utf-8") as f:
        for lineno, raw in enumerate(f, 1):
            line = raw.strip().rstrip("%")
            if not line or line.startswith("#"):
                continue

            # Expected format:  scramble,time,date
            # Splitting with maxsplit=2 is safe even if scramble had commas
            # (scramble moves never contain commas).
            parts = line.split(",", 2)
            if len(parts) < 3:
                print(f"  [warn] {path.name}:{lineno}: unexpected format, skipped.")
                continue

            _scramble, time_str, date_str = parts[0], parts[1].strip(), parts[2].strip()

            try:
                dt = _parse_datetime(date_str)
            except ValueError:
                print(f"  [warn] {path.name}:{lineno}: bad date '{date_str}', skipped.")
                continue

            if time_str.upper() == "DNF":
                solves.append((None, dt))
            else:
                try:
                    solves.append((_parse_time(time_str), dt))
                except ValueError:
                    print(f"  [warn] {path.name}:{lineno}: bad time '{time_str}', skipped.")

    return solves

# ─── Statistics ───────────────────────────────────────────────────────────────

def _ao_window(times: list[float | None]) -> float | None:
    """
    Compute the average-of-N for one window, following WCA convention:
      - Exactly 1 DNF → treated as worst time (dropped in trim), mean of rest
      - 2 or more DNF  → whole window is DNF → returns None
    Drops one best and one worst before averaging (standard Ao5 / Ao12 rule).
    """
    dnf_count = sum(1 for t in times if t is None)
    if dnf_count >= 2:
        return None

    # Replace DNF with +inf so it naturally sorts to the top (worst)
    sortable = sorted(t if t is not None else math.inf for t in times)
    trimmed  = sortable[1:-1]                  # drop best (index 0) and worst (last)

    # Sanity check: after trimming, no +inf should remain (1 DNF was at the tail)
    if math.inf in trimmed:
        return None

    return sum(trimmed) / len(trimmed)


def pb_single(solves: list) -> tuple[float | None, datetime | None]:
    """Return (best_time, achieved_at) across all solves. DNFs are ignored."""
    best_t, best_dt = None, None
    for t, dt in solves:
        if t is None:
            continue
        if best_t is None or t < best_t:
            best_t, best_dt = t, dt
    return best_t, best_dt


def pb_aon(solves: list, n: int) -> tuple[float | None, datetime | None]:
    """
    Sliding window of width n over chronologically sorted solves.
    Returns (best_ao, achieved_at) where achieved_at is the timestamp
    of the *last* solve in the winning window.
    """
    if len(solves) < n:
        return None, None

    best_ao, best_dt = None, None
    for i in range(len(solves) - n + 1):
        window = solves[i : i + n]
        ao = _ao_window([t for t, _ in window])
        if ao is None:
            continue
        if best_ao is None or ao < best_ao:
            best_ao = ao
            best_dt  = window[-1][1]           # timestamp of the last solve in this window

    return best_ao, best_dt


def pb_aon_per_file(per_file_solves: list[list], n: int) -> tuple[float | None, datetime | None]:
    """
    Compute pb_aon independently for each file's solve list, then return the
    best result across all files.  This prevents cross-session boundaries
    (e.g. last solves of one day + first solves of the next month) from
    producing artificially fast averages.
    """
    best_ao, best_dt = None, None
    for file_solves in per_file_solves:
        ao, dt = pb_aon(file_solves, n)
        if ao is None:
            continue
        if best_ao is None or ao < best_ao:
            best_ao, best_dt = ao, dt
    return best_ao, best_dt


def build_histogram(
    valid_times: list[float],
    n_bins: int = N_BINS,
    lo_pct: float = HIST_LOW_PERCENTILE,
    hi_pct: float = HIST_HIGH_PERCENTILE,
) -> dict:
    """
    Adaptive histogram over the [lo_pct, hi_pct] percentile range.
    Solves outside this range are counted as underflow / overflow and are
    NOT silently discarded — they just land outside the plotted bins.
    """
    if not valid_times:
        return {
            "bin_edges": [],
            "counts": [],
            "underflow": 0,
            "overflow": 0,
            "unit": "seconds",
            "note": "No valid solves to histogram.",
        }

    arr = np.array(valid_times)
    lo  = float(np.percentile(arr, lo_pct))
    hi  = float(np.percentile(arr, hi_pct))

    # Degenerate edge case: all times identical
    if lo == hi:
        lo = arr.min() * 0.95
        hi = arr.max() * 1.05

    counts_arr, edges_arr = np.histogram(arr, bins=n_bins, range=(lo, hi))

    underflow = int(np.sum(arr < lo))
    overflow  = int(np.sum(arr > hi))
    # Note: np.histogram with range=(lo, hi) includes hi in the last bin,
    # so arr == hi is NOT overflow.  We mirror that here.
    overflow  = int(np.sum(arr > edges_arr[-1]))

    return {
        "bin_edges": [round(e, 4) for e in edges_arr.tolist()],
        "counts":    counts_arr.tolist(),
        "underflow": underflow,
        "overflow":  overflow,
        "unit":      "seconds",
    }

# ─── JSON Assembly ────────────────────────────────────────────────────────────

def _fmt_dt(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    return dt.strftime("%Y-%m-%dT%H:%M:%S")


def assemble_output(
    puzzle_type: str,
    source_files: list[Path],
    solves: list,
    source_directory: str = "",
    per_file_solves: list[list] | None = None,
) -> dict:
    """
    Compute everything and return the final dict to be serialised as JSON.
    solves must already be sorted chronologically.
    per_file_solves: each element is the chronologically sorted solve list for
    one source file; used to compute Ao5/Ao12 within session boundaries only.
    """
    total      = len(solves)
    total_dnf  = sum(1 for t, _ in solves if t is None)
    valid_times = [t for t, _ in solves if t is not None]

    overall_mean = (
        round(float(np.mean(valid_times)), 3) if valid_times else None
    )

    pb_s,  pb_s_at  = pb_single(solves)
    _pfs = per_file_solves if per_file_solves is not None else [solves]
    pb_a5, pb_a5_at = pb_aon_per_file(_pfs, 5)
    pb_a12,pb_a12_at= pb_aon_per_file(_pfs, 12)

    hist = build_histogram(valid_times)

    return {
        "version":      SCHEMA_VERSION,
        "generated_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "puzzle_type":  puzzle_type,
        "source_directory": source_directory,

        "summary": {
            "total_solves": total,
            "total_dnf":    total_dnf,
            "overall_mean": overall_mean,
            "overall_mean_fmt": _fmt_time(overall_mean) if overall_mean is not None else None,
        },

        "pb_single": {
            "time":        round(pb_s,  3) if pb_s  is not None else None,
            "time_fmt":    _fmt_time(pb_s)  if pb_s  is not None else None,
            "achieved_at": _fmt_dt(pb_s_at),
        },

        "pb_ao5": {
            "time":        round(pb_a5,  3) if pb_a5  is not None else None,
            "time_fmt":    _fmt_time(pb_a5)  if pb_a5  is not None else None,
            "achieved_at": _fmt_dt(pb_a5_at),
            "method":      "drop_best_worst",   # WCA Ao5 convention
        },

        "pb_ao12": {
            "time":        round(pb_a12, 3) if pb_a12 is not None else None,
            "time_fmt":    _fmt_time(pb_a12) if pb_a12 is not None else None,
            "achieved_at": _fmt_dt(pb_a12_at),
            "method":      "drop_best_worst",   # WCA Ao12 convention
        },

        "histogram": hist,
    }

# ─── Entry Point ──────────────────────────────────────────────────────────────

def main() -> None:
    args = parse_args()

    # ── 1. Discover files ────────────────────────────────────────────────────
    print(f"Scanning '{args.directory}' for puzzle type '{args.type}' ...")
    files = find_record_files(args.directory, args.type, args.verbose)

    if not files:
        sys.exit(
            f"[ERROR] No '{args.type}' record files found under '{args.directory}'.\n"
            "        Make sure the files start with:  # puzzle: " + args.type
        )

    print(f"Found {len(files)} matching file(s).")

    # ── 2. Parse ─────────────────────────────────────────────────────────────
    all_solves: list = []
    per_file_solves: list[list] = []
    for path in files:
        solves = parse_file(path)
        if args.verbose:
            dnf_n = sum(1 for t, _ in solves if t is None)
            print(f"  {path.name}: {len(solves)} solves  ({dnf_n} DNF)")
        file_solves_sorted = sorted(solves, key=lambda x: x[1])
        per_file_solves.append(file_solves_sorted)
        all_solves.extend(solves)

    if not all_solves:
        sys.exit("[ERROR] Files were found but contained no parseable solves.")

    # ── 3. Sort chronologically (required for rolling Ao5 / Ao12) ────────────
    all_solves.sort(key=lambda x: x[1])

    total_dnf = sum(1 for t, _ in all_solves if t is None)
    print(f"Total: {len(all_solves)} solves  ({total_dnf} DNF)")

    # ── 4. Compute & serialise ───────────────────────────────────────────────
    root_dir = Path(args.directory).expanduser().resolve()
    output = assemble_output(args.type, files, all_solves, str(root_dir), per_file_solves)

    # Default output: placed in the current working directory
    if args.output:
        out_path = Path(args.output).expanduser().resolve()
    else:
        out_path = Path.cwd() / f"{args.type}_stats.json"

    with out_path.open("w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    # ── 5. Human-readable summary ────────────────────────────────────────────
    pb_s_fmt  = output["pb_single"]["time_fmt"]
    pb_a5_fmt = output["pb_ao5"]["time_fmt"]
    pb_a12_fmt= output["pb_ao12"]["time_fmt"]
    mean_fmt  = output["summary"]["overall_mean_fmt"]

    print(f"\n{'─'*40}")
    print(f"  Puzzle      : {args.type}")
    print(f"  PB Single   : {pb_s_fmt}"   if pb_s_fmt   else "  PB Single   : N/A")
    print(f"  PB Ao5      : {pb_a5_fmt}"  if pb_a5_fmt  else "  PB Ao5      : N/A (need ≥5 solves)")
    print(f"  PB Ao12     : {pb_a12_fmt}" if pb_a12_fmt else "  PB Ao12     : N/A (need ≥12 solves)")
    print(f"  Total solves: {len(all_solves)}  ({total_dnf} DNF)")
    print(f"  Overall mean: {mean_fmt}"   if mean_fmt   else "  Overall mean: N/A")
    print(f"{'─'*40}")
    print(f"\n  JSON saved to:")
    print(f"    {out_path}")


if __name__ == "__main__":
    main()