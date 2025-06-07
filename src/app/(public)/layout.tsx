import { Metadata } from 'next'
import '@/styles/globals.css'

import { SailVizIcon } from '@/components/icons/sailviz-icon'
import HomeNav from '@/components/layout/home/navbar'
import HomeFooter from '@/components/layout/home/footer'

export const metadata: Metadata = {
    title: 'SailViz',
    description: 'Sailing race system for clubs and regattas'
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <HomeNav />
            {children}
            <HomeFooter />
        </>
    )
}
