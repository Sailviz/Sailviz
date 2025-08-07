'use client'
import { SailVizIcon } from '@/components/icons/sailviz-icon'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '../../ui/navigation-menu'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomeNav() {
    return (
        <header className='w-full z-40 sticky top-0 left-0 bg-background'>
            <div className='container relative mx-auto min-h-20 flex gap-4 flex-row  lg:grid lg:grid-cols-3 items-center'>
                <Link href={'/'} className='justify-start items-center gap-4 lg:flex hidden flex-row'>
                    <SailVizIcon />
                    <p className='font-bold text-inherit'>SailViz</p>
                </Link>
                <div className='justify-center items-center gap-4 lg:flex hidden flex-row'>
                    <NavigationMenu className='flex justify-start items-start'>
                        <NavigationMenuList className='flex justify-start gap-4 flex-row'>
                            <NavigationMenuItem>
                                <NavigationMenuLink href='/'>Home</NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink href='/Clubs'>Clubs</NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink href='/Pricing'>Pricing</NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink href='/Events'>Events</NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                <div className='flex justify-end w-full gap-4'>
                    <div className='border-r hidden md:inline'></div>
                    <Link href={'/Login'}>
                        <Button variant='outline'>Sign in</Button>
                    </Link>
                    <Link href={'/Register'}>
                        <Button>Get started</Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}
