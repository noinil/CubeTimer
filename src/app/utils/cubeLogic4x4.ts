import type { CubeState } from '../types/cube';

type Face = keyof CubeState['faces'];

// 4x4 面格子编号（行优先）：
//  0  1  2  3
//  4  5  6  7
//  8  9 10 11
// 12 13 14 15

export function createSolvedCube4x4(): CubeState {
  return {
    faces: {
      U: Array(16).fill('#FFFFFF'),
      D: Array(16).fill('#FFFF00'),
      F: Array(16).fill('#00FF00'),
      B: Array(16).fill('#0000FF'),
      L: Array(16).fill('#FF8800'),
      R: Array(16).fill('#FF0000'),
    },
  };
}

const OPPOSITE_FACE: Record<string, string> = { U:'D', D:'U', F:'B', B:'F', L:'R', R:'L' };

// 生成四阶打乱（40步，包含普通移动和宽转）
export function generateScramble4x4(length: number = 40): string {
  const baseMoves = ['U', 'D', 'F', 'B', 'L', 'R'];
  const wideMoves = baseMoves.map(m => m + 'w');
  const allMoves = [...baseMoves, ...wideMoves];
  const modifiers = ['', "'", '2'];
  const scramble: string[] = [];
  let lastFace = '';

  for (let i = 0; i < length; i++) {
    let base: string;
    let move: string;
    let face: string;
    do {
      base = allMoves[Math.floor(Math.random() * allMoves.length)];
      const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
      move = base + modifier;
      face = base[0];
    } while (face === lastFace || face === OPPOSITE_FACE[lastFace]);

    scramble.push(move);
    lastFace = base[0];
  }

  return scramble.join(' ');
}

// 顺时针面旋转：new[i*4+j] = old[(3-j)*4+i]
function rotateFaceClockwise4x4(state: CubeState, face: Face) {
  const f = [...state.faces[face]];
  const s = state.faces[face];
  s[0]  = f[12]; s[1]  = f[8];  s[2]  = f[4];  s[3]  = f[0];
  s[4]  = f[13]; s[5]  = f[9];  s[6]  = f[5];  s[7]  = f[1];
  s[8]  = f[14]; s[9]  = f[10]; s[10] = f[6];  s[11] = f[2];
  s[12] = f[15]; s[13] = f[11]; s[14] = f[7];  s[15] = f[3];
}

function rotateFaceCounterClockwise4x4(state: CubeState, face: Face) {
  rotateFaceClockwise4x4(state, face);
  rotateFaceClockwise4x4(state, face);
  rotateFaceClockwise4x4(state, face);
}

// ── 边缘循环函数（均为顺时针） ──────────────────────────────────────

// U 外层（row 0）: F←R←B←L←F（前面从右面获得颜色，依此类推）
function edgesU_outer(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[0], F[1], F[2], F[3]];
  F[0]=R[0]; F[1]=R[1]; F[2]=R[2]; F[3]=R[3];
  R[0]=B[0]; R[1]=B[1]; R[2]=B[2]; R[3]=B[3];
  B[0]=L[0]; B[1]=L[1]; B[2]=L[2]; B[3]=L[3];
  L[0]=t[0]; L[1]=t[1]; L[2]=t[2]; L[3]=t[3];
}

// U 内层（row 1）
function edgesU_inner(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[4], F[5], F[6], F[7]];
  F[4]=R[4]; F[5]=R[5]; F[6]=R[6]; F[7]=R[7];
  R[4]=B[4]; R[5]=B[5]; R[6]=B[6]; R[7]=B[7];
  B[4]=L[4]; B[5]=L[5]; B[6]=L[6]; B[7]=L[7];
  L[4]=t[0]; L[5]=t[1]; L[6]=t[2]; L[7]=t[3];
}

// D 外层（row 3）: F←L←B←R←F
function edgesD_outer(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[12], F[13], F[14], F[15]];
  F[12]=L[12]; F[13]=L[13]; F[14]=L[14]; F[15]=L[15];
  L[12]=B[12]; L[13]=B[13]; L[14]=B[14]; L[15]=B[15];
  B[12]=R[12]; B[13]=R[13]; B[14]=R[14]; B[15]=R[15];
  R[12]=t[0]; R[13]=t[1]; R[14]=t[2]; R[15]=t[3];
}

// D 内层（row 2）
function edgesD_inner(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[8], F[9], F[10], F[11]];
  F[8]=L[8]; F[9]=L[9]; F[10]=L[10]; F[11]=L[11];
  L[8]=B[8]; L[9]=B[9]; L[10]=B[10]; L[11]=B[11];
  B[8]=R[8]; B[9]=R[9]; B[10]=R[10]; B[11]=R[11];
  R[8]=t[0]; R[9]=t[1]; R[10]=t[2]; R[11]=t[3];
}

// F 外层（U row3, R col0, D row0, L col3）
function edgesF_outer(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[12], U[13], U[14], U[15]];
  U[12]=L[15]; U[13]=L[11]; U[14]=L[7]; U[15]=L[3];
  L[3]=D[0];  L[7]=D[1];  L[11]=D[2]; L[15]=D[3];
  D[0]=R[12]; D[1]=R[8];  D[2]=R[4];  D[3]=R[0];
  R[0]=t[0];  R[4]=t[1];  R[8]=t[2];  R[12]=t[3];
}

// F 内层（U row2, R col1, D row1, L col2）
function edgesF_inner(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[8], U[9], U[10], U[11]];
  U[8]=L[14]; U[9]=L[10]; U[10]=L[6]; U[11]=L[2];
  L[2]=D[4];  L[6]=D[5];  L[10]=D[6]; L[14]=D[7];
  D[4]=R[13]; D[5]=R[9];  D[6]=R[5];  D[7]=R[1];
  R[1]=t[0];  R[5]=t[1];  R[9]=t[2];  R[13]=t[3];
}

// B 外层（U row0, R col3, D row3, L col0）
function edgesB_outer(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[0], U[1], U[2], U[3]];
  U[0]=R[3];  U[1]=R[7];  U[2]=R[11]; U[3]=R[15];
  R[3]=D[15]; R[7]=D[14]; R[11]=D[13]; R[15]=D[12];
  D[12]=L[0]; D[13]=L[4]; D[14]=L[8]; D[15]=L[12];
  L[0]=t[3];  L[4]=t[2];  L[8]=t[1];  L[12]=t[0];
}

// B 内层（U row1, R col2, D row2, L col1）
function edgesB_inner(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[4], U[5], U[6], U[7]];
  U[4]=R[2];  U[5]=R[6];  U[6]=R[10]; U[7]=R[14];
  R[2]=D[11]; R[6]=D[10]; R[10]=D[9]; R[14]=D[8];
  D[8]=L[1];  D[9]=L[5];  D[10]=L[9]; D[11]=L[13];
  L[1]=t[3];  L[5]=t[2];  L[9]=t[1];  L[13]=t[0];
}

// L 外层（U col0, F col0, D col0, B col3 reversed）
function edgesL_outer(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[0], U[4], U[8], U[12]];
  U[0]=B[15]; U[4]=B[11]; U[8]=B[7];  U[12]=B[3];
  B[3]=D[12]; B[7]=D[8];  B[11]=D[4]; B[15]=D[0];
  D[0]=F[0];  D[4]=F[4];  D[8]=F[8];  D[12]=F[12];
  F[0]=t[0];  F[4]=t[1];  F[8]=t[2];  F[12]=t[3];
}

// L 内层（U col1, F col1, D col1, B col2 reversed）
function edgesL_inner(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[1], U[5], U[9], U[13]];
  U[1]=B[14]; U[5]=B[10]; U[9]=B[6];  U[13]=B[2];
  B[2]=D[13]; B[6]=D[9];  B[10]=D[5]; B[14]=D[1];
  D[1]=F[1];  D[5]=F[5];  D[9]=F[9];  D[13]=F[13];
  F[1]=t[0];  F[5]=t[1];  F[9]=t[2];  F[13]=t[3];
}

// R 外层（U col3, F col3, D col3, B col0 reversed）
function edgesR_outer(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[3], U[7], U[11], U[15]];
  U[3]=F[3];  U[7]=F[7];  U[11]=F[11]; U[15]=F[15];
  F[3]=D[3];  F[7]=D[7];  F[11]=D[11]; F[15]=D[15];
  D[3]=B[12]; D[7]=B[8];  D[11]=B[4];  D[15]=B[0];
  B[0]=t[3];  B[4]=t[2];  B[8]=t[1];  B[12]=t[0];
}

// R 内层（U col2, F col2, D col2, B col1 reversed）
function edgesR_inner(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[2], U[6], U[10], U[14]];
  U[2]=F[2];  U[6]=F[6];  U[10]=F[10]; U[14]=F[14];
  F[2]=D[2];  F[6]=D[6];  F[10]=D[10]; F[14]=D[14];
  D[2]=B[13]; D[6]=B[9];  D[10]=B[5];  D[14]=B[1];
  B[1]=t[3];  B[5]=t[2];  B[9]=t[1];  B[13]=t[0];
}

const outerFns: Record<string, (s: CubeState) => void> = {
  U: edgesU_outer, D: edgesD_outer,
  F: edgesF_outer, B: edgesB_outer,
  L: edgesL_outer, R: edgesR_outer,
};

const innerFns: Record<string, (s: CubeState) => void> = {
  U: edgesU_inner, D: edgesD_inner,
  F: edgesF_inner, B: edgesB_inner,
  L: edgesL_inner, R: edgesR_inner,
};

export function applyMove4x4(state: CubeState, move: string): CubeState {
  const newState = JSON.parse(JSON.stringify(state)) as CubeState;

  // 解析：Uw2 → face=U, wide=true, modifier='2'
  //        R'  → face=R, wide=false, modifier="'"
  const m = move.match(/^([UDFBLR])(w?)('|2?)$/);
  if (!m) return newState;

  const face = m[1] as Face;
  const wide = m[2] === 'w';
  const modifier = m[3];
  const times = modifier === '2' ? 2 : 1;
  const ccw = modifier === "'";

  const applyCW = () => {
    rotateFaceClockwise4x4(newState, face);
    outerFns[face](newState);
    if (wide) innerFns[face](newState);
  };

  const applyCCW = () => {
    rotateFaceCounterClockwise4x4(newState, face);
    // CCW 边缘 = 顺时针 × 3
    outerFns[face](newState); outerFns[face](newState); outerFns[face](newState);
    if (wide) {
      innerFns[face](newState); innerFns[face](newState); innerFns[face](newState);
    }
  };

  for (let i = 0; i < times; i++) {
    ccw ? applyCCW() : applyCW();
  }

  return newState;
}

export function applyScramble4x4(scramble: string): CubeState {
  const moves = scramble.split(' ').filter(m => m.trim());
  let state = createSolvedCube4x4();
  for (const move of moves) {
    state = applyMove4x4(state, move);
  }
  return state;
}
