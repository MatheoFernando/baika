"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/infrastructure/ui/dialog"
import { Input } from "@/src/infrastructure/ui/input"
import { Button } from "@/src/infrastructure/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/infrastructure/ui/select"
import { Label } from "@/src/infrastructure/ui/label"
import instance from "@/src/lib/api"
import { getUser } from "@/src/core/auth/authApi"

interface SupervisorAddFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SupervisorAddForm({ 
  open, 
  onOpenChange,
  onSuccess
}: SupervisorAddFormProps) {
  const [newSupervisor, setNewSupervisor] = React.useState({
    name: "",
    email: "",
    phoneNumber: "",
    gender: "Male",
    employeeId: "",
      address: ""
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setNewSupervisor({
        name: "",
        email: "",
        phoneNumber: "",
        gender: "Male",
        employeeId: "",
          address: ""
      })
    }
  }, [open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewSupervisor(prev => ({ ...prev, [name]: value }))
  }

  const handleGenderChange = (value: string) => {
    setNewSupervisor(prev => ({ ...prev, gender: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    try {
      const user = getUser()
      
      await instance.post(
        `/userAuth/signUp?roler=3`,
        {
          name: newSupervisor.name,
          email: newSupervisor.email,
          phoneNumber: newSupervisor.phoneNumber,
          gender: newSupervisor.gender,
          employeeId: newSupervisor.employeeId,
          password: "12345678", 
          codeEstablishment: "LA",
          admissionDate: "2000-01-01",
          situation: "efectivo",
          departmentCode: "0009999",
          mecCoordinator: user?._id,
        address: newSupervisor.address
        }
      )
      
      toast.success("Supervisor adicionado com sucesso")
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Erro ao adicionar supervisor:", error)
      toast.error("Erro ao adicionar supervisor")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Supervisor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              value={newSupervisor.name}
              onChange={handleChange}
              placeholder="Nome completo"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={newSupervisor.email}
              onChange={handleChange}
              placeholder="email@exemplo.com"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="employeeId">ID do Funcionário</Label>
            <Input
              id="employeeId"
              name="employeeId"
              type="number"
              value={newSupervisor.employeeId}
              onChange={handleChange}
              placeholder="ID do funcionário"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="phoneNumber">Telefone</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
                type="number"
              value={newSupervisor.phoneNumber}
              onChange={handleChange}
              placeholder="+(244) XXXXXXXXX"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Endereço:</Label>
            <Input
              id="address"
              name="address"
              value={newSupervisor.address}
              onChange={handleChange}
              placeholder="Endereço"
            />
          </div>
         
          
          <div className="grid gap-2">
            <Label htmlFor="gender">Gênero</Label>
            <Select 
              value={newSupervisor.gender} 
              onValueChange={handleGenderChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Masculino</SelectItem>
                <SelectItem value="Female">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Adicionando...
                </>
              ) : (
                "Adicionar supervisor"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}