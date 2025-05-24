import { useEffect, useState } from 'react';

export default function PomodoroTimer({ task }: { task: string | null }) {
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (running && secondsLeft > 0) {
            timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [running, secondsLeft]);

    const startTimer = () => {
        setSecondsLeft(25 * 60); // 25 minutes
        setRunning(true);
    };

    const reset = () => {
        setSecondsLeft(0);
        setRunning(false);
    };

    return (
        <div className="p-4 bg-white rounded shadow text-center w-full max-w-md">
            <h2 className="text-xl font-semibold mb-2 text-black">Current Task</h2>
            <p className="mb-4 text-black">{task || 'No task selected'}</p>
            <p className="text-3xl font-mono mb-4 text-black">
                {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:
                {String(secondsLeft % 60).padStart(2, '0')}
            </p>
            <div className="flex justify-center gap-4">
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={startTimer}
                    disabled={!task}
                >
                    Start Timer
                </button>
                <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={reset}>
                    Reset
                </button>
            </div>
        </div>
    );
}
