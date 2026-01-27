import { z } from 'zod'

const passwordRegex = /^[A-Za-z0-9가-힣]+$/

export const loginSchema = z.object({
  email: z.string().min(1, '이메일은 필수입니다.').email('이메일 형식이 올바르지 않습니다.'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .max(24, '비밀번호는 24자 이하여야 합니다.')
    .regex(passwordRegex, '비밀번호는 영문/한글/숫자만 사용할 수 있습니다.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
