"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import instance from "@/src/lib/api"
import { SupervisorDataTable } from "./supervision-data-table"
import { SupervisorEditForm } from "./supervision-edit"
import { columns, Supervisor } from "./supervision-columns"
import { Card } from "@/src/infrastructure/ui/card"
import { SupervisorAddForm } from "./supervision-Add-Form"
import { SupervisorDetailModal } from "./supervisor-Detail-Modal"

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
 
  useEffect(() => {
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
      setSupervisors(prev => 
        prev.map(sup => 
          sup._id === _id ? { ...sup, ...payload, _id } : sup
        )
      )
      
      return Promise.resolve()
    } catch (error) {
      console.error("Erro ao atualizar supervisor:", error)
      return Promise.reject(error)
    }
  }

  const handleAddClick = () => {
    setIsAddDialogOpen(true)
  }
  
  return (
    <Card className="bg-white dark:bg-gray-800 p-8">
       
      <SupervisorDataTable 
        columns={columns} 
        data={supervisors} 
        loading={loading}
        onAddClick={handleAddClick}
      />
      
      <SupervisorEditForm 
        supervisor={editingSupervisor}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={updateSupervisor}
      />
      
      <SupervisorAddForm
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchSupervisors}
      />
      <SupervisorDetailModal/>
   
    </Card>
  )
}