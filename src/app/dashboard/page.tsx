import Analytics from "@/src/infrastructure/components/dashboard/analytics";
import { SectionCards } from "@/src/infrastructure/components/dashboard/cardsHome";
import { ActivityTable } from "@/src/infrastructure/components/dashboard/data-table/activities";
import { BreadcrumbRoutas } from "@/src/infrastructure/components/ulils/breadcrumbRoutas";

export default function Dashboard() {
  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-base text-zinc-700 dark:text-white">Dashboard</h1>
      <SectionCards />
      <div className="flex flex-col md:flex-row gap-8 justify-between items-center">
        <Analytics />
        <ActivityTable />
      </div>
    </main>
  );
}
