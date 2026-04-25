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

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    loadMoreRef?: React.Ref<HTMLTableRowElement>
    isFetchingMore?: boolean
}

export function DataTable<TData, TValue>({
    columns,
    data,
    loadMoreRef,
    isFetchingMore,
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
                </TableBody>
            </Table>
        </div>
    )
}
