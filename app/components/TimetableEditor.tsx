"use client";

import { useState, useEffect } from "react";
import { Subject } from "@/app/types/attendance";
import { saveToStorage, loadFromStorage } from "@/app/lib/storage";
import { v4 as uuid } from "uuid";

const weekdays = [
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
];

export default function TimetableEditor({
  subjects,
  setSubjects,
  timetable,
  setTimetable,
}: any) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"theory" | "lab">("theory");

  const addSubject = () => {
    if (!name.trim()) return;

    const newSub: Subject = {
      id: uuid(),
      name,
      type,
    };

    const updated = [...subjects, newSub];
    setSubjects(updated);
    saveToStorage("subjects", updated);
    setName("");
  };

  const onDrop = (day: number, subjectId: string) => {
    const updated = {
      ...timetable,
      [day]: [...(timetable[day] || []), subjectId],
    };
    setTimetable(updated);
    saveToStorage("timetable", updated);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600&family=Syne:wght@400;500;600;700;800&display=swap');

        .tt-root {
          font-family: 'Syne', sans-serif;
          color: #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* ── Create Subject Panel ── */
        .tt-creator {
          background: #0f1117;
          border: 1px solid #1e2433;
          border-radius: 16px;
          padding: 1.5rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .tt-section-label {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #4a5568;
          font-family: 'Geist Mono', monospace;
          margin-bottom: 0.25rem;
        }

        .tt-creator-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .tt-input {
          background: #161b27;
          border: 1px solid #1e2433;
          border-radius: 10px;
          padding: 0.6rem 1rem;
          color: #e2e8f0;
          font-family: 'Syne', sans-serif;
          font-size: 0.875rem;
          outline: none;
          width: 220px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .tt-input::placeholder {
          color: #374151;
        }

        .tt-input:focus {
          border-color: #2dd4bf40;
          box-shadow: 0 0 0 3px #2dd4bf12;
        }

        /* Type toggle buttons */
        .tt-type-group {
          display: flex;
          background: #161b27;
          border: 1px solid #1e2433;
          border-radius: 10px;
          overflow: hidden;
        }

        .tt-type-btn {
          padding: 0.6rem 1.1rem;
          font-family: 'Geist Mono', monospace;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          border: none;
          background: transparent;
          color: #4a5568;
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
          position: relative;
        }

        .tt-type-btn.active-theory {
          background: #134e4a;
          color: #2dd4bf;
        }

        .tt-type-btn.active-lab {
          background: #1e3a5f;
          color: #60a5fa;
        }

        .tt-type-btn:not(:last-child) {
          border-right: 1px solid #1e2433;
        }

        .tt-add-btn {
          background: linear-gradient(135deg, #0d9488, #0891b2);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0.6rem 1.4rem;
          font-family: 'Syne', sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 0 20px #0d948840;
        }

        .tt-add-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 24px #0d948860;
        }

        .tt-add-btn:active {
          transform: translateY(0);
        }

        /* ── Subject Pool ── */
        .tt-pool {
          background: #0f1117;
          border: 1px solid #1e2433;
          border-radius: 16px;
          padding: 1.5rem 2rem;
        }

        .tt-pool-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .tt-chip {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.85rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: grab;
          user-select: none;
          transition: transform 0.15s, box-shadow 0.15s;
          border: 1px solid transparent;
        }

        .tt-chip:active {
          cursor: grabbing;
          transform: scale(0.97);
        }

        .tt-chip:hover {
          transform: translateY(-2px);
        }

        .tt-chip-theory {
          background: #0d2926;
          border-color: #134e4a;
          color: #5eead4;
        }

        .tt-chip-lab {
          background: #0d1f3c;
          border-color: #1e3a5f;
          color: #93c5fd;
        }

        .tt-chip-badge {
          font-family: 'Geist Mono', monospace;
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .tt-chip-theory .tt-chip-badge {
          background: #134e4a;
          color: #2dd4bf;
        }

        .tt-chip-lab .tt-chip-badge {
          background: #1e3a5f;
          color: #60a5fa;
        }

        /* ── Timetable Grid ── */
        .tt-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.875rem;
        }

        .tt-day-col {
          background: #0f1117;
          border: 1px solid #1e2433;
          border-radius: 14px;
          padding: 1rem;
          min-height: 160px;
          transition: border-color 0.2s, background 0.2s;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .tt-day-col.drag-over {
          border-color: #2dd4bf40;
          background: #0d2926;
        }

        .tt-day-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.625rem;
          border-bottom: 1px solid #1e2433;
          margin-bottom: 0.25rem;
        }

        .tt-day-name {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #94a3b8;
        }

        .tt-day-count {
          font-family: 'Geist Mono', monospace;
          font-size: 0.65rem;
          color: #374151;
          background: #161b27;
          padding: 0.1rem 0.4rem;
          border-radius: 5px;
        }

        .tt-subject-pill {
          padding: 0.4rem 0.65rem;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.4rem;
          border: 1px solid transparent;
        }

        .tt-subject-pill-theory {
          background: #0d2926;
          border-color: #134e4a30;
          color: #5eead4;
        }

        .tt-subject-pill-lab {
          background: #0d1f3c;
          border-color: #1e3a5f30;
          color: #93c5fd;
        }

        .tt-pill-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 600;
          font-size: 0.78rem;
        }

        .tt-pill-badge {
          font-family: 'Geist Mono', monospace;
          font-size: 0.55rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.1rem 0.3rem;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .tt-subject-pill-theory .tt-pill-badge {
          background: #134e4a;
          color: #2dd4bf;
        }

        .tt-subject-pill-lab .tt-pill-badge {
          background: #1e3a5f;
          color: #60a5fa;
        }

        .tt-drop-hint {
          color: #262f3d;
          font-size: 0.72rem;
          font-family: 'Geist Mono', monospace;
          text-align: center;
          margin-top: auto;
          padding-top: 0.5rem;
          letter-spacing: 0.04em;
        }
      `}</style>

      <div className="tt-root">
        {/* ── Create Subject ── */}
        <div className="tt-creator">
          <span className="tt-section-label">Create Subject</span>
          <div className="tt-creator-row">
            <input
              className="tt-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSubject()}
              placeholder="Subject name"
            />

            {/* Type toggle – replaces old dropdown */}
            <div className="tt-type-group">
              <button
                className={`tt-type-btn ${type === "theory" ? "active-theory" : ""}`}
                onClick={() => setType("theory")}
              >
                Theory
              </button>
              <button
                className={`tt-type-btn ${type === "lab" ? "active-lab" : ""}`}
                onClick={() => setType("lab")}
              >
                Lab
              </button>
            </div>

            <button onClick={addSubject} className="tt-add-btn">
              + Add Subject
            </button>
          </div>
        </div>

        {/* ── Subject Pool ── */}
        <div className="tt-pool">
          <span className="tt-section-label">Subject Pool</span>
          <div className="tt-pool-chips">
            {subjects.length === 0 && (
              <span
                style={{
                  color: "#374151",
                  fontSize: "0.8rem",
                  fontFamily: "'Geist Mono', monospace",
                }}
              >
                No subjects yet — create one above
              </span>
            )}
            {subjects.map((sub: Subject) => (
              <div
                key={sub.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("subjectId", sub.id)}
                className={`tt-chip ${sub.type === "lab" ? "tt-chip-lab" : "tt-chip-theory"}`}
              >
                <span>{sub.name}</span>
                <span className="tt-chip-badge">{sub.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Timetable Grid ── */}
        <div className="tt-grid">
          {weekdays.map((day) => {
            const daySubjects = (timetable[day.value] || []) as string[];
            return (
              <div
                key={day.value}
                onDragOver={(e) => {
                  e.preventDefault();
                  (e.currentTarget as HTMLElement).classList.add("drag-over");
                }}
                onDragLeave={(e) => {
                  (e.currentTarget as HTMLElement).classList.remove(
                    "drag-over",
                  );
                }}
                onDrop={(e) => {
                  (e.currentTarget as HTMLElement).classList.remove(
                    "drag-over",
                  );
                  const subjectId = e.dataTransfer.getData("subjectId");
                  onDrop(day.value, subjectId);
                }}
                className="tt-day-col"
              >
                <div className="tt-day-header">
                  <span className="tt-day-name">{day.label}</span>
                  <span className="tt-day-count">{daySubjects.length}</span>
                </div>

                {daySubjects.map((id: string) => {
                  const sub = subjects.find((s: Subject) => s.id === id);
                  if (!sub) return null;
                  return (
                    <div
                      key={id}
                      className={`tt-subject-pill ${
                        sub.type === "lab"
                          ? "tt-subject-pill-lab"
                          : "tt-subject-pill-theory"
                      }`}
                    >
                      <span className="tt-pill-name">{sub.name}</span>
                      <span className="tt-pill-badge">{sub.type}</span>
                    </div>
                  );
                })}

                {daySubjects.length === 0 && (
                  <span className="tt-drop-hint">drop here</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
