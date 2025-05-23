import AppSidebar from '@/components/layout/app-sidebar'
import Header from '@/components/layout/header'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { navCollections } from '@/constants/navCollections'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'SailViz',
    description: 'Sailing race system for clubs and regattas'
}
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar navCollections={navCollections} />
            <SidebarInset>
                <Header />
                {/* page main content */}
                {/* 64px = header height */}
                <ScrollArea className='h-[calc(100dvh-64px)]'>
                    <div className='flex flex-1 p-4 md:px-6'>{children}</div>
                </ScrollArea>
                {/* page main content ends */}
            </SidebarInset>
        </SidebarProvider>
    )
}
