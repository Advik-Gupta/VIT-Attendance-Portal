export type DayType =
  | "instructional"
  | "holiday"
  | "exam"
  | "vacation"
  | "festival"
  | "no_instruction";

export type AttendanceStatus = "present" | "absent" | "od" | "cancelled";

export interface Subject {
  id: string;
  name: string;
  type: "theory" | "lab";
}

export interface DailyCalendarEntry {
  date: string;
  dayName: string;
  type: DayType;
  title: string;
  dayOrder?: number; // override weekday if needed
}

export interface AttendanceRecord {
  [date: string]: {
    [subjectId: string]: AttendanceStatus;
  };
}
