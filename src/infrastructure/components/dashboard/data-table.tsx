"use client"

import * as React from "react"
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
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table"
import { Card, CardContent, CardHeader } from "../../ui/card"
import { Skeleton } from "../../ui/skeleton"
import { DataTableFilters } from "./data-table-filters"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "../../ui/button"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  title: string
  filterOptions: {
    enableNameFilter?: boolean
    enableDateFilter?: boolean
    enableSiteFilter?: boolean
    enableSupervisorFilter?: boolean
    enableColumnVisibility?: boolean
    enableViewModeToggle?: boolean
    enableAddButton?: boolean
    addButtonLabel?: string
  }
  onAddClick?: () => void
  searchTerm?: string
  setSearchTerm?: (value: string) => void
  date?: Date
  setDate?: (date: Date | undefined) => void
  viewMode?: "table" | "card"
  setViewMode?: (mode: "table" | "card") => void
  hasAvatar?: boolean
  avatarAccessor?: keyof TData
  nameAccessor?: keyof TData
  cardOptions?: {
    primaryField: keyof TData
    secondaryFields: Array<{
      key: keyof TData
      label: string
    }>
    onCardClick?: (item: TData) => void
  }
  emptyMessage?: string
  initialColumnVisibility?: VisibilityState
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
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialColumnVisibility)
  const [rowSelection, setRowSelection] = React.useState({})

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
  })

  React.useEffect(() => {
    if (date && table.getColumn("createdAt")) {
      table.getColumn("createdAt")?.setFilterValue(date.toISOString().split("T")[0])
    } else if (table.getColumn("createdAt")) {
      table.getColumn("createdAt")?.setFilterValue(undefined)
    }
  }, [date, table])

  React.useEffect(() => {
    if (searchTerm && nameAccessor && table.getColumn(nameAccessor as string)) {
      table.getColumn(nameAccessor as string)?.setFilterValue(searchTerm)
    }
  }, [searchTerm, nameAccessor, table])

  const renderSkeletonRows = () => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <TableRow key={`skeleton-${i}`} className="border-b border-gray-100">
          {Array(columns.length)
            .fill(0)
            .map((_, j) => (
              <TableCell key={`skeleton-cell-${i}-${j}`} className="py-3 px-4">
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
      ))
  }

  const renderCardSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array(8)
        .fill(0)
        .map((_, index) => (
          <Card key={index} className="border border-gray-200 shadow-sm">
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
  )

  const renderCardView = () => {
    if (!cardOptions) return null

    const paginatedData = table.getRowModel().rows.map((row) => row.original)

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginatedData.map((item, index) => (
          <Card
            key={index}
            className="group border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-blue-300 hover:-translate-y-1 bg-white"
            onClick={() => cardOptions.onCardClick && cardOptions.onCardClick(item)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                  {String(item[cardOptions.primaryField] || "")}
                </h3>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {cardOptions.secondaryFields.map((field, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-600">{field.label}</span>
                    <span className="text-sm text-gray-900 font-semibold">{String(item[field.key] || "-")}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const totalPages = table.getPageCount()
  const currentPage = table.getState().pagination.pageIndex + 1
  const startItem = table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
  const endItem = Math.min(startItem + table.getState().pagination.pageSize - 1, data.length)

  const renderPagination = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Mostrando {startItem} a {endItem} de {data.length} registros
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pageNumber
            if (totalPages <= 7) {
              pageNumber = i + 1
            } else if (currentPage <= 4) {
              pageNumber = i + 1
            } else if (currentPage >= totalPages - 3) {
              pageNumber = totalPages - 6 + i
            } else {
              pageNumber = currentPage - 3 + i
            }

            if (pageNumber < 1 || pageNumber > totalPages) return null

            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => table.setPageIndex(pageNumber - 1)}
                className={`h-8 w-8 p-0 text-xs font-medium transition-all ${
                  currentPage === pageNumber
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 border-gray-300"
                }`}
              >
                {pageNumber}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="w-full ">
      <Card className="border-none shadow-none p-6 md:p-8">
       
          <div className="flex flex-col sm:flex-row flex-wrap sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
              <p className="text-sm text-gray-600">Gerencie e visualize seus dados de forma eficiente</p>
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
            <div className=" overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-b border-gray-200 bg-gray-50">
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="py-4 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50 first:pl-6 last:pr-6"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
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
                        className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-3 px-4 text-sm text-gray-900 first:pl-6 last:pr-6">
                            {cell.column.id === nameAccessor && hasAvatar ? (
                              <div className="flex items-center gap-3">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </div>
                            ) : (
                              flexRender(cell.column.columnDef.cell, cell.getContext())
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500 py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Plus className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="text-lg font-medium mb-2 text-gray-700">Nenhum dado encontrado</div>
                          <div className="text-sm text-gray-500">{emptyMessage}</div>
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

          {totalPages > 1 && !loading && renderPagination()}
      
      </Card>
    </div>
  )
}
