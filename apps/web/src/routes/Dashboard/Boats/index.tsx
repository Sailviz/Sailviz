import { PageSkeleton } from '@components/layout/PageSkeleton'
import BoatTable from '@components/tables/BoatTable'
import { userHasPermission, AVAILABLE_PERMISSIONS } from '@components/helpers/users'
import { title } from '@components/layout/home/primitaves'
import { Button } from '@components/ui/button'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import CreateBoatDialog from '@components/layout/dashboard/CreateBoatModal'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import type { Session } from '@sailviz/auth/client'

function Page() {
    const session: Session = useLoaderData({ from: `__root__` })
    // const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    // const { boats, boatsIsError, boatsIsValidating, mutateBoats: mutateBoats } = Fetcher.Boats()

    const { data: club } = useQuery(orpcClient.organization.session.queryOptions())
    const { data: boats } = useQuery(orpcClient.boat.org.session.queryOptions())

    const downloadBoats = async () => {
        if (boats == undefined || club == undefined) return
        var csvRows: string[] = []
        const headers = ['Name', 'Crew', 'PY', 'PursuitStartTime']

        csvRows.push(headers.join(','))

        boats.forEach(boat => {
            var values = [boat.name, boat.crew, boat.py, boat.pursuitStartTime]
            //join values with comma
            csvRows.push(values.join(','))
        })
        //join results with new line
        let data = csvRows.join('\n')

        // Creating a Blob for having a csv file format
        // and passing the data with type
        const blob = new Blob([data], { type: 'text/csv' })

        // Creating an object for downloading url
        const url = window.URL.createObjectURL(blob)

        // Creating an anchor(a) tag of HTML
        const a = document.createElement('a')

        // Passing the blob downloading url
        a.setAttribute('href', url)

        // Setting the anchor tag attribute for downloading
        // and passing the download file name
        a.setAttribute('download', club.name + 'boats.csv')

        // Performing a download with click
        a.click()
    }

    if (session == null) {
        // If the user is not authenticated, redirect to the login page
        return <PageSkeleton />
    }

    return (
        <div className='flex flex-col h-full'>
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>Boats</h1>
            </div>
            <div className='p-6'>
                {userHasPermission(session.user, AVAILABLE_PERMISSIONS.editBoats) ? (
                    <div className='flex flex-row p-6 justify-around'>
                        <Button className='mx-1' color='primary' onClick={downloadBoats}>
                            Download Boat Data
                        </Button>
                        <CreateBoatDialog />
                    </div>
                ) : (
                    <></>
                )}
                <BoatTable />
            </div>
        </div>
    )
}
export const Route = createFileRoute('/dashboard/Boats/')({
    component: Page
})
