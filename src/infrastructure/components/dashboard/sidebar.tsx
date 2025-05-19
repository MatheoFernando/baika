"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  BarChart2, 
  Map, 
  MessageSquare, 
  FileText,
  Menu,
  AlignLeft,
  Pin,
  Building2
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import Link from "next/link";
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
    {  icon: Building2,  label: "Clientes",  href: "/dashboard/cliente"  },
    { icon: Pin, label: "Ocorrências", href: "/dashboard/occurrence" },
  ];

  const secondaryMenuItems: MenuItem[] = [
    { icon: Map, label: "Maps", href: "/dashboard/maps" },
    { icon: MessageSquare, label: "Chat", href: "/dashboard/chat" },
    { icon: FileText, label: "Relatório da Supervisão", href: "/dashboard/relatorio" },
  ];

  const renderMenuItem = (item: MenuItem, index: number) => (
    <div key={index}>
   
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
      
    </div>
  );

  const MobileSheetContent = () => (
    <div className="py-4">
      <div className="flex items-center mb-6 px-4">
        <Image src="/logo.png" alt="Logo" width={40} height={40} className="mr-3" />
      </div>
      <nav>
         <div className="mb-2 px-4 mt-6 flex items-baseline justify-center">
          <span className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>Menu</span>
          <div className={cn("flex-grow h-px ml-2", isDarkMode ? "bg-gray-700" : "bg-gray-400")}></div>
        </div>
        <div className="mb-4">
          {primaryMenuItems.map((item, index) => renderMenuItem(item, index))}
        </div>
        
        <div className="mb-2 px-4 mt-6 flex items-baseline justify-center">
          <span className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>Mais</span>
          <div className={cn("flex-grow h-px ml-2", isDarkMode ? "bg-gray-700" : "bg-gray-400")}></div>
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
          <SheetTrigger asChild className="flex justify-start items-start  bg-white h-21 pt-6.5 ">
            <button className={cn(
              isDarkMode ? " bg-gray-800 text-white" : " text-gray-800",
              ""
            )}>
              <Menu size={24} className="text-black dark:text-white" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className={isDarkMode ? "bg-gray-900" : "bg-white"}>
            <MobileSheetContent />
          </SheetContent>
        </Sheet>
      )}

      {!isMobile && (
        <div className=" ">
          {/* Sidebar */}
          <div
            className={cn(
            "min-h-screen h-full flex flex-col transition-all p-2 duration-300 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-hidden",
              collapsed ? "w-24" : "w-64",
              className
            )}
          >
            {/* Logo Section */}
            <div className="flex items-center p-4">
              {collapsed ? (
                <Image src="/logo.png" alt="Logo" width={80} height={80} className="" />
              ) : (
                <div className="flex items-center">
                  <Image src="/logo.png" alt="Logo" width={100} height={100} className="" />
                </div>
              )}
            </div>

            <div className="flex-1 overflow-hidden">
              {collapsed ? (
                <div className="px-4 py-2">
                  <div className=""></div>
                </div>
              ) : (
                <div className="px-4 py-2 mt-6 flex items-baseline justify-center">
                  <span className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>Menu</span>
                  <div className={cn("flex-grow h-px ml-2", isDarkMode ? "bg-gray-700" : "bg-gray-400")}></div>
                </div>
              )}

              <nav className="mt-2">
                {primaryMenuItems.map((item, index) => renderMenuItem(item, index))}
                
                {!collapsed && (
                  <div className="px-4 py-2 mt-6 flex items-baseline justify-center">
                    <span className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>Mais</span>
                    <div className={cn("flex-grow h-px ml-2", isDarkMode ? "bg-gray-700" : "bg-gray-400")}></div>
                  </div>
                )}
                
                {secondaryMenuItems.map((item, index) => renderMenuItem(item, index))}
              </nav>
            </div>
 footer
          </div>

      
          <button
            onClick={toggleSidebar}
            className={cn(
              " bg-white size-21 fixed top-0 md:left-65 left-55 flex items-center justify-center cursor-pointer",
              isDarkMode ? "bg-gray-800 text-white" : "  text-gray-700",
              ""
            )}
          >
            {collapsed ? (
              <AlignLeft size={26} className={isDarkMode ? "text-white" : "text-gray-700"} />
            ) : (
              <Menu size={26} className={isDarkMode ? "text-white" : "text-gray-700"} />
            )}
          </button>
        </div>
      )}
    </>
  );
}