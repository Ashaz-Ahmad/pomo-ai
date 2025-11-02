import { useState, useCallback, memo } from 'react';
import { Plus } from "lucide-react";

interface TaskInputProps {
    onAdd: (taskName: string) => void;
}

const TaskInput = memo(function TaskInput({ onAdd }: TaskInputProps) {
    const [input, setInput] = useState('');

    const handleAdd = useCallback(() => {
        if (input.trim()) {
            onAdd(input.trim());
            setInput('');
        }
    }, [input, onAdd]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleAdd();
        }
    }, [handleAdd]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    }, []);

    return (
        <div className="mb-6">
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <input
                        id="taskName"
                        name="taskName"
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 focus:border-red-500 dark:focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-200 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                        placeholder="What would you like to work on?"
                        value={input}
                        onChange={handleInputChange}
                        onKeyUp={handleKeyPress}
                    />
                </div>
                <button
                    className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-200 transform shadow-lg ${input.trim()
                            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:scale-105 shadow-red-500/25"
                            : "bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-slate-400 cursor-not-allowed shadow-gray-300/25 dark:shadow-slate-900/25"
                        }`}
                    onClick={handleAdd}
                    disabled={!input.trim()}
                    aria-label="Add task"
                >
                    <Plus className="w-4 h-4" />
                    Add Task
                </button>
            </div>
        </div>
    );
});

export default TaskInput;
