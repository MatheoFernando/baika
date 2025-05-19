"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Edit, Trash, Server } from "lucide-react"
import { Button } from "@/src/infrastructure/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/infrastructure/ui/alert-dialog"
import { toast } from "sonner"

export type Site = {
  _id: string
  name: string
  address: string
  costCenter?: string
  clientCode: string
  location: any
  mec?: string
  ctClient?: string
}

export const columns: ColumnDef<Site>[] = [
  {
    accessorKey: "_id",
    header: "ID",
    cell: ({ row }) => <div className="truncate max-w-[100px]">{row.getValue("_id")}</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "address",
    header: "Endereço",
    cell: ({ row }) => <div>{row.getValue("address")}</div>,
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const site = row.original

      const handleDelete = async () => {
        try {
          // Dispatch custom event for delete handling in parent component
          window.dispatchEvent(
            new CustomEvent('delete-site', { detail: site._id })
          )
        } catch (error) {
          console.error("Erro ao remover site:", error)
          toast.error("Erro ao remover site")
        }
      }

      return (
        <div className="flex items-center gap-2">
          {/* Edit Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-900 hover:bg-blue-100"
            onClick={() => window.dispatchEvent(new CustomEvent('edit-site', { detail: site }))}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>

          {/* Equipment Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 text-green-600 hover:text-green-900 hover:bg-green-100"
            onClick={() => {
              if (site.costCenter) {
                window.location.href = `/equipmentList?costCenter=${site.costCenter}`
              } else {
                toast.error("Este site não possui um centro de custo associado.")
              }
            }}
          >
            <Server className="h-4 w-4" />
            <span className="sr-only">Equipamentos</span>
          </Button>

          {/* Delete Button with Confirmation */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-900 hover:bg-red-100"
              >
                <Trash className="h-4 w-4" />
                <span className="sr-only">Remover</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o site 
                  <span className="font-medium text-gray-800 mx-1">{site.name}</span> 
                  do sistema.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    },
  },
]