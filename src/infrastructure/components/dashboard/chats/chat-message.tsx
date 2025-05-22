
import { Avatar, AvatarFallback, AvatarImage } from '@/src/infrastructure/ui/avatar'
import { cn } from '@/src/lib/utils'
import { Message } from '@/src/types/chat'
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react'

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  // Se a mensagem estiver vazia, mostrar aviso
  if (message.isEmpty || !message.content.trim()) {
    return (
      <div className="flex justify-center my-4">
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">Mensagem vazia não pode ser enviada</span>
        </div>
      </div>
    )
  }

  const renderStatusIcon = () => {
    if (!message.isUser) return null

    switch (message.status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400 animate-pulse" />
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-500" />
      default:
        return <Check className="h-3 w-3 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (message.status) {
      case 'sending':
        return 'Enviando...'
      case 'sent':
        return 'Enviado'
      case 'delivered':
        return 'Entregue'
      case 'read':
        return 'Lido'
      case 'failed':
        return 'Falha no envio'
      default:
        return 'Enviado'
    }
  }

  return (
    <div className={cn("flex gap-2 sm:gap-3", message.isUser ? "justify-end" : "justify-start")}>
      {!message.isUser && (
        <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0 mt-1">
          <AvatarImage src="/placeholder.svg?height=32&width=32" alt={message.sender} />
          <AvatarFallback className="text-xs">{message.sender[0]}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn("max-w-[85%] sm:max-w-[75%] min-w-0", message.isUser ? "order-1" : "order-2")}>
        <div
          className={cn(
            "rounded-2xl p-2 break-words",
            message.isUser 
              ? "bg-blue-600 rounded-br-md text-black" 
              : "bg-gray-600 text-black rounded-bl-md",
            message.status === 'failed' && "border-2 border-red-300"
          )}
        >
          <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className={cn("text-xs text-gray-600 mt-1 px-1 flex items-center gap-1", message.isUser ? "text-right justify-end" : "text-left justify-start")}>
          <span>{message.timestamp}</span>
          {message.isUser && (
            <>
              {renderStatusIcon()}
              <span className="text-xs">{getStatusText()}</span>
            </>
          )}
        </div>
      </div>
      {message.isUser && (
        <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0 order-2 mt-1">
          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="You" />
          <AvatarFallback className="text-xs">Você</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
