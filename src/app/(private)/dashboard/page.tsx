import { requireAuth } from '@/src/lib/authGuard';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

function dashboard() {
 requireAuth();
  return (
    <div>dashboard</div>
  )
}

export default dashboard