import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
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
                return formatCourseTimes(times, { compactDays: true });
            },
        },
        {
            id: "remove",
            header: "",
            meta: { sticky: true },
            cell: ({ row }) => (
                <Button variant="destructive" size="sm" onClick={() => onRemove(row.original)}>
                    Remove
                </Button>
            ),
        },
    ];
}
