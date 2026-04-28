import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { CircleMinus } from "lucide-react"
import { formatCourseTimes } from "@/lib/utils"
import type { Course } from "@/lib/types"

interface ScheduleColumnDeps {
    onRemove: (course: Course) => void
    onNavigate: (id: number) => void
}

export function buildScheduleColumns(deps: ScheduleColumnDeps): ColumnDef<Course>[] {
    const { onRemove, onNavigate } = deps;

    return [
        { accessorKey: "subject", header: "Dept" },
        { accessorKey: "code", header: "Code" },
        { accessorKey: "section", header: "Section" },
        {
            accessorKey: "name",
            header: "Course name",
            cell: ({ row }) => (
                <button
                    onClick={() => onNavigate(row.original.id)}
                    className="text-left hover:underline cursor-pointer text-foreground"
                >
                    {row.original.name}
                </button>
            ),
        },
        {
            id: "professor",
            accessorFn: (course) => {
                const professors = course.professors;
                if (!Array.isArray(professors)) return "";
                return professors.map((p) => `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim()).join(", ");
            },
            header: "Professor",
            cell: ({ row }) => {
                const professors = row.original.professors;
                if (!Array.isArray(professors)) return null;
                return professors.map((p) => `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim()).join(", ");
            },
        },
        {
            id: "time",
            accessorFn: (course) => {
                const times = course.times;
                if (!Array.isArray(times) || times.length === 0) return "";
                return formatCourseTimes(times, { compactDays: true });
            },
            header: "Days & Time",
            cell: ({ row }) => {
                const times = row.original.times;
                if (!Array.isArray(times)) return null;
                return formatCourseTimes(times, { compactDays: true });
            },
        },
        {
            id: "remove",
            header: "",
            meta: { sticky: true },
            enableSorting: false,
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 text-red-600 hover:bg-red-600 hover:text-white"
                    aria-label="Remove from Schedule"
                    title="Remove from Schedule"
                    onClick={() => onRemove(row.original)}
                >
                    <CircleMinus className="h-4 w-4" />
                </Button>
            ),
        },
    ];
}
