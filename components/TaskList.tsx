import { Task } from '../types/task';
import { CheckCircle, Circle, Target, Trash2, ClipboardList, Timer } from "lucide-react";

export default function TaskList({
    tasks,
    currentTaskId,
    onRemove,
    onStart,
    onToggleComplete,
}: {
    tasks: Task[];
    currentTaskId: string | null;
    onRemove: (id: string) => void;
    onStart: (id: string) => void;
    onToggleComplete: (id: string) => void;
}) {
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
            {tasks.map((task) => (
                <div
                    key={task.id}
                    className={`group relative bg-slate-50 rounded-xl p-4 border transition-all duration-200 hover:shadow-md ${task.id === currentTaskId
                        ? "border-red-300 bg-red-50 shadow-md shadow-red-500/10"
                        : "border-slate-200 hover:border-slate-300"
                        } ${task.completed ? "opacity-75" : ""}`}
                >
                    <div className="flex items-center justify-between">
                        {/* Task info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                                {task.id === currentTaskId ? (
                                    <Target className="w-4 h-4 text-red-500" />
                                ) : task.completed ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Circle className="w-4 h-4 text-slate-300" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p
                                    className={`font-medium truncate ${task.completed ? "line-through text-slate-400" : "text-slate-800"}`}
                                >
                                    {task.name}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${task.pomodoros === 0 ? "bg-slate-100 text-slate-500" : "bg-red-100 text-red-700"}`}
                                >
                                    <Timer className="w-3 h-3" />
                                    {task.pomodoros}
                                </span>
                            </div>
                        </div>

                        {/* actions */}
                        <div className="flex items-center gap-2 ml-4">
                            <button
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${task.completed
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-green-500 text-white hover:bg-green-600"
                                    }`}
                                onClick={() => onToggleComplete(task.id)}
                            >
                                <CheckCircle className="w-3 h-3" />
                                {task.completed ? "Completed" : "Complete"}
                            </button>

                            <button
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${task.id === currentTaskId
                                    ? "bg-red-600 text-white hover:bg-red-700"
                                    : "bg-red-500 text-white hover:bg-red-600"
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                onClick={() => onStart(task.id)}
                                disabled={task.completed}
                            >
                                <Target className="w-3 h-3" />
                                {task.id === currentTaskId ? "Active" : "Select"}
                            </button>

                            <button
                                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => onRemove(task.id)}
                                disabled={task.id === currentTaskId}
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
