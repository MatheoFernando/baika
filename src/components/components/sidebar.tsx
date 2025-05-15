"use client";

import { useState } from "react";
import { 
  Home, 
  Users, 
  AlertCircle, 
  BarChart2, 
  Map, 
  MessageSquare, 
  FileText,
  Menu,
  PanelLeftOpen,
  Settings,
  ChevronDown
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import Link from "next/link";
import { Collapsible , CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import Image from "next/image";

interface SidebarProps {
  className?: string;
}

// Type for menu items
interface MenuItem {
  icon: any;
  label: string;
  href: string;
  items?: {
    title: string;
    href: string;
  }[];
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleItem = (label: string) => {
    setOpenItems(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const menuItems: MenuItem[] = [
    { icon: Home, label: "Início", href: "/" },
    { icon: Users, label: "Supervisores", href: "/supervisores" },
    { 
      icon: AlertCircle, 
      label: "Supervisão", 
      href: "#", 
      items: [
        {
          title: "Perfil",
          href: "/supervisao/perfil"
        },
        {
          title: "Editar",
          href: "/supervisao/editar"
        }
      ]
    },
    { icon: AlertCircle, label: "Ocorrências", href: "/ocorrencias" },
    { icon: BarChart2, label: "Estatísticas", href: "/estatisticas" },
    { icon: Map, label: "Maps", href: "/maps" },
    { icon: MessageSquare, label: "Chat", href: "/chat" },
    { icon: FileText, label: "Relatório da Supervisão", href: "/relatorio" },
  ];

  return (
    <div className="flex ">
    <div
      className={cn(
        "h-screen flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-54",
        className
      )}
    >
      {/* Logo and toggle button */}
      <div className="flex items-center justify-between p-4 h-36">
        
        <button
          onClick={toggleSidebar}
          className={cn(
            "p-1 rounded-full hover:bg-gray-100",
            collapsed ? "ml-auto mr-0" : ""
          )}
        >
          {collapsed ? (
            <PanelLeftOpen size={20} />
          ) : (
            <Menu size={20} />
          )}
        </button>
     
 
    
      </div>

      {/* Menu section */}
      <div className="flex-1 overflow-y-auto ">
        {collapsed ? (
          <div className="px-4 py-2">
            <div className=""></div>
          </div>
        ) : (
          <div className="px-4 py-2">
            <span className="text-sm text-gray-500">Menu</span>
          </div>
        )}

        <nav className="mt-2">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.items ? (
                <Collapsible
                  open={openItems[item.label] && !collapsed}
                  onOpenChange={() => toggleItem(item.label)}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center w-full px-4 py-2 text-gray-700  hover:bg-gray-100",
                        collapsed ? "justify-center" : "justify-between"
                      )}
                    >
                      <div className="flex items-center text-sm">
                        <item.icon size={20} className={collapsed ? "" : "mr-3"} />
                        {!collapsed && <span>{item.label}</span>}
                      </div>
                      {!collapsed && (
                        <ChevronDown
                          size={16}
                          className={cn(
                            "transition-transform duration-200",
                            openItems[item.label] ? "transform rotate-180" : ""
                          )}
                        />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {!collapsed && (
                      <div className="pl-9 py-1 space-y-1">
                        {item.items.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            href={subItem.href}
                            className="block py-1.5 px-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-2 text-gray-700 text-sm hover:bg-gray-100",
                    collapsed ? "justify-center" : ""
                  )}
                >
                  <item.icon size={20} className={collapsed ? "" : "mr-3"} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer section */}
      <div className="mt-auto mb-4 px-4">
     
      
      </div>
    </div>
     <div className="mt-4 ">
                  <Image src="/logo.png" alt="Logo" width={50} height={50} className="size-24 object-contain"/>
     </div>
    </div>
  );
}