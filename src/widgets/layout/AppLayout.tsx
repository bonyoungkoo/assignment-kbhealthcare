import { Outlet } from 'react-router-dom'
import GNB from '../GNB'
import LNB from '../LNB'

export function AppLayout() {
  return (
    <div>
      <GNB />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>
        <LNB />
        <main style={{ flex: 1, padding: 16 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
