import { getAccessToken, setAccessToken } from './token'

const request = async (input: RequestInfo, init: RequestInit = {}) => {
  const headers = new Headers(init.headers)
  const accessToken = getAccessToken()

  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  headers.set('Content-Type', 'application/json')

  const res = await fetch(input, { ...init, headers, credentials: 'include' })

  // access 만료 -> refresh -> 원요청 재시도
  if (res.status === 401) {
    const refreshed = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })

    if (refreshed.ok) {
      const { accessToken: newToken } = (await refreshed.json()) as { accessToken: string }
      setAccessToken(newToken)

      const retryHeaders = new Headers(init.headers)
      retryHeaders.set('Authorization', `Bearer ${newToken}`)
      retryHeaders.set('Content-Type', 'application/json')

      return fetch(input, { ...init, headers: retryHeaders, credentials: 'include' })
    }
  }

  return res
}

export const http = {
  get: (url: string) => request(url),
  post: (url: string, body?: unknown) =>
    request(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
}
