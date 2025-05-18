"use client";

import { useEffect, useState } from "react";
import { ChevronDown, LogOut, Settings } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/infrastructure/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/infrastructure/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/infrastructure/ui/alert-dialog";
import { getUser, logout } from "@/src/core/auth/authApi";
import LoadingScreen from "@/src/infrastructure/ui/loadingScreen";

export function NavUser() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar?: string;
  } | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    try {
      const user = getUser();
      setUser({
        name: user.name,
        email: user.email,
        avatar: "",
      });
    } catch (e) {
      console.error("Erro ao carregar usuário:", e);
    }
  }, []);

  if (!user) return <LoadingScreen message="Fazendo logout" />;

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex gap-2 items-center justify-center  border-l pl-3 ml-3 pr-3 border-gray-300 cursor-pointer">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              {!user.avatar && user.name ? (
                <AvatarFallback className="flex items-center justify-center bg-gray-400 text-white rounded-full font-semibold">
                  {user.name.split(" ").slice(0, 1).join("")[0]?.toUpperCase()}
                  {user.name.split(" ").length > 1 &&
                    user.name.split(" ").slice(-1).join("")[0]?.toUpperCase()}
                </AvatarFallback>
              ) : (
                <AvatarFallback>
                  {user.name?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
            </div>
            <ChevronDown className="ml-auto size-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="min-w-56 rounded-lg"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center justify-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                {!user.avatar && user.name ? (
                  <AvatarFallback className="flex items-center justify-center bg-gray-400 text-white rounded-full font-semibold">
                    {user.name
                      .split(" ")
                      .slice(0, 1)
                      .join("")[0]
                      ?.toUpperCase()}
                    {user.name.split(" ").length > 1 &&
                      user.name.split(" ").slice(-1).join("")[0]?.toUpperCase()}
                  </AvatarFallback>
                ) : (
                  <AvatarFallback>
                    {user.name?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Definições
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-red-500 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza que deseja sair?</AlertDialogTitle>
          <AlertDialogDescription>
            Você será deslogado e redirecionado para a página de login.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={logout}
          >
            Sair
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
