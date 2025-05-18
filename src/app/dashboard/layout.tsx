"use client";
import { getUser } from "@/src/core/auth/authApi";
import Header from "@/src/infrastructure/components/dashboard/header/header";
import { Sidebar } from "@/src/infrastructure/components/dashboard/sidebar";
import LoadingScreen from "@/src/infrastructure/ui/loadingScreen";
import { useEffect, useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function validateSession() {
      try {
        await getUser();
      } catch (err) {
        console.error("Usuário não autenticado", err);
      } finally {
        setLoading(false);
      }
    }

    validateSession();
  }, []);

  if (loading) return <LoadingScreen message="Validando sessão do usuário..." />;

  return (
    <div className="flex h-screen ">
     
        <Sidebar />
   

      <div className="flex flex-col flex-1 max-h-screen overflow-hidden">
       
          <Header />
       

      
        <main className="flex-1 overflow-y-auto p-6 ">
          {children}
        </main>
      </div>
    </div>
  );
}
