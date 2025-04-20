'use client'

import ErrorBoundary from './ErrorBoundary'
import PlausibleProvider from 'next-plausible'
import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'
import { SessionProvider } from 'next-auth/react'
import { Session } from 'next-auth'

//this avoids type issues because the types are not up do date.
export const ThemeProvider = (props: ThemeProviderProps): React.JSX.Element => {
    return NextThemesProvider(props) as React.JSX.Element
}

export function Providers({ children, session }: { children: React.ReactNode; session: Session }) {
    return (
        <ErrorBoundary>
            <PlausibleProvider domain='sailviz.com' customDomain='https://stats.sailviz.com' selfHosted enabled>
                <SessionProvider session={session}>
                    <NextUIProvider>
                        <ThemeProvider attribute='class' defaultTheme='light'>
                            {children}
                        </ThemeProvider>
                    </NextUIProvider>
                </SessionProvider>
            </PlausibleProvider>
        </ErrorBoundary>
    )
}
