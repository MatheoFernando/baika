import Header from "@/src/infrastructure/components/dashboard/header/header";
import { Sidebar } from "@/src/infrastructure/components/dashboard/sidebar";

export default function Layout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div className="flex h-screen overflow-hidden max-w-7xl mx-auto ">
      <Sidebar />
     <div className="flex flex-col flex-1 max-h-screen">
       
        <header className="h-36 flex items-center px-6 shrink-0">
          <Header />
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
