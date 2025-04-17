import { Metadata } from 'next'
import clsx from 'clsx'
import { fontSans } from 'config/fonts'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
    title: 'SailViz',
    description: 'Sailing race system for clubs and regattas'
}
export default function Layout({
    children // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <html lang='en' suppressHydrationWarning={true}>
            <body className={clsx('font-sans antialiased', fontSans.className)}>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
