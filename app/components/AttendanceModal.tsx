import {
  calculateSubjectStats,
  safeAbsences,
  EXAM_DATES,
  getAttendanceHistory,
} from "@/app/lib/attendanceLogic";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-GB", { month: "short" }).toUpperCase();
  return `${day} ${month}`;
}

export default function AttendanceModal({
  subject,
  calendar,
  attendance,
  timetable,
  onClose,
}: any) {
  if (!subject) return null;

  const todayISO = new Date().toISOString().split("T")[0];

  const overallStats = calculateSubjectStats(
    subject,
    calendar,
    attendance,
    timetable,
  );
  const presentStats = calculateSubjectStats(
    subject,
    calendar,
    attendance,
    timetable,
    todayISO,
  );
  const cat1Stats = calculateSubjectStats(
    subject,
    calendar,
    attendance,
    timetable,
    EXAM_DATES.CAT1_START,
  );
  const cat2Stats = calculateSubjectStats(
    subject,
    calendar,
    attendance,
    timetable,
    EXAM_DATES.CAT2_START,
  );

  const overallHistory = getAttendanceHistory(
    subject,
    calendar,
    attendance,
    timetable,
  );
  const presentHistory = getAttendanceHistory(
    subject,
    calendar,
    attendance,
    timetable,
    todayISO,
  );
  const cat1History = getAttendanceHistory(
    subject,
    calendar,
    attendance,
    timetable,
    EXAM_DATES.CAT1_START,
  );
  const cat2History = getAttendanceHistory(
    subject,
    calendar,
    attendance,
    timetable,
    EXAM_DATES.CAT2_START,
  );

  const cat1Safe = safeAbsences(cat1Stats.total, cat1Stats.absent);
  const cat2Safe = safeAbsences(cat2Stats.total, cat2Stats.absent);

  const getPctColor = (p: number) => {
    if (p >= 85) return "#2dd4bf";
    if (p >= 75) return "#fbbf24";
    return "#f87171";
  };

  const getPctBg = (p: number) => {
    if (p >= 85) return "#0d2926";
    if (p >= 75) return "#2d2208";
    return "#2d1515";
  };

  const getPctBorder = (p: number) => {
    if (p >= 85) return "#134e4a";
    if (p >= 75) return "#7c2d12";
    return "#7f1d1d";
  };

  const statBlocks = [
    {
      label: "Overall Semester",
      stats: overallStats,
      extra: null,
    },
    {
      label: "Till Today",
      stats: presentStats,
      extra: null,
    },
    {
      label: "Before CAT 1",
      stats: cat1Stats,
      extra: { label: "Safe absences left", value: cat1Safe },
    },
    {
      label: "Before CAT 2",
      stats: cat2Stats,
      extra: { label: "Safe absences left", value: cat2Safe },
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600&family=Syne:wght@400;500;600;700;800&display=swap');

        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 1.5rem;
        }

        .modal-box {
          background: #0f1117;
          border: 1px solid #1e2433;
          border-radius: 20px;
          width: 100%;
          max-width: 860px;
          max-height: 88vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          font-family: 'Syne', sans-serif;
          scrollbar-width: thin;
          scrollbar-color: #1e2433 transparent;
        }

        .modal-box::-webkit-scrollbar { width: 4px; }
        .modal-box::-webkit-scrollbar-track { background: transparent; }
        .modal-box::-webkit-scrollbar-thumb { background: #1e2433; border-radius: 4px; }

        /* Header */
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem 1.25rem;
          border-bottom: 1px solid #1e2433;
          position: sticky;
          top: 0;
          background: #0f1117;
          z-index: 2;
        }

        .modal-title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .modal-subject-name {
          font-size: 1.3rem;
          font-weight: 800;
          color: #e2e8f0;
          letter-spacing: 0.02em;
        }

        .modal-subject-badge {
          font-family: 'Geist Mono', monospace;
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.18rem 0.5rem;
          border-radius: 5px;
        }

        .badge-theory { background: #0d2926; color: #2dd4bf; }
        .badge-lab    { background: #0d1f3c; color: #60a5fa; }

        .modal-close-btn {
          background: #161b27;
          border: 1px solid #1e2433;
          border-radius: 8px;
          color: #4a5568;
          font-family: 'Geist Mono', monospace;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          padding: 0.45rem 1rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .modal-close-btn:hover {
          background: #1e2433;
          color: #94a3b8;
          border-color: #2a3347;
        }

        /* Body */
        .modal-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          flex: 1;
        }

        /* ── Left: Stats ── */
        .modal-stats-col {
          padding: 1.5rem 2rem;
          border-right: 1px solid #1e2433;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .modal-section-label {
          font-family: 'Geist Mono', monospace;
          font-size: 0.55rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #2e3a4e;
          margin-bottom: 0.5rem;
        }

        .stat-block {
          background: #0a0d13;
          border: 1px solid #1a2030;
          border-radius: 12px;
          padding: 1rem 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .stat-block-title {
          font-size: 0.7rem;
          font-weight: 700;
          color: #4a5568;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-family: 'Geist Mono', monospace;
        }

        .stat-pct-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-pct-pill {
          font-family: 'Geist Mono', monospace;
          font-size: 1.4rem;
          font-weight: 600;
          line-height: 1;
        }

        .stat-pct-bar-wrap {
          flex: 1;
          height: 4px;
          background: #141c28;
          border-radius: 4px;
          margin: 0 0.75rem;
          overflow: hidden;
        }

        .stat-pct-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.4s ease;
        }

        .stat-pills-row {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .stat-mini-pill {
          font-family: 'Geist Mono', monospace;
          font-size: 0.58rem;
          font-weight: 500;
          padding: 0.2rem 0.55rem;
          border-radius: 5px;
          letter-spacing: 0.04em;
        }

        .pill-total     { background: #161b27; color: #4a5568;  border: 1px solid #1e2433; }
        .pill-present   { background: #0d2926; color: #2dd4bf;  border: 1px solid #134e4a; }
        .pill-absent    { background: #2d1515; color: #f87171;  border: 1px solid #7f1d1d; }
        .pill-od        { background: #2d1d0d; color: #fb923c;  border: 1px solid #7c2d12; }
        .pill-safe      { background: #1a1a3e; color: #818cf8;  border: 1px solid #312e81; }

        /* ── Right: History ── */
        .modal-history-col {
          padding: 1.5rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .history-block {
          background: #0a0d13;
          border: 1px solid #1a2030;
          border-radius: 12px;
          padding: 0.9rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .history-block-title {
          font-family: 'Geist Mono', monospace;
          font-size: 0.55rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #2e3a4e;
        }

        .history-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }

        .history-chip {
          font-family: 'Geist Mono', monospace;
          font-size: 0.6rem;
          font-weight: 600;
          padding: 0.22rem 0.6rem;
          border-radius: 5px;
          letter-spacing: 0.04em;
        }

        .chip-absent    { background: #2d1515; color: #f87171; border: 1px solid #7f1d1d40; }
        .chip-od        { background: #2d1d0d; color: #fb923c; border: 1px solid #7c2d1240; }

        .history-empty {
          font-family: 'Geist Mono', monospace;
          font-size: 0.58rem;
          color: #1e2a38;
          letter-spacing: 0.06em;
        }
      `}</style>

      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title-group">
              <span className="modal-subject-name">{subject.name}</span>
              <span
                className={`modal-subject-badge ${subject.type === "lab" ? "badge-lab" : "badge-theory"}`}
              >
                {subject.type}
              </span>
            </div>
            <button className="modal-close-btn" onClick={onClose}>
              ✕ Close
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {/* ── Left: Stats ── */}
            <div className="modal-stats-col">
              <span className="modal-section-label">Attendance Breakdown</span>

              {statBlocks.map(({ label, stats, extra }) => {
                const pct = stats.percentage;
                const color = getPctColor(pct);
                const bg = getPctBg(pct);
                const border = getPctBorder(pct);

                return (
                  <div
                    key={label}
                    className="stat-block"
                    style={{ borderColor: border + "40" }}
                  >
                    <span className="stat-block-title">{label}</span>

                    <div className="stat-pct-row">
                      <span className="stat-pct-pill" style={{ color }}>
                        {pct}%
                      </span>
                      <div className="stat-pct-bar-wrap">
                        <div
                          className="stat-pct-bar-fill"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            background: color,
                            opacity: 0.7,
                          }}
                        />
                      </div>
                    </div>

                    <div className="stat-pills-row">
                      <span className="stat-mini-pill pill-total">
                        {stats.total} total
                      </span>
                      <span className="stat-mini-pill pill-present">
                        {stats.present} present
                      </span>
                      <span className="stat-mini-pill pill-absent">
                        {stats.absent} absent
                      </span>
                      {stats.od > 0 && (
                        <span className="stat-mini-pill pill-od">
                          {stats.od} OD
                        </span>
                      )}
                      {extra && (
                        <span className="stat-mini-pill pill-safe">
                          {extra.value} safe left
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Right: History ── */}
            <div className="modal-history-col">
              <span className="modal-section-label">Absence / OD Log</span>

              {[
                { title: "Overall Semester", history: overallHistory },
                { title: "Till Today", history: presentHistory },
                { title: "Before CAT 1", history: cat1History },
                { title: "Before CAT 2", history: cat2History },
              ].map(({ title, history }) => (
                <HistoryBlock key={title} title={title} history={history} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── History Block ── */
function HistoryBlock({ title, history }: any) {
  return (
    <div className="history-block">
      <span className="history-block-title">{title}</span>

      {history.length === 0 ? (
        <span className="history-empty">— no absences or OD</span>
      ) : (
        <div className="history-chips">
          {history.map((item: any) => (
            <span
              key={item.date}
              className={`history-chip ${item.status === "absent" ? "chip-absent" : "chip-od"}`}
              title={item.status}
            >
              {formatDate(item.date)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
