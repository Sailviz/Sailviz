import "../styles/globals.css";
import ErrorBoundary from '../components/ErrorBoundary'
import type { AppProps } from 'next/app'
import PlausibleProvider from "next-plausible";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ErrorBoundary>
            <PlausibleProvider
                domain="sailviz.com"
                customDomain="https://stats.sailviz.com"
                selfHosted
                enabled
            >
                <Component {...pageProps} />
            </PlausibleProvider>
        </ErrorBoundary>
    );
};

export default MyApp;