"use client";

import { useState, useEffect, useRef } from "react";
import { Subject } from "@/app/types/attendance";
import { saveToStorage } from "@/app/lib/storage";
import { getEffectiveWeekday } from "@/app/lib/attendanceLogic";

const STATUS_CONFIG: Record<
  string,
  { label: string; activeClass: string; dotColor: string }
> = {
  present: {
    label: "Present",
    activeClass: "status-present-active",
    dotColor: "#2dd4bf",
  },
  absent: {
    label: "Absent",
    activeClass: "status-absent-active",
    dotColor: "#f87171",
  },
  od: { label: "OD", activeClass: "status-od-active", dotColor: "#fb923c" },
  cancelled: {
    label: "Cancel",
    activeClass: "status-cancel-active",
    dotColor: "#6366f1",
  },
};

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-GB", { month: "short" });
  const year = d.getFullYear();
  return { day, month, year };
}

function getMonthLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return (
    d.toLocaleString("en-GB", { month: "long" }).toUpperCase() +
    " " +
    d.getFullYear()
  );
}

function getMonthShort(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return (
    d.toLocaleString("en-GB", { month: "short" }).toUpperCase() +
    " " +
    d.getFullYear().toString().slice(2)
  );
}

function getMonthKey(dateStr: string) {
  return dateStr.slice(0, 7);
}

function jsToMonSun(jsDay: number): number {
  return (jsDay + 6) % 7;
}

function buildWeeks(days: any[]): (any | null)[][] {
  if (!days.length) return [];
  const firstDate = new Date(days[0].date + "T00:00:00");
  const startOffset = jsToMonSun(firstDate.getDay());
  const cells: (any | null)[] = [...Array(startOffset).fill(null), ...days];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (any | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export default function CalendarView({
  calendar,
  subjects,
  timetable,
  attendance,
  setAttendance,
  openModal,
}: any) {
  const todayISO = new Date().toISOString().split("T")[0];

  // Group by month
  const monthMap: Record<string, any[]> = {};
  for (const day of calendar) {
    const key = getMonthKey(day.date);
    if (!monthMap[key]) monthMap[key] = [];
    monthMap[key].push(day);
  }
  const months = Object.entries(monthMap);
  const monthKeys = months.map(([k]) => k);

  // Find which month contains today (or default to first)
  const todayMonthKey =
    monthKeys.find((k) => todayISO.startsWith(k)) ?? monthKeys[0];
  const [activeMonth, setActiveMonth] = useState<string>(
    todayMonthKey ?? monthKeys[0],
  );

  const todayRef = useRef<HTMLDivElement | null>(null);

  const jumpToNow = () => {
    if (todayMonthKey) setActiveMonth(todayMonthKey);
    // scroll after state update
    setTimeout(() => {
      todayRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  };

  const toggleStatus = (date: string, subjectId: string, status: string) => {
    const updated = {
      ...attendance,
      [date]: { ...attendance[date], [subjectId]: status },
    };
    setAttendance(updated);
    saveToStorage("attendance", updated);
  };

  const activeDays = monthMap[activeMonth] ?? [];
  const weeks = buildWeeks(activeDays);
  const monthLabel = activeDays.length ? getMonthLabel(activeDays[0].date) : "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600&family=Syne:wght@400;500;600;700;800&display=swap');

        .cal-root {
          font-family: 'Syne', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        /* ── Month nav bar ── */
        .cal-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .cal-nav-scroll {
          display: flex;
          gap: 0.35rem;
          flex-wrap: wrap;
          flex: 1;
        }

        .cal-month-btn {
          font-family: 'Geist Mono', monospace;
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.42rem 0.85rem;
          border-radius: 8px;
          border: 1px solid #1e2433;
          background: #0a0d13;
          color: #2e3a4e;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .cal-month-btn:hover {
          background: #0f1421;
          color: #4a5568;
          border-color: #263045;
        }

        .cal-month-btn.active {
          background: #0d2926;
          border-color: #134e4a;
          color: #2dd4bf;
          box-shadow: 0 0 12px #2dd4bf18;
        }

        .cal-now-btn {
          font-family: 'Geist Mono', monospace;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.42rem 1rem;
          border-radius: 8px;
          border: 1px solid #134e4a;
          background: linear-gradient(135deg, #0d9488, #0891b2);
          color: #fff;
          cursor: pointer;
          transition: opacity 0.15s, box-shadow 0.2s, transform 0.15s;
          box-shadow: 0 0 16px #0d948840;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .cal-now-btn:hover {
          opacity: 0.88;
          transform: translateY(-1px);
          box-shadow: 0 4px 20px #0d948860;
        }

        /* ── Month block ── */
        .cal-month-block {
          border: 1px solid #1e2433;
          border-radius: 18px;
          overflow: hidden;
        }

        .cal-month-header {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          background: #0d1117;
          border-bottom: 1px solid #1e2433;
          position: relative;
        }

        .cal-month-header::before,
        .cal-month-header::after {
          content: '';
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          height: 1px;
          width: 28%;
        }
        .cal-month-header::before { left: 1.5rem; background: linear-gradient(to right, transparent, #1e2433); }
        .cal-month-header::after  { right: 1.5rem; background: linear-gradient(to left, transparent, #1e2433); }

        .cal-month-title {
          font-family: 'Geist Mono', monospace;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.28em;
          color: #2dd4bf;
          text-transform: uppercase;
        }

        /* Weekday label row */
        .cal-weekday-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: #080b10;
          border-bottom: 1px solid #1e2433;
        }

        .cal-weekday-label {
          font-family: 'Geist Mono', monospace;
          font-size: 0.56rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          color: #2e3a4e;
          text-transform: uppercase;
          text-align: center;
          padding: 0.5rem 0;
        }

        .cal-weekday-label.is-weekend { color: #1e2633; }

        /* Week rows */
        .cal-week-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          border-bottom: 1px solid #141c28;
        }
        .cal-week-row:last-child { border-bottom: none; }

        /* ── Day cell ── */
        .cal-cell {
          border-right: 1px solid #141c28;
          padding: 0.7rem 0.6rem;
          min-height: 120px;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          background: #0f1117;
          transition: background 0.15s;
          position: relative;
        }

        .cal-cell:last-child { border-right: none; }
        .cal-cell:hover { background: #0d1420; }
        .cal-cell.is-empty { background: #080b10; pointer-events: none; }
        .cal-cell.non-instructional { background: #0a0c12; }
        .cal-cell.is-weekend { background: #090c11; }

        /* ── TODAY glow ── */
        .cal-cell.is-today {
          background: #0a1a18 !important;
          border-right-color: #134e4a60 !important;
          box-shadow: inset 0 0 0 1.5px #2dd4bf28, inset 0 0 24px #2dd4bf08;
          z-index: 1;
        }

        .cal-today-badge {
          position: absolute;
          top: 0.55rem;
          right: 0.55rem;
          font-family: 'Geist Mono', monospace;
          font-size: 0.46rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: #134e4a;
          color: #2dd4bf;
          padding: 0.14rem 0.38rem;
          border-radius: 4px;
          box-shadow: 0 0 8px #2dd4bf30;
          animation: pulse-badge 2.5s ease-in-out infinite;
        }

        @keyframes pulse-badge {
          0%, 100% { box-shadow: 0 0 8px #2dd4bf30; }
          50%       { box-shadow: 0 0 16px #2dd4bf60; }
        }

        .cal-day-num.is-today {
          color: #2dd4bf;
          text-shadow: 0 0 12px #2dd4bf50;
        }

        /* Date header inside cell */
        .cal-date-block {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding-bottom: 0.4rem;
          border-bottom: 1px solid #141c28;
        }

        .cal-date-main { display: flex; align-items: baseline; gap: 0.28rem; }

        .cal-day-num {
          font-family: 'Geist Mono', monospace;
          font-size: 1.1rem;
          font-weight: 600;
          color: #e2e8f0;
          line-height: 1;
        }

        .cal-month-year { display: flex; flex-direction: column; line-height: 1.15; }

        .cal-month-sm {
          font-family: 'Geist Mono', monospace;
          font-size: 0.55rem;
          font-weight: 600;
          color: #2dd4bf;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .cal-year-sm {
          font-family: 'Geist Mono', monospace;
          font-size: 0.5rem;
          color: #1e2a38;
          letter-spacing: 0.05em;
        }

        .cal-day-type {
          font-family: 'Geist Mono', monospace;
          font-size: 0.48rem;
          color: #2e3a4e;
          text-align: right;
          letter-spacing: 0.03em;
          line-height: 1.5;
          max-width: 50px;
          white-space: pre-line;
        }

        /* Subjects */
        .cal-subjects { display: flex; flex-direction: column; gap: 0.3rem; flex: 1; }

        .cal-subject-card {
          background: #080b10;
          border: 1px solid #141c28;
          border-left: 2px solid #1e2433;
          border-radius: 7px;
          padding: 0.35rem 0.45rem;
          display: flex;
          flex-direction: column;
          gap: 0.28rem;
          transition: border-color 0.15s, background 0.15s;
        }

        .cal-subject-card:hover { background: #0d1117; border-color: #1e2a38; }

        .cal-subject-header { display: flex; align-items: center; justify-content: space-between; gap: 0.2rem; }

        .cal-subject-name {
          font-size: 0.65rem;
          font-weight: 700;
          color: #94a3b8;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.15s;
          letter-spacing: 0.01em;
        }

        .cal-subject-name:hover { color: #2dd4bf; }

        .cal-subject-type {
          font-family: 'Geist Mono', monospace;
          font-size: 0.45rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.08rem 0.25rem;
          border-radius: 3px;
          flex-shrink: 0;
        }

        .type-theory { background: #0d2926; color: #2dd4bf; }
        .type-lab    { background: #0d1f3c; color: #60a5fa; }

        /* Status buttons */
        .cal-status-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.15rem; }

        .status-btn {
          font-family: 'Geist Mono', monospace;
          font-size: 0.44rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          padding: 0.2rem 0;
          border-radius: 4px;
          border: 1px solid #141c28;
          background: #0d1117;
          color: #1e2a38;
          cursor: pointer;
          text-align: center;
          transition: all 0.15s;
        }

        .status-btn:hover { background: #141c28; color: #4a5568; }

        .status-present-active  { background: #0d2926 !important; border-color: #134e4a !important; color: #2dd4bf !important; }
        .status-absent-active   { background: #2d1515 !important; border-color: #7f1d1d !important; color: #f87171 !important; }
        .status-od-active       { background: #2d1d0d !important; border-color: #7c2d12 !important; color: #fb923c !important; }
        .status-cancel-active   { background: #1a1a3e !important; border-color: #312e81 !important; color: #818cf8 !important; }

        .dot-present   { border-left-color: #2dd4bf !important; }
        .dot-absent    { border-left-color: #f87171 !important; }
        .dot-od        { border-left-color: #fb923c !important; }
        .dot-cancelled { border-left-color: #818cf8 !important; }

        .cal-no-class {
          font-family: 'Geist Mono', monospace;
          font-size: 0.52rem;
          color: #141c28;
          margin: auto;
          letter-spacing: 0.06em;
        }
      `}</style>

      <div className="cal-root">
        {/* ── Month nav + Jump to Now ── */}
        <div className="cal-nav">
          <div className="cal-nav-scroll">
            {months.map(([key, days]) => (
              <button
                key={key}
                className={`cal-month-btn ${activeMonth === key ? "active" : ""}`}
                onClick={() => setActiveMonth(key)}
              >
                {getMonthShort(days[0].date)}
              </button>
            ))}
          </div>
          {todayMonthKey && (
            <button className="cal-now-btn" onClick={jumpToNow}>
              ⟳ Now
            </button>
          )}
        </div>

        {/* ── Single active month ── */}
        {activeDays.length > 0 && (
          <div className="cal-month-block">
            <div className="cal-month-header">
              <span className="cal-month-title">{monthLabel}</span>
            </div>

            <div className="cal-weekday-row">
              {WEEKDAY_LABELS.map((lbl, i) => (
                <div
                  key={lbl}
                  className={`cal-weekday-label ${i >= 5 ? "is-weekend" : ""}`}
                >
                  {lbl}
                </div>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div key={wi} className="cal-week-row">
                {week.map((day, di) => {
                  if (!day) {
                    return (
                      <div
                        key={`empty-${wi}-${di}`}
                        className="cal-cell is-empty"
                      />
                    );
                  }

                  const isToday = day.date === todayISO;
                  const isWeekend = di >= 5;
                  const effectiveWeekday = getEffectiveWeekday(day);
                  const subjectIds: string[] =
                    timetable[effectiveWeekday] || [];
                  const isInstructional = day.type === "instructional";
                  const { day: dayNum, month, year } = formatDate(day.date);

                  return (
                    <div
                      key={day.date}
                      ref={isToday ? todayRef : null}
                      className={`cal-cell${!isInstructional ? " non-instructional" : ""}${isWeekend ? " is-weekend" : ""}${isToday ? " is-today" : ""}`}
                    >
                      {isToday && (
                        <span className="cal-today-badge">Today</span>
                      )}

                      <div className="cal-date-block">
                        <div className="cal-date-main">
                          <span
                            className={`cal-day-num${isToday ? " is-today" : ""}`}
                          >
                            {dayNum}
                          </span>
                          <div className="cal-month-year">
                            <span className="cal-month-sm">{month}</span>
                            <span className="cal-year-sm">{year}</span>
                          </div>
                        </div>
                        <span className="cal-day-type">
                          {day.title
                            ?.replace(" Day Order", "\nOrder")
                            .replace("Instructional", "Inst.")}
                        </span>
                      </div>

                      <div className="cal-subjects">
                        {!isInstructional && (
                          <span className="cal-no-class">—</span>
                        )}

                        {isInstructional &&
                          subjectIds.map((subjectId: string) => {
                            const sub = subjects.find(
                              (s: Subject) => s.id === subjectId,
                            );
                            if (!sub) return null;

                            const currentStatus: string | undefined =
                              attendance?.[day.date]?.[sub.id];
                            const dotClass = currentStatus
                              ? `dot-${currentStatus}`
                              : "";

                            return (
                              <div
                                key={sub.id}
                                className={`cal-subject-card ${dotClass}`}
                              >
                                <div className="cal-subject-header">
                                  <span
                                    className="cal-subject-name"
                                    onClick={() => openModal(sub)}
                                    title={sub.name}
                                  >
                                    {sub.name}
                                  </span>
                                  <span
                                    className={`cal-subject-type ${sub.type === "lab" ? "type-lab" : "type-theory"}`}
                                  >
                                    {sub.type === "lab" ? "Lab" : "Th"}
                                  </span>
                                </div>

                                <div className="cal-status-row">
                                  {["present", "absent", "od", "cancelled"].map(
                                    (status) => {
                                      const cfg = STATUS_CONFIG[status];
                                      const isActive = currentStatus === status;
                                      return (
                                        <button
                                          key={status}
                                          onClick={() =>
                                            toggleStatus(
                                              day.date,
                                              sub.id,
                                              status,
                                            )
                                          }
                                          className={`status-btn ${isActive ? cfg.activeClass : ""}`}
                                          title={cfg.label}
                                        >
                                          {status === "cancelled"
                                            ? "cncl"
                                            : status === "present"
                                              ? "pres"
                                              : status}
                                        </button>
                                      );
                                    },
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
