import { useState, useEffect } from 'react';
import RubiksCubeCSS from './components/RubiksCubeCSS';
import Timer from './components/Timer';
import Statistics from './components/Statistics';
import { generateScramble, applyScramble } from './utils/cubeLogic';
import { generateScramble2x2, applyScramble2x2 } from './utils/cubeLogic2x2';
import { generateScramble4x4, applyScramble4x4 } from './utils/cubeLogic4x4';
import { saveRecord, getRecords, deleteRecord, clearAllRecords } from './utils/storage';
import type { TimeRecord, CubeState, PuzzleType } from './types/cube';
import { RotateCcw } from 'lucide-react';

export default function App() {
  const [puzzleType, setPuzzleType] = useState<PuzzleType>('3x3');
  const [scramble, setScramble] = useState('');
  const [cubeState, setCubeState] = useState<CubeState | null>(null);
  const [records, setRecords] = useState<TimeRecord[]>([]);

  // 生成新的打乱公式
  const generateNewScramble = (type: PuzzleType = puzzleType) => {
    if (type === '2x2') {
      const newScramble = generateScramble2x2(11);
      setScramble(newScramble);
      setCubeState(applyScramble2x2(newScramble));
    } else if (type === '4x4') {
      const newScramble = generateScramble4x4(40);
      setScramble(newScramble);
      setCubeState(applyScramble4x4(newScramble));
    } else {
      const newScramble = generateScramble(20);
      setScramble(newScramble);
      setCubeState(applyScramble(newScramble));
    }
  };

  // 切换阶数时自动生成新打乱
  const handlePuzzleTypeChange = (type: PuzzleType) => {
    setPuzzleType(type);
    generateNewScramble(type);
  };

  // 初始化
  useEffect(() => {
    generateNewScramble('3x3');
    setRecords(getRecords());
  }, []);

  // 记录时间
  const handleTimeRecorded = (time: number, dnf?: boolean) => {
    const record: TimeRecord = {
      id: Date.now().toString(),
      time,
      scramble,
      date: new Date().toISOString(),
      dnf,
      puzzleType,
    };

    saveRecord(record);
    setRecords(getRecords());

    setTimeout(() => {
      generateNewScramble();
    }, 1000);
  };

  // 删除记录
  const handleDeleteRecord = (id: string) => {
    deleteRecord(id);
    setRecords(getRecords());
  };

  // 清空所有记录
  const handleClearAll = () => {
    if (confirm('确定要清空所有记录吗？')) {
      clearAllRecords();
      setRecords([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-[1800px] mx-auto space-y-4">
        {/* 标题 */}
        <div className="text-center py-1">
          <h1 className="text-2xl font-bold">魔方计时器</h1>
          <div className="flex items-center justify-center gap-3 mt-1">
            <p className="text-gray-400 text-sm">Rubik's Cube Timer</p>
            <select
              value={puzzleType}
              onChange={(e) => handlePuzzleTypeChange(e.target.value as PuzzleType)}
              className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600 cursor-pointer"
            >
              <option value="3x3">3×3</option>
              <option value="2x2">2×2</option>
              <option value="4x4">4×4</option>
            </select>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 左侧：3D魔方 */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-semibold">魔方预览</h2>
                <button
                  onClick={() => generateNewScramble()}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>新打乱</span>
                </button>
              </div>
              <div className="aspect-[2/1]">
                {cubeState && (
                  <RubiksCubeCSS
                    cubeState={cubeState}
                    size={puzzleType === '2x2' ? 2 : puzzleType === '4x4' ? 4 : 3}
                  />
                )}
              </div>
              <div className="mt-2 text-xs text-gray-400 text-center">
                拖动旋转 • 滚轮缩放
              </div>
            </div>
          </div>

          {/* 右侧：计时器 */}
          <div className="lg:col-span-2">
            <Timer
              scramble={scramble}
              onTimeRecorded={handleTimeRecorded}
            />
          </div>
        </div>

        {/* 统计信息 */}
        <Statistics
          records={records}
          puzzleType={puzzleType}
          onDeleteRecord={handleDeleteRecord}
          onClearAll={handleClearAll}
        />
      </div>
    </div>
  );
}
