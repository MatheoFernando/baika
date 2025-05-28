import AnalyticsView from "@/src/infrastructure/components/dashboard/analy";
import { SectionCards } from "@/src/infrastructure/components/dashboard/cardsHome";
import { ActivityTable } from "@/src/infrastructure/components/dashboard/data-table/activities";
import { BreadcrumbRoutas } from "@/src/infrastructure/components/ulils/breadcrumbRoutas";

export default function Dashboard() {
  return (
    <main className="flex flex-col gap-6">
      <BreadcrumbRoutas title="Home" productName="home" />
      <SectionCards />
      <AnalyticsView/>
      <ActivityTable />  
    </main>
  );
}
