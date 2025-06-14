'use client'
// Update the import path below to the correct relative path if necessary
import EditResultModal from '@/components/layout/SignOn/EditResultModal'
import { useRouter } from 'next/navigation'
import * as DB from '@/components/apiMethods'
import { use } from 'react'
import * as Fetcher from '@/components/Fetchers'
import { mutate } from 'swr'
type PageProps = { params: Promise<{ raceId: string; resultId: string }> }

export default function Page(props: PageProps) {
    const Router = useRouter()
    const { raceId, resultId } = use(props.params)

    const { result, resultIsError, resultIsValidating } = Fetcher.Result(resultId)
    const { race, raceIsError, raceIsValidating } = Fetcher.Race(raceId, false)
    const { boats, boatsIsError, boatsIsValidating } = Fetcher.Boats()

    const updateResult = async (result: ResultDataType): Promise<void> => {
        await DB.updateResult(result)
        mutate(`/api/GetRaceById?id=${race.id}&results=true`)
        Router.back()
    }

    const onDeleteResult = async (result: ResultDataType): Promise<void> => {
        await DB.DeleteResultById(result)
        Router.back()
    }

    if (result == undefined || race == undefined || boats == undefined) {
        return <div>Loading...</div>
    }

    console.log('result', result)

    return (
        <EditResultModal
            onSubmit={(result: ResultDataType) => {
                updateResult(result)
            }}
            onDelete={onDeleteResult}
            result={result}
            race={race}
            boats={boats}
        />
    )
}
