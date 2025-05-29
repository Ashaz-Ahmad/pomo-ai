import { Task } from '../types/task';

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
    return (
        <ul className="w-full max-w-md">
            {tasks.map((task) => (
                <li
                    key={task.id}
                    className="text-black flex justify-between items-center mt-6 m-2 p-2 bg-white shadow rounded"
                >
                    <span className={`${task.completed ? 'line-through text-gray-400' : ''}`}>
                        {task.name}
                    </span>
                    <div className="flex gap-2">
                        <button
                            className={`${task.completed ? 'bg-green-700' : 'bg-green-500'} text-white px-3 py-1 rounded`}
                            onClick={() => onToggleComplete(task.id)}
                        >
                            {task.completed ? 'Completed' : 'Complete'}
                        </button>
                        <button
                            className={`${task.id === currentTaskId ? 'bg-blue-700' : 'bg-blue-500'} text-white px-3 py-1 rounded`}
                            onClick={() => onStart(task.id)}
                            disabled={task.completed}
                        >
                            {task.id === currentTaskId ? 'Selected' : 'Select'}
                        </button>


                        <button
                            className="bg-red-500 text-white px-2 py-1 text-sm rounded"
                            onClick={() => onRemove(task.id)}
                            disabled={task.id === currentTaskId}
                        >
                            Delete
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}
