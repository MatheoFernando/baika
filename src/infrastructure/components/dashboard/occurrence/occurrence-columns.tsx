"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/src/infrastructure/ui/button"
import { ArrowUpDown, FileText, Eye } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/src/infrastructure//ui/badge"
import { AlertDialogTrigger } from "@/src/infrastructure/ui/alert-dialog"

export type Notification = {
  _id: string
  idNotification?: string
  createdAt: string
  createdAtTime: string
  createdAtDate: Date
  siteName: string
  costCenter: string
  supervisorName: string
  priority: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA"
  details: string
  numberOfWorkers?: number
  workerInformation?: WorkerInfo[]
  equipment?: Equipment[]
}

type WorkerInfo = {
  name: string
  employeeNumber: string
  state: string
  obs?: string
}

type Equipment = {
  name: string
  serialNumber: string
  state: string
  costCenter: string
  obs?: string
}

// Priority badge rendering helper
const PriorityBadge = ({ priority }: { priority: Notification["priority"] }) => {
  const priorityConfig = {
    BAIXA: { color: "bg-green-100 text-green-800", label: "Baixa" },
    MEDIA: { color: "bg-yellow-100 text-yellow-800", label: "Média" },
    ALTA: { color: "bg-orange-100 text-orange-800", label: "Alta" },
    CRITICA: { color: "bg-red-100 text-red-800", label: "Crítica" }
  }

  const config = priorityConfig[priority] || { color: "bg-gray-100 text-gray-800", label: priority ?? "Desconhecido" }
  const { color, label } = config

  return (
    <Badge className={`${color} font-medium`}>
      {label}
    </Badge>
  )
}

export const columns = (onViewDetails: (notification: Notification) => void): ColumnDef<Notification>[] => [
  {
    accessorKey: "createdAtTime",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Hora
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("createdAtTime")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Data
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("createdAt")}</div>,
    filterFn: (row, id, value) => {
      const rowDate = row.getValue(id) as string
      const [day, month, year] = rowDate.split('/').map(n => parseInt(n, 10))
      const date = new Date(year, month - 1, day)
      return format(date, 'yyyy-MM-dd') === value
    }
  },
  {
    accessorKey: "siteName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Site
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("siteName")}</div>,
  },
  {
    accessorKey: "supervisorName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Supervisor
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("supervisorName")}</div>,
  },
  {
    accessorKey: "details",
    header: "Detalhes",
    cell: ({ row }) => {
      const details = row.getValue("details") as string
      return (
        <div className="max-w-[200px] truncate" title={details}>
          {details}
        </div>
      )
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Prioridade
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <PriorityBadge priority={row.getValue("priority")} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const notification = row.original
      
      return (
        <div className="flex items-center gap-2">
          <div >
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewDetails(notification)}  >
              <Eye className="h-4 w-4" />
          
            </Button>
          </div>
          
            <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            id={`download-pdf-${notification._id}`}
            onClick={() => {
              // Dispara evento para baixar PDF deste id
              window.dispatchEvent(new CustomEvent('downloadPDF', { 
              detail: { id: notification._id, name: notification.siteName } 
              }))
            }}
            >
            <FileText className="h-4 w-4" />
            PDF
            </Button>
        </div>
      )
    },
  },
]