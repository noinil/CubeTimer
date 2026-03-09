import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerProps {
  onTimeRecorded: (time: number) => void;
  scramble: string;
}

type TimerState = 'idle' | 'ready' | 'running' | 'stopped';

export default function Timer({ onTimeRecorded, scramble }: TimerProps) {
  const [state, setState] = useState<TimerState>('idle');
  const [time, setTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [spacePressed, setSpacePressed] = useState(false);
  const [readyTimeout, setReadyTimeout] = useState<NodeJS.Timeout | null>(null);

  // 格式化时间显示
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
  };

  // 更新计时器
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (state === 'running') {
      interval = setInterval(() => {
        setDisplayTime(Date.now() - startTime);
      }, 10);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state, startTime]);

  // 键盘事件处理
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code !== 'Space') return;
    e.preventDefault();

    if (spacePressed) return;
    setSpacePressed(true);

    if (state === 'idle' || state === 'stopped') {
      // 长按空格准备开始
      const timeout = setTimeout(() => {
        setState('ready');
      }, 300);
      setReadyTimeout(timeout);
    } else if (state === 'running') {
      // 停止计时
      const finalTime = Date.now() - startTime;
      setTime(finalTime);
      setDisplayTime(finalTime);
      setState('stopped');
      onTimeRecorded(finalTime);
    }
  }, [state, spacePressed, startTime, onTimeRecorded]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code !== 'Space') return;
    e.preventDefault();
    
    setSpacePressed(false);

    if (readyTimeout) {
      clearTimeout(readyTimeout);
      setReadyTimeout(null);
    }

    if (state === 'ready') {
      // 开始计时
      setStartTime(Date.now());
      setDisplayTime(0);
      setState('running');
    }
  }, [state, readyTimeout]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // 重置计时器
  const handleReset = () => {
    setState('idle');
    setTime(0);
    setDisplayTime(0);
    setStartTime(0);
  };

  // 获取显示颜色
  const getDisplayColor = () => {
    switch (state) {
      case 'ready':
        return 'text-green-400';
      case 'running':
        return 'text-blue-400';
      case 'stopped':
        return 'text-white';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-8 flex flex-col items-center justify-center space-y-6">
      {/* 打乱公式 */}
      <div className="text-center">
        <div className="text-sm text-gray-400 mb-2">打乱公式</div>
        <div className="text-xl font-mono text-white px-6 py-3 bg-gray-700 rounded">
          {scramble}
        </div>
      </div>

      {/* 计时器显示 */}
      <div className={`text-9xl font-bold tabular-nums ${getDisplayColor()} transition-colors`}>
        {formatTime(displayTime)}
      </div>

      {/* 状态指示 */}
      <div className="flex items-center space-x-4 text-sm text-gray-400">
        {state === 'idle' && (
          <div className="flex items-center space-x-2">
            <Play className="w-4 h-4" />
            <span>按住空格键准备，松开开始计时</span>
          </div>
        )}
        {state === 'ready' && (
          <div className="flex items-center space-x-2 text-green-400">
            <span>松开空格键开始！</span>
          </div>
        )}
        {state === 'running' && (
          <div className="flex items-center space-x-2 text-blue-400">
            <Pause className="w-4 h-4" />
            <span>按空格键停止</span>
          </div>
        )}
        {state === 'stopped' && (
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重新开始</span>
          </button>
        )}
      </div>

      {/* 键盘提示 */}
      <div className="text-xs text-gray-500 mt-4">
        <div className="bg-gray-700 px-3 py-1 rounded inline-block">
          空格键控制计时
        </div>
      </div>
    </div>
  );
}
