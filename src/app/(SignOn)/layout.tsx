import AppSidebar from '@/components/layout/app-sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { DocsIcon } from '@/components/icons/docs-icon'
import { HomeIcon } from '@/components/icons/home-icon'
import { RaceIcon } from '@/components/icons/race-icon'
import { SeriesIcon } from '@/components/icons/series-icon'
import { SettingsIcon } from '@/components/icons/settings-icon'
import { SignOnIcon } from '@/components/icons/sign-on'
import { SignOutIcon } from '@/components/icons/sign-out'
import type { Metadata } from 'next'
import { auth } from '@/server/auth'
import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import prisma from '@/lib/prisma'
import dayjs from 'dayjs'
import { race } from 'cypress/types/bluebird'
import { Series } from '@/components/Fetchers'

export const metadata: Metadata = {
    title: 'SailViz',
    description: 'Sailing race system for clubs and regattas'
}
export default async function SignOnLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()
    const todaysRaces = await prisma.race.findMany({
        where: {
            AND: [
                {
                    Time: {
                        gte: dayjs().set('hour', 0).set('minute', 0).set('second', 0).format('YYYY-MM-DD HH:ss'),
                        lte: dayjs().set('hour', 24).set('minute', 0).set('second', 0).format('YYYY-MM-DD HH:ss')
                    }
                },
                {
                    series: {
                        clubId: session?.user.clubId!
                    }
                }
            ]
        },
        orderBy: {
            Time: 'asc'
        },
        select: {
            id: true,
            number: true,
            Time: true,
            series: {
                select: {
                    name: true,
                    id: true
                }
            }
        }
    })

    const backButton: NavCollection = userHasPermission(session?.user!, AVAILABLE_PERMISSIONS.dashboardAccess)
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
              items: []
          }

    const todaysRacesItems: NavItem[] = todaysRaces.map(race => ({
        title: `${race.series.name}: ${race.number}`,
        url: `/SignOn/Race/${race.id}?`,
        icon: <RaceIcon />,
        shortcut: ['e', 'e'],
        isActive: false,
        items: []
    }))

    const todaysSeries = [...new Set(todaysRaces?.map(race => race.series.name))]
    const todaysSeriesIds = [...new Set(todaysRaces?.map(race => race.series.id))]

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
                },
                {
                    title: 'User Guide',
                    url: '/SignOn/History',
                    icon: <DocsIcon />,
                    shortcut: ['e', 'e'],
                    isActive: false,
                    items: [] // No child items
                }
            ]
        },
        backButton
    ]

    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar navCollections={SignOn} />
            <SidebarInset>
                {/* page main content */}
                <div className='flex flex-1 p-4 md:px-6'>{children}</div>
                {/* page main content ends */}
            </SidebarInset>
        </SidebarProvider>
    )
}
