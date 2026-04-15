import type { Course, Timeslot } from "@/lib/types";

const DAY_TO_ICAL: Record<string, string> = {
  M: "MO",
  MON: "MO",
  MONDAY: "MO",
  T: "TU",
  TUE: "TU",
  TUESDAY: "TU",
  W: "WE",
  WED: "WE",
  WEDNESDAY: "WE",
  R: "TH",
  TH: "TH",
  THU: "TH",
  THUR: "TH",
  THURSDAY: "TH",
  F: "FR",
  FRI: "FR",
  FRIDAY: "FR",
  S: "SA",
  SAT: "SA",
  SATURDAY: "SA",
  U: "SU",
  SUN: "SU",
  SUNDAY: "SU",
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatDateStamp(date: Date): string {
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hour = pad(date.getUTCHours());
  const minute = pad(date.getUTCMinutes());
  const second = pad(date.getUTCSeconds());
  return `${year}${month}${day}T${hour}${minute}${second}Z`;
}

function formatLocalDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());
  return `${year}${month}${day}T${hour}${minute}${second}`;
}

function parseTimeParts(time: string): [number, number, number] {
  const [hourRaw = "0", minuteRaw = "0", secondRaw = "0"] = time.split(":");
  return [Number(hourRaw), Number(minuteRaw), Number(secondRaw)];
}

function getTermEndDate(course: Course): Date {
  const year = Number(course.year) || new Date().getFullYear();
  const semester = String(course.semester || "").toLowerCase();

  if (semester.includes("spring")) {
    return new Date(year, 4, 15, 23, 59, 59);
  }
  if (semester.includes("summer")) {
    return new Date(year, 7, 15, 23, 59, 59);
  }
  return new Date(year, 11, 15, 23, 59, 59);
}

function getDateForWeekdayAndTime(icalDay: string, time: string): Date {
  const weekdayIndexByIcal: Record<string, number> = {
    SU: 0,
    MO: 1,
    TU: 2,
    WE: 3,
    TH: 4,
    FR: 5,
    SA: 6,
  };

  const now = new Date();
  const targetDay = weekdayIndexByIcal[icalDay];
  const [hours, minutes, seconds] = parseTimeParts(time);

  const base = new Date(now);
  base.setHours(0, 0, 0, 0);
  const diff = (targetDay - base.getDay() + 7) % 7;
  base.setDate(base.getDate() + diff);
  base.setHours(hours, minutes, seconds, 0);

  return base;
}

function buildEvent(course: Course, slot: Timeslot, index: number): string[] | null {
  const normalizedDay = String(slot.day || "").trim().toUpperCase();
  const icalDay = DAY_TO_ICAL[normalizedDay];
  if (!icalDay) return null;

  const startDate = getDateForWeekdayAndTime(icalDay, String(slot.start_time));
  const endDate = getDateForWeekdayAndTime(icalDay, String(slot.end_time));
  const termEnd = getTermEndDate(course);

  const nowStamp = formatDateStamp(new Date());
  const uid = `${course.id}-${index}-${Date.now()}@wafflehouse`;
  const summary = `${course.subject} ${course.code}-${course.section}: ${course.name}`;
  const description = `${course.semester} ${course.year} | Credits: ${course.creditHours}`;

  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${nowStamp}`,
    `DTSTART:${formatLocalDateTime(startDate)}`,
    `DTEND:${formatLocalDateTime(endDate)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${icalDay};UNTIL=${formatDateStamp(termEnd)}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(course.location || "TBD")}`,
    "END:VEVENT",
  ];
}

export function buildScheduleIcs(schedule: Course[]): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "PRODID:-//WaffleHouse//Schedule Export//EN",
    "METHOD:PUBLISH",
  ];

  schedule.forEach((course) => {
    (course.times || []).forEach((slot, index) => {
      const eventLines = buildEvent(course, slot, index);
      if (eventLines) {
        lines.push(...eventLines);
      }
    });
  });

  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

export function downloadScheduleIcs(schedule: Course[], filename = "wafflehouse-schedule.ics"): void {
  const ics = buildScheduleIcs(schedule);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
