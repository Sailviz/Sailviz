import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { signUp } from '@sailviz/auth/client'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
export function RegisterForm() {
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')

    const createClub = async () => {
        const { data, error } = await signUp.email({
            email: email,
            password: password,
            name: '',
            startPage: ''
        })
        console.log('Sign up response:', data, error)
        if (error) {
            console.error('Error signing up:', error)
            return
        }

        navigate({ to: '/dashboard/me' })
    }
    return (
        <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-6'>
                <div className='flex flex-col items-center gap-2'>
                    <a href='#' className='flex flex-col items-center gap-2 font-medium'>
                        <span className='sr-only'>SailViz</span>
                    </a>
                    <h1 className='text-xl font-bold'>Welcome to SailViz.</h1>
                    <div className='text-center text-sm'>
                        Already have an account?{' '}
                        <a href='/Login' className='underline underline-offset-4'>
                            Login
                        </a>
                    </div>
                </div>
            </div>
            <>
                <div className='flex flex-col gap-6'>
                    <div className='grid gap-2'>
                        Email
                        <Input id='email' name='email' required value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className='grid gap-2'>
                        Password
                        <Input id='password' name='password' type='password' required value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <Button type='submit' className='w-full' onClick={createClub}>
                        <span>Create Account</span>
                    </Button>
                </div>
            </>
            {/* <div className='text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  '>
                By clicking continue, you agree to our <a href='#'>Terms of Service</a> and <a href='#'>Privacy Policy</a>.
            </div> */}
        </div>
    )
}
