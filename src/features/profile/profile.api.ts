import { ApiError } from '@/shared/api/ApiError'
import { http } from '@/shared/api/http'
import type { ApiErrorResponse } from '@/shared/api/types'

type UserResponse = {
  id: string
  email: string
  name: string
}

export const getUser = async () => {
  const res = await http.get('/api/user')

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorResponse | null
    throw new ApiError(res.status, body?.errorMessage ?? '요청에 실패했습니다.')
  }

  return (await res.json()) as UserResponse
}
