export type Task = {
  id: string;               // unique task identifier
  name: string;             // task name
  completed: boolean;       // has the task been completed?
  remainingSeconds: number; // time remaining in seconds in the current pomodoro cycle for this task
  pomodoros: number;        // how many pomodoros (25 minute blocks) this task has been going for
  estimatedPomos?: number;  // optional item: Estimate of how many pomodoros it will take to complete this task. Will be updated later by user.
};

// Type guard for Task
export function isTask(obj: any): obj is Task {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.completed === 'boolean' &&
    typeof obj.remainingSeconds === 'number' &&
    typeof obj.pomodoros === 'number';
}
