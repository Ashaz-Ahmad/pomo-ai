export type Task = {
  id: string;                // unique task identifier
  name: string;              // task name
  completed: boolean;        // has the task been completed?
  pomodoros: number;         // how many pomodoros (25 minute blocks) this task has been going for
  estimatedTime?: number;    // optional item: estimated time in minutes Will be updated later by user.
  actualTime?: number;       // optional item: actual time in minutes. Will be updated later when user finishes task.
};
