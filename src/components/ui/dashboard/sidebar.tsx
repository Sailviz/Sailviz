import { Sidebar } from '../sidebar/sidebar.styles'
import { Avatar, Tooltip } from '@nextui-org/react'
import { HomeIcon } from '@/components/icons/home-icon'
import { AccountsIcon } from '@/components/icons/accounts-icon'
import { DevIcon } from '@/components/icons/dev-icon'
import { SettingsIcon } from '@/components/icons/settings-icon'
import { CollapseItems } from '@/components/ui/sidebar/collapse-items'
import { SidebarItem } from '@/components/ui/sidebar/sidebar-item'
import { SidebarMenu } from '@/components/ui/sidebar/sidebar-menu'
import { FilterIcon } from '@/components/icons/filter-icon'
import { useSidebarContext } from '@/components/ui/sidebar/layout-context'
import { ChangeLogIcon } from '@/components/icons/changelog-icon'
import { usePathname } from 'next/navigation'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'
import { SailVizIcon } from '@/components/icons/sailviz-icon'
import { SignOutIcon } from '@/components/icons/sign-out'
import Cookies from 'js-cookie'
import { MapIcon } from '../../icons/map-icon'
import { SignOnIcon } from '../../icons/sign-on'
import { DocsIcon } from '../../icons/docs-icon'
import { RaceIcon } from '../../icons/race-icon'
import { SeriesIcon } from '../../icons/series-icon'

export const SidebarWrapper = () => {
    const pathname = usePathname()
    const { collapsed, setCollapsed } = useSidebarContext()

    return (
        <aside className='h-screen z-[20] sticky top-0 print:!hidden'>
            {collapsed ? <div className={Sidebar.Overlay()} onClick={setCollapsed} /> : null}
            <div
                className={Sidebar({
                    collapsed: collapsed
                })}
            >
                <div className={Sidebar.Header()}>
                    {/* <CompaniesDropdown /> */}
                    <div className='flex items-center gap-2'>
                        <SailVizIcon />
                        <div className='flex flex-col gap-4'>
                            <h3 className='text-xl font-medium m-0 text-default-900 -mb-4 whitespace-nowrap'>SailViz</h3>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col justify-between h-full'>
                    <div className={Sidebar.Body()}>
                        <SidebarItem title='Home' icon={<HomeIcon />} isActive={pathname === '/Dashboard'} href='/Dashboard' />
                        <SidebarMenu title='Main Menu'>
                            <SidebarItem isActive={pathname === '/Race'} title='Races' icon={<RaceIcon />} href='/Race' />
                            <SidebarItem isActive={pathname === '/Series'} title='Series' icon={<SeriesIcon />} href='/Series' />
                            <SidebarItem isActive={pathname === '/Documentation'} title='User Guide' icon={<DocsIcon />} href='/Documentation' />
                        </SidebarMenu>

                        <SidebarMenu title='Pages'>
                            <SidebarItem isActive={pathname === '/SignOn'} title='SignOn' icon={<SignOnIcon />} href='/SignOn' />
                        </SidebarMenu>

                        <SidebarMenu title='Admin'>
                            <CollapseItems
                                icon={<SettingsIcon />}
                                isActive={pathname === '/Dashboard/Club' || pathname === '/Dashboard/Boats' || pathname === '/Dashboard/Hardware'}
                                items={['Club', 'Boats', 'Hardware']}
                                title='Settings'
                                hrefs={['/Dashboard/Club', '/Dashboard/Boats', '/Dashboard/Hardware']}
                            />
                            <SidebarItem isActive={pathname === '/Dashboard/Users'} title='Users' icon={<AccountsIcon />} href='/Dashboard/Users' />
                            <SidebarItem isActive={pathname === '/Dashboard/Trackable/'} title='Trackable' icon={<MapIcon />} href='/Dashboard/Trackable' />
                        </SidebarMenu>

                        <SidebarMenu title='Updates'>
                            <SidebarItem isActive={pathname === '/Dashboard/Changelog'} title='Changelog' icon={<ChangeLogIcon />} href='/Dashboard/Changelog' />
                        </SidebarMenu>
                        <SidebarMenu
                            title='Log Out'
                            onClick={() => {
                                Cookies.remove('token')
                                Cookies.remove('clubId')
                                Cookies.remove('userId')
                            }}
                        >
                            <SidebarItem title='Log Out' icon={<SignOutIcon />} href='/' />
                        </SidebarMenu>
                    </div>
                </div>
                <div className={Sidebar.Footer()}>
                    <SidebarMenu title='Dark Mode'>
                        <ThemeSwitcher />
                    </SidebarMenu>
                </div>
            </div>
        </aside>
    )
}
