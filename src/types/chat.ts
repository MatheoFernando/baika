export interface Message {
  id: number
  sender: string
  content: string
  timestamp: string
  isUser: boolean
  status?: "sending" | "sent" | "delivered" | "read" | "failed"
  isEmpty?: boolean
}

export interface User {
  id: string
  name: string
  employeeId?: string
  mecCoordinator?: string
  avatar?: string
  status: "online" | "offline" | "away" | "busy"
  lastMessage?: string
  time?: string
  unread?: number
}
