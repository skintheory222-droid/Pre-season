import { supabase, isSupabaseConfigured } from "./supabase";
import { DayData, Habit, HabitLog } from "@/types";

const LOCAL_DAYS_KEY = "preseason_days";
const LOCAL_HABITS_KEY = "preseason_habits";
const LOCAL_HABIT_LOGS_KEY = "preseason_habit_logs";
const LOCAL_SETTINGS_KEY = "preseason_settings";

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export async function loadDay(dayNumber: number): Promise<DayData | null> {
  if (isSupabaseConfigured()) {
    const { data } = await supabase
      .from("days")
      .select("*")
      .eq("day_number", dayNumber)
      .single();
    return data as DayData | null;
  }
  const days: DayData[] = getLocal(LOCAL_DAYS_KEY, []);
  return days.find((d) => d.day_number === dayNumber) || null;
}

export async function saveDay(day: DayData): Promise<void> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured()) {
    const existing = await supabase
      .from("days")
      .select("id")
      .eq("day_number", day.day_number)
      .single();
    if (existing.data) {
      await supabase
        .from("days")
        .update({ ...day, updated_at: now })
        .eq("day_number", day.day_number);
    } else {
      await supabase
        .from("days")
        .insert({ ...day, created_at: now, updated_at: now });
    }
    return;
  }
  const days: DayData[] = getLocal(LOCAL_DAYS_KEY, []);
  const idx = days.findIndex((d) => d.day_number === day.day_number);
  const updated = { ...day, updated_at: now };
  if (idx >= 0) days[idx] = updated;
  else days.push({ ...updated, created_at: now });
  setLocal(LOCAL_DAYS_KEY, days);
}

export async function loadHabits(): Promise<Habit[]> {
  if (isSupabaseConfigured()) {
    const { data } = await supabase
      .from("habits")
      .select("*")
      .eq("active", true)
      .order("created_at");
    return (data as Habit[]) || [];
  }
  return getLocal<Habit[]>(LOCAL_HABITS_KEY, []).filter((h) => h.active);
}

export async function saveHabit(habit: Habit): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabase.from("habits").upsert(habit);
    return;
  }
  const habits: Habit[] = getLocal(LOCAL_HABITS_KEY, []);
  const idx = habits.findIndex((h) => h.id === habit.id);
  if (idx >= 0) habits[idx] = habit;
  else habits.push(habit);
  setLocal(LOCAL_HABITS_KEY, habits);
}

export async function deleteHabit(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabase.from("habits").update({ active: false }).eq("id", id);
    return;
  }
  const habits: Habit[] = getLocal(LOCAL_HABITS_KEY, []);
  const idx = habits.findIndex((h) => h.id === id);
  if (idx >= 0) {
    habits[idx].active = false;
    setLocal(LOCAL_HABITS_KEY, habits);
  }
}

export async function loadHabitLogs(dayNumber: number): Promise<HabitLog[]> {
  if (isSupabaseConfigured()) {
    const { data } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("day_number", dayNumber);
    return (data as HabitLog[]) || [];
  }
  const logs: HabitLog[] = getLocal(LOCAL_HABIT_LOGS_KEY, []);
  return logs.filter((l) => l.day_number === dayNumber);
}

export async function loadAllHabitLogs(): Promise<HabitLog[]> {
  if (isSupabaseConfigured()) {
    const { data } = await supabase.from("habit_logs").select("*");
    return (data as HabitLog[]) || [];
  }
  return getLocal<HabitLog[]>(LOCAL_HABIT_LOGS_KEY, []);
}

export async function toggleHabitLog(
  habitId: string,
  dayNumber: number,
  completed: boolean
): Promise<void> {
  if (isSupabaseConfigured()) {
    const { data } = await supabase
      .from("habit_logs")
      .select("id")
      .eq("habit_id", habitId)
      .eq("day_number", dayNumber)
      .single();
    if (data) {
      await supabase
        .from("habit_logs")
        .update({ completed })
        .eq("id", data.id);
    } else {
      await supabase.from("habit_logs").insert({
        habit_id: habitId,
        day_number: dayNumber,
        completed,
        logged_at: new Date().toISOString(),
      });
    }
    return;
  }
  const logs: HabitLog[] = getLocal(LOCAL_HABIT_LOGS_KEY, []);
  const idx = logs.findIndex(
    (l) => l.habit_id === habitId && l.day_number === dayNumber
  );
  if (idx >= 0) {
    logs[idx].completed = completed;
  } else {
    logs.push({
      id: crypto.randomUUID(),
      habit_id: habitId,
      day_number: dayNumber,
      completed,
      logged_at: new Date().toISOString(),
    });
  }
  setLocal(LOCAL_HABIT_LOGS_KEY, logs);
}

export async function loadSetting(key: string): Promise<string | null> {
  if (isSupabaseConfigured()) {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", key)
      .single();
    return data?.value || null;
  }
  const settings: Record<string, string> = getLocal(LOCAL_SETTINGS_KEY, {});
  return settings[key] || null;
}

export async function saveSetting(
  key: string,
  value: string
): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabase.from("settings").upsert({ key, value });
    return;
  }
  const settings: Record<string, string> = getLocal(LOCAL_SETTINGS_KEY, {});
  settings[key] = value;
  setLocal(LOCAL_SETTINGS_KEY, settings);
}
