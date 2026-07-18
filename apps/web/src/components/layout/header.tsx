import { Separator } from '@components/ui/separator'
import { SidebarTrigger } from '@components/ui/sidebar'
import { Breadcrumbs } from '@components/breadcrumbs'

export default function Header() {
    return (
        <header className=' flex h-16! shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
            <div className='flex items-center gap-2 px-4'>
                <SidebarTrigger className='lg:hidden -ml-1 relative z-40' />
                <Separator orientation='vertical' className='lg:hidden mr-2 h-4' />
                <Breadcrumbs />
            </div>
        </header>
    )
}
