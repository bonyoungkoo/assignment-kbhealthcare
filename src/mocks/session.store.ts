// src/mocks/session.store.ts
export type RefreshSession = { id: string; exp: number }

const KEY = '__mock_refresh_sessions_v1__'

const load = (): Map<string, RefreshSession> => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return new Map()
    const entries = JSON.parse(raw) as Array<[string, RefreshSession]>
    return new Map(entries)
  } catch {
    return new Map()
  }
}

const save = (map: Map<string, RefreshSession>) => {
  const entries = Array.from(map.entries())
  localStorage.setItem(KEY, JSON.stringify(entries))
}

const map = load()

export const refreshSessions = {
  get(token: string) {
    return map.get(token)
  },
  set(token: string, session: RefreshSession) {
    map.set(token, session)
    save(map)
  },
  delete(token: string) {
    map.delete(token)
    save(map)
  },
  clear() {
    map.clear()
    save(map)
  },
}
