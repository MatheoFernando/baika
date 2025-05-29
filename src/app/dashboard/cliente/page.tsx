import CompanyTable from '@/src/infrastructure/components/dashboard/data-table/company'
import { BreadcrumbRoutas } from '@/src/infrastructure/components/ulils/breadcrumbRoutas'
import React from 'react'

export default function Empresa() {
  return (
    <div>
         <BreadcrumbRoutas title="Clientes"   showBackButton />
           <CompanyTable/>
    </div>
  )
}
