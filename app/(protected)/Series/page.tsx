'use client'
import ClubTable from 'components/tables/ClubTable'
import * as DB from 'components/apiMethods'
import * as Fetcher from 'components/Fetchers'
import { PageSkeleton } from 'components/ui/PageSkeleton'
import { useRouter } from 'next/navigation'
import { mutate } from 'swr'
import CreateSeriesModal from 'components/ui/dashboard/CreateSeriesModal'
import { useDisclosure } from '@nextui-org/react'
import { AVAILABLE_PERMISSIONS, userHasPermission } from 'components/helpers/users'
import { title } from '../../../components/ui/home/primitaves'
import EditSeriesModal from 'components/ui/dashboard/EditSeriesModal'
import { useState } from 'react'

export default function Page() {
    const Router = useRouter()
    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { series, seriesIsError, seriesIsValidating } = Fetcher.GetSeriesByClubId(club)

    const [activeSeries, setActiveSeries] = useState<SeriesDataType | null>(null)

    const createModal = useDisclosure()
    const editModal = useDisclosure()

    const viewSeries = (seriesId: string) => {
        Router.push('/Series/' + seriesId)
    }

    const editSeries = async (series: SeriesDataType) => {
        await DB.updateSeries(series)
        mutate('/api/GetSeriesByClubId')
        editModal.onClose()
    }

    const createSeries = async (name: string) => {
        await DB.createSeries(club.id, name)
        mutate('/api/GetSeriesByClubId')
        createModal.onClose()
    }

    const deleteSeries = async (seriesId: string) => {
        await DB.deleteSeriesById(seriesId)
        mutate('/api/GetSeriesByClubId')
    }

    if (seriesIsValidating || seriesIsError || series == undefined) {
        return <PageSkeleton />
    }
    return (
        <div>
            <CreateSeriesModal isOpen={createModal.isOpen} onSubmit={createSeries} onClose={createModal.onClose} />
            <EditSeriesModal series={series[0]!} isOpen={editModal.isOpen} onSubmit={editSeries} onClose={editModal.onClose} />
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>Series</h1>
            </div>
            <div className='p-6'>
                <ClubTable
                    data={series}
                    deleteSeries={deleteSeries}
                    editSeries={(series: SeriesDataType) => {
                        setActiveSeries(series)
                        editModal.onOpen()
                    }}
                    viewSeries={(seriesId: string) => viewSeries(seriesId)}
                />
            </div>
            {userHasPermission(user, AVAILABLE_PERMISSIONS.editSeries) ? (
                <div className='p-6'>
                    <p
                        id='seriesAddRace'
                        onClick={createModal.onOpen}
                        className='cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0'
                    >
                        Create New Series
                    </p>
                </div>
            ) : (
                <></>
            )}
        </div>
    )
}
