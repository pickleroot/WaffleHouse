import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// --- infinite-scroll change ---
// Optional props so non-search tables (schedule view) are unaffected:
//   - loadMoreRef: forwarded to a sentinel <tr> rendered after the last data
//     row. The parent attaches an IntersectionObserver to it and calls
//     fetchNextPage() when it scrolls into view.
//   - isFetchingMore: when true, a "Loading…" row is shown in place of the
//     sentinel so the user gets feedback during the in-flight page fetch.
interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    loadMoreRef?: React.Ref<HTMLTableRowElement>
    isFetchingMore?: boolean
}
// --- /infinite-scroll change ---

export function DataTable<TData, TValue>({
    columns,
    data,
    // --- infinite-scroll change ---
    loadMoreRef,
    isFetchingMore,
    // --- /infinite-scroll change ---
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const rows = table.getRowModel().rows

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                const isSticky = (header.column.columnDef.meta as any)?.sticky;
                                return (
                                    <TableHead
                                        key={header.id}
                                        className={isSticky ? "sticky right-0 bg-background" : undefined}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {rows?.length ? (
                        rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => {
                                    const isSticky = (cell.column.columnDef.meta as any)?.sticky;
                                    return (
                                        <TableCell
                                            key={cell.id}
                                            className={isSticky ? "sticky right-0 bg-background" : undefined}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                    {/* --- infinite-scroll change ---
                        Sentinel row rendered only when the parent opted in.
                        Renders after all data rows. A separate "Loading…" row
                        is shown while the next page is in flight. */}
                    {loadMoreRef && rows.length > 0 && (
                        <TableRow ref={loadMoreRef} aria-hidden>
                            <TableCell colSpan={columns.length} className="h-2 p-0" />
                        </TableRow>
                    )}
                    {isFetchingMore && (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-12 text-center text-muted-foreground text-sm"
                            >
                                Loading more…
                            </TableCell>
                        </TableRow>
                    )}
                    {/* --- /infinite-scroll change --- */}
                </TableBody>
            </Table>
        </div>
    )
}
