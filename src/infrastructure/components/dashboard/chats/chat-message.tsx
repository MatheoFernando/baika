
import { Avatar, AvatarFallback, AvatarImage } from '@/src/infrastructure/ui/avatar'
import { Button } from '@/src/infrastructure/ui/button'
import { cn } from '@/src/lib/utils'
import { Message } from '@/src/types/chat'
import { Check, CheckCheck, Clock, AlertCircle, Trash2, Edit } from 'lucide-react'
import { useState } from 'react'
interface ChatMessageProps {
  message: Message
  onDelete?: (messageId: string) => void
  onEdit?: (messageId: string, newContent: string) => void
}

export default function ChatMessage({ message, onDelete, onEdit }: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)

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

  const handleEdit = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim())
    }
    setIsEditing(false)
  }

  return (
    <div className={cn("flex gap-2 sm:gap-3 group", message.isUser ? "justify-end" : "justify-start")}>
      {!message.isUser && (
        <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0 mt-1">
          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Supervisor" />
          <AvatarFallback className="text-xs">S</AvatarFallback>
        </Avatar>
      )}
      <div className={cn("max-w-[85%] sm:max-w-[75%] min-w-0", message.isUser ? "order-1" : "order-2")}>
        <div
          className={cn(
            "rounded-2xl p-2 break-words relative",
            message.isUser 
              ? "bg-blue-600 rounded-br-md text-white" 
              : "bg-gray-100 text-gray-900 rounded-bl-md",
            message.status === 'failed' && "border-2 border-red-300"
          )}
        >
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-transparent border border-gray-300 rounded p-1 text-sm resize-none"
                rows={2}
              />
              <div className="flex gap-1">
                <Button size="sm" onClick={handleEdit} className="h-6 text-xs">
                  Salvar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="h-6 text-xs">
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              {message.isUser && (
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="h-5 w-5 p-0 hover:bg-blue-700"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete?.(message.id)}
                    className="h-5 w-5 p-0 hover:bg-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </>
          )}
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
          <AvatarFallback className="text-xs">Eu</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
