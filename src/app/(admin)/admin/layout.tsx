import AppSidebar from '@/components/layout/app-sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AdminNavCollections } from '@/constants/navCollections'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'SailViz',
    description: 'Sailing race system for clubs and regattas'
}
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar navCollections={AdminNavCollections} />
            <SidebarInset>
                {/* page main content */}
                <ScrollArea className='h-full'>
                    <div className='flex flex-1 p-4 md:px-6'>{children}</div>
                </ScrollArea>
                {/* page main content ends */}
            </SidebarInset>
        </SidebarProvider>
    )
}
