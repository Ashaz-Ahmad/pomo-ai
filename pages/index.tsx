import Head from 'next/head';
import { useState, useEffect } from 'react';
import TaskInput from '../components/TaskInput';
import TaskList from '../components/TaskList';
import PomodoroTimer from '../components/PomodoroTimer';
import { Task, isTask } from '../types/task';
import { ClipboardList } from "lucide-react";
import toast from 'react-hot-toast';

const DEFAULT_SECONDS = 25 * 60;

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [recentlyCompletedTaskId, setRecentlyCompletedTaskId] = useState<string | null>(null);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    const storedCurrentTaskId = localStorage.getItem('currentTaskId');
    try {
      const parsedTasks = storedTasks ? JSON.parse(storedTasks) : [];
      const validTasks = parsedTasks.filter(isTask);
      setTasks(validTasks);
    } catch {
      setTasks([]);
    }
    if (storedCurrentTaskId) {
      setCurrentTaskId(storedCurrentTaskId || null);
    }
  }, []);

  // Persist tasks and currentTaskId
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem('currentTaskId', currentTaskId ?? '');
  }, [currentTaskId]);

  // Clear recentlyCompletedTaskId after each render where it is set
  useEffect(() => {
    if (recentlyCompletedTaskId !== null) {
      setRecentlyCompletedTaskId(null);
    }
  }, [recentlyCompletedTaskId]);

  // Add a new task
  const addTask = (taskName: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      name: taskName,
      completed: false,
      remainingSeconds: DEFAULT_SECONDS,
      pomodoros: 0,
    };
    setTasks([...tasks, newTask]);
  };

  // Remove a task
  const removeTask = (id: string) => {
    if (id === currentTaskId) {
      toast.error("You cannot delete the selected task. Please select a different task first.");
      return;
    }
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Start/select a task
  const startTask = (id: string) => {
    if (id === currentTaskId) {
      // Deselecting the current task
      if (timerRunning) {
        toast.error("Please pause the current task's timer before deselecting it.");
        return;
      }
      setCurrentTaskId(null);
    } else {
      // Selecting a new task
      if (timerRunning) {
        toast.error("Please pause the current task's timer before selecting another task.");
        return;
      }
      setCurrentTaskId(id);
    }
  };

  // Complete a task
  const toggleTaskComplete = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
    setRecentlyCompletedTaskId(id);
    if (id === currentTaskId) {
      setCurrentTaskId(null);
    }
  };

  // Increment pomodoros for a task
  const incrementPomodoros = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, pomodoros: task.pomodoros + 1 } : task
      )
    );
  };

  // Update remaining time for a task
  const updateRemainingTime = (id: string, seconds: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, remainingSeconds: seconds } : task
      )
    );
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
                task={tasks.find(t => t.id === currentTaskId) || null}
                incrementPomos={incrementPomodoros}
                updateTime={updateRemainingTime}
                defaultSeconds={DEFAULT_SECONDS}
                onRunningChange={setTimerRunning}
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
