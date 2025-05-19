import Activities from "@/src/infrastructure/components/dashboard/activities/page";
import Analytics from "@/src/infrastructure/components/dashboard/analytics";
import { SectionCards } from "@/src/infrastructure/components/dashboard/cardsHome";
import { BreadcrumbRoutas } from "@/src/infrastructure/components/ulils/breadcrumbRoutas";

export default function Dashboard() {
  return (
   
      <main className="flex flex-col gap-6">
        <BreadcrumbRoutas title="Inicio"  productName="Inicio" />
        <SectionCards />
      <div className=" flex flex-col  md:flex-row gap-8 justify-between items-center">
        <Analytics/>
        <Activities/>

      </div>
        
      </main>
   
  );
}
