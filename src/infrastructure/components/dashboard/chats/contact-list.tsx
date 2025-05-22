"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/src/infrastructure/ui/avatar"
import { Badge } from "@/src/infrastructure/ui/badge"
import { cn } from "@/src/lib/utils"
import UserStatus from "./user-status"

interface ContactListProps {
  activeChat: string
  setActiveChat: (name: string) => void
  showLastMessage?: boolean
}

const contacts = [
  {
    id: 1,
    name: "John Doe",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    lastMessage: "Did you get a chance to look at the project?",
    time: "10:50 AM",
    unread: 2,
  },
  {
    id: 2,
    name: "Jane Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
    lastMessage: "Let's meet tomorrow to discuss the details.",
    time: "Yesterday",
    unread: 0,
  },
  {
    id: 3,
    name: "Mike Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "away",
    lastMessage: "I've sent you the files you requested.",
    time: "Yesterday",
    unread: 0,
  },
  {
    id: 4,
    name: "Sarah Williams",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    lastMessage: "Can we schedule a call for next week?",
    time: "Monday",
    unread: 0,
  },

]

export default function ContactList({ activeChat, setActiveChat, showLastMessage = true }: ContactListProps) {
  return (
    <div className="space-y-3 ">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className={cn(
            "flex items-center gap-2 sm:gap-3 p-2 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors min-h-0",
            activeChat === contact.name && "bg-blue-100",
          )}
          onClick={() => setActiveChat(contact.name)}
        >
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
              <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
              <AvatarFallback className="text-sm">{contact.name[0]}</AvatarFallback>
            </Avatar>
            {contact.status === "online" && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
            )}
            {contact.status === "away" && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-yellow-500 border-2 border-background"></span>
            )}
            {contact.status === "busy" && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-background"></span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-medium truncate text-xs sm:text-sm">{contact.name}</h4>
              <span className="text-xs text-muted-foreground shrink-0">{contact.time}</span>
            </div>
            
            {showLastMessage && (
              <div className="flex items-center justify-between gap-2 mt-1">
                <p className="text-xs  text-muted-foreground truncate flex-1 leading-relaxed">
                  {contact.lastMessage}
                </p>
                {contact.unread > 0 && (
                  <Badge 
                    variant="default" 
                    className="shrink-0 p-1  min-w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700"
                  >
                    {contact.unread}
                  </Badge>
                )}
              </div>
            )}
            
            {!showLastMessage && (
              <div className="mt-1">
                <UserStatus status={contact.status} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}