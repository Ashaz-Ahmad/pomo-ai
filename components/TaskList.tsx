import { Task } from '../types/task';

export default function TaskList({
    tasks,
    onRemove,
    onStart,
}: {
    tasks: Task[];
    onRemove: (id: string) => void;
    onStart: (id: string) => void;
}) {
    return (
        <ul className="w-full max-w-md">
            {tasks.map((task, index) => (
                <li
                    key={task.id}
                    className="text-black flex justify-between items-center mt-6 m-2 p-2 bg-white shadow rounded"
                >
                    <span>{task.name}</span>
                    <div className="flex gap-2">
                        <button
                            className={`${task.selected ? 'bg-green-700' : 'bg-green-500'
                                } text-white px-3 py-1 rounded`}
                            onClick={() => onStart(task.id)}
                            disabled={task.selected}
                        >
                            {task.selected ? 'Selected' : 'Select'}
                        </button>

                        <button
                            className="bg-red-500 text-white px-2 py-1 text-sm rounded"
                            onClick={() => onRemove(task.id)}
                        >
                            Delete
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}
