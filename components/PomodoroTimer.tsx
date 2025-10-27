import { useEffect, useState, useRef, useCallback } from 'react';
import { Task } from '../types/task';
import { Timer, Play, Pause, RotateCcw, SkipForward } from "lucide-react";

// Shared AudioContext for all sounds
let sharedAudioContext: AudioContext | null = null;
function getAudioContext() {
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioContext = new AudioContextClass();
  }
  return sharedAudioContext;
}

const createTone = (frequency: number, duration: number, volume: number = 0.3) => {
    const audioContext = getAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
    
    return audioContext;
};

const playWorkCompletionSound = (volume: number = 0.3) => {
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 - ascending chord
    const duration = 0.5;
    const gap = 0.3;
    const repeat = 6;
    const repeatGap = 0.25;
    for (let r = 0; r < repeat; r++) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                createTone(freq, duration, volume);
            }, r * ((frequencies.length * (duration + gap)) + repeatGap * 1000) + index * (duration + gap) * 1000);
        });
    }
};

const playBreakCompletionSound = (volume: number = 0.3) => {
    const frequencies = [783.99, 659.25]; // G5, E5 - descending notes
    const duration = 0.6;
    const gap = 0.4;
    const repeat = 6;
    const repeatGap = 0.25;
    for (let r = 0; r < repeat; r++) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                createTone(freq, duration, volume);
            }, r * ((frequencies.length * (duration + gap)) + repeatGap * 1000) + index * (duration + gap) * 1000);
        });
    }
};

export default function PomodoroTimer({
    task,
    incrementPomos,
    updateTime,
    workDuration = 25 * 60,
    shortBreakDuration = 5 * 60,
    longBreakDuration = 15 * 60,
    longBreakInterval = 4,
    onRunningChange,
    onModeChange,
    completedWorkSessions,
    setCompletedWorkSessions,
    soundEnabled = true,
    soundVolume = 0.3,
}: {
    task: Task | null;
    incrementPomos: (id: string) => void;
    updateTime: (id: string, seconds: number) => void;
    workDuration?: number;
    shortBreakDuration?: number;
    longBreakDuration?: number;
    longBreakInterval?: number;
    onRunningChange?: (running: boolean) => void;
    onModeChange?: (mode: 'work' | 'shortBreak' | 'longBreak') => void;
    completedWorkSessions: number;
    setCompletedWorkSessions: React.Dispatch<React.SetStateAction<number>>;
    soundEnabled?: boolean;
    soundVolume?: number;
}) {
    const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
    const [secondsLeft, setSecondsLeft] = useState(workDuration);
    const [running, setRunning] = useState(false);
    const prevTaskId = useRef<string | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Notify parent when running changes
    useEffect(() => {
        if (onRunningChange) onRunningChange(running);
    }, [running, onRunningChange]);

    // Notify parent when mode changes
    useEffect(() => {
        if (onModeChange) onModeChange(mode);
    }, [mode, onModeChange]);

    // Reset timer and mode when task changes
    useEffect(() => {
        if (task && task.id !== prevTaskId.current) {
            setMode('work');
            setSecondsLeft(task.remainingSeconds ?? workDuration);
            setRunning(false);
            prevTaskId.current = task.id;
        } else if (!task && prevTaskId.current !== null) {
            setMode('work');
            setSecondsLeft(workDuration);
            setRunning(false);
            prevTaskId.current = null;
        }
    }, [task, workDuration]);

    // Timer countdown logic - only decrement secondsLeft
    useEffect(() => {
        if (running && secondsLeft > 0) {
            timerRef.current = setTimeout(() => {
                setSecondsLeft(prev => prev - 1);
            }, 1000);
        }
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [running, secondsLeft]);

    // Handle mode transitions and pomodoro increments when timer hits zero
    useEffect(() => {
        if (!running || secondsLeft !== 0) return;
        if (!task) return;

        if (mode === 'work') {
            // Play work completion sound
            if (soundEnabled) {
                playWorkCompletionSound(soundVolume);
            }
            
            incrementPomos(task.id);
            const nextWorkSessions = completedWorkSessions + 1;
            if (nextWorkSessions % longBreakInterval === 0) {
                setMode('longBreak');
                setSecondsLeft(longBreakDuration);
                setCompletedWorkSessions(0); // Reset after long break
            } else {
                setMode('shortBreak');
                setSecondsLeft(shortBreakDuration);
                setCompletedWorkSessions(nextWorkSessions); // Only increment if not long break
            }
            setRunning(false);
        } else {
            // Play break completion sound
            if (soundEnabled) {
                playBreakCompletionSound(soundVolume);
            }
            
            // End of break, return to work
            setMode('work');
            setSecondsLeft(workDuration);
            setRunning(false);
        }
    }, [secondsLeft, running, mode, task, incrementPomos, completedWorkSessions, longBreakInterval, longBreakDuration, shortBreakDuration, workDuration, setCompletedWorkSessions, soundEnabled, soundVolume]);

    // Persist timer progress for the current task - optimized to reduce localStorage writes
    useEffect(() => {
        if (task && task.id && secondsLeft > 0) {
            // Debounce the update to reduce localStorage writes
            const timeoutId = setTimeout(() => {
                updateTime(task.id, secondsLeft);
            }, 1000); // Only update every second instead of every render

            return () => clearTimeout(timeoutId);
        }
    }, [secondsLeft, task, updateTime]);

    // On mount, restore break state if a break was in progress
    useEffect(() => {
        const persisted = localStorage.getItem('pomo_break_state');
        if (persisted) {
            try {
                const { mode: savedMode, secondsLeft: savedSeconds } = JSON.parse(persisted);
                if ((savedMode === 'shortBreak' || savedMode === 'longBreak') && typeof savedSeconds === 'number') {
                    setMode(savedMode);
                    setSecondsLeft(savedSeconds);
                    // Always pause on refresh for consistency with work sessions
                    setRunning(false);
                }
            } catch {}
        }
    }, []);

    // Persist break state globally when in a break
    useEffect(() => {
        if (mode === 'shortBreak' || mode === 'longBreak') {
            localStorage.setItem('pomo_break_state', JSON.stringify({ mode, secondsLeft, running }));
        } else {
            localStorage.removeItem('pomo_break_state');
        }
    }, [mode, secondsLeft, running]);

    // Synchronize timer duration with settings changes (only if duration prop actually changes)
    const prevWorkDuration = useRef(workDuration);
    const prevShortBreakDuration = useRef(shortBreakDuration);
    const prevLongBreakDuration = useRef(longBreakDuration);

    useEffect(() => {
        if (!running && mode === 'work' && workDuration !== prevWorkDuration.current) {
            setSecondsLeft(workDuration);
        }
        prevWorkDuration.current = workDuration;
    }, [workDuration, running, mode]);
    
    useEffect(() => {
        if (!running && mode === 'shortBreak' && shortBreakDuration !== prevShortBreakDuration.current) {
            setSecondsLeft(shortBreakDuration);
        }
        prevShortBreakDuration.current = shortBreakDuration;
    }, [shortBreakDuration, running, mode]);
    
    useEffect(() => {
        if (!running && mode === 'longBreak' && longBreakDuration !== prevLongBreakDuration.current) {
            setSecondsLeft(longBreakDuration);
        }
        prevLongBreakDuration.current = longBreakDuration;
    }, [longBreakDuration, running, mode]);

    const toggleTimer = useCallback(() => {
        if (!task) return;
        if (secondsLeft === 0) {
            setRunning(true);
        } else {
            setRunning(prev => !prev);
        }
    }, [task, secondsLeft]);

    const reset = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        
        if (mode === 'work') {
            setSecondsLeft(workDuration);
        } else if (mode === 'shortBreak') {
            setSecondsLeft(shortBreakDuration);
        } else if (mode === 'longBreak') {
            setSecondsLeft(longBreakDuration);
        }
        setRunning(false);
        // Do not change mode or completedWorkSessions
    }, [mode, workDuration, shortBreakDuration, longBreakDuration]);

    const skipBreak = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setMode('work');
        setSecondsLeft(workDuration);
        setRunning(false);
    }, [workDuration]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    let progress = 0;
    if (mode === 'work') progress = ((workDuration - secondsLeft) / workDuration) * 100;
    else if (mode === 'shortBreak') progress = ((shortBreakDuration - secondsLeft) / shortBreakDuration) * 100;
    else progress = ((longBreakDuration - secondsLeft) / longBreakDuration) * 100;

    const modeLabel = mode === 'work' ? 'Work' : mode === 'shortBreak' ? 'Short Break' : 'Long Break';
    const ringColor = mode === 'work' ? (running ? 'text-red-500' : 'text-slate-400') : mode === 'shortBreak' ? (running ? 'text-blue-500' : 'text-slate-400') : (running ? 'text-purple-600' : 'text-slate-400');

    // Dynamic button and label colors based on mode
    const mainButtonColor = mode === 'work'
        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25'
        : mode === 'shortBreak'
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'
        : 'bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 shadow-lg shadow-purple-500/25';
    const skipButtonColor = mode === 'shortBreak'
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'
        : mode === 'longBreak'
        ? 'bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 shadow-lg shadow-purple-500/25'
        : '';
    const iconBgColor = mode === 'work'
        ? 'from-red-500 to-orange-500'
        : mode === 'shortBreak'
        ? 'from-blue-500 to-blue-700'
        : 'from-purple-500 to-purple-700';
    const labelBgColor = mode === 'work'
        ? 'bg-red-100 text-red-700 border-red-200'
        : mode === 'shortBreak'
        ? 'bg-blue-100 text-blue-700 border-blue-200'
        : 'bg-purple-100 text-purple-700 border-purple-200';
    const pomoBadgeColor = mode === 'work'
        ? 'bg-red-100 text-red-700'
        : mode === 'shortBreak'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-purple-100 text-purple-700';

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            {/* Header */}
            <div className="text-center mb-5">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className={`w-8 h-8 bg-gradient-to-r ${iconBgColor} rounded-lg flex items-center justify-center`}>
                        <Timer className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Focus Timer</h2>
                </div>
                <div className="mb-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${labelBgColor}`}>{modeLabel}</span>
                </div>
                {task ? (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <p className="text-slate-600 text-sm font-medium mb-1">Currently working on</p>
                        <div className="flex items-center justify-center gap-2">
                            <p className="text-slate-800 font-semibold text-lg">{task.name}</p>
                            <span className={`${pomoBadgeColor} px-2 py-1 rounded-full text-sm font-bold flex items-center gap-1`}>
                                <Timer className="w-3 h-3" />
                                {task.pomodoros}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <p className="text-slate-500 font-medium">Select a task to start focusing</p>
                    </div>
                )}
            </div>

            {/* timer display */}
            <div className="text-center mb-6">
                <div className="relative inline-block">
                    {/* Progress Ring */}
                    <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            className="text-slate-200"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                            className={`transition-all duration-1000 ${ringColor}`}
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Timer Text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div 
                                className="text-4xl font-mono font-bold text-slate-800 mb-1"
                                aria-live="polite"
                                aria-atomic="true"
                            >
                                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                            </div>
                            {task && mode === 'work' && (
                                <div className="text-sm text-slate-500 font-medium">Session {task.pomodoros + 1}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 flex-wrap">
                <button
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${mainButtonColor}`}
                    onClick={toggleTimer}
                    disabled={!task}
                    aria-label={running ? "Pause timer" : "Start timer"}
                >
                    {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {running ? "Pause" : "Start"}
                </button>
                <button
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all duration-200 transform hover:scale-105"
                    onClick={reset}
                    aria-label="Reset timer"
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                </button>
                {task && (mode === 'shortBreak' || mode === 'longBreak') && (
                    <button
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 ${skipButtonColor}`}
                        onClick={skipBreak}
                        aria-label="Skip break and start work session"
                    >
                        <SkipForward className="w-4 h-4" />
                        Skip Break
                    </button>
                )}
            </div>
        </div>
    );
}
