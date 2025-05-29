export type Task = {
  id: string;                // unique task identifier
  name: string;              // task name
  completed: boolean;        // has the task been completed?
  estimatedTime?: number;    // optional item: estimated time in minutes Will be updated later by user.
  actualTime?: number;       // optional item: actual time in minutes. Will be updated later when user finishes task.
};
