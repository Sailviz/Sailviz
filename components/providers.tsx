"use client"

import ErrorBoundary from './ErrorBoundary'
import PlausibleProvider from "next-plausible";
import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary>
            <PlausibleProvider
                domain="sailviz.com"
                customDomain="https://stats.sailviz.com"
                selfHosted
                enabled
            >
                <NextUIProvider>
                    <NextThemesProvider attribute="class" defaultTheme="dark">
                        {children}
                    </NextThemesProvider>
                </NextUIProvider>
            </PlausibleProvider>
        </ErrorBoundary >
    )
}