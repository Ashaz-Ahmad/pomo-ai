import { Task } from '../types/task';
import { CheckCircle, Circle, Target, Trash2, ClipboardList, Timer } from "lucide-react";
import { useState, useCallback, memo } from 'react';

const modeColors = {
    work: {
        completeBtn: 'bg-green-500 hover:bg-green-600',
        selectBtn: 'bg-red-500 hover:bg-red-600',
        activeBtn: 'bg-red-600 hover:bg-red-700',
        clipboard: 'from-red-500 to-orange-500',
        badge: 'bg-red-100 text-red-700',
        target: 'text-red-500',
        pomoBadge: 'bg-red-100 text-red-700',
    },
    shortBreak: {
        completeBtn: 'bg-green-500 hover:bg-green-600',
        selectBtn: 'bg-blue-500 hover:bg-blue-600',
        activeBtn: 'bg-blue-600 hover:bg-blue-700',
        clipboard: 'from-blue-500 to-blue-700',
        badge: 'bg-blue-100 text-blue-700',
        target: 'text-blue-500',
        pomoBadge: 'bg-blue-100 text-blue-700',
    },
    longBreak: {
        completeBtn: 'bg-green-500 hover:bg-green-600',
        selectBtn: 'bg-purple-500 hover:bg-purple-600',
        activeBtn: 'bg-purple-600 hover:bg-purple-700',
        clipboard: 'from-purple-500 to-purple-700',
        badge: 'bg-purple-100 text-purple-700',
        target: 'text-purple-600',
        pomoBadge: 'bg-purple-100 text-purple-700',
    },
};

interface TaskListProps {
    tasks: Task[];
    currentTaskId: string | null;
    onRemove: (id: string) => void;
    onStart: (id: string) => void;
    onToggleComplete: (id: string) => void;
    onUpdateEstimatedPomos: (id: string, estimatedPomos: number) => void;
    mode?: 'work' | 'shortBreak' | 'longBreak';
}

const TaskList = memo(function TaskList({
    tasks,
    currentTaskId,
    onRemove,
    onStart,
    onToggleComplete,
    onUpdateEstimatedPomos,
    mode = 'work',
}: TaskListProps) {
    // Local state to track which task's complete button is temporarily disabled
    const [debouncedTaskId, setDebouncedTaskId] = useState<string | null>(null);

    const handleComplete = useCallback((taskId: string) => {
        setDebouncedTaskId(taskId);
        onToggleComplete(taskId);
        setTimeout(() => {
            setDebouncedTaskId(null);
        }, 1500);
    }, [onToggleComplete]);

    if (tasks.length === 0) {
        return (
            <div className="text-center py-12 flex flex-col items-center justify-center min-h-[400px]">
                <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No tasks yet</p>
                <p className="text-slate-400 text-sm">Add your first task above to get started</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3 mb-6">
                <div className={`w-8 h-8 bg-gradient-to-r ${modeColors[mode].clipboard} rounded-lg flex items-center justify-center`}>
                    <ClipboardList className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Task List</h2>
                {tasks.length > 0 && (
                    <span className={`${modeColors[mode].badge} px-2 py-1 rounded-full text-sm font-medium`}>
                        {tasks.filter((t) => !t.completed).length} active
                    </span>
                )}
            </div>
            {tasks.map((task) => (
                <div
                    key={task.id}
                    className={`group relative bg-slate-50 rounded-xl p-2 sm:p-3 border transition-all duration-200 hover:shadow-md ${task.id === currentTaskId
                        ? mode === 'work'
                            ? 'border-red-300 bg-red-50 shadow-md shadow-red-500/10'
                            : mode === 'shortBreak'
                                ? 'border-blue-300 bg-blue-50 shadow-md shadow-blue-500/10'
                                : 'border-green-300 bg-green-50 shadow-md shadow-green-500/10'
                        : 'border-slate-200 hover:border-slate-300'
                        } ${task.completed ? 'opacity-75' : ''}`}
                >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0 w-full">
                        {/* Task info row */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                                {task.id === currentTaskId ? (
                                    <Target className={`w-4 h-4 ${modeColors[mode].target}`} />
                                ) : task.completed ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Circle className="w-4 h-4 text-slate-300" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-base whitespace-normal break-words w-full ${task.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                                    {task.name}
                                </p>
                            </div>
                            <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                <span className="text-[9px] text-slate-400 uppercase font-semibold">Actual</span>
                                <span
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${task.id === currentTaskId ? modeColors[mode].pomoBadge : 'bg-slate-100 text-slate-500'}`}
                                >
                                    <Timer className="w-3 h-3" />
                                    {task.pomodoros}
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                <span className="text-[9px] text-slate-400 uppercase font-semibold">Est.</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="999"
                                    value={task.estimatedPomos || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '') {
                                            onUpdateEstimatedPomos(task.id, 0);
                                        } else {
                                            const numValue = parseInt(value, 10);
                                            if (!isNaN(numValue) && numValue >= 0) {
                                                onUpdateEstimatedPomos(task.id, numValue);
                                            }
                                        }
                                    }}
                                    placeholder="?"
                                    title="Estimated pomodoros"
                                    className={`w-10 px-2 py-1 rounded-full text-xs font-bold text-center border focus:ring-2 focus:outline-none ${
                                        task.id === currentTaskId
                                            ? 'bg-red-100 text-red-700 border-red-300 focus:border-red-500 focus:ring-red-500'
                                            : 'bg-slate-100 text-slate-500 border-slate-300 focus:border-red-500 focus:ring-red-500'
                                    }`}
                                />
                            </div>
                        </div>
                        {/* Actions row: always horizontal, wrap on mobile if needed */}
                        <div className="flex flex-row gap-x-2 gap-y-1 mt-1 sm:mt-0 sm:ml-4 items-center flex-wrap">
                            <button
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all duration-200 bg-green-500 hover:bg-green-600`}
                                onClick={() => handleComplete(task.id)}
                                aria-label={task.completed ? `Mark task '${task.name}' as incomplete` : `Mark task '${task.name}' as complete`}
                                disabled={debouncedTaskId === task.id}
                                style={{ minWidth: '90px' }}
                            >
                                <CheckCircle className="w-3 h-3" />
                                {task.completed ? "Completed" : "Complete"}
                            </button>
                            <button
                                className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all duration-200 ${task.id === currentTaskId
                                    ? modeColors[mode].activeBtn
                                    : modeColors[mode].selectBtn
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                onClick={() => onStart(task.id)}
                                disabled={task.completed}
                                aria-label={task.id === currentTaskId ? `Task '${task.name}' is active` : `Select task '${task.name}'`}
                                style={{ minWidth: '90px' }}
                            >
                                <Target className="w-3 h-3" />
                                {task.id === currentTaskId ? "Active" : "Select"}
                            </button>
                            <button
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed h-8"
                                onClick={() => onRemove(task.id)}
                                aria-label={`Delete task '${task.name}'`}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
});

export default TaskList;
