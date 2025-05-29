"use client";

import { useState} from "react";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  BarChart2, 
  MapPin, 
  MessageSquare, 
  FileText,
  Building2,
  ChartNoAxesCombined,
  ClipboardMinus
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
} from "../../ui/sheet";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  isMobile?: boolean;
  isSheetOpen?: boolean;
  setIsSheetOpen?: (open: boolean) => void;
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

export function Sidebar({
  className,
  collapsed = false,
  isMobile = false,
  isSheetOpen = false,
  setIsSheetOpen,
}: SidebarProps) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const t = useTranslations('Sidebar');

  const toggleItem = (label: string) => {
    setOpenItems(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const primaryMenuItems: MenuItem[] = [
    { icon: Home, label: t("Inicio"), href: "/dashboard" },
    { icon: Users, label: t("Supervisores"), href: "/dashboard/supervisores" },
    { icon: Building2, label: t("Clientes"), href: "/dashboard/cliente" },
    { icon: ClipboardMinus, label: t("Ocorrencias"), href: "/dashboard/occurrence" },
    { icon: BarChart2, label: t("Supervisao"), href: "/dashboard/supervisao" },
  ];

  const secondaryMenuItems: MenuItem[] = [
    { icon: MapPin, label: t("Maps"), href: "/dashboard/maps" },
    { icon: MessageSquare, label: t("Chat"), href: "/dashboard/chat" },
    { icon: ChartNoAxesCombined, label: t("Analytics"), href: "/dashboard/analytics" },
    { icon: FileText, label: t("Relatorio"), href: "/dashboard/relatorio" },
  ];

  const renderMenuItem = (item: MenuItem, index: number, alwaysShowLabel = false) => (
    <div key={index}>
      <Link
        href={item.href}
        className={cn(
          "flex items-center px-4 py-2 text-sm",
          collapsed && !alwaysShowLabel ? "justify-center" : "",
          pathname === item.href 
            ? " text-blue-700  dark:text-blue-300"
            : isDarkMode ? "text-white hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"
        )}
        onClick={() => {
          if (isMobile && setIsSheetOpen) {
            setIsSheetOpen(false);
          }
        }}
      >
        <item.icon 
          size={collapsed && !alwaysShowLabel ? 24 : 20} 
          className={cn(
            collapsed && !alwaysShowLabel ? "" : "mr-3",
            pathname === item.href
              ? "text-blue-700 dark:text-blue-300"
              : isDarkMode ? "text-gray-300" : "text-gray-700"
          )} 
        />
        {(alwaysShowLabel || !collapsed) && <span>{item.label}</span>}
      </Link>
    </div>
  );

  const MobileSheetContent = () => (
    <div className="py-4 flex flex-col h-full">
      <div className="flex items-center mb-6 px-4">
        <Image src="/logo.png" alt="Logo" width={80} height={80} className="mr-3" />
      </div>
      
      <nav className="flex-1">
        <div className="mb-2 px-4 mt-6 flex items-baseline justify-center">
          <span className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>Menu</span>
          <div className={cn("flex-grow h-px ml-2", isDarkMode ? "bg-gray-700" : "bg-gray-400")}></div>
        </div>
        <div className="mb-4">
          {primaryMenuItems.map((item, index) => renderMenuItem(item, index, true))}
        </div>
        
        <div className="mb-2 px-4 mt-6 flex items-baseline justify-center">
          <span className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>Mais</span>
          <div className={cn("flex-grow h-px ml-2", isDarkMode ? "bg-gray-700" : "bg-gray-400")}></div>
        </div>
        
        <div>
          {secondaryMenuItems.map((item, index) => renderMenuItem(item, index, true))}
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="left" className={cn(
            "flex flex-col h-full",
            isDarkMode ? "bg-gray-900" : "bg-white"
          )}>
            <MobileSheetContent />
          </SheetContent>
        </Sheet>
      ) : (
        <div
          className={cn(
            "min-h-screen h-full flex flex-col transition-all p-2 duration-300 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-hidden",
            collapsed ? "w-32" : "w-64",
            className
          )}
        >
          <Link href="/" className="flex items-center justify-center p-4">
            {collapsed ? (
              <Image src="/logo.png" alt="Logo" width={80} height={80} className="" />
            ) : (
              <div className="flex items-center">
                <Image src="/logo.png" alt="Logo" width={100} height={100} className="" />
              </div>
            )}
          </Link>

          <div className="flex-1 overflow-hidden mb-4">
            {collapsed ? (
              <div className="px-4 py-2">
                <div className=""></div>
              </div>
            ) : (
              <div className="px-4 py-2 mt-6 flex items-baseline justify-center">
                <span className={cn("text-xs", isDarkMode ? "text-gray-300" : "text-gray-700")}>Menu</span>
                <div className={cn("flex-grow h-px ml-2", isDarkMode ? "bg-gray-700" : "bg-gray-400")}></div>
              </div>
            )}

            <nav className="mt-2">
              {primaryMenuItems.map((item, index) => renderMenuItem(item, index))}
              
              {!collapsed && (
                <div className="px-4 py-2 mt-6 flex items-baseline justify-center">
                  <span className={cn("text-xs", isDarkMode ? "text-gray-300" : "text-gray-700")}>Mais</span>
                  <div className={cn("flex-grow h-px ml-2", isDarkMode ? "bg-gray-700" : "bg-gray-400")}></div>
                </div>
              )}
              
              {secondaryMenuItems.map((item, index) => renderMenuItem(item, index))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}