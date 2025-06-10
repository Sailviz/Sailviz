'use client'
import { DynamicIcon, IconName } from 'lucide-react/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { redirect, useRouter } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { useState } from 'react'
import { signIn } from '@/lib/auth-client'
import { Loader2 } from 'lucide-react'
import { getSession } from '@/lib/auth-client'

export function LoginForm({ justCredentials }: { justCredentials: boolean }) {
    const Router = useRouter()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    return (
        <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-6'>
                <div className='flex flex-col items-center gap-2'>
                    <a href='#' className='flex flex-col items-center gap-2 font-medium'>
                        <span className='sr-only'>SailViz</span>
                    </a>
                    <h1 className='text-xl font-bold'>Welcome to SailViz.</h1>
                    <div className='text-center text-sm'>
                        Don&apos;t have an account?{' '}
                        <a href='/Register' className='underline underline-offset-4'>
                            Sign up
                        </a>
                    </div>
                </div>
            </div>
            <>
                <div className='flex flex-col gap-6'>
                    <div className='grid gap-2'>
                        Username
                        <Input
                            id='username'
                            name='username'
                            required
                            onChange={e => {
                                setUsername(e.target.value)
                            }}
                            value={username}
                        />
                    </div>
                    <div className='grid gap-2'>
                        Password
                        <Input id='password' name='password' type='password' required value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <Button
                        type='submit'
                        className='w-full'
                        disabled={loading}
                        onClick={async () => {
                            await signIn.username({ username, password }).then(async ({ data, error }) => {
                                const { data: session } = await getSession()
                                console.log('Session with custom fields:', session)
                                if (session === null) {
                                    alert('Login failed. Please check your username and password.')
                                    return
                                }
                                Router.push('/' + session.user.startPage)
                            })
                        }}
                    >
                        {loading ? <Loader2 size={16} className='animate-spin' /> : 'Login'}
                    </Button>
                    <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'>
                        <span className='relative z-10 bg-background px-2 text-muted-foreground'>Or</span>
                    </div>
                </div>
            </>
            <Button type='submit' className='w-full' variant='outline'>
                <DynamicIcon name={'github' as IconName} />
                <span>Continue with GitHub</span>
            </Button>
            {/* <div className='text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  '>
                By clicking continue, you agree to our <a href='#'>Terms of Service</a> and <a href='#'>Privacy Policy</a>.
            </div> */}
        </div>
    )
}
