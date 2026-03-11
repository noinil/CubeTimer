import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { TrackballControls } from '@react-three/drei';
import * as THREE from 'three';
import megaminxData from '../utils/megaminxData.json';
import type { CubeState } from '../types/cube';

interface Megaminx3DProps {
  cubeState: CubeState;
}

/**
 * Creates a rounded polygon geometry.
 */
function createRoundedPolygonGeometry(points: number[][], radius: number = 0.05, segments: number = 4, inset: number = 0) {
  if (!points || points.length < 3) return new THREE.BufferGeometry();
  
  const originalVecs = points.map(p => new THREE.Vector3(...p));
  const centroid = new THREE.Vector3(0, 0, 0);
  originalVecs.forEach(v => centroid.add(v));
  centroid.multiplyScalar(1 / originalVecs.length);

  // Shrink points toward centroid if inset > 0
  const vecs = inset > 0 ? originalVecs.map(v => v.clone().lerp(centroid, inset)) : originalVecs;
  
  const shrunkCentroid = new THREE.Vector3(0, 0, 0);
  vecs.forEach(v => shrunkCentroid.add(v));
  shrunkCentroid.multiplyScalar(1 / vecs.length);

  const roundedPoints: THREE.Vector3[] = [];

  for (let i = 0; i < vecs.length; i++) {
    const prev = vecs[(i + vecs.length - 1) % vecs.length];
    const curr = vecs[i];
    const next = vecs[(i + 1) % vecs.length];

    const dirPrev = new THREE.Vector3().subVectors(prev, curr).normalize();
    const dirNext = new THREE.Vector3().subVectors(next, curr).normalize();

    const dPrev = curr.distanceTo(prev) * 0.4;
    const dNext = curr.distanceTo(next) * 0.4;
    const actualRadius = Math.min(radius, dPrev, dNext);

    for (let j = 0; j <= segments; j++) {
      const t = j / segments;
      const p0 = curr.clone().add(dirPrev.clone().multiplyScalar(actualRadius));
      const p1 = curr;
      const p2 = curr.clone().add(dirNext.clone().multiplyScalar(actualRadius));
      
      const res = new THREE.Vector3();
      res.x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
      res.y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
      res.z = (1 - t) * (1 - t) * p0.z + 2 * (1 - t) * t * p1.z + t * t * p2.z;
      roundedPoints.push(res);
    }
  }

  const vertices = [];
  for (let i = 0; i < roundedPoints.length; i++) {
    const p1 = roundedPoints[i];
    const p2 = roundedPoints[(i + 1) % roundedPoints.length];
    vertices.push(shrunkCentroid.x, shrunkCentroid.y, shrunkCentroid.z);
    vertices.push(p1.x, p1.y, p1.z);
    vertices.push(p2.x, p2.y, p2.z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals(); 
  return geometry;
}

function MegaminxGroup({ cubeState }: { cubeState: CubeState }) {
  const groupRef = useRef<THREE.Group>(null);

  // Auto-rotation removed as requested.

  const stickerData = useMemo(() => {
    if (!Array.isArray(megaminxData)) return [];
    
    const data = [];
    megaminxData.forEach(p => {
      if (p.faces && Array.isArray(p.faces)) {
        const stickerRadius = p.type === 'center' ? 0.24 : (p.type === 'corner' ? 0.16 : 0.08);
        
        p.faces.forEach(f => {
          const baseGeom = createRoundedPolygonGeometry(f.points, 0.01, 2, 0);
          const stickerGeom = createRoundedPolygonGeometry(f.points, stickerRadius, 8, 0.12);
          
          data.push({ 
            pieceId: p.id, 
            face: f.face, 
            baseGeom,
            stickerGeom,
            normal: new THREE.Vector3(...f.points[0]).add(new THREE.Vector3(...f.points[1])).normalize()
          });
        });
      }
    });
    return data;
  }, []);

  const meshes = useMemo(() => {
    if (!cubeState.megaminx || cubeState.megaminx.length < 132 || stickerData.length < 132) {
      return null;
    }
    
    return stickerData.map((st, i) => {
      const color = cubeState.megaminx[i] || '#000000';
      
      return (
        <group key={i}>
          <mesh geometry={st.baseGeom}>
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} side={THREE.DoubleSide} />
          </mesh>
          <mesh geometry={st.stickerGeom} position={st.normal.clone().multiplyScalar(0.01)}>
            <meshStandardMaterial 
              color={color} 
              emissive={color}
              emissiveIntensity={0.3}
              roughness={0.1} 
              metalness={0.1} 
              side={THREE.DoubleSide} 
            />
          </mesh>
        </group>
      );
    });
  }, [cubeState.megaminx, stickerData]);

  if (!meshes) return null;

  return (
    <group ref={groupRef} scale={[1.2, 1.2, 1.2]}>
      {meshes}
    </group>
  );
}

export default function Megaminx3D({ cubeState }: Megaminx3DProps) {
  if (!cubeState || !cubeState.megaminx) {
    return <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-900 rounded-lg">准备中...</div>;
  }

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden relative cursor-grab active:cursor-grabbing">
      <Canvas 
        camera={{ position: [5, 2, 5], fov: 45 }} 
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#111827']} />
        <ambientLight intensity={2.0} />
        <pointLight position={[15, 15, 15]} intensity={3.0} />
        <pointLight position={[-15, -15, -15]} intensity={1.5} />
        <MegaminxGroup cubeState={cubeState} />
        <TrackballControls 
          noPan={true}
          minDistance={3} 
          maxDistance={10} 
          dynamicDampingFactor={0.1}
          rotateSpeed={4.0}
        />
      </Canvas>
    </div>
  );
}