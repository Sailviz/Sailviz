import FleetHandicapResultsTable from '@components/tables/FleetHandicapResultsTable'
import FleetPursuitResultsTable from '@components/tables/FleetPursuitResultsTable'
import { useMutation, useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'
import { Heading } from '@components/ui/heading'
import PageContainer from '@components/layout/page-container'
import { Separator } from '@components/ui/separator'
import CourseView from '@components/layout/CourseView'
import { useEffect, useState } from 'react'

const RaceViewPage = ({ raceId, orgName }: { raceId: string; orgName: string | undefined }) => {
    const [orgNameDisplay, setOrgNameDisplay] = useState<string>(orgName || '')
    const race = useQuery(orpcClient.race.find.queryOptions({ input: { raceId: raceId! } })).data

    const getOrgMutation = useMutation(orpcClient.organization.find.mutationOptions())

    useEffect(() => {
        const fetchOrgName = async () => {
            if (orgName == undefined) {
                setOrgNameDisplay(
                    await getOrgMutation
                        .mutateAsync({
                            orgId: race?.series!.orgId!
                        })
                        .then(org => {
                            return org.name
                        })
                )
            }
        }
        fetchOrgName()
    }, [])

    // list of current series
    //list of

    return (
        <PageContainer scrollable={false}>
            <div className='flex flex-1 flex-col space-y-4'>
                <div className='flex items-start justify-between'>
                    <Heading title={race?.series?.name + ': ' + race?.number || ''} description={orgNameDisplay} />
                </div>
                <Separator />
                <CourseView raceId={raceId} />

                {race?.fleets!.map((fleet, index) => {
                    return (
                        <div key={'fleetResults' + index}>
                            {race.Type == 'Handicap' ? (
                                <FleetHandicapResultsTable showTime={true} editable={false} fleetId={fleet.id} advancedEdit={false} />
                            ) : (
                                <FleetPursuitResultsTable editable={false} advancedEdit={false} fleetId={fleet.id} />
                            )}
                        </div>
                    )
                })}
            </div>
        </PageContainer>
    )
}

export default RaceViewPage
