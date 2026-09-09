"use client";

import { useState } from "react";
import { Task, TASK_TYPES } from "@/types";

interface Props {
  task: Task;
  index: number;
  totalTasks: number;
  onToggleSubtask: (subtaskId: string) => void;
  onToggleTask: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function TaskCard({
  task,
  index,
  totalTasks,
  onToggleSubtask,
  onToggleTask,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const typeInfo = TASK_TYPES[task.type] || TASK_TYPES.break;
  const doneCount = task.subtasks.filter((s) => s.done).length;
  const totalSubs = task.subtasks.length;
  const isComplete =
    task.status === "complete" || (totalSubs > 0 && doneCount === totalSubs);

  return (
    <div
      style={{
        background: typeInfo.bg,
        borderRadius: 12,
        marginBottom: 8,
        border: `1px solid ${isComplete ? typeInfo.accent + "30" : "var(--border)"}`,
        overflow: "hidden",
        opacity: isComplete ? 0.7 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          cursor: task.subtasks.length > 0 ? "pointer" : "default",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
        onClick={() => task.subtasks.length > 0 && setExpanded(!expanded)}
      >
        {/* Checkbox for tasks without subtasks */}
        {task.subtasks.length === 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleTask();
            }}
            style={{
              width: 20,
              height: 20,
              minWidth: 20,
              borderRadius: 4,
              border: `2px solid ${isComplete ? typeInfo.accent : "var(--text-subtle)"}`,
              background: isComplete ? typeInfo.accent : "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 2,
              color: isComplete ? "#000" : "transparent",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {isComplete && "✓"}
          </button>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Type tag */}
          <span
            style={{
              display: "inline-block",
              fontSize: 10,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: typeInfo.accent,
              background: typeInfo.accent + "18",
              padding: "2px 8px",
              borderRadius: 4,
              marginBottom: 6,
            }}
          >
            {typeInfo.label}
          </span>

          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              margin: 0,
              textDecoration: isComplete ? "line-through" : "none",
              color: isComplete ? "var(--text-secondary)" : "var(--text-primary)",
            }}
          >
            {task.title}
          </h3>

          {task.description && (
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                margin: "4px 0 0",
                lineHeight: 1.4,
              }}
            >
              {task.description}
            </p>
          )}

          {/* Progress bar for subtasks */}
          {totalSubs > 0 && (
            <div style={{ marginTop: 8 }}>
              <div
                style={{
                  height: 3,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(doneCount / totalSubs) * 100}%`,
                    background: typeInfo.accent,
                    borderRadius: 2,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <span style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 2 }}>
                {doneCount}/{totalSubs}
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div
          style={{ display: "flex", gap: 4, alignItems: "center" }}
          onClick={(e) => e.stopPropagation()}
        >
          {index > 0 && (
            <button onClick={onMoveUp} style={actionBtn} title="Move up">
              ↑
            </button>
          )}
          {index < totalTasks - 1 && (
            <button onClick={onMoveDown} style={actionBtn} title="Move down">
              ↓
            </button>
          )}
          <button onClick={onEdit} style={actionBtn} title="Edit">
            ✎
          </button>
          {confirmDelete ? (
            <button
              onClick={onDelete}
              style={{ ...actionBtn, color: "#e05050", borderColor: "#e0505040" }}
              title="Confirm delete"
            >
              ✓
            </button>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              style={actionBtn}
              title="Delete"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Subtasks */}
      {expanded && task.subtasks.length > 0 && (
        <div style={{ padding: "0 16px 14px", borderTop: "1px solid var(--border)" }}>
          {task.subtasks.map((sub) => (
            <div
              key={sub.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <button
                onClick={() => onToggleSubtask(sub.id)}
                style={{
                  width: 18,
                  height: 18,
                  minWidth: 18,
                  borderRadius: 4,
                  border: `2px solid ${sub.done ? typeInfo.accent : "var(--text-subtle)"}`,
                  background: sub.done ? typeInfo.accent : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 1,
                  color: sub.done ? "#000" : "transparent",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {sub.done && "✓"}
              </button>
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontSize: 13,
                    color: sub.done ? "var(--text-subtle)" : "var(--text-primary)",
                    textDecoration: sub.done ? "line-through" : "none",
                  }}
                >
                  {sub.label}
                </span>
                {!sub.done && sub.detail && (
                  <p style={{ fontSize: 12, color: "var(--text-subtle)", margin: "2px 0 0" }}>
                    {sub.detail}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "1px solid var(--border)",
  borderRadius: 6,
  color: "var(--text-subtle)",
  fontSize: 13,
  cursor: "pointer",
};
