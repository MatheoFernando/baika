"use client"

import * as React from "react"
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
} from "@tanstack/react-table"
import { ChevronDown } from "lucide-react"
import { Button } from "@/src/infrastructure/ui/button"
import { Input } from "@/src/infrastructure/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/src/infrastructure/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/infrastructure/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/src/infrastructure/ui/pagination"
import { Calendar } from "@/src/infrastructure/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/infrastructure/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Skeleton } from "@/src/infrastructure/ui/skeleton"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/src/lib/utils"
import { Card } from "@/src/infrastructure/ui/card"
import { Checkbox } from "@/src/infrastructure/ui/checkbox"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [date, setDate] = React.useState<Date | undefined>(undefined)

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
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

  // Handle date filtering
  React.useEffect(() => {
    if (date) {
      table.getColumn("createdAt")?.setFilterValue(format(date, 'yyyy-MM-dd'))
    } else {
      table.getColumn("createdAt")?.setFilterValue(undefined)
    }
  }, [date, table])

  // Reset pagination when filters change
  React.useEffect(() => {
    table.resetPageIndex(true)
  }, [columnFilters, table])

  return (
    <Card className="w-full p-8">
      <div className="flex flex-col md:flex-row items-center justify-between flex-wrap  gap-4 py-4">
        <h1 className="text-2xl font-semibold">Ocorrências</h1>

        <div className="flex items-center gap-2">
        <Input
          placeholder="Filtrar por site ou supervisor..."
          value={
        (
          table.getColumn("siteName")?.getFilterValue() as string
        ) ??
        (
          table.getColumn("supervisorName")?.getFilterValue() as string
        ) ??
        ""
          }
          onChange={(event) => {
        table.getColumn("siteName")?.setFilterValue(event.target.value)
        table.getColumn("supervisorName")?.setFilterValue(event.target.value)
          }}
          className="max-w-sm"
        />
          <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
          "w-[240px] justify-start text-left font-normal",
          !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: ptBR }) : "Filtrar por data"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            locale={ptBR}
            footer={
          date && (
            <div className="p-2 border-t flex justify-between">
              <div>{format(date, "PPP", { locale: ptBR })}</div>
              <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setDate(undefined)}
              >
            Limpar
              </Button>
            </div>
          )
            }
          />
        </PopoverContent>
          </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Colunas <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
          <div
            key={column.id}
            className="flex items-center gap-2 px-2 py-1.5 cursor-pointer"
            onClick={() => column.toggleVisibility()}
          >
            <Checkbox
              checked={column.getIsVisible()}
              onCheckedChange={() => column.toggleVisibility()}
              tabIndex={-1}
              aria-label={`Toggle ${column.id}`}
            />
            <span className="capitalize text-sm">
              {column.id === "createdAtTime"
                ? "Hora"
                : column.id === "createdAt"
                ? "Data"
                : column.id === "siteName"
                ? "Site"
                : column.id === "supervisorName"
                ? "Supervisor"
                : column.id === "details"
                ? "Detalhes"
                : column.id === "priority"
                ? "Prioridade"
                : column.id}
            </span>
          </div>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
        
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                {Array.from({ length: columns.length }).map((_, j) => (
                <TableCell key={`skeleton-cell-${i}-${j}`}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
                ))}
              </TableRow>
              ))
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

   
    </Card>
  )
}