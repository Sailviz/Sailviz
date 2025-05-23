import { Metadata } from 'next'
import '@/styles/globals.css'

import { SailVizIcon } from '@/components/icons/sailviz-icon'
import { Suspense } from 'react'

export const metadata: Metadata = {
    title: 'SailViz',
    description: 'Sailing race system for clubs and regattas'
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return <Suspense>{children}</Suspense>
}
