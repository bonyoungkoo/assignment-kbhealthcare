import type { Task } from '@/mocks/db'
import { ApiError } from '@/shared/api/ApiError'
import { http } from '@/shared/api/http'

import type { ApiErrorResponse } from '@/shared/api/types'

export const getTasks = async (page: number) => {
  const res = await http.get(`/api/task?page=${page}`)

  if (!res.ok) {
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as ApiErrorResponse | null
      throw new ApiError(res.status, body?.errorMessage ?? '요청에 실패했습니다.')
    }
  }

  return (await res.json()) as Task[]
}

export const getTaskById = async (id: string) => {
  const res = await http.get(`/api/task/${encodeURIComponent(id)}`)
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorResponse | null
    throw new ApiError(res.status, body?.errorMessage ?? '요청에 실패했습니다.')
  }
  return (await res.json()) as Task
}

export const deleteTask = async (id: string) => {
  const res = await http.delete(`/api/task/${encodeURIComponent(id)}`)
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorResponse | null
    throw new ApiError(res.status, body?.errorMessage ?? '요청에 실패했습니다.')
  }
  return (await res.json()) as { ok: true }
}
