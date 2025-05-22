"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { io, Socket } from "socket.io-client"
import Pusher from "pusher-js"
import { toast } from "sonner"
import instance from "../lib/api"
import { getUser } from "../core/auth/authApi"

export interface Message {
  id: number
  sender: string
  content: string
  timestamp: string
  isUser: boolean
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  isEmpty?: boolean
  createdAt?: string
  employeeId?: string
}

export interface User {
  employeeId: string
  name: string
  avatar?: string
  status?: 'online' | 'offline' | 'away' | 'busy'
  lastMessage?: string
  time?: string
  unread?: number
  mecCoordinator?: string
}

interface UseChatReturn {
  userList: User[]
  selectedUser: User | null
  setSelectedUser: (user: User | null) => void
  conversations: Message[]
  message: string
  setMessage: (message: string) => void
  sendMessage: () => Promise<void>
  formatMessageTime: (timestamp: string) => string
  messagesEndRef: React.RefObject<HTMLDivElement>
}

export function useChat(): UseChatReturn {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [userList, setUserList] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [conversations, setConversations] = useState<Message[]>([])
  const [message, setMessage] = useState("")
  const [novaMensagem, setNovaMensagem] = useState(false)
  const [userSender, setUserSender] = useState<string | null>(null)
  const [userReceiver, setUserReceiver] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const socketUrl ='https://provision-07c1.onrender.com'
 
  useEffect(() => {
    fetchChat()
    
    if (!socketUrl) {
      console.error("Socket URL not defined")
      return
    }
    
    const newSocket = io(socketUrl)

    newSocket.on("connect", () => {
      console.log("Conectado ao servidor Socket.io")
    })

    newSocket.on("sendMessage", (newMessage) => {
      setConversations((prevConversations) => [
        ...prevConversations,
        newMessage,
      ])
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  // Pusher subscription
  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    
    if (!pusherKey || !pusherCluster) {
      console.error("Pusher configuration missing")
      return
    }
    
    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
  
    })

    const channel = pusher.subscribe("my-channel")

    channel.bind("newMessage", (data) => {
      setNovaMensagem(true)
    })

    return () => {
      pusher.unsubscribe("my-channel")
    }
  }, [])

  // Toast notification for new messages
  useEffect(() => {
    if (novaMensagem) {
      toast.info("Nova mensagem recebida!")
      setNovaMensagem(false)
    }
  }, [novaMensagem])

  // Fetch messages when user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchMessages()
      const interval = setInterval(() => {
        fetchMessages()
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [selectedUser])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [conversations])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Fetch available chat users
  const fetchChat = async () => {
    if (!instance) {
      console.error("API URL not defined")
      return
    }
    
    try {
      const response = await instance.get(`/user/?size=50`)
      const mec = localStorage.getItem("userId")
      const filterUser = response.data.data.data.filter(
        (user: User) => user.mecCoordinator === mec
      )
      setUserList(filterUser)
    } catch (error) {
      console.error("Error fetching chat users:", error)
    }
  }

  // Fetch messages for selected user
  const fetchMessages = async () => {
    if (!selectedUser || !instance) return

    const mecCoordinator = getUser()
    console.log("mecCoordinator", mecCoordinator)
    const fetchUrl = `/chat/${mecCoordinator}/${selectedUser.employeeId}?size=500`
    const fetchUrlUser = `/chat/${selectedUser.employeeId}/${mecCoordinator}?size=500`

    try {
      const response = await axios.get(fetchUrl)
      const responseUser = await axios.get(fetchUrlUser)
      const join = [...response.data.data.data, ...responseUser.data.data.data]

      setUserSender(mecCoordinator)
      setUserReceiver(selectedUser.employeeId)
      setConversations(
        join.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      )
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!message.trim() || !userSender || !userReceiver || !instance || !socket) return
    
    const sendUrl = `/chat/send/${userSender}/${userReceiver}`
    
    try {
      const response = await instance.post(
        sendUrl,
        { message: message },
     
      )

      socket.emit("sendMessage", response.data.data.message)
      
      setConversations((prevConversations) => [
        ...prevConversations,
        response.data.data,
      ])
      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  // Format message timestamp
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const hours = date.getHours()
    const minutes = date.getMinutes()

    const formattedHours = hours < 10 ? `0${hours}` : hours
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes

    return `${formattedHours}:${formattedMinutes}`
  }

  return {
    userList,
    selectedUser,
    setSelectedUser,
    conversations,
    message,
    setMessage,
    sendMessage,
    formatMessageTime,
    messagesEndRef
  }
}
