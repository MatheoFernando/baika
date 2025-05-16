"use client"

import { Bell } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/infrastructure/ui/dropdown-menu"
import { Badge } from "../../../ui/badge"

const notifications = [
  {
    id: 1,
    title: "Novo pedido recebido",
    description: "Você recebeu um novo pedido de serviço.",
  },
  {
    id: 2,
    title: "Conta atualizada",
    description: "Suas informações foram atualizadas com sucesso.",
  },
]

export function Bells() {
  const hasNotifications = notifications.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative cursor-pointer p-2 hover:bg-muted rounded-full transition-colors">
          <Bell  />
    
          {hasNotifications && (
            <Badge
              className="absolute top-0 -right-1.5 h-4 w-4 p-0 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold"
              variant="default"
            >
              {notifications.length}
            </Badge>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="min-w-64 rounded-xl shadow-xl"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-sm font-medium text-muted-foreground">
          Notificações
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex flex-col items-start px-2 py-2 gap-0.5 hover:bg-muted"
            >
              <span className="text-sm font-semibold">{notification.title}</span>
              <span className="text-xs text-muted-foreground">{notification.description}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        {notifications.length === 0 && (
          <DropdownMenuItem className="text-sm text-muted-foreground">
            Sem novas notificações.
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
