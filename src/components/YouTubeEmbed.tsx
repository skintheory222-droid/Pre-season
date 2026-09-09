"use client";

import { useState, useEffect } from "react";
import { loadSetting, saveSetting } from "@/lib/storage";

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
}

export default function YouTubeEmbed() {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadSetting("youtube_url").then((saved) => {
      if (saved) {
        setUrl(saved);
        setVideoId(extractVideoId(saved));
      }
    });
  }, []);

  const handleSave = async () => {
    const id = extractVideoId(url);
    setVideoId(id);
    await saveSetting("youtube_url", url);
    setEditing(false);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "8px 14px",
          color: "var(--text-secondary)",
          fontSize: 13,
          cursor: "pointer",
          width: "100%",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Pomodoro Timer</span>
        <span style={{ fontSize: 11 }}>{collapsed ? "▸" : "▾"}</span>
      </button>

      {!collapsed && (
        <div
          style={{
            marginTop: 8,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 16,
          }}
        >
          {editing || !videoId ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube URL..."
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
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
              <button
                onClick={handleSave}
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
                Set
              </button>
            </div>
          ) : (
            <div>
              <div
                style={{
                  position: "relative",
                  paddingBottom: "56.25%",
                  borderRadius: 8,
                  overflow: "hidden",
                  marginBottom: 8,
                }}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <button
                onClick={() => setEditing(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-subtle)",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Change video
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
