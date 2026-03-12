import { useRef, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { TrackballControls } from '@react-three/drei';
import type { CubeState } from '../types/cube';
import * as THREE from 'three';

interface RubiksCube3DProps {
  cubeState: CubeState;
  size?: number;
}

// Separate component for lights that follow the camera (Headlamp mode)
function CameraLights() {
  const { camera } = useThree();
  const lightRef = useRef<THREE.DirectionalLight>(null);
  useFrame(() => {
    if (lightRef.current) lightRef.current.position.copy(camera.position);
  });
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight ref={lightRef} intensity={2.5} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
    </>
  );
}

// Function to create a rounded rectangle geometry for stickers
function createRoundedRectGeometry(w: number, h: number, r: number, segments: number = 8) {
  const shape = new THREE.Shape();
  shape.moveTo(-w/2 + r, -h/2);
  shape.lineTo(w/2 - r, -h/2);
  shape.absarc(w/2 - r, -h/2 + r, r, -Math.PI/2, 0, false);
  shape.lineTo(w/2, h/2 - r);
  shape.absarc(w/2 - r, h/2 - r, r, 0, Math.PI/2, false);
  shape.lineTo(-w/2 + r, h/2);
  shape.absarc(-w/2 + r, h/2 - r, r, Math.PI/2, Math.PI, false);
  shape.lineTo(-w/2, -h/2 + r);
  shape.absarc(-w/2 + r, -h/2 + r, r, Math.PI, -Math.PI/2, false);
  return new THREE.ShapeGeometry(shape, segments);
}

function Cubie({ position, colors }: { position: [number, number, number]; colors: string[] }) {
  // Use a shared geometry for performance - increased rounding radius to 0.25
  const stickerGeom = useMemo(() => createRoundedRectGeometry(0.82, 0.82, 0.25), []);

  return (
    <group position={position}>
      {/* The black plastic body of the cubie */}
      <mesh>
        <boxGeometry args={[0.98, 0.98, 0.98]} />
        <meshStandardMaterial color="#050505" roughness={0.8} />
      </mesh>
      
      {/* The 6 faces/stickers */}
      {colors.map((color, index) => {
        if (!color) return null;
        
        const pos: [number, number, number][] = [
          [0, 0.5, 0], [0, -0.5, 0], [0, 0, 0.5], [0, 0, -0.5], [-0.5, 0, 0], [0.5, 0, 0]
        ];
        const rot: [number, number, number][] = [
          [-Math.PI / 2, 0, 0], [Math.PI / 2, 0, 0], [0, 0, 0], [0, Math.PI, 0], [0, -Math.PI / 2, 0], [0, Math.PI / 2, 0]
        ];

        return (
          <mesh key={index} position={pos[index]} rotation={rot[index]} geometry={stickerGeom}>
            <meshStandardMaterial 
              color={color} 
              emissive={color}
              emissiveIntensity={0.22}
              roughness={0.25}
              metalness={0.2}
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

function getCubieColors(x: number, y: number, z: number, size: number, state: CubeState): string[] {
  const colors = ['', '', '', '', '', ''];
  if (!state.faces) return colors;
  const max = size - 1;
  if (y === max) colors[0] = state.faces.U[z * size + x];
  if (y === 0) colors[1] = state.faces.D[(max - z) * size + x];
  if (z === max) colors[2] = state.faces.F[(max - y) * size + x];
  if (z === 0) colors[3] = state.faces.B[(max - y) * size + (max - x)];
  if (x === 0) colors[4] = state.faces.L[(max - y) * size + z];
  if (x === max) colors[5] = state.faces.R[(max - y) * size + (max - z)];
  return colors;
}

export default function RubiksCube3D({ cubeState, size = 3 }: RubiksCube3DProps) {
  return (
    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [size * 2, size * 2, size * 2.5], fov: 45 }} gl={{ antialias: true }}>
        <color attach="background" args={['#111827']} />
        <CameraLights />
        <CubeGroup cubeState={cubeState} size={size} />
        <TrackballControls noPan={true} dynamicDampingFactor={0.15} rotateSpeed={4.0} />
      </Canvas>
    </div>
  );
}