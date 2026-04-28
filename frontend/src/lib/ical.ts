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

function getNthWeekdayOfMonth(
  year: number,
  monthIndex: number,
  weekday: number,
  occurrence: number
): Date {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const firstWeekdayOffset = (weekday - firstOfMonth.getDay() + 7) % 7;
  const dayOfMonth = 1 + firstWeekdayOffset + (occurrence - 1) * 7;
  return new Date(year, monthIndex, dayOfMonth);
}

function getLastWeekdayOfMonth(year: number, monthIndex: number, weekday: number): Date {
  const lastOfMonth = new Date(year, monthIndex + 1, 0);
  const offset = (lastOfMonth.getDay() - weekday + 7) % 7;
  return new Date(year, monthIndex, lastOfMonth.getDate() - offset);
}

function getSemesterStartDate(course: Course): Date {
  const year = Number(course.year) || new Date().getFullYear();
  const semester = String(course.semester || "").toLowerCase();

  if (semester.includes("spring")) {
    // Third Monday in January.
    return getNthWeekdayOfMonth(year, 0, 1, 3);
  }
  if (semester.includes("fall")) {
    // Last Monday in August.
    return getLastWeekdayOfMonth(year, 7, 1);
  }

  // Fallback for unrecognized terms.
  return getNthWeekdayOfMonth(year, 0, 1, 3);
}

function getDateForWeekdayAndTime(weekStart: Date, icalDay: string, time: string): Date {
  const weekdayIndexByIcal: Record<string, number> = {
    SU: 0,
    MO: 1,
    TU: 2,
    WE: 3,
    TH: 4,
    FR: 5,
    SA: 6,
  };

  const targetDay = weekdayIndexByIcal[icalDay];
  const [hours, minutes, seconds] = parseTimeParts(time);

  const base = new Date(weekStart);
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

  const semesterStart = getSemesterStartDate(course);
  const startDate = getDateForWeekdayAndTime(semesterStart, icalDay, String(slot.start_time));
  const endDate = getDateForWeekdayAndTime(semesterStart, icalDay, String(slot.end_time));

  const nowStamp = formatDateStamp(new Date());
  const uid = `${course.id}-${index}-${Date.now()}@wafflehouse`;
  const summary = `${course.subject} ${course.code}-${course.section}: ${course.name}`;
  const description = `${course.semester} ${course.year} | Credits: ${course.creditHours}`;

  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${nowStamp}`,
    `DTSTART;TZID=America/New_York:${formatLocalDateTime(startDate)}`,
    `DTEND;TZID=America/New_York:${formatLocalDateTime(endDate)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${icalDay};COUNT=16`,
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
    "BEGIN:VTIMEZONE",
    "TZID:America/New_York",
    "X-LIC-LOCATION:America/New_York",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:-0500",
    "TZOFFSETTO:-0400",
    "TZNAME:EDT",
    "DTSTART:19700308T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:-0400",
    "TZOFFSETTO:-0500",
    "TZNAME:EST",
    "DTSTART:19701101T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
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
