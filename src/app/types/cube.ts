// 魔方相关类型定义

export type PuzzleType = '3x3' | '2x2' | '4x4' | '5x5' | '6x6' | '7x7';

export interface TimeRecord {
  id: string;
  time: number; // 毫秒
  scramble: string;
  date: string;
  dnf?: boolean; // Did Not Finish
  plus2?: boolean; // +2 penalty
  puzzleType?: PuzzleType;
}

// 通用魔方状态（每面格子数由阶数决定：3x3=9格，2x2=4格）
export interface CubeState {
  faces: {
    U: string[];
    D: string[];
    F: string[];
    B: string[];
    L: string[];
    R: string[];
  };
}

export type Move = 'U' | 'D' | 'F' | 'B' | 'L' | 'R' |
                   "U'" | "D'" | "F'" | "B'" | "L'" | "R'" |
                   'U2' | 'D2' | 'F2' | 'B2' | 'L2' | 'R2';
