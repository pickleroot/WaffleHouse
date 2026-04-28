import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CircleMinus, CirclePlus } from "lucide-react"
import { formatCourseTimes } from "@/lib/utils"
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
    const { scheduledIds, conflictingIds, onAdd, onRemove } = deps;

    const isDimmed = (id: number) => scheduledIds.has(id) || conflictingIds.has(id);

    return [
        {
            accessorKey: "subject",
            header: "Dept",
            meta: {
                headerClassName: "w-16 min-w-16",
                cellClassName: "w-16 min-w-16",
            },
            cell: ({ row }) => <Dimmed dimmed={isDimmed(row.original.id)}>{row.original.subject}</Dimmed>,
        },
        {
            accessorKey: "code",
            header: "Code",
            meta: {
                headerClassName: "w-16 min-w-16",
                cellClassName: "w-16 min-w-16",
            },
            cell: ({ row }) => <Dimmed dimmed={isDimmed(row.original.id)}>{row.original.code}</Dimmed>,
        },
        {
            accessorKey: "section",
            header: "Section",
            meta: {
                headerClassName: "w-[4.5rem] min-w-[4.5rem]",
                cellClassName: "w-[4.5rem] min-w-[4.5rem]",
            },
            cell: ({ row }) => <Dimmed dimmed={isDimmed(row.original.id)}>{row.original.section}</Dimmed>,
        },
        {
            accessorKey: "name",
            header: "Course name",
            meta: {
                headerClassName: "min-w-44 px-1",
                cellClassName: "min-w-44 whitespace-normal px-1",
            },
            cell: ({ row }) => <Dimmed dimmed={isDimmed(row.original.id)}>{row.original.name}</Dimmed>,
        },
        {
            accessorKey: "openSeats",
            header: "Open Seats",
            meta: {
                headerClassName: "w-20 min-w-20",
                cellClassName: "w-20 min-w-20",
            },
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
            id: "time",
            accessorFn: (course) => {
                if (!Array.isArray(course.times) || course.times.length === 0) {
                    return "TBD"
                }
                return formatCourseTimes(course.times, { compactDays: true })
            },
            header: "Days & Time",
            meta: {
                headerClassName: "min-w-48",
                cellClassName: "min-w-48 max-w-none whitespace-nowrap",
            },
            cell: ({ row }) => {
                const times = row.original.times;
                if (!Array.isArray(times) || times.length === 0) {
                    return <Dimmed dimmed={isDimmed(row.original.id)}>TBD</Dimmed>;
                }
                const text = formatCourseTimes(times, { compactDays: true });
                return <Dimmed dimmed={isDimmed(row.original.id)}>{text}</Dimmed>;
            },
        },
        {
            id: "action",
            header: "",
            // meta.sticky is read by DataTable to apply `sticky right-0 bg-background`
            // to this column's <th> and <td>, keeping it pinned during horizontal scroll.
            meta: {
                sticky: true,
                headerClassName: "w-10 min-w-10 px-1",
                cellClassName: "w-10 min-w-10 px-1",
            },
            enableSorting: false,
            cell: ({ row }) => {
                const course = row.original;
                const inSchedule = scheduledIds.has(course.id);
                const conflicts  = conflictingIds.has(course.id);

                if (inSchedule) {
                    return (
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-7 w-7 text-red-600 hover:bg-red-600 hover:text-white"
                            aria-label="Remove from Schedule"
                            title="Remove from Schedule"
                            onClick={() => onRemove(course)}
                        >
                            <CircleMinus className="h-4 w-4" />
                        </Button>
                    );
                }

                // Time conflict — no button (row text is already dimmed)
                if (conflicts) return null;

                return (
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7 text-foreground hover:bg-green-600 hover:text-white"
                        aria-label="Add to Schedule"
                        title="Add to Schedule"
                        onClick={() => onAdd(course)}
                    >
                        <CirclePlus className="h-4 w-4" />
                    </Button>
                );
            },
        },
    ];
}
