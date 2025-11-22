import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { signIn, getSession } from '@sailviz/auth/client'
import { isTauriRuntime } from '../is-tauri'
import { Github, Loader2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useRouter } from '@tanstack/react-router'
import { api_server, server } from '@components/URL'
import { sessionQueryKey } from 'src/lib/session'
export function LoginForm() {
    const navigate = useNavigate()
    const router = useRouter()
    const queryClient = useQueryClient()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        setLoading(true)
        const isTauri = isTauriRuntime()
        console.log('handleSubmit: isTauri ->', isTauri)

        if (isTauri) {
            console.log('handleSubmit: taking Tauri auth branch')
            // Tauri: call the server-side tauri sign-in endpoint which returns a token
            // In the test environment the API is hosted at api.dev.sailviz.com
            let res: Response
            try {
                res = await fetch(`${api_server}/api/auth/my-plugin/tauri-signin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                })
            } catch (e) {
                console.error('Tauri sign-in fetch failed:', e)
                alert('Login failed: cannot reach auth server.')
                setLoading(false)
                return
            }
            if (!res.ok) {
                const text = await res.text().catch(() => '')
                console.error('Tauri sign-in failed', res.status, text)
                alert('Login failed. Please check your username and password.')
                setLoading(false)
                return
            }
            let data: any = null
            try {
                data = await res.json()
            } catch (e) {
                console.error('Tauri sign-in: failed to parse JSON response', e)
                alert('Login failed: invalid response from auth server.')
                setLoading(false)
                return
            }
            console.log('Tauri sign-in response:', data)

            // Store token securely for Tauri. Prefer Tauri store when available.
            try {
                if (typeof window !== 'undefined' && (window as any).__TAURI__ !== undefined) {
                    // Running inside Tauri renderer — use tauri-plugin-store-api directly
                    try {
                        // Use eval'd dynamic import so the bundler doesn't try to
                        // resolve `tauri-plugin-store-api` during web build.
                        const { Store } = await eval('import("tauri-plugin-store-api")')
                        const store = new Store('sailviz-store.dat')
                        await store.set('sailviz_token', data.token)
                        await store.save()
                        // Initialize the Tauri fetch wrapper so future fetches include the token
                        try {
                            const tauriInit = await import('../tauri-init')
                            await tauriInit.initTauriAuth()
                        } catch (e) {}
                    } catch (e) {
                        // Fallback to localStorage if helper import fails
                        try {
                            ;(window as any).localStorage.setItem('sailviz_token', data.token)
                        } catch {}
                    }
                } else {
                    ;(window as any).localStorage.setItem('sailviz_token', data.token)
                }
            } catch (e) {}

            // Retrieve session using token fallback
            const { data: session } = await getSession()
            console.log('Session with custom fields (tauri):', session)
            if (session === null) {
                alert('Login failed. Please check your username and password.')
                setLoading(false)
                return
            }

            // continue with normal post-login flow
            try {
                queryClient.setQueryData(sessionQueryKey, session)
            } catch {}
            try {
                await router.invalidate()
            } catch {}
            navigate({ to: '/' + session.user.startPage })
            setLoading(false)
            return
        }

        // Web (cookie-based) flow
        await signIn
            .username({
                username,
                password,
                fetchOptions: {
                    redirect: 'manual', // Prevent automatic redirection
                    credentials: 'include'
                }
            })
            .then(async ({ data, error }) => {
                console.log('SignIn response:', data, error)
                const { data: session } = await getSession()
                console.log('Session with custom fields:', session)
                if (session === null) {
                    alert('Login failed. Please check your username and password.')
                    return
                }
                console.log('Session:', session)
                // Make the fresh session immediately available to consumers
                // so guards/beforeLoad can read it synchronously from cache.
                try {
                    queryClient.setQueryData(sessionQueryKey, session)
                } catch {}
                // Now re-run route loaders so pages depending on loaders refresh.
                try {
                    await router.invalidate()
                } catch {}
                navigate({ to: '/' + session.user.startPage })
            })
        setLoading(false)
    }

    const handleGitHubLogin = async () => {
        await signIn.social({
            provider: 'github',
            callbackURL: server + '/authsorter'
        })
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
                        <Input
                            id='password'
                            name='password'
                            type='password'
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={event => {
                                if (event.key == 'Enter') {
                                    handleSubmit()
                                }
                            }}
                        />
                    </div>
                    <Button type='submit' className='w-full' disabled={loading} onClick={handleSubmit}>
                        {loading ? <Loader2 size={16} className='animate-spin' /> : 'Login'}
                    </Button>
                    <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'>
                        <span className='relative z-10 bg-background px-2 text-muted-foreground'>Or</span>
                    </div>
                </div>
            </>
            <Button onClick={handleGitHubLogin} className='w-full' variant='outline'>
                <Github />
                <span>Continue with GitHub</span>
            </Button>
            {/* <div className='text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  '>
                By clicking continue, you agree to our <a href='#'>Terms of Service</a> and <a href='#'>Privacy Policy</a>.
            </div> */}
        </div>
    )
}
