'use client'
import { DynamicIcon, IconName } from 'lucide-react/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signUp } from '@/lib/auth-client'
import { useState } from 'react'

export function RegisterForm() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const Register = async () => {
        const { data, error } = await signUp.email(
            {
                username, // user email address
                password, // user password -> min 8 characters by default
                callbackURL: '/dashboard', // A URL to redirect to after the user verifies their email (optional)
                email: 'null@sailviz.com',
                name: '',
                clubId: '',
                startPage: ''
            },
            {
                onRequest: ctx => {
                    //show loading
                },
                onSuccess: ctx => {
                    //redirect to the dashboard or sign in page
                },
                onError: ctx => {
                    // display the error message
                    alert(ctx.error.message)
                }
            }
        )
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
                        Club Name
                        <Input id='clubName' name='clubName' required />
                    </div>
                    <div className='grid gap-2'>
                        Username
                        <Input id='username' name='username' required value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div className='grid gap-2'>
                        Password
                        <Input id='password' name='password' type='password' required value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <Button type='submit' className='w-full' onClick={Register}>
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
