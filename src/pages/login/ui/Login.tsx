import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { me, signIn } from '@/features/auth/api/auth.api'
import { loginSchema, type LoginFormValues } from '../model/login.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/app/providers/auth/useAuth'
import { useModal } from '@/app/providers/modal/useModal'

const getRedirectTo = (search: string) => {
  const params = new URLSearchParams(search)
  const raw = params.get('redirectTo')
  return raw ? decodeURIComponent(raw) : '/'
}

const sanitizeRedirectTo = (path: string) => {
  if (!path.startsWith('/')) return '/'
  if (path.startsWith('//')) return '/'
  return path
}

export default function Login() {
  const navigate = useNavigate()
  const modal = useModal()
  const { setUser } = useAuth()
  const location = useLocation()

  const redirectTo = useMemo(
    () => sanitizeRedirectTo(getRedirectTo(location.search)),
    [location.search],
  )

  const [apiError, setApiError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: 'test@test.com',
      password: '12345678',
    },
  })

  watch(['email', 'password'])

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setSubmitting(true)
      await signIn(values.email, values.password)
      const user = await me()
      setUser(user)
      navigate(redirectTo, { replace: true })
    } catch (e: unknown) {
      if (e instanceof Error) {
        handleOpenModal(e.message)
      } else {
        handleOpenModal('로그인에 실패했습니다.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenModal = (message: string) => {
    modal.alert({
      title: '알림',
      content: message ?? '',
    })
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        width: 1,
        display: 'grid',
        placeItems: 'center',
        p: 2,
      }}
    >
      <Card sx={{ width: 1, maxWidth: 720 }}>
        <CardContent>
          <Stack spacing={2.5} component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={0.5}>
              <Typography variant="h5" fontWeight={700}>
                로그인
              </Typography>
              <Typography variant="body2" color="primary">
                테스트 계정: test@test.com / 12345678
              </Typography>
            </Stack>

            <TextField
              label="Email"
              type="email"
              autoComplete="username"
              fullWidth
              disabled={submitting}
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email')}
            />

            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              fullWidth
              disabled={submitting}
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={!isValid || submitting}
              startIcon={submitting ? <CircularProgress size={18} /> : undefined}
            >
              {submitting ? '로그인 중...' : '로그인'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={!!apiError} onClose={() => setApiError(null)}>
        <DialogTitle>로그인 실패</DialogTitle>
        <DialogContent>{apiError}</DialogContent>
        <DialogActions>
          <Button onClick={() => setApiError(null)} autoFocus>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
