"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, Edit, Trash, Eye } from "lucide-react"
import { Button } from "@/src/infrastructure/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/infrastructure/ui/avatar"
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

export type Supervisor = {
  _id: string
  name: string
  phoneNumber: string
  email?: string
  avatar?: string
  active?: boolean
  employeeId?: string
  address?: string
  createdAt?: string
  mecCoordinator?: string
}

export const columns: ColumnDef<Supervisor>[] = [
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
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            {!user.avatar && user.name ? (
              <AvatarFallback className="flex items-center justify-center bg-gray-400 text-white rounded-full font-semibold">
                {user.name.split(" ").slice(0, 1).join("")[0]?.toUpperCase()}
                {user.name.split(" ").length > 1 &&
                  user.name.split(" ").slice(-1).join("")[0]?.toUpperCase()}
              </AvatarFallback>
            ) : (
              <AvatarFallback>
                {user.name?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="font-medium">{user.name}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "phoneNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Telefone
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("phoneNumber")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const supervisor = row.original
      
      const handleDelete = async () => {
        try {
          toast.success("Supervisor removido com sucesso")
        } catch (error) {
          console.error("Erro ao remover supervisor:", error)
          toast.error("Erro ao remover supervisor")
        }
      }
      
      return (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 p-0 cursor-pointer text-gray-600 hover:text-green-900 hover:bg-green-100"
            onClick={() => window.dispatchEvent(new CustomEvent('view-supervisor-detail', { detail: supervisor }))}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Ver Detalhes</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-900 hover:bg-blue-100"
            onClick={() => window.dispatchEvent(new CustomEvent('edit-supervisor', { detail: supervisor }))}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
          
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
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o supervisor <span className="font-medium text-gray-800">{supervisor.name}</span> do sistema.
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