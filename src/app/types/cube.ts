// 魔方相关类型定义

export interface TimeRecord {
  id: string;
  time: number; // 毫秒
  scramble: string;
  date: string;
  dnf?: boolean; // Did Not Finish
  plus2?: boolean; // +2 penalty
}

export interface CubeState {
  // 魔方状态，用于3D渲染
  // 每个面6个面，每个面9个小方块
  faces: {
    U: string[]; // Up (white)
    D: string[]; // Down (yellow)
    F: string[]; // Front (green)
    B: string[]; // Back (blue)
    L: string[]; // Left (orange)
    R: string[]; // Right (red)
  };
}

export type Move = 'U' | 'D' | 'F' | 'B' | 'L' | 'R' | 
                   "U'" | "D'" | "F'" | "B'" | "L'" | "R'" |
                   'U2' | 'D2' | 'F2' | 'B2' | 'L2' | 'R2';
