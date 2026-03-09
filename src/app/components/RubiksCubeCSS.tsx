import { useState } from 'react';
import type { CubeState } from '../types/cube';

interface RubiksCubeCSSProps {
  cubeState: CubeState;
}

export default function RubiksCubeCSS({ cubeState }: RubiksCubeCSSProps) {
  const [rotateX, setRotateX] = useState(-25);
  const [rotateY, setRotateY] = useState(45);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    
    setRotateY(rotateY + deltaX * 0.5);
    setRotateX(rotateX - deltaY * 0.5);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const renderFace = (faceName: keyof CubeState['faces'], transform: string) => {
    const colors = cubeState.faces[faceName];
    return (
      <div
        className="absolute w-[150px] h-[150px] grid grid-cols-3 gap-1 p-1 bg-black"
        style={{ transform }}
      >
        {colors.map((color, i) => (
          <div
            key={i}
            className="rounded-sm border border-black"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className="w-full h-full bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="relative"
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative transition-transform duration-100"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            width: '150px',
            height: '150px',
          }}
        >
          {/* Front - Green */}
          {renderFace('F', 'translateZ(75px)')}
          
          {/* Back - Blue */}
          {renderFace('B', 'translateZ(-75px) rotateY(180deg)')}
          
          {/* Top - White */}
          {renderFace('U', 'rotateX(90deg) translateZ(75px)')}
          
          {/* Bottom - Yellow */}
          {renderFace('D', 'rotateX(-90deg) translateZ(75px)')}
          
          {/* Left - Orange */}
          {renderFace('L', 'rotateY(-90deg) translateZ(75px)')}
          
          {/* Right - Red */}
          {renderFace('R', 'rotateY(90deg) translateZ(75px)')}
        </div>
      </div>
      <div className="absolute bottom-4 text-xs text-gray-500">
        拖动旋转魔方
      </div>
    </div>
  );
}
