import type { CubeState } from '../types/cube';

type Face = keyof CubeState['faces'];

// 6x6 面格子编号（行优先）：
//  0  1  2  3  4  5
//  6  7  8  9 10 11
// 12 13 14 15 16 17
// 18 19 20 21 22 23
// 24 25 26 27 28 29
// 30 31 32 33 34 35

export function createSolvedCube6x6(): CubeState {
  return {
    faces: {
      U: Array(36).fill('#FFFFFF'),
      D: Array(36).fill('#FFFF00'),
      F: Array(36).fill('#00FF00'),
      B: Array(36).fill('#0000FF'),
      L: Array(36).fill('#FF8800'),
      R: Array(36).fill('#FF0000'),
    },
  };
}

const OPPOSITE_FACE: Record<string, string> = { U:'D', D:'U', F:'B', B:'F', L:'R', R:'L' };

function parseFaceLayer(base: string): { face: string; layer: number } {
  if (base.startsWith('3')) return { face: base[1], layer: 3 };
  if (base.endsWith('w')) return { face: base[0], layer: 2 };
  return { face: base[0], layer: 1 };
}

// 生成六阶打乱（80步，最多 floor(6/2)=3 层）
export function generateScramble6x6(length: number = 80): string {
  const baseMoves = ['U', 'D', 'F', 'B', 'L', 'R'];
  const wideMoves = baseMoves.map(m => m + 'w');
  const triWideMoves = baseMoves.map(m => '3' + m + 'w');
  const allMoves = [...baseMoves, ...wideMoves, ...triWideMoves];
  const modifiers = ['', "'", '2'];
  const scramble: string[] = [];
  let lastFace = '';
  let lastLayer = 0;

  for (let i = 0; i < length; i++) {
    let base: string;
    let move: string;
    let face: string;
    let layer: number;
    do {
      base = allMoves[Math.floor(Math.random() * allMoves.length)];
      const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
      move = base + modifier;
      const parsed = parseFaceLayer(base);
      face = parsed.face;
      layer = parsed.layer;
    } while (
      (face === lastFace && layer === lastLayer) ||
      (face === OPPOSITE_FACE[lastFace] && layer === lastLayer)
    );

    scramble.push(move);
    lastFace = face;
    lastLayer = layer;
  }

  return scramble.join(' ');
}

// 顺时针面旋转：new[i*6+j] = old[(5-j)*6+i]
function rotateFaceClockwise6x6(state: CubeState, face: Face) {
  const f = [...state.faces[face]];
  const s = state.faces[face];
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      s[i * 6 + j] = f[(5 - j) * 6 + i];
    }
  }
}

function rotateFaceCounterClockwise6x6(state: CubeState, face: Face) {
  rotateFaceClockwise6x6(state, face);
  rotateFaceClockwise6x6(state, face);
  rotateFaceClockwise6x6(state, face);
}

// ── 边缘循环函数（均为顺时针） ──────────────────────────────────────

// U 外层（row 0）: F←R←B←L
function edgesU_outer(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[0], F[1], F[2], F[3], F[4], F[5]];
  F[0]=R[0]; F[1]=R[1]; F[2]=R[2]; F[3]=R[3]; F[4]=R[4]; F[5]=R[5];
  R[0]=B[0]; R[1]=B[1]; R[2]=B[2]; R[3]=B[3]; R[4]=B[4]; R[5]=B[5];
  B[0]=L[0]; B[1]=L[1]; B[2]=L[2]; B[3]=L[3]; B[4]=L[4]; B[5]=L[5];
  L[0]=t[0]; L[1]=t[1]; L[2]=t[2]; L[3]=t[3]; L[4]=t[4]; L[5]=t[5];
}

// U 内层1（row 1）
function edgesU_inner1(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[6], F[7], F[8], F[9], F[10], F[11]];
  F[6]=R[6];   F[7]=R[7];   F[8]=R[8];   F[9]=R[9];   F[10]=R[10]; F[11]=R[11];
  R[6]=B[6];   R[7]=B[7];   R[8]=B[8];   R[9]=B[9];   R[10]=B[10]; R[11]=B[11];
  B[6]=L[6];   B[7]=L[7];   B[8]=L[8];   B[9]=L[9];   B[10]=L[10]; B[11]=L[11];
  L[6]=t[0];   L[7]=t[1];   L[8]=t[2];   L[9]=t[3];   L[10]=t[4];  L[11]=t[5];
}

// U 内层2（row 2）
function edgesU_inner2(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[12], F[13], F[14], F[15], F[16], F[17]];
  F[12]=R[12]; F[13]=R[13]; F[14]=R[14]; F[15]=R[15]; F[16]=R[16]; F[17]=R[17];
  R[12]=B[12]; R[13]=B[13]; R[14]=B[14]; R[15]=B[15]; R[16]=B[16]; R[17]=B[17];
  B[12]=L[12]; B[13]=L[13]; B[14]=L[14]; B[15]=L[15]; B[16]=L[16]; B[17]=L[17];
  L[12]=t[0];  L[13]=t[1];  L[14]=t[2];  L[15]=t[3];  L[16]=t[4];  L[17]=t[5];
}

// D 外层（row 5）: F←L←B←R
function edgesD_outer(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[30], F[31], F[32], F[33], F[34], F[35]];
  F[30]=L[30]; F[31]=L[31]; F[32]=L[32]; F[33]=L[33]; F[34]=L[34]; F[35]=L[35];
  L[30]=B[30]; L[31]=B[31]; L[32]=B[32]; L[33]=B[33]; L[34]=B[34]; L[35]=B[35];
  B[30]=R[30]; B[31]=R[31]; B[32]=R[32]; B[33]=R[33]; B[34]=R[34]; B[35]=R[35];
  R[30]=t[0];  R[31]=t[1];  R[32]=t[2];  R[33]=t[3];  R[34]=t[4];  R[35]=t[5];
}

// D 内层1（row 4）
function edgesD_inner1(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[24], F[25], F[26], F[27], F[28], F[29]];
  F[24]=L[24]; F[25]=L[25]; F[26]=L[26]; F[27]=L[27]; F[28]=L[28]; F[29]=L[29];
  L[24]=B[24]; L[25]=B[25]; L[26]=B[26]; L[27]=B[27]; L[28]=B[28]; L[29]=B[29];
  B[24]=R[24]; B[25]=R[25]; B[26]=R[26]; B[27]=R[27]; B[28]=R[28]; B[29]=R[29];
  R[24]=t[0];  R[25]=t[1];  R[26]=t[2];  R[27]=t[3];  R[28]=t[4];  R[29]=t[5];
}

// D 内层2（row 3）
function edgesD_inner2(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[18], F[19], F[20], F[21], F[22], F[23]];
  F[18]=L[18]; F[19]=L[19]; F[20]=L[20]; F[21]=L[21]; F[22]=L[22]; F[23]=L[23];
  L[18]=B[18]; L[19]=B[19]; L[20]=B[20]; L[21]=B[21]; L[22]=B[22]; L[23]=B[23];
  B[18]=R[18]; B[19]=R[19]; B[20]=R[20]; B[21]=R[21]; B[22]=R[22]; B[23]=R[23];
  R[18]=t[0];  R[19]=t[1];  R[20]=t[2];  R[21]=t[3];  R[22]=t[4];  R[23]=t[5];
}

// F 外层（U row5, R col0, D row0, L col5）
function edgesF_outer(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[30], U[31], U[32], U[33], U[34], U[35]];
  U[30]=L[35]; U[31]=L[29]; U[32]=L[23]; U[33]=L[17]; U[34]=L[11]; U[35]=L[5];
  L[5]=D[0];   L[11]=D[1];  L[17]=D[2];  L[23]=D[3];  L[29]=D[4];  L[35]=D[5];
  D[0]=R[30];  D[1]=R[24];  D[2]=R[18];  D[3]=R[12];  D[4]=R[6];   D[5]=R[0];
  R[0]=t[0];   R[6]=t[1];   R[12]=t[2];  R[18]=t[3];  R[24]=t[4];  R[30]=t[5];
}

// F 内层1（U row4, R col1, D row1, L col4）
function edgesF_inner1(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[24], U[25], U[26], U[27], U[28], U[29]];
  U[24]=L[34]; U[25]=L[28]; U[26]=L[22]; U[27]=L[16]; U[28]=L[10]; U[29]=L[4];
  L[4]=D[6];   L[10]=D[7];  L[16]=D[8];  L[22]=D[9];  L[28]=D[10]; L[34]=D[11];
  D[6]=R[31];  D[7]=R[25];  D[8]=R[19];  D[9]=R[13];  D[10]=R[7];  D[11]=R[1];
  R[1]=t[0];   R[7]=t[1];   R[13]=t[2];  R[19]=t[3];  R[25]=t[4];  R[31]=t[5];
}

// F 内层2（U row3, R col2, D row2, L col3）
function edgesF_inner2(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[18], U[19], U[20], U[21], U[22], U[23]];
  U[18]=L[33]; U[19]=L[27]; U[20]=L[21]; U[21]=L[15]; U[22]=L[9];  U[23]=L[3];
  L[3]=D[12];  L[9]=D[13];  L[15]=D[14]; L[21]=D[15]; L[27]=D[16]; L[33]=D[17];
  D[12]=R[32]; D[13]=R[26]; D[14]=R[20]; D[15]=R[14]; D[16]=R[8];  D[17]=R[2];
  R[2]=t[0];   R[8]=t[1];   R[14]=t[2];  R[20]=t[3];  R[26]=t[4];  R[32]=t[5];
}

// B 外层（U row0, R col5, D row5, L col0）
function edgesB_outer(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[0], U[1], U[2], U[3], U[4], U[5]];
  U[0]=R[5];   U[1]=R[11];  U[2]=R[17];  U[3]=R[23];  U[4]=R[29];  U[5]=R[35];
  R[5]=D[35];  R[11]=D[34]; R[17]=D[33]; R[23]=D[32]; R[29]=D[31]; R[35]=D[30];
  D[30]=L[0];  D[31]=L[6];  D[32]=L[12]; D[33]=L[18]; D[34]=L[24]; D[35]=L[30];
  L[0]=t[5];   L[6]=t[4];   L[12]=t[3];  L[18]=t[2];  L[24]=t[1];  L[30]=t[0];
}

// B 内层1（U row1, R col4, D row4, L col1）
function edgesB_inner1(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[6], U[7], U[8], U[9], U[10], U[11]];
  U[6]=R[4];   U[7]=R[10];  U[8]=R[16];  U[9]=R[22];  U[10]=R[28]; U[11]=R[34];
  R[4]=D[29];  R[10]=D[28]; R[16]=D[27]; R[22]=D[26]; R[28]=D[25]; R[34]=D[24];
  D[24]=L[1];  D[25]=L[7];  D[26]=L[13]; D[27]=L[19]; D[28]=L[25]; D[29]=L[31];
  L[1]=t[5];   L[7]=t[4];   L[13]=t[3];  L[19]=t[2];  L[25]=t[1];  L[31]=t[0];
}

// B 内层2（U row2, R col3, D row3, L col2）
function edgesB_inner2(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[12], U[13], U[14], U[15], U[16], U[17]];
  U[12]=R[3];  U[13]=R[9];  U[14]=R[15]; U[15]=R[21]; U[16]=R[27]; U[17]=R[33];
  R[3]=D[23];  R[9]=D[22];  R[15]=D[21]; R[21]=D[20]; R[27]=D[19]; R[33]=D[18];
  D[18]=L[2];  D[19]=L[8];  D[20]=L[14]; D[21]=L[20]; D[22]=L[26]; D[23]=L[32];
  L[2]=t[5];   L[8]=t[4];   L[14]=t[3];  L[20]=t[2];  L[26]=t[1];  L[32]=t[0];
}

// L 外层（U col0, F col0, D col0, B col5 reversed）
function edgesL_outer(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[0], U[6], U[12], U[18], U[24], U[30]];
  U[0]=B[35];  U[6]=B[29];  U[12]=B[23]; U[18]=B[17]; U[24]=B[11]; U[30]=B[5];
  B[5]=D[30];  B[11]=D[24]; B[17]=D[18]; B[23]=D[12]; B[29]=D[6];  B[35]=D[0];
  D[0]=F[0];   D[6]=F[6];   D[12]=F[12]; D[18]=F[18]; D[24]=F[24]; D[30]=F[30];
  F[0]=t[0];   F[6]=t[1];   F[12]=t[2];  F[18]=t[3];  F[24]=t[4];  F[30]=t[5];
}

// L 内层1（U col1, F col1, D col1, B col4 reversed）
function edgesL_inner1(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[1], U[7], U[13], U[19], U[25], U[31]];
  U[1]=B[34];  U[7]=B[28];  U[13]=B[22]; U[19]=B[16]; U[25]=B[10]; U[31]=B[4];
  B[4]=D[31];  B[10]=D[25]; B[16]=D[19]; B[22]=D[13]; B[28]=D[7];  B[34]=D[1];
  D[1]=F[1];   D[7]=F[7];   D[13]=F[13]; D[19]=F[19]; D[25]=F[25]; D[31]=F[31];
  F[1]=t[0];   F[7]=t[1];   F[13]=t[2];  F[19]=t[3];  F[25]=t[4];  F[31]=t[5];
}

// L 内层2（U col2, F col2, D col2, B col3 reversed）
function edgesL_inner2(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[2], U[8], U[14], U[20], U[26], U[32]];
  U[2]=B[33];  U[8]=B[27];  U[14]=B[21]; U[20]=B[15]; U[26]=B[9];  U[32]=B[3];
  B[3]=D[32];  B[9]=D[26];  B[15]=D[20]; B[21]=D[14]; B[27]=D[8];  B[33]=D[2];
  D[2]=F[2];   D[8]=F[8];   D[14]=F[14]; D[20]=F[20]; D[26]=F[26]; D[32]=F[32];
  F[2]=t[0];   F[8]=t[1];   F[14]=t[2];  F[20]=t[3];  F[26]=t[4];  F[32]=t[5];
}

// R 外层（U col5, F col5, D col5, B col0 reversed）
function edgesR_outer(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[5], U[11], U[17], U[23], U[29], U[35]];
  U[5]=F[5];   U[11]=F[11]; U[17]=F[17]; U[23]=F[23]; U[29]=F[29]; U[35]=F[35];
  F[5]=D[5];   F[11]=D[11]; F[17]=D[17]; F[23]=D[23]; F[29]=D[29]; F[35]=D[35];
  D[5]=B[30];  D[11]=B[24]; D[17]=B[18]; D[23]=B[12]; D[29]=B[6];  D[35]=B[0];
  B[0]=t[5];   B[6]=t[4];   B[12]=t[3];  B[18]=t[2];  B[24]=t[1];  B[30]=t[0];
}

// R 内层1（U col4, F col4, D col4, B col1 reversed）
function edgesR_inner1(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[4], U[10], U[16], U[22], U[28], U[34]];
  U[4]=F[4];   U[10]=F[10]; U[16]=F[16]; U[22]=F[22]; U[28]=F[28]; U[34]=F[34];
  F[4]=D[4];   F[10]=D[10]; F[16]=D[16]; F[22]=D[22]; F[28]=D[28]; F[34]=D[34];
  D[4]=B[31];  D[10]=B[25]; D[16]=B[19]; D[22]=B[13]; D[28]=B[7];  D[34]=B[1];
  B[1]=t[5];   B[7]=t[4];   B[13]=t[3];  B[19]=t[2];  B[25]=t[1];  B[31]=t[0];
}

// R 内层2（U col3, F col3, D col3, B col2 reversed）
function edgesR_inner2(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[3], U[9], U[15], U[21], U[27], U[33]];
  U[3]=F[3];   U[9]=F[9];   U[15]=F[15]; U[21]=F[21]; U[27]=F[27]; U[33]=F[33];
  F[3]=D[3];   F[9]=D[9];   F[15]=D[15]; F[21]=D[21]; F[27]=D[27]; F[33]=D[33];
  D[3]=B[32];  D[9]=B[26];  D[15]=B[20]; D[21]=B[14]; D[27]=B[8];  D[33]=B[2];
  B[2]=t[5];   B[8]=t[4];   B[14]=t[3];  B[20]=t[2];  B[26]=t[1];  B[32]=t[0];
}

const outerFns: Record<string, (s: CubeState) => void> = {
  U: edgesU_outer, D: edgesD_outer,
  F: edgesF_outer, B: edgesB_outer,
  L: edgesL_outer, R: edgesR_outer,
};

const inner1Fns: Record<string, (s: CubeState) => void> = {
  U: edgesU_inner1, D: edgesD_inner1,
  F: edgesF_inner1, B: edgesB_inner1,
  L: edgesL_inner1, R: edgesR_inner1,
};

const inner2Fns: Record<string, (s: CubeState) => void> = {
  U: edgesU_inner2, D: edgesD_inner2,
  F: edgesF_inner2, B: edgesB_inner2,
  L: edgesL_inner2, R: edgesR_inner2,
};

export function applyMove6x6(state: CubeState, move: string): CubeState {
  const newState = JSON.parse(JSON.stringify(state)) as CubeState;

  // 解析：3Uw2 → triWide=true, face=U, wide=true, modifier='2'
  const m = move.match(/^(3?)([UDFBLR])(w?)('|2?)$/);
  if (!m) return newState;

  const triWide = m[1] === '3';
  const face = m[2] as Face;
  const wide = m[3] === 'w';
  const modifier = m[4];
  const times = modifier === '2' ? 2 : 1;
  const ccw = modifier === "'";
  const layerCount = triWide ? 3 : wide ? 2 : 1;

  const applyCW = () => {
    rotateFaceClockwise6x6(newState, face);
    outerFns[face](newState);
    if (layerCount >= 2) inner1Fns[face](newState);
    if (layerCount >= 3) inner2Fns[face](newState);
  };

  const applyCCW = () => {
    rotateFaceCounterClockwise6x6(newState, face);
    outerFns[face](newState); outerFns[face](newState); outerFns[face](newState);
    if (layerCount >= 2) {
      inner1Fns[face](newState); inner1Fns[face](newState); inner1Fns[face](newState);
    }
    if (layerCount >= 3) {
      inner2Fns[face](newState); inner2Fns[face](newState); inner2Fns[face](newState);
    }
  };

  for (let i = 0; i < times; i++) {
    ccw ? applyCCW() : applyCW();
  }

  return newState;
}

export function applyScramble6x6(scramble: string): CubeState {
  const moves = scramble.split(' ').filter(m => m.trim());
  let state = createSolvedCube6x6();
  for (const move of moves) {
    state = applyMove6x6(state, move);
  }
  return state;
}
