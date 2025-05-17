import { Metadata } from 'next'
import 'styles/globals.css'

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from '@nextui-org/react'
import { SailVizIcon } from '@/components/icons/sailviz-icon'
import HomeNav from '@/components/ui/home/navbar'
import HomeFooter from '@/components/ui/home/footer'

export const metadata: Metadata = {
    title: 'SailViz',
    description: 'Sailing race system for clubs and regattas'
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <HomeNav />
            {children}
            <HomeFooter />
        </div>
    )
}
