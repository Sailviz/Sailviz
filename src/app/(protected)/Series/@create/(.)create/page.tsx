'use client'
// Update the import path below to the correct relative path if necessary
import CreateSeriesModal from '../../../../../components/ui/dashboard/CreateSeriesModal'
import { useRouter } from 'next/navigation'
export default function Page() {
    const Router = useRouter()
    return (
        <CreateSeriesModal
            isOpen={true}
            onSubmit={function (name: string): void {
                throw new Error('Function not implemented.')
            }}
            onClose={() => {
                Router.back()
            }}
        />
    )
}
