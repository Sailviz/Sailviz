import { Link } from '@tanstack/react-router'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem } from '../ui/navigation-menu'
import { Button } from '../ui/button'

export default function HomePageLayout({
    children // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <section>
            <NavigationMenu>
                {/* <NavbarBrand>
                    <p className='font-bold text-inherit'>SailViz</p>
                </NavbarBrand> */}
                <NavigationMenuContent className='hidden sm:flex gap-4'>
                    <NavigationMenuItem>
                        <Link color='foreground' href='#' to={undefined}>
                            Features
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link to='#' aria-current='page'>
                            Customers
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link color='foreground' href='#' to={undefined}>
                            Integrations
                        </Link>
                    </NavigationMenuItem>
                </NavigationMenuContent>
                <NavigationMenuContent>
                    <NavigationMenuItem className='hidden lg:flex'>
                        <Link to='#'>Login</Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Button color='primary'>Sign Up</Button>
                    </NavigationMenuItem>
                </NavigationMenuContent>
            </NavigationMenu>

            {children}
        </section>
    )
}
