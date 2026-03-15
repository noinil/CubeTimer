import { useState, useEffect } from 'react';
import RubiksCube3D from './components/RubiksCube3D';
import Megaminx3D from './components/Megaminx3D';
import { ManualScrambleDialog } from './components/ManualScrambleDialog';
import Timer from './components/Timer';
import Statistics from './components/Statistics';
import { generateScramble, applyScramble } from './utils/cubeLogic';
import { generateScramble2x2, applyScramble2x2 } from './utils/cubeLogic2x2';
import { generateScramble4x4, applyScramble4x4 } from './utils/cubeLogic4x4';
import { generateScramble5x5, applyScramble5x5 } from './utils/cubeLogic5x5';
import { generateScramble6x6, applyScramble6x6 } from './utils/cubeLogic6x6';
import { generateScramble7x7, applyScramble7x7 } from './utils/cubeLogic7x7';
import { generateScrambleMegaminx, applyScrambleMegaminx } from './utils/cubeLogicMegaminx';
import { saveRecord, getRecords, deleteRecord, clearAllRecords, exportRecords } from './utils/storage';
import type { TimeRecord, CubeState, PuzzleType } from './types/cube';
import { RotateCcw, Github, Globe, Tag } from 'lucide-react';

export default function App() {
  const version = "1.1.0";
  const [puzzleType, setPuzzleType] = useState<PuzzleType>('3x3');
  const [scramble, setScramble] = useState('');
  const [cubeState, setCubeState] = useState<CubeState | null>(null);
  const [records, setRecords] = useState<TimeRecord[]>([]);

  // 应用手动输入的打乱公式
  const handleManualScrambleApply = (manualScramble: string) => {
    if (!manualScramble) return;
    
    // 关键修复：预处理字符串，将所有空白字符（空格、换行、Tab）统一替换为单空格
    const cleanScramble = manualScramble.trim().split(/\s+/).join(' ');

    setScramble(cleanScramble);
    if (puzzleType === '2x2') {
      setCubeState(applyScramble2x2(cleanScramble));
    } else if (puzzleType === '4x4') {
      setCubeState(applyScramble4x4(cleanScramble));
    } else if (puzzleType === '5x5') {
      setCubeState(applyScramble5x5(cleanScramble));
    } else if (puzzleType === '6x6') {
      setCubeState(applyScramble6x6(cleanScramble));
    } else if (puzzleType === '7x7') {
      setCubeState(applyScramble7x7(cleanScramble));
    } else if (puzzleType === 'Megaminx') {
      setCubeState(applyScrambleMegaminx(cleanScramble));
    } else {
      setCubeState(applyScramble(cleanScramble));
    }
  };

  // 生成新的打乱公式
  const generateNewScramble = (type: PuzzleType = puzzleType) => {
    if (type === '2x2') {
      const newScramble = generateScramble2x2(12);
      setScramble(newScramble);
      setCubeState(applyScramble2x2(newScramble));
    } else if (type === '4x4') {
      const newScramble = generateScramble4x4(40);
      setScramble(newScramble);
      setCubeState(applyScramble4x4(newScramble));
    } else if (type === '5x5') {
      const newScramble = generateScramble5x5(60);
      setScramble(newScramble);
      setCubeState(applyScramble5x5(newScramble));
    } else if (type === '6x6') {
      const newScramble = generateScramble6x6(80);
      setScramble(newScramble);
      setCubeState(applyScramble6x6(newScramble));
    } else if (type === '7x7') {
      const newScramble = generateScramble7x7(100);
      setScramble(newScramble);
      setCubeState(applyScramble7x7(newScramble));
    } else if (type === 'Megaminx') {
      const newScramble = generateScrambleMegaminx(70);
      setScramble(newScramble);
      setCubeState(applyScrambleMegaminx(newScramble));
    } else {
      const newScramble = generateScramble(25);
      setScramble(newScramble);
      setCubeState(applyScramble(newScramble));
    }
  };

  // 切换阶数：询问是否保存，然后无论如何清空所有记录
  const handlePuzzleTypeChange = (type: PuzzleType) => {
    if (records.length > 0) {
      const shouldSave = confirm(`Do you want to save the current ${puzzleType} records before switching?`);
      if (shouldSave) exportRecords(records, puzzleType);
    }
    clearAllRecords();
    setRecords([]);
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
    if (confirm('Are you sure you want to clear all records?')) {
      clearAllRecords();
      setRecords([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-[1800px] mx-auto space-y-4">
        {/* 标题 */}
        <div className="text-center py-1">
          <h1 className="text-2xl font-bold">CubeTimer</h1>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-1">
            <div className="flex items-center gap-3">
              <p className="text-gray-400 text-sm">Rubik's Cube Timer</p>
              <select
                value={puzzleType}
                onChange={(e) => handlePuzzleTypeChange(e.target.value as PuzzleType)}
                className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600 cursor-pointer hover:bg-gray-600 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="3x3">3×3</option>
                <option value="2x2">2×2</option>
                <option value="4x4">4×4</option>
                <option value="5x5">5×5</option>
                <option value="6x6">6×6</option>
                <option value="7x7">7×7</option>
                <option value="Megaminx">Megaminx</option>
              </select>
            </div>

            <div className="hidden xs:block border-l border-gray-700 h-4 mx-1"></div>

            <div className="flex items-center gap-3">
              <a 
                href="https://github.com/noinil" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-xs group"
                title="GitHub Repository"
              >
                <Github className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
              <a 
                href="https://c-tan.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-xs group"
                title="Personal Website"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Website</span>
              </a>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs border-l border-gray-800 pl-3">
                <Tag className="w-3.5 h-3.5" />
                <span>v{version}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 左侧：3D魔方 */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-semibold">Cube Preview</h2>
                <div className="flex gap-2">
                  <ManualScrambleDialog
                    onApply={handleManualScrambleApply}
                    puzzleType={puzzleType}
                  />
                  <button
                    onClick={() => generateNewScramble()}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>New Scramble</span>
                  </button>
                </div>
              </div>
              <div className="aspect-[2/1]">
                {cubeState && (
                  puzzleType === 'Megaminx' ? (
                    <Megaminx3D cubeState={cubeState} />
                  ) : (
                    <RubiksCube3D
                      cubeState={cubeState}
                      size={puzzleType === '2x2' ? 2 : puzzleType === '4x4' ? 4 : puzzleType === '5x5' ? 5 : puzzleType === '6x6' ? 6 : puzzleType === '7x7' ? 7 : 3}
                    />
                  )
                )}
              </div>
              <div className="mt-2 text-xs text-gray-400 text-center">
                Drag to Rotate • Scroll to Zoom
              </div>
            </div>
          </div>

          {/* 右侧：计时器 */}
          <div className="lg:col-span-2">
            <Timer
              key={puzzleType}
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
