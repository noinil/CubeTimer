import { useState, useEffect, useCallback, useRef } from 'react';

interface TimerProps {
  onTimeRecorded: (time: number, dnf?: boolean) => void;
  onDnfLast?: () => void;
  onPlus2Last?: () => void;
  scramble: string;
}

type TimerState = 'idle' | 'inspection' | 'ready' | 'running' | 'stopped';

const INSPECTION_SECONDS = 15;

export default function Timer({ onTimeRecorded, onDnfLast, onPlus2Last, scramble }: TimerProps) {
  const [state, setState] = useState<TimerState>('idle');
  const [displayTime, setDisplayTime] = useState(0);
  const [inspectionLeft, setInspectionLeft] = useState(INSPECTION_SECONDS);
  const [isDnf, setIsDnf] = useState(false);
  const [isPlus2, setIsPlus2] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);

  // Use refs for all timers to avoid closure issues
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

  // Cleanup on unmount
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
    const milliseconds = Math.floor(ms % 1000);
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }
    return `${seconds}.${milliseconds.toString().padStart(3, '0')}`;
  };

  const startInspection = useCallback(() => {
    setIsDnf(false);
    setIsPlus2(false);
    setInspectionLeft(INSPECTION_SECONDS);
    setState('inspection');

    const inspectionStart = performance.now();

    inspectionIntervalRef.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((INSPECTION_SECONDS * 1000 - (performance.now() - inspectionStart)) / 1000));
      setInspectionLeft(left);
    }, 100);

    inspectionExpireRef.current = setTimeout(() => {
      clearInspection();
      setIsDnf(true);
      setState('stopped');
      onTimeRecordedRef.current(0, true);
    }, INSPECTION_SECONDS * 1000);
  }, []);

  // Unified trigger logic
  const handleTriggerDown = useCallback(() => {
    if (state === 'idle' || state === 'stopped') {
      startInspection();
    } else if (state === 'inspection') {
      if (!readyTimeoutRef.current) {
        readyTimeoutRef.current = setTimeout(() => {
          setState('ready');
        }, 300);
      }
    } else if (state === 'running') {
      const finalTime = performance.now() - startTimeRef.current;
      clearRunning();
      setDisplayTime(finalTime);
      setState('stopped');
      onTimeRecordedRef.current(finalTime);
    }
  }, [state, startInspection]);

  const handleTriggerUp = useCallback(() => {
    if (readyTimeoutRef.current) {
      clearTimeout(readyTimeoutRef.current);
      readyTimeoutRef.current = null;
    }

    if (state === 'ready') {
      clearInspection();
      const now = performance.now();
      startTimeRef.current = now;
      setDisplayTime(0);
      setState('running');

      runningIntervalRef.current = setInterval(() => {
        setDisplayTime(performance.now() - startTimeRef.current);
      }, 1);
    }
  }, [state]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
    
    // Only Spacebar trigger - No D/P shortcuts
    if (e.code !== 'Space') return;
    e.preventDefault();
    if (spacePressed) return;
    setSpacePressed(true);
    handleTriggerDown();
  }, [spacePressed, handleTriggerDown]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
    if (e.code !== 'Space') return;
    e.preventDefault();
    setSpacePressed(false);
    handleTriggerUp();
  }, [handleTriggerUp]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const handleReset = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    clearInspection();
    clearRunning();
    setIsDnf(false);
    setIsPlus2(false);
    setDisplayTime(0);
    setInspectionLeft(INSPECTION_SECONDS);
    setState('idle');
  };

  const handleManualDnf = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (state !== 'stopped') return;
    setIsDnf(!isDnf);
    onDnfLast?.();
  };

  const handleManualPlus2 = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (state !== 'stopped') return;
    setIsPlus2(!isPlus2);
    onPlus2Last?.();
  };

  const getDisplayColor = () => {
    switch (state) {
      case 'inspection': return 'text-red-400';
      case 'ready':      return 'text-green-400';
      case 'running':    return 'text-blue-400';
      case 'stopped':    return isDnf ? 'text-red-400' : isPlus2 ? 'text-yellow-400' : 'text-white';
      default:           return 'text-gray-400';
    }
  };

  const getDisplayValue = () => {
    if (state === 'inspection') return inspectionLeft.toString();
    if (state === 'ready') return formatTime(0);
    if (state === 'stopped' && isDnf) return 'DNF';
    const time = displayTime + (isPlus2 ? 2000 : 0);
    return (isPlus2 && state === 'stopped' ? '+2 ' : '') + formatTime(time);
  };

  // Helper to get trigger props
  const triggerProps = {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      handleTriggerDown();
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      handleTriggerUp();
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-5 flex flex-col items-center justify-center space-y-4 touch-none select-none transition-colors h-full">
      {/* Scramble Display */}
      <div className="text-center w-full">
        <div className="text-xs text-gray-400 mb-1">Scramble</div>
        <div className="text-base font-mono text-white px-4 py-2 bg-gray-700 rounded select-text">
          {scramble}
        </div>
      </div>

      {/* Timer Display */}
      <div className={`text-8xl font-bold tabular-nums ${getDisplayColor()} transition-colors py-4`}>
        {getDisplayValue()}
      </div>

      {/* Primary Trigger Area */}
      <div className="w-full max-w-sm">
        {state === 'idle' && (
          <button
            {...triggerProps}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95"
          >
            <span className="text-lg font-bold uppercase tracking-widest">Start</span>
            <span className="text-[10px] opacity-70">Tap to start inspection</span>
          </button>
        )}

        {state === 'inspection' && (
          <button
            {...triggerProps}
            className="w-full py-4 bg-red-600 text-white rounded-xl flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95"
          >
            <span className="text-lg font-bold uppercase tracking-widest">Inspect</span>
            <span className="text-[10px] opacity-70">Hold to ready</span>
          </button>
        )}

        {state === 'ready' && (
          <button
            {...triggerProps}
            className="w-full py-4 bg-green-600 text-white rounded-xl flex flex-col items-center justify-center shadow-lg scale-105"
          >
            <span className="text-lg font-bold uppercase tracking-widest">Ready!</span>
            <span className="text-[10px] opacity-90">Release to start</span>
          </button>
        )}

        {state === 'running' && (
          <button
            {...triggerProps}
            className="w-full py-4 bg-gray-100 text-gray-900 rounded-xl flex flex-col items-center justify-center shadow-lg active:bg-white"
          >
            <span className="text-lg font-bold uppercase tracking-widest">STOP</span>
            <span className="text-[10px] font-bold opacity-60">Hit this pad</span>
          </button>
        )}

        {state === 'stopped' && (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2 w-full">
              <button
                onClick={handleReset}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center shadow-lg transition-colors font-bold uppercase text-sm"
              >
                <span>Start</span>
              </button>
              <button
                onClick={handleManualDnf}
                className={`flex-1 py-4 rounded-xl transition-all font-bold uppercase text-sm border-2 ${
                  isDnf ? 'bg-red-600 text-white border-red-400' : 'bg-gray-700 text-red-400 border-transparent hover:bg-gray-600'
                }`}
              >
                DNF
              </button>
              <button
                onClick={handleManualPlus2}
                className={`flex-1 py-4 rounded-xl transition-all font-bold uppercase text-sm border-2 ${
                  isPlus2 ? 'bg-yellow-600 text-white border-yellow-400' : 'bg-gray-700 text-yellow-400 border-transparent hover:bg-gray-600'
                }`}
              >
                +2
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Accessibility Hint */}
      <div className="text-[10px] text-gray-500 font-medium">
        <div className="bg-gray-700 px-3 py-1 rounded">
          Spacebar trigger supported
        </div>
      </div>
    </div>
  );
}
