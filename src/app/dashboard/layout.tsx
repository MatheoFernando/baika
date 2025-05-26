"use client";
import { getUser } from "@/src/core/auth/authApi";
import Header from "@/src/infrastructure/components/dashboard/header/header";
import { Sidebar } from "@/src/infrastructure/components/dashboard/sidebar";
import LoadingScreen from "@/src/infrastructure/ui/loadingScreen";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function validateSession() {
      try {
        const user = await getUser();
      } catch (err) {
        console.error("Usuário não autenticado", err);
      } finally {
        setLoading(false);
      }
    }

    validateSession();
  }, [router]);

  if (loading) return <LoadingScreen message="Validando sessão do usuário..." />;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 max-h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
