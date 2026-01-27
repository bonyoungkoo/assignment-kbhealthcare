import { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material'
import { me } from '@/features/auth/api/auth.api'
import { useModal } from '@/app/providers/modal/useModal'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/auth/useAuth'

type MeResponse = { id: string; email: string; name: string }

export default function Profile() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const modal = useModal()
  const [data, setData] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const res = (await me()) as MeResponse
        setData(res)
      } catch (e: unknown) {
        if (e instanceof Error) {
          await modal.alert({
            title: '알림',
            content: e.message,
            onClose: () => {
              logout()
              navigate('/login', { replace: true })
            },
          })
        }
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [logout, navigate, modal])

  if (loading) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Stack flexDirection="row" justifyContent="center" sx={{ p: 2 }}>
      <Card sx={{ width: 520 }}>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h6" fontWeight={700}>
              회원정보
            </Typography>

            {data ? (
              <>
                <Typography>id: {data.id}</Typography>
                <Typography>email: {data.email}</Typography>
                <Typography>name: {data.name}</Typography>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    logout()
                    navigate('/login', { replace: true })
                  }}
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <Typography color="text.secondary">회원정보를 불러오지 못했습니다.</Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
