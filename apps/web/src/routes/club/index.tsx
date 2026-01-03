import ClubCard from '@components/layout/home/clubCard'
import HomeNav from '@components/layout/home/navbar'
import { orpcClient } from '@lib/orpc'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import * as Types from '@sailviz/types'

const Page = async () => {
    const orgs = useQuery(orpcClient.organization.all.queryOptions()).data as Types.Org[]

    return (
        <>
            <HomeNav />
            <div className='flex flex-row flex-wrap px-6'>
                {orgs
                    ?.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
                    .map((club: Types.Org) => (
                        <div key={club.id} className='p-3 w-96 '>
                            <ClubCard name={club.name} link={'/club/' + club.name}></ClubCard>
                        </div>
                    ))}
            </div>
        </>
    )
}

export const Route = createFileRoute('/club/')({
    component: Page
})
