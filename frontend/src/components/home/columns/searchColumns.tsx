import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { formatTime } from "@/lib/utils"
import type { Course } from "@/lib/types"

interface SearchColumnDeps {
    scheduledIds: Set<number>
    conflictingIds: Set<number>
    onAdd: (course: Course) => void
    onRemove: (course: Course) => void
    onNavigate: (id: number) => void
}

/**
 * Wraps cell content in a span that fades when the row's course is already
 * scheduled or conflicts with the current schedule.
 *
 * Note: dimming is implemented with a static `opacity-30` class so Tailwind's
 * JIT always sees it and includes it in the build.
 */
function Dimmed({ dimmed, children }: { dimmed: boolean; children: React.ReactNode }) {
    return <span className={dimmed ? "opacity-30" : ""}>{children}</span>;
}

export function buildSearchColumns(deps: SearchColumnDeps): ColumnDef<Course>[] {
    const { scheduledIds, conflictingIds, onAdd, onRemove, onNavigate } = deps;

    const isDimmed = (id: number) => scheduledIds.has(id) || conflictingIds.has(id);

    return [
        {
            accessorKey: "subject",
            header: "Dept",
            cell: ({ row }) => <Dimmed dimmed={isDimmed(row.original.id)}>{row.original.subject}</Dimmed>,
        },
        {
            accessorKey: "code",
            header: "Code",
            cell: ({ row }) => <Dimmed dimmed={isDimmed(row.original.id)}>{row.original.code}</Dimmed>,
        },
        {
            accessorKey: "section",
            header: "Section",
            cell: ({ row }) => <Dimmed dimmed={isDimmed(row.original.id)}>{row.original.section}</Dimmed>,
        },
        {
            accessorKey: "name",
            header: "Course name",
            cell: ({ row }) => (
                // The link stays fully clickable even when dimmed — only the text fades,
                // not the pointer events, so the user can still navigate to the course page.
                <button
                    onClick={() => onNavigate(row.original.id)}
                    className="text-left hover:underline cursor-pointer text-foreground"
                >
                    <Dimmed dimmed={isDimmed(row.original.id)}>{row.original.name}</Dimmed>
                </button>
            ),
        },
        {
            accessorKey: "creditHours",
            header: "Credits",
            cell: ({ row }) => <Dimmed dimmed={isDimmed(row.original.id)}>{row.original.creditHours}</Dimmed>,
        },
        {
            accessorKey: "openSeats",
            header: "Open Seats",
            cell: ({ row }) => {
                const noSeats = row.original.openSeats === 0;
                return (
                    <Dimmed dimmed={isDimmed(row.original.id)}>
                        {noSeats && (
                            <AlertTriangle className="inline h-3.5 w-3.5 mr-1 text-amber-500" />
                        )}
                        {row.original.openSeats}
                    </Dimmed>
                );
            },
        },
        {
            id: "professor",
            header: "Professor",
            cell: ({ row }) => {
                const professors = row.original.professors;
                if (!Array.isArray(professors)) return null;
                const text = professors.map((p) => `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim()).join(", ");
                return <Dimmed dimmed={isDimmed(row.original.id)}>{text}</Dimmed>;
            },
        },
        {
            id: "time",
            header: "Days & Time",
            cell: ({ row }) => {
                const times = row.original.times;
                if (!Array.isArray(times)) return null;
                const text = times.map((t) => {
                    const day   = String(t.day);
                    const start = Array.isArray(t.start_time) ? formatTime(t.start_time) : String(t.start_time);
                    const end   = Array.isArray(t.end_time)   ? formatTime(t.end_time)   : String(t.end_time);
                    return `${day} ${start}–${end}`;
                }).join(", ");
                return <Dimmed dimmed={isDimmed(row.original.id)}>{text}</Dimmed>;
            },
        },
        {
            id: "action",
            header: "",
            // meta.sticky is read by DataTable to apply `sticky right-0 bg-background`
            // to this column's <th> and <td>, keeping it pinned during horizontal scroll.
            meta: { sticky: true },
            cell: ({ row }) => {
                const course = row.original;
                const inSchedule = scheduledIds.has(course.id);
                const conflicts  = conflictingIds.has(course.id);

                if (inSchedule) {
                    return (
                        <Button variant="destructive" size="sm" onClick={() => onRemove(course)}>
                            Remove
                        </Button>
                    );
                }

                // Time conflict — no button (row text is already dimmed)
                if (conflicts) return null;

                return (
                    <Button size="sm" onClick={() => onAdd(course)}>
                        Add
                    </Button>
                );
            },
        },
    ];
}
