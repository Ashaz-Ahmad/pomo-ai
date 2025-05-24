export default function TaskList({
    tasks,
    onRemove,
    onStart,
}: {
    tasks: string[];
    onRemove: (index: number) => void;
    onStart: (task: string) => void;
}) {
    return (
        <ul className="w-full max-w-md">
            {tasks.map((task, index) => (
                <li
                    key={index}
                    className="text-black flex justify-between items-center mb-2 p-2 bg-white shadow rounded"
                >
                    <span>{task}</span>
                    <div className="flex gap-2">
                        <button
                            className="bg-green-500 text-white px-2 py-1 text-sm rounded"
                            onClick={() => onStart(task)}
                        >
                            Start
                        </button>
                        <button
                            className="bg-red-500 text-white px-2 py-1 text-sm rounded"
                            onClick={() => onRemove(index)}
                        >
                            Delete
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}
