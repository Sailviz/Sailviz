'use client'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import * as Fetcher from '@/components/Fetchers'
import EditRoleModal from '@/components/layout/dashboard/EditRoleModal'
type PageProps = { params: Promise<{ roleId: string }> }

export default function Page(props: PageProps) {
    const Router = useRouter()
    const { roleId } = use(props.params)

    const { role, roleIsError, roleIsValidating } = Fetcher.Role(roleId)

    if (role == undefined) {
        return <div>Loading...</div>
    }

    return <EditRoleModal role={role} />
}
