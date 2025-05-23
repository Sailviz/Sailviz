import { Metadata } from 'next'
import '@/styles/globals.css'
import BackButton from '@/components/layout/backButton'

export const metadata: Metadata = {
    title: 'SailViz',
    description: 'Sailing race system for clubs and regattas'
}
export default function DashboardLayout({
    children // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <div className='flex flex-col h-full overflow-hidden'>
            <nav className='py-2.5 border-b-2 flex h-16'>
                <div className='container flex flex-wrap justify-start items-start'>
                    <div className='px-3'>
                        <BackButton />
                    </div>
                    <div className=' text-4xl font-bold px-1 cursor-pointer'>SailViz </div>
                </div>
            </nav>
            <main className='flex items-stretch w-full h-full'>{children}</main>
        </div>
    )
}
