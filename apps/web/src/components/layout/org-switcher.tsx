import * as React from 'react'
import { ChevronsUpDown, Plus } from 'lucide-react'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger
} from '@components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@components/ui/sidebar'
import { client } from '@sailviz/auth/client'
import * as Types from '@sailviz/types'
import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'

export function OrgSwitcher() {
    const { isMobile } = useSidebar()
    const router = useRouter()
    const [active, setActive] = React.useState<Types.Org | null>(null)
    const [orgList, setOrgList] = React.useState<Types.Org[]>([])

    const orgs = client.useListOrganizations()

    useEffect(() => {
        const organizations: Types.Org[] = []
        orgs.data?.forEach(org => {
            organizations.push({
                name: org.name,
                logo: org.logo || '',
                id: org.id,
                slug: org.slug,
                stripeCustomerId: '',
                metadata: {}
            })
        })
        setOrgList(organizations)
    }, [orgs])

    useEffect(() => {
        async function fetchActiveOrg() {
            try {
                const org = await client.organization.getFullOrganization()
                if (!org.data) {
                    setActive(null)
                    return
                }
                setActive({
                    name: org.data.name,
                    logo: org.data.logo || '',
                    id: org.data.id,
                    slug: org.data.slug,
                    metadata: {},
                    stripeCustomerId: ''
                })
            } catch (error) {
                console.error('Error fetching active organization:', error)
            }
        }
        fetchActiveOrg()
    }, [])

    function setActiveOrganization(org: Types.Org) {
        setActive(org)
        client.organization
            .setActive({
                organizationId: org.id,
                organizationSlug: org.slug
            })
            .then(async () => {
                // Now re-run route loaders so pages depending on loaders refresh.
                try {
                    await router.invalidate()
                } catch {}
                if (org.id == 'admin-id') {
                    router.navigate({ to: '/admin' })
                } else {
                    router.navigate({ to: '/dashboard' })
                }
            })
    }

    function setPersonal() {
        // Immediately update local state so UI shows personal area
        setActive(null)
        client.organization
            .setActive({
                organizationId: null,
                organizationSlug: ''
            })
            .then(() => {
                // Navigate to personal area. server RPCs use authenticated user context.
                router.navigate({ to: '/dashboard/me' })
            })
    }

    // Render even when active is null; show personal as the selected state
    const isPersonal = active === null
    const displayName = isPersonal ? 'My Races' : (active?.name ?? '')
    const displayLogo = isPersonal ? '' : (active?.logo ?? '')

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size='lg' className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
                            <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                                {displayLogo ? <img src={displayLogo} className='size-4' /> : <div className='size-4' />}
                            </div>
                            <div className='grid flex-1 text-left text-sm leading-tight'>
                                <span className='truncate font-semibold'>{displayName}</span>
                            </div>
                            <ChevronsUpDown className='ml-auto' />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                        align='start'
                        side={isMobile ? 'bottom' : 'right'}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className='text-muted-foreground text-xs'>Organisations</DropdownMenuLabel>
                        {/* Personal / Me option */}
                        <DropdownMenuItem key={'personal'} onClick={() => setPersonal()} className={`gap-2 p-2 ${isPersonal ? 'font-semibold' : ''}`}>
                            <div className='flex size-6 items-center justify-center rounded-sm border'>
                                <div className='size-4' />
                            </div>
                            My Races
                            <DropdownMenuShortcut>⌘0</DropdownMenuShortcut>
                        </DropdownMenuItem>

                        {orgList.map((org, index) => (
                            <DropdownMenuItem
                                key={org.name}
                                onClick={() => setActiveOrganization(org)}
                                className={`gap-2 p-2 ${active && active.id === org.id ? 'font-semibold' : ''}`}
                            >
                                <div className='flex size-6 items-center justify-center rounded-sm border'>
                                    <img src={org.logo || ''} className='size-4 shrink-0' />
                                </div>
                                {org.name}
                                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className='gap-2 p-2'>
                            <div className='bg-background flex size-6 items-center justify-center rounded-md border'>
                                <Plus className='size-4' />
                            </div>
                            <div className='text-muted-foreground font-medium'>Add team</div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
