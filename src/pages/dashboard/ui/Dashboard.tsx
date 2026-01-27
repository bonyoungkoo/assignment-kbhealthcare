// src/pages/dashboard/ui/Dashboard.tsx
import { useEffect, useMemo } from 'react'
import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useModal } from '@/app/providers/modal/useModal'
import { getDashboardSummary } from '@/features/dashboard/dashboard.api'
import { useAuth } from '@/app/providers/auth/useAuth'

type StatCardProps = {
  label: string
  value: number
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const modal = useModal()

  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardSummary(),
    staleTime: 0,
    gcTime: 0,
    retry: false,
  })

  const stats = useMemo(() => {
    const data = query.data
    return {
      numOfTask: data?.numOfTask ?? 0,
      numOfRestTask: data?.numOfRestTask ?? 0,
      numOfDoneTask: data?.numOfDoneTask ?? 0,
    }
  }, [query.data])

  useEffect(() => {
    if (!query.error) return

    const e = query.error as { message: string; status?: number }

    if (e.status === 401) {
      logout()
      const redirectTo = encodeURIComponent('/')
      navigate(`/login?redirectTo=${redirectTo}`, { replace: true })
      return
    }

    if (e.status === 400) {
      modal.alert({
        title: '오류',
        content: e.message,
        confirmText: '확인',
      })
    }
  }, [query.error, navigate, modal])

  if (query.isLoading) {
    return (
      <Box sx={{ minHeight: 'calc(100vh - 64px)', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        <StatCard label="일" value={stats.numOfTask} />
        <StatCard label="해야할 일" value={stats.numOfRestTask} />
        <StatCard label="한 일" value={stats.numOfDoneTask} />
      </Box>
    </Box>
  )
}
