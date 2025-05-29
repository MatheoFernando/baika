"use client";

import { useLocale } from "next-intl";
import { Check, ChevronDown } from "lucide-react";
import Image from "next/image";
import { setUserLocale } from "@/src/lib/service";
import { cn, locales } from "@/src/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

export default function LocaleSwitcher({
  selectClassName,
  className,
  showLabel = false,
}: {
  selectClassName?: string;
  className?: string;
  showLabel?: boolean;
}) {
  const locale = useLocale();

  function onChange(value: string) {
    setUserLocale(value);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={locale}
          className={cn(
            "flex items-center gap-2 cursor-pointer focus:border-gray-700 rounded-lg px-2 py-1",
            className
          )}
        >
          <Image
            src={`/flags/${locale}.svg`}
            alt={locale}
            width={22}
            height={22}
            className="rounded-full object-contain"
          />
          {showLabel && (
            <span className="text-black uppercase">{locale}</span>
          )}
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn("w-40", selectClassName)}>
        {locales.map((item) => (
          <DropdownMenuItem
            key={item}
            onClick={() => onChange(item)}
            className={cn(
              "flex items-center cursor-pointer gap-2",
              item === locale && "bg-orange-500 text-white font-medium"
            )}
          >
            <Image
              src={`/flags/${item}.svg`}
              alt={item}
              width={24}
              height={24}
              className="rounded-full object-cover"
            />
            <span className="uppercase">{item}</span>
            {item === locale && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}