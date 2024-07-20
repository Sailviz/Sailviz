"use client"

import ErrorBoundary from './ErrorBoundary'
import PlausibleProvider from "next-plausible";
import { NextUIProvider } from '@nextui-org/react'

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

//this avoids type issues because the ty
export const ThemeProvider = (props: ThemeProviderProps): React.JSX.Element => {
    return NextThemesProvider(props) as React.JSX.Element;
};

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
                    <ThemeProvider attribute="class" defaultTheme="dark">
                        {children}
                    </ThemeProvider>
                </NextUIProvider>
            </PlausibleProvider>
        </ErrorBoundary >
    )
}