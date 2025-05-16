"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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
  ChevronDown,
  Pin
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../../ui/sheet";
import Image from "next/image";
import { useTheme } from "next-themes";

interface SidebarProps {
  className?: string;
}

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
  const [isMobile, setIsMobile] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    
    checkMobile();
    
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleItem = (label: string) => {
    setOpenItems(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const primaryMenuItems: MenuItem[] = [
    { icon: Home, label: "Início", href: "/dashboard" },
    { icon: Users, label: "Supervisores", href: "/dashboard/supervisores" },
    { 
      icon: AlertCircle, 
      label: "Supervisão", 
      href: "#", 
      items: [
        {
          title: "Perfil",
          href: "/dashboard/supervisao/perfil"
        },
        {
          title: "Editar",
          href: "/dashboard/supervisao/editar"
        }
      ]
    },
    { icon: Pin, label: "Ocorrências", href: "/dashboard/occurrence" },
  ];

  const secondaryMenuItems: MenuItem[] = [
    { icon: BarChart2, label: "Estatísticas", href: "/dashboard/estatisticas" },
    { icon: Map, label: "Maps", href: "/dashboard/maps" },
    { icon: MessageSquare, label: "Chat", href: "/dashboard/chat" },
    { icon: FileText, label: "Relatório da Supervisão", href: "/dashboard/relatorio" },
  ];

  const renderMenuItem = (item: MenuItem, index: number) => (
    <div key={index}>
      {item.items ? (
        <Collapsible
          open={openItems[item.label] && !collapsed}
          onOpenChange={() => toggleItem(item.label)}
        >
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                "flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800",
                collapsed ? "justify-center" : "justify-between",
                isDarkMode ? "text-white" : "text-gray-700"
              )}
            >
              <div className="flex items-center text-sm">
                <item.icon 
                  size={20} 
                  className={cn(
                    collapsed ? "" : "mr-3",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )} 
                />
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
                    className={cn(
                      "block py-1.5 px-2 text-sm rounded-md",
                      pathname === subItem.href 
                        ? " text-blue-700  dark:text-blue-300" 
                        : isDarkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"
                    )}
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
            "flex items-center px-4 py-2 text-sm",
            collapsed ? "justify-center" : "",
            pathname === item.href 
              ? " text-blue-700  dark:text-blue-300"
              : isDarkMode ? "text-white hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <item.icon 
            size={20} 
            className={cn(
              collapsed ? "" : "mr-3",
              pathname === item.href
                ? "text-blue-700 dark:text-blue-300"
                : isDarkMode ? "text-gray-300" : "text-gray-700"
            )} 
          />
          {!collapsed && <span>{item.label}</span>}
        </Link>
      )}
    </div>
  );

  const MobileSheetContent = () => (
    <div className="py-4">
      <div className="flex items-center mb-6 px-4">
        <Image src="/logo.png" alt="Logo" width={40} height={40} className="mr-3" />
      </div>
      <nav>
         <div className="mb-2 px-4 mt-6 flex items-center">
          <span className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>Menu</span>
          <div className={cn("flex-grow h-px ml-2", isDarkMode ? "bg-gray-700" : "bg-gray-200")}></div>
        </div>
        <div className="mb-4">
          {primaryMenuItems.map((item, index) => renderMenuItem(item, index))}
        </div>
        
        <div className="mb-2 px-4 mt-6 flex items-center">
          <span className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>Mais</span>
          <div className={cn("flex-grow h-px ml-2", isDarkMode ? "bg-gray-700" : "bg-gray-200")}></div>
        </div>
        
        <div>
          {secondaryMenuItems.map((item, index) => renderMenuItem(item, index))}
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {isMobile && (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <button className={cn(
              "fixed top-4 left-4 z-40 p-2 rounded-md",
              isDarkMode ? " bg-gray-800 text-white" : " text-gray-800",
              "shadow-md"
            )}>
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className={isDarkMode ? "bg-gray-900" : "bg-white"}>
            <MobileSheetContent />
          </SheetContent>
        </Sheet>
      )}

      {!isMobile && (
        <div className="flex mt-6">
          <div
            className={cn(
              "h-screen flex flex-col transition-all duration-300",
              collapsed ? "w-32" : "w-64",
              isDarkMode ? "" : "",
              className
            )}
          >
            <div className="flex items-center justify-between p-4 h-24">
             
              <button
                onClick={toggleSidebar}
                className={cn(
                  "p-1 rounded-full",
                  isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100",
                  collapsed ? "mx-auto" : ""
                )}
              >
                {collapsed ? (
                  <PanelLeftOpen size={26} className={isDarkMode ? "text-white" : "text-gray-700"} />
                ) : (
                  <Menu size={26} className={isDarkMode ? "text-white" : "text-gray-700"} />
                )}
              </button>
               {!collapsed && (
                <div className="flex items-center">
                  <Image src="/logo.png" alt="Logo" width={80} height={80} className="mr-3" />
                </div>
              )}
              
            </div>

            <div className="flex-1 overflow-y-auto">
              {collapsed ? (
                <div className="px-4 py-2">
                  <div className=""></div>
                </div>
              ) : (
                
                  <div className="px-4 py-2 mt-6 flex items-center">
                    <span className={cn("text-xs", isDarkMode ? "text-gray-400 " : "text-gray-500")}>Menu</span>
                    <div className={cn("flex-grow h-px ml-2", isDarkMode ? "bg-gray-700" : "bg-gray-200")}></div>
                  </div>
                
              )}

              <nav className="mt-2">
                {primaryMenuItems.map((item, index) => renderMenuItem(item, index))}
                
                {!collapsed && (
                  <div className="px-4 py-2 mt-6 flex items-center">
                    <span className={cn("text-xs", isDarkMode ? "text-gray-400 " : "text-gray-500")}>Mais</span>
                    <div className={cn("flex-grow h-px ml-2", isDarkMode ? "bg-gray-700" : "bg-gray-200")}></div>
                  </div>
                )}
                
                {secondaryMenuItems.map((item, index) => renderMenuItem(item, index))}
              </nav>
            </div>

            <div className="mt-auto mb-4 px-4">
              {!collapsed && (
                <div className={cn("text-sm text-center", isDarkMode ? "text-gray-400" : "text-gray-500")}>
                  v1.0.0
                </div>
              )}
            </div>
          </div>

          {collapsed && (
            <div className="mt-4 ml-2">
              <Image src="/logo.png" alt="Logo" width={80} height={80} className="object-contain" />
            </div>
          )}
        </div>
      )}
    </>
  );
}