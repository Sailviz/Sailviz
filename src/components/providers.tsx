'use client'

import ErrorBoundary from './ErrorBoundary'
import PlausibleProvider from 'next-plausible'
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from 'next-themes'
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
                    <ThemeProvider attribute='class' defaultTheme='light'>
                        {children}
                    </ThemeProvider>
                </SessionProvider>
            </PlausibleProvider>
        </ErrorBoundary>
    )
}
