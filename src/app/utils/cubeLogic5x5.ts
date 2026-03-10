import type { CubeState } from '../types/cube';

type Face = keyof CubeState['faces'];

// 5x5 面格子编号（行优先）：
//  0  1  2  3  4
//  5  6  7  8  9
// 10 11 12 13 14
// 15 16 17 18 19
// 20 21 22 23 24

export function createSolvedCube5x5(): CubeState {
  return {
    faces: {
      U: Array(25).fill('#FFFFFF'),
      D: Array(25).fill('#FFFF00'),
      F: Array(25).fill('#00FF00'),
      B: Array(25).fill('#0000FF'),
      L: Array(25).fill('#FF8800'),
      R: Array(25).fill('#FF0000'),
    },
  };
}

const OPPOSITE_FACE: Record<string, string> = { U:'D', D:'U', F:'B', B:'F', L:'R', R:'L' };

function parseFaceLayer(base: string): { face: string; layer: number } {
  if (base.startsWith('3')) return { face: base[1], layer: 3 };
  if (base.endsWith('w')) return { face: base[0], layer: 2 };
  return { face: base[0], layer: 1 };
}

// 生成五阶打乱（60步，普通移动 + 宽转，最多 floor(5/2)=2 层）
export function generateScramble5x5(length: number = 60): string {
  const baseMoves = ['U', 'D', 'F', 'B', 'L', 'R'];
  const wideMoves = baseMoves.map(m => m + 'w');
  const allMoves = [...baseMoves, ...wideMoves];
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

// 顺时针面旋转：new[i*5+j] = old[(4-j)*5+i]
function rotateFaceClockwise5x5(state: CubeState, face: Face) {
  const f = [...state.faces[face]];
  const s = state.faces[face];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      s[i * 5 + j] = f[(4 - j) * 5 + i];
    }
  }
}

function rotateFaceCounterClockwise5x5(state: CubeState, face: Face) {
  rotateFaceClockwise5x5(state, face);
  rotateFaceClockwise5x5(state, face);
  rotateFaceClockwise5x5(state, face);
}

// ── 边缘循环函数（均为顺时针） ──────────────────────────────────────

// U 外层（row 0）: F←R←B←L
function edgesU_outer(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[0], F[1], F[2], F[3], F[4]];
  F[0]=R[0]; F[1]=R[1]; F[2]=R[2]; F[3]=R[3]; F[4]=R[4];
  R[0]=B[0]; R[1]=B[1]; R[2]=B[2]; R[3]=B[3]; R[4]=B[4];
  B[0]=L[0]; B[1]=L[1]; B[2]=L[2]; B[3]=L[3]; B[4]=L[4];
  L[0]=t[0]; L[1]=t[1]; L[2]=t[2]; L[3]=t[3]; L[4]=t[4];
}

// U 内层1（row 1）
function edgesU_inner1(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[5], F[6], F[7], F[8], F[9]];
  F[5]=R[5]; F[6]=R[6]; F[7]=R[7]; F[8]=R[8]; F[9]=R[9];
  R[5]=B[5]; R[6]=B[6]; R[7]=B[7]; R[8]=B[8]; R[9]=B[9];
  B[5]=L[5]; B[6]=L[6]; B[7]=L[7]; B[8]=L[8]; B[9]=L[9];
  L[5]=t[0]; L[6]=t[1]; L[7]=t[2]; L[8]=t[3]; L[9]=t[4];
}

// U 内层2（row 2，中间行）
function edgesU_inner2(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[10], F[11], F[12], F[13], F[14]];
  F[10]=R[10]; F[11]=R[11]; F[12]=R[12]; F[13]=R[13]; F[14]=R[14];
  R[10]=B[10]; R[11]=B[11]; R[12]=B[12]; R[13]=B[13]; R[14]=B[14];
  B[10]=L[10]; B[11]=L[11]; B[12]=L[12]; B[13]=L[13]; B[14]=L[14];
  L[10]=t[0]; L[11]=t[1]; L[12]=t[2]; L[13]=t[3]; L[14]=t[4];
}

// D 外层（row 4）: F←L←B←R
function edgesD_outer(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[20], F[21], F[22], F[23], F[24]];
  F[20]=L[20]; F[21]=L[21]; F[22]=L[22]; F[23]=L[23]; F[24]=L[24];
  L[20]=B[20]; L[21]=B[21]; L[22]=B[22]; L[23]=B[23]; L[24]=B[24];
  B[20]=R[20]; B[21]=R[21]; B[22]=R[22]; B[23]=R[23]; B[24]=R[24];
  R[20]=t[0]; R[21]=t[1]; R[22]=t[2]; R[23]=t[3]; R[24]=t[4];
}

// D 内层1（row 3）
function edgesD_inner1(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[15], F[16], F[17], F[18], F[19]];
  F[15]=L[15]; F[16]=L[16]; F[17]=L[17]; F[18]=L[18]; F[19]=L[19];
  L[15]=B[15]; L[16]=B[16]; L[17]=B[17]; L[18]=B[18]; L[19]=B[19];
  B[15]=R[15]; B[16]=R[16]; B[17]=R[17]; B[18]=R[18]; B[19]=R[19];
  R[15]=t[0]; R[16]=t[1]; R[17]=t[2]; R[18]=t[3]; R[19]=t[4];
}

// D 内层2（row 2，中间行）
function edgesD_inner2(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[10], F[11], F[12], F[13], F[14]];
  F[10]=L[10]; F[11]=L[11]; F[12]=L[12]; F[13]=L[13]; F[14]=L[14];
  L[10]=B[10]; L[11]=B[11]; L[12]=B[12]; L[13]=B[13]; L[14]=B[14];
  B[10]=R[10]; B[11]=R[11]; B[12]=R[12]; B[13]=R[13]; B[14]=R[14];
  R[10]=t[0]; R[11]=t[1]; R[12]=t[2]; R[13]=t[3]; R[14]=t[4];
}

// F 外层（U row4, R col0, D row0, L col4）
function edgesF_outer(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[20], U[21], U[22], U[23], U[24]];
  U[20]=L[24]; U[21]=L[19]; U[22]=L[14]; U[23]=L[9];  U[24]=L[4];
  L[4]=D[0];   L[9]=D[1];   L[14]=D[2];  L[19]=D[3];  L[24]=D[4];
  D[0]=R[20];  D[1]=R[15];  D[2]=R[10];  D[3]=R[5];   D[4]=R[0];
  R[0]=t[0];   R[5]=t[1];   R[10]=t[2];  R[15]=t[3];  R[20]=t[4];
}

// F 内层1（U row3, R col1, D row1, L col3）
function edgesF_inner1(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[15], U[16], U[17], U[18], U[19]];
  U[15]=L[23]; U[16]=L[18]; U[17]=L[13]; U[18]=L[8];  U[19]=L[3];
  L[3]=D[5];   L[8]=D[6];   L[13]=D[7];  L[18]=D[8];  L[23]=D[9];
  D[5]=R[21];  D[6]=R[16];  D[7]=R[11];  D[8]=R[6];   D[9]=R[1];
  R[1]=t[0];   R[6]=t[1];   R[11]=t[2];  R[16]=t[3];  R[21]=t[4];
}

// F 内层2（U row2, R col2, D row2, L col2）
function edgesF_inner2(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[10], U[11], U[12], U[13], U[14]];
  U[10]=L[22]; U[11]=L[17]; U[12]=L[12]; U[13]=L[7];  U[14]=L[2];
  L[2]=D[10];  L[7]=D[11];  L[12]=D[12]; L[17]=D[13]; L[22]=D[14];
  D[10]=R[22]; D[11]=R[17]; D[12]=R[12]; D[13]=R[7];  D[14]=R[2];
  R[2]=t[0];   R[7]=t[1];   R[12]=t[2];  R[17]=t[3];  R[22]=t[4];
}

// B 外层（U row0, R col4, D row4, L col0）
function edgesB_outer(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[0], U[1], U[2], U[3], U[4]];
  U[0]=R[4];   U[1]=R[9];   U[2]=R[14];  U[3]=R[19];  U[4]=R[24];
  R[4]=D[24];  R[9]=D[23];  R[14]=D[22]; R[19]=D[21]; R[24]=D[20];
  D[20]=L[0];  D[21]=L[5];  D[22]=L[10]; D[23]=L[15]; D[24]=L[20];
  L[0]=t[4];   L[5]=t[3];   L[10]=t[2];  L[15]=t[1];  L[20]=t[0];
}

// B 内层1（U row1, R col3, D row3, L col1）
function edgesB_inner1(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[5], U[6], U[7], U[8], U[9]];
  U[5]=R[3];   U[6]=R[8];   U[7]=R[13];  U[8]=R[18];  U[9]=R[23];
  R[3]=D[19];  R[8]=D[18];  R[13]=D[17]; R[18]=D[16]; R[23]=D[15];
  D[15]=L[1];  D[16]=L[6];  D[17]=L[11]; D[18]=L[16]; D[19]=L[21];
  L[1]=t[4];   L[6]=t[3];   L[11]=t[2];  L[16]=t[1];  L[21]=t[0];
}

// B 内层2（U row2, R col2, D row2, L col2）
function edgesB_inner2(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[10], U[11], U[12], U[13], U[14]];
  U[10]=R[2];  U[11]=R[7];  U[12]=R[12]; U[13]=R[17]; U[14]=R[22];
  R[2]=D[14];  R[7]=D[13];  R[12]=D[12]; R[17]=D[11]; R[22]=D[10];
  D[10]=L[2];  D[11]=L[7];  D[12]=L[12]; D[13]=L[17]; D[14]=L[22];
  L[2]=t[4];   L[7]=t[3];   L[12]=t[2];  L[17]=t[1];  L[22]=t[0];
}

// L 外层（U col0, F col0, D col0, B col4 reversed）
function edgesL_outer(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[0], U[5], U[10], U[15], U[20]];
  U[0]=B[24];  U[5]=B[19];  U[10]=B[14]; U[15]=B[9];  U[20]=B[4];
  B[4]=D[20];  B[9]=D[15];  B[14]=D[10]; B[19]=D[5];  B[24]=D[0];
  D[0]=F[0];   D[5]=F[5];   D[10]=F[10]; D[15]=F[15]; D[20]=F[20];
  F[0]=t[0];   F[5]=t[1];   F[10]=t[2];  F[15]=t[3];  F[20]=t[4];
}

// L 内层1（U col1, F col1, D col1, B col3 reversed）
function edgesL_inner1(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[1], U[6], U[11], U[16], U[21]];
  U[1]=B[23];  U[6]=B[18];  U[11]=B[13]; U[16]=B[8];  U[21]=B[3];
  B[3]=D[21];  B[8]=D[16];  B[13]=D[11]; B[18]=D[6];  B[23]=D[1];
  D[1]=F[1];   D[6]=F[6];   D[11]=F[11]; D[16]=F[16]; D[21]=F[21];
  F[1]=t[0];   F[6]=t[1];   F[11]=t[2];  F[16]=t[3];  F[21]=t[4];
}

// L 内层2（U col2, F col2, D col2, B col2 reversed）
function edgesL_inner2(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[2], U[7], U[12], U[17], U[22]];
  U[2]=B[22];  U[7]=B[17];  U[12]=B[12]; U[17]=B[7];  U[22]=B[2];
  B[2]=D[22];  B[7]=D[17];  B[12]=D[12]; B[17]=D[7];  B[22]=D[2];
  D[2]=F[2];   D[7]=F[7];   D[12]=F[12]; D[17]=F[17]; D[22]=F[22];
  F[2]=t[0];   F[7]=t[1];   F[12]=t[2];  F[17]=t[3];  F[22]=t[4];
}

// R 外层（U col4, F col4, D col4, B col0 reversed）
function edgesR_outer(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[4], U[9], U[14], U[19], U[24]];
  U[4]=F[4];   U[9]=F[9];   U[14]=F[14]; U[19]=F[19]; U[24]=F[24];
  F[4]=D[4];   F[9]=D[9];   F[14]=D[14]; F[19]=D[19]; F[24]=D[24];
  D[4]=B[20];  D[9]=B[15];  D[14]=B[10]; D[19]=B[5];  D[24]=B[0];
  B[0]=t[4];   B[5]=t[3];   B[10]=t[2];  B[15]=t[1];  B[20]=t[0];
}

// R 内层1（U col3, F col3, D col3, B col1 reversed）
function edgesR_inner1(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[3], U[8], U[13], U[18], U[23]];
  U[3]=F[3];   U[8]=F[8];   U[13]=F[13]; U[18]=F[18]; U[23]=F[23];
  F[3]=D[3];   F[8]=D[8];   F[13]=D[13]; F[18]=D[18]; F[23]=D[23];
  D[3]=B[21];  D[8]=B[16];  D[13]=B[11]; D[18]=B[6];  D[23]=B[1];
  B[1]=t[4];   B[6]=t[3];   B[11]=t[2];  B[16]=t[1];  B[21]=t[0];
}

// R 内层2（U col2, F col2, D col2, B col2 reversed）
function edgesR_inner2(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[2], U[7], U[12], U[17], U[22]];
  U[2]=F[2];   U[7]=F[7];   U[12]=F[12]; U[17]=F[17]; U[22]=F[22];
  F[2]=D[2];   F[7]=D[7];   F[12]=D[12]; F[17]=D[17]; F[22]=D[22];
  D[2]=B[22];  D[7]=B[17];  D[12]=B[12]; D[17]=B[7];  D[22]=B[2];
  B[2]=t[4];   B[7]=t[3];   B[12]=t[2];  B[17]=t[1];  B[22]=t[0];
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

export function applyMove5x5(state: CubeState, move: string): CubeState {
  const newState = JSON.parse(JSON.stringify(state)) as CubeState;

  // 解析：3Uw2 → triWide=true, face=U, wide=true, modifier='2'
  //        Rw'  → triWide=false, face=R, wide=true, modifier="'"
  //        F    → triWide=false, face=F, wide=false, modifier=""
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
    rotateFaceClockwise5x5(newState, face);
    outerFns[face](newState);
    if (layerCount >= 2) inner1Fns[face](newState);
    if (layerCount >= 3) inner2Fns[face](newState);
  };

  const applyCCW = () => {
    rotateFaceCounterClockwise5x5(newState, face);
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

export function applyScramble5x5(scramble: string): CubeState {
  const moves = scramble.split(' ').filter(m => m.trim());
  let state = createSolvedCube5x5();
  for (const move of moves) {
    state = applyMove5x5(state, move);
  }
  return state;
}
