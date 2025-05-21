import { OccurrenceTable } from '@/src/infrastructure/components/dashboard/data-table/occurrence'
import { BreadcrumbRoutas } from '@/src/infrastructure/components/ulils/breadcrumbRoutas'
import { Card } from '@/src/infrastructure/ui/card'
import React from 'react'

export default function OCCURRENCE() {
  return (
    <div>
       <BreadcrumbRoutas title="Ocorrencias"   showBackButton />
      <OccurrenceTable/>
    </div>
  )
}
