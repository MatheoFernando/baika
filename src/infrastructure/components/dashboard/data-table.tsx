"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
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
} from "../../ui/table";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Skeleton } from "../../ui/skeleton";
import { DataTableFilters } from "./data-table-filters";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "../../ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  title: string;
  // Filter options
  filterOptions: {
    enableNameFilter?: boolean;
    enableDateFilter?: boolean;
    enableSiteFilter?: boolean;
    enableSupervisorFilter?: boolean;
    enableColumnVisibility?: boolean;
    enableViewModeToggle?: boolean;
    enableAddButton?: boolean;
    addButtonLabel?: string;
  };
  // Callbacks
  onAddClick?: () => void;
  // Filter state
  searchTerm?: string;
  setSearchTerm?: (value: string) => void;
  date?: Date;
  setDate?: (date: Date | undefined) => void;
  // View mode
  viewMode?: "table" | "card";
  setViewMode?: (mode: "table" | "card") => void;
  // Rendering options
  hasAvatar?: boolean;
  avatarAccessor?: keyof TData;
  nameAccessor?: keyof TData;
  // Card options
  cardOptions?: {
    primaryField: keyof TData;
    secondaryFields: Array<{
      key: keyof TData;
      label: string;
    }>;
    onCardClick?: (item: TData) => void;
  };
  emptyMessage?: string;
  initialColumnVisibility?: VisibilityState;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  title,
  filterOptions,
  onAddClick,
  searchTerm = "",
  setSearchTerm = () => {},
  date,
  setDate = () => {},
  viewMode = "table",
  setViewMode = () => {},
  hasAvatar = false,
  avatarAccessor = "logo" as keyof TData,
  nameAccessor = "name" as keyof TData,
  cardOptions,
  emptyMessage = "Nenhum registro encontrado.",
  initialColumnVisibility = {},
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialColumnVisibility);
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

  React.useEffect(() => {
    if (date && table.getColumn("createdAt")) {
      table
        .getColumn("createdAt")
        ?.setFilterValue(date.toISOString().split("T")[0]);
    } else if (table.getColumn("createdAt")) {
      table.getColumn("createdAt")?.setFilterValue(undefined);
    }
  }, [date, table]);

  React.useEffect(() => {
    if (searchTerm && nameAccessor && table.getColumn(nameAccessor as string)) {
      table.getColumn(nameAccessor as string)?.setFilterValue(searchTerm);
    }
  }, [searchTerm, nameAccessor, table]);

  const renderSkeletonRows = () => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <TableRow key={`skeleton-${i}`} className="border-gray-100">
          {Array(columns.length)
            .fill(0)
            .map((_, j) => (
              <TableCell key={`skeleton-cell-${i}-${j}`} className="py-4">
                {j === 0 && hasAvatar ? (
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : (
                  <Skeleton className="h-4 w-24" />
                )}
              </TableCell>
            ))}
        </TableRow>
      ));
  };

  const renderCardSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(6)
        .fill(0)
        .map((_, index) => (
          <Card key={index} className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-5 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );

  const renderCardView = () => {
    if (!cardOptions) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item, index) => (
          <Card
            key={index}
            className="border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-gray-300"
            onClick={() =>
              cardOptions.onCardClick && cardOptions.onCardClick(item)
            }
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="font-semibold text-gray-900">
                  {String(item[cardOptions.primaryField] || "")}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {cardOptions.secondaryFields.map((field, idx) => (
                  <div
                    key={idx}
                    className="text-center bg-gray-50 py-3 px-4 rounded-lg"
                  >
                    <div className="text-xl font-bold text-gray-900">
                      {String(item[field.key] || "0")}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {field.label}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const totalPages = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;
  const startItem =
    table.getState().pagination.pageIndex *
      table.getState().pagination.pageSize +
    1;
  const endItem = Math.min(
    startItem + table.getState().pagination.pageSize - 1,
    data.length
  );

  return (
    <Card className="w-full bg-white px-6 py-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <DataTableFilters
            table={table}
            filterOptions={filterOptions}
            onAddClick={onAddClick}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            date={date}
            setDate={setDate}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-gray-200 bg-gray-50/50 w-full"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="py-4 px-6 text-sm font-medium text-gray-600 bg-gray-50/50  w-full"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                renderSkeletonRows()
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`border-gray-100 hover:bg-gray-50/50  transition-colors duration-150 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="  text-sm text-gray-900 py-1"
                      >
                        {cell.column.id === nameAccessor && hasAvatar ? (
                          <div className="flex items-center gap-3 
                          ">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="text-lg font-medium mb-2">
                       Nenhum dado encontrado
                      </div>
                      <div className="text-sm">{emptyMessage}</div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <>{loading ? renderCardSkeleton() : renderCardView()}</>
      )}

      {viewMode === "table" && totalPages > 1 && !loading && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Página {currentPage} de {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 7) {
                  pageNumber = i + 1;
                } else if (currentPage <= 4) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNumber = totalPages - 6 + i;
                } else {
                  pageNumber = currentPage - 3 + i;
                }

                if (pageNumber < 1 || pageNumber > totalPages) return null;

                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => table.setPageIndex(pageNumber - 1)}
                    className={`w-8 h-8 p-0 cursor-pointer rounded-full ${
                      currentPage === pageNumber
                        ? "bg-blue-600 hover:bg-blue-600 text-white border-blue-600"
                        : " text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="cursor-pointer "
            >
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
