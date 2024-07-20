import "../styles/globals.css";
import ErrorBoundary from '../../components/ErrorBoundary'
import type { AppProps } from 'next/app'
import PlausibleProvider from "next-plausible";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

function MyApp({ Component, pageProps }: AppProps) {
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
                        <Component {...pageProps} />
                    </NextThemesProvider>
                </NextUIProvider>
            </PlausibleProvider>
        </ErrorBoundary >
    );
};

export default MyApp;