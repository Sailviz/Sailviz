"use client";

import React from "react";
import { useLockedBody } from "components/hooks/useBodyLock";
import { SidebarWrapper } from "components/ui/SignOn/sidebar";
import { SidebarContext } from "components/ui/sidebar/layout-context";

interface Props {
    children: React.ReactNode;
}

export const Layout = ({ children }: Props) => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [_, setLocked] = useLockedBody(false);
    const handleToggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        setLocked(!sidebarOpen);
    };

    return (
        <SidebarContext.Provider
            value={{
                collapsed: sidebarOpen,
                setCollapsed: handleToggleSidebar,
            }}>
            <section className='flex'>
                <SidebarWrapper />
                <div>
                    {children}
                </div>
            </section>
        </SidebarContext.Provider>
    );
};