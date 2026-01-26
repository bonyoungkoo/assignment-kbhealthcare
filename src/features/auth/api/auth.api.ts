import { http } from '@/shared/api/http'
import { setAccessToken } from '@/shared/api/token'

export const signIn = async (email: string, password: string) => {
  const res = await http.post('/api/auth/sign-in', { email, password })
  if (!res.ok) throw new Error('sign-in failed')

  const data = (await res.json()) as {
    accessToken: string
    user: { id: string; email: string; name: string }
  }
  setAccessToken(data.accessToken)
  return data.user
}

export const me = async () => {
  const res = await http.get('/api/auth/me')
  if (!res.ok) throw new Error('unauthorized')
  return res.json()
}
