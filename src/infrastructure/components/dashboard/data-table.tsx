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
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink } from "../../ui/pagination"
import { Card, CardContent, CardHeader } from "../../ui/card"
import { Skeleton } from "../../ui/skeleton"
import { Avatar } from "@radix-ui/react-avatar"
import { AvatarFallback, AvatarImage } from "../../ui/avatar"
import { DataTableFilters } from "./data-table-filters"


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  title: string
  // Opções de filtro
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
  // Callbacks
  onAddClick?: () => void
  // Estado do filtro
  searchTerm?: string
  setSearchTerm?: (value: string) => void
  date?: Date
  setDate?: (date: Date | undefined) => void
  // Modo de visualização
  viewMode?: "table" | "card"
  setViewMode?: (mode: "table" | "card") => void
  // Opções de renderização
  hasAvatar?: boolean
  avatarAccessor?: keyof TData
  nameAccessor?: keyof TData
  // Opções de cartão (para modo de visualização em cartão)
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
      table.getColumn("createdAt")?.setFilterValue(
        date.toISOString().split("T")[0]
      )
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
    return Array(8)
      .fill(0)
      .map((_, i) => (
        <TableRow key={`skeleton-${i}`}>
          {Array(columns.length)
            .fill(0)
            .map((_, j) => (
              <TableCell key={`skeleton-cell-${i}-${j}`}>
                {j === 0 && hasAvatar ? (
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <Skeleton className="h-4 w-full" />
                )}
              </TableCell>
            ))}
        </TableRow>
      ))
  }

  const renderCardSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array(10)
        .fill(0)
        .map((_, index) => (
          <Card key={index} className="cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <Skeleton className="h-16 w-24" />
                <Skeleton className="h-16 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  )

  const renderCardView = () => {
    if (!cardOptions) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item, index) => (
          <Card
            key={index}
            className="hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => cardOptions.onCardClick && cardOptions.onCardClick(item)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-3">
                <div className="font-medium">{String(item[cardOptions.primaryField] || "")}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                {cardOptions.secondaryFields.map((field, idx) => (
                  <div key={idx} className="text-center border py-2 px-4 rounded-xl">
                    <div className="text-2xl font-bold">{String(item[field.key] || "0")}</div>
                    <div className="text-sm text-muted-foreground">{field.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div className="flex flex-wrap items-center justify-between py-4 gap-4">
        <h1 className="text-xl font-medium">{title}</h1>
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

      {viewMode === "table" ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="py-0.25">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="items-center justify-center">
              {loading ? (
                renderSkeletonRows()
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="py-0.25 "> 
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-0.25 items-center justify-center ">
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
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <>{loading ? renderCardSkeleton() : renderCardView()}</>
      )}

      {viewMode === "table" && table.getPageCount() > 0 && (
        <div className="flex justify-center mt-4">
          <Pagination>
            <PaginationContent>
              {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === table.getPageCount() ||
                  (page >= table.getState().pagination.pageIndex && page <= table.getState().pagination.pageIndex + 2)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          table.setPageIndex(page - 1)
                        }}
                        className={page === table.getState().pagination.pageIndex + 1 ? "bg-blue-500 text-white" : ""}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                }

                if (
                  (page === 2 && table.getState().pagination.pageIndex > 1) ||
                  (page === table.getPageCount() - 1 && table.getState().pagination.pageIndex < table.getPageCount() - 3)
                ) {
                  return (
                    <PaginationItem key={`ellipsis-${page}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }

                return null
              })}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </Card>
  )
}
