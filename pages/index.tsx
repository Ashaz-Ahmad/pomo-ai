import Head from 'next/head';
import { useState } from 'react';
import TaskInput from '../components/TaskInput';
import TaskList from '../components/TaskList';
import PomodoroTimer from '../components/PomodoroTimer';
import { Task } from '../types/task';
import { ClipboardList } from "lucide-react";

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
      pomodoros: 0,
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

  const incrementPomodoros = (id: string) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, pomodoros: task.pomodoros + 1 } : task));
  };

  return (
    <>
      <Head>
        <title>PomoAI</title>
        <meta name="description" content="Pomodoro + Todo List AI Productivity Tool" />
        <link rel="icon" href="/timer.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 py-6">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                PomoAI
              </h1>
              <p className="text-slate-600 font-medium mt-2">
                Smart tracking and accountability for your pomodoro productivity sessions
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* timer section */}
            <div className="space-y-6 lg:col-span-2">
              <PomodoroTimer
                task={currentTask}
                running={running}
                setRunning={setRunning}
                secondsLeft={secondsLeft}
                setSecondsLeft={setSecondsLeft}
                incrementPomodoros={incrementPomodoros}
              />
            </div>

            {/* Tasks section */}
            <div className="space-y-6 lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Task List</h2>
                  {tasks.length > 0 && (
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-sm font-medium">
                      {tasks.filter((t) => !t.completed).length} active
                    </span>
                  )}
                </div>

                <TaskInput onAdd={addTask} />
                <TaskList
                  tasks={tasks}
                  currentTaskId={currentTaskId}
                  onRemove={removeTask}
                  onStart={startTask}
                  onToggleComplete={toggleTaskComplete}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

    </>
  );
}
