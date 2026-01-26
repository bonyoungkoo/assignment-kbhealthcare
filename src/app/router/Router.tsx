import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/widgets/layout/AppLayout'
import Login from '@/pages/login/ui/Login'
import Dashboard from '@/pages/dashboard/ui/Dashboard'
import Tasks from '@/pages/tasks/ui/Tasks'
import Profile from '@/pages/profile/ui/Profile'
import { AuthLayout } from '@/widgets/layout/AuthLayout'

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: '/login', element: <Login /> }],
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/tasks', element: <Tasks /> },
      { path: '/profile', element: <Profile /> },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '*', element: <Navigate to="/" replace /> },
])
