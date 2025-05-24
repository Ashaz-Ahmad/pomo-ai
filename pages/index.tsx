import Head from 'next/head';
import { useState } from 'react';
import TaskInput from '../components/TaskInput';
import TaskList from '../components/TaskList';
import PomodoroTimer from '../components/PomodoroTimer';

export default function Home() {
  const [tasks, setTasks] = useState<string[]>([]);
  const [currentTask, setCurrentTask] = useState<string | null>(null);

  const addTask = (task: string) => {
    setTasks([...tasks, task]);
  };

  const removeTask = (index: number) => {
    if (tasks[index] === currentTask) {
      setCurrentTask(null);
    }
    setTasks(tasks.filter((_, i) => i !== index));
  };

  return (
    <>
      <Head>
        <title>PomoAI</title>
        <meta name="description" content="Pomodoro + Todo Productivity Tool" />
        <link rel="icon" href="/timer.ico" />
      </Head>

      <main className="min-h-screen bg-gray-100 p-8 flex flex-col gap-8 items-center">
        <h1 className="text-3xl font-bold text-blue-600">PomoAI</h1>
        <TaskInput onAdd={addTask} />
        <TaskList tasks={tasks} onRemove={removeTask} onStart={setCurrentTask} />
        <PomodoroTimer task={currentTask} />
      </main>
    </>
  );
}
