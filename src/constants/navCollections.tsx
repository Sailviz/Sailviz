import { DocsIcon } from '@/components/icons/docs-icon'
import { HomeIcon } from '@/components/icons/home-icon'
import { RaceIcon } from '@/components/icons/race-icon'
import { SeriesIcon } from '@/components/icons/series-icon'
import { SettingsIcon } from '@/components/icons/settings-icon'
import { SignOnIcon } from '@/components/icons/sign-on'
import { SignOutIcon } from '@/components/icons/sign-out'

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navCollections: NavCollection[] = [
    {
        title: '',
        items: [
            {
                title: 'Home',
                url: '/Dashboard',
                icon: <HomeIcon />,
                isActive: true,
                shortcut: ['d', 'd'],
                items: [] // Empty array as there are no child items for Dashboard
            }
        ]
    },
    {
        title: 'Main Menu',
        items: [
            {
                title: 'Races',
                url: '/Race',
                icon: <RaceIcon />,
                shortcut: ['p', 'p'],
                isActive: false,
                items: [] // No child items
            },
            {
                title: 'Series',
                url: '/Series',
                icon: <SeriesIcon />,
                shortcut: ['e', 'e'],
                isActive: false,
                items: [] // No child items
            },
            {
                title: 'User Guide',
                url: '/Documentation',
                icon: <DocsIcon />,
                shortcut: ['e', 'e'],
                isActive: false,
                items: [] // No child items
            }
        ]
    },
    {
        title: 'Pages',
        items: [
            {
                title: 'Sign On',
                url: '/SignOn',
                icon: <SignOnIcon />,
                shortcut: ['e', 'e'],
                isActive: false,
                items: [] // No child items
            }
        ]
    },
    {
        title: 'Admin',
        items: [
            {
                title: 'Settings',
                url: '#', // Placeholder as there is no direct link for the parent
                icon: <SettingsIcon />,
                isActive: false,

                items: [
                    {
                        title: 'Club',
                        url: '/Dashboard/Club',
                        icon: <HomeIcon />,
                        shortcut: ['m', 'm'],
                        isActive: false,
                        items: []
                    },
                    {
                        title: 'Boats',
                        shortcut: ['l', 'l'],
                        url: '/Dashboard/Boats',
                        icon: <HomeIcon />,
                        isActive: false,
                        items: []
                    },
                    {
                        title: 'Hardware',
                        shortcut: ['l', 'l'],
                        url: '/Dashboard/Hardware',
                        icon: <HomeIcon />,
                        isActive: false,
                        items: []
                    },
                    {
                        title: 'Users',
                        shortcut: ['l', 'l'],
                        url: '/Dashboard/Users',
                        icon: <HomeIcon />,
                        isActive: false,
                        items: []
                    },
                    {
                        title: 'Trackable',
                        shortcut: ['l', 'l'],
                        url: '/Dashboard/Trackable',
                        icon: <HomeIcon />,
                        isActive: false,
                        items: []
                    }
                ],
                shortcut: []
            }
        ]
    },
    {
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
]
