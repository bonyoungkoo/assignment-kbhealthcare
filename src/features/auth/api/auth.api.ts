import { ApiError } from '@/shared/api/ApiError'
import { http } from '@/shared/api/http'
import { setAccessToken, setRefreshToken } from '@/shared/api/token'
import type { ApiErrorResponse } from '@/shared/api/types'

type SignInSuccessResponse = {
  accessToken: string
  refreshToken: string
}

export type SignInOptions = {
  accessTtlSec?: number
  refreshTtlSec?: number
}

export const signIn = async (
  email: string,
  password: string,
  options: { accessTtlSec: number; refreshTtlSec: number },
) => {
  const res = await http.post('/api/auth/sign-in', { email, password, ...options })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorResponse | null
    throw new ApiError(res.status, body?.errorMessage ?? '요청에 실패했습니다.')
  }

  const data = (await res.json()) as SignInSuccessResponse

  setAccessToken(data.accessToken)
  setRefreshToken(data.refreshToken)

  return data
}
