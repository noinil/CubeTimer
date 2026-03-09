import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { CubeState } from '../types/cube';
import * as THREE from 'three';

interface RubiksCube3DProps {
  cubeState: CubeState;
}

// 单个小方块组件
function Cubie({ position, colors }: { position: [number, number, number]; colors: string[] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.95, 0.95, 0.95]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {colors.map((color, index) => {
        if (!color) return null;
        const facePosition = getFacePosition(index);
        const faceRotation = getFaceRotation(index);
        return (
          <mesh key={index} position={facePosition} rotation={faceRotation}>
            <planeGeometry args={[0.85, 0.85]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
}

function getFacePosition(index: number): [number, number, number] {
  const positions: [number, number, number][] = [
    [0, 0.48, 0],    // front
    [0, -0.48, 0],   // back
    [0, 0, 0.48],    // top
    [0, 0, -0.48],   // bottom
    [-0.48, 0, 0],   // left
    [0.48, 0, 0],    // right
  ];
  return positions[index];
}

function getFaceRotation(index: number): [number, number, number] {
  const rotations: [number, number, number][] = [
    [0, 0, 0],                    // front
    [0, Math.PI, 0],              // back
    [-Math.PI / 2, 0, 0],         // top
    [Math.PI / 2, 0, 0],          // bottom
    [0, -Math.PI / 2, 0],         // left
    [0, Math.PI / 2, 0],          // right
  ];
  return rotations[index];
}

// 完整的魔方
function Cube({ cubeState }: { cubeState: CubeState }) {
  const groupRef = useRef<THREE.Group>(null);

  // 轻微的自动旋转
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  const cubies = useMemo(() => {
    const result = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const colors = getCubieColors(x, y, z, cubeState);
          result.push({
            position: [x, y, z] as [number, number, number],
            colors,
            key: `${x}-${y}-${z}`,
          });
        }
      }
    }
    return result;
  }, [cubeState]);

  return (
    <group ref={groupRef}>
      {cubies.map(cubie => (
        <Cubie key={cubie.key} position={cubie.position} colors={cubie.colors} />
      ))}
    </group>
  );
}

// 获取每个小方块的颜色
function getCubieColors(x: number, y: number, z: number, state: CubeState): string[] {
  const colors = ['', '', '', '', '', '']; // front, back, top, bottom, left, right

  // Front face (z = 1)
  if (z === 1) {
    const index = (1 - y) * 3 + (x + 1);
    colors[0] = state.faces.F[index];
  }
  
  // Back face (z = -1)
  if (z === -1) {
    const index = (1 - y) * 3 + (1 - x);
    colors[1] = state.faces.B[index];
  }
  
  // Top face (y = 1)
  if (y === 1) {
    const index = (1 - z) * 3 + (x + 1);
    colors[2] = state.faces.U[index];
  }
  
  // Bottom face (y = -1)
  if (y === -1) {
    const index = (z + 1) * 3 + (x + 1);
    colors[3] = state.faces.D[index];
  }
  
  // Left face (x = -1)
  if (x === -1) {
    const index = (1 - y) * 3 + (1 - z);
    colors[4] = state.faces.L[index];
  }
  
  // Right face (x = 1)
  if (x === 1) {
    const index = (1 - y) * 3 + (z + 1);
    colors[5] = state.faces.R[index];
  }

  return colors;
}

export default function RubiksCube3D({ cubeState }: RubiksCube3DProps) {
  return (
    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          加载中...
        </div>
      }>
        <Canvas 
          camera={{ position: [5, 5, 5], fov: 50 }}
          gl={{ antialias: true }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />
          <Cube cubeState={cubeState} />
          <OrbitControls 
            enablePan={false}
            minDistance={5}
            maxDistance={10}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}