import { getAccessToken, setAccessToken } from './token'

let refreshPromise: Promise<string | null> | null = null

const refreshAccessToken = async (): Promise<string | null> => {
  // 이미 refresh 중이면 그걸 기다림
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refreshed = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })

    console.log('refreshed', refreshed)

    if (!refreshed.ok) return null

    // ✅ refresh 응답이 반드시 { accessToken } 이어야 함
    const data = (await refreshed.json()) as { accessToken?: string }
    return data.accessToken ?? null
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

const request = async (input: RequestInfo, init: RequestInit = {}) => {
  const headers = new Headers(init.headers)
  const token = getAccessToken()
  console.log('[HTTP]', input, 'token?', !!token)

  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  })

  if (res.status !== 401) return res

  // refresh 자신은 재시도 금지
  const url = typeof input === 'string' ? input : input instanceof Request ? input.url : ''
  if (url.includes('/api/auth/refresh')) return res

  const newToken = await refreshAccessToken()
  if (!newToken) return res

  console.log('token refreshed!')

  setAccessToken(newToken)

  // 재시도: headers를 "기존 headers 기준"으로 만들어야 안전함
  const retryHeaders = new Headers(headers)
  retryHeaders.set('Authorization', `Bearer ${newToken}`)

  return fetch(url || input, { ...init, headers: retryHeaders, credentials: 'include' })
}

export const http = {
  get: (url: string) => request(url),
  post: (url: string, body?: unknown) =>
    request(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  delete: (url: string) => request(url, { method: 'DELETE' }),
}
