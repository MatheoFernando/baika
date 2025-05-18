"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import instance from "@/src/lib/api"
import { SupervisorDataTable } from "./supervision-data-table"
import { SupervisorEditForm } from "./supervision-edit"
import { columns, Supervisor } from "./supervision-columns"
import { Card } from "@/src/infrastructure/ui/card"

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
 
  useEffect(() => {
    fetchSupervisors()
    
    const handleEditEvent = (event: Event) => {
      const supervisor = (event as CustomEvent).detail
      setEditingSupervisor(supervisor)
      setIsDialogOpen(true)
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
      await instance.put( `/user/updateMe/${editedSupervisor._id}`, editedSupervisor )
      
      setSupervisors(prev => 
        prev.map(sup => 
          sup._id === editedSupervisor._id ? editedSupervisor : sup
        )
      )
      
      return Promise.resolve()
    } catch (error) {
      console.error("Erro ao atualizar supervisor:", error)
      return Promise.reject(error)
    }
  }
  
  return (
  
        <Card className=" bg-white dark:bg-gray-800 p-8">
       <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Supervisores</h1>
      </div>
      
      <SupervisorDataTable 
        columns={columns} 
        data={supervisors} 
        loading={loading} 
      />
      
      <SupervisorEditForm 
        supervisor={editingSupervisor}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={updateSupervisor}
      />
        </Card>
     
    
  )
}