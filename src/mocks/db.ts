export type User = { id: string; email: string; name: string; password: string }

export type Task = {
  id: string
  title: string
  memo: string
  status: 'TODO' | 'DONE'
  registerDatetime: string
}

const TASK_TOTAL = 120

const createTasks = (): Task[] =>
  Array.from({ length: TASK_TOTAL }, (_, i) => {
    const now = Date.now()
    const createdAt = new Date(now - i * 1000 * 60 * 60).toISOString()
    return {
      id: `task-${i + 1}`,
      title: `할 일 ${i + 1}`,
      memo: `이것은 ${i + 1}번째 할 일 메모입니다.`,
      status: i % 3 === 0 ? 'DONE' : 'TODO',
      registerDatetime: createdAt,
    }
  })

export const db = {
  users: [
    { id: 'user1', email: 'user1@test.com', name: '사용자1', password: '12345678' },
  ] satisfies User[],
  tasks: createTasks(),
}

export const createToken = () => crypto.randomUUID()

export const nowSec = () => Math.floor(Date.now() / 1000)
