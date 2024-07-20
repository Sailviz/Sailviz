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
                <NavbarContent className="hidden sm:flex gap-4" justify="center">
                    <NavbarItem>
                        <Link color="foreground" href="#">
                            Features
                        </Link>
                    </NavbarItem>
                    <NavbarItem isActive>
                        <Link href="#" aria-current="page">
                            Customers
                        </Link>
                    </NavbarItem>
                    <NavbarItem>
                        <Link color="foreground" href="#">
                            Integrations
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
        </div>
    )
}