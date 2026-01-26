import { Outlet } from 'react-router-dom'

export const AuthLayout = () => {
  return (
    <main style={{ minHeight: '100vh' }}>
      <Outlet />
    </main>
  )
}
