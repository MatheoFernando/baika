"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/infrastructure/ui/dropdown-menu"

import { ChevronDown, Moon, Sun, SunMoon } from "lucide-react"

export function Mode() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])


  const renderIcon = () => {
    if (!mounted) return <SunMoon className="h-5 w-5" />
    if (resolvedTheme === "dark") return <Moon className="h-5 w-5" />
    if (resolvedTheme === "light") return <Sun className="h-5 w-5" />
    return <SunMoon className="h-5 w-5" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer flex gap-1 items-end p-2 hover:bg-muted rounded-full transition-colors">
          {renderIcon()}
          <ChevronDown className="size-3" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-40 rounded-lg shadow-xl" align="end" sideOffset={4}>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" /> Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" /> Escuro
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
