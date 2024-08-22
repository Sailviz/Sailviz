import { Metadata } from 'next'
import 'styles/globals.css'

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@nextui-org/react";
import { SailVizIcon } from "components/icons/sailviz-icon";

export const metadata: Metadata = {
    title: 'SailViz',
    description: 'Sailing race system for clubs and regattas',
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Navbar>
                <NavbarBrand>
                    <SailVizIcon />
                    <p className="font-bold text-inherit">SailViz</p>
                </NavbarBrand>
                <NavbarContent className="hidden sm:flex gap-8" justify="center">
                    <NavbarItem>
                        <Link href="#">
                            Features
                        </Link>
                    </NavbarItem>
                    <NavbarItem>
                        <Link href="#">
                            Clubs
                        </Link>
                    </NavbarItem>
                    <NavbarItem>
                        <Link href="#">
                            Pricing
                        </Link>
                    </NavbarItem>
                    <NavbarItem>
                        <Link href="#">
                            Events
                        </Link>
                    </NavbarItem>
                </NavbarContent>
                <NavbarContent justify="end">
                    <NavbarItem className="hidden lg:flex">
                        <Link href="/Login">Login</Link>
                    </NavbarItem>
                    <NavbarItem>
                        <Button as={Link} color="primary" href="#" variant="flat">
                            Sign Up
                        </Button>
                    </NavbarItem>
                </NavbarContent>
            </Navbar>
            {children}
            <footer className="w-full flex flex-col items-center justify-center py-3">
                <div className="flex items-center gap-2">
                    <p>&copy; 2024 SailViz. All rights reserved.</p>
                    <p>Contact us: <a href="mailto:admin@sailviz.com">admin@sailviz.com</a></p>
                </div>
                <div className='flex flex-row'>
                    <span className="text-default-600">Powered by&ensp;</span>
                    <Link
                        isExternal
                        className="flex items-center gap-1 text-current"
                        href="https://nextui.org/"
                        title="nextui.org homepage"
                    >
                        <p className="text-primary">NextUI</p>
                    </Link>
                    <span className="text-default-600">&ensp;and&ensp;</span>
                    <Link
                        isExternal
                        className="flex items-center gap-1 text-current"
                        href="https://nextjs.org/"
                        title="nextjs.org homepage"
                    >
                        <p className="text-primary">NextJS</p>
                    </Link>
                </div>
            </footer>
        </div>
    )
}