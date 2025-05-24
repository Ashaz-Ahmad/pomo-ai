import { useState } from 'react';

export default function TaskInput({ onAdd }: { onAdd: (task: string) => void }) {
    const [input, setInput] = useState('');

    const handleAdd = () => {
        if (input.trim()) {
            onAdd(input.trim());
            setInput('');
        }
    };

    return (
        <div className="flex gap-2 w-full max-w-md">
            <input
                type="text"
                className="flex-1 p-2 border rounded text-black"
                placeholder="Enter a task..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleAdd}>
                Add
            </button>
        </div>
    );
}
