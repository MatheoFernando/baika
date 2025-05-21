import { NewSupervionTable } from "@/src/infrastructure/components/dashboard/data-table/newSupervision";
import { BreadcrumbRoutas } from "@/src/infrastructure/components/ulils/breadcrumbRoutas";
import React from "react";

export default function Supervisao() {
  return (
    <div>
      <BreadcrumbRoutas title=" Supervisão" showBackButton />
      <NewSupervionTable />
    </div>
  );
}
