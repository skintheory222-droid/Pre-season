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

export default function HabitsSection({
  habits,
  habitLogs,
  allHabitLogs,
  currentDay,
  onToggle,
  onAddHabit,
  onDeleteHabit,
}: Props) {
  const [newHabit, setNewHabit] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: 12,
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          width: "100%",
          padding: "14px 16px",
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
        }}
      >
        <span>Daily Habits</span>
        <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>
          {collapsed ? "▸" : "▾"}
        </span>
      </button>

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

              return (
                <div
                  key={habit.id}
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
    </div>
  );
}
