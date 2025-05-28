import { useEffect, useState } from 'react';
import { Task } from '../types/task';

export default function PomodoroTimer({ task }: { task: Task | null }) {
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (running && secondsLeft > 0) {
            timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [running, secondsLeft]);


    const toggleTimer = () => {
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

    return (
        <div className="p-4 bg-white rounded shadow text-center w-full max-w-md">
            <h2 className="text-xl font-semibold mb-2 text-black">Current Task</h2>
            <p className="mb-4 text-black">{task?.name || 'No task selected'}</p>
            <p className="text-5xl font-mono mb-4 text-black">
                {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:
                {String(secondsLeft % 60).padStart(2, '0')}
            </p>
            <div className="flex justify-center gap-4">
                <button
                    className={`${running ? 'bg-red-500' : 'bg-blue-600'
                        } text-white px-4 py-2 rounded`}
                    onClick={toggleTimer}
                    disabled={!task}
                >
                    {running ? 'Pause' : 'Start'}
                </button>
                <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={reset}>
                    Reset
                </button>
            </div>
        </div>
    );
}
