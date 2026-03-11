// 魔方相关类型定义

export type PuzzleType = '3x3' | '2x2' | '4x4' | '5x5' | '6x6' | '7x7' | 'Megaminx';

export interface TimeRecord {
  id: string;
  time: number; // 毫秒
  scramble: string;
  date: string;
  dnf?: boolean; // Did Not Finish
  plus2?: boolean; // +2 penalty
  puzzleType?: PuzzleType;
}

// 通用魔方状态
export interface CubeState {
  faces?: {
    U: string[];
    D: string[];
    F: string[];
    B: string[];
    L: string[];
    R: string[];
  };
  megaminx?: string[]; // 132 个颜色的数组
}

export type Move = 'U' | 'D' | 'F' | 'B' | 'L' | 'R' |
                   "U'" | "D'" | "F'" | "B'" | "L'" | "R'" |
                   'U2' | 'D2' | 'F2' | 'B2' | 'L2' | 'R2';
