import { useState, useRef, useMemo, useEffect, useCallback } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import BigCalendar from "@/components/BigCalendar"
import type { CourseEvent } from "@/components/BigCalendar"
import { DataTable } from "@/components/DataTable"
import Footer from "@/components/Footer.tsx"
import type { Mode, Course } from "@/lib/types"
import * as React from "react";
import SearchCalendarBar from "@/components/SearchCalendarBar.tsx";
import FilterGroup from "@/components/FilterGroup.tsx";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { formatTime, toMinutes, cn} from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { downloadScheduleIcs } from "@/lib/ical"

const QUOTES = [
    { text: "The fear of the Lord is the beginning of wisdom, and knowledge of the Holy One is understanding.", author: "Proverbs 9:10" },
    { text: "Education is simply the soul of a society as it passes from one generation to another.", author: "G.K. Chesterton" },
    { text: "The task of the modern educator is not to cut down jungles, but to irrigate deserts.", author: "C.S. Lewis" },
    { text: "All truth is God's truth.", author: "Augustine of Hippo" },
    { text: "The heart cannot delight in what the mind does not regard as true.", author: "J. Gresham Machen" },
    { text: "Education without values, as useful as it is, seems rather to make man a more clever devil.", author: "C.S. Lewis" },
    { text: "The glory of God is a human being fully alive.", author: "Irenaeus of Lyon" },
    { text: "An educated mind is one that can entertain a thought without accepting it.", author: "Aristotle" },
]

/**
 * Returns true if the candidate course has a timeslot that overlaps with any
 * timeslot of any course already in the schedule.
 *
 * Two timeslots overlap if they share a day AND one starts before the other ends:
 *   A overlaps B  iff  A.start < B.end  &&  A.end > B.start
 *
 * NOTE: callers are responsible for excluding the candidate from the schedule
 * before calling this, otherwise a course will appear to conflict with itself.
 */
function courseConflicts(candidate: any, schedule: any[]): boolean {
    for (const scheduled of schedule) {
        for (const candidateSlot of (candidate.times || [])) {
            for (const scheduledSlot of (scheduled.times || [])) {
                if (String(candidateSlot.day) !== String(scheduledSlot.day)) continue;

                const candStart  = toMinutes(candidateSlot.start_time);
                const candEnd    = toMinutes(candidateSlot.end_time);
                const schedStart = toMinutes(scheduledSlot.start_time);
                const schedEnd   = toMinutes(scheduledSlot.end_time);

                if (candStart < schedEnd && candEnd > schedStart) return true;
            }
        }
    }
    return false;
}

/** Transform backend Course objects into CourseEvents for BigCalendar */
function toEvents(courses: any[]): CourseEvent[] {
    return courses.flatMap((course) =>
        (course.times || []).map((slot: any) => ({
            daysOfWeek: [String(slot.day)],
            startTime: Array.isArray(slot.start_time) ? formatTime(slot.start_time) : String(slot.start_time),
            endTime: Array.isArray(slot.end_time) ? formatTime(slot.end_time) : String(slot.end_time),
            courseName: course.name,
            courseCode: String(course.code),
            courseDepartment: course.subject,
            courseSection: typeof course.section === 'string' ? course.section : String.fromCharCode(course.section),
            courseLocation: course.location || '',
        }))
    );
}

export default function Home() {
    const navigate = useNavigate()
    const [results, setResults] = useState<Course[]>([])
    const [hasSearched, setHasSearched] = useState(false)
    const [mode, setMode] = useState<Mode>("search")
    const [events, setEvents] = useState<CourseEvent[]>([])
    const [schedule, setSchedule] = useState<Course[]>([])
    const filterFormRef = useRef<HTMLFormElement>(null)
    const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], [])

    // Check authentication on mount and redirect to Auth page if not authenticated
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/auth");
            }
        };
        checkAuth();
    }, [navigate]);

    // Listen for auth state changes and redirect if logged out
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                navigate("/auth");
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [navigate]);

    /**
     * Transient notification shown at the top of the page after save/load.
     * Cleared automatically after 3 seconds.
     */
    const [toast, setToast] = React.useState<{ message: string; ok: boolean } | null>(null);
    const showToast = useCallback((message: string, ok: boolean) => {
        setToast({ message, ok });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const fetchSchedule = useCallback(() => {
        fetch("http://localhost:7001/schedule")
            .then((res) => res.json())
            .then((data) => {
                setSchedule(data);
                setEvents(toEvents(data));
            })
            .catch((err) => console.error("Failed to fetch schedule:", err));
    }, []);

    /**
     * Fetch a single course by ID and replace its entry in `results` state.
     * Called after add/remove so that openSeats updates in the search table
     * without needing to re-run the entire search query.
     */
    const refreshCourseInResults = useCallback(async (id: number) => {
        try {
            const res = await fetch(`http://localhost:7001/course/${id}`);
            if (!res.ok) return;
            const updated = await res.json();
            setResults(prev => prev.map(c => c.id === id ? updated : c));
        } catch (err) {
            console.error("Failed to refresh course in results:", err);
        }
    }, []);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    /**
     * IDs of courses that are already in the user's schedule.
     * Checked before conflict detection — a course should not be flagged
     * as conflicting with itself.
     */
    const scheduledIds = useMemo<Set<number>>(() => {
        return new Set(schedule.map((c: any) => c.id));
    }, [schedule]);

    /**
     * IDs of courses that conflict with the schedule but are NOT already in it.
     * Courses already in the schedule are handled separately (they get a Remove
     * button instead of being flagged as conflicts).
     */
    const conflictingIds = useMemo<Set<number>>(() => {
        const ids = new Set<number>();
        for (const course of results) {
            // Skip courses already in the schedule — they would conflict with
            // themselves by definition and are handled by scheduledIds instead
            if (scheduledIds.has(course.id)) continue;
            if (courseConflicts(course, schedule)) {
                ids.add(course.id);
            }
        }
        return ids;
    }, [results, schedule, scheduledIds]);

    /**
     * Shared remove handler used in both the search results table and the
     * schedule table below the calendar.
     */
    const handleRemove = useCallback(async (course: any) => {
        try {
            const res = await fetch("http://localhost:7001/course", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(course),
            });
            if (!res.ok) {
                const body = await res.text();
                console.error(`Failed to remove course: ${res.status} ${res.statusText}`, body);
                return;
            }
            const removed: boolean = await res.json();
            if (removed) {
                console.log("Course removed successfully:", course.name);
                fetchSchedule();
                refreshCourseInResults(course.id);
            } else {
                console.warn("Course was not removed (not in schedule?):", course.name);
            }
        } catch (err) {
            console.error("Error removing course:", err);
        }
    }, [fetchSchedule, refreshCourseInResults]);

    // Columns for the search results table
    const columns: ColumnDef<Course>[] = [
        {
            accessorKey: "subject",
            header: "Dept",
            cell: ({ row }) => {
                const dimmed = scheduledIds.has(row.original.id) || conflictingIds.has(row.original.id);
                return <span className={dimmed ? "opacity-30" : ""}>{row.original.subject}</span>;
            },
        },
        {
            accessorKey: "code",
            header: "Code",
            cell: ({ row }) => {
                const dimmed = scheduledIds.has(row.original.id) || conflictingIds.has(row.original.id);
                return <span className={dimmed ? "opacity-30" : ""}>{row.original.code}</span>;
            },
        },
        {
            accessorKey: "section",
            header: "Section",
            cell: ({ row }) => {
                const dimmed = scheduledIds.has(row.original.id) || conflictingIds.has(row.original.id);
                return <span className={dimmed ? "opacity-30" : ""}>{row.original.section}</span>;
            },
        },
        {
            accessorKey: "name",
            header: "Course name",
            cell: ({ row }) => {
                const dimmed = scheduledIds.has(row.original.id) || conflictingIds.has(row.original.id);
                // The link stays fully clickable even when dimmed — only the text fades,
                // not the pointer events, so the user can still navigate to the course page.
                return (
                    <button
                        onClick={() => navigate(`/course/${row.original.id}`)}
                        className="text-left hover:underline cursor-pointer text-foreground"
                    >
                        <span className={dimmed ? "opacity-30" : ""}>{row.original.name}</span>
                    </button>
                );
            },
        },
        {
            accessorKey: "creditHours",
            header: "Credits",
            cell: ({ row }) => {
                const dimmed = scheduledIds.has(row.original.id) || conflictingIds.has(row.original.id);
                return <span className={dimmed ? "opacity-30" : ""}>{row.original.creditHours}</span>;
            },
        },
        {
            accessorKey: "openSeats",
            header: "Open Seats",
            cell: ({ row }) => {
                const dimmed = scheduledIds.has(row.original.id) || conflictingIds.has(row.original.id);
                const noSeats = row.original.openSeats === 0;
                return (
                    <span className={dimmed ? "opacity-30" : ""}>
                        {noSeats && (
                            <AlertTriangle className="inline h-3.5 w-3.5 mr-1 text-amber-500" />
                        )}
                        {row.original.openSeats}
                    </span>
                );
            },
        },
        {
            id: "professor",
            header: "Professor",
            cell: ({ row }) => {
                const dimmed = scheduledIds.has(row.original.id) || conflictingIds.has(row.original.id);
                const professors = row.original.professors;
                if (!Array.isArray(professors)) return null;
                const text = professors.map((p) => `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim()).join(", ");
                return <span className={dimmed ? "opacity-30" : ""}>{text}</span>;
            },
        },
        {
            id: "time",
            header: "Days & Time",
            cell: ({ row }) => {
                const dimmed = scheduledIds.has(row.original.id) || conflictingIds.has(row.original.id);
                const times = row.original.times;
                if (!Array.isArray(times)) return null;
                const text = times.map((t) => {
                    const day   = String(t.day);
                    const start = Array.isArray(t.start_time) ? formatTime(t.start_time) : String(t.start_time);
                    const end   = Array.isArray(t.end_time)   ? formatTime(t.end_time)   : String(t.end_time);
                    return `${day} ${start}–${end}`;
                }).join(", ");
                return <span className={dimmed ? "opacity-30" : ""}>{text}</span>;
            },
        },
        {
            id: "action",
            header: "",
            // meta.sticky is read by DataTable to apply `sticky right-0 bg-background`
            // to this column's <th> and <td>, keeping it pinned during horizontal scroll.
            // Add this to DataTable.tsx:
            //   const isSticky = (column.columnDef.meta as any)?.sticky;
            //   Apply cn("sticky right-0 bg-background", ...) to the <th> and <td> when isSticky is true.
            meta: { sticky: true },
            cell: ({ row }) => {
                const course = row.original;
                const inSchedule = scheduledIds.has(course.id);
                const conflicts  = conflictingIds.has(course.id);

                // Already in the schedule — show Remove
                if (inSchedule) {
                    return (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemove(course)}
                        >
                            Remove
                        </Button>
                    );
                }

                // Time conflict — no button (row text is already dimmed)
                if (conflicts) {
                    return null;
                }

                // Normal case — show Add
                return (
                    <Button
                        size="sm"
                        onClick={async () => {
                            try {
                                const res = await fetch("http://localhost:7001/course", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(course),
                                });
                                if (!res.ok) {
                                    const body = await res.text();
                                    console.error(`Failed to add course: ${res.status} ${res.statusText}`, body);
                                    return;
                                }
                                const added: boolean = await res.json();
                                if (added) {
                                    console.log("Course added successfully:", course.name);
                                    fetchSchedule();
                                    refreshCourseInResults(course.id);
                                } else {
                                    console.warn("Course was not added (already in schedule?):", course.name);
                                }
                            } catch (err) {
                                console.error("Error adding course:", err);
                            }
                        }}
                    >
                        Add
                    </Button>
                );
            },
        },
    ];

    // Columns for the schedule table shown below the calendar
    const scheduleColumns: ColumnDef<any>[] = [
        { accessorKey: "subject", header: "Dept" },
        { accessorKey: "code", header: "Code" },
        { accessorKey: "section", header: "Section" },
        {
            accessorKey: "name",
            header: "Course name",
            cell: ({ row }) => (
                <button
                    onClick={() => navigate(`/course/${row.original.id}`)}
                    className="text-left hover:underline cursor-pointer text-foreground"
                >
                    {row.original.name}
                </button>
            ),
        },
        {
            id: "professor",
            header: "Professor",
            cell: ({ row }) => {
                const professors = row.original.professors;
                if (!Array.isArray(professors)) return null;
                return professors.map((p) => `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim()).join(", ");
            },
        },
        {
            id: "time",
            header: "Days & Time",
            cell: ({ row }) => {
                const times = row.original.times;
                if (!Array.isArray(times)) return null;
                return times.map((t) => {
                    const day   = String(t.day);
                    const start = Array.isArray(t.start_time) ? formatTime(t.start_time) : String(t.start_time);
                    const end   = Array.isArray(t.end_time)   ? formatTime(t.end_time)   : String(t.end_time);
                    return `${day} ${start}–${end}`;
                }).join(", ");
            },
        },
        {
            id: "remove",
            header: "",
            meta: { sticky: true },
            cell: ({ row }) => (
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemove(row.original)}
                >
                    Remove
                </Button>
            ),
        },
    ];

    const submitFilters = async () => {
        if (!filterFormRef.current) return;
        const formData = new FormData(filterFormRef.current);

        const getString = (name: string): string | null => {
            const val = formData.get(name);
            return val && String(val).trim() ? String(val).trim() : null;
        };

        const startTime = getString("start-time");
        const endTime   = getString("end-time");
        const day       = getString("day-of-week");

        let time: Record<string, unknown> | null = null;
        if (startTime || endTime || day) {
            time = {};
            if (day)       time.day        = day;
            if (startTime) time.start_time = startTime.split(":").map(Number);
            if (endTime)   time.end_time   = endTime.split(":").map(Number);
        }

        const postData = {
            semester: getString("semester"),
            name:     getString("name"),
            prof:     getString("prof"),
            dept:     getString("dept"),
            credits:  getString("credits"),
            year:     getString("year"),
            time,
        };

        try {
            const res = await fetch(`http://localhost:7001/filters`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(postData),
            });
            if (!res.ok) {
                console.error(`Filter failed: ${res.status} ${res.statusText}`);
                return;
            }
            const filterRes: Course[] = await res.json();
            setResults(filterRes);
        } catch (err) {
            console.error("Filter error:", err);
        }
    }

    const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        submitFilters();
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Transient save/load notification — auto-dismisses after 3 seconds */}
            {toast && (
                <div className={cn(
                    "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-md text-sm font-medium transition-all",
                    toast.ok
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                )}>
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <header className="relative h-16 flex items-center px-6 gap-2">
                <SearchCalendarBar
                    hasSearched={hasSearched}
                    setHasSearched={setHasSearched}
                    setResults={setResults}
                    mode={mode}
                    setMode={setMode}
                />
                <div className="ml-auto flex items-center gap-2">
                    {/* Save and Load buttons persist the schedule to/from disk via the backend */}
                    {mode === "calendar" && (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={schedule.length === 0}
                            onClick={() => {
                                downloadScheduleIcs(schedule);
                                showToast("Schedule exported as iCal.", true);
                            }}
                        >
                            Export iCal
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                            try {
                                const res = await fetch("http://localhost:7001/schedule/save", {
                                    method: "POST",
                                });
                                if (!res.ok) {
                                    showToast("Failed to save schedule.", false);
                                    console.error("Failed to save schedule:", await res.text());
                                } else {
                                    showToast("Schedule saved successfully.", true);
                                }
                            } catch (err) {
                                showToast("Failed to save schedule.", false);
                                console.error("Error saving schedule:", err);
                            }
                        }}
                    >
                        Save Schedule
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                            try {
                                const res = await fetch("http://localhost:7001/schedule/load", {
                                    method: "POST",
                                });
                                if (!res.ok) {
                                    showToast("Failed to load schedule.", false);
                                    console.error("Failed to load schedule:", await res.text());
                                    return;
                                }
                                const data = await res.json();
                                setSchedule(data);
                                setEvents(toEvents(data));
                                showToast("Schedule loaded successfully.", true);
                            } catch (err) {
                                showToast("Failed to load schedule.", false);
                                console.error("Error loading schedule:", err);
                            }
                        }}
                    >
                        Load Schedule
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar>
                            <AvatarImage src="" />
                            <AvatarFallback>IT</AvatarFallback>
                        </Avatar>
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-1 justify-center min-h-full mb-16">
                {/* Inspirational quote (shown before any search) */}
                {mode === "search" && !hasSearched && (
                    <div className="flex-1 flex flex-col items-center justify-center px-6">
                        <blockquote className="max-w-md text-center">
                            <p className="text-lg italic text-muted-foreground/60">
                                &ldquo;{quote.text}&rdquo;
                            </p>
                            <footer className="mt-3 text-sm text-muted-foreground/40">
                                &mdash; {quote.author}
                            </footer>
                        </blockquote>
                    </div>
                )}

                {/* Search results + filters */}
                {mode === "search" && hasSearched && (
                    <div className="block min-w-4/5 mt-8">
                        <form ref={filterFormRef} onSubmit={handleFilter} onChange={() => submitFilters()}>
                            <FilterGroup className="p-4 bg-neutral-50" />
                        </form>
                        <div className="flex-1 flex flex-col items-center px-6 pt-8">
                            <div className="w-full max-w-4xl mx-auto">
                                {/*
                                  * Dimming is handled per-cell inside each column's cell renderer
                                  * using opacity-30 on a wrapping <span>, so Tailwind always sees
                                  * the class as a static string and includes it in the build.
                                  *
                                  * The action column uses meta: { sticky: true }. To make it pin
                                  * to the right edge during horizontal scroll, add this to DataTable.tsx
                                  * wherever <th> and <td> are rendered:
                                  *   const isSticky = (column.columnDef.meta as any)?.sticky;
                                  *   className={cn("...", isSticky && "sticky right-0 bg-background")}
                                  */}
                                <DataTable
                                    columns={columns}
                                    data={results}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Calendar */}
                {mode === "calendar" && (
                    <div className="flex-1 flex flex-col items-center max-w-2/3 mt-8">
                        <BigCalendar events={events} />
                        {schedule.length > 0 && (
                            <div className="w-full max-w-4xl mx-auto mt-8">
                                <h2 className="text-lg font-semibold mb-3">My Schedule</h2>
                                <DataTable columns={scheduleColumns} data={schedule} />
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    )
}
