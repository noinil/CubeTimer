import { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { TrackballControls } from '@react-three/drei';
import type { CubeState } from '../types/cube';
import * as THREE from 'three';

interface RubiksCube3DProps {
  cubeState: CubeState;
  size?: number;
}

// Helper to create rounded box geometry for cubies
function createCubieGeometry(size: number = 0.95, radius: number = 0.1, smoothness: number = 8) {
  const shape = new THREE.Shape();
  const eps = 0.0001;
  const halfSize = size / 2;
  const r = Math.min(radius, halfSize - eps);
  
  // Create a rounded square shape for extrusion
  shape.moveTo(-halfSize + r, -halfSize);
  shape.lineTo(halfSize - r, -halfSize);
  shape.absarc(halfSize - r, -halfSize + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(halfSize, halfSize - r);
  shape.absarc(halfSize - r, halfSize - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-halfSize + r, halfSize);
  shape.absarc(-halfSize + r, halfSize - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-halfSize, -halfSize + r);
  shape.absarc(-halfSize + r, -halfSize + r, r, Math.PI, -Math.PI / 2, false);

  return new THREE.ExtrudeGeometry(shape, {
    depth: size,
    bevelEnabled: false,
    curveSegments: smoothness
  });
}

function Cubie({ position, colors, size }: { position: [number, number, number]; colors: string[]; size: number }) {
  // We use standard boxes for cubies but with colored planes as stickers to keep it performant and sharp
  return (
    <group position={position}>
      {/* The black plastic body of the cubie */}
      <mesh>
        <boxGeometry args={[0.98, 0.98, 0.98]} />
        <meshStandardMaterial color="#111111" roughness={0.5} />
      </mesh>
      
      {/* The 6 faces/stickers */}
      {colors.map((color, index) => {
        if (!color) return null;
        
        // Define sticker offset and rotation based on face index:
        // 0:U(+Y), 1:D(-Y), 2:F(+Z), 3:B(-Z), 4:L(-X), 5:R(+X)
        const pos: [number, number, number][] = [
          [0, 0.5, 0], [0, -0.5, 0], [0, 0, 0.5], [0, 0, -0.5], [-0.5, 0, 0], [0.5, 0, 0]
        ];
        const rot: [number, number, number][] = [
          [-Math.PI / 2, 0, 0], [Math.PI / 2, 0, 0], [0, 0, 0], [0, Math.PI, 0], [0, -Math.PI / 2, 0], [0, Math.PI / 2, 0]
        ];

        return (
          <mesh key={index} position={pos[index]} rotation={rot[index]}>
            {/* Slightly inset and rounded sticker */}
            <planeGeometry args={[0.88, 0.88]} />
            <meshStandardMaterial 
              color={color} 
              emissive={color}
              emissiveIntensity={0.2}
              roughness={0.1}
              metalness={0.1}
              polygonOffset
              polygonOffsetFactor={-1} // Ensure sticker is always in front of black body
            />
          </mesh>
        );
      })}
    </group>
  );
}

function CubeGroup({ cubeState, size }: { cubeState: CubeState; size: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const cubies = useMemo(() => {
    if (!cubeState.faces) return [];
    const result = [];
    const offset = (size - 1) / 2;

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          // Only render the outer shell pieces
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

  return (
    <group ref={groupRef}>
      {cubies.map(cubie => (
        <Cubie key={cubie.key} position={cubie.position} colors={cubie.colors} size={size} />
      ))}
    </group>
  );
}

function getCubieColors(x: number, y: number, z: number, size: number, state: CubeState): string[] {
  // Order: U, D, F, B, L, R
  const colors = ['', '', '', '', '', ''];
  if (!state.faces) return colors;

  // Top (U): y = size - 1
  if (y === size - 1) colors[0] = state.faces.U[(size - 1 - z) * size + x];
  // Bottom (D): y = 0
  if (y === 0) colors[1] = state.faces.D[z * size + x];
  // Front (F): z = size - 1
  if (z === size - 1) colors[2] = state.faces.F[(size - 1 - y) * size + x];
  // Back (B): z = 0
  if (z === 0) colors[3] = state.faces.B[(size - 1 - y) * size + (size - 1 - x)];
  // Left (L): x = 0
  if (x === 0) colors[4] = state.faces.L[(size - 1 - y) * size + (size - 1 - z)];
  // Right (R): x = size - 1
  if (x === size - 1) colors[5] = state.faces.R[(size - 1 - y) * size + z];

  return colors;
}

export default function RubiksCube3D({ cubeState, size = 3 }: RubiksCube3DProps) {
  return (
    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden relative cursor-grab active:cursor-grabbing">
      <Canvas 
        camera={{ position: [size * 2, size * 2, size * 2.5], fov: 45 }} 
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#111827']} />
        <ambientLight intensity={1.5} />
        <pointLight position={[20, 20, 20]} intensity={2} />
        <pointLight position={[-20, -20, -20]} intensity={1} />
        <CubeGroup cubeState={cubeState} size={size} />
        <TrackballControls 
          noPan={true}
          dynamicDampingFactor={0.15}
          rotateSpeed={4.0}
        />
      </Canvas>
    </div>
  );
}