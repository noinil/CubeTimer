import type { CubeState, Move } from '../types/cube';

// 创建已解决的魔方状态
export function createSolvedCube(): CubeState {
  return {
    faces: {
      U: Array(9).fill('#FFFFFF'), // 白色
      D: Array(9).fill('#FFFF00'), // 黄色
      F: Array(9).fill('#00FF00'), // 绿色
      B: Array(9).fill('#0000FF'), // 蓝色
      L: Array(9).fill('#FF8800'), // 橙色
      R: Array(9).fill('#FF0000'), // 红色
    },
  };
}

// 生成打乱公式
export function generateScramble(length: number = 20): string {
  const moves: Move[] = ['U', 'D', 'F', 'B', 'L', 'R'];
  const modifiers = ['', "'", '2'];
  const scramble: string[] = [];
  
  // 相对面映射
  const oppositeFace: Record<string, string> = {
    'U': 'D', 'D': 'U',
    'L': 'R', 'R': 'L',
    'F': 'B', 'B': 'F'
  };

  let lastFace = '';

  for (let i = 0; i < length; i++) {
    let face: string;
    do {
      face = moves[Math.floor(Math.random() * moves.length)];
      
      // 极致规则：禁止同一个面，且禁止相对面（必须切换轴向）
    } while (
      face === lastFace || 
      face === oppositeFace[lastFace]
    );

    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    scramble.push(face + modifier as Move);
    
    lastFace = face;
  }

  return scramble.join(' ');
}

// 应用单个移动到魔方状态
export function applyMove(state: CubeState, move: Move): CubeState {
  const newState = JSON.parse(JSON.stringify(state)) as CubeState;
  const face = move[0] as 'U' | 'D' | 'F' | 'B' | 'L' | 'R';
  const modifier = move.slice(1);
  const times = modifier === '2' ? 2 : 1;

  for (let i = 0; i < times; i++) {
    if (modifier === "'") {
      rotateFaceCounterClockwise(newState, face);
    } else {
      rotateFaceClockwise(newState, face);
    }
  }

  return newState;
}

// 顺时针旋转面
function rotateFaceClockwise(state: CubeState, face: 'U' | 'D' | 'F' | 'B' | 'L' | 'R') {
  // 旋转面本身
  const f = state.faces[face];
  const temp = [...f];
  f[0] = temp[6];
  f[1] = temp[3];
  f[2] = temp[0];
  f[3] = temp[7];
  f[4] = temp[4];
  f[5] = temp[1];
  f[6] = temp[8];
  f[7] = temp[5];
  f[8] = temp[2];

  // 旋转相邻的边
  switch (face) {
    case 'U':
      rotateEdgesU(state);
      break;
    case 'D':
      rotateEdgesD(state);
      break;
    case 'F':
      rotateEdgesF(state);
      break;
    case 'B':
      rotateEdgesB(state);
      break;
    case 'L':
      rotateEdgesL(state);
      break;
    case 'R':
      rotateEdgesR(state);
      break;
  }
}

// 逆时针旋转面
function rotateFaceCounterClockwise(state: CubeState, face: 'U' | 'D' | 'F' | 'B' | 'L' | 'R') {
  // 旋转3次顺时针等于1次逆时针
  rotateFaceClockwise(state, face);
  rotateFaceClockwise(state, face);
  rotateFaceClockwise(state, face);
}

// 各个面的边缘旋转逻辑
function rotateEdgesU(state: CubeState) {
  const temp = [state.faces.F[0], state.faces.F[1], state.faces.F[2]];
  state.faces.F[0] = state.faces.R[0];
  state.faces.F[1] = state.faces.R[1];
  state.faces.F[2] = state.faces.R[2];
  state.faces.R[0] = state.faces.B[0];
  state.faces.R[1] = state.faces.B[1];
  state.faces.R[2] = state.faces.B[2];
  state.faces.B[0] = state.faces.L[0];
  state.faces.B[1] = state.faces.L[1];
  state.faces.B[2] = state.faces.L[2];
  state.faces.L[0] = temp[0];
  state.faces.L[1] = temp[1];
  state.faces.L[2] = temp[2];
}

function rotateEdgesD(state: CubeState) {
  const temp = [state.faces.F[6], state.faces.F[7], state.faces.F[8]];
  state.faces.F[6] = state.faces.L[6];
  state.faces.F[7] = state.faces.L[7];
  state.faces.F[8] = state.faces.L[8];
  state.faces.L[6] = state.faces.B[6];
  state.faces.L[7] = state.faces.B[7];
  state.faces.L[8] = state.faces.B[8];
  state.faces.B[6] = state.faces.R[6];
  state.faces.B[7] = state.faces.R[7];
  state.faces.B[8] = state.faces.R[8];
  state.faces.R[6] = temp[0];
  state.faces.R[7] = temp[1];
  state.faces.R[8] = temp[2];
}

function rotateEdgesF(state: CubeState) {
  const temp = [state.faces.U[6], state.faces.U[7], state.faces.U[8]];
  state.faces.U[6] = state.faces.L[8];
  state.faces.U[7] = state.faces.L[5];
  state.faces.U[8] = state.faces.L[2];
  state.faces.L[2] = state.faces.D[0];
  state.faces.L[5] = state.faces.D[1];
  state.faces.L[8] = state.faces.D[2];
  state.faces.D[0] = state.faces.R[6];
  state.faces.D[1] = state.faces.R[3];
  state.faces.D[2] = state.faces.R[0];
  state.faces.R[0] = temp[0];
  state.faces.R[3] = temp[1];
  state.faces.R[6] = temp[2];
}

function rotateEdgesB(state: CubeState) {
  const temp = [state.faces.U[0], state.faces.U[1], state.faces.U[2]];
  state.faces.U[0] = state.faces.R[2];
  state.faces.U[1] = state.faces.R[5];
  state.faces.U[2] = state.faces.R[8];
  state.faces.R[2] = state.faces.D[8];
  state.faces.R[5] = state.faces.D[7];
  state.faces.R[8] = state.faces.D[6];
  state.faces.D[6] = state.faces.L[0];
  state.faces.D[7] = state.faces.L[3];
  state.faces.D[8] = state.faces.L[6];
  state.faces.L[0] = temp[2];
  state.faces.L[3] = temp[1];
  state.faces.L[6] = temp[0];
}

function rotateEdgesL(state: CubeState) {
  const temp = [state.faces.U[0], state.faces.U[3], state.faces.U[6]];
  state.faces.U[0] = state.faces.B[8];
  state.faces.U[3] = state.faces.B[5];
  state.faces.U[6] = state.faces.B[2];
  state.faces.B[2] = state.faces.D[6];
  state.faces.B[5] = state.faces.D[3];
  state.faces.B[8] = state.faces.D[0];
  state.faces.D[0] = state.faces.F[0];
  state.faces.D[3] = state.faces.F[3];
  state.faces.D[6] = state.faces.F[6];
  state.faces.F[0] = temp[0];
  state.faces.F[3] = temp[1];
  state.faces.F[6] = temp[2];
}

function rotateEdgesR(state: CubeState) {
  const temp = [state.faces.U[2], state.faces.U[5], state.faces.U[8]];
  state.faces.U[2] = state.faces.F[2];
  state.faces.U[5] = state.faces.F[5];
  state.faces.U[8] = state.faces.F[8];
  state.faces.F[2] = state.faces.D[2];
  state.faces.F[5] = state.faces.D[5];
  state.faces.F[8] = state.faces.D[8];
  state.faces.D[2] = state.faces.B[6];
  state.faces.D[5] = state.faces.B[3];
  state.faces.D[8] = state.faces.B[0];
  state.faces.B[0] = temp[2];
  state.faces.B[3] = temp[1];
  state.faces.B[6] = temp[0];
}

// 应用打乱公式
export function applyScramble(scramble: string): CubeState {
  const moves = scramble.split(' ').filter(m => m.trim());
  let state = createSolvedCube();
  
  for (const move of moves) {
    state = applyMove(state, move as Move);
  }
  
  return state;
}
