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
  seedDefaultHabits,
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
  const [editingBonus, setEditingBonus] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [toast, setToast] = useState("");
  const [jumpInput, setJumpInput] = useState("");
  const [showJump, setShowJump] = useState(false);
  const [editingPhase, setEditingPhase] = useState(false);
  const [phaseInput, setPhaseInput] = useState("");
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
        bonus_tasks: [],
        bonus_task_order: [],
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
    seedDefaultHabits().then(() => {
      refreshDay(currentDay);
      refreshHabits(currentDay);
      setLoaded(true);
    });
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
      if (editingBonus) {
        const bonusTasks = [...(dayData.bonus_tasks || [])];
        const idx = bonusTasks.findIndex((t) => t.id === task.id);
        if (idx >= 0) bonusTasks[idx] = task;
        else bonusTasks.push(task);
        const order = idx >= 0
          ? (dayData.bonus_task_order || [])
          : [...(dayData.bonus_task_order || []), task.id];
        await persistDay({ ...dayData, bonus_tasks: bonusTasks, bonus_task_order: order });
      } else {
        const tasks = [...dayData.tasks];
        const idx = tasks.findIndex((t) => t.id === task.id);
        if (idx >= 0) tasks[idx] = task;
        else tasks.push(task);
        const order = idx >= 0 ? dayData.task_order : [...dayData.task_order, task.id];
        await persistDay({ ...dayData, tasks, task_order: order });
      }
      setShowTaskModal(false);
      setEditingTask(null);
      setEditingBonus(false);
    },
    [dayData, persistDay, editingBonus]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string, isBonus: boolean) => {
      if (!dayData) return;
      if (isBonus) {
        await persistDay({
          ...dayData,
          bonus_tasks: (dayData.bonus_tasks || []).filter((t) => t.id !== taskId),
          bonus_task_order: (dayData.bonus_task_order || []).filter((id) => id !== taskId),
        });
      } else {
        await persistDay({
          ...dayData,
          tasks: dayData.tasks.filter((t) => t.id !== taskId),
          task_order: dayData.task_order.filter((id) => id !== taskId),
        });
      }
    },
    [dayData, persistDay]
  );

  const handleToggleSubtask = useCallback(
    async (taskId: string, subtaskId: string, isBonus: boolean) => {
      if (!dayData) return;
      const key = isBonus ? "bonus_tasks" : "tasks";
      const taskList = isBonus ? (dayData.bonus_tasks || []) : dayData.tasks;
      const updated = taskList.map((t) => {
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
      await persistDay({ ...dayData, [key]: updated });
    },
    [dayData, persistDay]
  );

  const handleToggleTask = useCallback(
    async (taskId: string, isBonus: boolean) => {
      if (!dayData) return;
      const key = isBonus ? "bonus_tasks" : "tasks";
      const taskList = isBonus ? (dayData.bonus_tasks || []) : dayData.tasks;
      const updated = taskList.map((t) => {
        if (t.id !== taskId) return t;
        const isComplete = t.status === "complete";
        return {
          ...t,
          status: isComplete ? ("incomplete" as const) : ("complete" as const),
          completed_at: isComplete ? undefined : new Date().toISOString(),
          subtasks: t.subtasks.map((s) => ({ ...s, done: !isComplete })),
        };
      });
      await persistDay({ ...dayData, [key]: updated });
    },
    [dayData, persistDay]
  );

  const handleReorder = useCallback(
    async (fromIndex: number, toIndex: number, isBonus: boolean) => {
      if (!dayData) return;
      const orderKey = isBonus ? "bonus_task_order" : "task_order";
      const order = [...(isBonus ? (dayData.bonus_task_order || []) : dayData.task_order)];
      const [moved] = order.splice(fromIndex, 1);
      order.splice(toIndex, 0, moved);
      await persistDay({ ...dayData, [orderKey]: order });
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
        const importedBonus: Task[] = parsed.bonus_tasks || [];
        const day = parsed.day || currentDay;
        const phase = parsed.phase || getPhase(day);

        if (mode === "replace" || !dayData?.tasks.length) {
          await persistDay({
            day_number: day,
            phase,
            tasks: importedTasks,
            task_order: importedTasks.map((t) => t.id),
            bonus_tasks: importedBonus,
            bonus_task_order: importedBonus.map((t) => t.id),
          });
        } else {
          const existingIds = new Set(dayData.tasks.map((t) => t.id));
          const newTasks = importedTasks.filter((t) => !existingIds.has(t.id));
          const existingBonusIds = new Set((dayData.bonus_tasks || []).map((t) => t.id));
          const newBonus = importedBonus.filter((t) => !existingBonusIds.has(t.id));
          await persistDay({
            ...dayData,
            tasks: [...dayData.tasks, ...newTasks],
            task_order: [...dayData.task_order, ...newTasks.map((t) => t.id)],
            bonus_tasks: [...(dayData.bonus_tasks || []), ...newBonus],
            bonus_task_order: [...(dayData.bonus_task_order || []), ...newBonus.map((t) => t.id)],
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

  const buildExportData = useCallback(() => {
    if (!dayData) return null;
    const incompleteSummary: string[] = [];
    const allTasksForExport = [...dayData.tasks, ...(dayData.bonus_tasks || [])];

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
        const unfinished = subtasks.filter((s) => !s.done).map((s) => s.label);
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

    const bonusCompleted = (dayData.bonus_tasks || [])
      .filter((t) => t.status === "complete" || (t.subtasks.length > 0 && t.subtasks.every((s) => s.done)))
      .map((t) => t.id);

    // Also add incomplete bonus subtasks to summary
    (dayData.bonus_tasks || []).forEach((t) => {
      const unfinished = t.subtasks.filter((s) => !s.done).map((s) => s.label);
      const allDone = t.subtasks.length === 0 ? t.status === "complete" : t.subtasks.every((s) => s.done);
      if (!allDone && (t.subtasks.length > 0 ? unfinished.length : true)) {
        incompleteSummary.push(
          `[Bonus] ${t.title}: ${unfinished.length ? unfinished.join(", ") : "not done"}`
        );
      }
    });

    const habitsToday: Record<string, boolean> = {};
    habits.forEach((h) => {
      const log = habitLogs.find((l) => l.habit_id === h.id);
      habitsToday[h.name] = log?.completed || false;
    });

    return {
      day: dayData.day_number,
      phase: dayData.phase,
      exported_at: new Date().toISOString(),
      tasks: exportTasks,
      incomplete_summary: incompleteSummary,
      bonus_completed: bonusCompleted,
      habits_today: habitsToday,
    };
  }, [dayData, habits, habitLogs]);

  const handleExport = useCallback(() => {
    const exportData = buildExportData();
    if (!exportData) return;
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    showToast("Copied to clipboard");
  }, [buildExportData, showToast]);

  const handleEveningPrep = useCallback(() => {
    const exportData = buildExportData();
    if (!exportData) return;
    const message = `Evening prep — Day ${exportData.day}. Here is my export:\n\n${JSON.stringify(exportData, null, 2)}`;
    navigator.clipboard.writeText(message);
    showToast("Evening prep copied to clipboard");
  }, [buildExportData, showToast]);

  const handlePhaseEdit = useCallback(async () => {
    if (!dayData || !phaseInput.trim()) return;
    await persistDay({ ...dayData, phase: phaseInput.trim() });
    setEditingPhase(false);
  }, [dayData, phaseInput, persistDay]);

  // Sort tasks by order
  const sortByOrder = (tasks: Task[], order: string[]) => {
    const ordered = order
      .map((id) => tasks.find((t) => t.id === id))
      .filter(Boolean) as Task[];
    const unordered = tasks.filter((t) => !order.includes(t.id));
    return [...ordered, ...unordered];
  };

  const allTasks = dayData ? sortByOrder(dayData.tasks, dayData.task_order) : [];
  const bonusTasks = dayData ? sortByOrder(dayData.bonus_tasks || [], dayData.bonus_task_order || []) : [];

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
            {editingPhase ? (
              <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                <input
                  value={phaseInput}
                  onChange={(e) => setPhaseInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePhaseEdit()}
                  autoFocus
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    color: "var(--text-secondary)",
                    fontSize: 13,
                    padding: "2px 6px",
                    outline: "none",
                    width: 200,
                  }}
                />
                <button
                  onClick={handlePhaseEdit}
                  style={{ ...navBtn, width: 24, height: 24, fontSize: 12 }}
                >
                  ✓
                </button>
              </div>
            ) : (
              <p
                onClick={() => {
                  setPhaseInput(dayData?.phase || getPhase(currentDay));
                  setEditingPhase(true);
                }}
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 13,
                  margin: 0,
                  cursor: "pointer",
                  borderBottom: "1px dashed var(--text-subtle)",
                  display: "inline-block",
                }}
              >
                {dayData?.phase || getPhase(currentDay)}
              </p>
            )}
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
              onToggleSubtask={(subtaskId) => handleToggleSubtask(task.id, subtaskId, false)}
              onToggleTask={() => handleToggleTask(task.id, false)}
              onEdit={() => {
                setEditingTask(task);
                setEditingBonus(false);
                setShowTaskModal(true);
              }}
              onDelete={() => handleDeleteTask(task.id, false)}
              onMoveUp={() => index > 0 && handleReorder(index, index - 1, false)}
              onMoveDown={() => index < allTasks.length - 1 && handleReorder(index, index + 1, false)}
            />
          ))
        )}
      </div>

      {/* Add Task Button */}
      <button
        onClick={() => {
          setEditingTask(null);
          setEditingBonus(false);
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

      {/* Bonus Tasks */}
      {(bonusTasks.length > 0 || allTasks.length > 0) && (
        <div style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-secondary)",
              marginBottom: 12,
              letterSpacing: "0.02em",
            }}
          >
            Bonus — if the energy is there
          </h2>
          {bonusTasks.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-subtle)", marginBottom: 12 }}>
              No bonus tasks. Import a day plan with bonus_tasks or add one manually.
            </p>
          ) : (
            bonusTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                totalTasks={bonusTasks.length}
                isBonus
                onToggleSubtask={(subtaskId) => handleToggleSubtask(task.id, subtaskId, true)}
                onToggleTask={() => handleToggleTask(task.id, true)}
                onEdit={() => {
                  setEditingTask(task);
                  setEditingBonus(true);
                  setShowTaskModal(true);
                }}
                onDelete={() => handleDeleteTask(task.id, true)}
                onMoveUp={() => index > 0 && handleReorder(index, index - 1, true)}
                onMoveDown={() => index < bonusTasks.length - 1 && handleReorder(index, index + 1, true)}
              />
            ))
          )}
          <button
            onClick={() => {
              setEditingTask(null);
              setEditingBonus(true);
              setShowTaskModal(true);
            }}
            style={{
              width: "100%",
              padding: "12px",
              background: "transparent",
              border: "1px dashed var(--border)",
              borderRadius: 12,
              color: "var(--text-subtle)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            + Add Bonus Task
          </button>
        </div>
      )}

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
        onUpdateHabit={async (habit) => {
          await saveHabit(habit);
          refreshHabits(currentDay);
        }}
      />

      {/* Evening Prep Button */}
      <button
        onClick={handleEveningPrep}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          padding: "12px 20px",
          background: "#a99de0",
          border: "none",
          borderRadius: 12,
          color: "#111014",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(169, 157, 224, 0.3)",
          zIndex: 50,
        }}
      >
        Start evening prep
      </button>

      {/* Modals */}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
            setEditingBonus(false);
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
