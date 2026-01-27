import { ApiError } from '@/shared/api/ApiError'
import { http } from '@/shared/api/http'
import type { ApiErrorResponse } from '@/shared/api/types'

export type DashboardSummary = {
  numOfTask: number
  numOfRestTask: number
  numOfDoneTask: number
}

export const getDashboardSummary = async () => {
  const res = await http.get('/api/dashboard')

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorResponse | null
    throw new ApiError(res.status, body?.errorMessage ?? '요청에 실패했습니다.')
  }

  return (await res.json()) as DashboardSummary
}
