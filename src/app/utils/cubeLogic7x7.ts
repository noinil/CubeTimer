import type { CubeState } from '../types/cube';

type Face = keyof CubeState['faces'];

// 7x7 面格子编号（行优先）：
//  0  1  2  3  4  5  6
//  7  8  9 10 11 12 13
// 14 15 16 17 18 19 20
// 21 22 23 24 25 26 27
// 28 29 30 31 32 33 34
// 35 36 37 38 39 40 41
// 42 43 44 45 46 47 48

export function createSolvedCube7x7(): CubeState {
  return {
    faces: {
      U: Array(49).fill('#FFFFFF'),
      D: Array(49).fill('#FFFF00'),
      F: Array(49).fill('#00FF00'),
      B: Array(49).fill('#0000FF'),
      L: Array(49).fill('#FF8800'),
      R: Array(49).fill('#FF0000'),
    },
  };
}

const OPPOSITE_FACE: Record<string, string> = { U:'D', D:'U', F:'B', B:'F', L:'R', R:'L' };

function parseFaceLayer(base: string): { face: string; layer: number } {
  if (base.startsWith('3')) return { face: base[1], layer: 3 };
  if (base.endsWith('w')) return { face: base[0], layer: 2 };
  return { face: base[0], layer: 1 };
}

// 生成七阶打乱（100步，最多 floor(7/2)=3 层）
export function generateScramble7x7(length: number = 100): string {
  const baseMoves = ['U', 'D', 'F', 'B', 'L', 'R'];
  const wideMoves = baseMoves.map(m => m + 'w');
  const triWideMoves = baseMoves.map(m => '3' + m + 'w');
  const allMoves = [...baseMoves, ...wideMoves, ...triWideMoves];
  const modifiers = ['', "'", '2'];
  const scramble: string[] = [];
  let lastFace = '';
  
  for (let i = 0; i < length; i++) {
    let base: string;
    let face: string;
    do {
      base = allMoves[Math.floor(Math.random() * allMoves.length)];
      face = base.includes('U') ? 'U' : 
             base.includes('D') ? 'D' : 
             base.includes('L') ? 'L' : 
             base.includes('R') ? 'R' : 
             base.includes('F') ? 'F' : 'B';
    } while (
      face === lastFace || 
      face === OPPOSITE_FACE[lastFace]
    );

    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    scramble.push(base + modifier);
    
    lastFace = face;
  }

  return scramble.join(' ');
}

// 顺时针面旋转：new[i*7+j] = old[(6-j)*7+i]
function rotateFaceClockwise7x7(state: CubeState, face: Face) {
  const f = [...state.faces[face]];
  const s = state.faces[face];
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      s[i * 7 + j] = f[(6 - j) * 7 + i];
    }
  }
}

function rotateFaceCounterClockwise7x7(state: CubeState, face: Face) {
  rotateFaceClockwise7x7(state, face);
  rotateFaceClockwise7x7(state, face);
  rotateFaceClockwise7x7(state, face);
}

function edgesU_outer(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[0], F[1], F[2], F[3], F[4], F[5], F[6]];
  F[0]=R[0]; F[1]=R[1]; F[2]=R[2]; F[3]=R[3]; F[4]=R[4]; F[5]=R[5]; F[6]=R[6];
  R[0]=B[0]; R[1]=B[1]; R[2]=B[2]; R[3]=B[3]; R[4]=B[4]; R[5]=B[5]; R[6]=B[6];
  B[0]=L[0]; B[1]=L[1]; B[2]=L[2]; B[3]=L[3]; B[4]=L[4]; B[5]=L[5]; B[6]=L[6];
  L[0]=t[0]; L[1]=t[1]; L[2]=t[2]; L[3]=t[3]; L[4]=t[4]; L[5]=t[5]; L[6]=t[6];
}

function edgesU_inner1(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[7], F[8], F[9], F[10], F[11], F[12], F[13]];
  F[7]=R[7];   F[8]=R[8];   F[9]=R[9];   F[10]=R[10]; F[11]=R[11]; F[12]=R[12]; F[13]=R[13];
  R[7]=B[7];   R[8]=B[8];   R[9]=B[9];   R[10]=B[10]; R[11]=B[11]; R[12]=B[12]; R[13]=B[13];
  B[7]=L[7];   B[8]=L[8];   B[9]=L[9];   B[10]=L[10]; B[11]=L[11]; B[12]=L[12]; B[13]=L[13];
  L[7]=t[0];   L[8]=t[1];   L[9]=t[2];   L[10]=t[3];  L[11]=t[4];  L[12]=t[5];  L[13]=t[6];
}

function edgesU_inner2(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[14], F[15], F[16], F[17], F[18], F[19], F[20]];
  F[14]=R[14]; F[15]=R[15]; F[16]=R[16]; F[17]=R[17]; F[18]=R[18]; F[19]=R[19]; F[20]=R[20];
  R[14]=B[14]; R[15]=B[15]; R[16]=B[16]; R[17]=B[17]; R[18]=B[18]; R[19]=B[19]; R[20]=B[20];
  B[14]=L[14]; B[15]=L[15]; B[16]=L[16]; B[17]=L[17]; B[18]=L[18]; B[19]=L[19]; B[20]=L[20];
  L[14]=t[0];  L[15]=t[1];  L[16]=t[2];  L[17]=t[3];  L[18]=t[4];  L[19]=t[5];  L[20]=t[6];
}

function edgesD_outer(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[42], F[43], F[44], F[45], F[46], F[47], F[48]];
  F[42]=L[42]; F[43]=L[43]; F[44]=L[44]; F[45]=L[45]; F[46]=L[46]; F[47]=L[47]; F[48]=L[48];
  L[42]=B[42]; L[43]=B[43]; L[44]=B[44]; L[45]=B[45]; L[46]=B[46]; L[47]=B[47]; L[48]=B[48];
  B[42]=R[42]; B[43]=R[43]; B[44]=R[44]; B[45]=R[45]; B[46]=R[46]; B[47]=R[47]; B[48]=R[48];
  R[42]=t[0];  R[43]=t[1];  R[44]=t[2];  R[45]=t[3];  R[46]=t[4];  R[47]=t[5];  R[48]=t[6];
}

function edgesD_inner1(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[35], F[36], F[37], F[38], F[39], F[40], F[41]];
  F[35]=L[35]; F[36]=L[36]; F[37]=L[37]; F[38]=L[38]; F[39]=L[39]; F[40]=L[40]; F[41]=L[41];
  L[35]=B[35]; L[36]=B[36]; L[37]=B[37]; L[38]=B[38]; L[39]=B[39]; L[40]=B[40]; L[41]=B[41];
  B[35]=R[35]; B[36]=R[36]; B[37]=R[37]; B[38]=R[38]; B[39]=R[39]; B[40]=R[40]; B[41]=R[41];
  R[35]=t[0];  R[36]=t[1];  R[37]=t[2];  R[38]=t[3];  R[39]=t[4];  R[40]=t[5];  R[41]=t[6];
}

function edgesD_inner2(s: CubeState) {
  const { F, R, B, L } = s.faces;
  const t = [F[28], F[29], F[30], F[31], F[32], F[33], F[34]];
  F[28]=L[28]; F[29]=L[29]; F[30]=L[30]; F[31]=L[31]; F[32]=L[32]; F[33]=L[33]; F[34]=L[34];
  L[28]=B[28]; L[29]=B[29]; L[30]=B[30]; L[31]=B[31]; L[32]=B[32]; L[33]=B[33]; L[34]=B[34];
  B[28]=R[28]; B[29]=R[29]; B[30]=R[30]; B[31]=R[31]; B[32]=R[32]; B[33]=R[33]; B[34]=R[34];
  R[28]=t[0];  R[29]=t[1];  R[30]=t[2];  R[31]=t[3];  R[32]=t[4];  R[33]=t[5];  R[34]=t[6];
}

function edgesF_outer(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[42], U[43], U[44], U[45], U[46], U[47], U[48]];
  U[42]=L[48]; U[43]=L[41]; U[44]=L[34]; U[45]=L[27]; U[46]=L[20]; U[47]=L[13]; U[48]=L[6];
  L[6]=D[0];   L[13]=D[1];  L[20]=D[2];  L[27]=D[3];  L[34]=D[4];  L[41]=D[5];  L[48]=D[6];
  D[0]=R[42];  D[1]=R[35];  D[2]=R[28];  D[3]=R[21];  D[4]=R[14];  D[5]=R[7];   D[6]=R[0];
  R[0]=t[0];   R[7]=t[1];   R[14]=t[2];  R[21]=t[3];  R[28]=t[4];  R[35]=t[5];  R[42]=t[6];
}

function edgesF_inner1(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[35], U[36], U[37], U[38], U[39], U[40], U[41]];
  U[35]=L[47]; U[36]=L[40]; U[37]=L[33]; U[38]=L[26]; U[39]=L[19]; U[40]=L[12]; U[41]=L[5];
  L[5]=D[7];   L[12]=D[8];  L[19]=D[9];  L[26]=D[10]; L[33]=D[11]; L[40]=D[12]; L[47]=D[13];
  D[7]=R[43];  D[8]=R[36];  D[9]=R[29];  D[10]=R[22]; D[11]=R[15]; D[12]=R[8];  D[13]=R[1];
  R[1]=t[0];   R[8]=t[1];   R[15]=t[2];  R[22]=t[3];  R[29]=t[4];  R[36]=t[5];  R[43]=t[6];
}

function edgesF_inner2(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[28], U[29], U[30], U[31], U[32], U[33], U[34]];
  U[28]=L[46]; U[29]=L[39]; U[30]=L[32]; U[31]=L[25]; U[32]=L[18]; U[33]=L[11]; U[34]=L[4];
  L[4]=D[14];  L[11]=D[15]; L[18]=D[16]; L[25]=D[17]; L[32]=D[18]; L[39]=D[19]; L[46]=D[20];
  D[14]=R[44]; D[15]=R[37]; D[16]=R[30]; D[17]=R[23]; D[18]=R[16]; D[19]=R[9];  D[20]=R[2];
  R[2]=t[0];   R[9]=t[1];   R[16]=t[2];  R[23]=t[3];  R[30]=t[4];  R[37]=t[5];  R[44]=t[6];
}

function edgesB_outer(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[0], U[1], U[2], U[3], U[4], U[5], U[6]];
  U[0]=R[6];   U[1]=R[13];  U[2]=R[20];  U[3]=R[27];  U[4]=R[34];  U[5]=R[41];  U[6]=R[48];
  R[6]=D[48];  R[13]=D[47]; R[20]=D[46]; R[27]=D[45]; R[34]=D[44]; R[41]=D[43]; R[48]=D[42];
  D[42]=L[0];  D[43]=L[7];  D[44]=L[14]; D[45]=L[21]; D[46]=L[28]; D[47]=L[35]; D[48]=L[42];
  L[0]=t[6];   L[7]=t[5];   L[14]=t[4];  L[21]=t[3];  L[28]=t[2];  L[35]=t[1];  L[42]=t[0];
}

function edgesB_inner1(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[7], U[8], U[9], U[10], U[11], U[12], U[13]];
  U[7]=R[5];   U[8]=R[12];  U[9]=R[19];  U[10]=R[26]; U[11]=R[33]; U[12]=R[40]; U[13]=R[47];
  R[5]=D[41];  R[12]=D[40]; R[19]=D[39]; R[26]=D[38]; R[33]=D[37]; R[40]=D[36]; R[47]=D[35];
  D[35]=L[1];  D[36]=L[8];  D[37]=L[15]; D[38]=L[22]; D[39]=L[29]; D[40]=L[36]; D[41]=L[43];
  L[1]=t[6];   L[8]=t[5];   L[15]=t[4];  L[22]=t[3];  L[29]=t[2];  L[36]=t[1];  L[43]=t[0];
}

function edgesB_inner2(s: CubeState) {
  const { U, R, D, L } = s.faces;
  const t = [U[14], U[15], U[16], U[17], U[18], U[19], U[20]];
  U[14]=R[4];  U[15]=R[11]; U[16]=R[18]; U[17]=R[25]; U[18]=R[32]; U[19]=R[39]; U[20]=R[46];
  R[4]=D[34];  R[11]=D[33]; R[18]=D[32]; R[25]=D[31]; R[32]=D[30]; R[39]=D[29]; R[46]=D[28];
  D[28]=L[2];  D[29]=L[9];  D[30]=L[16]; D[31]=L[23]; D[32]=L[30]; D[33]=L[37]; D[34]=L[44];
  L[2]=t[6];   L[9]=t[5];   L[16]=t[4];  L[23]=t[3];  L[30]=t[2];  L[37]=t[1];  L[44]=t[0];
}

function edgesL_outer(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[0], U[7], U[14], U[21], U[28], U[35], U[42]];
  U[0]=B[48];  U[7]=B[41];  U[14]=B[34]; U[21]=B[27]; U[28]=B[20]; U[35]=B[13]; U[42]=B[6];
  B[6]=D[42];  B[13]=D[35]; B[20]=D[28]; B[27]=D[21]; B[34]=D[14]; B[41]=D[7];  B[48]=D[0];
  D[0]=F[0];   D[7]=F[7];   D[14]=F[14]; D[21]=F[21]; D[28]=F[28]; D[35]=F[35]; D[42]=F[42];
  F[0]=t[0];   F[7]=t[1];   F[14]=t[2];  F[21]=t[3];  F[28]=t[4];  F[35]=t[5];  F[42]=t[6];
}

function edgesL_inner1(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[1], U[8], U[15], U[22], U[29], U[36], U[43]];
  U[1]=B[47];  U[8]=B[40];  U[15]=B[33]; U[22]=B[26]; U[29]=B[19]; U[36]=B[12]; U[43]=B[5];
  B[5]=D[43];  B[12]=D[36]; B[19]=D[29]; B[26]=D[22]; B[33]=D[15]; B[40]=D[8];  B[47]=D[1];
  D[1]=F[1];   D[8]=F[8];   D[15]=F[15]; D[22]=F[22]; D[29]=F[29]; D[36]=F[36]; D[43]=F[43];
  F[1]=t[0];   F[8]=t[1];   F[15]=t[2];  F[22]=t[3];  F[29]=t[4];  F[36]=t[5];  F[43]=t[6];
}

function edgesL_inner2(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[2], U[9], U[16], U[23], U[30], U[37], U[44]];
  U[2]=B[46];  U[9]=B[39];  U[16]=B[32]; U[23]=B[25]; U[30]=B[18]; U[37]=B[11]; U[44]=B[4];
  B[4]=D[44];  B[11]=D[37]; B[18]=D[30]; B[25]=D[23]; B[32]=D[16]; B[39]=D[9];  B[46]=D[2];
  D[2]=F[2];   D[9]=F[9];   D[16]=F[16]; D[23]=F[23]; D[30]=F[30]; D[37]=F[37]; D[44]=F[44];
  F[2]=t[0];   F[9]=t[1];   F[16]=t[2];  F[23]=t[3];  F[30]=t[4];  F[37]=t[5];  F[44]=t[6];
}

function edgesR_outer(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[6], U[13], U[20], U[27], U[34], U[41], U[48]];
  U[6]=F[6];   U[13]=F[13]; U[20]=F[20]; U[27]=F[27]; U[34]=F[34]; U[41]=F[41]; U[48]=F[48];
  F[6]=D[6];   F[13]=D[13]; F[20]=D[20]; F[27]=D[27]; F[34]=D[34]; F[41]=D[41]; F[48]=D[48];
  D[6]=B[42];  D[13]=B[35]; D[20]=B[28]; D[27]=B[21]; D[34]=B[14]; D[41]=B[7];  D[48]=B[0];
  B[0]=t[6];   B[7]=t[5];   B[14]=t[4];  B[21]=t[3];  B[28]=t[2];  B[35]=t[1];  B[42]=t[0];
}

function edgesR_inner1(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[5], U[12], U[19], U[26], U[33], U[40], U[47]];
  U[5]=F[5];   U[12]=F[12]; U[19]=F[19]; U[26]=F[26]; U[33]=F[33]; U[40]=F[40]; U[47]=F[47];
  F[5]=D[5];   F[12]=D[12]; F[19]=D[19]; F[26]=D[26]; F[33]=D[33]; F[40]=D[40]; F[47]=D[47];
  D[5]=B[43];  D[12]=B[36]; D[19]=B[29]; D[26]=B[22]; D[33]=B[15]; D[40]=B[8];  D[47]=B[1];
  B[1]=t[6];   B[8]=t[5];   B[15]=t[4];  B[22]=t[3];  B[29]=t[2];  B[36]=t[1];  B[43]=t[0];
}

function edgesR_inner2(s: CubeState) {
  const { U, F, D, B } = s.faces;
  const t = [U[4], U[11], U[18], U[25], U[32], U[39], U[46]];
  U[4]=F[4];   U[11]=F[11]; U[18]=F[18]; U[25]=F[25]; U[32]=F[32]; U[39]=F[39]; U[46]=F[46];
  F[4]=D[4];   F[11]=D[11]; F[18]=D[18]; F[25]=D[25]; F[32]=D[32]; F[39]=D[39]; F[46]=D[46];
  D[4]=B[44];  D[11]=B[37]; D[18]=B[30]; D[25]=B[23]; D[32]=B[16]; D[39]=B[9];  D[46]=B[2];
  B[2]=t[6];   B[9]=t[5];   B[16]=t[4];  B[23]=t[3];  B[30]=t[2];  B[37]=t[1];  B[44]=t[0];
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

export function applyMove7x7(state: CubeState, move: string): CubeState {
  const newState = JSON.parse(JSON.stringify(state)) as CubeState;

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
    rotateFaceClockwise7x7(newState, face);
    outerFns[face](newState);
    if (layerCount >= 2) inner1Fns[face](newState);
    if (layerCount >= 3) inner2Fns[face](newState);
  };

  const applyCCW = () => {
    rotateFaceCounterClockwise7x7(newState, face);
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

export function applyScramble7x7(scramble: string): CubeState {
  const moves = scramble.split(' ').filter(m => m.trim());
  let state = createSolvedCube7x7();
  for (const move of moves) {
    state = applyMove7x7(state, move);
  }
  return state;
}
