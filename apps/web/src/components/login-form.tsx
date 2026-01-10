import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { signIn, getSession, type Session } from '@sailviz/auth/client'
import { isTauriRuntime } from '../is-tauri'
import { Github, Loader2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useRouter } from '@tanstack/react-router'
import { sessionQueryKey } from 'src/lib/session'
export function LoginForm() {
    const navigate = useNavigate()
    const router = useRouter()
    const queryClient = useQueryClient()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [checkingSession, setCheckingSession] = useState(true)

    async function hideSplash() {
        try {
            // Check if the splash screen has already been hidden
            if (localStorage.getItem('splashHidden') === 'true') {
                return
            }

            // Try plugin dynamic import first
            try {
                const mod = await eval('import("@tauri-apps/plugin-splashscreen")')
                if (mod && typeof (mod as any).hide === 'function') {
                    await (mod as any).hide()
                    return
                }
                if (mod && typeof (mod as any).close === 'function') {
                    await (mod as any).close()
                    return
                }
            } catch (e) {
                // ignore and try invoke
            }

            // Fallback: attempt invoke plugin command (plugin:NAME|cmd)
            try {
                const { invoke } = await eval('import("@tauri-apps/api/tauri")')
                // try common command names used by splash plugins
                await invoke('plugin:splashscreen|close')
            } catch (e) {
                // ignore any errors
            }

            // Final fallback: if the web-based splash overlay exists, hide it.
            try {
                if ((window as any).hideTauriSplash) {
                    ;(window as any).hideTauriSplash()
                    localStorage.setItem('splashHidden', 'true') // Cache the state
                    return
                }
                const el = document.getElementById('tauri-splash')
                if (el && (el as HTMLElement).style) {
                    ;(el as HTMLElement).style.display = 'none'
                    localStorage.setItem('splashHidden', 'true') // Cache the state
                }
            } catch (e) {
                // ignore
            }
        } catch (e) {
            console.warn('hideSplash failed', e)
        }
    }
    // On mount, check for an existing session. If running inside Tauri,
    // keep the native splashscreen visible until we've verified the session
    // and either navigated to the dashboard or removed the splash so the
    // login page is visible.
    useEffect(() => {
        let mounted = true

        ;(async () => {
            try {
                const session: Session = await getSession()
                if (!mounted) return
                if (session && session.user) {
                    // We have a valid session — navigate to start page
                    try {
                        if (isTauriRuntime()) {
                            await hideSplash()
                        }
                    } catch (e) {}
                    try {
                        // Use router navigation to avoid full reloads
                        navigate({ to: '/' + (session.user.startPage || 'dashboard/me') })
                        return
                    } catch (e) {
                        // fallback to full reload
                        window.location.replace('/' + (session.user.startPage || 'dashboard/me'))
                        return
                    }
                }
                // No valid session found; allow the login UI to render
                if (mounted) setCheckingSession(false)
            } catch (e) {
                // ignore — treat as unauthenticated
                if (mounted) setCheckingSession(false)
            }

            // No session — remove splash (if present) and stay on login page
            if (isTauriRuntime()) {
                try {
                    await hideSplash()
                } catch (e) {}
            }
            if (mounted) setCheckingSession(false)
        })()

        return () => {
            mounted = false
        }
    }, [])

    const handleSubmit = async () => {
        setLoading(true)
        const isTauri = isTauriRuntime()
        console.log('handleSubmit: isTauri ->', isTauri)

        // Web (cookie-based) flow
        await signIn
            .email({
                email: username,
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
        await signIn
            .social({
                provider: 'github',
                callbackURL: 'http://localhost:5173' + '/dashboard/me',
                fetchOptions: {
                    redirect: 'manual'
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
    }

    if (checkingSession) {
        // Keep a minimal blank while we verify session to avoid flashing the login UI
        return <div />
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
