'use client'

import * as Sentry from '@sentry/nextjs'
import NextError from 'next/error'
import { useEffect } from 'react'

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
    useEffect(() => {
        const fetchCookiesAndCaptureError = async () => {
            Sentry.captureException(error)
        }
        fetchCookiesAndCaptureError()
    }, [error])

    return (
        <html>
            <body>
                {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
                {/* @ts-ignore */}
                <NextError statusCode={0} />
            </body>
        </html>
    )
}
