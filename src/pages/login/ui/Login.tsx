import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { signIn } from '@/features/auth/api/auth.api'
import { useAuth } from '@/app/providers/auth/useAuth'

const getRedirectTo = (search: string) => {
  const params = new URLSearchParams(search)
  const raw = params.get('redirectTo')
  return raw ? decodeURIComponent(raw) : '/'
}

// 보안/UX: 외부 URL로 튕기는 open redirect 방지(간단 버전)
const sanitizeRedirectTo = (path: string) => {
  if (!path.startsWith('/')) return '/'
  if (path.startsWith('//')) return '/'
  return path
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, setUser } = useAuth()

  const redirectTo = useMemo(
    () => sanitizeRedirectTo(getRedirectTo(location.search)),
    [location.search],
  )

  const [email, setEmail] = useState('test@test.com')
  const [password, setPassword] = useState('1234')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // 이미 로그인된 상태면 로그인 페이지에 머물 필요 없음
  useEffect(() => {
    if (user) navigate(redirectTo, { replace: true })
  }, [user, redirectTo, navigate])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해 주세요.')
      return
    }

    try {
      setSubmitting(true)
      const loggedInUser = await signIn(email.trim(), password)
      setUser(loggedInUser)
      navigate(redirectTo, { replace: true })
    } catch {
      setError('로그인에 실패했습니다. 이메일/비밀번호를 확인해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent>
          <Stack spacing={2.5} component="form" onSubmit={onSubmit}>
            <Stack spacing={0.5}>
              <Typography variant="h5" fontWeight={700}>
                Sign in
              </Typography>
              <Typography variant="body2" color="text.secondary">
                테스트 계정: test@test.com / 1234
              </Typography>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Email"
              type="email"
              value={email}
              autoComplete="username"
              onChange={e => setEmail(e.target.value)}
              fullWidth
              disabled={submitting}
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={e => setPassword(e.target.value)}
              fullWidth
              disabled={submitting}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              fullWidth
              startIcon={submitting ? <CircularProgress size={18} /> : undefined}
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>

            <Typography variant="caption" color="text.secondary">
              로그인 성공 시 <b>{redirectTo}</b> 로 이동합니다.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
