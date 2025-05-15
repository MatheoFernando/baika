'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/src/components/components/ui/input'
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList
} from '@/src/components/components/ui/command'

const MOCK_DATA = [
  { id: 1, email: 'joao@email.com' },
  { id: 2, email: 'maria@email.com' },
  { id: 3, email: 'carlos@email.com' },
  { id: 4, email: 'ana@email.com' }
]

export default function SearchDashboard() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = MOCK_DATA.filter((item) =>
    item.email.toLowerCase().includes(query.toLowerCase())
  )

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative max-w-xl w-full">
      <div className="flex items-center relative">
        <Input
          placeholder="Pesquisar..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          className="pr-12 py-4.5 border rounded-4xl outline-none bg-white focus:outline-none focus:ring-0  focus-visible:ring-1 focus-visible:border-blue-600 "
        />
        {query && (
          <button
            className="absolute right-2 text-gray-500 hover:text-gray-800"
            onClick={() => {
              setQuery('')
              setOpen(false)
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {open && query && (
        <Command className="absolute z-50 bg-white w-full h-16 border rounded-md shadow-md">
          <CommandList>
            {filtered.length === 0 ? (
              <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
            ) : (
              filtered.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => {
                    setQuery(item.email)
                    setOpen(false)
                  }}
                >
                  {item.email}
                </CommandItem>
              ))
            )}
          </CommandList>
        </Command>
      )}
    </div>
  )
}
