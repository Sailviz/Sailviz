import { Metadata } from 'next'
import clsx from 'clsx'
import { fontSans } from 'config/fonts'
import { Providers } from '@/components/providers'
import { auth } from '@/server/auth'
import { Session } from 'next-auth'

export const metadata: Metadata = {
    title: 'SailViz',
    description: 'Sailing race system for clubs and regattas'
}
export default async function Layout({
    children // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    const fallbackSession = {} as Session // Provide a default or mock Session object
    return (
        <html lang='en' suppressHydrationWarning={true}>
            <body className={clsx('font-sans antialiased', fontSans.className)}>
                <Providers session={session ?? fallbackSession}>{children}</Providers>
            </body>
        </html>
    )
}
