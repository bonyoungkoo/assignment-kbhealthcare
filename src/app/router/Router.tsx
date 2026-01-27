import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/widgets/layout/AppLayout'
import { ProtectedRoute } from '@/app/routes/ProtectedRoute'

import Login from '@/pages/login/ui/Login'
import Dashboard from '@/pages/dashboard/ui/Dashboard'
import Tasks from '@/pages/tasks/ui/Tasks'
import Profile from '@/pages/profile/ui/Profile'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/login', element: <Login /> },

      {
        element: <ProtectedRoute />,
        children: [
          { path: '/', element: <Dashboard /> },
          { path: '/tasks', element: <Tasks /> },
          { path: '/profile', element: <Profile /> },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
])
