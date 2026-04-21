import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { formatTime } from "@/lib/utils"

interface ScheduleColumnDeps {
    onRemove: (course: any) => void
    onNavigate: (id: number) => void
}

export function buildScheduleColumns(deps: ScheduleColumnDeps): ColumnDef<any>[] {
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
                return professors.map((p: any) => `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim()).join(", ");
            },
        },
        {
            id: "time",
            header: "Days & Time",
            cell: ({ row }) => {
                const times = row.original.times;
                if (!Array.isArray(times)) return null;
                return times.map((t: any) => {
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
                <Button variant="destructive" size="sm" onClick={() => onRemove(row.original)}>
                    Remove
                </Button>
            ),
        },
    ];
}
