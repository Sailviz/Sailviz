'use client'
// Update the import path below to the correct relative path if necessary
import EditResultModal from '@/components/layout/dashboard/EditResultModal'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import { use } from 'react'
import * as Fetcher from '@/components/Fetchers'
type PageProps = { params: Promise<{ resultId: string }> }

export default function Page(props: PageProps) {
    const Router = useRouter()
    const { resultId } = use(props.params)

    const { result, resultIsError, resultIsValidating } = Fetcher.Result(resultId)

    const updateResult = async (result: ResultDataType): Promise<void> => {
        await DB.updateResult(result)
        Router.back()
    }

    if (result == undefined) {
        return <div>Loading...</div>
    }

    console.log('result', result)

    return (
        <EditResultModal
            onSubmit={(result: ResultDataType) => {
                updateResult(result)
            }}
            result={result}
            raceType={''}
            advancedEdit={true}
            onDelete={function (result: ResultDataType): void {
                throw new Error('Function not implemented.')
            }}
        />
    )
}
