import "../styles/globals.css";
import ErrorBoundary from '../components/ErrorBoundary'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ErrorBoundary>
            <Component {...pageProps} />;
        </ErrorBoundary>
    );
};

export default MyApp;