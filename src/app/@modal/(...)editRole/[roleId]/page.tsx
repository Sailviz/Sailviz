'use client'
// Update the import path below to the correct relative path if necessary
import EditResultModal from '@/components/layout/dashboard/EditResultModal'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import { use } from 'react'
import * as Fetcher from '@/components/Fetchers'
import CreateResultModal from '@/components/layout/dashboard/CreateResultModal'
import CreateBoatDialog from '@/components/layout/dashboard/CreateBoatModal'
import { useSession } from 'next-auth/react'
import EditBoatDialog from '@/components/layout/dashboard/EditBoatModal'
import EditRoleModal from '@/components/layout/dashboard/EditRoleModal'
type PageProps = { params: Promise<{ roleId: string }> }

export default function Page(props: PageProps) {
    const Router = useRouter()
    const { roleId } = use(props.params)

    const { role, roleIsError, roleIsValidating } = Fetcher.Role(roleId)

    const updateRole = async (role: RoleDataType) => {
        await DB.updateRole(role)
        Router.back()
    }

    if (role == undefined) {
        return <div>Loading...</div>
    }

    return <EditRoleModal role={role} onSubmit={updateRole} />
}
