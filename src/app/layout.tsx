import { Metadata } from 'next'
import clsx from 'clsx'
import { fontSans } from 'config/fonts'
import { Providers } from '@/components/providers'
import { auth } from '@/server/auth'

import '@/styles/globals.css'
export const metadata: Metadata = {
    title: 'SailViz',
    description: 'Sailing race system for clubs and regattas'
}
export default async function Layout({
    children, // will be a page or nested layout
    modal
}: {
    children: React.ReactNode
    modal: React.ReactNode
}) {
    const session = await auth()
    return (
        <html lang='en'>
            <body className={clsx('font-sans antialiased', fontSans.className)}>
                <Providers session={session}>
                    {modal}
                    {children}
                </Providers>
            </body>
        </html>
    )
}
