"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/infrastructure/ui/table";
import { Input } from "@/src/infrastructure/ui/input";
import { Skeleton } from "@/src/infrastructure/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/src/infrastructure/ui/pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Function to render skeleton rows when loading
  const renderSkeletonRows = () => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <TableRow key={`skeleton-${i}`}>
          {Array(columns.length)
            .fill(0)
            .map((_, j) => (
              <TableCell key={`skeleton-cell-${i}-${j}`}>
                <Skeleton className="h-6 w-full" />
              </TableCell>
            ))}
        </TableRow>
      ));
  };

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar por site..."
          value={
            (table.getColumn("siteName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("siteName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
          disabled={loading}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
            {loading ? (
              renderSkeletonRows()
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-center mt-4">
        <Pagination>
          <PaginationContent>
            {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map(
              (page) => {
                if (
                  page === 1 ||
                  page === table.getPageCount() ||
                  (page >= table.getState().pagination.pageIndex &&
                    page <= table.getState().pagination.pageIndex + 2)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          table.setPageIndex(page - 1);
                        }}
                        className={
                          page === table.getState().pagination.pageIndex + 1
                            ? "bg-blue-500 text-white"
                            : ""
                        }
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }

                if (
                  (page === 2 && table.getState().pagination.pageIndex > 1) ||
                  (page === table.getPageCount() - 1 &&
                    table.getState().pagination.pageIndex <
                      table.getPageCount() - 3)
                ) {
                  return (
                    <PaginationItem key={`ellipsis-${page}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return null;
              }
            )}
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
