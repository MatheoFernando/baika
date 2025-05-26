"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown,  Edit, Trash, Eye } from "lucide-react"
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
import { DataTable } from "../data-table"
import instance from "@/src/lib/api"
import { SupervisorDetailModal } from "../supervisor/supervisor-Detail-Modal"
import { SupervisorAddForm } from "../supervisor/supervision-Add-Form"
import { SupervisorEditForm } from "../supervisor/supervision-edit"
import { BreadcrumbRoutas } from "../../ulils/breadcrumbRoutas"

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


export function SupervisorTable() {
  const [data, setData] = React.useState<Supervisor[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [supervisors, setSupervisors] = React.useState<Supervisor[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editingSupervisor, setEditingSupervisor] = React.useState<Supervisor | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
 

 
  React.useEffect(() => {
    fetchSupervisors()
    
    const handleEditEvent = (event: Event) => {
      const supervisor = (event as CustomEvent).detail
      setEditingSupervisor(supervisor)
      setIsEditDialogOpen(true)
    }
    
    window.addEventListener('edit-supervisor', handleEditEvent as EventListener)
    
    return () => {
      window.removeEventListener('edit-supervisor', handleEditEvent as EventListener)
    }
  }, [])
  
  const fetchSupervisors = async () => {
    setLoading(true)
    try {
      const response = await instance.get( `/user?size=100` ) 
      if (response.data && Array.isArray(response.data.data.data)) {
        const formattedData = response.data.data.data.map((user: any) => ({
          _id: user._id,
          name: user.name || "Sem nome",
          phoneNumber: user.phoneNumber || "Não informado",
          email: user.email,
          active: user.active !== false, 
          avatar: user.avatar
        }))
        
        setSupervisors(formattedData)
        setData(formattedData) // Atualizando também o estado data que é usado na DataTable
      } else {
        toast.error("Formato de resposta inválido")
      }
    } catch (error) {
      console.error("Erro ao buscar supervisores:", error)
      toast.error("Não foi possível carregar os supervisores")
    } finally {
      setLoading(false)
    }
  }
  
  const updateSupervisor = async (editedSupervisor: Supervisor) => {
    try {
      const { _id, active, ...payload } = editedSupervisor
      await instance.put( `/user/updateMe/${_id}`, payload )
      
      // Atualizando ambos os estados
      const updatedSupervisors = supervisors.map(sup => 
        sup._id === _id ? { ...sup, ...payload, _id } : sup
      );
      
      setSupervisors(updatedSupervisors);
      setData(updatedSupervisors);
      
      return Promise.resolve()
    } catch (error) {
      console.error("Erro ao atualizar supervisor:", error)
      return Promise.reject(error)
    }
  }

  const handleAddClick = () => {
    setIsAddDialogOpen(true)
  }

  
 const columns: ColumnDef<Supervisor>[] = [
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

  const handleAddSupervisor = () => {
    setIsAddDialogOpen(true);
  }

  return (
    <div className="container mx-auto py-10">
          <BreadcrumbRoutas title="Supervisores"  productName="Inicio" showBackButton />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        title="Supervisores"
        filterOptions={{
          enableNameFilter: true,
          enableColumnVisibility: true,
          enableAddButton: true,
          addButtonLabel: "Adicionar Supervisor",
        }}
        onAddClick={handleAddSupervisor}
        initialColumnVisibility={{
          email: false,
        }}
      />
          <SupervisorEditForm
        supervisor={editingSupervisor}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={updateSupervisor}
      />

      <SupervisorAddForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={fetchSupervisors} />

      <SupervisorDetailModal />
    </div>
  )
}