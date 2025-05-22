"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Menu,
  Phone,
  Video,
  PaperclipIcon,
  Send,
  Smile,
  MoreVertical,
  Search,
  Settings,
  UserPlus,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/infrastructure/ui/avatar"
import { Button } from "@/src/infrastructure/ui/button"
import { Input } from "@/src/infrastructure/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/infrastructure/ui/tabs"
import { ScrollArea } from "@/src/infrastructure/ui/scroll-area"
import { Sheet, SheetContent } from "@/src/infrastructure/ui/sheet"
import UserStatus from "./user-status"
import ContactList from "./contact-list"
import { useMediaQuery } from "@/src/hooks/use-media-query"
import ChatMessage from "./chat-message"
import { Textarea } from "@/src/infrastructure/ui/textarea"

// Atualizar interface Message para incluir status
interface Message {
  id: number
  sender: string
  content: string
  timestamp: string
  isUser: boolean
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  isEmpty?: boolean
}

const mockMessages: Message[] = [
  { id: 1, sender: "John Doe", content: "oi", timestamp: "10:30 AM", isUser: false },
  { id: 2, sender: "You", content: "oi", timestamp: "10:32 AM", isUser: true, status: 'read' },
  {
    id: 3,
    sender: "John Doe",
    content: "Como você está?",
    timestamp: "10:35 AM",
    isUser: false,
  },
  {
    id: 4,
    sender: "You",
    content: "Estou bem, e você?",
    timestamp: "10:38 AM",
    isUser: true,
    status: 'delivered',
  },
]

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [activeChat, setActiveChat] = useState("John Doe")
  const [showEmptyWarning, setShowEmptyWarning] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isDesktop = useMediaQuery("(min-width: 868px)")
  const isMobile = useMediaQuery("(max-width: 640px)")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (newMessage.length > 0) {
      setIsTyping(true)
      setShowEmptyWarning(false)
    } else {
      setIsTyping(false)
    }
  }, [newMessage])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar se a mensagem está vazia
    if (newMessage.trim() === "") {
      setShowEmptyWarning(true)
      // Adicionar mensagem vazia temporária para mostrar o aviso
      const emptyMsg: Message = {
        id: Date.now(),
        sender: "System",
        content: "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isUser: false,
        isEmpty: true,
      }
      setMessages(prev => [...prev, emptyMsg])
      
      // Remover o aviso após 3 segundos
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.id !== emptyMsg.id))
        setShowEmptyWarning(false)
      }, 3000)
      return
    }

    const newMsg: Message = {
      id: Date.now(),
      sender: "voce",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isUser: true,
      status: 'sending',
    }

    setMessages(prev => [...prev, newMsg])
    setNewMessage("")

    // Simular progresso do status da mensagem
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMsg.id ? { ...msg, status: 'sent' as const } : msg
        )
      )
    }, 500)

    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMsg.id ? { ...msg, status: 'delivered' as const } : msg
        )
      )
    }, 1000)

    // Simular resposta automática
    setTimeout(() => {
      const response: Message = {
        id: Date.now() + 1,
        sender: "John Doe",
        content: "Obrigado pela sua mensagem! Vou responder em breve.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isUser: false,
      }
      setMessages(prev => [...prev, response])
      
      // Marcar como lido após receber resposta
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMsg.id ? { ...msg, status: 'read' as const } : msg
        )
      )
    }, 2000)
  }

  const renderSidebar = () => (
    <div className="w-full h-full flex flex-col ">
      <div className="p-3 sm:p-4 flex items-center justify-between border-b shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
            <AvatarFallback className="text-xs">Eu</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm truncate">Meu Nome</h3>
            <UserStatus status="online" />
          </div>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3 sm:p-4 shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar conversa..." className="pl-8 h-9" />
        </div>
      </div>

      <Tabs defaultValue="chats" className="flex flex-col min-h-0 p-4 mt-2">
        <TabsList className="grid grid-cols-3 w-full ">
          <TabsTrigger value="chats" className="text-xs sm:text-sm">Conversa</TabsTrigger>
          <TabsTrigger value="groups" className="text-xs sm:text-sm">Grupo</TabsTrigger>
          <TabsTrigger value="contacts" className="text-xs sm:text-sm">Contatos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chats" className="flex-1 min-h-0 mt-2">
          <ScrollArea className="h-full">
            <ContactList
              activeChat={activeChat}
              setActiveChat={(name) => {
                setActiveChat(name)
                if (!isDesktop) {
                  setSidebarOpen(false)
                }
              }}
            />
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="groups" className="flex-1 min-h-0 mt-2">
          <ScrollArea className="h-full">
            <div className="p-4">
              <p className="text-center text-muted-foreground text-sm">Sem grupos criados</p>
              <Button className="w-full mt-4" variant="outline" size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Criar Grupo
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="contacts" className="flex-1 min-h-0 mt-2">
          <ScrollArea className="h-full">
            <ContactList
              activeChat={activeChat}
              setActiveChat={(name) => {
                setActiveChat(name)
                if (!isDesktop) {
                  setSidebarOpen(false)
                }
              }}
              showLastMessage={false}
            />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )

  return (
    <div className="flex bg-background overflow-hidden">
      {isDesktop ? (
        <div className=" border-r h-full shrink-0">{renderSidebar()}</div>
      ) : (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[480px] pt-8">
            {renderSidebar()}
          </SheetContent>
        </Sheet>
      )}

      <div className="flex-1 flex flex-col h-full min-w-0">
        <div className="border-b p-3 sm:p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {!isDesktop && (
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="shrink-0 h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt={activeChat} />
                <AvatarFallback className="text-xs">{activeChat[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm sm:text-base truncate">{activeChat}</h3>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="relative flex h-2 w-2 mr-1 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="truncate">Online</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Video className="h-4 w-4" />
            </Button>
            {!isMobile && (
              <>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <ScrollArea className="h-full">
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isTyping && !messages[messages.length - 1].isUser && (
                <div className="flex items-start gap-2 sm:gap-3">
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt={activeChat} />
                    <AvatarFallback className="text-xs">{activeChat[0]}</AvatarFallback>
                  </Avatar>
                  <div className="bg-secondary p-2 sm:p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div
                        className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        <div className="border-t p-3 sm:p-4 shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <Button type="button" variant="ghost" size="icon" className="shrink-0 h-8 w-8 sm:h-9 sm:w-9">
              <PaperclipIcon className="h-4 w-4" />
            </Button>
            <div className="flex-1 relative min-w-0">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Mensagem..."
                className={`min-h-[36px] max-h-24 resize-none pr-10 text-sm ${showEmptyWarning ? 'border-red-300 focus:border-red-500' : ''}`}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 bottom-1 h-6 w-6 sm:h-8 sm:w-8"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              type="submit" 
              size="icon" 
              className="bg-blue-600 hover:bg-blue-700 shrink-0 h-8 w-8 sm:h-9 sm:w-9" 
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}