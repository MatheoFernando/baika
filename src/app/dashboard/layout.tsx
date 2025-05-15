import Header from "@/src/components/components/header/header";
import { Sidebar } from "@/src/components/components/sidebar";

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

        <main className="flex-1 ">
          {children}
        </main>
      </div>
    </div>
  );
}
