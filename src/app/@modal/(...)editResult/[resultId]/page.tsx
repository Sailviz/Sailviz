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
    // const result = DB.GetResultById(resultId) // Replace with actual result ID retrieval logic
    const { result, resultIsError, resultIsValidating } = Fetcher.Result(resultId)

    const updateResult = async (result: ResultsDataType): Promise<void> => {
        await DB.updateResult(result)
        Router.back()
    }

    return (
        <EditResultModal
            onSubmit={(result: ResultsDataType) => {
                updateResult(result)
            }}
            result={result}
            raceType={''}
            advancedEdit={true}
            onDelete={function (result: ResultsDataType): void {
                throw new Error('Function not implemented.')
            }}
        />
    )
}
