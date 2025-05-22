import ChatInterface from '@/src/infrastructure/components/dashboard/chats/chat-interface'
import { Card } from '@/src/infrastructure/ui/card'
import React from 'react'

export default function Chat() {
  return (
    <Card className='bg-white '>
        <ChatInterface />
    </Card>
  )
}
