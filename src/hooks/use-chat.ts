"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import instance from "../lib/api"
import { CurrentUser, Message, Supervisor } from "../types/chat"
import { socketManager } from "../lib/socket"

interface UseChatProps {
  currentUser: CurrentUser
}

export function useChat({ currentUser }: UseChatProps) {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())

  const currentUserRef = useRef(currentUser.employeeId)
  const socketInitialized = useRef(false)

 

  const fetchSupervisors = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await instance.get("/user?size=100")

      if (response.data && Array.isArray(response.data.data.data)) {
        const supervisorData = response.data.data.data
          .filter((user: any) => user.mecCoordinator !== currentUser.mecCoordinator) // Exclude current user
          .map((user: any) => ({
            id: user.id,
            employeeId: user.employeeId,
            mecCoordinator: user.mecCoordinator,
            name: user.name || `${user.firstName} ${user.lastName}`,
            email: user.email,
            avatar: user.avatar,
            status: user.isOnline ? "online" : "offline",
            lastMessage: "",
            lastMessageTime: "",
            unreadCount: 0,
          }))
        setSupervisors(supervisorData)
      }
    } catch (error) {
      console.error("Error fetching supervisors:", error)
      toast.error("Erro ao carregar supervisores")
    } finally {
      setIsLoading(false)
    }
  }, [currentUser.mecCoordinator])

  const fetchMessages = useCallback(async (selectedSupervisorEmployeeId: string) => {
    try {
      setIsLoading(true)
      console.log("Fetching messages for:", {
        currentUserMecCoordinator: currentUserRef.current,
        selectedSupervisorEmployeeId: selectedSupervisorEmployeeId,
      })

      const response = await instance.get(
        `/chat/${currentUserRef}/${selectedSupervisorEmployeeId}`,
      )

      if (response.data && Array.isArray(response.data.data)) {
        const chatMessages = response.data.data.map((msg: any) => ({
          id: msg.id,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          content: msg.content,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: msg.status || "sent",
          isUser: msg.senderId === currentUserRef.current,
        }))
        setMessages(chatMessages)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast.error("Erro ao carregar mensagens")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendMessage = useCallback(async (content: string, receiverEmployeeId: string) => {
    if (!content.trim()) {
      toast.error("Mensagem não pode estar vazia")
      return
    }

    console.log("Sending message:", {
      from: currentUserRef.current,
      to: receiverEmployeeId,
      content: content,
    })

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: currentUserRef.current,
      receiverId: receiverEmployeeId,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sending",
      isUser: true,
    }

    setMessages((prev) => [...prev, tempMessage])

    try {
      const response = await instance.post(
        `/chat/send/${currentUserRef.current}/${receiverEmployeeId}`,
        {
          content,
        },
      )

      if (response.data) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempMessage.id ? { ...msg, id: response.data.id, status: "sent" } : msg)),
        )

        socketManager.sendMessage({
          messageId: response.data.id,
          senderId: currentUserRef.current,
          receiverId: receiverEmployeeId,
          content,
          timestamp: response.data.createdAt,
        })

        toast.success("Mensagem enviada")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => prev.map((msg) => (msg.id === tempMessage.id ? { ...msg, status: "failed" } : msg)))
      toast.error("Erro ao enviar mensagem")
    }
  }, [])

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await instance.delete(`/chat/delete/${messageId}/${currentUserRef.current}`)
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
      toast.success("Mensagem deletada")
    } catch (error) {
      console.error("Error deleting message:", error)
      toast.error("Erro ao deletar mensagem")
    }
  }, [])

  const updateMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      const response = await instance.put(`/chat/update/${messageId}/${currentUserRef.current}`, {
        content: newContent,
      })

      if (response.data) {
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, content: newContent } : msg)))
        toast.success("Mensagem atualizada")
      }
    } catch (error) {
      console.error("Error updating message:", error)
      toast.error("Erro ao atualizar mensagem")
    }
  }, [])

  // Socket connection
  useEffect(() => {
    if (socketInitialized.current) return

    const socket = socketManager.connect(currentUser.mecCoordinator)
    socketInitialized.current = true

    const handleConnect = () => {
      setIsConnected(true)
      toast.success("Conectado ao chat")
    }

    const handleDisconnect = () => {
      setIsConnected(false)
      toast.error("Desconectado do chat")
    }

    const handleMessageReceived = (message: any) => {
      const newMessage: Message = {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        timestamp: new Date(message.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "delivered",
        isUser: message.senderId === currentUserRef.current,
      }
      setMessages((prev) => [...prev, newMessage])

      if (!newMessage.isUser) {
        toast.success(`Nova mensagem de ${message.senderName || "Supervisor"}`)
      }
    }

    const handleMessageStatusUpdate = (data: any) => {
      setMessages((prev) => prev.map((msg) => (msg.id === data.messageId ? { ...msg, status: data.status } : msg)))
    }

    const handleUserTyping = (data: any) => {
      if (data.userId !== currentUserRef.current) {
        setTypingUsers((prev) => new Set([...prev, data.userId]))
      }
    }

    const handleUserStoppedTyping = (data: any) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(data.userId)
        return newSet
      })
    }

    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    socketManager.onMessageReceived(handleMessageReceived)
    socketManager.onMessageStatusUpdate(handleMessageStatusUpdate)
    socketManager.onUserTyping(handleUserTyping)
    socketManager.onUserStoppedTyping(handleUserStoppedTyping)

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socketManager.disconnect()
      socketInitialized.current = false
      setIsConnected(false)
    }
  }, [currentUser.mecCoordinator])

  useEffect(() => {
    fetchSupervisors()
  }, [fetchSupervisors])

  return {
    supervisors,
    messages,
    isLoading,
    isConnected,
    typingUsers,
    fetchMessages,
    sendMessage,
    deleteMessage,
    updateMessage,
    fetchSupervisors,
  }
}
