export type TaskType =
  | "ritual"
  | "organization"
  | "dj"
  | "guitar"
  | "spanish"
  | "exercise"
  | "creation"
  | "sound_design"
  | "deep_listening"
  | "arrangement"
  | "mixing"
  | "mindfulness"
  | "outside"
  | "break";

export interface Subtask {
  id: string;
  label: string;
  detail?: string;
  explanation?: string;
  image_url?: string;
  done?: boolean;
}

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description?: string;
  youtube_playlist_url?: string;
  status?: "complete" | "incomplete";
  subtasks: Subtask[];
  completed_at?: string;
}

export interface DayData {
  id?: string;
  day_number: number;
  phase: string;
  tasks: Task[];
  bonus_tasks: Task[];
  bonus_task_order: string[];
  task_order: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Habit {
  id: string;
  name: string;
  explanation?: string;
  active: boolean;
  created_at?: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  day_number: number;
  completed: boolean;
  logged_at?: string;
}

export const TASK_TYPES: Record<
  TaskType,
  { label: string; accent: string; bg: string }
> = {
  ritual: { label: "Ritual", accent: "#a99de0", bg: "#2a2438" },
  organization: { label: "Organization", accent: "#5ec4b0", bg: "#1e2a2e" },
  dj: { label: "DJ", accent: "#e09070", bg: "#2a2222" },
  guitar: { label: "Guitar", accent: "#c8b860", bg: "#2a2818" },
  spanish: { label: "Spanish", accent: "#7094e0", bg: "#1e2230" },
  exercise: { label: "Exercise", accent: "#90c870", bg: "#282a1e" },
  creation: { label: "Creation", accent: "#e0709a", bg: "#2a1e28" },
  sound_design: { label: "Sound Design", accent: "#70c8e0", bg: "#1e282a" },
  deep_listening: {
    label: "Deep Listening",
    accent: "#c870e0",
    bg: "#281e2a",
  },
  arrangement: { label: "Arrangement", accent: "#e0c870", bg: "#2a281e" },
  mixing: { label: "Mixing", accent: "#70e0a0", bg: "#1e2a22" },
  mindfulness: { label: "Mindfulness", accent: "#e070a0", bg: "#2a1e24" },
  outside: { label: "Outside", accent: "#a0d070", bg: "#1e2a1e" },
  break: { label: "Break", accent: "#8a8a8a", bg: "#1e1e1e" },
};
