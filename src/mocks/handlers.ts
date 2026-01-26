import { http, HttpResponse } from 'msw'
import { db, createToken, nowSec } from './db'

const ACCESS_TTL_SEC = 60 // access 1분 (테스트 쉬움)
const REFRESH_TTL_SEC = 60 * 30 // refresh 30분

// accessToken 검증을 “진짜 JWT”처럼 하진 말고, 토큰맵으로 단순화해도 됨.
// 과제에서는 흐름이 중요.
const accessStore = new Map<string, { userId: string; exp: number }>()

const getCookie = (cookieHeader: string | null, key: string) => {
  if (!cookieHeader) return null
  const part = cookieHeader
    .split(';')
    .map(v => v.trim())
    .find(v => v.startsWith(`${key}=`))
  return part ? decodeURIComponent(part.split('=').slice(1).join('=')) : null
}

export const handlers = [
  http.post('/api/auth/sign-in', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }

    const user = db.users.find(u => u.email === body.email)
    if (!user || user.password !== body.password) {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    const accessToken = createToken()
    const refreshToken = createToken()

    accessStore.set(accessToken, { userId: user.id, exp: nowSec() + ACCESS_TTL_SEC })
    db.sessions.set(refreshToken, { userId: user.id, exp: nowSec() + REFRESH_TTL_SEC })

    // refreshToken은 보통 HttpOnly Cookie. MSW에서도 Set-Cookie 헤더로 흉내 가능.
    return HttpResponse.json(
      {
        accessToken,
        user: { id: user.id, email: user.email, name: user.name },
      },
      {
        status: 200,
        headers: {
          'Set-Cookie': `refreshToken=${encodeURIComponent(refreshToken)}; Path=/; SameSite=Lax`,
        },
      },
    )
  }),

  http.post('/api/auth/refresh', async ({ request }) => {
    const cookie = request.headers.get('cookie')
    const refreshToken = getCookie(cookie, 'refreshToken')

    if (!refreshToken) {
      return HttpResponse.json({ message: 'No refresh token' }, { status: 401 })
    }

    const session = db.sessions.get(refreshToken)
    if (!session || session.exp < nowSec()) {
      return HttpResponse.json({ message: 'Refresh expired' }, { status: 401 })
    }

    const accessToken = createToken()
    accessStore.set(accessToken, { userId: session.userId, exp: nowSec() + ACCESS_TTL_SEC })

    return HttpResponse.json({ accessToken }, { status: 200 })
  }),

  http.get('/api/auth/me', ({ request }) => {
    const auth = request.headers.get('authorization')
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null

    if (!token) return HttpResponse.json({ message: 'No token' }, { status: 401 })

    const data = accessStore.get(token)
    if (!data || data.exp < nowSec()) {
      return HttpResponse.json({ message: 'Token expired' }, { status: 401 })
    }

    const user = db.users.find(u => u.id === data.userId)
    if (!user) return HttpResponse.json({ message: 'User not found' }, { status: 404 })

    return HttpResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 200 })
  }),
]
