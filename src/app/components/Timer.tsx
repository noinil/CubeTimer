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

  // Unified trigger for both Spacebar and Touch/Click
  const handleTriggerDown = useCallback(() => {
    if (state === 'idle' || state === 'stopped') {
      startInspection();
    } else if (state === 'inspection') {
      // Long press 300ms to ready
      if (!readyTimeoutRef.current) {
        readyTimeoutRef.current = setTimeout(() => {
          setState('ready');
        }, 300);
      }
    } else if (state === 'running') {
      // Stop timing
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
      // Clear inspection and start formal timing
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
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
      return;
    }

    if (e.code !== 'Space') return;
    e.preventDefault();
    if (spacePressed) return;
    setSpacePressed(true);
    handleTriggerDown();
  }, [spacePressed, handleTriggerDown]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
      return;
    }

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
    e?.stopPropagation(); // Prevent triggering the parent container's click
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
    <div 
      className="bg-gray-800 rounded-lg p-5 flex flex-col items-center justify-center space-y-4 touch-none select-none cursor-pointer active:bg-gray-750 transition-colors"
      onPointerDown={(e) => {
        // Only trigger on left click or touch
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        handleTriggerDown();
      }}
      onPointerUp={(e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        handleTriggerUp();
      }}
    >
      {/* Scramble */}
      <div className="text-center w-full pointer-events-none">
        <div className="text-xs text-gray-400 mb-1">Scramble</div>
        <div className="text-base font-mono text-white px-4 py-2 bg-gray-700 rounded">
          {scramble}
        </div>
      </div>

      {/* Timer Display */}
      <div className={`text-8xl font-bold tabular-nums ${getDisplayColor()} transition-colors pointer-events-none`}>
        {getDisplayValue()}
      </div>

      {/* Status Indicators */}
      <div className="flex items-center space-x-4 text-sm text-gray-400 pointer-events-none">
        {state === 'idle' && (
          <div className="flex items-center space-x-2">
            <Play className="w-4 h-4" />
            <span>Tap or Space to Start Inspection</span>
          </div>
        )}
        {state === 'inspection' && (
          <div className="flex items-center space-x-2 text-red-400">
            <span>Inspecting, Hold to Ready</span>
          </div>
        )}
        {state === 'ready' && (
          <div className="flex items-center space-x-2 text-green-400">
            <span>Release to Start!</span>
          </div>
        )}
        {state === 'running' && (
          <div className="flex items-center space-x-2 text-blue-400">
            <Pause className="w-4 h-4" />
            <span>Tap or Space to Stop</span>
          </div>
        )}
        {state === 'stopped' && (
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors pointer-events-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Control Hint */}
      <div className="text-xs text-gray-500 pointer-events-none">
        <div className="bg-gray-700 px-3 py-1 rounded inline-block">
          Tap screen or use Spacebar
        </div>
      </div>
    </div>
  );
}
