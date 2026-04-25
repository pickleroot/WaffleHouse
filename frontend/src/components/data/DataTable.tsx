import { Fragment, useEffect, useState, type ReactNode } from "react"
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, ChevronRight, ChevronUp } from "lucide-react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    getRowId?: (originalRow: TData, index: number) => string
    renderExpandedContent?: (row: TData) => ReactNode
    density?: "default" | "compact"
}

interface ColumnMeta {
    sticky?: boolean
    headerClassName?: string
    cellClassName?: string
}

export function DataTable<TData, TValue>({
    columns,
    data,
    getRowId,
    renderExpandedContent,
    density = "default",
}: DataTableProps<TData, TValue>) {
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
    const [sorting, setSorting] = useState<SortingState>([])

    useEffect(() => {
        setExpandedRows({})
    }, [data])

    const table = useReactTable({
        data,
        columns,
        getRowId,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    const isExpandable = Boolean(renderExpandedContent)
    const isCompact = density === "compact"
    const headClassName = isCompact ? "h-9 px-1.5 text-xs" : undefined
    const cellClassName = isCompact ? "px-1.5 py-1 text-sm" : undefined

    const toggleRow = (rowId: string) => {
        setExpandedRows((current) => ({
            ...current,
            [rowId]: !current[rowId],
        }))
    }

    return (
        <div className="rounded-md border">
            <Table className="min-w-full w-max">
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {isExpandable && <TableHead className={cn("w-8 px-1", headClassName)} />}
                            {headerGroup.headers.map((header) => {
                                const meta = header.column.columnDef.meta as ColumnMeta | undefined
                                const isSticky = meta?.sticky;
                                return (
                                    <TableHead
                                        key={header.id}
                                        className={cn(
                                            headClassName,
                                            meta?.headerClassName,
                                            isSticky && "sticky right-0 bg-background"
                                        )}
                                    >
                                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                            <button
                                                type="button"
                                                onClick={header.column.getToggleSortingHandler()}
                                                className="inline-flex items-center gap-1 font-medium text-foreground hover:text-foreground/80"
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {header.column.getIsSorted() === "asc" ? (
                                                    <ChevronUp className="h-3.5 w-3.5" />
                                                ) : header.column.getIsSorted() === "desc" ? (
                                                    <ChevronDown className="h-3.5 w-3.5" />
                                                ) : (
                                                    <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                                                )}
                                            </button>
                                        ) : (
                                            flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )
                                        )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => {
                            const isExpanded = Boolean(expandedRows[row.id])

                            return (
                                <Fragment key={row.id}>
                                    <TableRow data-state={isExpanded ? "selected" : undefined}>
                                        {isExpandable && (
                                            <TableCell className={cn("w-8 px-1", cellClassName)}>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="h-6 w-6"
                                                    aria-label={isExpanded ? "Collapse course details" : "Expand course details"}
                                                    aria-expanded={isExpanded}
                                                    onClick={() => toggleRow(row.id)}
                                                >
                                                    <ChevronRight className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")} />
                                                </Button>
                                            </TableCell>
                                        )}
                                        {row.getVisibleCells().map((cell) => {
                                            const meta = cell.column.columnDef.meta as ColumnMeta | undefined
                                            const isSticky = meta?.sticky;
                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    className={cn(
                                                        cellClassName,
                                                        meta?.cellClassName,
                                                        isSticky && "sticky right-0 bg-background"
                                                    )}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                    {isExpandable && isExpanded && renderExpandedContent && (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell
                                                colSpan={columns.length + 1}
                                                className={cn(
                                                    "bg-muted/20 align-top whitespace-normal",
                                                    isCompact ? "px-3 py-3" : "px-4 py-4"
                                                )}
                                            >
                                                {renderExpandedContent(row.original)}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </Fragment>
                            )
                        })
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length + (isExpandable ? 1 : 0)}
                                className="h-24 text-center"
                            >
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
