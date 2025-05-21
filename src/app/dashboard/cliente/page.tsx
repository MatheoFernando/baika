import CompanyTable from '@/src/infrastructure/components/dashboard/data-table/company'
import { BreadcrumbRoutas } from '@/src/infrastructure/components/ulils/breadcrumbRoutas'
import { Card } from '@/src/infrastructure/ui/card'
import React from 'react'

export default function Empresa() {
  return (
    <div>
         <BreadcrumbRoutas title="Clientes"   showBackButton />
        <Card className=" bg-white dark:bg-gray-800 p-8">
           <CompanyTable/>
        </Card>
    </div>
  )
}
