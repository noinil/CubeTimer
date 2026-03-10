import type { CubeState, Move } from '../types/cube';

// 创建已还原的二阶魔方状态（每面4格）
export function createSolvedCube2x2(): CubeState {
  return {
    faces: {
      U: Array(4).fill('#FFFFFF'),
      D: Array(4).fill('#FFFF00'),
      F: Array(4).fill('#00FF00'),
      B: Array(4).fill('#0000FF'),
      L: Array(4).fill('#FF8800'),
      R: Array(4).fill('#FF0000'),
    },
  };
}

// 生成二阶打乱公式（默认11步）
export function generateScramble2x2(length: number = 11): string {
  const moves: Move[] = ['U', 'D', 'F', 'B', 'L', 'R'];
  const modifiers = ['', "'", '2'];
  const scramble: string[] = [];
  let lastMove = '';

  for (let i = 0; i < length; i++) {
    let move: string;
    do {
      const baseMove = moves[Math.floor(Math.random() * moves.length)];
      const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
      move = baseMove + modifier;
    } while (move[0] === lastMove[0]);

    scramble.push(move);
    lastMove = move;
  }

  return scramble.join(' ');
}

// 二阶面顺时针旋转
// 面格子编号：
//   0 | 1
//   -----
//   2 | 3
function rotateFaceClockwise2x2(state: CubeState, face: keyof CubeState['faces']) {
  const f = state.faces[face];
  const [a, b, c, d] = f;
  // 顺时针：new[0]=old[2], new[1]=old[0], new[2]=old[3], new[3]=old[1]
  f[0] = c; f[1] = a; f[2] = d; f[3] = b;
}

function rotateFaceCounterClockwise2x2(state: CubeState, face: keyof CubeState['faces']) {
  rotateFaceClockwise2x2(state, face);
  rotateFaceClockwise2x2(state, face);
  rotateFaceClockwise2x2(state, face);
}

// 各面顺时针时的边缘循环
function rotateEdgesU2x2(state: CubeState) {
  const { F, R, B, L } = state.faces;
  const [f0, f1] = [F[0], F[1]];
  F[0] = R[0]; F[1] = R[1];
  R[0] = B[0]; R[1] = B[1];
  B[0] = L[0]; B[1] = L[1];
  L[0] = f0;   L[1] = f1;
}

function rotateEdgesD2x2(state: CubeState) {
  const { F, R, B, L } = state.faces;
  const [f2, f3] = [F[2], F[3]];
  F[2] = L[2]; F[3] = L[3];
  L[2] = B[2]; L[3] = B[3];
  B[2] = R[2]; B[3] = R[3];
  R[2] = f2;   R[3] = f3;
}

function rotateEdgesF2x2(state: CubeState) {
  const { U, R, D, L } = state.faces;
  const [u2, u3] = [U[2], U[3]];
  U[2] = L[3]; U[3] = L[1];
  L[1] = D[0]; L[3] = D[1];
  D[0] = R[2]; D[1] = R[0];
  R[0] = u2;   R[2] = u3;
}

function rotateEdgesB2x2(state: CubeState) {
  const { U, R, D, L } = state.faces;
  const [u0, u1] = [U[0], U[1]];
  U[0] = R[1]; U[1] = R[3];
  R[1] = D[3]; R[3] = D[2];
  D[2] = L[0]; D[3] = L[2];
  L[0] = u1;   L[2] = u0;
}

function rotateEdgesL2x2(state: CubeState) {
  const { U, F, D, B } = state.faces;
  const [u0, u2] = [U[0], U[2]];
  U[0] = B[3]; U[2] = B[1];
  B[1] = D[2]; B[3] = D[0];
  D[0] = F[0]; D[2] = F[2];
  F[0] = u0;   F[2] = u2;
}

function rotateEdgesR2x2(state: CubeState) {
  const { U, F, D, B } = state.faces;
  const [u1, u3] = [U[1], U[3]];
  U[1] = F[1]; U[3] = F[3];
  F[1] = D[1]; F[3] = D[3];
  D[1] = B[2]; D[3] = B[0];
  B[0] = u3;   B[2] = u1;
}

// 应用单步移动
export function applyMove2x2(state: CubeState, move: Move): CubeState {
  const newState = JSON.parse(JSON.stringify(state)) as CubeState;
  const face = move[0] as keyof CubeState['faces'];
  const modifier = move.slice(1);
  const times = modifier === '2' ? 2 : 1;
  const ccw = modifier === "'";

  const edgeRotators: Record<string, (s: CubeState) => void> = {
    U: rotateEdgesU2x2, D: rotateEdgesD2x2,
    F: rotateEdgesF2x2, B: rotateEdgesB2x2,
    L: rotateEdgesL2x2, R: rotateEdgesR2x2,
  };

  for (let i = 0; i < times; i++) {
    if (ccw) {
      rotateFaceCounterClockwise2x2(newState, face);
      // CCW 边缘 = 顺时针转3次
      edgeRotators[face](newState);
      edgeRotators[face](newState);
      edgeRotators[face](newState);
    } else {
      rotateFaceClockwise2x2(newState, face);
      edgeRotators[face](newState);
    }
  }

  return newState;
}

// 应用打乱公式
export function applyScramble2x2(scramble: string): CubeState {
  const moves = scramble.split(' ').filter(m => m.trim());
  let state = createSolvedCube2x2();
  for (const move of moves) {
    state = applyMove2x2(state, move as Move);
  }
  return state;
}
