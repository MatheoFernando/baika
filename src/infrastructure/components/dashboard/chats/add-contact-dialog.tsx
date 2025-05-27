"use client"

import { Supervisor } from "@/src/types/chat"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/src/infrastructure/ui/dialog"
import { Button } from "@/src/infrastructure/ui/button"
import { Input } from "@/src/infrastructure/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/infrastructure/ui/avatar"
import { Search, UserPlus } from "lucide-react"
import { ScrollArea } from "@/src/infrastructure/ui/scroll-area"

interface AddContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddContact: (supervisor: Supervisor) => void
  availableSupervisors: Supervisor[]
  isLoading?: boolean
}

export default function AddContactDialog({
  open,
  onOpenChange,
  onAddContact,
  availableSupervisors,
  isLoading = false,
}: AddContactDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSupervisors = availableSupervisors.filter(
    (supervisor) =>
      supervisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supervisor.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddContact = (supervisor: Supervisor) => {
    onAddContact(supervisor)
    onOpenChange(false)
    setSearchQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Supervisor</DialogTitle>
          <DialogDescription>Selecione um supervisor para adicionar aos seus contatos.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar supervisores..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <ScrollArea className="h-64">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                    <div className="h-10 w-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredSupervisors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  {searchQuery ? "Nenhum supervisor encontrado" : "Nenhum supervisor disponível"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSupervisors.map((supervisor) => (
                  <div
                    key={supervisor.employeeId}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAddContact(supervisor)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={supervisor.avatar || "/placeholder.svg"} alt={supervisor.name} />
                      <AvatarFallback>
                        {supervisor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{supervisor.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{supervisor.email}</p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
