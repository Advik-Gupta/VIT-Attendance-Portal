// ==========================================================
// VIT Vellore – Winter Semester 2025-26 (FULL DATASET)
// COMPLETE + DAY ORDER SUPPORT (FINAL CORRECT VERSION)
// ==========================================================

/* ================= TYPES ================= */

export type DayType =
  | "instructional"
  | "holiday"
  | "exam"
  | "vacation"
  | "festival"
  | "no_instruction"
  | "academic_process";

export interface DailyCalendarEntry {
  date: string; // YYYY-MM-DD
  dayName: string;
  type: DayType;
  title: string;
  dayOrder?: string; // 🔥 IMPORTANT FOR SATURDAY OVERRIDES
}

/* ================= META ================= */

export const META = {
  university: "Vellore Institute of Technology",
  campus: "VIT Vellore",
  semester: "Winter Semester 2025-26",
  circularRef: "VIT/VLR/Acad/2025/015",
  issuedOn: "2025-11-21",
  instructionalDays: {
    CAT_I: 28,
    CAT_II: 28,
    FAT: 19,
    TOTAL: 75,
  },
};

/* ================= IMPORTANT RANGES ================= */

const RANGES = {
  winterVacation: ["2025-12-21", "2026-01-04"],
  pongal: ["2026-01-15", "2026-01-18"],
  cat1: ["2026-01-27", "2026-02-02"],
  withdraw: ["2026-02-16", "2026-02-18"],
  riviera: ["2026-02-26", "2026-03-01"],
  cat2: ["2026-03-15", "2026-03-23"],
  finalLab: ["2026-04-11", "2026-04-17"],
};

/* ================= DAY ORDER OVERRIDES ================= */
/* 🔥 CRITICAL FOR CORRECT ATTENDANCE CALCULATION */

const DAY_ORDER_OVERRIDES: Record<string, string> = {
  // December
  "2025-12-06": "Monday Day Order",
  "2025-12-13": "Thursday Day Order",
  "2025-12-20": "Wednesday Day Order",

  // January
  "2026-01-10": "Thursday Day Order",
  "2026-01-24": "Friday Day Order",

  // February
  "2026-02-14": "Monday Day Order",

  // April
  "2026-04-11": "Tuesday Day Order",
};

/* ================= SINGLE DAY SPECIALS ================= */

const SPECIAL_DAYS: Record<string, { type: DayType; title: string }> = {
  "2025-12-05": {
    type: "instructional",
    title: "First Instructional Day",
  },
  "2026-01-26": {
    type: "holiday",
    title: "Republic Day",
  },
  "2026-03-04": {
    type: "festival",
    title: "Holi",
  },
  "2026-03-19": {
    type: "holiday",
    title: "Telugu New Year’s Day",
  },
  "2026-03-21": {
    type: "holiday",
    title: "Ramzan",
  },
  "2026-04-03": {
    type: "no_instruction",
    title: "Good Friday",
  },
  "2026-04-10": {
    type: "instructional",
    title: "Last Instructional Day - Laboratory Classes",
  },
  "2026-04-14": {
    type: "holiday",
    title: "Tamil New Year / Dr. B.R. Ambedkar Birthday",
  },
  "2026-04-17": {
    type: "instructional",
    title: "Last Instructional Day - Theory Classes",
  },
};

/* ================= UTIL FUNCTIONS ================= */

function isWithinRange(date: string, [start, end]: [string, string]): boolean {
  return date >= start && date <= end;
}

function getDayName(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

/* ================= FULL DAILY DATASET ================= */

export function generateFullCalendar(): DailyCalendarEntry[] {
  const start = new Date("2025-12-05");
  const end = new Date("2026-04-20");

  const calendar: DailyCalendarEntry[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().split("T")[0];
    const dayName = getDayName(d);

    const overrideDayOrder = DAY_ORDER_OVERRIDES[iso];

    // 🔹 Special Single Days
    if (SPECIAL_DAYS[iso]) {
      calendar.push({
        date: iso,
        dayName,
        type: SPECIAL_DAYS[iso].type,
        title: SPECIAL_DAYS[iso].title,
        dayOrder: overrideDayOrder,
      });
      continue;
    }

    // 🔹 Ranges
    if (isWithinRange(iso, RANGES.winterVacation as any)) {
      calendar.push({
        date: iso,
        dayName,
        type: "vacation",
        title: "Winter Vacation",
      });
    } else if (isWithinRange(iso, RANGES.pongal as any)) {
      calendar.push({
        date: iso,
        dayName,
        type: "holiday",
        title: "Pongal Holidays",
      });
    } else if (isWithinRange(iso, RANGES.cat1 as any)) {
      calendar.push({
        date: iso,
        dayName,
        type: "exam",
        title: "CAT - I",
      });
    } else if (isWithinRange(iso, RANGES.withdraw as any)) {
      calendar.push({
        date: iso,
        dayName,
        type: "academic_process",
        title: "Course Withdraw Option",
      });
    } else if (isWithinRange(iso, RANGES.riviera as any)) {
      calendar.push({
        date: iso,
        dayName,
        type: "no_instruction",
        title: "Riviera 2026",
      });
    } else if (isWithinRange(iso, RANGES.cat2 as any)) {
      calendar.push({
        date: iso,
        dayName,
        type: "exam",
        title: "CAT - II",
      });
    } else if (isWithinRange(iso, RANGES.finalLab as any)) {
      calendar.push({
        date: iso,
        dayName,
        type: "exam",
        title: "Final Assessment - Lab",
        dayOrder: overrideDayOrder,
      });
    } else {
      // 🔥 Default = Instructional Day
      calendar.push({
        date: iso,
        dayName,
        type: "instructional",
        title: overrideDayOrder
          ? `Instructional Day (${overrideDayOrder})`
          : "Instructional Day",
        dayOrder: overrideDayOrder,
      });
    }
  }

  return calendar;
}

/* ================= EXPORT ================= */

export const DAILY_CALENDAR = generateFullCalendar();
