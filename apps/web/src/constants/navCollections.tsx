import { DocsIcon } from '@components/icons/docs-icon'
import { HomeIcon } from '@components/icons/home-icon'
import { RaceIcon } from '@components/icons/race-icon'
import { SeriesIcon } from '@components/icons/series-icon'
import { SettingsIcon } from '@components/icons/settings-icon'
import { SignOnIcon } from '@components/icons/sign-on'
import { SignOutIcon } from '@components/icons/sign-out'

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navCollections: NavCollection[] = [
    {
        title: '',
        items: [
            {
                title: 'Home',
                url: '/dashboard',
                icon: <HomeIcon />,
                isActive: true,
                shortcut: ['d', 'd'],
                items: [] // Empty array as there are no child items for dashboard
            }
        ]
    },
    {
        title: 'Main Menu',
        items: [
            {
                title: 'Races',
                url: '/dashboard/Race',
                icon: <RaceIcon />,
                shortcut: ['p', 'p'],
                isActive: false,
                items: [] // No child items
            },
            {
                title: 'Series',
                url: '/dashboard/Series',
                icon: <SeriesIcon />,
                shortcut: ['e', 'e'],
                isActive: false,
                items: [] // No child items
            },
            {
                title: 'User Guide',
                url: '/dashboard/Documentation',
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
                        url: '/dashboard/Club',
                        icon: <HomeIcon />,
                        shortcut: ['m', 'm'],
                        isActive: false,
                        items: []
                    },
                    {
                        title: 'Boats',
                        shortcut: ['l', 'l'],
                        url: '/dashboard/Boats',
                        icon: <HomeIcon />,
                        isActive: false,
                        items: []
                    },
                    {
                        title: 'Hardware',
                        shortcut: ['l', 'l'],
                        url: '/dashboard/Hardware',
                        icon: <HomeIcon />,
                        isActive: false,
                        items: []
                    },
                    {
                        title: 'Users',
                        shortcut: ['l', 'l'],
                        url: '/dashboard/Users',
                        icon: <HomeIcon />,
                        isActive: false,
                        items: []
                    },
                    {
                        title: 'Subscription',
                        shortcut: ['l', 'l'],
                        url: '/dashboard/Subscription',
                        icon: <HomeIcon />,
                        isActive: false,
                        items: []
                    },
                    {
                        title: 'Trackable',
                        shortcut: ['l', 'l'],
                        url: '/dashboard/Trackable',
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

export const AdminNavCollections: NavCollection[] = [
    {
        title: '',
        items: [
            {
                title: 'Home',
                url: '/admin',
                icon: <HomeIcon />,
                isActive: true,
                shortcut: ['d', 'd'],
                items: [] // Empty array as there are no child items for dashboard
            }
        ]
    },
    {
        title: 'Main Menu',
        items: [
            {
                title: 'Clubs',
                url: '/admin/clubs',
                icon: <RaceIcon />,
                shortcut: ['p', 'p'],
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
                        title: 'Demo',
                        url: '/admin/settings/demo',
                        icon: <HomeIcon />,
                        shortcut: ['m', 'm'],
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

export const meCollections: NavCollection[] = [
    {
        title: '',
        items: [
            {
                title: 'Home',
                url: '/me',
                icon: <HomeIcon />,
                isActive: true,
                shortcut: ['d', 'd'],
                items: [] // Empty array as there are no child items for dashboard
            }
        ]
    },
    {
        title: 'Main Menu',
        items: [
            {
                title: 'My Races',
                url: '/dashboard/me/races',
                icon: <RaceIcon />,
                shortcut: ['p', 'p'],
                isActive: false,
                items: [] // No child items
            },
            {
                title: 'My Clubs',
                url: '/dashboard/me/clubs',
                icon: <RaceIcon />,
                shortcut: ['p', 'p'],
                isActive: false,
                items: [] // No child items
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
