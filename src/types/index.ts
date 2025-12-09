export interface Feature {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  targetDate: Date;
  createdAt: Date;
}

export interface Alarm {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
  days: string[];
}

export interface ScreenTimeLog {
  app: string;
  duration: number;
  date: Date;
}