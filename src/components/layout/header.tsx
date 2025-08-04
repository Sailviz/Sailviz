import React from 'react'
import { SidebarTrigger } from '../ui/sidebar'

export default function Header() {
    return (
        <header className='lg:hidden flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
            <div className='flex items-center gap-2 px-4'>
                <SidebarTrigger className='-ml-1' />
            </div>
        </header>
    )
}
