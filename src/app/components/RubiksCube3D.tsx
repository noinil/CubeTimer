import { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { TrackballControls } from '@react-three/drei';
import type { CubeState } from '../types/cube';
import * as THREE from 'three';

interface RubiksCube3DProps {
  cubeState: CubeState;
  size?: number;
}

function Cubie({ position, colors }: { position: [number, number, number]; colors: string[] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.98, 0.98, 0.98]} />
        <meshStandardMaterial color="#111111" roughness={0.5} />
      </mesh>
      {colors.map((color, index) => {
        if (!color) return null;
        const pos: [number, number, number][] = [
          [0, 0.5, 0], [0, -0.5, 0], [0, 0, 0.5], [0, 0, -0.5], [-0.5, 0, 0], [0.5, 0, 0]
        ];
        const rot: [number, number, number][] = [
          [-Math.PI / 2, 0, 0], [Math.PI / 2, 0, 0], [0, 0, 0], [0, Math.PI, 0], [0, -Math.PI / 2, 0], [0, Math.PI / 2, 0]
        ];
        return (
          <mesh key={index} position={pos[index]} rotation={rot[index]}>
            <planeGeometry args={[0.88, 0.88]} />
            <meshStandardMaterial 
              color={color} 
              emissive={color}
              emissiveIntensity={0.2}
              roughness={0.1}
              metalness={0.1}
              polygonOffset
              polygonOffsetFactor={-1}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function CubeGroup({ cubeState, size }: { cubeState: CubeState; size: number }) {
  const cubies = useMemo(() => {
    if (!cubeState.faces) return [];
    const result = [];
    const offset = (size - 1) / 2;

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          if (x === 0 || x === size - 1 || y === 0 || y === size - 1 || z === 0 || z === size - 1) {
            const colors = getCubieColors(x, y, z, size, cubeState);
            result.push({
              position: [x - offset, y - offset, z - offset] as [number, number, number],
              colors,
              key: `${x}-${y}-${z}`,
            });
          }
        }
      }
    }
    return result;
  }, [cubeState, size]);

  return <group>{cubies.map(cubie => <Cubie key={cubie.key} position={cubie.position} colors={cubie.colors} />)}</group>;
}

/**
 * 修正后的坐标映射函数，必须与 cubeLogic.ts 中的数组索引严格对应
 */
function getCubieColors(x: number, y: number, z: number, size: number, state: CubeState): string[] {
  const colors = ['', '', '', '', '', ''];
  if (!state.faces) return colors;

  const max = size - 1;

  // 0: U (顶面, +Y) -> 逻辑层 index 0 是 Back-Left (x=0, z=0)
  if (y === max) colors[0] = state.faces.U[z * size + x];
  
  // 1: D (底面, -Y) -> 逻辑层 index 0 是 Front-Left (x=0, z=max)
  if (y === 0) colors[1] = state.faces.D[(max - z) * size + x];
  
  // 2: F (正面, +Z) -> 逻辑层 index 0 是 Top-Left (x=0, y=max)
  if (z === max) colors[2] = state.faces.F[(max - y) * size + x];
  
  // 3: B (背面, -Z) -> 逻辑层 index 0 是 Top-Right (x=max, y=max)
  if (z === 0) colors[3] = state.faces.B[(max - y) * size + (max - x)];
  
  // 4: L (左面, -X) -> 逻辑层 index 0 是 Top-Back (z=0, y=max)
  if (x === 0) colors[4] = state.faces.L[(max - y) * size + z];
  
  // 5: R (右面, +X) -> 逻辑层 index 0 是 Top-Front (z=max, y=max)
  if (x === max) colors[5] = state.faces.R[(max - y) * size + (max - z)];

  return colors;
}

export default function RubiksCube3D({ cubeState, size = 3 }: RubiksCube3DProps) {
  return (
    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [size * 2, size * 2, size * 2.5], fov: 45 }} gl={{ antialias: true }}>
        <color attach="background" args={['#111827']} />
        <ambientLight intensity={1.5} />
        <pointLight position={[20, 20, 20]} intensity={2} />
        <pointLight position={[-20, -20, -20]} intensity={1} />
        <CubeGroup cubeState={cubeState} size={size} />
        <TrackballControls noPan={true} dynamicDampingFactor={0.15} rotateSpeed={4.0} />
      </Canvas>
    </div>
  );
}