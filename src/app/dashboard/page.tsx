import { SectionCards } from "@/src/infrastructure/components/dashboard/cardsHome";
import { ActivityTable } from "@/src/infrastructure/components/dashboard/data-table/activities";

export default function Dashboard() {
  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-base text-zinc-700 dark:text-white">Dashboard</h1>
      <SectionCards />
    
        <ActivityTable />
      
    </main>
  );
}
