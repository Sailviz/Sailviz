import { signIn, providerMap } from '@/server/auth'
import { Button, Input } from '@nextui-org/react'
import { DynamicIcon, IconName } from 'lucide-react/dynamic'

export function LoginForm({ justCredentials }: { justCredentials: boolean }) {
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
                        <a href='#' className='underline underline-offset-4'>
                            Sign up
                        </a>
                    </div>
                </div>
            </div>

            {Object.values(providerMap).map(provider => (
                <form
                    key={provider.id}
                    action={async formData => {
                        'use server'
                        if (provider.id === 'credentials') {
                            await signIn(provider.id, {
                                redirectTo: '/Dashboard',
                                password: formData.get('password'),
                                username: formData.get('username')
                            })
                        } else {
                            await signIn(provider.id, { callbackUrl: '/Dashboard' })
                        }
                    }}
                >
                    {provider.id === 'credentials' && (
                        <>
                            <div className='flex flex-col gap-6'>
                                <div className='grid gap-2'>
                                    Username
                                    <Input id='username' name='username' required />
                                </div>
                                <div className='grid gap-2'>
                                    Password
                                    <Input id='password' name='password' type='password' required />
                                </div>
                                <Button type='submit' className='w-full'>
                                    <span>Login</span>
                                </Button>
                                <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'>
                                    <span className='relative z-10 bg-background px-2 text-muted-foreground'>Or</span>
                                </div>
                            </div>
                        </>
                    )}
                    {provider.id !== 'credentials' && (
                        <Button type='submit' variant='bordered' className='w-full'>
                            <DynamicIcon name={provider.name.toLowerCase() as IconName} />
                            <span>Continue with {provider.name}</span>
                        </Button>
                    )}
                </form>
            ))}
            {/* <div className='text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  '>
                By clicking continue, you agree to our <a href='#'>Terms of Service</a> and <a href='#'>Privacy Policy</a>.
            </div> */}
        </div>
    )
}
