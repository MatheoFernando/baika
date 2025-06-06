"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
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
  emptyMessage,
  initialColumnVisibility = {},
}: DataTableProps<TData, TValue>) {
  const t = useTranslations('DataTable')
  
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
        <TableRow key={`skeleton-${i}`} className="border-b border-gray-100 dark:border-gray-700">
          {Array(columns.length)
            .fill(0)
            .map((_, j) => (
              <TableCell key={`skeleton-cell-${i}-${j}`} className="py-3 px-2 sm:px-4">
                {j === 0 && hasAvatar ? (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded-full dark:bg-gray-700" />
                    <Skeleton className="h-4 w-20 sm:w-32 dark:bg-gray-700" />
                  </div>
                ) : (
                  <Skeleton className="h-4 w-16 sm:w-24 dark:bg-gray-700" />
                )}
              </TableCell>
            ))}
        </TableRow>
      ))
  }

  const renderCardSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {Array(8)
        .fill(0)
        .map((_, index) => (
          <Card key={index} className="border border-gray-200 dark:border-gray-700 shadow-sm dark:bg-gray-800">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full dark:bg-gray-700" />
                <Skeleton className="h-4 sm:h-5 w-24 sm:w-32 dark:bg-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full dark:bg-gray-700" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 dark:bg-gray-700" />
                  <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 dark:bg-gray-700" />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {paginatedData.map((item, index) => (
          <Card
            key={index}
            className="group border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1 bg-white dark:bg-gray-800"
            onClick={() => cardOptions.onCardClick && cardOptions.onCardClick(item)}
          >
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base sm:text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {String(item[cardOptions.primaryField] || "")}
                </h3>
                <div className="w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full flex-shrink-0"></div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 sm:space-y-3">
                {cardOptions.secondaryFields.map((field, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate mr-2">
                      {field.label}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 font-semibold truncate max-w-[60%] text-right">
                      {String(item[field.key] || "-")}
                    </span>
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 sm:mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
        {t('showing', { start: startItem, end: endItem, total: data.length })}
      </div>

      <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600"
        >
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, window.innerWidth < 640 ? 5 : 7) }, (_, i) => {
            const maxPages = window.innerWidth < 640 ? 5 : 7
            let pageNumber
            if (totalPages <= maxPages) {
              pageNumber = i + 1
            } else if (currentPage <= Math.floor(maxPages / 2) + 1) {
              pageNumber = i + 1
            } else if (currentPage >= totalPages - Math.floor(maxPages / 2)) {
              pageNumber = totalPages - maxPages + 1 + i
            } else {
              pageNumber = currentPage - Math.floor(maxPages / 2) + i
            }

            if (pageNumber < 1 || pageNumber > totalPages) return null

            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => table.setPageIndex(pageNumber - 1)}
                className={`h-7 w-7 sm:h-8 sm:w-8 p-0 text-xs font-medium transition-all ${
                  currentPage === pageNumber
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-sm dark:bg-blue-600 dark:hover:bg-blue-700"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
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
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600"
        >
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="w-full">
      <Card className="border-none shadow-none p-4 sm:p-6 md:p-8 dark:bg-gray-800">
        <div className="flex flex-col sm:flex-row flex-wrap sm:items-center justify-between gap-4 mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 truncate">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {t('subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
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
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg  dark:border-gray-700">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="py-3 sm:py-4 px-2 sm:px-4 text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider bg-gray-50 dark:bg-gray-800 first:pl-4 sm:first:pl-6 last:pr-4 sm:last:pr-6 whitespace-nowrap"
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
                      className={`border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200 ${
                        index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/30 dark:bg-gray-800/50"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-2 sm:py-0.5 px-2 sm:px-4 text-xs sm:text-sm text-gray-900 dark:text-gray-100 first:pl-4 sm:first:pl-6 last:pr-4 sm:last:pr-6">
                          {cell.column.id === nameAccessor && hasAvatar ? (
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          ) : (
                            <div className="truncate">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 py-8">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                          <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div className="text-base sm:text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">
                          {t('noDataFound')}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center px-4">
                          {emptyMessage || t('defaultEmptyMessage')}
                        </div>
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