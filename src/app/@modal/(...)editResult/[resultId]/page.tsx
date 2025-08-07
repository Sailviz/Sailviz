'use client'
// Update the import path below to the correct relative path if necessary
import EditResultModal from '@/components/layout/dashboard/EditResultModal'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import { use } from 'react'
import * as Fetcher from '@/components/Fetchers'
import { mutate } from 'swr'
type PageProps = { params: Promise<{ resultId: string }> }

export default function Page(props: PageProps) {
    const Router = useRouter()
    const { resultId } = use(props.params)

    const { result, resultIsError, resultIsValidating } = Fetcher.Result(resultId)
    const updateResult = async (result: ResultDataType): Promise<void> => {
        await DB.updateResult(result)
        const fleet = await DB.getFleetById(result.fleetId)
        mutate(`/api/GetFleetById?id=${fleet.id}`)
        Router.back()
    }

    const onDeleteResult = async (result: ResultDataType): Promise<void> => {
        await DB.DeleteResultById(result)
        const fleet = await DB.getFleetById(result.fleetId)
        mutate(`/api/GetFleetById?id=${fleet.id}`)

        Router.back()
    }

    if (result == undefined) {
        return <div>Loading...</div>
    }

    return (
        <EditResultModal
            onSubmit={(result: ResultDataType) => {
                updateResult(result)
            }}
            result={result}
            advancedEdit={true}
            onDelete={onDeleteResult}
        />
    )
}
