import Head from 'next/head';
import { useState } from 'react';
import TaskInput from '../components/TaskInput';
import TaskList from '../components/TaskList';
import PomodoroTimer from '../components/PomodoroTimer';
import { Task } from '../types/task';


export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const currentTask = tasks.find((task) => task.id === currentTaskId) || null;
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);

  const addTask = (taskName: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      name: taskName,
      completed: false,
    };
    setTasks([...tasks, newTask]);
  };

  const removeTask = (id: string) => {
    if (id === currentTaskId) {
      setCurrentTaskId(null);
    }
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const startTask = (id: string) => {
    if (id === currentTaskId) {
      setCurrentTaskId(null);
    } else {
      setCurrentTaskId(id);
    }
  };

  const toggleTaskComplete = (id: string) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));

    if (id === currentTaskId) {
      setCurrentTaskId(null);
      setRunning(false);
      setSecondsLeft(25 * 60);
    }
  };


  return (
    <>
      <Head>
        <title>PomoAI</title>
        <meta name="description" content="Pomodoro + Todo Productivity Tool" />
        <link rel="icon" href="/timer.ico" />
      </Head>

      <main className="min-h-screen bg-gray-100 p-8 flex flex-col items-center gap-8">
        <h1 className="text-3xl font-bold text-blue-600">PomoAI</h1>

        <div className="w-full max-w-md">
          <PomodoroTimer task={currentTask} running={running} setRunning={setRunning} secondsLeft={secondsLeft} setSecondsLeft={setSecondsLeft}/>
        </div>

        <div className="w-full max-w-md bg-white p-6 rounded shadow">
          <h4 className="text-xl font-semibold mb-4 text-black">Task List</h4>
          <TaskInput onAdd={addTask} />
          <TaskList tasks={tasks} currentTaskId={currentTaskId} onRemove={removeTask} 
          onStart={startTask} onToggleComplete={toggleTaskComplete} />
        </div>
      </main>

    </>
  );
}
