import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerProps {
  onTimeRecorded: (time: number, dnf?: boolean) => void;
  scramble: string;
}

type TimerState = 'idle' | 'inspection' | 'ready' | 'running' | 'stopped';

const INSPECTION_SECONDS = 15;

export default function Timer({ onTimeRecorded, scramble }: TimerProps) {
  const [state, setState] = useState<TimerState>('idle');
  const [displayTime, setDisplayTime] = useState(0);
  const [inspectionLeft, setInspectionLeft] = useState(INSPECTION_SECONDS);
  const [isDnf, setIsDnf] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);

  // 用 ref 管理所有计时器，避免闭包问题
  const readyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inspectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inspectionExpireRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runningIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const onTimeRecordedRef = useRef(onTimeRecorded);
  useEffect(() => { onTimeRecordedRef.current = onTimeRecorded; }, [onTimeRecorded]);

  const clearInspection = () => {
    if (inspectionIntervalRef.current) { clearInterval(inspectionIntervalRef.current); inspectionIntervalRef.current = null; }
    if (inspectionExpireRef.current) { clearTimeout(inspectionExpireRef.current); inspectionExpireRef.current = null; }
  };

  const clearRunning = () => {
    if (runningIntervalRef.current) { clearInterval(runningIntervalRef.current); runningIntervalRef.current = null; }
  };

  // 卸载时清理所有计时器
  useEffect(() => {
    return () => {
      clearInspection();
      clearRunning();
      if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
    };
  }, []);

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

  const startInspection = useCallback(() => {
    setIsDnf(false);
    setInspectionLeft(INSPECTION_SECONDS);
    setState('inspection');

    const inspectionStart = Date.now();

    inspectionIntervalRef.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((INSPECTION_SECONDS * 1000 - (Date.now() - inspectionStart)) / 1000));
      setInspectionLeft(left);
    }, 100);

    inspectionExpireRef.current = setTimeout(() => {
      clearInspection();
      setIsDnf(true);
      setState('stopped');
      onTimeRecordedRef.current(0, true);
    }, INSPECTION_SECONDS * 1000);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code !== 'Space') return;
    e.preventDefault();
    if (spacePressed) return;
    setSpacePressed(true);

    if (state === 'idle' || state === 'stopped') {
      startInspection();
    } else if (state === 'inspection') {
      // 长按 300ms 进入 ready
      readyTimeoutRef.current = setTimeout(() => {
        setState('ready');
      }, 300);
    } else if (state === 'running') {
      // 停止计时
      const finalTime = Date.now() - startTimeRef.current;
      clearRunning();
      setDisplayTime(finalTime);
      setState('stopped');
      onTimeRecordedRef.current(finalTime);
    }
  }, [state, spacePressed, startInspection]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code !== 'Space') return;
    e.preventDefault();
    setSpacePressed(false);

    if (readyTimeoutRef.current) {
      clearTimeout(readyTimeoutRef.current);
      readyTimeoutRef.current = null;
    }

    if (state === 'ready') {
      // 清除观察计时器，开始正式计时
      clearInspection();
      const now = Date.now();
      startTimeRef.current = now;
      setDisplayTime(0);
      setState('running');

      runningIntervalRef.current = setInterval(() => {
        setDisplayTime(Date.now() - startTimeRef.current);
      }, 10);
    }
  }, [state]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const handleReset = () => {
    clearInspection();
    clearRunning();
    setIsDnf(false);
    setDisplayTime(0);
    setInspectionLeft(INSPECTION_SECONDS);
    setState('idle');
  };

  const getDisplayColor = () => {
    switch (state) {
      case 'inspection': return 'text-red-400';
      case 'ready':      return 'text-green-400';
      case 'running':    return 'text-blue-400';
      case 'stopped':    return isDnf ? 'text-red-400' : 'text-white';
      default:           return 'text-gray-400';
    }
  };

  const getDisplayValue = () => {
    if (state === 'inspection') return inspectionLeft.toString();
    if (state === 'ready') return formatTime(0);
    if (state === 'stopped' && isDnf) return 'DNF';
    return formatTime(displayTime);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-5 flex flex-col items-center justify-center space-y-4">
      {/* 打乱公式 */}
      <div className="text-center w-full">
        <div className="text-xs text-gray-400 mb-1">打乱公式</div>
        <div className="text-base font-mono text-white px-4 py-2 bg-gray-700 rounded">
          {scramble}
        </div>
      </div>

      {/* 计时器显示 */}
      <div className={`text-8xl font-bold tabular-nums ${getDisplayColor()} transition-colors`}>
        {getDisplayValue()}
      </div>

      {/* 状态指示 */}
      <div className="flex items-center space-x-4 text-sm text-gray-400">
        {state === 'idle' && (
          <div className="flex items-center space-x-2">
            <Play className="w-4 h-4" />
            <span>按空格键开始观察</span>
          </div>
        )}
        {state === 'inspection' && (
          <div className="flex items-center space-x-2 text-red-400">
            <span>观察中，长按空格键准备计时</span>
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
            className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重新开始</span>
          </button>
        )}
      </div>

      {/* 键盘提示 */}
      <div className="text-xs text-gray-500">
        <div className="bg-gray-700 px-3 py-1 rounded inline-block">
          空格键控制计时
        </div>
      </div>
    </div>
  );
}
