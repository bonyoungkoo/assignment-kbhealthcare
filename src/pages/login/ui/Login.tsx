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
  Collapse,
  Divider,
  IconButton,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { me, signIn } from '@/features/auth/api/auth.api'
import { loginSchema, type LoginFormValues } from '../model/login.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/app/providers/auth/useAuth'
import { useModal } from '@/app/providers/modal/useModal'
import { useQueryClient } from '@tanstack/react-query'
import { ACCESS_TTL_SEC, REFRESH_TTL_SEC } from '@/mocks/handlers'

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

const clampInt = (v: number, min: number, max: number) => {
  if (Number.isNaN(v)) return min
  return Math.max(min, Math.min(max, Math.floor(v)))
}

export default function Login() {
  const queryClient = useQueryClient()
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

  const [showTestOptions, setShowTestOptions] = useState(false)
  const [accessTtlSec, setAccessTtlSec] = useState<number>(ACCESS_TTL_SEC)
  const [refreshTtlSec, setRefreshTtlSec] = useState<number>(REFRESH_TTL_SEC)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: 'user1@test.com',
      password: '12345678',
    },
  })

  watch(['email', 'password'])

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setSubmitting(true)
      queryClient.removeQueries({ queryKey: ['tasks'] })

      await signIn(values.email, values.password, {
        accessTtlSec: clampInt(accessTtlSec, 1, 300),
        refreshTtlSec: clampInt(refreshTtlSec, 10, 3600),
      })

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
                테스트 계정: user1@test.com / 12345678
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

            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  테스트 옵션(만료시간 설정)
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setShowTestOptions(v => !v)}
                  disabled={submitting}
                  aria-label="toggle test options"
                >
                  {showTestOptions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Stack>

              <Collapse in={showTestOptions}>
                <Stack
                  spacing={1.5}
                  sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {`과제 검증을 위한 테스트 전용 설정입니다. (Access TTL: 기본값 ${ACCESS_TTL_SEC}초 / Refresh TTL: 기본값 ${REFRESH_TTL_SEC}초)`}
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <TextField
                      label="Access TTL (sec)"
                      type="number"
                      value={accessTtlSec}
                      onChange={e => setAccessTtlSec(Number(e.target.value))}
                      inputProps={{ min: 1, max: 300, step: 1 }}
                      fullWidth
                      disabled={submitting}
                    />

                    <TextField
                      label="Refresh TTL (sec)"
                      type="number"
                      value={refreshTtlSec}
                      onChange={e => setRefreshTtlSec(Number(e.target.value))}
                      inputProps={{ min: 10, max: 3600, step: 10 }}
                      fullWidth
                      disabled={submitting}
                    />
                  </Stack>

                  <Divider />

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setAccessTtlSec(ACCESS_TTL_SEC)
                        setRefreshTtlSec(REFRESH_TTL_SEC)
                      }}
                      disabled={submitting}
                    >
                      기본값으로
                    </Button>
                  </Stack>
                </Stack>
              </Collapse>
            </Stack>

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
