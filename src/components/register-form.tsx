import { signIn, providerMap, Register } from '@/server/auth'
import { DynamicIcon, IconName } from 'lucide-react/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function RegisterForm() {
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
            {Object.values(providerMap).map(provider => (
                <form
                    key={provider.id}
                    action={async formData => {
                        'use server'
                        if (provider.id === 'credentials') {
                            //register a new user
                            if (await Register(formData)) {
                                await signIn(provider.id, {
                                    redirectTo: '/Dashboard',
                                    password: formData.get('password') as string,
                                    username: formData.get('username') as string
                                })
                            }
                        } else {
                            await signIn(provider.id, { callbackUrl: '/Dashboard' })
                        }
                    }}
                >
                    {provider.id === 'credentials' && (
                        <>
                            <div className='flex flex-col gap-6'>
                                <div className='grid gap-2'>
                                    Club Name
                                    <Input id='clubName' name='clubName' required />
                                </div>
                                <div className='grid gap-2'>
                                    Username
                                    <Input id='username' name='username' required />
                                </div>
                                <div className='grid gap-2'>
                                    Password
                                    <Input id='password' name='password' type='password' required />
                                </div>
                                <Button type='submit' className='w-full'>
                                    <span>Create Account</span>
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            ))}
            {/* <div className='text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  '>
                By clicking continue, you agree to our <a href='#'>Terms of Service</a> and <a href='#'>Privacy Policy</a>.
            </div> */}
        </div>
    )
}
