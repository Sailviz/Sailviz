import { AVAILABLE_PERMISSIONS, userHasPermission } from '@/components/helpers/users'
import { signOut, useSession } from 'next-auth/react'
import React from 'react'
import { SidebarMenu } from '../sidebar/sidebar-menu'
import { SidebarItem } from '../sidebar/sidebar-item'
import { SignOutIcon } from '@/components/icons/sign-out'

const ReturnButton = ({ children = 'Return', ...props }) => {
    const session = useSession()
    if (userHasPermission(session.data!.user!, AVAILABLE_PERMISSIONS.dashboardAccess)) {
        return (
            <SidebarMenu title='Dashboard'>
                <SidebarItem title='Back to Dashboard' icon={<SignOutIcon />} href='/Dashboard' />
            </SidebarMenu>
        )
    } else {
        return (
            <SidebarMenu
                title='Log Out'
                aria-label='log out'
                onClick={() => {
                    signOut()
                }}
            >
                <SidebarItem title='Log Out' icon={<SignOutIcon />} href='/' />
            </SidebarMenu>
        )
    }
}
export default ReturnButton
