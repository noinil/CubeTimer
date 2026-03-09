import { useState, useEffect } from 'react';
import RubiksCubeCSS from './components/RubiksCubeCSS';
import Timer from './components/Timer';
import Statistics from './components/Statistics';
import { generateScramble, applyScramble } from './utils/cubeLogic';
import { saveRecord, getRecords, deleteRecord, clearAllRecords } from './utils/storage';
import type { TimeRecord, CubeState } from './types/cube';
import { RotateCcw } from 'lucide-react';

export default function App() {
  const [scramble, setScramble] = useState('');
  const [cubeState, setCubeState] = useState<CubeState | null>(null);
  const [records, setRecords] = useState<TimeRecord[]>([]);

  // 生成新的打乱公式
  const generateNewScramble = () => {
    const newScramble = generateScramble(20);
    setScramble(newScramble);
    const newState = applyScramble(newScramble);
    setCubeState(newState);
  };

  // 初始化
  useEffect(() => {
    generateNewScramble();
    setRecords(getRecords());
  }, []);

  // 记录时间
  const handleTimeRecorded = (time: number) => {
    const record: TimeRecord = {
      id: Date.now().toString(),
      time,
      scramble,
      date: new Date().toISOString(),
    };
    
    saveRecord(record);
    setRecords(getRecords());
    
    // 自动生成新的打乱公式
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
          <p className="text-gray-400 text-sm">3x3 Rubik's Cube Timer</p>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 左侧：3D魔方 */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-semibold">魔方预览</h2>
                <button
                  onClick={generateNewScramble}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>新打乱</span>
                </button>
              </div>
              <div className="aspect-square">
                {cubeState && <RubiksCubeCSS cubeState={cubeState} />}
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
          onDeleteRecord={handleDeleteRecord}
          onClearAll={handleClearAll}
        />
      </div>
    </div>
  );
}