"use client";

import { useEffect, useState, useCallback } from "react";
import { DayData, Task, Habit, HabitLog, TASK_TYPES, TaskType, Subtask } from "@/types";
import {
  loadDay,
  saveDay,
  loadHabits,
  saveHabit,
  deleteHabit,
  loadHabitLogs,
  loadAllHabitLogs,
  toggleHabitLog,
  loadSetting,
  saveSetting,
} from "@/lib/storage";
import TaskCard from "@/components/TaskCard";
import TaskModal from "@/components/TaskModal";
import ImportModal from "@/components/ImportModal";
import HabitsSection from "@/components/HabitsSection";
import YouTubeEmbed from "@/components/YouTubeEmbed";

const PHASES: Record<number, string> = {};
for (let i = 1; i <= 20; i++) PHASES[i] = "Phase One — Foundation";
for (let i = 21; i <= 40; i++) PHASES[i] = "Phase Two — Integration";
for (let i = 41; i <= 60; i++) PHASES[i] = "Phase Three — Expression";

function getPhase(day: number): string {
  return PHASES[day] || "Pre-season";
}

export default function Dashboard() {
  const [currentDay, setCurrentDay] = useState(1);
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [allHabitLogs, setAllHabitLogs] = useState<HabitLog[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [toast, setToast] = useState("");
  const [jumpInput, setJumpInput] = useState("");
  const [showJump, setShowJump] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }, []);

  const refreshDay = useCallback(async (day: number) => {
    const data = await loadDay(day);
    setDayData(
      data || {
        day_number: day,
        phase: getPhase(day),
        tasks: [],
        task_order: [],
      }
    );
  }, []);

  const refreshHabits = useCallback(async (day: number) => {
    const [h, logs, allLogs] = await Promise.all([
      loadHabits(),
      loadHabitLogs(day),
      loadAllHabitLogs(),
    ]);
    setHabits(h);
    setHabitLogs(logs);
    setAllHabitLogs(allLogs);
  }, []);

  useEffect(() => {
    refreshDay(currentDay);
    refreshHabits(currentDay);
    setLoaded(true);
  }, [currentDay, refreshDay, refreshHabits]);

  const persistDay = useCallback(
    async (updated: DayData) => {
      setDayData(updated);
      await saveDay(updated);
    },
    []
  );

  const handleSaveTask = useCallback(
    async (task: Task) => {
      if (!dayData) return;
      const tasks = [...dayData.tasks];
      const idx = tasks.findIndex((t) => t.id === task.id);
      if (idx >= 0) {
        tasks[idx] = task;
      } else {
        tasks.push(task);
      }
      const order = idx >= 0 ? dayData.task_order : [...dayData.task_order, task.id];
      await persistDay({ ...dayData, tasks, task_order: order });
      setShowTaskModal(false);
      setEditingTask(null);
    },
    [dayData, persistDay]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      if (!dayData) return;
      await persistDay({
        ...dayData,
        tasks: dayData.tasks.filter((t) => t.id !== taskId),
        task_order: dayData.task_order.filter((id) => id !== taskId),
      });
    },
    [dayData, persistDay]
  );

  const handleToggleSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      if (!dayData) return;
      const tasks = dayData.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const subtasks = t.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, done: !s.done } : s
        );
        const allDone = subtasks.length > 0 && subtasks.every((s) => s.done);
        return {
          ...t,
          subtasks,
          status: allDone ? ("complete" as const) : ("incomplete" as const),
          completed_at: allDone ? new Date().toISOString() : undefined,
        };
      });
      await persistDay({ ...dayData, tasks });
    },
    [dayData, persistDay]
  );

  const handleToggleTask = useCallback(
    async (taskId: string) => {
      if (!dayData) return;
      const tasks = dayData.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const isComplete = t.status === "complete";
        return {
          ...t,
          status: isComplete ? ("incomplete" as const) : ("complete" as const),
          completed_at: isComplete ? undefined : new Date().toISOString(),
          subtasks: t.subtasks.map((s) => ({ ...s, done: !isComplete })),
        };
      });
      await persistDay({ ...dayData, tasks });
    },
    [dayData, persistDay]
  );

  const handleReorder = useCallback(
    async (fromIndex: number, toIndex: number) => {
      if (!dayData) return;
      const order = [...dayData.task_order];
      const [moved] = order.splice(fromIndex, 1);
      order.splice(toIndex, 0, moved);
      await persistDay({ ...dayData, task_order: order });
    },
    [dayData, persistDay]
  );

  const handleImport = useCallback(
    async (json: string, mode: "replace" | "merge") => {
      try {
        const parsed = JSON.parse(json);
        if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
          showToast("Invalid JSON: missing tasks array");
          return;
        }
        const importedTasks: Task[] = parsed.tasks;
        const day = parsed.day || currentDay;
        const phase = parsed.phase || getPhase(day);

        if (mode === "replace" || !dayData?.tasks.length) {
          await persistDay({
            day_number: day,
            phase,
            tasks: importedTasks,
            task_order: importedTasks.map((t) => t.id),
          });
        } else {
          const existingIds = new Set(dayData.tasks.map((t) => t.id));
          const newTasks = importedTasks.filter((t) => !existingIds.has(t.id));
          await persistDay({
            ...dayData,
            tasks: [...dayData.tasks, ...newTasks],
            task_order: [...dayData.task_order, ...newTasks.map((t) => t.id)],
          });
        }
        if (day !== currentDay) setCurrentDay(day);
        setShowImport(false);
        showToast("Tasks imported");
      } catch {
        showToast("Invalid JSON format");
      }
    },
    [currentDay, dayData, persistDay, showToast]
  );

  const handleExport = useCallback(() => {
    if (!dayData) return;
    const incompleteSummary: string[] = [];
    const exportTasks = dayData.tasks.map((t) => {
      const subtasks = t.subtasks.map((s) => ({
        id: s.id,
        label: s.label,
        done: s.done || false,
      }));
      const allDone =
        subtasks.length === 0
          ? t.status === "complete"
          : subtasks.every((s) => s.done);
      if (!allDone) {
        const unfinished = subtasks
          .filter((s) => !s.done)
          .map((s) => s.label);
        incompleteSummary.push(
          `${t.title}: ${unfinished.length ? unfinished.join(", ") : "not done"}`
        );
      }
      return {
        id: t.id,
        type: t.type,
        title: t.title,
        status: allDone ? "complete" : "incomplete",
        subtasks,
        ...(t.completed_at ? { completed_at: t.completed_at } : {}),
      };
    });

    const habitsToday: Record<string, boolean> = {};
    habits.forEach((h) => {
      const log = habitLogs.find((l) => l.habit_id === h.id);
      habitsToday[h.name] = log?.completed || false;
    });

    const exportData = {
      day: dayData.day_number,
      phase: dayData.phase,
      exported_at: new Date().toISOString(),
      tasks: exportTasks,
      incomplete_summary: incompleteSummary,
      habits_today: habitsToday,
    };

    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    showToast("Copied to clipboard");
  }, [dayData, habits, habitLogs, showToast]);

  const orderedTasks = dayData
    ? dayData.task_order
        .map((id) => dayData.tasks.find((t) => t.id === id))
        .filter(Boolean) as Task[]
    : [];
  const unorderedTasks = dayData
    ? dayData.tasks.filter((t) => !dayData.task_order.includes(t.id))
    : [];
  const allTasks = [...orderedTasks, ...unorderedTasks];

  const completedCount = allTasks.filter(
    (t) => t.status === "complete" || (t.subtasks.length > 0 && t.subtasks.every((s) => s.done))
  ).length;
  const totalCount = allTasks.length;

  if (!loaded) return null;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 16px 100px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setCurrentDay(Math.max(1, currentDay - 1))} style={navBtn}>
            ←
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
              Day {currentDay} of 60
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>
              {getPhase(currentDay)}
            </p>
          </div>
          <button onClick={() => setCurrentDay(Math.min(60, currentDay + 1))} style={navBtn}>
            →
          </button>
          <button onClick={() => setShowJump(!showJump)} style={navBtn} title="Jump to day">
            #
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setShowImport(true)} style={toolBtn}>
            Import
          </button>
          <button onClick={handleExport} style={toolBtn}>
            Export
          </button>
        </div>
      </div>

      {showJump && (
        <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="number"
            min={1}
            max={60}
            placeholder="Day #"
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const n = parseInt(jumpInput);
                if (n >= 1 && n <= 60) {
                  setCurrentDay(n);
                  setShowJump(false);
                  setJumpInput("");
                }
              }
            }}
            style={inputStyle}
          />
          <button
            onClick={() => {
              const n = parseInt(jumpInput);
              if (n >= 1 && n <= 60) {
                setCurrentDay(n);
                setShowJump(false);
                setJumpInput("");
              }
            }}
            style={toolBtn}
          >
            Go
          </button>
        </div>
      )}

      {/* Progress bar */}
      {totalCount > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 4,
            }}
          >
            <span>Progress</span>
            <span>
              {completedCount}/{totalCount}
            </span>
          </div>
          <div
            style={{
              height: 4,
              background: "var(--border)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(completedCount / totalCount) * 100}%`,
                background: "#a99de0",
                borderRadius: 2,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* YouTube Embed */}
      <YouTubeEmbed />

      {/* Tasks */}
      <div style={{ marginBottom: 24 }}>
        {allTasks.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "var(--text-subtle)",
              fontSize: 14,
            }}
          >
            No tasks for this day. Import a day plan or add tasks manually.
          </div>
        ) : (
          allTasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              totalTasks={allTasks.length}
              onToggleSubtask={(subtaskId) => handleToggleSubtask(task.id, subtaskId)}
              onToggleTask={() => handleToggleTask(task.id)}
              onEdit={() => {
                setEditingTask(task);
                setShowTaskModal(true);
              }}
              onDelete={() => handleDeleteTask(task.id)}
              onMoveUp={() => index > 0 && handleReorder(index, index - 1)}
              onMoveDown={() => index < allTasks.length - 1 && handleReorder(index, index + 1)}
            />
          ))
        )}
      </div>

      {/* Add Task Button */}
      <button
        onClick={() => {
          setEditingTask(null);
          setShowTaskModal(true);
        }}
        style={{
          width: "100%",
          padding: "14px",
          background: "var(--surface)",
          border: "1px dashed var(--border)",
          borderRadius: 12,
          color: "var(--text-secondary)",
          fontSize: 14,
          marginBottom: 32,
          cursor: "pointer",
        }}
      >
        + Add Task
      </button>

      {/* Habits */}
      <HabitsSection
        habits={habits}
        habitLogs={habitLogs}
        allHabitLogs={allHabitLogs}
        currentDay={currentDay}
        onToggle={async (habitId, completed) => {
          await toggleHabitLog(habitId, currentDay, completed);
          refreshHabits(currentDay);
        }}
        onAddHabit={async (name) => {
          await saveHabit({
            id: crypto.randomUUID(),
            name,
            active: true,
            created_at: new Date().toISOString(),
          });
          refreshHabits(currentDay);
        }}
        onDeleteHabit={async (id) => {
          await deleteHabit(id);
          refreshHabits(currentDay);
        }}
      />

      {/* Modals */}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
        />
      )}

      {showImport && (
        <ImportModal
          hasExistingTasks={Boolean(dayData?.tasks.length)}
          onImport={handleImport}
          onClose={() => setShowImport(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#2a2438",
            color: "#a99de0",
            padding: "10px 20px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            zIndex: 1000,
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

const navBtn: React.CSSProperties = {
  width: 36,
  height: 36,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text-primary)",
  fontSize: 16,
};

const toolBtn: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text-primary)",
  fontSize: 13,
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: 80,
  padding: "8px 12px",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text-primary)",
  fontSize: 14,
  outline: "none",
};
