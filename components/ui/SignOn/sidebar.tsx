import { Sidebar } from '../sidebar/sidebar.styles'
import { Avatar, Tooltip } from '@nextui-org/react'
import { HomeIcon } from 'components/icons/home-icon'
import { AccountsIcon } from 'components/icons/accounts-icon'
import { DevIcon } from 'components/icons/dev-icon'
import { SettingsIcon } from 'components/icons/settings-icon'
import { CollapseItems } from 'components/ui/sidebar/collapse-items'
import { SidebarItem } from 'components/ui/sidebar/sidebar-item'
import { SidebarMenu } from 'components/ui/sidebar/sidebar-menu'
import { FilterIcon } from 'components/icons/filter-icon'
import { useSidebarContext } from 'components/ui/SignOn/layout-context'
import { ChangeLogIcon } from 'components/icons/changelog-icon'
import { usePathname } from 'next/navigation'
import { ThemeSwitcher } from 'components/ui/ThemeSwitcher'
import { SailVizIcon } from 'components/icons/sailviz-icon'

import * as Fetcher from 'components/Fetchers'
import { PageSkeleton } from '../PageSkeleton'
import { SignOutIcon } from 'components/icons/sign-out'
import Cookies from 'js-cookie'
import React from 'react'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '../../helpers/users'
import { SignOnIcon } from '../../icons/sign-on'
import { RaceIcon } from '../../icons/race-icon'
import { SeriesIcon } from '../../icons/series-icon'
import { DocsIcon } from '../../icons/docs-icon'

export const SidebarWrapper = () => {
    const pathname = usePathname()
    const { collapsed, setCollapsed } = useSidebarContext()

    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { todaysRaces, todaysRacesIsError, todaysRacesIsValidating } = Fetcher.GetTodaysRaceByClubId(club)

    if (todaysRacesIsValidating || todaysRacesIsError || todaysRaces == undefined) {
        return <PageSkeleton />
    }

    return (
        <aside className='h-screen z-[20] sticky top-0 print:!hidden'>
            {collapsed ? <div className={Sidebar.Overlay()} onClick={setCollapsed} aria-label='collapse' /> : null}
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
                        <SidebarItem title='SignOn Sheet' icon={<SignOnIcon />} isActive={pathname === '/SignOn'} href='/SignOn' />
                        <SidebarMenu title='Main Menu'>
                            <CollapseItems
                                isActive={pathname === '/SignOn/Race'}
                                icon={<RaceIcon />}
                                items={todaysRaces?.map(race => race.series.name + ': ' + race.number)}
                                title="Today's Races"
                                hrefs={todaysRaces?.map(race => '/SignOn/Race/' + race.id)}
                            />
                            <CollapseItems
                                isActive={pathname === '/SignOn/Series'}
                                icon={<SeriesIcon />}
                                items={[...new Set(todaysRaces?.map(race => race.series.name))]}
                                title="Today's Series"
                                hrefs={[...new Set(todaysRaces?.map(race => '/SignOn/Series/' + race.series.id))]}
                            />
                            <SidebarItem isActive={pathname === '/SignOn/Guide'} title='User Guide' icon={<DocsIcon />} href='/SignOn/Guide' />
                        </SidebarMenu>

                        <SidebarMenu title='Updates'>
                            <SidebarItem isActive={pathname === '/changelog'} title='Changelog' icon={<ChangeLogIcon />} />
                        </SidebarMenu>
                        {userHasPermission(user, AVAILABLE_PERMISSIONS.dashboardAccess) ? (
                            <SidebarMenu title='Dashboard'>
                                <SidebarItem title='Back to Dashboard' icon={<SignOutIcon />} href='/Dashboard' />
                            </SidebarMenu>
                        ) : (
                            <SidebarMenu
                                title='Log Out'
                                aria-label='log out'
                                onClick={() => {
                                    Cookies.remove('token')
                                    Cookies.remove('clubId')
                                    Cookies.remove('userId')
                                }}
                            >
                                <SidebarItem title='Log Out' icon={<SignOutIcon />} href='/' />
                            </SidebarMenu>
                        )}
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
