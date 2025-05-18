import SupervisorsPage from '@/src/infrastructure/components/dashboard/supervisor/supervision-page'
import { BreadcrumbRoutas } from '@/src/infrastructure/components/ulils/breadcrumbRoutas'
import React from 'react'

export default function Supervisores() {
  return (
    <div>
        <BreadcrumbRoutas title="Supervisores"  productName="Inicio" showBackButton />
        <SupervisorsPage/>
    </div>
  )
}
