'use client'
// Update the import path below to the correct relative path if necessary
import { use } from 'react'
import * as Fetcher from '@/components/Fetchers'
import ViewResultModal from '@/components/layout/dashboard/viewResultModal'
type PageProps = { params: Promise<{ resultId: string }> }

export default function Page(props: PageProps) {
    const { resultId } = use(props.params)

    const { result, resultIsError, resultIsValidating } = Fetcher.Result(resultId)
    const { fleet, fleetIsError, fleetIsValidating } = Fetcher.Fleet(result?.fleetId)

    if (result == undefined || fleet == undefined) {
        return <div>Loading...</div>
    }

    return <ViewResultModal result={result} fleet={fleet} />
}
