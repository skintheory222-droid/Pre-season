"use client";

import { useState } from "react";
import { Task, TASK_TYPES } from "@/types";

interface Props {
  task: Task;
  index: number;
  totalTasks: number;
  isBonus?: boolean;
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
  isBonus,
  onToggleSubtask,
  onToggleTask,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [infoSubtaskId, setInfoSubtaskId] = useState<string | null>(null);

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
        border: isBonus
          ? `1px dashed ${typeInfo.accent}40`
          : `1px solid ${isComplete ? typeInfo.accent + "30" : "var(--border)"}`,
        overflow: "hidden",
        opacity: isBonus ? 0.7 : isComplete ? 0.7 : 1,
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
          {/* Type tag and playlist link */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
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
              }}
            >
              {typeInfo.label}
            </span>
            {task.youtube_playlist_url && (
              <a
                href={task.youtube_playlist_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  background: typeInfo.accent + "20",
                  color: typeInfo.accent,
                  fontSize: 11,
                  textDecoration: "none",
                }}
                title="Open playlist"
              >
                ▶
              </a>
            )}
          </div>

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
            <div key={sub.id}>
              <div
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
                {(sub.explanation || sub.image_url) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInfoSubtaskId(infoSubtaskId === sub.id ? null : sub.id);
                    }}
                    style={{
                      width: 22,
                      height: 22,
                      minWidth: 22,
                      borderRadius: "50%",
                      border: `1px solid ${infoSubtaskId === sub.id ? typeInfo.accent : "var(--text-subtle)"}`,
                      background: infoSubtaskId === sub.id ? typeInfo.accent + "20" : "transparent",
                      color: infoSubtaskId === sub.id ? typeInfo.accent : "var(--text-subtle)",
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
              </div>

              {/* Info panel */}
              {infoSubtaskId === sub.id && (
                <div
                  style={{
                    padding: "12px",
                    margin: "4px 0 8px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                  }}
                >
                  {sub.image_url && (
                    <img
                      src={sub.image_url}
                      alt={sub.label}
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        borderRadius: 6,
                        marginBottom: sub.explanation ? 10 : 0,
                      }}
                    />
                  )}
                  {sub.explanation && (
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                      {sub.explanation}
                    </p>
                  )}
                  <button
                    onClick={() => setInfoSubtaskId(null)}
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
