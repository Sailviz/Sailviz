'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
    useSidebar
} from '@/components/ui/sidebar'
import { BadgeCheck, Bell, ChevronRight, ChevronsUpDown, CreditCard, GalleryVerticalEnd, LogOut, LogOutIcon } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'
import { SailVizIcon } from '../icons/sailviz-icon'
import { ThemeSwitcher } from '../ui/ThemeSwitcher'

export const company = {
    name: 'Acme Inc',
    logo: GalleryVerticalEnd,
    plan: 'Enterprise'
}

export default function AppSidebar({ navCollections }: { navCollections: NavCollection[] }) {
    const { data: session } = useSession()
    const pathname = usePathname()
    const { state, isMobile } = useSidebar()

    return (
        <Sidebar className='border-r-2'>
            <SidebarHeader>
                <div className='flex justify-center'>
                    <div className='text-sidebar-accent-foreground flex gap-2 py-2'>
                        <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                            <SailVizIcon />
                        </div>
                        <div className='grid flex-1 text-left text-xlg leading-tight'>
                            <span className='truncate font-semibold flex items-center h-full'>SailViz</span>
                        </div>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className='overflow-x-hidden'>
                {navCollections.map((collection, index) => {
                    return (
                        <SidebarGroup key={collection.title}>
                            <SidebarGroupLabel>{collection.title}</SidebarGroupLabel>
                            <SidebarMenu>
                                {collection.items.map(item => {
                                    return item?.items && item?.items?.length > 0 ? (
                                        <Collapsible key={item.title} asChild defaultOpen={item.isActive} className='group/collapsible'>
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton tooltip={item.title} isActive={pathname === item.url} size='lg'>
                                                        {item.icon}
                                                        <span className='text-xl'>{item.title}</span>
                                                        <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {/*@ts-ignore*/}
                                                        {item.items?.map(subItem => (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                                                    <Link href={subItem.url}>
                                                                        <span className='text-xl'>{subItem.title}</span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    ) : (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url} size='lg'>
                                                <Link href={item.url}>
                                                    {item.icon}
                                                    <span className='text-xl'>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroup>
                    )
                })}
            </SidebarContent>
            <SidebarFooter>
                <div className='text-center'>
                    <ThemeSwitcher />
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
