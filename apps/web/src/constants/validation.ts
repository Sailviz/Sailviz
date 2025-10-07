import { z } from 'zod'

const loginSchema = z.object({
    username: z.string().default(''),
    password: z.string().min(4, 'Password must be at least 6 characters').default('')
})

const autoLoginSchema = z.object({
    uuid: z.string().default('')
})

const registerSchema = z.object({
    username: z.string().min(2, 'First name is required').default(''),
    password: z.string().min(6, 'Password must be at least 6 characters').default('')
})

export { registerSchema, loginSchema, autoLoginSchema, z }
