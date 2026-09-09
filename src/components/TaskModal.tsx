"use client";

import { useState } from "react";
import { Task, TaskType, TASK_TYPES, Subtask } from "@/types";

interface Props {
  task: Task | null;
  onSave: (task: Task) => void;
  onClose: () => void;
}

export default function TaskModal({ task, onSave, onClose }: Props) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [type, setType] = useState<TaskType>(task?.type || "ritual");
  const [youtubePlaylist, setYoutubePlaylist] = useState(task?.youtube_playlist_url || "");
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks || []);
  const [newSubLabel, setNewSubLabel] = useState("");
  const [newSubDetail, setNewSubDetail] = useState("");

  const addSubtask = () => {
    if (!newSubLabel.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `${type}-${Date.now()}-${subtasks.length}`,
        label: newSubLabel.trim(),
        detail: newSubDetail.trim() || undefined,
        done: false,
      },
    ]);
    setNewSubLabel("");
    setNewSubDetail("");
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      id: task?.id || `${type}-${Date.now()}`,
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      youtube_playlist_url: youtubePlaylist.trim() || undefined,
      subtasks,
      status: task?.status || "incomplete",
      completed_at: task?.completed_at,
    });
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
          {task ? "Edit Task" : "Add Task"}
        </h2>

        <label style={labelStyle}>Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TaskType)}
          style={inputStyle}
        >
          {Object.entries(TASK_TYPES).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label}
            </option>
          ))}
        </select>

        <label style={labelStyle}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          style={inputStyle}
          autoFocus
        />

        <label style={labelStyle}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
        />

        <label style={labelStyle}>YouTube Playlist URL</label>
        <input
          value={youtubePlaylist}
          onChange={(e) => setYoutubePlaylist(e.target.value)}
          placeholder="https://youtube.com/playlist?list=..."
          style={inputStyle}
        />

        <label style={labelStyle}>Subtasks</label>
        {subtasks.map((s) => (
          <div
            key={s.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
              padding: "6px 10px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: 6,
            }}
          >
            <span style={{ flex: 1, fontSize: 13 }}>{s.label}</span>
            <button onClick={() => removeSubtask(s.id)} style={smallBtn}>
              ✕
            </button>
          </div>
        ))}

        <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
          <input
            value={newSubLabel}
            onChange={(e) => setNewSubLabel(e.target.value)}
            placeholder="Subtask label"
            style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
            onKeyDown={(e) => e.key === "Enter" && addSubtask()}
          />
          <button onClick={addSubtask} style={smallBtn}>
            +
          </button>
        </div>
        <input
          value={newSubDetail}
          onChange={(e) => setNewSubDetail(e.target.value)}
          placeholder="Subtask detail (optional)"
          style={{ ...inputStyle, fontSize: 12 }}
        />

        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={cancelBtn}>
            Cancel
          </button>
          <button onClick={handleSubmit} style={saveBtn} disabled={!title.trim()}>
            {task ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
  padding: 16,
};

const modal: React.CSSProperties = {
  background: "#1a1820",
  borderRadius: 16,
  padding: 24,
  width: "100%",
  maxWidth: 480,
  maxHeight: "85vh",
  overflow: "auto",
  border: "1px solid var(--border)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 500,
  color: "var(--text-secondary)",
  marginBottom: 4,
  marginTop: 12,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text-primary)",
  fontSize: 14,
  outline: "none",
  marginBottom: 4,
};

const smallBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "1px solid var(--border)",
  borderRadius: 6,
  color: "var(--text-secondary)",
  fontSize: 14,
  cursor: "pointer",
};

const cancelBtn: React.CSSProperties = {
  padding: "10px 20px",
  background: "transparent",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text-secondary)",
  fontSize: 13,
};

const saveBtn: React.CSSProperties = {
  padding: "10px 20px",
  background: "#a99de0",
  border: "none",
  borderRadius: 8,
  color: "#111014",
  fontSize: 13,
  fontWeight: 600,
};
