import { Suspense } from 'react'
import { AdminPanel } from './AdminPanel'

export default function AdminPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminPanel />
    </Suspense>
  )
}
