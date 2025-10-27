import Head from 'next/head';
import { useState, useEffect, useCallback, useMemo } from 'react';
import TaskInput from '../components/TaskInput';
import TaskList from '../components/TaskList';
import PomodoroTimer from '../components/PomodoroTimer';
import { Task, isTask } from '../types/task';
import { Settings as SettingsIcon } from "lucide-react";
import toast from 'react-hot-toast';
import SettingsModal from '../components/SettingsModal';

const DEFAULT_SETTINGS = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  soundVolume: 0.3,
};

export default function Home() {
  // All hooks must be called at the top level, before any return
  const [hasMounted, setHasMounted] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [recentlyCompletedTaskId, setRecentlyCompletedTaskId] = useState<string | null>(null);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [settings, setSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('settings');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return DEFAULT_SETTINGS;
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [completedWorkSessions, setCompletedWorkSessions] = useState(0); // Global work session counter

  // Memoized current task
  const currentTask = useMemo(() => 
    tasks.find(t => t.id === currentTaskId) || null, 
    [tasks, currentTaskId]
  );

  // Memoized settings for timer
  const timerSettings = useMemo(() => ({
    workDuration: settings.work * 60,
    shortBreakDuration: settings.shortBreak * 60,
    longBreakDuration: settings.longBreak * 60,
    longBreakInterval: settings.longBreakInterval,
  }), [settings]);

  // Add a new task
  const addTask = useCallback((taskName: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      name: taskName,
      completed: false,
      remainingSeconds: settings.work * 60, // Use current work session length
      pomodoros: 0,
    };
    setTasks(prev => [...prev, newTask]);
  }, [settings.work]);

  // Remove a task
  const removeTask = useCallback((id: string) => {
    if (id === currentTaskId) {
      toast.error("You cannot delete the selected task. Please select a different task first.");
      return;
    }
    setTasks(prev => prev.filter(task => task.id !== id));
  }, [currentTaskId]);

  // Start/select a task
  const startTask = useCallback((id: string) => {
    if (timerMode === 'shortBreak' || timerMode === 'longBreak') {
      toast.error("You can't switch tasks during a break. Finish or skip your break first.");
      return;
    }
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
  }, [currentTaskId, timerRunning, timerMode]);

  // Complete a task
  const toggleTaskComplete = useCallback((id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
    setRecentlyCompletedTaskId(id);
    if (id === currentTaskId) {
      setCurrentTaskId(null);
    }
  }, [currentTaskId]);

  // Increment pomodoros for a task
  const incrementPomodoros = useCallback((id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, pomodoros: task.pomodoros + 1 } : task
      )
    );
  }, []);

  // Update remaining time for a task
  const updateRemainingTime = useCallback((id: string, seconds: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, remainingSeconds: seconds } : task
      )
    );
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    const storedCurrentTaskId = localStorage.getItem('currentTaskId');
    const storedCompletedSessions = localStorage.getItem('completedWorkSessions');
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
    if (storedCompletedSessions) {
      const sessions = parseInt(storedCompletedSessions, 10);
      if (!isNaN(sessions) && sessions >= 0) {
        setCompletedWorkSessions(sessions);
      }
    }
  }, []);

  // Persist tasks and currentTaskId - optimized to reduce localStorage writes
  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks, hasMounted]);
  
  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem('currentTaskId', currentTaskId ?? '');
    }
  }, [currentTaskId, hasMounted]);

  // Clear recentlyCompletedTaskId after each render where it is set
  useEffect(() => {
    if (recentlyCompletedTaskId !== null) {
      setRecentlyCompletedTaskId(null);
    }
  }, [recentlyCompletedTaskId]);

  // Persist settings - optimized to reduce localStorage writes
  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem('settings', JSON.stringify(settings));
    }
  }, [settings, hasMounted]);

  // Persist completed work sessions - optimized to reduce localStorage writes
  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem('completedWorkSessions', completedWorkSessions.toString());
    }
  }, [completedWorkSessions, hasMounted]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Only return null after all hooks
  if (!hasMounted) return null;

  return (
    <>
      <Head>
        <title>PomoAI</title>
        <meta name="description" content="Pomodoro + Todo List AI Productivity Tool" />
        <link rel="icon" href="/timer.ico" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 overflow-x-hidden">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 py-6">
          <div className="w-full px-4 flex flex-col items-center justify-center gap-2 sm:flex-row sm:justify-between sm:max-w-6xl sm:mx-auto sm:px-6">
            <div className="flex flex-col items-center flex-1">
              <h1 className={`text-4xl font-bold bg-clip-text text-transparent text-center w-full 
                ${timerMode === 'work' ? 'bg-gradient-to-r from-red-600 to-orange-600' : ''}
                ${timerMode === 'shortBreak' ? 'bg-gradient-to-r from-blue-500 to-blue-700' : ''}
                ${timerMode === 'longBreak' ? 'bg-gradient-to-r from-green-500 to-green-700' : ''}
              `}>
                PomoAI
              </h1>
              <p className="text-slate-600 font-medium mt-2 text-center">
                Smart tracking and accountability for your pomodoro productivity sessions
              </p>
            </div>
            <button
              className="mt-4 sm:mt-0 p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
              onClick={() => setSettingsOpen(true)}
              aria-label="Open timer settings"
              title="Timer Settings"
            >
              <SettingsIcon className="w-7 h-7 text-slate-500 hover:text-red-500" />
            </button>
          </div>
        </div>
        {/* Main Content */}
        <main className="w-full px-2 py-4 sm:max-w-6xl sm:mx-auto sm:px-6 sm:py-8">
          {/* Responsive card: on mobile, wrap both timer and tasks in one card; on lg+, use grid */}
          <div className="lg:grid lg:grid-cols-5 gap-8">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 w-full max-w-full flex flex-col lg:col-span-5 lg:flex-row lg:bg-transparent lg:shadow-none lg:border-none lg:p-0">
              {/* timer section */}
              <div className="space-y-6 w-full lg:w-2/5 lg:pr-6">
                <PomodoroTimer
                  task={currentTask}
                  incrementPomos={incrementPomodoros}
                  updateTime={updateRemainingTime}
                  workDuration={timerSettings.workDuration}
                  shortBreakDuration={timerSettings.shortBreakDuration}
                  longBreakDuration={timerSettings.longBreakDuration}
                  longBreakInterval={timerSettings.longBreakInterval}
                  onRunningChange={setTimerRunning}
                  onModeChange={setTimerMode}
                  completedWorkSessions={completedWorkSessions}
                  setCompletedWorkSessions={setCompletedWorkSessions}
                  soundEnabled={settings.soundEnabled}
                  soundVolume={settings.soundVolume}
                />
              </div>
              {/* Tasks section */}
              <div className="space-y-6 w-full mt-8 lg:mt-0 lg:w-3/5">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 w-full max-w-full">
                  <TaskInput onAdd={addTask} />
                  <TaskList
                    tasks={tasks}
                    currentTaskId={currentTaskId}
                    onRemove={removeTask}
                    onStart={startTask}
                    onToggleComplete={toggleTaskComplete}
                    mode={timerMode}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <SettingsModal
        isOpen={settingsOpen}
        initialWork={settings.work}
        initialShortBreak={settings.shortBreak}
        initialLongBreak={settings.longBreak}
        initialLongBreakInterval={settings.longBreakInterval}
        initialSoundEnabled={settings.soundEnabled}
        initialSoundVolume={settings.soundVolume}
        mode={timerMode}
        onSave={newSettings => {
          // Update all unstarted tasks to use new work session length
          setTasks(prevTasks => prevTasks.map(task =>
            task.pomodoros === 0 ? { ...task, remainingSeconds: newSettings.work * 60 } : task
          ));
          setSettings(newSettings);
          setSettingsOpen(false);
          toast.success('Settings successfully updated.');
        }}
        onClose={() => setSettingsOpen(false)}
        disableSave={timerRunning}
      />
    </>
  );
}
