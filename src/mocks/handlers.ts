import { http, HttpResponse } from 'msw'
import { db, nowSec } from './db'
import { refreshSessions } from './session.store'

const ACCESS_TTL_SEC = 10
export const REFRESH_TTL_SEC = 15

const PAGE_SIZE = 10
const MAX_PAGE = 12

type SignInBody = { email: string; password: string }
type JwtPayload = { id: string; exp: number }

const createMockJwt = (payload: JwtPayload) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.mock`
}

const decodeMockJwt = <T>(token: string): T | null => {
  try {
    const [, body] = token.split('.')
    return body ? (JSON.parse(atob(body)) as T) : null
  } catch {
    return null
  }
}

export const handlers = [
  http.post('/api/auth/sign-in', async ({ request }) => {
    const { email, password } = (await request.json()) as SignInBody

    const user = db.users.find(u => u.email === email && u.password === password)
    if (!user) {
      return HttpResponse.json(
        { errorMessage: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 },
      )
    }

    const accessToken = createMockJwt({ id: user.id, exp: nowSec() + ACCESS_TTL_SEC })
    const refreshToken = createMockJwt({ id: user.id, exp: nowSec() + REFRESH_TTL_SEC })

    refreshSessions.set(refreshToken, {
      id: user.id,
      exp: nowSec() + REFRESH_TTL_SEC,
    })

    return HttpResponse.json({ accessToken, refreshToken }, { status: 200 })
  }),

  http.post('/api/auth/refresh', ({ cookies }) => {
    const refreshToken = cookies?.rt
    console.log('refreshToken', refreshToken)
    if (!refreshToken)
      return HttpResponse.json({ errorMessage: 'No refresh token' }, { status: 401 })

    const session = refreshSessions.get(refreshToken)
    console.log('session', session, session?.exp, nowSec())
    if (!session || session.exp < nowSec()) {
      return HttpResponse.json({ errorMessage: 'Refresh token expired' }, { status: 401 })
    }

    const accessToken = createMockJwt({ id: session.id, exp: nowSec() + ACCESS_TTL_SEC })
    return HttpResponse.json({ accessToken }, { status: 200 })
  }),

  http.post('/api/auth/logout', ({ cookies }) => {
    const rt = cookies?.rt
    if (rt) {
      refreshSessions.delete(rt)
    }

    const headers = new Headers()
    headers.append('Set-Cookie', 'rt=; Path=/; Max-Age=0; SameSite=Lax')

    return HttpResponse.json({ ok: true }, { status: 200, headers })
  }),

  http.get('/api/auth/me', ({ request }) => {
    const auth = request.headers.get('authorization')
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return HttpResponse.json({ errorMessage: 'No access token' }, { status: 401 })

    const payload = decodeMockJwt<JwtPayload>(token)
    if (!payload || payload.exp < nowSec()) {
      return HttpResponse.json({ errorMessage: 'Access token expired' }, { status: 401 })
    }

    const user = db.users.find(u => u.id === payload.id)
    if (!user) return HttpResponse.json({ errorMessage: 'User not found' }, { status: 404 })

    return HttpResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 200 })
  }),

  http.get('/api/dashboard', ({ request }) => {
    const auth = request.headers.get('authorization')
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return HttpResponse.json({ errorMessage: 'No access token' }, { status: 401 })

    const payload = decodeMockJwt<JwtPayload>(token)
    if (!payload || payload.exp < nowSec()) {
      return HttpResponse.json({ errorMessage: 'Access token expired' }, { status: 401 })
    }

    const numOfTask = db.tasks.length
    const numOfDoneTask = db.tasks.filter(t => t.status === 'DONE').length
    const numOfRestTask = db.tasks.filter(t => t.status === 'TODO').length

    return HttpResponse.json({ numOfTask, numOfRestTask, numOfDoneTask }, { status: 200 })
  }),

  http.get('/api/task', ({ request }) => {
    const auth = request.headers.get('authorization')
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return HttpResponse.json({ errorMessage: 'No access token' }, { status: 401 })

    const payload = decodeMockJwt<JwtPayload>(token)
    if (!payload || payload.exp < nowSec()) {
      return HttpResponse.json({ errorMessage: 'Access token expired' }, { status: 401 })
    }

    const page = Number(new URL(request.url).searchParams.get('page') ?? 1)
    if (page > MAX_PAGE) {
      return HttpResponse.json(
        { errorMessage: '[400 에러 테스트] 존재하지 않는 페이지입니다.' },
        { status: 400 },
      )
    }
    const start = (page - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE

    const slice = db.tasks.slice(start, end)

    return HttpResponse.json(slice, { status: 200 })
  }),

  http.get('/api/task/:id', ({ params, request }) => {
    const auth = request.headers.get('authorization')
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return HttpResponse.json({ errorMessage: 'No access token' }, { status: 401 })

    const payload = decodeMockJwt<JwtPayload>(token)
    if (!payload || payload.exp < nowSec()) {
      return HttpResponse.json({ errorMessage: 'Access token expired' }, { status: 401 })
    }

    const id = String(params.id)
    const task = db.tasks.find(t => t.id === id)
    if (!task) return HttpResponse.json({ errorMessage: 'Not found' }, { status: 404 })

    return HttpResponse.json(task, { status: 200 })
  }),

  http.delete('/api/task/:id', ({ params, request }) => {
    const auth = request.headers.get('authorization')
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return HttpResponse.json({ errorMessage: 'No access token' }, { status: 401 })

    const payload = decodeMockJwt<JwtPayload>(token)
    if (!payload || payload.exp < nowSec()) {
      return HttpResponse.json({ errorMessage: 'Access token expired' }, { status: 401 })
    }

    const id = String(params.id)
    const idx = db.tasks.findIndex(t => t.id === id)
    if (idx < 0) return HttpResponse.json({ errorMessage: 'Not found' }, { status: 404 })

    db.tasks.splice(idx, 1)
    return HttpResponse.json({ ok: true }, { status: 200 })
  }),
]
