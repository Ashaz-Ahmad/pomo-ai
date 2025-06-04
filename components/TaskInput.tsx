import { useState } from 'react';
import { Plus } from "lucide-react";

export default function TaskInput({ onAdd }: { onAdd: (taskName: string) => void }) {
    const [input, setInput] = useState('');

    const handleAdd = () => {
        if (input.trim()) {
            onAdd(input.trim());
            setInput('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleAdd()
        }
    };

    return (
        <div className="mb-6">
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-200 text-slate-800 placeholder-slate-400"
                        placeholder="What would you like to work on?"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyUp={handleKeyPress}
                    />
                </div>
                <button
                    className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-200 transform shadow-lg ${input.trim()
                            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:scale-105 shadow-red-500/25"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-gray-300/25"
                        }`}
                    onClick={handleAdd}
                    disabled={!input.trim()}
                >
                    <Plus className="w-4 h-4" />
                    Add Task
                </button>
            </div>
        </div>
    );
}
