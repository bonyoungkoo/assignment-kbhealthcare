import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/widgets/layout/AppLayout'
import { ProtectedRoute } from '@/app/routes/ProtectedRoute'

import Login from '@/pages/login/ui/Login'
import Dashboard from '@/pages/dashboard/ui/Dashboard'
import Tasks from '@/pages/tasks/ui/Tasks'
import Profile from '@/pages/profile/ui/Profile'
import TaskDetail from '@/pages/tasks/ui/TaskDetail'

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
          { path: '/tasks/:id', element: <TaskDetail /> },
          { path: '/profile', element: <Profile /> },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
])
