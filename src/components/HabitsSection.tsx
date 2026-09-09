"use client";

import { useState } from "react";
import { Habit, HabitLog } from "@/types";

interface Props {
  habits: Habit[];
  habitLogs: HabitLog[];
  allHabitLogs: HabitLog[];
  currentDay: number;
  onToggle: (habitId: string, completed: boolean) => void;
  onAddHabit: (name: string) => void;
  onDeleteHabit: (id: string) => void;
  onUpdateHabit: (habit: Habit) => void;
}

function calculateStreak(habitId: string, currentDay: number, allLogs: HabitLog[]): number {
  let streak = 0;
  for (let d = currentDay; d >= 1; d--) {
    const log = allLogs.find((l) => l.habit_id === habitId && l.day_number === d);
    if (log?.completed) streak++;
    else break;
  }
  return streak;
}

function HabitHistoryModal({
  habits,
  allHabitLogs,
  currentDay,
  onClose,
}: {
  habits: Habit[];
  allHabitLogs: HabitLog[];
  currentDay: number;
  onClose: () => void;
}) {
  const startDay = Math.max(1, currentDay - 29);
  const days: number[] = [];
  for (let d = startDay; d <= currentDay; d++) days.push(d);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1a1820",
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 700,
          maxHeight: "85vh",
          overflow: "auto",
          border: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Habit History</h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--text-secondary)",
              width: 28,
              height: 28,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
            <thead>
              <tr>
                <th
                  style={{
                    position: "sticky",
                    left: 0,
                    background: "#1a1820",
                    zIndex: 2,
                    padding: "4px 12px 4px 0",
                    textAlign: "left",
                    fontSize: 11,
                    color: "var(--text-subtle)",
                    fontWeight: 500,
                    minWidth: 100,
                  }}
                />
                {days.map((d) => (
                  <th
                    key={d}
                    style={{
                      padding: "4px 2px",
                      fontSize: 10,
                      fontWeight: d === currentDay ? 700 : 400,
                      color: d === currentDay ? "#a99de0" : "var(--text-subtle)",
                      textAlign: "center",
                      minWidth: 20,
                    }}
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => (
                <tr key={habit.id}>
                  <td
                    style={{
                      position: "sticky",
                      left: 0,
                      background: "#1a1820",
                      zIndex: 1,
                      padding: "4px 12px 4px 0",
                      fontSize: 12,
                      color: "var(--text-primary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {habit.name}
                  </td>
                  {days.map((d) => {
                    const log = allHabitLogs.find(
                      (l) => l.habit_id === habit.id && l.day_number === d
                    );
                    const done = log?.completed || false;
                    const isToday = d === currentDay;
                    return (
                      <td key={d} style={{ padding: "3px 2px", textAlign: "center" }}>
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 3,
                            margin: "0 auto",
                            background: done
                              ? "#a99de0"
                              : isToday
                                ? "rgba(169, 157, 224, 0.15)"
                                : "rgba(255,255,255,0.04)",
                            border: isToday && !done
                              ? "1px solid rgba(169, 157, 224, 0.3)"
                              : "1px solid transparent",
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function HabitsSection({
  habits,
  habitLogs,
  allHabitLogs,
  currentDay,
  onToggle,
  onAddHabit,
  onDeleteHabit,
  onUpdateHabit,
}: Props) {
  const [newHabit, setNewHabit] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedInfoId, setExpandedInfoId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editExplanation, setEditExplanation] = useState("");

  const startEdit = (habit: Habit) => {
    setEditingId(habit.id);
    setEditName(habit.name);
    setEditExplanation(habit.explanation || "");
  };

  const saveEdit = (habit: Habit) => {
    if (!editName.trim()) return;
    onUpdateHabit({
      ...habit,
      name: editName.trim(),
      explanation: editExplanation.trim() || undefined,
    });
    setEditingId(null);
  };

  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: 12,
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "14px 16px",
        }}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            color: "var(--text-primary)",
            fontSize: 15,
            fontWeight: 600,
            textAlign: "left",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 0,
          }}
        >
          <span>Daily Habits</span>
          <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>
            {collapsed ? "▸" : "▾"}
          </span>
        </button>
        <button
          onClick={() => setShowHistory(true)}
          title="Habit history"
          style={{
            marginLeft: 8,
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 6,
            color: "var(--text-subtle)",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          ▦
        </button>
      </div>

      {!collapsed && (
        <div style={{ padding: "0 16px 16px" }}>
          {habits.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-subtle)", marginBottom: 12 }}>
              No habits tracked yet.
            </p>
          ) : (
            habits.map((habit) => {
              const log = habitLogs.find((l) => l.habit_id === habit.id);
              const checked = log?.completed || false;
              const streak = calculateStreak(habit.id, currentDay, allHabitLogs);
              const isEditing = editingId === habit.id;
              const isInfoOpen = expandedInfoId === habit.id;

              return (
                <div key={habit.id}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <button
                      onClick={() => onToggle(habit.id, !checked)}
                      style={{
                        width: 18,
                        height: 18,
                        minWidth: 18,
                        borderRadius: 4,
                        border: `2px solid ${checked ? "#a99de0" : "var(--text-subtle)"}`,
                        background: checked ? "#a99de0" : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: checked ? "#000" : "transparent",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {checked && "✓"}
                    </button>
                    <span style={{ flex: 1, fontSize: 13, color: "var(--text-primary)" }}>
                      {habit.name}
                    </span>
                    {streak > 0 && (
                      <span style={{ fontSize: 11, color: "#a99de0", fontWeight: 500 }}>
                        {streak}d streak
                      </span>
                    )}
                    {habit.explanation && (
                      <button
                        onClick={() => setExpandedInfoId(isInfoOpen ? null : habit.id)}
                        style={{
                          width: 22,
                          height: 22,
                          minWidth: 22,
                          borderRadius: "50%",
                          border: `1px solid ${isInfoOpen ? "#a99de0" : "var(--text-subtle)"}`,
                          background: isInfoOpen ? "rgba(169, 157, 224, 0.15)" : "transparent",
                          color: isInfoOpen ? "#a99de0" : "var(--text-subtle)",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        i
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(habit)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-subtle)",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => onDeleteHabit(habit.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-subtle)",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Info panel */}
                  {isInfoOpen && habit.explanation && (
                    <div
                      style={{
                        padding: 12,
                        margin: "4px 0 8px",
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                      }}
                    >
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                        {habit.explanation}
                      </p>
                      <button
                        onClick={() => setExpandedInfoId(null)}
                        style={{
                          marginTop: 8,
                          background: "transparent",
                          border: "none",
                          color: "var(--text-subtle)",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        Close
                      </button>
                    </div>
                  )}

                  {/* Edit panel */}
                  {isEditing && (
                    <div
                      style={{
                        padding: 12,
                        margin: "4px 0 8px",
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                      }}
                    >
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Habit name"
                        autoFocus
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          color: "var(--text-primary)",
                          fontSize: 13,
                          outline: "none",
                          marginBottom: 8,
                        }}
                      />
                      <textarea
                        value={editExplanation}
                        onChange={(e) => setEditExplanation(e.target.value)}
                        placeholder="Explanation (optional)"
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          color: "var(--text-primary)",
                          fontSize: 12,
                          outline: "none",
                          minHeight: 60,
                          resize: "vertical",
                        }}
                      />
                      <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{
                            padding: "6px 14px",
                            background: "transparent",
                            border: "1px solid var(--border)",
                            borderRadius: 6,
                            color: "var(--text-secondary)",
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(habit)}
                          style={{
                            padding: "6px 14px",
                            background: "#a99de0",
                            border: "none",
                            borderRadius: 6,
                            color: "#111014",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              placeholder="Add habit..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && newHabit.trim()) {
                  onAddHabit(newHabit.trim());
                  setNewHabit("");
                }
              }}
              style={{
                flex: 1,
                padding: "8px 12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              onClick={() => {
                if (newHabit.trim()) {
                  onAddHabit(newHabit.trim());
                  setNewHabit("");
                }
              }}
              style={{
                padding: "8px 14px",
                background: "#a99de0",
                border: "none",
                borderRadius: 8,
                color: "#111014",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {showHistory && (
        <HabitHistoryModal
          habits={habits}
          allHabitLogs={allHabitLogs}
          currentDay={currentDay}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
