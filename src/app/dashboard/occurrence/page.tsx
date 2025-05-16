"use client"

import * as React from "react"
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/infrastructure/ui/table"
import { Button } from "@/src/infrastructure/ui/button"
import { Input } from "@/src/infrastructure/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/src/infrastructure/ui/pagination"
import { Skeleton } from "@/src/infrastructure/ui/skeleton"
import { BreadcrumbRoutas } from '@/src/infrastructure/components/ulils/breadcrumbRoutas'
import { CalendarIcon } from "lucide-react"
import { ModalOcorrencia } from "@/src/infrastructure/components/dashboard/occurrence/ModalOcorrencia"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/infrastructure/ui/select"
import { format } from "date-fns"
import { Calendar } from "@/src/infrastructure/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/infrastructure/ui/popover"

// Tipagem
export type Payment = {
  id: string
  hora: string
  data: string
  site: string
  supervisor: string
  detalhes: string
  prioridade: "Urgent" | "High" | "Medium" | "Low"
}

// PrioridadeBadge component
export function PrioridadeBadge({ prioridade }) {
  const config = {
    "Urgent": {
      color: "bg-red-500",
      borderColor: "border-red-500",
      textColor: "text-red-500"
    },
    "High": {
      color: "bg-orange-500",
      borderColor: "border-orange-500",
      textColor: "text-orange-500"
    },
    "Medium": {
      color: "bg-blue-500",
      borderColor: "border-blue-500",
      textColor: "text-blue-500"
    },
    "Low": {
      color: "bg-green-500",
      borderColor: "border-green-500", 
      textColor: "text-green-500"
    }
  }

  const { color, borderColor, textColor } = config[prioridade] || {
    color: "bg-gray-400",
    borderColor: "border-gray-400",
    textColor: "text-gray-400"
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <div className={`h-6 w-6 rounded-full ${color} border-4 border-opacity-30 ${borderColor}`}></div>
      </div>
      <span className={textColor}>{prioridade}</span>
    </div>
  )
}

// Dados falsos
const rawData: Payment[] = [...Array(5).keys()].map(i => ({
  id: `${i + 1}`,
  hora: "08:30",
  data: format(new Date(2025, 4, 10 + i), "yyyy-MM-dd"),
  site: "Luanda",
  supervisor: "Carlos",
  detalhes: "Ocorrência de teste",
  prioridade: i % 4 === 0 ? "Urgent" : i % 4 === 1 ? "High" : i % 4 === 2 ? "Medium" : "Low"
}))

// Página principal
export default function OcurrencePage() {
  const [filter, setFilter] = React.useState("")
  const [isFiltering, setIsFiltering] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState("")
  const [date, setDate] = React.useState(null)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [dadosSelecionados, setDadosSelecionados] = React.useState<Payment | null>(null)
  const [prioridadeFiltro, setPrioridadeFiltro] = React.useState("")

  // Colunas
  const columns: ColumnDef<Payment>[] = React.useMemo(() => [
    { accessorKey: "hora", header: "Hora", cell: info => info.getValue() },
    { accessorKey: "data", header: "Data", cell: info => info.getValue() },
    { accessorKey: "site", header: "Site", cell: info => info.getValue() },
    { accessorKey: "supervisor", header: "Supervisor", cell: info => info.getValue() },
    { accessorKey: "detalhes", header: "Detalhes", cell: info => info.getValue() },
    { 
      accessorKey: "prioridade", 
      header: "Prioridade", 
      cell: ({ row }) => <PrioridadeBadge prioridade={row.original.prioridade} />
    },
    {
      id: "acoes",
      header: "Ações",
      cell: ({ row }) => (
        <Button 
          onClick={() => {
            setDadosSelecionados(row.original)
            setModalOpen(true)
          }}
          size="sm" 
          className="cursor-pointer text-xs bg-blue-500 text-white dark:bg-black"
        >
          Ver detalhes
        </Button>
      )
    }
  ], [])

  const filteredData = React.useMemo(() => {
    setIsFiltering(true)
    const timeout = setTimeout(() => setIsFiltering(false), 400)

    let tempData = rawData

    // Filtro de texto
    if (filter) {
      const lower = filter.toLowerCase()
      tempData = tempData.filter(item =>
        item.site.toLowerCase().includes(lower) ||
        item.supervisor.toLowerCase().includes(lower) ||
        item.detalhes.toLowerCase().includes(lower)
      )
    }

    // Filtro de data
    if (selectedDate) {
      tempData = tempData.filter(item => item.data === selectedDate)
    }

    // Filtro de prioridade
    if (prioridadeFiltro && prioridadeFiltro !== "todas") {
      tempData = tempData.filter(item => item.prioridade === prioridadeFiltro)
    }

    return tempData
  }, [filter, selectedDate, prioridadeFiltro])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 35,
      },
    },
  })

  const currentPageRows = table.getRowModel().rows.slice(
    table.getState().pagination.pageIndex * 35,
    (table.getState().pagination.pageIndex + 1) * 35
  )

  const totalPages = Math.ceil(filteredData.length / 35)

  // Handler for date selection
  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate)
    if (selectedDate) {
      setSelectedDate(format(selectedDate, "yyyy-MM-dd"))
    } else {
      setSelectedDate("")
    }
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 dark:text-gray-100">
      <BreadcrumbRoutas title="OCORRÊNCIAS" />

      <div className="flex flex-wrap items-center gap-4 py-4">
        <Input
          placeholder="Filtrar por site, supervisor ou detalhes..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
        
        {/* Filtro de Data */}
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Selecionar data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {selectedDate && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setDate(null)
                setSelectedDate("")
              }}
            >
              Limpar
            </Button>
          )}
        </div>
        
        {/* Filtro de Prioridade */}
        <Select value={prioridadeFiltro} onValueChange={setPrioridadeFiltro}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
           <SelectItem value="todas">Todas as Prioridades</SelectItem>
<SelectItem value="Urgente">Urgente</SelectItem>
<SelectItem value="Alta">Alta</SelectItem>
<SelectItem value="Média">Média</SelectItem>
<SelectItem value="Baixa">Baixa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border dark:border-gray-700">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-700">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isFiltering ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((col, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : currentPageRows.length ? (
              currentPageRows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="p-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24 dark:text-gray-300">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center mt-6">
        <Pagination>
          <PaginationContent>
            {[...Array(totalPages).keys()].map(page => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === table.getState().pagination.pageIndex}
                  onClick={(e) => {
                    e.preventDefault()
                    table.setPageIndex(page)
                  }}
                >
                  <span className="text-blue-600 dark:text-blue-400"> {page + 1}</span>
                </PaginationLink>
              </PaginationItem>
            ))}
          </PaginationContent>
        </Pagination>
      </div>
      
      {dadosSelecionados && (
        <ModalOcorrencia
          open={modalOpen}
          onOpenChange={setModalOpen}
          dados={dadosSelecionados}
        />
      )}
    </div>
  )
}