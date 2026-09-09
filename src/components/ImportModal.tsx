"use client";

import { useState } from "react";

interface Props {
  hasExistingTasks: boolean;
  onImport: (json: string, mode: "replace" | "merge") => void;
  onClose: () => void;
}

export default function ImportModal({ hasExistingTasks, onImport, onClose }: Props) {
  const [json, setJson] = useState("");
  const [mode, setMode] = useState<"replace" | "merge">("replace");

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Import Day Plan</h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
          Paste the JSON from your Claude conversation.
        </p>

        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          placeholder='{"day": 1, "tasks": [...]}'
          style={{
            width: "100%",
            minHeight: 200,
            padding: 12,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text-primary)",
            fontSize: 13,
            fontFamily: "monospace",
            outline: "none",
            resize: "vertical",
          }}
          autoFocus
        />

        {hasExistingTasks && (
          <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
            <label style={{ fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>
              <input
                type="radio"
                checked={mode === "replace"}
                onChange={() => setMode("replace")}
                style={{ marginRight: 6 }}
              />
              Replace current day
            </label>
            <label style={{ fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>
              <input
                type="radio"
                checked={mode === "merge"}
                onChange={() => setMode("merge")}
                style={{ marginRight: 6 }}
              />
              Merge with existing
            </label>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={cancelBtn}>
            Cancel
          </button>
          <button
            onClick={() => onImport(json, mode)}
            style={saveBtn}
            disabled={!json.trim()}
          >
            Import
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
  maxWidth: 520,
  border: "1px solid var(--border)",
};

const cancelBtn: React.CSSProperties = {
  padding: "10px 20px",
  background: "transparent",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text-secondary)",
  fontSize: 13,
  cursor: "pointer",
};

const saveBtn: React.CSSProperties = {
  padding: "10px 20px",
  background: "#a99de0",
  border: "none",
  borderRadius: 8,
  color: "#111014",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
