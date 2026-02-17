"use client";

import { useState, useEffect } from "react";
import { loadFromStorage } from "@/app/lib/storage";
import TimetableEditor from "@/app/components/TimetableEditor";
import CalendarView from "@/app/components/CalendarView";
import AttendanceModal from "@/app/components/AttendanceModal";
import { DAILY_CALENDAR } from "@/app/vit-winter-2025-26-complete";

const defaultTimetable = {
  1: [], // Monday
  2: [], // Tuesday
  3: [], // Wednesday
  4: [], // Thursday
  5: [], // Friday
};

export default function Page() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>({});
  const [timetable, setTimetable] = useState<any>(defaultTimetable);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  useEffect(() => {
    setSubjects(loadFromStorage("subjects", []));
    setAttendance(loadFromStorage("attendance", {}));
    setTimetable(loadFromStorage("timetable", defaultTimetable));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <TimetableEditor
        subjects={subjects}
        setSubjects={setSubjects}
        timetable={timetable}
        setTimetable={setTimetable}
      />

      <CalendarView
        calendar={DAILY_CALENDAR}
        subjects={subjects}
        timetable={timetable}
        attendance={attendance}
        setAttendance={setAttendance}
        openModal={setSelectedSubject}
      />

      <AttendanceModal
        subject={selectedSubject}
        calendar={DAILY_CALENDAR}
        attendance={attendance}
        timetable={timetable}
        onClose={() => setSelectedSubject(null)}
      />
    </div>
  );
}
