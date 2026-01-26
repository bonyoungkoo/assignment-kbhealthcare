type User = { id: string; email: string; name: string; password: string }

export const db = {
  users: [
    { id: 'u_1', email: 'test@test.com', name: 'Test User', password: '1234' },
  ] satisfies User[],
  sessions: new Map<string, { userId: string; exp: number }>(),
}

export const createToken = () => crypto.randomUUID()

export const nowSec = () => Math.floor(Date.now() / 1000)
