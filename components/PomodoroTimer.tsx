import { useEffect } from 'react';
import { Task } from '../types/task';
import { Timer, Play, Pause, RotateCcw } from "lucide-react";

export default function PomodoroTimer({
    task,
    running,
    setRunning,
    secondsLeft,
    setSecondsLeft,
    incrementPomodoros,
}: {
    task: Task | null;
    running: boolean;
    setRunning: React.Dispatch<React.SetStateAction<boolean>>;
    secondsLeft: number;
    setSecondsLeft: React.Dispatch<React.SetStateAction<number>>;
    incrementPomodoros: (id: string) => void;
}) {

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (task && running && secondsLeft > 0) {
            timer = setTimeout(() => setSecondsLeft(prevSecondsLeft => prevSecondsLeft - 1), 1000);
        } else if (task && running && secondsLeft === 0) {
            incrementPomodoros(task.id);
            setRunning(false);
            setSecondsLeft(25 * 60);
        }
        return () => clearTimeout(timer);
    }, [task, running, secondsLeft, setSecondsLeft, setRunning, incrementPomodoros]);


    const toggleTimer = () => {
        if (!task) return;

        if (secondsLeft === 0) {
            setSecondsLeft(25 * 60); // start fresh if at zero
            setRunning(true);
        } else {
            setRunning(!running); // toggle pause/resume
        }
    };

    const reset = () => {
        setSecondsLeft(25 * 60);
        setRunning(false);
    };

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const progress = ((25 * 60 - secondsLeft) / (25 * 60)) * 100;

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            {/* Header */}
            <div className="text-center mb-5">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <Timer className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Focus Timer</h2>
                </div>

                {task ? (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <p className="text-slate-600 text-sm font-medium mb-1">Currently working on</p>
                        <div className="flex items-center justify-center gap-2">
                            <p className="text-slate-800 font-semibold text-lg">{task.name}</p>
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm font-bold flex items-center gap-1">
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
                            className={`transition-all duration-1000 ${running ? "text-red-500" : "text-slate-400"}`}
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Timer Text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-4xl font-mono font-bold text-slate-800 mb-1">
                                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                            </div>
                            {running && task && (
                                <div className="text-sm text-slate-500 font-medium">Session {task.pomodoros + 1}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
                <button
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${running
                        ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25"
                        : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25"
                        }`}
                    onClick={toggleTimer}
                    disabled={!task}
                >
                    {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {running ? "Pause" : "Start"}
                </button>
                <button
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all duration-200 transform hover:scale-105"
                    onClick={reset}
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                </button>
            </div>
        </div>
    );
}
