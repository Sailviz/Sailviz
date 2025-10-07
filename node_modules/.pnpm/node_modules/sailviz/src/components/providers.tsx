'use client'

import ErrorBoundary from './ErrorBoundary'
import PlausibleProvider from 'next-plausible'
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from 'next-themes'

//this avoids type issues because the types are not up do date.
export const ThemeProvider = (props: ThemeProviderProps): React.JSX.Element => {
    return NextThemesProvider(props) as React.JSX.Element
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary>
            <PlausibleProvider domain='sailviz.com' customDomain='https://stats.sailviz.com' selfHosted enabled>
                <ThemeProvider attribute='class' defaultTheme='light'>
                    {children}
                </ThemeProvider>
            </PlausibleProvider>
        </ErrorBoundary>
    )
}
