import AppSidebar from '@components/layout/app-sidebar'
import { SidebarInset, SidebarProvider } from '@components/ui/sidebar'
import { RaceIcon } from '@components/icons/race-icon'
import { SeriesIcon } from '@components/icons/series-icon'
import { SignOnIcon } from '@components/icons/sign-on'
import { SignOutIcon } from '@components/icons/sign-out'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@components/helpers/users'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { RaceType } from '@sailviz/types'
import { useLoaderData } from '@tanstack/react-router'
import Header from '../header'
import type { Session } from '@sailviz/auth/client'

export default function SignOnLayout({ children }: { children: React.ReactNode }) {
    const session: Session = useLoaderData({ from: `__root__` })

    const todaysRaces = useQuery(orpcClient.race.today.queryOptions({ input: { orgId: session.session.activeOrganizationId! } })).data as RaceType[]

    const backButton: NavCollection = userHasPermission(session!.user, AVAILABLE_PERMISSIONS.dashboardAccess)
        ? {
              title: 'Back to Dashboard',
              items: [
                  {
                      title: 'Back to Dashboard',
                      url: '/Dashboard',
                      icon: <SignOutIcon />,
                      isActive: false,
                      items: [],
                      shortcut: []
                  }
              ]
          }
        : {
              title: '',
              items: [
                  {
                      title: 'Log Out',
                      url: '/Logout',
                      icon: <SignOutIcon />,
                      shortcut: ['e', 'e'],
                      isActive: false,
                      items: [] // No child items
                  }
              ]
          }

    const todaysRacesItems: NavItem[] = todaysRaces.map(race => ({
        title: `SeriesName: ${race.number}`,
        url: `/SignOn/Race/${race.id}?`,
        icon: <RaceIcon />,
        shortcut: ['e', 'e'],
        isActive: false,
        items: []
    }))

    const todaysSeries = [...new Set(todaysRaces?.map(race => race.series!.name))]
    const todaysSeriesIds = [...new Set(todaysRaces?.map(race => race.seriesId))]

    const todaysSeriesItems: NavItem[] = todaysSeries.map((Series, index) => {
        return {
            title: Series,
            url: `/SignOn/Series/${todaysSeriesIds[index]}`,
            icon: <SeriesIcon />,
            shortcut: ['e', 'e'],
            isActive: false,
            items: []
        }
    })

    const SignOn: NavCollection[] = [
        {
            title: '',
            items: [
                {
                    title: 'Sign On Sheet',
                    url: '/SignOn',
                    icon: <SignOnIcon />,
                    isActive: true,
                    shortcut: ['e', 'e'],
                    items: [] // No child items
                }
            ]
        },
        {
            title: 'Main Menu',
            items: [
                {
                    title: "Today's Races",
                    url: '/SignOn/CreateResult',
                    icon: <RaceIcon />,
                    shortcut: ['e', 'e'],
                    isActive: false,
                    items: todaysRacesItems
                },
                {
                    title: "Today's Series",
                    url: '/SignOn/EditResult',
                    icon: <SeriesIcon />,
                    shortcut: ['e', 'e'],
                    isActive: false,
                    items: todaysSeriesItems
                }
                // {
                //     title: 'User Guide',
                //     url: '/SignOn/Guide',
                //     icon: <DocsIcon />,
                //     shortcut: ['e', 'e'],
                //     isActive: false,
                //     items: [] // No child items
                // }
            ]
        },
        backButton
    ]

    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar navCollections={SignOn} />
            <SidebarInset>
                <Header />

                {/* page main content */}
                <div className='flex flex-1 p-4 md:px-6'>{children}</div>
                {/* page main content ends */}
            </SidebarInset>
        </SidebarProvider>
    )
}
