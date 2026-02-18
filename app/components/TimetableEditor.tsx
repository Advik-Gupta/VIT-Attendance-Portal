"use client";

import { useState } from "react";
import { Subject } from "@/app/types/attendance";
import { saveToStorage } from "@/app/lib/storage";
import { v4 as uuid } from "uuid";
import type { Timetable, Weekday } from "@/app/types/attendance";

import "./TimetableEditor.css";

const weekdays: { label: string; value: Weekday }[] = [
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
];

interface TimetableEditorProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  timetable: Timetable;
  setTimetable: React.Dispatch<React.SetStateAction<Timetable>>;
  onForceSave: () => Promise<void>;
}

export default function TimetableEditor({
  subjects,
  setSubjects,
  timetable,
  setTimetable,
  onForceSave,
}: TimetableEditorProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"theory" | "lab">("theory");
  const [saving, setSaving] = useState(false);
  const [collapsedDays, setCollapsedDays] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
  });
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  // For reordering within a day: track which item is being dragged
  const [draggingItem, setDraggingItem] = useState<{
    day: Weekday;
    index: number;
  } | null>(null);

  const addSubject = () => {
    if (!name.trim()) return;
    const newSub: Subject = { id: uuid(), name, type };
    const updated = [...subjects, newSub];
    setSubjects(updated);
    saveToStorage("subjects", updated);
    setName("");
  };

  const removeFromDay = (day: Weekday, index: number) => {
    const updated = {
      ...timetable,
      [day]: (timetable[day] || []).filter((_, i) => i !== index),
    };
    setTimetable(updated);
    saveToStorage("timetable", updated);
  };

  const moveWithinDay = (day: Weekday, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const arr = [...(timetable[day] || [])];
    const [item] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, item);
    const updated = { ...timetable, [day]: arr };
    setTimetable(updated);
    saveToStorage("timetable", updated);
  };

  const onDropToDay = (day: Weekday, subjectId: string, atIndex?: number) => {
    const arr = [...(timetable[day] || [])];
    if (atIndex !== undefined) {
      arr.splice(atIndex, 0, subjectId);
    } else {
      arr.push(subjectId);
    }
    const updated = { ...timetable, [day]: arr };
    setTimetable(updated);
    saveToStorage("timetable", updated);
  };

  const handleSave = async () => {
    setSaving(true);
    await onForceSave();
    setSaving(false);
  };

  const toggleDay = (day: number) => {
    setCollapsedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  return (
    <>
      <div className="tt-root">
        <div className="tt-creator">
          <span className="tt-section-label">Create Subject</span>
          <div className="tt-creator-row">
            <input
              className="tt-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSubject()}
              placeholder="Subject name"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="words"
            />
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
            <button onClick={addSubject} className="tt-add-btn">
              Attendance Summary
            </button>
            <button
              onClick={handleSave}
              className="tt-add-btn"
              disabled={saving}
            >
              {saving ? "Saving…" : "☁️ Save"}
            </button>
          </div>
        </div>

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
                onDragStart={(e) => {
                  e.dataTransfer.setData("subjectId", sub.id);
                  e.dataTransfer.setData("fromPool", "true");
                }}
                className={`tt-chip ${sub.type === "lab" ? "tt-chip-lab" : "tt-chip-theory"}`}
              >
                <span>{sub.name}</span>
                <span className="tt-chip-badge">{sub.type}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="tt-grid">
          {weekdays.map((day) => {
            const daySubjects = (timetable[day.value] || []) as string[];
            const isCollapsed = collapsedDays[day.value];

            return (
              <div
                key={day.value}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverDay(day.value);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOverDay(null);
                    setDragOverIndex(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverDay(null);
                  setDragOverIndex(null);

                  const fromPool = e.dataTransfer.getData("fromPool");
                  const subjectId = e.dataTransfer.getData("subjectId");
                  const fromDay = e.dataTransfer.getData("fromDay");
                  const fromIndex = parseInt(
                    e.dataTransfer.getData("fromIndex"),
                    10,
                  );

                  if (fromPool === "true" && subjectId) {
                    onDropToDay(day.value, subjectId);
                  } else if (fromDay && !isNaN(fromIndex)) {
                    const fromDayNum = parseInt(fromDay, 10) as Weekday;
                    if (fromDayNum === day.value) {
                      moveWithinDay(
                        day.value,
                        fromIndex,
                        dragOverIndex ?? daySubjects.length,
                      );
                    }
                  }
                }}
                className={`tt-day-col${dragOverDay === day.value ? " drag-over" : ""}`}
              >
                <div
                  className="tt-day-header"
                  onClick={() => toggleDay(day.value)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="tt-day-name">{day.label}</span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <span className="tt-day-count">{daySubjects.length}</span>
                    <span className="tt-collapse-icon">
                      {isCollapsed ? "▸" : "▾"}
                    </span>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="tt-day-subjects-scroll">
                    {daySubjects.map((id: string, index: number) => {
                      const sub = subjects.find((s: Subject) => s.id === id);
                      if (!sub) return null;
                      return (
                        <div
                          key={`${id}-${index}`}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("subjectId", id);
                            e.dataTransfer.setData(
                              "fromDay",
                              String(day.value),
                            );
                            e.dataTransfer.setData("fromIndex", String(index));
                            e.dataTransfer.setData("fromPool", "false");
                            setDraggingItem({ day: day.value, index });
                          }}
                          onDragEnd={() => setDraggingItem(null)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDragOverIndex(index);
                          }}
                          className={`tt-subject-pill ${sub.type === "lab" ? "tt-subject-pill-lab" : "tt-subject-pill-theory"} tt-subject-pill-draggable${draggingItem?.day === day.value && draggingItem?.index === index ? " tt-pill-dragging" : ""}`}
                        >
                          <span className="tt-drag-handle">⠿</span>
                          <span className="tt-pill-name">{sub.name}</span>
                          <span className="tt-pill-badge">{sub.type}</span>
                          <button
                            className="tt-pill-remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromDay(day.value, index);
                            }}
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}

                    {daySubjects.length === 0 && (
                      <span className="tt-drop-hint">drop here</span>
                    )}
                  </div>
                )}

                {isCollapsed && daySubjects.length === 0 && (
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
